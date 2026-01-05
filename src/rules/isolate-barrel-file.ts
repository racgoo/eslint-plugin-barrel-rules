import { TSESTree } from "@typescript-eslint/types";
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";
import path from "path";
import resolve from "resolve";
import { Glob } from "../utils/glob";
import { Alias } from "../utils/alias";
import { RESOLVE_EXTENSIONS } from "../utils/constants";

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
        const rawImportPath = node.source.value;

        // Check if it contains "/node_modules/" - always allow these
        if (rawImportPath.includes("/node_modules/")) {
          return;
        }

        //get absolute current file path(each file)
        const absoluteCurrentFilePath = context.getFilename();
        //get resolved path
        let absoluteImportPath: string | null = null;

        //try to resolve with alias
        try {
          const aliasResult = Alias.resolvePath(
            rawImportPath,
            path.dirname(absoluteCurrentFilePath)
          );
          if (aliasResult.type === "success") {
            //alias resolved
            absoluteImportPath = aliasResult.absolutePath;

            // Even if alias resolved, check if it points to node_modules
            if (absoluteImportPath.includes("/node_modules/")) {
              // This is an external package, always allowed
              return;
            }
          } else {
            // Alias not resolved
            // Check if it's a bare import (external package from node_modules)
            // Bare imports don't start with "." or "/" and are not aliases
            // or they are in node_modules
            if (
              (!rawImportPath.startsWith(".") &&
                !rawImportPath.startsWith("/")) ||
              rawImportPath.includes("/node_modules/")
            ) {
              // This is an external package (e.g., "react", "@emotion/react")
              // External packages are always allowed
              return;
            }
            //alias not resolved - resolve relative path
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
        const matchedIsolationIndex = absoluteIsolations.findIndex(
          (isolation) => {
            const closedIsolationPath = isolation.isolationPath + "/";
            return absoluteCurrentFilePath.startsWith(closedIsolationPath);
          }
        );

        //get matched isolation
        const matchedIsolation = absoluteIsolations[matchedIsolationIndex];
        //if no matched isolation, skip
        if (!matchedIsolation) return;

        //check if the import path is allowed to be imported
        const isAllowedImport = [
          //global allowed import paths
          ...absoluteGlobalAllowPaths,
          //allowed import paths in the matched isolation
          ...matchedIsolation.allowedPaths,
        ].some((allowedPath) => {
          //check if the import path is the same as the allowed path
          const same = absoluteImportPath === allowedPath;
          const closedAllowedPath = allowedPath + "/";
          //check if the import path is a sub path of the allowed path
          const sub = absoluteImportPath.startsWith(closedAllowedPath);
          return same || sub;
        });

        //report if the import path is not in the allowed import paths
        if (!isAllowedImport) {
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
