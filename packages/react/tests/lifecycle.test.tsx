// @vitest-environment happy-dom
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import { Model } from "@strator/core";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, describe, expect, test } from "vite-plus/test";
import {
  StratorProvider,
  type StratorContext,
  useGlobalModel,
  useLocalModel,
  useModel,
  useSharedModel,
  useStratorContext,
} from "../src/index.ts";

interface CounterState {
  count: number;
}

class CounterModel extends Model<CounterState> {
  static initialState: CounterState = {
    count: 0,
  };

  public increment() {
    this.state.count += 1;
  }
}

describe("React Model Lifecycle and Reference Counting", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    return () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    };
  });

  test("useLocalModel cleans up model instance and dispatcher on component unmount", async () => {
    let capturedContext!: StratorContext;
    let localModelInstance!: CounterModel;

    function ContextSpy() {
      capturedContext = useStratorContext();
      return null;
    }

    function LocalComponent() {
      const [model, count] = useLocalModel(CounterModel, state => state.count);
      localModelInstance = model;
      return <div data-testid="local-count">{count}</div>;
    }

    function App({ showLocal }: { showLocal: boolean }) {
      return (
        <StratorProvider>
          <ContextSpy />
          {showLocal && <LocalComponent />}
        </StratorProvider>
      );
    }

    await act(async () => {
      root.render(<App showLocal={true} />);
    });

    expect(capturedContext.models.current.size).toBe(1);
    expect(capturedContext.refCounts.current.size).toBe(1);
    const [modelKey] = capturedContext.models.current.keys();
    expect(capturedContext.refCounts.current.get(modelKey)).toBe(1);
    expect(capturedContext.models.current.get(modelKey)).toBe(localModelInstance);

    // Increment count
    await act(async () => {
      localModelInstance.increment();
    });
    expect(container.textContent).toContain("1");

    // Unmount local component
    await act(async () => {
      root.render(<App showLocal={false} />);
    });

    expect(capturedContext.models.current.size).toBe(0);
    expect(capturedContext.refCounts.current.size).toBe(0);
    expect(capturedContext.models.current.has(modelKey)).toBe(false);
  });

  test("useSharedModel reference counts shared instances and disposes only when all unmount", async () => {
    let capturedContext!: StratorContext;
    let instanceA!: CounterModel;
    let instanceB!: CounterModel;

    function ContextSpy() {
      capturedContext = useStratorContext();
      return null;
    }

    function ComponentA() {
      const [model, count] = useSharedModel("shared-counter", CounterModel, state => state.count);
      instanceA = model;
      return <div data-testid="count-a">{count}</div>;
    }

    function ComponentB() {
      const [model, count] = useSharedModel("shared-counter", CounterModel, state => state.count);
      instanceB = model;
      return <div data-testid="count-b">{count}</div>;
    }

    function App({ showA, showB }: { showA: boolean; showB: boolean }) {
      return (
        <StratorProvider>
          <ContextSpy />
          {showA && <ComponentA />}
          {showB && <ComponentB />}
        </StratorProvider>
      );
    }

    // Mount Component A only
    await act(async () => {
      root.render(<App showA={true} showB={false} />);
    });

    expect(capturedContext.models.current.size).toBe(1);
    expect(capturedContext.refCounts.current.get("shared-counter")).toBe(1);
    expect(instanceA).toBeDefined();

    // Mount Component B as well
    await act(async () => {
      root.render(<App showA={true} showB={true} />);
    });

    expect(capturedContext.models.current.size).toBe(1);
    expect(capturedContext.refCounts.current.get("shared-counter")).toBe(2);
    expect(instanceA).toBe(instanceB);

    // Modify state through instanceA
    await act(async () => {
      instanceA.increment();
    });

    expect(container.querySelector('[data-testid="count-a"]')?.textContent).toBe("1");
    expect(container.querySelector('[data-testid="count-b"]')?.textContent).toBe("1");

    // Unmount Component A (Component B remains mounted)
    await act(async () => {
      root.render(<App showA={false} showB={true} />);
    });

    expect(capturedContext.models.current.size).toBe(1);
    expect(capturedContext.refCounts.current.get("shared-counter")).toBe(1);
    expect(capturedContext.models.current.get("shared-counter")).toBe(instanceB);
    expect(container.querySelector('[data-testid="count-b"]')?.textContent).toBe("1");

    // Unmount Component B (all consumers unmounted)
    await act(async () => {
      root.render(<App showA={false} showB={false} />);
    });

    expect(capturedContext.models.current.size).toBe(0);
    expect(capturedContext.refCounts.current.size).toBe(0);
    expect(capturedContext.models.current.has("shared-counter")).toBe(false);
  });

  test("recreating model after complete unmount creates a fresh instance with initial state", async () => {
    let capturedContext!: StratorContext;
    let firstInstance!: CounterModel;
    let secondInstance!: CounterModel;

    function ContextSpy() {
      capturedContext = useStratorContext();
      return null;
    }

    function Component({ onInstance }: { onInstance: (m: CounterModel) => void }) {
      const [model, count] = useSharedModel("shared-counter", CounterModel, state => state.count);
      onInstance(model);
      return <div>Count: {count}</div>;
    }

    function App({ mounted, onInstance }: { mounted: boolean; onInstance: (m: CounterModel) => void }) {
      return (
        <StratorProvider>
          <ContextSpy />
          {mounted && <Component onInstance={onInstance} />}
        </StratorProvider>
      );
    }

    // First mount
    await act(async () => {
      root.render(<App mounted={true} onInstance={m => (firstInstance = m)} />);
    });

    await act(async () => {
      firstInstance.increment();
      firstInstance.increment();
    });
    expect(firstInstance.getState().count).toBe(2);

    // Unmount completely
    await act(async () => {
      root.render(<App mounted={false} onInstance={() => {}} />);
    });

    expect(capturedContext.models.current.has("shared-counter")).toBe(false);

    // Re-mount component
    await act(async () => {
      root.render(<App mounted={true} onInstance={m => (secondInstance = m)} />);
    });

    expect(secondInstance).not.toBe(firstInstance);
    expect(secondInstance.getState().count).toBe(0);
    expect(capturedContext.refCounts.current.get("shared-counter")).toBe(1);
  });

  test("useGlobalModel reference counting and cleanup across multiple components", async () => {
    let capturedContext!: StratorContext;

    function ContextSpy() {
      capturedContext = useStratorContext();
      return null;
    }

    function GlobalConsumer({ id }: { id: string }) {
      const [, count] = useGlobalModel(CounterModel, state => state.count);
      return <div data-testid={`global-${id}`}>Count: {count}</div>;
    }

    function App({ count }: { count: number }) {
      return (
        <StratorProvider>
          <ContextSpy />
          {Array.from({ length: count }, (_, i) => (
            <GlobalConsumer key={i} id={String(i)} />
          ))}
        </StratorProvider>
      );
    }

    await act(async () => {
      root.render(<App count={3} />);
    });

    expect(capturedContext.refCounts.current.get("CounterModel")).toBe(3);
    expect(capturedContext.models.current.size).toBe(1);

    await act(async () => {
      root.render(<App count={1} />);
    });

    expect(capturedContext.refCounts.current.get("CounterModel")).toBe(1);
    expect(capturedContext.models.current.size).toBe(1);

    await act(async () => {
      root.render(<App count={0} />);
    });

    expect(capturedContext.refCounts.current.size).toBe(0);
    expect(capturedContext.models.current.size).toBe(0);
  });

  test("selector reference changes do not churn retention or dispose the model", async () => {
    let capturedContext!: StratorContext;
    let retainedModel!: CounterModel;

    function ContextSpy() {
      capturedContext = useStratorContext();
      return null;
    }

    function Component({ multiplier }: { multiplier: number }) {
      // Dynamic inline selector changing on every render
      const [model, result] = useSharedModel("calc-counter", CounterModel, state => state.count * multiplier);
      retainedModel = model;
      return <div data-testid="result">{result}</div>;
    }

    function App({ multiplier }: { multiplier: number }) {
      return (
        <StratorProvider>
          <ContextSpy />
          <Component multiplier={multiplier} />
        </StratorProvider>
      );
    }

    await act(async () => {
      root.render(<App multiplier={2} />);
    });

    const initialInstance = retainedModel;
    expect(capturedContext.refCounts.current.get("calc-counter")).toBe(1);

    await act(async () => {
      retainedModel.increment();
    });
    expect(container.querySelector('[data-testid="result"]')?.textContent).toBe("2");

    // Re-render with different multiplier
    await act(async () => {
      root.render(<App multiplier={10} />);
    });

    expect(retainedModel).toBe(initialInstance);
    expect(capturedContext.refCounts.current.get("calc-counter")).toBe(1);
    expect(container.querySelector('[data-testid="result"]')?.textContent).toBe("10");
  });

  test("direct useModel retains and releases model properly", async () => {
    let capturedContext!: StratorContext;

    function ContextSpy() {
      capturedContext = useStratorContext();
      return null;
    }

    function DirectConsumer() {
      const [, count] = useModel("custom-key", CounterModel, state => state.count);
      return <div>Count: {count}</div>;
    }

    function App({ show }: { show: boolean }) {
      return (
        <StratorProvider>
          <ContextSpy />
          {show && <DirectConsumer />}
        </StratorProvider>
      );
    }

    await act(async () => {
      root.render(<App show={true} />);
    });

    expect(capturedContext.refCounts.current.get("custom-key")).toBe(1);
    expect(capturedContext.models.current.has("custom-key")).toBe(true);

    await act(async () => {
      root.render(<App show={false} />);
    });

    expect(capturedContext.models.current.has("custom-key")).toBe(false);
    expect(capturedContext.refCounts.current.size).toBe(0);
  });

  test("explicit disposeModel cleans up model, dispatcher, and refCount", async () => {
    let capturedContext!: StratorContext;

    function ContextSpy() {
      capturedContext = useStratorContext();
      return null;
    }

    function App() {
      return (
        <StratorProvider>
          <ContextSpy />
        </StratorProvider>
      );
    }

    await act(async () => {
      root.render(<App />);
    });

    capturedContext.getModel("manual-model", CounterModel);
    capturedContext.retainModel("manual-model");
    expect(capturedContext.models.current.has("manual-model")).toBe(true);
    expect(capturedContext.refCounts.current.get("manual-model")).toBe(1);

    capturedContext.disposeModel("manual-model");
    expect(capturedContext.models.current.has("manual-model")).toBe(false);
    expect(capturedContext.refCounts.current.has("manual-model")).toBe(false);
  });
});
