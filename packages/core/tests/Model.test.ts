import { expect, test, describe } from "vite-plus/test";
import { Model } from "../src/Model.ts";
import type { Dispatcher } from "../src/Dispatcher.ts";

interface TestState {
  count: number;
  tags: string[];
}

class TestModel extends Model<TestState> {
  static initialState: TestState = {
    count: 0,
    tags: [],
  };

  public increase() {
    this.state.count += 1;
  }

  public addTag(tag: string) {
    this.state.tags.push(tag);
  }
}

describe("Model", () => {
  test("instantiates and mutates state cleanly in pure JS without mocks", () => {
    const model = new TestModel({ count: 10, tags: ["initial"] });
    expect(model["state"].count).toBe(10);
    expect(model["state"].tags).toEqual(["initial"]);

    model.increase();
    expect(model["state"].count).toBe(11);

    model.addTag("new-tag");
    expect(model["state"].tags).toEqual(["initial", "new-tag"]);
  });

  test("dispatches state changes when wrapped with internal state and dispatcher", () => {
    const events: any[] = [];
    const mockDispatcher: Dispatcher = {
      dispatchAction: p => events.push({ type: "action", ...p }),
      dispatchActionFinish: p => events.push({ type: "finish", ...p }),
      dispatchActionError: p => events.push({ type: "error", ...p }),
      dispatchStateChange: p => events.push({ type: "stateChange", ...p }),
    };

    const model = Model.withInternalState(TestModel, { count: 0, tags: [] }, mockDispatcher);
    model.increase();

    expect(events.some(e => e.type === "stateChange")).toBe(true);
  });
});
