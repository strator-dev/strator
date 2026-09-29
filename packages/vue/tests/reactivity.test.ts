// @vitest-environment happy-dom
import { Model } from "@strator/core";
import { createApp, defineComponent, effectScope, h, nextTick, ref } from "vue";
import { describe, expect, test } from "vite-plus/test";
import {
  createStrator,
  provideStratorContext,
  StratorProvider,
  useGlobalModel,
  useLocalModel,
  useModel,
  useSharedModel,
  useStratorContext,
} from "../src/index.ts";

interface CounterState {
  count: number;
  label?: string;
}

class CounterModel extends Model<CounterState> {
  static initialState: CounterState = {
    count: 0,
    label: "default",
  };

  public increase() {
    this.state.count += 1;
  }

  public setLabel(label: string) {
    this.state.label = label;
  }
}

interface TodosState {
  items: string[];
  user: {
    name: string;
    roles: string[];
  };
}

class TodosModel extends Model<TodosState> {
  static initialState: TodosState = {
    items: [],
    user: {
      name: "Guest",
      roles: ["viewer"],
    },
  };

  public addTodo(item: string) {
    this.state.items.push(item);
  }

  public removeTodo(index: number) {
    this.state.items.splice(index, 1);
  }

  public setName(name: string) {
    this.state.user.name = name;
  }

  public addRole(role: string) {
    this.state.user.roles.push(role);
  }
}

describe("Vue Reactivity with @strator/core models", () => {
  test("throws descriptive error when composables are called outside provider", () => {
    expect(() => {
      const scope = effectScope();
      scope.run(() => {
        useModel("counter", CounterModel);
      });
    }).toThrow("Strator context not found");
  });

  test("isolates state between multiple useLocalModel instances", async () => {
    let comp1State: CounterState | undefined;
    let comp2State: CounterState | undefined;
    let comp1Model: CounterModel | undefined;
    let comp2Model: CounterModel | undefined;

    const Comp1 = defineComponent({
      setup() {
        const [model, state] = useLocalModel(CounterModel);
        comp1Model = model;
        comp1State = state;
        return () => h("div", `Comp1: ${state.count}`);
      },
    });

    const Comp2 = defineComponent({
      setup() {
        const [model, state] = useLocalModel(CounterModel);
        comp2Model = model;
        comp2State = state;
        return () => h("div", `Comp2: ${state.count}`);
      },
    });

    const Root = defineComponent({
      setup() {
        provideStratorContext();
        return () => h("div", [h(Comp1), h(Comp2)]);
      },
    });

    const container = document.createElement("div");
    const app = createApp(Root);
    app.mount(container);

    expect(comp1Model).not.toBe(comp2Model);
    expect(comp1State?.count).toBe(0);
    expect(comp2State?.count).toBe(0);

    comp1Model?.increase();
    await nextTick();

    expect(comp1State?.count).toBe(1);
    expect(comp2State?.count).toBe(0);
    expect(container.innerHTML).toContain("Comp1: 1");
    expect(container.innerHTML).toContain("Comp2: 0");

    app.unmount();
  });

  test("synchronizes state across components using useSharedModel", async () => {
    let comp1Model: CounterModel | undefined;
    let comp2Model: CounterModel | undefined;

    const Comp1 = defineComponent({
      setup() {
        const [model, state] = useSharedModel("shared-counter", CounterModel);
        comp1Model = model;
        return () => h("div", { id: "c1" }, `Comp1: ${state.count}`);
      },
    });

    const Comp2 = defineComponent({
      setup() {
        const [model, state] = useSharedModel("shared-counter", CounterModel);
        comp2Model = model;
        return () => h("div", { id: "c2" }, `Comp2: ${state.count}`);
      },
    });

    const Root = defineComponent({
      setup() {
        return () =>
          h(StratorProvider, null, {
            default: () => [h(Comp1), h(Comp2)],
          });
      },
    });

    const container = document.createElement("div");
    const app = createApp(Root);
    app.mount(container);

    expect(comp1Model).toBe(comp2Model);
    expect(container.querySelector("#c1")?.textContent).toBe("Comp1: 0");
    expect(container.querySelector("#c2")?.textContent).toBe("Comp2: 0");

    comp1Model?.increase();
    await nextTick();

    expect(container.querySelector("#c1")?.textContent).toBe("Comp1: 1");
    expect(container.querySelector("#c2")?.textContent).toBe("Comp2: 1");

    comp2Model?.increase();
    await nextTick();

    expect(container.querySelector("#c1")?.textContent).toBe("Comp1: 2");
    expect(container.querySelector("#c2")?.textContent).toBe("Comp2: 2");

    app.unmount();
  });

  test("synchronizes state across components using useGlobalModel", async () => {
    let globalModel: CounterModel | undefined;

    const Comp1 = defineComponent({
      setup() {
        const [model, state] = useGlobalModel(CounterModel);
        globalModel = model;
        return () => h("div", { id: "g1" }, `Global1: ${state.count}`);
      },
    });

    const Comp2 = defineComponent({
      setup() {
        const [, state] = useGlobalModel(CounterModel);
        return () => h("div", { id: "g2" }, `Global2: ${state.count}`);
      },
    });

    const Root = defineComponent({
      setup() {
        return () =>
          h(StratorProvider, null, {
            default: () => [h(Comp1), h(Comp2)],
          });
      },
    });

    const container = document.createElement("div");
    const app = createApp(Root);
    app.mount(container);

    expect(container.querySelector("#g1")?.textContent).toBe("Global1: 0");
    expect(container.querySelector("#g2")?.textContent).toBe("Global2: 0");

    globalModel?.increase();
    globalModel?.increase();
    await nextTick();

    expect(container.querySelector("#g1")?.textContent).toBe("Global1: 2");
    expect(container.querySelector("#g2")?.textContent).toBe("Global2: 2");

    app.unmount();
  });

  test("supports computed selector slices and object destructuring", async () => {
    let counterModel: CounterModel | undefined;

    const Comp = defineComponent({
      setup() {
        const { model, state: count } = useModel("test-counter", CounterModel, s => s.count);
        counterModel = model;
        return () => h("div", `Count is ${count.value}`);
      },
    });

    const Root = defineComponent({
      setup() {
        provideStratorContext();
        return () => h(Comp);
      },
    });

    const container = document.createElement("div");
    const app = createApp(Root);
    app.mount(container);

    expect(container.textContent).toBe("Count is 0");

    counterModel?.increase();
    await nextTick();

    expect(container.textContent).toBe("Count is 1");

    app.unmount();
  });

  test("handles arrays and nested object reactivity", async () => {
    let todosModel: TodosModel | undefined;

    const Comp = defineComponent({
      setup() {
        const [model, state] = useGlobalModel(TodosModel);
        todosModel = model;
        return () =>
          h("div", [
            h("div", { id: "user" }, `${state.user.name} (${state.user.roles.join(", ")})`),
            h(
              "ul",
              { id: "items" },
              state.items.map(item => h("li", { key: item }, item)),
            ),
          ]);
      },
    });

    const container = document.createElement("div");
    const app = createApp(Comp);
    app.use(createStrator());
    app.mount(container);

    expect(container.querySelector("#user")?.textContent).toBe("Guest (viewer)");
    expect(container.querySelectorAll("#items li").length).toBe(0);

    todosModel?.addTodo("Buy Milk");
    todosModel?.addTodo("Read Book");
    todosModel?.setName("Alice");
    todosModel?.addRole("admin");
    await nextTick();

    expect(container.querySelector("#user")?.textContent).toBe("Alice (viewer, admin)");
    expect(container.querySelectorAll("#items li").length).toBe(2);
    expect(container.querySelectorAll("#items li")[0].textContent).toBe("Buy Milk");
    expect(container.querySelectorAll("#items li")[1].textContent).toBe("Read Book");

    todosModel?.removeTodo(0);
    await nextTick();

    expect(container.querySelectorAll("#items li").length).toBe(1);
    expect(container.querySelectorAll("#items li")[0].textContent).toBe("Read Book");

    app.unmount();
  });

  test("cleans up local model on component unmount", async () => {
    let capturedContext: ReturnType<typeof useStratorContext> | undefined;
    const showChild = ref(true);

    const Child = defineComponent({
      setup() {
        useLocalModel(CounterModel);
        return () => h("div", "Child");
      },
    });

    const Root = defineComponent({
      setup() {
        capturedContext = provideStratorContext();
        return () => h("div", showChild.value ? [h(Child)] : []);
      },
    });

    const container = document.createElement("div");
    const app = createApp(Root);
    app.mount(container);

    expect(capturedContext?.models.size).toBe(1);

    showChild.value = false;
    await nextTick();

    expect(capturedContext?.models.size).toBe(0);

    app.unmount();
  });
});
