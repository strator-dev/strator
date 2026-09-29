// @vitest-environment happy-dom
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { Model } from "@strator/core";
import React, { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, test, vi } from "vite-plus/test";
import {
  StratorProvider,
  useGlobalModel,
  useLocalModel,
  useModel,
  useSharedModel,
  useStratorContext,
} from "../src/index.ts";

interface CounterState {
  count: number;
  name?: string;
}

class CounterModel extends Model<CounterState> {
  static initialState: CounterState = {
    count: 0,
    name: "default",
  };

  public increase() {
    this.state.count += 1;
  }

  public setName(name: string) {
    this.state.name = name;
  }
}

interface TodosState {
  items: string[];
}

class TodosModel extends Model<TodosState> {
  static initialState: TodosState = {
    items: [],
  };

  public addTodo(item: string) {
    this.state.items.push(item);
  }
}

describe("React SSR and Hydration with @strator/core models", () => {
  describe("Server-Side Rendering (SSR)", () => {
    test("renders component to string with default model state during SSR", () => {
      function App() {
        const [, count] = useGlobalModel(CounterModel, state => state.count);
        return <div data-testid="counter">Count: {count}</div>;
      }

      const html = renderToString(
        <StratorProvider>
          <App />
        </StratorProvider>,
      );

      expect(html).toContain("Count: <!-- -->0");
    });

    test("renders component to string with hydrated initialState object during SSR", () => {
      function App() {
        const [, count] = useGlobalModel(CounterModel, state => state.count);
        const [, name] = useGlobalModel(CounterModel, state => state.name);
        return (
          <div>
            <span data-testid="count">{count}</span>
            <span data-testid="name">{name}</span>
          </div>
        );
      }

      const html = renderToString(
        <StratorProvider initialState={{ CounterModel: { count: 42, name: "server-hydrated" } }}>
          <App />
        </StratorProvider>,
      );

      expect(html).toContain("42");
      expect(html).toContain("server-hydrated");
    });

    test("supports partial state override during SSR", () => {
      function App() {
        const [, count] = useGlobalModel(CounterModel, state => state.count);
        const [, name] = useGlobalModel(CounterModel, state => state.name);
        return (
          <div>
            <span data-testid="count">{count}</span>
            <span data-testid="name">{name}</span>
          </div>
        );
      }

      const html = renderToString(
        <StratorProvider initialState={{ CounterModel: { count: 10 } }}>
          <App />
        </StratorProvider>,
      );

      expect(html).toContain("10");
      expect(html).toContain("default");
    });

    test("supports Map-based initialState with model constructor and string keys", () => {
      function App() {
        const [, globalCount] = useGlobalModel(CounterModel, state => state.count);
        const [, sharedCount] = useSharedModel("customShared", CounterModel, state => state.count);
        return (
          <div>
            <span data-testid="global">{globalCount}</span>
            <span data-testid="shared">{sharedCount}</span>
          </div>
        );
      }

      const initialStateMap = new Map();
      initialStateMap.set(CounterModel, { count: 100 });
      initialStateMap.set("customShared", { count: 200 });

      const html = renderToString(
        <StratorProvider initialState={initialStateMap}>
          <App />
        </StratorProvider>,
      );

      expect(html).toContain("100");
      expect(html).toContain("200");
    });

    test("renders useLocalModel during SSR", () => {
      function App() {
        const [, count] = useLocalModel(CounterModel, state => state.count);
        return <div data-testid="local-count">{count}</div>;
      }

      const html = renderToString(
        <StratorProvider>
          <App />
        </StratorProvider>,
      );

      expect(html).toContain("0");
    });

    test("extracts state on server for serialization and re-hydration", () => {
      let capturedState: Record<string, any> = {};

      function StateExtractor() {
        const ctx = useStratorContext();
        capturedState = ctx.getState();
        return null;
      }

      function App() {
        const [model] = useSharedModel("cart", CounterModel);
        model.increase();
        model.setName("server-cart");
        return <div>Cart Loaded</div>;
      }

      const html = renderToString(
        <StratorProvider>
          <App />
          <StateExtractor />
        </StratorProvider>,
      );

      expect(html).toContain("Cart Loaded");
      expect(capturedState.cart).toEqual({ count: 1, name: "server-cart" });

      const serialized = JSON.stringify(capturedState);
      const parsedState = JSON.parse(serialized);

      function HydratedApp() {
        const [, count] = useSharedModel("cart", CounterModel, state => state.count);
        const [, name] = useSharedModel("cart", CounterModel, state => state.name);
        return (
          <div>
            <span data-testid="cart-count">{count}</span>
            <span data-testid="cart-name">{name}</span>
          </div>
        );
      }

      const hydratedHtml = renderToString(
        <StratorProvider initialState={parsedState}>
          <HydratedApp />
        </StratorProvider>,
      );

      expect(hydratedHtml).toContain("1");
      expect(hydratedHtml).toContain("server-cart");
    });
  });

  describe("Client-Side Hydration", () => {
    test("hydrates server-rendered markup with initial model state and handles client interactions", async () => {
      function Counter() {
        const [model, count] = useGlobalModel(CounterModel, state => state.count);
        return (
          <button data-testid="btn" onClick={() => model.increase()}>
            Count is {count}
          </button>
        );
      }

      const serverInitialState = {
        CounterModel: { count: 7, name: "ssr" },
      };

      const serverHtml = renderToString(
        <StratorProvider initialState={serverInitialState}>
          <Counter />
        </StratorProvider>,
      );

      expect(serverHtml).toContain("Count is <!-- -->7");

      const container = document.createElement("div");
      document.body.appendChild(container);
      container.innerHTML = serverHtml;

      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      let root: ReturnType<typeof hydrateRoot> | undefined;
      await act(async () => {
        root = hydrateRoot(
          container,
          <StratorProvider initialState={serverInitialState}>
            <Counter />
          </StratorProvider>,
        );
      });

      const button = container.querySelector("button");
      expect(button).not.toBeNull();
      expect(button!.textContent).toBe("Count is 7");
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      // Trigger client interaction and verify state mutation + reactive UI update
      await act(async () => {
        button!.click();
      });

      expect(button!.textContent).toBe("Count is 8");

      await act(async () => {
        root?.unmount();
      });
      container.remove();
      consoleErrorSpy.mockRestore();
    });

    test("hydrates shared models across multiple components and synchronizes updates", async () => {
      function Viewer({ id }: { id: string }) {
        const [, count] = useSharedModel("shared-counter", CounterModel, state => state.count);
        return (
          <div data-testid={id}>
            Viewer {id}: {count}
          </div>
        );
      }

      function Modifier() {
        const [model] = useSharedModel("shared-counter", CounterModel);
        return (
          <button data-testid="increment" onClick={() => model.increase()}>
            +1
          </button>
        );
      }

      function App() {
        return (
          <div>
            <Viewer id="v1" />
            <Viewer id="v2" />
            <Modifier />
          </div>
        );
      }

      const serverInitialState = {
        "shared-counter": { count: 15 },
      };

      const serverHtml = renderToString(
        <StratorProvider initialState={serverInitialState}>
          <App />
        </StratorProvider>,
      );

      expect(serverHtml).toContain("Viewer <!-- -->v1<!-- -->: <!-- -->15");
      expect(serverHtml).toContain("Viewer <!-- -->v2<!-- -->: <!-- -->15");

      const container = document.createElement("div");
      document.body.appendChild(container);
      container.innerHTML = serverHtml;

      let root: ReturnType<typeof hydrateRoot> | undefined;
      await act(async () => {
        root = hydrateRoot(
          container,
          <StratorProvider initialState={serverInitialState}>
            <App />
          </StratorProvider>,
        );
      });

      const v1 = container.querySelector('[data-testid="v1"]');
      const v2 = container.querySelector('[data-testid="v2"]');
      const btn = container.querySelector('[data-testid="increment"]') as HTMLButtonElement;

      expect(v1?.textContent).toBe("Viewer v1: 15");
      expect(v2?.textContent).toBe("Viewer v2: 15");

      await act(async () => {
        btn.click();
      });

      expect(v1?.textContent).toBe("Viewer v1: 16");
      expect(v2?.textContent).toBe("Viewer v2: 16");

      await act(async () => {
        root?.unmount();
      });
      container.remove();
    });

    test("hydrates array state mutations on client", async () => {
      function TodoList() {
        const [todos, items] = useGlobalModel(TodosModel, state => state.items);
        return (
          <div>
            <ul data-testid="list">
              {items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
            <button data-testid="add" onClick={() => todos.addTodo("New Task")}>
              Add
            </button>
          </div>
        );
      }

      const serverInitialState = {
        TodosModel: { items: ["Task 1", "Task 2"] },
      };

      const serverHtml = renderToString(
        <StratorProvider initialState={serverInitialState}>
          <TodoList />
        </StratorProvider>,
      );

      expect(serverHtml).toContain("Task 1");
      expect(serverHtml).toContain("Task 2");

      const container = document.createElement("div");
      document.body.appendChild(container);
      container.innerHTML = serverHtml;

      let root: ReturnType<typeof hydrateRoot> | undefined;
      await act(async () => {
        root = hydrateRoot(
          container,
          <StratorProvider initialState={serverInitialState}>
            <TodoList />
          </StratorProvider>,
        );
      });

      const list = container.querySelector('[data-testid="list"]');
      expect(list?.children.length).toBe(2);

      const addBtn = container.querySelector('[data-testid="add"]') as HTMLButtonElement;
      await act(async () => {
        addBtn.click();
      });

      expect(list?.children.length).toBe(3);
      expect(list?.textContent).toContain("New Task");

      await act(async () => {
        root?.unmount();
      });
      container.remove();
    });

    test("hydrates generic useModel hook", async () => {
      function CustomComponent() {
        const [model, count] = useModel("custom-key", CounterModel, state => state.count);
        return (
          <button data-testid="btn" onClick={() => model.increase()}>
            Value: {count}
          </button>
        );
      }

      const serverInitialState = {
        "custom-key": { count: 99 },
      };

      const serverHtml = renderToString(
        <StratorProvider initialState={serverInitialState}>
          <CustomComponent />
        </StratorProvider>,
      );

      expect(serverHtml).toContain("Value: <!-- -->99");

      const container = document.createElement("div");
      document.body.appendChild(container);
      container.innerHTML = serverHtml;

      let root: ReturnType<typeof hydrateRoot> | undefined;
      await act(async () => {
        root = hydrateRoot(
          container,
          <StratorProvider initialState={serverInitialState}>
            <CustomComponent />
          </StratorProvider>,
        );
      });

      const btn = container.querySelector('[data-testid="btn"]') as HTMLButtonElement;
      expect(btn.textContent).toBe("Value: 99");

      await act(async () => {
        btn.click();
      });

      expect(btn.textContent).toBe("Value: 100");

      await act(async () => {
        root?.unmount();
      });
      container.remove();
    });

    test("hydrates nested object state mutations on client", async () => {
      interface ProfileState {
        user: {
          profile: {
            name: string;
            age: number;
          };
        };
      }

      class ProfileModel extends Model<ProfileState> {
        static initialState: ProfileState = {
          user: {
            profile: {
              name: "Initial",
              age: 20,
            },
          },
        };

        public updateAge(age: number) {
          this.state.user.profile.age = age;
        }
      }

      function ProfileView() {
        const [model, age] = useGlobalModel(ProfileModel, state => state.user.profile.age);
        return (
          <button data-testid="age-btn" onClick={() => model.updateAge(30)}>
            Age: {age}
          </button>
        );
      }

      const serverInitialState = {
        ProfileModel: {
          user: {
            profile: {
              name: "Server",
              age: 25,
            },
          },
        },
      };

      const serverHtml = renderToString(
        <StratorProvider initialState={serverInitialState}>
          <ProfileView />
        </StratorProvider>,
      );

      expect(serverHtml).toContain("Age: <!-- -->25");

      const container = document.createElement("div");
      document.body.appendChild(container);
      container.innerHTML = serverHtml;

      let root: ReturnType<typeof hydrateRoot> | undefined;
      await act(async () => {
        root = hydrateRoot(
          container,
          <StratorProvider initialState={serverInitialState}>
            <ProfileView />
          </StratorProvider>,
        );
      });

      const btn = container.querySelector('[data-testid="age-btn"]') as HTMLButtonElement;
      expect(btn.textContent).toBe("Age: 25");

      await act(async () => {
        btn.click();
      });

      expect(btn.textContent).toBe("Age: 30");

      await act(async () => {
        root?.unmount();
      });
      container.remove();
    });

    test("throws meaningful error when hook is used outside StratorProvider", () => {
      function BadComponent() {
        useGlobalModel(CounterModel);
        return null;
      }

      expect(() => renderToString(<BadComponent />)).toThrow("useStratorContext must be used inside a StratorProvider");
    });
  });
});
