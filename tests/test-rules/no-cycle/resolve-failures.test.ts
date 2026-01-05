import { RuleTester } from "@typescript-eslint/rule-tester";
import { noCycle } from "../../../src/rules/no-cycle";

const tester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

tester.run("no-cycle(resolve failures and edge cases)", noCycle, {
  valid: [
    {
      name: "unresolvable relative path should be skipped",
      code: "import { something } from './non-existent-file';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
    {
      name: "invalid relative path going too far up should be skipped",
      code: "import { something } from '../../../../../../invalid';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
    {
      name: "alias that cannot be resolved should be skipped",
      code: "import { something } from '@invalid/alias/path';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
    {
      name: "path with special characters should be handled",
      code: "import { something } from './file-with-dash';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
    {
      name: "path with underscore should be handled",
      code: "import { something } from './file_with_underscore';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
    {
      name: "empty import statement should be ignored",
      code: "import {} from './file';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
    {
      name: "import with only type should work",
      code: "import type { User } from './user';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
    {
      name: "mixed type and value import should work",
      code: "import { type UserType, user } from './user';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
  ],
  invalid: [],
});

