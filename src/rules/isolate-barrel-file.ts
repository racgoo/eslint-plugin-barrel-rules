import { TSESTree } from "@typescript-eslint/types";
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";
import path from "path";
import resolve from "resolve";
import { Glob } from "../utils/glob";
import { Alias } from "../utils/alias";

const RESOLVE_EXTENSIONS = [
  ".ts",
  ".js",
  ".tsx",
  ".jsx",
  ".json",
  ".d.js",
  ".d.ts",

  ".mjs",
  ".cjs",
  ".mts",
  ".cts",

  ".d.mjs",
  ".d.cjs",
  ".d.mts",
  ".d.cts",
] as const;

type IsolationOption = {
  path: string;
  allowedPaths: string[];
};

type Option = {
  //isolations: paths that are isolated to be barrel file
  isolations: IsolationOption[];
  //baseDir: base directory of the project
  baseDir: string;
  //globalAllowPaths: paths that are allowed to be imported from outside of the isolated barrel file
  globalAllowPaths: string[];
};

type IsolatedBarrelImportMessageId = "IsolatedBarrelImportDisallowed";

type TransformedAliasResolveFailedMessageId = "TransformedAliasResolveFailed";

const isolateBarrelFile: RuleModule<
  IsolatedBarrelImportMessageId | TransformedAliasResolveFailedMessageId,
  Option[]
> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Isolate barrel file is not allowed to import outside of the barrel file",
    },
    schema: [
      {
        type: "object",
        properties: {
          isolations: { type: "array", items: { type: "object" } },
          baseDir: { type: "string" },
          globalAllowPaths: { type: "array", items: { type: "string" } },
        },
        required: ["isolations", "baseDir", "globalAllowPaths"],
        additionalProperties: false,
      },
    ],
    messages: {
      TransformedAliasResolveFailed:
        "Transformed alias resolve failed. please check the alias config.",
      IsolatedBarrelImportDisallowed:
        "This barrel file is isolated. external import is not allowed. if you want to import outside of the barrel file, please add 'allowedPath' to the plugin options.",
    },
  },

  //default options(baseDir is current working directory. almost user execute eslint in project root)
  defaultOptions: [
    {
      isolations: [],
      baseDir: process.cwd(),
      globalAllowPaths: [],
    },
  ],
  create(context) {
    //extract options
    const option = context.options[0];
    const baseDir = option.baseDir;

    //get absolute global allowed import paths
    const absoluteGlobalAllowPaths = option.globalAllowPaths.flatMap((path) => {
      return Glob.resolvePath(path, baseDir);
    });

    //absolute paths with allowed import paths for each isolation(Glob resolve)
    const absoluteIsolations = option.isolations.flatMap((isolation) => {
      const isolationPaths = Glob.resolvePath(isolation.path, baseDir);
      const allowedPaths = isolation.allowedPaths.flatMap((path) => {
        return Glob.resolvePath(path, baseDir);
      });
      return isolationPaths.map((isolationPath) => ({
        isolationPath,
        //self isolatedPath also allowed to be imported
        allowedPaths: [...allowedPaths, isolationPath],
      }));
    });

    return {
      //check only import declaration(ESM)
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        //get raw import path(ex: "../../../domains/test/hooks/test-hook")
        const rawImportPath = node.source.value as string;

        //get absolute current file path(each file)
        const absoluteCurrentFilePath = context.getFilename();
        //get resolved path
        let absoluteImportPath: string | null = null;

        try {
          //try to resolve with alias
          const aliasResult = Alias.resolvePath(
            rawImportPath,
            path.dirname(absoluteCurrentFilePath)
          );
          if (aliasResult.type === "success") {
            //alias resolved
            absoluteImportPath = aliasResult.absolutePath;
          } else {
            if (
              (!rawImportPath.startsWith(".") &&
                !rawImportPath.startsWith("/")) ||
              rawImportPath.includes("/node_modules/")
            ) {
              //node_modules(external import is not forbidden)
              return;
            }
            //alias not resolved
            absoluteImportPath = resolve.sync(rawImportPath, {
              basedir: path.dirname(absoluteCurrentFilePath),
              extensions: RESOLVE_EXTENSIONS,
            });
          }
        } catch (e) {
          //alias resolve failed
          context.report({
            node,
            messageId: "TransformedAliasResolveFailed",
          });
          return;
        }

        //check if current file is in the isolation path(outside of isolation path is not needed)
        const isolationIndex = absoluteIsolations.findIndex((isolation) => {
          const absoluteIsolationPath = isolation.isolationPath;
          const closedIsolationPath = absoluteIsolationPath + "/";
          return absoluteCurrentFilePath.startsWith(closedIsolationPath);
        });
        const matchedIsolation = absoluteIsolations[isolationIndex];
        if (!matchedIsolation) return;

        //check if the import path is in the allowed import paths
        const isAllowedImport = matchedIsolation.allowedPaths.some(
          (allowedPath) => {
            //check if the import path is the same as the allowed path
            const same = absoluteImportPath === allowedPath;
            const closedAllowedPath = allowedPath + "/";
            //check if the import path is a sub path of the allowed path
            const sub = absoluteImportPath.startsWith(closedAllowedPath);
            return same || sub;
          }
        );

        //check if the import path is in the global allowed import paths
        const isGlobalAllowedImport = absoluteGlobalAllowPaths.some(
          (allowedPath) => {
            //check if the import path is the same as the allowed path
            const same = absoluteImportPath === allowedPath;
            //add "/" to the allowed path for string comparison
            const closedAllowedPath = allowedPath + "/";
            //check if the import path is a sub path of the allowed path
            const sub = absoluteImportPath.startsWith(closedAllowedPath);
            return same || sub;
          }
        );
        const allowedImport = isAllowedImport || isGlobalAllowedImport;

        //report if the import path is not in the allowed import paths
        if (!allowedImport) {
          context.report({
            node,
            messageId: "IsolatedBarrelImportDisallowed",
          });
        }
      },
    };
  },
};

export { isolateBarrelFile };
