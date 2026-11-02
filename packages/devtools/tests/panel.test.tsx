// @vitest-environment happy-dom
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { Model, setDevtoolsHook } from "@strator/core";
import { StratorProvider, useGlobalModel, useLocalModel } from "@strator/react";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test";
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
