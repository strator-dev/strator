// @vitest-environment happy-dom
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// No hook is installed by hand here: importing the React entry alone must be enough, as in an app
// that only does `import { StratorDevtools } from "@strator/devtools/react"`.
import { Model } from "@strator/core";
import { StratorProvider, useLocalModel } from "@strator/react";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, test } from "vite-plus/test";
import { StratorDevtools } from "../src/react.ts";
import { installDevtools } from "../src/store.ts";

class CounterModel extends Model<{ count: number }> {
  static initialState = { count: 0 };
}

function Counter() {
  const [, count] = useLocalModel(CounterModel, s => s.count);
  return <span>{count}</span>;
}

test("importing @strator/devtools/react tracks the provider and the models of the first render", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <StratorProvider>
        <Counter />
        <StratorDevtools />
      </StratorProvider>,
    );
  });

  const store = installDevtools();
  expect(store.containers).toHaveLength(1);
  expect(store.instances.map(i => i.model)).toContain("CounterModel");

  act(() => root.unmount());
  container.remove();
});
