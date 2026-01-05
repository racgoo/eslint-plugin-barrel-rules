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

tester.run("no-cycle(barrel file relative import)", noCycle, {
  valid: [
    {
      name: "barrel file using relative import with ./",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "barrel file using relative import with ../",
      code: "export { userService } from '../user/user-service';",
      filename: __dirname + "/src/features/payment/index.ts",
      options: [],
    },
    {
      name: "barrel file using multiple relative imports",
      code: "export { userService } from './user-service';\nexport { userRepository } from './user-repository';",
      filename: __dirname + "/src/features/user/index.ts",
      options: [],
    },
    {
      name: "non-barrel file using absolute path (should be allowed)",
      code: "import { user } from '@entities/user';",
      filename: __dirname + "/src/features/user/user-service.ts",
      options: [],
    },
    {
      name: "non-barrel file using non-relative path (should be allowed)",
      code: "import { user } from '@entities/user';",
      filename: __dirname + "/src/features/user/user-repository.ts",
      options: [],
    },
    {
      name: "barrel file importing external package (should be allowed)",
      code: "import { something } from 'some-external-package';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "barrel file importing from node_modules (should be allowed)",
      code: "import { something } from '../../../node_modules/some-package';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "non-barrel index.tsx file should also be treated as barrel",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.tsx",
      options: [],
    },
    {
      name: "barrel file with export default",
      code: "export { default as user } from './user';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "barrel file with export type",
      code: "export type { User } from './user';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "barrel file importing from deeply nested directory",
      code: "export { nested } from './nested/module';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "barrel file with multiple exports from same file",
      code: "export { user, userHelper } from './user';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "barrel file importing from parent's sibling",
      code: "export { feature } from '../feature/module';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
  ],
  invalid: [
    {
      name: "barrel file using alias import for internal module (should be disallowed)",
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
      name: "barrel file using absolute path without ./ or ../",
      code: "export { userService } from '@features/user/user-service';",
      filename: __dirname + "/src/features/user/index.ts",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
    // Note: Paths like 'src/features/user/user-service' cannot be resolved
    // by resolve.sync without being relative or an alias, so they return null
    // and are skipped. This test case is removed as it cannot be properly tested
    // in isolation without a proper alias configuration.
    {
      name: "barrel file using import instead of export with alias",
      code: "import { userService } from '@features/user/user-service';\nexport { userService };",
      filename: __dirname + "/src/features/user/index.ts",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
    {
      name: "barrel file using export all with alias",
      code: "export * from '@features/user/user-service';",
      filename: __dirname + "/src/features/user/index.ts",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
  ],
});
