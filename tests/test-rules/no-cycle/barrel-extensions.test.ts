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

tester.run("no-cycle(barrel file extensions)", noCycle, {
  valid: [
    {
      name: "index.ts barrel file with relative import",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "index.tsx barrel file with relative import",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.tsx",
      options: [],
    },
    {
      name: "index.js barrel file with relative import",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.js",
      options: [],
    },
    {
      name: "index.jsx barrel file with relative import",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.jsx",
      options: [],
    },
    {
      name: "index.cjs barrel file with relative import",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.cjs",
      options: [],
    },
    {
      name: "index.mjs barrel file with relative import",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.mjs",
      options: [],
    },
  ],
  invalid: [
    {
      name: "index.ts barrel file with alias import",
      code: "export { user } from '@entities/user/user';",
      filename: __dirname + "/src/entities/user/index.ts",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
    {
      name: "index.tsx barrel file with alias import",
      code: "export { user } from '@entities/user/user';",
      filename: __dirname + "/src/entities/user/index.tsx",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
    {
      name: "index.js barrel file with alias import",
      code: "export { user } from '@entities/user/user';",
      filename: __dirname + "/src/entities/user/index.js",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
    {
      name: "index.jsx barrel file with alias import",
      code: "export { user } from '@entities/user/user';",
      filename: __dirname + "/src/entities/user/index.jsx",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
    {
      name: "index.cjs barrel file with alias import",
      code: "export { user } from '@entities/user/user';",
      filename: __dirname + "/src/entities/user/index.cjs",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
    {
      name: "index.mjs barrel file with alias import",
      code: "export { user } from '@entities/user/user';",
      filename: __dirname + "/src/entities/user/index.mjs",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
  ],
});

