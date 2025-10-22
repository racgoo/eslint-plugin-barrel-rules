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

tester.run("enforce-barrel-pattern(external import)", enforceBarrelPattern, {
  valid: [
    {
      name: "External import as relative path",
      code: "import { some } from 'some-module';",
      filename: __dirname + "/src/features/user/test-use-case.ts",
      options: [
        {
          paths: [],
          baseDir: __dirname,
        },
      ],
    },
    {
      name: "External import as absolute path",
      code: "import { some } from '../../../node_modules/some-module';",
      filename: __dirname + "/src/features/user/test-use-case.ts",
      options: [
        {
          paths: [],
          baseDir: __dirname,
        },
      ],
    },
  ],
  invalid: [],
});
