// @vitest-environment happy-dom
import { Model } from "@strator/core";
import { createSSRApp, defineComponent, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, test } from "vite-plus/test";
import { createStrator, StratorProvider, useGlobalModel, useSharedModel, useStratorContext } from "../src/index.ts";

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

describe("Vue SSR and Hydration with @strator/core models", () => {
  describe("Server-Side Rendering (SSR)", () => {
    test("renders component to string with default model state during SSR", async () => {
      const App = defineComponent({
        setup() {
          const [, count] = useGlobalModel(CounterModel, state => state.count);
          return () => h("div", { "data-testid": "counter" }, `Count: ${count.value}`);
        },
      });

      const Root = defineComponent({
        setup() {
          return () => h(StratorProvider, null, { default: () => h(App) });
        },
      });

      const app = createSSRApp(Root);
      const html = await renderToString(app);

      expect(html).toContain("Count: 0");
    });

    test("renders component to string with hydrated initialState object during SSR", async () => {
      const App = defineComponent({
        setup() {
          const [, count] = useGlobalModel(CounterModel, state => state.count);
          const [, name] = useGlobalModel(CounterModel, state => state.name);
          return () =>
            h("div", [
              h("span", { "data-testid": "count" }, String(count.value)),
              h("span", { "data-testid": "name" }, String(name.value)),
            ]);
        },
      });

      const Root = defineComponent({
        setup() {
          return () =>
            h(
              StratorProvider,
              { initialState: { CounterModel: { count: 42, name: "server-hydrated" } } },
              { default: () => h(App) },
            );
        },
      });

      const app = createSSRApp(Root);
      const html = await renderToString(app);

      expect(html).toContain("42");
      expect(html).toContain("server-hydrated");
    });

    test("supports partial state override during SSR", async () => {
      const App = defineComponent({
        setup() {
          const [, count] = useGlobalModel(CounterModel, state => state.count);
          const [, name] = useGlobalModel(CounterModel, state => state.name);
          return () =>
            h("div", [
              h("span", { "data-testid": "count" }, String(count.value)),
              h("span", { "data-testid": "name" }, String(name.value)),
            ]);
        },
      });

      const Root = defineComponent({
        setup() {
          return () => h(StratorProvider, { initialState: { CounterModel: { count: 10 } } }, { default: () => h(App) });
        },
      });

      const app = createSSRApp(Root);
      const html = await renderToString(app);

      expect(html).toContain("10");
      expect(html).toContain("default");
    });

    test("supports Map-based initialState during SSR", async () => {
      const stateMap = new Map();
      stateMap.set(CounterModel, { count: 99, name: "map-hydrated" });

      const App = defineComponent({
        setup() {
          const [, count] = useGlobalModel(CounterModel, state => state.count);
          const [, name] = useGlobalModel(CounterModel, state => state.name);
          return () =>
            h("div", [
              h("span", { "data-testid": "count" }, String(count.value)),
              h("span", { "data-testid": "name" }, String(name.value)),
            ]);
        },
      });

      const Root = defineComponent({
        setup() {
          return () => h(StratorProvider, { initialState: stateMap }, { default: () => h(App) });
        },
      });

      const app = createSSRApp(Root);
      const html = await renderToString(app);

      expect(html).toContain("99");
      expect(html).toContain("map-hydrated");
    });

    test("extracts server state via getState() during SSR", async () => {
      let extractedState: Record<string, any> = {};

      const App = defineComponent({
        setup() {
          const [counter] = useGlobalModel(CounterModel);
          const [todos] = useGlobalModel(TodosModel);
          const ctx = useStratorContext();

          counter.increase();
          counter.setName("mutated-on-server");
          todos.addTodo("SSR task");

          extractedState = ctx.getState();

          return () => h("div", `Rendered`);
        },
      });

      const Root = defineComponent({
        setup() {
          return () => h(StratorProvider, null, { default: () => h(App) });
        },
      });

      const app = createSSRApp(Root);
      await renderToString(app);

      expect(extractedState).toEqual({
        CounterModel: {
          count: 1,
          name: "mutated-on-server",
        },
        TodosModel: {
          items: ["SSR task"],
        },
      });
    });

    test("works with createStrator plugin in SSR app", async () => {
      const App = defineComponent({
        setup() {
          const [, state] = useSharedModel("app-counter", CounterModel);
          return () => h("div", { id: "output" }, `Count: ${state.count}`);
        },
      });

      const app = createSSRApp(App);
      app.use(createStrator({ initialState: { "app-counter": { count: 77 } } }));

      const html = await renderToString(app);
      expect(html).toContain("Count: 77");
    });
  });

  describe("Client-Side Hydration", () => {
    test("hydrates server-rendered HTML and maintains reactivity", async () => {
      const serverState = {
        CounterModel: {
          count: 5,
          name: "hydrated",
        },
      };

      const App = defineComponent({
        setup() {
          const [counter, state] = useGlobalModel(CounterModel);
          return () =>
            h("div", [
              h("button", { onClick: () => counter.increase() }, "Increment"),
              h("span", { id: "count" }, String(state.count)),
              h("span", { id: "name" }, String(state.name)),
            ]);
        },
      });

      // 1. SSR render
      const serverApp = createSSRApp(App);
      serverApp.use(createStrator({ initialState: serverState }));
      const html = await renderToString(serverApp);

      expect(html).toContain("5");
      expect(html).toContain("hydrated");

      // 2. Client Hydration
      const container = document.createElement("div");
      container.innerHTML = html;
      document.body.appendChild(container);

      const clientApp = createSSRApp(App);
      clientApp.use(createStrator({ initialState: serverState }));
      clientApp.mount(container);

      expect(container.querySelector("#count")?.textContent).toBe("5");
      expect(container.querySelector("#name")?.textContent).toBe("hydrated");

      // 3. User interaction after hydration
      const button = container.querySelector("button")!;
      button.click();
      await nextTick();

      expect(container.querySelector("#count")?.textContent).toBe("6");

      clientApp.unmount();
      container.remove();
    });
  });
});
