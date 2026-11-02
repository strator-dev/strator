import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: {
      index: "src/index.ts",
      react: "src/react.ts",
    },
    deps: { resolveDepSubpath: true, alwaysBundle: [/^react($|\/)/, /^react-dom($|\/)/, /^scheduler($|\/)/] },
    dts: {
      generator: "tsgo",
    },
    exports: true,
    // Ship React's production build; the panel is a tool, not the app under development.
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
    // React and react-dom are bundled so the panel works with any app, React or not. Only the thin
    // `@strator/devtools/react` wrappers use the app's own React.
    inputOptions: {
      external: (id: string, importer: string | undefined) =>
        id === "react" && !!importer && /[\\/]src[\\/]react\.ts$/.test(importer),
    },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
