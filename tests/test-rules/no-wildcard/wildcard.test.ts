import { RuleTester } from "@typescript-eslint/rule-tester";
import { noWildcard } from "../../../src/rules/no-wildcard";

const tester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

tester.run("no-wildcard(relative path)", noWildcard, {
  valid: [
    {
      name: "non-wildcard import",
      code: "import { user } from '../../entities/user';",
      filename: __dirname + "/src/features/user/test-use-case.ts",
      options: [],
    },
    {
      name: "non-wildcard export",
      code: "export { user } from '../../entities/user';",
      filename: __dirname + "/src/features/user/test-use-case.ts",
      options: [],
    },
  ],
  invalid: [
    {
      name: "wildcard import",
      code: "import * as User from '../../entities/user';",
      filename: __dirname + "/src/features/user/test-use-case.ts",
      errors: [
        {
          messageId: "NoWildcardImport",
        },
      ],
      options: [],
    },
    {
      name: "wildcard export",
      code: "export * from '../../entities/user';",
      filename: __dirname + "/src/features/user/test-use-case.ts",
      errors: [
        {
          messageId: "NoExportAll",
        },
      ],
    },
  ],
});
