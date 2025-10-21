import { RuleTester } from "@typescript-eslint/rule-tester";
import { enforceBarrelPattern } from "../../../src/rules/enforce-barrel-pattern";

const tester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

tester.run("enforce-barrel-pattern(eslint config)", enforceBarrelPattern, {
  valid: [
    {
      name: "Empty paths property in eslint config",
      code: "",
      filename: __dirname + "/src/features/user/test-use-case.ts",
      options: [
        {
          paths: [],
          baseDir: __dirname,
        },
      ],
    },
  ],
  invalid: [
    {
      name: "Empty eslint config ojbect",
      code: "",
      errors: [
        {
          messageId: "EmptyEslintConfig",
        },
      ],
      filename: __dirname + "/src/features/user/test-use-case.ts",
      options: [],
    },
  ],
});
