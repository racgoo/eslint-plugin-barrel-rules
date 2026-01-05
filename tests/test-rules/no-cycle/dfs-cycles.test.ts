/**
 * DFS Cycle Detection Tests
 * 
 * Tests for detecting longer cycles using Depth-First Search (DFS) algorithm.
 * These tests verify that the no-cycle rule can detect cycles of 3+ files.
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
// Test: 3-file cycle (A -> B -> C -> A)
// ============================================================================
describe("no-cycle(DFS): 3-file cycle", () => {
  beforeEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
    
    // Setup: A -> B -> C already processed
    const resolvedBFromA = resolvePath(fileAPath, "./b");
    const resolvedCFromB = resolvePath(fileBPath, "./c");
    importGraph.set(fileAPath, new Set([resolvedBFromA]));
    importGraph.set(fileBPath, new Set([resolvedCFromB]));
  });

  afterEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  tester.run("3-file DFS cycle", noCycle, {
    valid: [],
    invalid: [
      {
        name: "C imports A completing 3-file cycle (A->B->C->A)",
        code: `import { a } from "./a";`,
        filename: fileCPath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });
});

// ============================================================================
// Test: 4-file cycle (A -> B -> C -> D -> A)
// ============================================================================
describe("no-cycle(DFS): 4-file cycle", () => {
  beforeEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
    
    // Setup: A -> B -> C -> D already processed
    const resolvedBFromA = resolvePath(fileAPath, "./b");
    const resolvedCFromB = resolvePath(fileBPath, "./c");
    const resolvedDFromC = resolvePath(fileCPath, "./d");
    importGraph.set(fileAPath, new Set([resolvedBFromA]));
    importGraph.set(fileBPath, new Set([resolvedCFromB]));
    importGraph.set(fileCPath, new Set([resolvedDFromC]));
  });

  afterEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  tester.run("4-file DFS cycle", noCycle, {
    valid: [],
    invalid: [
      {
        name: "D imports A completing 4-file cycle (A->B->C->D->A)",
        code: `import { a } from "./a";`,
        filename: fileDPath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });
});

// ============================================================================
// Test: 5-file cycle (A -> B -> C -> D -> E -> A)
// ============================================================================
describe("no-cycle(DFS): 5-file cycle", () => {
  beforeEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
    
    // Setup: A -> B -> C -> D -> E already processed
    const resolvedBFromA = resolvePath(fileAPath, "./b");
    const resolvedCFromB = resolvePath(fileBPath, "./c");
    const resolvedDFromC = resolvePath(fileCPath, "./d");
    const resolvedEFromD = resolvePath(fileDPath, "./e");
    importGraph.set(fileAPath, new Set([resolvedBFromA]));
    importGraph.set(fileBPath, new Set([resolvedCFromB]));
    importGraph.set(fileCPath, new Set([resolvedDFromC]));
    importGraph.set(fileDPath, new Set([resolvedEFromD]));
  });

  afterEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  tester.run("5-file DFS cycle", noCycle, {
    valid: [],
    invalid: [
      {
        name: "E imports A completing 5-file cycle (A->B->C->D->E->A)",
        code: `import { a } from "./a";`,
        filename: fileEPath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });
});

// ============================================================================
// Test: 6-file cycle (A -> B -> C -> D -> E -> F -> A)
// ============================================================================
describe("no-cycle(DFS): 6-file cycle", () => {
  beforeEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
    
    // Setup: A -> B -> C -> D -> E -> F already processed
    const resolvedBFromA = resolvePath(fileAPath, "./b");
    const resolvedCFromB = resolvePath(fileBPath, "./c");
    const resolvedDFromC = resolvePath(fileCPath, "./d");
    const resolvedEFromD = resolvePath(fileDPath, "./e");
    const resolvedFFromE = resolvePath(fileEPath, "./f");
    importGraph.set(fileAPath, new Set([resolvedBFromA]));
    importGraph.set(fileBPath, new Set([resolvedCFromB]));
    importGraph.set(fileCPath, new Set([resolvedDFromC]));
    importGraph.set(fileDPath, new Set([resolvedEFromD]));
    importGraph.set(fileEPath, new Set([resolvedFFromE]));
  });

  afterEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  tester.run("6-file DFS cycle", noCycle, {
    valid: [],
    invalid: [
      {
        name: "F imports A completing 6-file cycle (A->B->C->D->E->F->A)",
        code: `import { a } from "./a";`,
        filename: fileFPath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });
});

// ============================================================================
// Test: 7-file cycle (A -> B -> C -> D -> E -> F -> G -> A)
// ============================================================================
describe("no-cycle(DFS): 7-file cycle", () => {
  beforeEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
    
    // Setup: A -> B -> C -> D -> E -> F -> G already processed
    const resolvedBFromA = resolvePath(fileAPath, "./b");
    const resolvedCFromB = resolvePath(fileBPath, "./c");
    const resolvedDFromC = resolvePath(fileCPath, "./d");
    const resolvedEFromD = resolvePath(fileDPath, "./e");
    const resolvedFFromE = resolvePath(fileEPath, "./f");
    const resolvedGFromF = resolvePath(fileFPath, "./g");
    importGraph.set(fileAPath, new Set([resolvedBFromA]));
    importGraph.set(fileBPath, new Set([resolvedCFromB]));
    importGraph.set(fileCPath, new Set([resolvedDFromC]));
    importGraph.set(fileDPath, new Set([resolvedEFromD]));
    importGraph.set(fileEPath, new Set([resolvedFFromE]));
    importGraph.set(fileFPath, new Set([resolvedGFromF]));
  });

  afterEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  tester.run("7-file DFS cycle", noCycle, {
    valid: [],
    invalid: [
      {
        name: "G imports A completing 7-file cycle (A->B->C->D->E->F->G->A)",
        code: `import { a } from "./a";`,
        filename: fileGPath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });
});

// ============================================================================
// Test: Non-cycle with long chain (no false positives)
// ============================================================================
describe("no-cycle(DFS): Long chain without cycle", () => {
  beforeEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
    
    // Setup: A -> B -> C -> D -> E -> F (no back edge)
    const resolvedBFromA = resolvePath(fileAPath, "./b");
    const resolvedCFromB = resolvePath(fileBPath, "./c");
    const resolvedDFromC = resolvePath(fileCPath, "./d");
    const resolvedEFromD = resolvePath(fileDPath, "./e");
    const resolvedFFromE = resolvePath(fileEPath, "./f");
    importGraph.set(fileAPath, new Set([resolvedBFromA]));
    importGraph.set(fileBPath, new Set([resolvedCFromB]));
    importGraph.set(fileCPath, new Set([resolvedDFromC]));
    importGraph.set(fileDPath, new Set([resolvedEFromD]));
    importGraph.set(fileEPath, new Set([resolvedFFromE]));
  });

  afterEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  tester.run("long chain no cycle", noCycle, {
    valid: [
      {
        name: "F imports G (extending chain, no cycle)",
        code: `import { g } from "./g";`,
        filename: fileFPath,
      },
    ],
    invalid: [],
  });
});

// ============================================================================
// Test: Branching dependency graph (no false positives)
// A -> B, A -> C, B -> D, C -> D, D -> E, D -> F (no cycle)
// ============================================================================
describe("no-cycle(DFS): Branching graph without cycle", () => {
  beforeEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
    
    // Setup: A -> {B, C}, B -> D, C -> D, D -> {E, F}
    const resolvedBFromA = resolvePath(fileAPath, "./b");
    const resolvedCFromA = resolvePath(fileAPath, "./c");
    const resolvedDFromB = resolvePath(fileBPath, "./d");
    const resolvedDFromC = resolvePath(fileCPath, "./d");
    const resolvedEFromD = resolvePath(fileDPath, "./e");
    const resolvedFFromD = resolvePath(fileDPath, "./f");
    
    importGraph.set(fileAPath, new Set([resolvedBFromA, resolvedCFromA]));
    importGraph.set(fileBPath, new Set([resolvedDFromB]));
    importGraph.set(fileCPath, new Set([resolvedDFromC]));
    importGraph.set(fileDPath, new Set([resolvedEFromD, resolvedFFromD]));
  });

  afterEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  tester.run("branching graph no cycle", noCycle, {
    valid: [
      {
        name: "E imports G (no back edge, no cycle)",
        code: `import { g } from "./g";`,
        filename: fileEPath,
      },
    ],
    invalid: [],
  });
});

// ============================================================================
// Test: Cycle in the middle of chain (D -> E -> F -> D, but A -> B -> C -> D is fine)
// ============================================================================
describe("no-cycle(DFS): Cycle in middle", () => {
  beforeEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
    
    // Setup: D -> E -> F already processed, we're creating F -> D cycle
    const resolvedEFromD = resolvePath(fileDPath, "./e");
    const resolvedFFromE = resolvePath(fileEPath, "./f");
    importGraph.set(fileDPath, new Set([resolvedEFromD]));
    importGraph.set(fileEPath, new Set([resolvedFFromE]));
  });

  afterEach(() => {
    importGraph.clear();
    barrelExportsCache.clear();
  });

  tester.run("cycle in middle of chain", noCycle, {
    valid: [],
    invalid: [
      {
        name: "F imports D creating cycle (D->E->F->D)",
        code: `import { d } from "./d";`,
        filename: fileFPath,
        errors: [{ messageId: "CircularDependency" }],
      },
    ],
  });
});

