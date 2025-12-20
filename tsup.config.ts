import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  external: [
    "@typescript-eslint/types",
    "@typescript-eslint/utils",
    "@typescript-eslint/parser",
    "@typescript-eslint/rule-tester",
  ],
});
