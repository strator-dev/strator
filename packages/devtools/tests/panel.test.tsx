// @vitest-environment happy-dom
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { Model, setDevtoolsHook } from "@strator/core";
import { StratorProvider, useGlobalModel, useLocalModel } from "@strator/react";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test";
import { DevtoolsStore } from "../src/store.ts";
import { StratorDevtools as WrappedDevtools } from "../src/react.ts";
import { StratorDevtools, StratorDevtoolsPanel } from "../src/StratorDevtools.tsx";

interface CounterState {
  count: number;
}

class CounterModel extends Model<CounterState> {
  static initialState: CounterState = { count: 0 };

  public increase(by = 1) {
    this.state.count += by;
  }
}

class SessionModel extends Model<{ theme: string }> {
  static initialState = { theme: "dark" };
}

let increase: (() => void) | undefined;

function Counter() {
  const [counter, count] = useLocalModel(CounterModel, s => s.count);
  increase = () => counter.increase(2);
  return <span>{count}</span>;
}

function Header() {
  const [, theme] = useGlobalModel(SessionModel, s => s.theme);
  return <span>{theme}</span>;
}

let container: HTMLDivElement;
let root: Root;
let store: DevtoolsStore;

function shadow(): ShadowRoot {
  const host = document.querySelector("[data-strator-devtools]") as HTMLElement;
  return host.shadowRoot!;
}

function $$(selector: string): HTMLElement[] {
  return [...shadow().querySelectorAll<HTMLElement>(selector)];
}

function button(label: string | RegExp): HTMLButtonElement {
  const found = $$("button").find(b =>
    typeof label === "string"
      ? b.textContent?.trim() === label || b.getAttribute("aria-label") === label
      : label.test(b.textContent ?? ""),
  );
  if (!found) throw new Error(`No button ${String(label)}`);
  return found as HTMLButtonElement;
}

async function flush() {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

beforeEach(() => {
  store = new DevtoolsStore();
  setDevtoolsHook(store);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  return () => {
    act(() => root.unmount());
    container.remove();
  };
});

afterEach(() => {
  setDevtoolsHook(undefined);
  vi.unstubAllGlobals();
  try {
    localStorage.clear();
  } catch {}
});

function setWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
}

async function renderApp(devtools: React.ReactNode) {
  await act(async () => {
    root.render(
      <>
        <StratorProvider>
          <Header />
          <Counter />
        </StratorProvider>
        {devtools}
      </>,
    );
  });
  await flush();
}

describe("devtools panel", () => {
  test("lists instances by scope with subscribers and logs method calls", async () => {
    setWidth(1440);
    await renderApp(<StratorDevtoolsPanel store={store} height={800} />);

    const text = shadow().textContent ?? "";
    expect(text).toContain("SessionModel");
    expect(text).toContain("CounterModel");
    expect(text).toContain("useGlobalModel");
    expect(text).toContain("useLocalModel");
    expect(text).toContain("1 StratorProvider");

    await act(async () => increase!());
    await flush();

    const rows = $$(".sdt-tr:not(.sdt-th)");
    expect(rows).toHaveLength(1);
    expect(rows[0]!.textContent).toContain("increase(2)");
    expect(rows[0]!.textContent).toContain("done");

    await act(async () => rows[0]!.click());
    const inspector = shadow().querySelector("aside")!.textContent!;
    expect(inspector).toContain("counter.increase(2)");
    expect(inspector).toContain("count");
    expect(inspector).toContain('test("CounterModel.increase"');

    await act(async () => button("Jump to state before").click());
    await flush();
    expect(container.textContent).toContain("0");
    expect($$(".sdt-tr:not(.sdt-th)")).toHaveLength(2);

    await act(async () => button(/^Subscribers/).click());
    expect(shadow().querySelector("aside")!.textContent).toContain("<Counter>");
  });

  test("collapses Instances and Inspector into rails on small screens", async () => {
    setWidth(800);
    await renderApp(<StratorDevtoolsPanel store={store} height={600} />);

    expect(shadow().querySelector(".sdt-root")!.getAttribute("data-layout")).toBe("compact");
    expect(shadow().querySelector("nav")).toBeNull();
    expect(shadow().querySelector("aside")).toBeNull();

    await act(async () => button("Show instances").click());
    expect(shadow().querySelector("nav.sdt-drawer")).not.toBeNull();
    expect(shadow().querySelector("aside")).toBeNull();

    await act(async () => button("Show inspector").click());
    expect(shadow().querySelector("nav")).toBeNull();
    expect(shadow().querySelector("aside.sdt-drawer")).not.toBeNull();

    await act(async () => button("Close pane").click());
    expect(shadow().querySelector("aside")).toBeNull();
  });

  test("side panes fold into rails on wide screens too", async () => {
    setWidth(1440);
    await renderApp(<StratorDevtoolsPanel store={store} height={600} />);
    expect(shadow().querySelector("nav")).not.toBeNull();

    await act(async () => button("Hide instances pane").click());
    expect(shadow().querySelector("nav")).toBeNull();
    await act(async () => button("Show instances").click());
    expect(shadow().querySelector("nav")).not.toBeNull();
  });

  test("side panes are resizable by dragging and with the keyboard, and remember their width", async () => {
    // Node's own (disabled) localStorage global shadows happy-dom's here, so use an in-memory one.
    const saved = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => void saved.set(key, value),
      clear: () => saved.clear(),
    });
    setWidth(1440);
    await renderApp(<StratorDevtoolsPanel store={store} height={600} />);
    const separator = (label: string) =>
      shadow().querySelector<HTMLElement>(`[role="separator"][aria-label="${label}"]`)!;
    const pointer = (target: HTMLElement, type: string, clientX: number) =>
      act(async () => {
        target.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0, pointerId: 1, clientX }));
      });
    const nav = () => shadow().querySelector<HTMLElement>("nav")!;
    const aside = () => shadow().querySelector<HTMLElement>("aside")!;

    expect(nav().style.flexBasis).toBe("260px");
    expect(aside().style.flexBasis).toBe("400px");

    // Dragging the instances handle to the right widens the pane.
    const instancesHandle = separator("Resize instances pane");
    await pointer(instancesHandle, "pointerdown", 300);
    await pointer(instancesHandle, "pointermove", 400);
    expect(nav().style.flexBasis).toBe("360px");
    await pointer(instancesHandle, "pointerup", 400);
    expect(instancesHandle.getAttribute("aria-valuenow")).toBe("360");
    expect(localStorage.getItem("strator-devtools:instancesWidth")).toBe("360");

    // The inspector grows to the left, and stops where the log would get narrower than its minimum.
    const inspectorHandle = separator("Resize inspector pane");
    await pointer(inspectorHandle, "pointerdown", 1000);
    await pointer(inspectorHandle, "pointermove", 0);
    await pointer(inspectorHandle, "pointerup", 0);
    expect(aside().style.flexBasis).toBe(`${1440 - 360 - 360}px`);

    // Keyboard: arrows step, Home / End jump to the bounds; double-click resets.
    await act(async () => {
      inspectorHandle.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    });
    expect(aside().style.flexBasis).toBe("300px");
    await act(async () => {
      inspectorHandle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    });
    expect(aside().style.flexBasis).toBe("316px");
    await act(async () => {
      inspectorHandle.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    });
    expect(aside().style.flexBasis).toBe("400px");

    // A new panel picks the remembered widths up.
    await act(async () => root.render(<></>));
    await renderApp(<StratorDevtoolsPanel store={store} height={600} />);
    expect(nav().style.flexBasis).toBe("360px");
    expect(aside().style.flexBasis).toBe("400px");
  });

  test("the floating launcher opens and closes the docked panel", async () => {
    setWidth(1440);
    await renderApp(<StratorDevtools store={store} />);
    await act(async () => button("Open Strator devtools").click());
    expect(shadow().querySelector(".sdt-dock")).not.toBeNull();
    await act(async () => button("Close devtools").click());
    expect(shadow().querySelector(".sdt-dock")).toBeNull();
  });

  test("the React wrapper mounts the bundled panel and removes it on unmount", async () => {
    setWidth(1440);
    await renderApp(<WrappedDevtools store={store} initialIsOpen />);
    await flush();
    expect(shadow().querySelector(".sdt-dock")).not.toBeNull();
    await act(async () => root.render(<></>));
    await flush();
    expect(document.querySelector("[data-strator-devtools]")).toBeNull();
  });
});
