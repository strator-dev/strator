import { expect, test, describe, vi } from "vite-plus/test";
import { createModelState } from "../src/ModelState.ts";
import type { Observer } from "../src/ModelState.ts";

describe("createModelState - Array Observer Callbacks", () => {
  function setup<T extends object>(initial: T) {
    const observer: {
      onChange: ReturnType<typeof vi.fn>;
      onArrayItemChange: ReturnType<typeof vi.fn>;
      onArrayItemRemove: ReturnType<typeof vi.fn>;
      onArrayItemAdd: ReturnType<typeof vi.fn>;
    } = {
      onChange: vi.fn(),
      onArrayItemChange: vi.fn(),
      onArrayItemRemove: vi.fn(),
      onArrayItemAdd: vi.fn(),
    };

    const state = createModelState(initial, observer as Observer);
    return { state, observer };
  }

  describe("push", () => {
    test("triggers onArrayItemAdd with correct indexes when pushing items", () => {
      const { state, observer } = setup({ list: ["a"] });
      const len = state.proxy.list.push("b", "c");

      expect(len).toBe(3);
      expect(state.target.list).toEqual(["a", "b", "c"]);
      expect(observer.onArrayItemAdd).toHaveBeenCalledTimes(1);
      expect(observer.onArrayItemAdd).toHaveBeenCalledWith(["list"], [1, 2]);
    });

    test("does not trigger onArrayItemAdd when pushing no items", () => {
      const { state, observer } = setup({ list: ["a"] });
      state.proxy.list.push();

      expect(state.target.list).toEqual(["a"]);
      expect(observer.onArrayItemAdd).not.toHaveBeenCalled();
    });
  });

  describe("pop", () => {
    test("triggers onArrayItemRemove with last index and returns popped element", () => {
      const { state, observer } = setup({ list: ["a", "b"] });
      const popped = state.proxy.list.pop();

      expect(popped).toBe("b");
      expect(state.target.list).toEqual(["a"]);
      expect(observer.onArrayItemRemove).toHaveBeenCalledTimes(1);
      expect(observer.onArrayItemRemove).toHaveBeenCalledWith(["list"], [1]);
    });

    test("does not trigger onArrayItemRemove when popping an empty array", () => {
      const { state, observer } = setup({ list: [] as string[] });
      const popped = state.proxy.list.pop();

      expect(popped).toBeUndefined();
      expect(observer.onArrayItemRemove).not.toHaveBeenCalled();
    });
  });

  describe("shift", () => {
    test("triggers onArrayItemRemove with index 0 and returns shifted element", () => {
      const { state, observer } = setup({ list: ["a", "b"] });
      const shifted = state.proxy.list.shift();

      expect(shifted).toBe("a");
      expect(state.target.list).toEqual(["b"]);
      expect(observer.onArrayItemRemove).toHaveBeenCalledTimes(1);
      expect(observer.onArrayItemRemove).toHaveBeenCalledWith(["list"], [0]);
    });

    test("does not trigger onArrayItemRemove when shifting an empty array", () => {
      const { state, observer } = setup({ list: [] as string[] });
      const shifted = state.proxy.list.shift();

      expect(shifted).toBeUndefined();
      expect(observer.onArrayItemRemove).not.toHaveBeenCalled();
    });
  });

  describe("unshift", () => {
    test("triggers onArrayItemAdd with new beginning indexes", () => {
      const { state, observer } = setup({ list: ["c"] });
      const len = state.proxy.list.unshift("a", "b");

      expect(len).toBe(3);
      expect(state.target.list).toEqual(["a", "b", "c"]);
      expect(observer.onArrayItemAdd).toHaveBeenCalledTimes(1);
      expect(observer.onArrayItemAdd).toHaveBeenCalledWith(["list"], [0, 1]);
    });

    test("does not trigger onArrayItemAdd when unshifting no items", () => {
      const { state, observer } = setup({ list: ["a"] });
      state.proxy.list.unshift();

      expect(state.target.list).toEqual(["a"]);
      expect(observer.onArrayItemAdd).not.toHaveBeenCalled();
    });
  });

  describe("splice", () => {
    test("triggers onArrayItemRemove when deleting items", () => {
      const { state, observer } = setup({ list: ["a", "b", "c", "d"] });
      const removed = state.proxy.list.splice(1, 2);

      expect(removed).toEqual(["b", "c"]);
      expect(state.target.list).toEqual(["a", "d"]);
      expect(observer.onArrayItemRemove).toHaveBeenCalledTimes(1);
      expect(observer.onArrayItemRemove).toHaveBeenCalledWith(["list"], [1, 2]);
      expect(observer.onArrayItemAdd).not.toHaveBeenCalled();
    });

    test("triggers onArrayItemAdd when inserting items without deleting", () => {
      const { state, observer } = setup({ list: ["a", "d"] });
      const removed = state.proxy.list.splice(1, 0, "b", "c");

      expect(removed).toEqual([]);
      expect(state.target.list).toEqual(["a", "b", "c", "d"]);
      expect(observer.onArrayItemAdd).toHaveBeenCalledTimes(1);
      expect(observer.onArrayItemAdd).toHaveBeenCalledWith(["list"], [1, 2]);
      expect(observer.onArrayItemRemove).not.toHaveBeenCalled();
    });

    test("triggers both remove and add when replacing items", () => {
      const { state, observer } = setup({ list: ["a", "b", "c"] });
      const removed = state.proxy.list.splice(1, 2, "x", "y", "z");

      expect(removed).toEqual(["b", "c"]);
      expect(state.target.list).toEqual(["a", "x", "y", "z"]);
      expect(observer.onArrayItemRemove).toHaveBeenCalledWith(["list"], [1, 2]);
      expect(observer.onArrayItemAdd).toHaveBeenCalledWith(["list"], [1, 2, 3]);
    });

    test("handles negative start index properly", () => {
      const { state, observer } = setup({ list: ["a", "b", "c"] });
      const removed = state.proxy.list.splice(-1, 1, "z");

      expect(removed).toEqual(["c"]);
      expect(state.target.list).toEqual(["a", "b", "z"]);
      expect(observer.onArrayItemRemove).toHaveBeenCalledWith(["list"], [2]);
      expect(observer.onArrayItemAdd).toHaveBeenCalledWith(["list"], [2]);
    });

    test("handles delete count omitted (deletes to end)", () => {
      const { state, observer } = setup({ list: ["a", "b", "c"] });
      const removed = state.proxy.list.splice(1);

      expect(removed).toEqual(["b", "c"]);
      expect(state.target.list).toEqual(["a"]);
      expect(observer.onArrayItemRemove).toHaveBeenCalledWith(["list"], [1, 2]);
    });
  });

  describe("sort and reverse", () => {
    test("triggers onArrayItemChange on sort", () => {
      const { state, observer } = setup({ list: [3, 1, 2] });
      state.proxy.list.sort((a, b) => a - b);

      expect(state.target.list).toEqual([1, 2, 3]);
      expect(observer.onArrayItemChange).toHaveBeenCalledTimes(1);
      expect(observer.onArrayItemChange).toHaveBeenCalledWith(["list"], [0, 1, 2]);
    });

    test("triggers onArrayItemChange on reverse", () => {
      const { state, observer } = setup({ list: [1, 2, 3] });
      state.proxy.list.reverse();

      expect(state.target.list).toEqual([3, 2, 1]);
      expect(observer.onArrayItemChange).toHaveBeenCalledTimes(1);
      expect(observer.onArrayItemChange).toHaveBeenCalledWith(["list"], [0, 1, 2]);
    });
  });

  describe("fill and copyWithin", () => {
    test("triggers onArrayItemChange on fill", () => {
      const { state, observer } = setup({ list: [1, 2, 3, 4] });
      state.proxy.list.fill(0, 1, 3);

      expect(state.target.list).toEqual([1, 0, 0, 4]);
      expect(observer.onArrayItemChange).toHaveBeenCalledTimes(1);
      expect(observer.onArrayItemChange).toHaveBeenCalledWith(["list"], [1, 2]);
    });

    test("triggers onArrayItemChange on copyWithin", () => {
      const { state, observer } = setup({ list: [1, 2, 3, 4, 5] });
      state.proxy.list.copyWithin(0, 3, 5);

      expect(state.target.list).toEqual([4, 5, 3, 4, 5]);
      expect(observer.onArrayItemChange).toHaveBeenCalledTimes(1);
      expect(observer.onArrayItemChange).toHaveBeenCalledWith(["list"], [0, 1]);
    });
  });

  describe("direct indexing and length mutations", () => {
    test("triggers onArrayItemChange when setting existing index", () => {
      const { state, observer } = setup({ list: ["a", "b"] });
      state.proxy.list[0] = "updated";

      expect(state.target.list[0]).toBe("updated");
      expect(observer.onArrayItemChange).toHaveBeenCalledWith(["list"], [0]);
    });

    test("triggers onArrayItemAdd when setting new index", () => {
      const { state, observer } = setup({ list: ["a"] });
      state.proxy.list[1] = "b";

      expect(state.target.list).toEqual(["a", "b"]);
      expect(observer.onArrayItemAdd).toHaveBeenCalledWith(["list"], [1]);
    });

    test("triggers onArrayItemRemove when shrinking array via length", () => {
      const { state, observer } = setup({ list: ["a", "b", "c"] });
      state.proxy.list.length = 1;

      expect(state.target.list).toEqual(["a"]);
      expect(observer.onArrayItemRemove).toHaveBeenCalledWith(["list"], [1, 2]);
    });

    test("triggers onArrayItemChange when deleting an element", () => {
      const { state, observer } = setup({ list: ["a", "b"] });
      delete (state.proxy.list as any)[0];

      expect(observer.onArrayItemChange).toHaveBeenCalledWith(["list"], [0]);
    });
  });

  describe("nested paths and non-mutating methods", () => {
    test("preserves nested paths in observer callbacks", () => {
      const { state, observer } = setup({
        user: {
          posts: [{ tags: ["news"] }],
        },
      });

      state.proxy.user.posts[0].tags.push("tech");

      expect(observer.onArrayItemAdd).toHaveBeenCalledWith(["user", "posts", "0", "tags"], [1]);
      expect(state.target.user.posts[0].tags).toEqual(["news", "tech"]);
    });

    test("non-mutating methods work without triggering mutation callbacks", () => {
      const { state, observer } = setup({ list: ["a", "b", "c"] });

      const mapped = state.proxy.list.map(x => x.toUpperCase());
      const filtered = state.proxy.list.filter(x => x !== "b");
      const found = state.proxy.list.find(x => x === "a");
      const sliced = state.proxy.list.slice(1);

      expect(mapped).toEqual(["A", "B", "C"]);
      expect(filtered).toEqual(["a", "c"]);
      expect(found).toBe("a");
      expect(sliced).toEqual(["b", "c"]);

      expect(observer.onChange).not.toHaveBeenCalled();
      expect(observer.onArrayItemAdd).not.toHaveBeenCalled();
      expect(observer.onArrayItemRemove).not.toHaveBeenCalled();
      expect(observer.onArrayItemChange).not.toHaveBeenCalled();
    });
  });
});
