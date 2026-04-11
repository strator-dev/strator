import { defineConfig } from "vite-plus";
import type { OxfmtConfig } from "vite-plus/fmt";
import fmtConfig from "./.oxfmtrc.json" with { type: "json" };

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: fmtConfig as OxfmtConfig,
  lint: { options: { typeAware: true, typeCheck: true } },
  run: {
    cache: true,
  },
});
