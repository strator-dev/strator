import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: [
      "./src/index.ts",
      {
        internals: "./src/internals.ts",
        decorators: "./src/decorators/index.ts",
      },
    ],
    dts: {
      tsgo: true,
    },
    exports: true,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
