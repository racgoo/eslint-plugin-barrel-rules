import { RuleTester } from "@typescript-eslint/rule-tester";
import { noCycle, importGraph } from "../../../src/rules/no-cycle";
import path from "path";
import resolve from "resolve";
import { RESOLVE_EXTENSIONS } from "../../../src/utils/constants";

const tester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

tester.run("no-cycle(edge cases)", noCycle, {
  valid: [
    {
      name: "export without source should be ignored",
      code: "export const something = 'value';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
    {
      name: "import without source should be ignored",
      code: "const something = 'value';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
    {
      name: "barrel file with deep relative path",
      code: "export { something } from '../../../entities/deep/nested/module';",
      filename: __dirname + "/src/features/user/index.ts",
      options: [],
    },
    {
      name: "barrel file importing from parent directory",
      code: "export { something } from '../../shared/utils';",
      filename: __dirname + "/src/features/user/index.ts",
      options: [],
    },
    {
      name: "barrel file with multiple ../ in path",
      code: "export { something } from '../../../../shared/common';",
      filename: __dirname + "/src/features/user/nested/deep/index.ts",
      options: [],
    },
    {
      name: "non-barrel file can use alias for internal module",
      code: "import { userService } from '@features/user/user-service';",
      filename: __dirname + "/src/features/payment/payment-service.ts",
      options: [],
    },
    {
      name: "barrel file can import external with absolute path",
      code: "import React from 'react';",
      filename: __dirname + "/src/features/user/index.ts",
      options: [],
    },
    {
      name: "barrel file can import from node_modules with relative path",
      code: "import { something } from '../../../node_modules/package/dist/index';",
      filename: __dirname + "/src/features/user/index.ts",
      options: [],
    },
    {
      name: "barrel file with index.js extension",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.js",
      options: [],
    },
    {
      name: "barrel file with index.jsx extension",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.jsx",
      options: [],
    },
    {
      name: "barrel file with index.cjs extension",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.cjs",
      options: [],
    },
    {
      name: "barrel file with index.mjs extension",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.mjs",
      options: [],
    },
    {
      name: "file in same directory as barrel - relative import allowed",
      code: "export { helper } from './helper';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "file in subdirectory of barrel - relative import allowed",
      code: "export { nested } from './nested/module';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "barrel file importing from sibling directory with ../",
      code: "export { feature } from '../feature/module';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
  ],
  invalid: [
    {
      name: "barrel file using alias for same directory file",
      code: "export { helper } from '@entities/user/helper';",
      filename: __dirname + "/src/entities/user/index.ts",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
    {
      name: "barrel file using alias for subdirectory file",
      code: "export { nested } from '@entities/user/nested/module';",
      filename: __dirname + "/src/entities/user/index.ts",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
    {
      name: "barrel file with index.js using alias",
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
      name: "barrel file with index.jsx using alias",
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
      name: "barrel file with index.cjs using alias",
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
      name: "barrel file with index.mjs using alias",
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

// Setup graph for three-way cycle test
// module-b imports module-c, module-c imports module-a
const moduleAPath = path.resolve(__dirname, "src/features/user/module-a.ts");
const moduleBPath = path.resolve(__dirname, "src/features/user/module-b.ts");
const moduleCPath = path.resolve(__dirname, "src/features/user/module-c.ts");

try {
  const resolvedC = resolve.sync("./module-c", {
    basedir: path.dirname(moduleBPath),
    extensions: RESOLVE_EXTENSIONS,
  });
  const resolvedA = resolve.sync("./module-a", {
    basedir: path.dirname(moduleCPath),
    extensions: RESOLVE_EXTENSIONS,
  });
  
  importGraph.set(moduleBPath, new Set([resolvedC]));
  importGraph.set(moduleCPath, new Set([resolvedA]));
} catch (e) {
  importGraph.set(moduleBPath, new Set([moduleCPath]));
  importGraph.set(moduleCPath, new Set([moduleAPath]));
}

// Test longer cycles (3-way, 4-way)
tester.run("no-cycle(longer cycles)", noCycle, {
  valid: [],
  invalid: [
    {
      name: "three-way cycle - A -> B -> C -> A",
      code: "import { moduleC } from './module-c';",
      filename: __dirname + "/src/features/user/module-a.ts",
      errors: [
        {
          messageId: "CircularDependency",
        },
      ],
      options: [],
      // Note: module-b imports module-c, module-c imports module-a
      // When module-a imports module-c, it creates a cycle: A -> C -> A (via B)
    },
  ],
});

// Test resolve failures
tester.run("no-cycle(resolve failures)", noCycle, {
  valid: [
    {
      name: "unresolvable path should be skipped",
      code: "import { something } from './non-existent-file';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
    {
      name: "invalid relative path should be skipped",
      code: "import { something } from '../../../../../../invalid';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
    {
      name: "alias resolve failure should be skipped",
      code: "import { something } from '@invalid/alias/path';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
  ],
  invalid: [],
});

// Test various export types
tester.run("no-cycle(export types)", noCycle, {
  valid: [
    {
      name: "export named with relative path in barrel",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "export default with relative path in barrel",
      code: "export { default as user } from './user';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "export type with relative path in barrel",
      code: "export type { User } from './user';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "export interface with relative path in barrel",
      code: "export type { UserInterface } from './user';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
  ],
  invalid: [
    {
      name: "export named with alias in barrel",
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
      name: "export default with alias in barrel",
      code: "export { default as user } from '@entities/user/user';",
      filename: __dirname + "/src/entities/user/index.ts",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
    {
      name: "export type with alias in barrel",
      code: "export type { User } from '@entities/user/user';",
      filename: __dirname + "/src/entities/user/index.ts",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
  ],
});

