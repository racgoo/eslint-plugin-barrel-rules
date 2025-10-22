import { RuleTester } from "@typescript-eslint/rule-tester";
import { isolateBarrelFile } from "../../../src/rules/isolate-barrel-file";

const tester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

tester.run("isolate-barrel-file(external import)", isolateBarrelFile, {
  valid: [
    {
      name: "External import in same barrel(short path)",
      code: "import { some } from 'some-module';",
      filename: __dirname + "@features/user/test-use-case-1.ts",
      options: [
        {
          isolations: [
            {
              path: "src/features/user",
              allowedPaths: [],
            },
          ],
          baseDir: __dirname,
          globalAllowPaths: [],
        },
      ],
    },
    {
      name: "External import in same barrel(absolute path)",
      code: "import { some } from '../../../node_modules/some-module';",
      filename: __dirname + "@features/user/test-use-case-1.ts",
      options: [
        {
          isolations: [
            {
              path: "src/features/user",
              allowedPaths: [],
            },
          ],
          baseDir: __dirname,
          globalAllowPaths: [],
        },
      ],
    },
  ],
  invalid: [],
});
