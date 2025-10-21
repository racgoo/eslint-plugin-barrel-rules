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

tester.run("enforce-barrel-pattern(relative path)", enforceBarrelPattern, {
  valid: [
    {
      name: "Access through barrel file",
      code: "import { User } from '../../entities/user';",
      filename: __dirname + "/src/features/user/test-use-case.ts",
      options: [
        {
          paths: ["src/features/*", "src/entities/*"],
          baseDir: __dirname,
        },
      ],
    },
    {
      name: "Access through barrel file without eslint config",
      code: "import { User } from '../../entities/user';",
      filename: __dirname + "/src/features/user/test-use-case.ts",
      options: [
        {
          paths: ["src/features/*"],
          baseDir: __dirname,
        },
      ],
    },
    {
      name: "Direct import inside of the barrel without eslint config",
      code: "import { User } from '../../entities/user/user';",
      filename: __dirname + "/src/features/user/test-use-case.ts",
      options: [
        {
          paths: ["src/features/*"],
          baseDir: __dirname,
        },
      ],
    },
    {
      name: "Direct access to a feature inside the same barrel file without eslint config",
      code: "import { User } from '../../entities/user/user';",
      filename: __dirname + "/src/features/user/test-use-case.ts",
      options: [
        {
          paths: ["src/features/*"],
          baseDir: __dirname,
        },
      ],
    },
  ],
  invalid: [
    {
      name: "Direct import inside of the barrel",
      code: "import { User } from '../../entities/user/user';",
      filename: __dirname + "/src/features/user/test-use-case.ts",
      errors: [
        {
          messageId: "DirectImportDisallowed",
        },
      ],
      options: [
        {
          paths: ["src/features/*", "src/entities/*"],
          baseDir: __dirname,
        },
      ],
    },
  ],
});
