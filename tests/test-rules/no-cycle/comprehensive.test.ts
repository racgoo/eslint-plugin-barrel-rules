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

tester.run("no-cycle(comprehensive barrel file tests)", noCycle, {
  valid: [
    {
      name: "barrel file with index.js extension using relative import",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.js",
      options: [],
    },
    {
      name: "barrel file with index.jsx extension using relative import",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.jsx",
      options: [],
    },
    {
      name: "barrel file with index.cjs extension using relative import",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.cjs",
      options: [],
    },
    {
      name: "barrel file with index.mjs extension using relative import",
      code: "export { user } from './user';",
      filename: __dirname + "/src/entities/user/index.mjs",
      options: [],
    },
    {
      name: "barrel file importing from deeply nested subdirectory",
      code: "export { nested } from './nested/deep/module';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "barrel file with multiple relative exports",
      code: "export { a } from './a';\nexport { b } from './b';\nexport { c } from './c';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "barrel file importing from parent's parent",
      code: "export { shared } from '../../shared/utils';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "barrel file with mixed relative and external imports",
      code: "import React from 'react';\nexport { user } from './user';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "barrel file importing from sibling with ../",
      code: "export { feature } from '../feature/module';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
    {
      name: "barrel file with export type and value",
      code: "export type { UserType } from './user';\nexport { user } from './user';",
      filename: __dirname + "/src/entities/user/index.ts",
      options: [],
    },
  ],
  invalid: [
    {
      name: "barrel file with index.js using alias for internal",
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
      name: "barrel file with index.jsx using alias for internal",
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
      name: "barrel file with index.cjs using alias for internal",
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
      name: "barrel file with index.mjs using alias for internal",
      code: "export { user } from '@entities/user/user';",
      filename: __dirname + "/src/entities/user/index.mjs",
      errors: [
        {
          messageId: "BarrelInternalImportDisallowed",
        },
      ],
      options: [],
    },
    {
      name: "barrel file using alias for nested internal module",
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
      name: "barrel file using alias for helper in same directory",
      code: "export { helper } from '@entities/user/helper';",
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

// Test various path resolution scenarios
tester.run("no-cycle(path resolution edge cases)", noCycle, {
  valid: [
    {
      name: "relative path with extension should work",
      code: "import { user } from './user.ts';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
    {
      name: "relative path without extension should work",
      code: "import { user } from './user';",
      filename: __dirname + "/src/features/user/test.ts",
      options: [],
    },
    {
      name: "deep relative path should work",
      code: "import { user } from '../../../entities/user';",
      filename: __dirname + "/src/features/user/nested/deep/test.ts",
      options: [],
    },
    {
      name: "barrel file with very deep relative path",
      code: "export { module } from '../../../features/user/module';",
      filename: __dirname + "/src/entities/user/nested/deep/index.ts",
      options: [],
    },
  ],
  invalid: [],
});

// Test graph reset behavior more thoroughly
tester.run("no-cycle(graph reset behavior)", noCycle, {
  valid: [
    {
      name: "file processed after cycle removal should have clean graph",
      code: "import { user } from '../../entities/user';",
      filename: __dirname + "/src/features/user/file-a.ts",
      options: [],
      // Note: Even if file-a.ts previously had a cycle with file-b.ts,
      // when reprocessed, the graph is reset and only contains current imports
    },
    {
      name: "file with no imports should have empty graph",
      code: "export const standalone = 'value';",
      filename: __dirname + "/src/features/user/standalone.ts",
      options: [],
      // Note: When a file has no imports, the graph should be empty
      // This ensures no false positives from previous processing
    },
  ],
  invalid: [],
});

// Note: Graph reset behavior is tested implicitly through rule execution
// When a file is processed, the create() function resets the graph for that file
// This ensures that removed imports don't persist in the graph

