import { expect, test } from "vite-plus/test";
import {
  createStrator,
  createStratorContext,
  provideStratorContext,
  StratorProvider,
  Provider,
  useGlobalModel,
  useLocalModel,
  useModel,
  useSharedModel,
  useStratorContext,
  VueDispatcher,
  VueModelDispatcher,
} from "../src/index.ts";

test("exports Vue state management composables and utilities", () => {
  expect(typeof useModel).toBe("function");
  expect(typeof useLocalModel).toBe("function");
  expect(typeof useSharedModel).toBe("function");
  expect(typeof useGlobalModel).toBe("function");
  expect(typeof createStrator).toBe("function");
  expect(typeof createStratorContext).toBe("function");
  expect(typeof provideStratorContext).toBe("function");
  expect(typeof useStratorContext).toBe("function");
  expect(StratorProvider).toBeDefined();
  expect(Provider).toBe(StratorProvider);
  expect(VueDispatcher).toBeDefined();
  expect(VueModelDispatcher).toBeDefined();
});
