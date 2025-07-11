export default [
  {
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    env: {
      node: true,
      es6: true,
    },
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
