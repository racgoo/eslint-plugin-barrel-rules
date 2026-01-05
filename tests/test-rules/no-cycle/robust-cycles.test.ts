/**
 * Robust test suite for no-cycle rule
 * Tests various circular dependency scenarios to ensure the rule is reliable
 * 
 * Note: RuleTester processes files in isolation. The importGraph is a global
 * state that persists across test runs within the same module.
 * 
 * Critical: Since all setup runs at module load time and all tester.run() calls
 * register tests that run later, we structure the tests to work with this behavior.
 */
import { RuleTester } from "@typescript-eslint/rule-tester";
import { noCycle, importGraph, barrelExportsCache } from "../../../src/rules/no-cycle";
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

// File paths
const complexCycleDir = path.resolve(__dirname, "src/complex-cycle");
const fileAPath = path.resolve(complexCycleDir, "a.ts");
const fileBPath = path.resolve(complexCycleDir, "b.ts");
const fileCPath = path.resolve(complexCycleDir, "c.ts");
const fileDPath = path.resolve(complexCycleDir, "d.ts");
const fileEPath = path.resolve(complexCycleDir, "e.ts");
const fileFPath = path.resolve(complexCycleDir, "f.ts");
const fileGPath = path.resolve(complexCycleDir, "g.ts");
const indexPath = path.resolve(complexCycleDir, "index.ts");

// Helper function to resolve paths like the rule does
function resolvePath(from: string, to: string): string {
  try {
    return resolve.sync(to, {
      basedir: path.dirname(from),
      extensions: RESOLVE_EXTENSIONS,
    });
  } catch {
    return path.resolve(path.dirname(from), to + ".ts");
  }
}

// ============================================================================
// Test 1: External imports should always be ignored (no cycle detection)
// These tests don't need any graph setup as external imports are skipped
// ============================================================================
tester.run("no-cycle(robust): External imports", noCycle, {
  valid: [
    {
      name: "npm package",
      code: `import React from "react";`,
      filename: fileAPath,
    },
    {
      name: "scoped npm package",
      code: `import { css } from "@emotion/react";`,
      filename: fileAPath,
    },
    {
      name: "node_modules path",
      code: `import something from "../../node_modules/lodash";`,
      filename: fileAPath,
    },
    {
      name: "node built-in fs",
      code: `import fs from "fs";`,
      filename: fileAPath,
    },
    {
      name: "node built-in path",
      code: `import path from "path";`,
      filename: fileAPath,
    },
    {
      name: "multiple external packages",
      code: `import React from "react";\nimport lodash from "lodash";`,
      filename: fileAPath,
    },
  ],
  invalid: [],
});

// ============================================================================
// Test 2: Barrel file relative imports (valid patterns)
// ============================================================================
tester.run("no-cycle(robust): Barrel relative imports", noCycle, {
  valid: [
    {
      name: "single relative export",
      code: `export { a } from "./a";`,
      filename: indexPath,
    },
    {
      name: "multiple relative exports",
      code: `export { a } from "./a";\nexport { b } from "./b";`,
      filename: indexPath,
    },
    {
      name: "export all relative",
      code: `export * from "./a";`,
      filename: indexPath,
    },
  ],
  invalid: [],
});

// ============================================================================
// Test 3: Dynamic imports should NOT trigger cycle detection
// ============================================================================
tester.run("no-cycle(robust): Dynamic imports", noCycle, {
  valid: [
    {
      name: "dynamic import expression",
      code: `const b = import("./b");`,
      filename: fileAPath,
    },
    {
      name: "async dynamic import",
      code: `async function load() { return await import("./b"); }`,
      filename: fileAPath,
    },
  ],
  invalid: [],
});

// ============================================================================
// Test 4: Self-import should be detected as cycle
// ============================================================================
tester.run("no-cycle(robust): Self-import", noCycle, {
  valid: [],
  invalid: [
    {
      name: "file imports itself",
      code: `import { a } from "./a";`,
      filename: fileAPath,
      errors: [{ messageId: "CircularDependency" }],
    },
  ],
});

// ============================================================================
// Test 5: Export without from (no source, not affected by cycle detection)
// ============================================================================
tester.run("no-cycle(robust): Export without from", noCycle, {
  valid: [
    {
      name: "export const",
      code: `export const x = 1;`,
      filename: fileAPath,
    },
    {
      name: "export function",
      code: `export function foo() {}`,
      filename: fileAPath,
    },
    {
      name: "export class",
      code: `export class Foo {}`,
      filename: fileAPath,
    },
    {
      name: "export default",
      code: `export default function() {}`,
      filename: fileAPath,
    },
  ],
  invalid: [],
});

// ============================================================================
// Test 6-15: Bidirectional cycles with various import types
// Use describe blocks to set up and tear down the graph properly
// ============================================================================

describe("no-cycle(robust): Bidirectional cycles", () => {
  const resolvedAFromB = resolvePath(fileBPath, "./a");
  
  beforeEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
    // Setup: B imports A
    importGraph.set(fileBPath, new Set([resolvedAFromB]));
  });

  afterEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  tester.run("named import", noCycle, {
    valid: [],
    invalid: [
      {
        name: "A imports B when B imports A",
        code: `import { b } from "./b";`,
        filename: fileAPath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });

  tester.run("re-export", noCycle, {
    valid: [],
    invalid: [
      {
        name: "A re-exports B when B imports A",
        code: `export { b } from "./b";`,
        filename: fileAPath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });

  tester.run("export all", noCycle, {
    valid: [],
    invalid: [
      {
        name: "A export * from B when B imports A",
        code: `export * from "./b";`,
        filename: fileAPath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });

  tester.run("type import", noCycle, {
    valid: [],
    invalid: [
      {
        name: "A type imports B when B imports A",
        code: `import type { B } from "./b";`,
        filename: fileAPath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });

  tester.run("namespace import", noCycle, {
    valid: [],
    invalid: [
      {
        name: "A namespace imports B when B imports A",
        code: `import * as b from "./b";`,
        filename: fileAPath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });

  tester.run("default import", noCycle, {
    valid: [],
    invalid: [
      {
        name: "A default imports B when B imports A",
        code: `import b from "./b";`,
        filename: fileAPath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });

  tester.run("multiple imports with one cyclic", noCycle, {
    valid: [],
    invalid: [
      {
        name: "A imports B and C - B triggers cycle, C also triggers via DFS",
        code: `import { b } from "./b";\nimport { c } from "./c";`,
        filename: fileAPath,
        // Both imports trigger cycle detection: first via bidirectional check, second via DFS
        errors: [
          { messageId: "CircularDependency" },
          { messageId: "CircularDependency" },
        ],
      },
    ],
  });

  tester.run("import after external still detects cycle", noCycle, {
    valid: [],
    invalid: [
      {
        name: "external then cyclic import",
        code: `import React from "react";\nimport { b } from "./b";`,
        filename: fileAPath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });
});

// ============================================================================
// Test: No false positives - linear chains should not trigger errors
// ============================================================================
describe("no-cycle(robust): Linear chain (no cycle)", () => {
  beforeEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
    // Setup: A -> B -> C (no cycle back to A)
    const resolvedBFromA = resolvePath(fileAPath, "./b");
    const resolvedCFromB = resolvePath(fileBPath, "./c");
    importGraph.set(fileAPath, new Set([resolvedBFromA]));
    importGraph.set(fileBPath, new Set([resolvedCFromB]));
  });

  afterEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  tester.run("linear chain", noCycle, {
    valid: [
      {
        name: "C imports D (extending chain)",
        code: `import { d } from "./d";`,
        filename: fileCPath,
      },
    ],
    invalid: [],
  });
});

// ============================================================================
// Test: Diamond dependency (no cycle)
// ============================================================================
describe("no-cycle(robust): Diamond dependency (no cycle)", () => {
  beforeEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
    // Setup: A -> B, A -> C, B -> D
    const resolvedBFromA = resolvePath(fileAPath, "./b");
    const resolvedCFromA = resolvePath(fileAPath, "./c");
    const resolvedDFromB = resolvePath(fileBPath, "./d");
    importGraph.set(fileAPath, new Set([resolvedBFromA, resolvedCFromA]));
    importGraph.set(fileBPath, new Set([resolvedDFromB]));
  });

  afterEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  tester.run("diamond", noCycle, {
    valid: [
      {
        name: "C imports D (diamond dependency)",
        code: `import { d } from "./d";`,
        filename: fileCPath,
      },
    ],
    invalid: [],
  });
});

// ============================================================================
// Test: Side-effect imports
// ============================================================================
describe("no-cycle(robust): Side-effect imports", () => {
  beforeEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  afterEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  tester.run("side-effect", noCycle, {
    valid: [
      {
        name: "side-effect only import",
        code: `import "./b";`,
        filename: fileAPath,
      },
      {
        name: "multiple side-effect imports",
        code: `import "./a";\nimport "./b";\nimport "./c";`,
        filename: fileDPath,
      },
    ],
    invalid: [],
  });
});

// ============================================================================
// Test: Deep nested path cycle
// ============================================================================
describe("no-cycle(robust): Deep nested cycle", () => {
  const nestedDir = path.resolve(__dirname, "src/entities/user/nested/deep");
  const nestedModulePath = path.resolve(nestedDir, "module.ts");
  const helperPath = path.resolve(__dirname, "src/entities/user/helper.ts");

  beforeEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
    // Helper imports nested module
    importGraph.set(helperPath, new Set([nestedModulePath]));
  });

  afterEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  tester.run("deep nested", noCycle, {
    valid: [],
    invalid: [
      {
        name: "nested imports helper that imports it",
        code: `import { helper } from "../../helper";`,
        filename: nestedModulePath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });
});
