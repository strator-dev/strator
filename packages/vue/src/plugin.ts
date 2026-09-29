import type { App, Plugin } from "vue";
import { STRATOR_CONTEXT_KEY, createStratorContext } from "./context.ts";
import type { StratorPluginOptions } from "./types.ts";

export function createStrator(options?: StratorPluginOptions): Plugin {
  return {
    install(app: App) {
      const ctx = createStratorContext(options?.initialState);
      app.provide(STRATOR_CONTEXT_KEY, ctx);
    },
  };
}
