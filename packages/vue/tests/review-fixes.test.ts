// @vitest-environment happy-dom
import { Model } from "@strator/core";
import { createApp } from "vue";
import { describe, expect, test } from "vite-plus/test";
import { createStratorContext } from "../src/context.ts";
import { syncState } from "../src/dispatcher.ts";
import { createStrator, useLocalModel } from "../src/index.ts";

interface ListState {
  items: { title: string; done: boolean }[];
}

class ListModel extends Model<ListState> {
  static initialState: ListState = { items: [] };

  public add(title: string) {
    this.state.items.push({ title, done: false });
  }

  public toggle(index: number) {
    this.state.items[index]!.done = !this.state.items[index]!.done;
  }
}

class OtherModel extends Model<{ value: number }> {
  static initialState = { value: 0 };
}

describe("Vue bindings review fixes", () => {
  test("model instances do not share nested initial state", () => {
    const ctx = createStratorContext();
    const a = ctx.getModel("a", ListModel);
    ctx.getModel("b", ListModel);
    a.add("one");
    expect(ctx.getModel("b", ListModel).getState().items).toEqual([]);
    expect(ListModel.initialState.items).toEqual([]);
  });

  test("reactive state does not share array elements with the model", () => {
    const ctx = createStratorContext();
    const model = ctx.getModel("list", ListModel);
    const reactiveState = ctx.getReactiveState<ListState>("list");
    model.add("one");
    expect(reactiveState.items[0]).not.toBe(model.getState().items[0]);
    model.toggle(0);
    expect(reactiveState.items[0]!.done).toBe(true);
  });

  test("syncState clones new object elements instead of assigning them", () => {
    const element = { a: 1 };
    const target: unknown[] = [];
    syncState([element], target);
    expect(target[0]).toEqual(element);
    expect(target[0]).not.toBe(element);
  });

  test("useLocalModel outside a component still gets a unique key per call", () => {
    const app = createApp({ render: () => null });
    app.use(createStrator());
    const [first, second] = app.runWithContext(() => [useLocalModel(ListModel), useLocalModel(ListModel)]);
    expect(first.model).not.toBe(second.model);
  });

  test("reusing a key for a different model class throws a clear error", () => {
    const ctx = createStratorContext();
    ctx.getModel("shared", ListModel);
    expect(() => ctx.getModel("shared", OtherModel)).toThrow(/already used by model ListModel/);
  });
});
