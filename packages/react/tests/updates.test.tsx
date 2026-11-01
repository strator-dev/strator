// @vitest-environment happy-dom
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { Model } from "@strator/core";
import React, { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, describe, expect, test } from "vite-plus/test";
import {
  StratorProvider,
  type StratorContext,
  useGlobalModel,
  useLocalModel,
  useSharedModel,
  useStratorContext,
} from "../src/index.ts";

interface TodoState {
  count: number;
  label: string;
  items: { title: string; done: boolean }[];
}

class TodoModel extends Model<TodoState> {
  static initialState: TodoState = { count: 0, label: "todos", items: [{ title: "a", done: false }] };

  public increment() {
    this.state.count += 1;
  }

  public toggleFirst() {
    this.state.items[0]!.done = !this.state.items[0]!.done;
  }

  public rename(label: string) {
    this.state.label = label;
  }
}

describe("React state updates", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    return () => {
      act(() => root.unmount());
      container.remove();
    };
  });

  test("useLocalModel re-renders on change inside StrictMode", () => {
    let model!: TodoModel;
    function Counter() {
      const [m, count] = useLocalModel(TodoModel, s => s.count);
      model = m;
      return <span>{count}</span>;
    }
    act(() =>
      root.render(
        <StrictMode>
          <StratorProvider>
            <Counter />
          </StratorProvider>
        </StrictMode>,
      ),
    );
    act(() => model.increment());
    act(() => model.increment());
    expect(container.textContent).toBe("2");
  });

  test("useSharedModel and useGlobalModel re-render inside StrictMode and dispose on real unmount", () => {
    let ctx!: StratorContext;
    let shared!: TodoModel;
    let global!: TodoModel;
    function Spy() {
      ctx = useStratorContext();
      return null;
    }
    function A() {
      const [m, count] = useSharedModel("shared", TodoModel, s => s.count);
      shared = m;
      return <span>{count}</span>;
    }
    function B() {
      const [m, count] = useGlobalModel(TodoModel, s => s.count);
      global = m;
      return <span>{count}</span>;
    }
    function App({ show }: { show: boolean }) {
      return (
        <StrictMode>
          <StratorProvider>
            <Spy />
            {show && <A />}
            {show && <B />}
          </StratorProvider>
        </StrictMode>
      );
    }
    act(() => root.render(<App show />));
    act(() => shared.increment());
    act(() => global.increment());
    act(() => global.increment());
    expect(container.textContent).toBe("12");
    expect(ctx.refCounts.current.get("shared")).toBe(1);

    act(() => root.render(<App show={false} />));
    expect(ctx.models.current.size).toBe(0);
    expect(ctx.refCounts.current.size).toBe(0);
  });

  test("re-renders when a nested value changes in place", () => {
    let model!: TodoModel;
    function Items() {
      const [m, items] = useSharedModel("todos", TodoModel, s => s.items);
      model = m;
      return <span>{items.map(i => `${i.title}:${i.done}`).join(",")}</span>;
    }
    act(() =>
      root.render(
        <StratorProvider>
          <Items />
        </StratorProvider>,
      ),
    );
    act(() => model.toggleFirst());
    expect(container.textContent).toBe("a:true");
  });

  test("keeps the selected reference stable when an unrelated part of the state changes", () => {
    let model!: TodoModel;
    const seen: unknown[] = [];
    function Items() {
      const [m, items] = useSharedModel("todos", TodoModel, s => s.items);
      model = m;
      seen.push(items);
      return null;
    }
    function Label() {
      useSharedModel("todos", TodoModel, s => s.label);
      return null;
    }
    act(() =>
      root.render(
        <StratorProvider>
          <Items />
          <Label />
        </StratorProvider>,
      ),
    );
    const renders = seen.length;
    act(() => model.rename("other"));
    expect(seen.length).toBe(renders);
    act(() => model.toggleFirst());
    expect(seen.length).toBe(renders + 1);
    expect(seen.at(-1)).not.toBe(seen.at(-2));
  });

  test("useSharedModel follows a changing key", () => {
    let ctx!: StratorContext;
    function Spy() {
      ctx = useStratorContext();
      return null;
    }
    function View({ id }: { id: string }) {
      const [, count] = useSharedModel(id, TodoModel, s => s.count);
      return <span>{count}</span>;
    }
    act(() =>
      root.render(
        <StratorProvider initialState={{ first: { count: 1 }, second: { count: 2 } }}>
          <Spy />
          <View id="first" />
        </StratorProvider>,
      ),
    );
    expect(container.textContent).toBe("1");
    act(() =>
      root.render(
        <StratorProvider initialState={{ first: { count: 1 }, second: { count: 2 } }}>
          <Spy />
          <View id="second" />
        </StratorProvider>,
      ),
    );
    expect(container.textContent).toBe("2");
    act(() => (ctx.models.current.get("second") as TodoModel).increment());
    expect(container.textContent).toBe("3");
    expect(ctx.models.current.has("first")).toBe(false);
  });
});
