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

// Helper to setup graph for testing
function setupGraph(filePath: string, imports: string[]) {
  const absolutePath = path.resolve(__dirname, filePath);
  const importsSet = new Set<string>();
  
  imports.forEach((importPath) => {
    try {
      const resolvedPath = resolve.sync(importPath, {
        basedir: path.dirname(absolutePath),
        extensions: RESOLVE_EXTENSIONS,
      });
      importsSet.add(resolvedPath);
    } catch (e) {
      // If resolution fails, construct expected path
      const expectedPath = path.resolve(path.dirname(absolutePath), importPath);
      importsSet.add(expectedPath);
    }
  });
  
  importGraph.set(absolutePath, importsSet);
  return absolutePath;
}

// Setup graph for graph update tests
// Simulate that file-b.ts has already been processed and imports file-a.ts
setupGraph("src/features/user/file-b.ts", ["./file-a"]);

tester.run("no-cycle(graph update after import removal)", noCycle, {
  valid: [
    {
      name: "file with no imports after removing cycle - should not detect cycle",
      code: "export const a = 'a';",
      filename: __dirname + "/src/features/user/file-a.ts",
      options: [],
      // Note: file-b.ts imports file-a.ts, but file-a.ts has no imports
      // When file-a.ts is processed, its graph is reset to empty
      // So no cycle is detected
    },
    {
      name: "file with different import after removing cycle",
      code: "import { user } from '../../entities/user';",
      filename: __dirname + "/src/features/user/file-a.ts",
      options: [],
      // Note: file-b.ts imports file-a.ts, but file-a.ts now imports something else
      // When file-a.ts is processed, its graph is reset and only contains the new import
      // So the cycle with file-b.ts is broken
    },
    {
      name: "graph should be reset when file is reprocessed without cycle",
      code: "import { user } from '../../entities/user';",
      filename: __dirname + "/src/features/user/file-a.ts",
      options: [],
      // Note: Even if file-a.ts previously had a cycle with file-b.ts,
      // when it's reprocessed, the graph is reset and only contains current imports
    },
  ],
  invalid: [],
});

