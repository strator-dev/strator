import { expect, test } from "vite-plus/test";
import { useLocalModel, useSharedModel, useGlobalModel } from "../src/index.ts";

test("exports React state management hooks", () => {
  expect(typeof useLocalModel).toBe("function");
  expect(typeof useSharedModel).toBe("function");
  expect(typeof useGlobalModel).toBe("function");
});
