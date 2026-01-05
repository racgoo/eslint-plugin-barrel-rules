import { TSESTree } from "@typescript-eslint/types";
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";
import path from "path";
import resolve from "resolve";
import { Alias } from "../utils/alias";
import {
  BARREL_ENTRY_POINT_FILE_NAMES,
  RESOLVE_EXTENSIONS,
} from "../utils/constants";

type CircularDependencyMessageId = "CircularDependency";
type BarrelInternalImportMessageId = "BarrelInternalImportDisallowed";
type TransformedAliasResolveFailedMessageId = "TransformedAliasResolveFailed";

// Import graph for cycle detection
const importGraph = new Map<string, Set<string>>();
const fileToImports = new Map<string, Set<string>>();

// Cache for barrel file exports (filePath -> exported modules)
const barrelExportsCache = new Map<string, string[]>();

// Export for testing purposes
export { importGraph, barrelExportsCache };

// DFS to detect cycles
function detectCycle(
  currentFile: string,
  visited: Set<string>,
  recStack: Set<string>,
  path: string[]
): string[] | null {
  visited.add(currentFile);
  recStack.add(currentFile);
  path.push(currentFile);

  const imports = importGraph.get(currentFile) || new Set();
  for (const importedFile of imports) {
    if (!visited.has(importedFile)) {
      const cycle = detectCycle(importedFile, visited, recStack, [...path]);
      if (cycle) {
        return cycle;
      }
    } else if (recStack.has(importedFile)) {
      // Cycle detected
      const cycleStart = path.indexOf(importedFile);
      return [...path.slice(cycleStart), importedFile];
    }
  }

  recStack.delete(currentFile);
  return null;
}

function isBarrelFile(filePath: string): boolean {
  const fileName = path.basename(filePath);
  return BARREL_ENTRY_POINT_FILE_NAMES.includes(
    fileName as (typeof BARREL_ENTRY_POINT_FILE_NAMES)[number]
  );
}

/**
 * Analyzes a barrel file's AST and returns all modules it exports
 * This is used to detect circular dependencies when importing from barrel files via aliases
 *
 * Uses ESLint's AST to analyze:
 * - export { ... } from "./path" (re-export statements)
 * - export * from "./path"
 * - import { ... } from "./path" (import statements in barrel files that are typically re-exported)
 */
function getExportedModulesFromBarrel(
  barrelFileDir: string,
  sourceCode: { ast: TSESTree.Program }
): string[] {
  const exportedModules: string[] = [];
  const ast = sourceCode.ast;

  // Iterate through top-level statements in the program
  for (const statement of ast.body) {
    // Check for export statements with from clause
    if (
      statement.type === "ExportNamedDeclaration" ||
      statement.type === "ExportAllDeclaration"
    ) {
      if (statement.source) {
        const exportPath = statement.source.value as string;
        try {
          // Resolve the export path relative to the barrel file
          const resolvedPath = resolve.sync(exportPath, {
            basedir: barrelFileDir,
            extensions: RESOLVE_EXTENSIONS,
          });
          if (!exportedModules.includes(resolvedPath)) {
            exportedModules.push(resolvedPath);
          }
        } catch (e) {
          // If resolution fails, skip this export
        }
      }
    }

    // Check for import statements in barrel files
    // Barrel files often import and then re-export
    if (statement.type === "ImportDeclaration") {
      if (statement.source) {
        const importPath = statement.source.value as string;
        // Only consider relative imports (not external modules)
        if (importPath.startsWith(".") || importPath.startsWith("/")) {
          try {
            // Resolve the import path relative to the barrel file
            const resolvedPath = resolve.sync(importPath, {
              basedir: barrelFileDir,
              extensions: RESOLVE_EXTENSIONS,
            });
            // Only add if not already in the list
            if (!exportedModules.includes(resolvedPath)) {
              exportedModules.push(resolvedPath);
            }
          } catch (e) {
            // If resolution fails, skip this import
          }
        }
      }
    }
  }

  return exportedModules;
}

const noCycle: RuleModule<
  | CircularDependencyMessageId
  | BarrelInternalImportMessageId
  | TransformedAliasResolveFailedMessageId
> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Detect circular dependencies and enforce relative imports in barrel files.",
    },
    schema: [],
    messages: {
      CircularDependency:
        "Circular dependency detected: {{cyclePath}}. This creates a dependency cycle that can cause runtime errors and make code harder to maintain.",
      BarrelInternalImportDisallowed:
        "Barrel files (index.ts) must use relative imports (./ or ../) for internal modules. Importing via barrel file or absolute path is not allowed. Use relative path: '{{relativePath}}'",
      TransformedAliasResolveFailed:
        "Transformed alias resolve failed. please check the alias config.",
    },
  },

  defaultOptions: [],

  create(context) {
    const absoluteCurrentFilePath = context.getFilename();

    // Initialize graph for this file - only reset if it doesn't exist
    // This allows us to detect cycles across files while still allowing
    // re-processing of files to update the graph
    if (!importGraph.has(absoluteCurrentFilePath)) {
      importGraph.set(absoluteCurrentFilePath, new Set());
    }
    // Always reset the imports for the current file to reflect its current state
    // But keep the graph structure intact so we can detect cycles
    const currentImportsSet = importGraph.get(absoluteCurrentFilePath)!;
    currentImportsSet.clear();

    if (!fileToImports.has(absoluteCurrentFilePath)) {
      fileToImports.set(absoluteCurrentFilePath, new Set());
    }

    // If this is a barrel file, analyze and cache its exports
    if (isBarrelFile(absoluteCurrentFilePath)) {
      const barrelFileDir = path.dirname(absoluteCurrentFilePath);
      const sourceCode = context.getSourceCode();
      const exportedModules = getExportedModulesFromBarrel(
        barrelFileDir,
        sourceCode
      );
      barrelExportsCache.set(absoluteCurrentFilePath, exportedModules);
    }

    function resolveImportPath(rawImportPath: string): string | null {
      try {
        // Try to resolve with alias
        const aliasResult = Alias.resolvePath(
          rawImportPath,
          path.dirname(absoluteCurrentFilePath)
        );
        if (aliasResult.type === "success") {
          // If the resolved path is a directory, try to find index.ts
          // This handles cases like @pages/cycle -> src/pages/cycle -> src/pages/cycle/index.ts
          const resolvedPath = aliasResult.absolutePath;
          try {
            // Check if it's a directory and try to resolve to index.ts
            const fs = require("fs");
            const stats = fs.statSync(resolvedPath);
            if (stats.isDirectory()) {
              // Try to resolve to index.ts
              return resolve.sync("index", {
                basedir: resolvedPath,
                extensions: RESOLVE_EXTENSIONS,
              });
            }
          } catch (e) {
            // If stat fails or resolve fails, assume it's a file
            // Try to resolve with extensions
            try {
              return resolve.sync(resolvedPath, {
                basedir: path.dirname(absoluteCurrentFilePath),
                extensions: RESOLVE_EXTENSIONS,
              });
            } catch (e2) {
              // If that also fails, return the resolved path as-is
              return resolvedPath;
            }
          }
          return resolvedPath;
        } else {
          // Skip external imports
          if (
            (!rawImportPath.startsWith(".") &&
              !rawImportPath.startsWith("/")) ||
            rawImportPath.includes("/node_modules/")
          ) {
            return null;
          }

          // Resolve relative path
          return resolve.sync(rawImportPath, {
            basedir: path.dirname(absoluteCurrentFilePath),
            extensions: RESOLVE_EXTENSIONS,
          });
        }
      } catch (e) {
        return null;
      }
    }

    function checker(
      node:
        | TSESTree.ImportDeclaration
        | TSESTree.ExportNamedDeclaration
        | TSESTree.ExportAllDeclaration
    ) {
      if (!node.source) {
        return;
      }

      const rawImportPath = node.source.value as string;
      const absoluteImportPath = resolveImportPath(rawImportPath);

      if (!absoluteImportPath) {
        // External import or resolve failed, skip
        return;
      }

      // Rule 2: Barrel files must use relative imports for internal modules
      if (isBarrelFile(absoluteCurrentFilePath)) {
        // Get the barrel file's directory (the barrel's root directory)
        const barrelFileDir = path.dirname(absoluteCurrentFilePath);

        // Check if the imported file is within the same directory structure as the barrel file
        // This means it's an internal module that should use relative imports
        const isInternalModule =
          absoluteImportPath.startsWith(barrelFileDir + path.sep) ||
          absoluteImportPath === barrelFileDir;

        if (isInternalModule) {
          // For internal modules, must use relative imports (./ or ../)
          if (
            !rawImportPath.startsWith("./") &&
            !rawImportPath.startsWith("../")
          ) {
            // Calculate relative path for suggestion
            const relativePath = path.relative(
              barrelFileDir,
              absoluteImportPath
            );
            const suggestedRelativePath = relativePath.startsWith(".")
              ? relativePath
              : `./${relativePath}`;

            context.report({
              node,
              messageId: "BarrelInternalImportDisallowed",
              data: {
                relativePath: suggestedRelativePath.replace(/\\/g, "/"),
              },
            });
            return;
          }
        }
        // External modules (outside barrel directory) can use any import style
      }

      // Rule 1: Cycle detection
      // Special case: If current file is a barrel file importing an internal module,
      // don't treat it as a cycle. Barrel files importing their internal modules is normal.
      const isBarrelImportingInternal =
        isBarrelFile(absoluteCurrentFilePath) &&
        absoluteImportPath.startsWith(
          path.dirname(absoluteCurrentFilePath) + path.sep
        );

      // Add to import graph
      const currentImports = importGraph.get(absoluteCurrentFilePath);
      if (currentImports) {
        currentImports.add(absoluteImportPath);

        // If importing a barrel file, also add all modules it exports to the graph
        // This is crucial for detecting cycles when importing via aliases like @pages/cycle
        // Example: a.ts imports @pages/cycle (index.ts), which exports b.ts
        // We need a.ts -> b.ts in the graph to detect a.ts -> @pages/cycle -> b.ts -> @pages/cycle -> a.ts
        if (isBarrelFile(absoluteImportPath)) {
          // Get cached exports for this barrel file
          // The exports are cached when the barrel file is processed
          const exportedModules =
            barrelExportsCache.get(absoluteImportPath) || [];

          // Add each exported module to the graph
          // This creates edges: currentFile -> exportedModule (via barrel file)
          // But skip if the exported module is the current file (self-reference)
          for (const exportedModule of exportedModules) {
            if (exportedModule !== absoluteCurrentFilePath) {
              currentImports.add(exportedModule);

              // Check if the exported module already imports the current file
              // This detects cycles through barrel files: a.ts -> barrel -> b.ts, and b.ts -> barrel -> a.ts
              const exportedModuleImports = importGraph.get(exportedModule);
              if (
                exportedModuleImports &&
                exportedModuleImports.has(absoluteCurrentFilePath)
              ) {
                // Cycle detected through barrel file
                const cyclePath = `${absoluteCurrentFilePath} → ${absoluteImportPath} → ${exportedModule} → ${absoluteImportPath} → ${absoluteCurrentFilePath}`;
                context.report({
                  node,
                  messageId: "CircularDependency",
                  data: {
                    cyclePath,
                  },
                });
                return;
              }
            }
          }
        }
      }

      // Skip cycle detection if this is a barrel file importing its internal module
      // This is a normal pattern and shouldn't be flagged as a cycle
      if (isBarrelImportingInternal) {
        return;
      }

      // Check for immediate cycles (bidirectional check)
      // If the imported file already exists in the graph and imports the current file, it's a cycle
      const importedFileImports = importGraph.get(absoluteImportPath);
      if (
        importedFileImports &&
        importedFileImports.has(absoluteCurrentFilePath)
      ) {
        // Immediate cycle detected: A -> B and B -> A
        const cyclePath = `${absoluteCurrentFilePath} → ${absoluteImportPath} → ${absoluteCurrentFilePath}`;
        context.report({
          node,
          messageId: "CircularDependency",
          data: {
            cyclePath,
          },
        });
        return;
      }

      // Check for cycles using DFS (for longer cycles)
      const visited = new Set<string>();
      const recStack = new Set<string>();
      const cycle = detectCycle(absoluteCurrentFilePath, visited, recStack, []);

      if (cycle && cycle.length > 0) {
        const cyclePath = cycle.join(" → ");
        context.report({
          node,
          messageId: "CircularDependency",
          data: {
            cyclePath,
          },
        });
      }
    }

    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        return checker(node);
      },
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        return checker(node);
      },
      ExportAllDeclaration(node: TSESTree.ExportAllDeclaration) {
        return checker(node);
      },
    };
  },
};

export { noCycle };
