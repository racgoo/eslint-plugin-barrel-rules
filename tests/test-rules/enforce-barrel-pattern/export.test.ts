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

tester.run("enforce-barrel-pattern(export)", enforceBarrelPattern, {
  valid: [
    {
      name: "Export named from barrel file",
      code: "export { User } from '../../entities/user';",
      filename: __dirname + "/src/features/user/index.ts",
      options: [
        {
          paths: ["src/features/*", "src/entities/*"],
          baseDir: __dirname,
        },
      ],
    },
    {
      name: "Export named from barrel file without eslint config",
      code: "export { User } from '../../entities/user';",
      filename: __dirname + "/src/features/user/index.ts",
      options: [
        {
          paths: ["src/features/*"],
          baseDir: __dirname,
        },
      ],
    },
    {
      name: "Export named from direct file inside of the barrel without eslint config",
      code: "export { User } from '../../entities/user/user';",
      filename: __dirname + "/src/features/user/index.ts",
      options: [
        {
          paths: ["src/features/*"],
          baseDir: __dirname,
        },
      ],
    },
    {
      name: "Export named from direct file inside the same barrel file without eslint config",
      code: "export { User } from '../../entities/user/user';",
      filename: __dirname + "/src/features/user/index.ts",
      options: [
        {
          paths: ["src/features/*"],
          baseDir: __dirname,
        },
      ],
    },
    {
      name: "Export all from barrel file",
      code: "export * from '../../entities/user';",
      filename: __dirname + "/src/features/user/index.ts",
      options: [
        {
          paths: ["src/features/*", "src/entities/*"],
          baseDir: __dirname,
        },
      ],
    },
    {
      name: "Export all from barrel file without eslint config",
      code: "export * from '../../entities/user';",
      filename: __dirname + "/src/features/user/index.ts",
      options: [
        {
          paths: ["src/features/*"],
          baseDir: __dirname,
        },
      ],
    },
    {
      name: "Export all from direct file inside of the barrel without eslint config",
      code: "export * from '../../entities/user/user';",
      filename: __dirname + "/src/features/user/index.ts",
      options: [
        {
          paths: ["src/features/*"],
          baseDir: __dirname,
        },
      ],
    },
    {
      name: "Local export without source (should be ignored)",
      code: "export { User };",
      filename: __dirname + "/src/features/user/index.ts",
      options: [
        {
          paths: ["src/features/*", "src/entities/*"],
          baseDir: __dirname,
        },
      ],
    },
  ],
  invalid: [
    {
      name: "Export named from direct file inside of the barrel",
      code: "export { User } from '../../entities/user/user';",
      filename: __dirname + "/src/features/user/index.ts",
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
    {
      name: "Export all from direct file inside of the barrel",
      code: "export * from '../../entities/user/user';",
      filename: __dirname + "/src/features/user/index.ts",
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
