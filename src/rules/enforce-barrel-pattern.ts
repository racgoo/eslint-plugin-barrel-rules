import { TSESTree } from "@typescript-eslint/types";
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";

import path from "path";
import resolve from "resolve";
import { Glob } from "../utils/glob";
import { Alias } from "../utils/alias";
import {
  BARREL_ENTRY_POINT_FILE_NAMES,
  RESOLVE_EXTENSIONS,
} from "../utils/constants";

type Option = {
  //paths: paths that are enforced to be barrel pattern
  paths: string[];
  //baseDir: base directory of the project
  baseDir: string;
  //isolated: true -> only allowedPaths are allowed to be imported
  // isolated: boolean;
  //allowedImportPaths: paths that are allowed to be imported
  // allowedImportPaths: string[];
};
type TransformedAliasResolveFailedMessageId = "TransformedAliasResolveFailed";
type DirectImportMessageId = "DirectImportDisallowed";
type EmptyEslintConfigMessageId = "EmptyEslintConfig";

const enforceBarrelPattern: RuleModule<
  | DirectImportMessageId
  | TransformedAliasResolveFailedMessageId
  | EmptyEslintConfigMessageId,
  Option[]
> = {
  meta: {
    type: "problem",
    docs: {
      description: "Only barrel pattern imports are allowed in this module.",
    },
    schema: [
      {
        type: "object",
        properties: {
          paths: { type: "array", items: { type: "string" } },
          baseDir: { type: "string" },
        },
        required: ["paths", "baseDir"],
        additionalProperties: false,
      },
    ],
    messages: {
      TransformedAliasResolveFailed:
        "Transformed alias resolve failed. please check the alias config.",
      DirectImportDisallowed:
        "Please import from '{{matchedTargetPath}}'. Direct access to '{{rawImportPath}}' is not allowed. You must use the barrel pattern and only consume APIs exposed externally. This is to ensure encapsulation of internal logic and maintain module boundaries.",
      EmptyEslintConfig:
        "Please set the eslint config '{{property}}' to the eslint config. if you want to use this rule, please set the eslint config.",
    },
  },

  //default options(baseDir is current working directory. almost user execute eslint in project root)
  defaultOptions: [
    {
      paths: [],
      baseDir: process.cwd(),
    },
  ],
  create(context) {
    //extract options
    const option = context.options[0];
    if (!option) {
      return {
        Program(node) {
          const option = context.options[0];
          if (!option) {
            return context.report({
              node,
              messageId: "EmptyEslintConfig",
              data: {
                property: "{ path: Array<string>, baseDir: string }",
              },
            });
          }
        },
      };
    }
    const baseDir = option.baseDir;
    //get target paths(allowed wildcard with fast-glob)
    const absoluteTargetPaths = option.paths.flatMap((_path) => {
      return Glob.resolvePath(_path, baseDir);
    });

    function checker(
      node:
        | TSESTree.ImportDeclaration
        | TSESTree.ExportNamedDeclaration
        | TSESTree.ExportAllDeclaration
    ) {
      //check if the import is a source import(from external module)
      if (!node.source) {
        //not "from external" is passed
        return;
      }

      //get raw import path(ex: "../../../domains/test/hooks/test-hook")
      const rawImportPath = node.source.value;
      //get absolute current file path(each file)
      const absoluteCurrentFilePath = context.getFilename();
      //get resolved path
      let absoluteImportPath: string | null = null;
      //try to resolve absoluteImportPath with alias
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
          // alias resolve failed - check if it's external package
          if (
            (!rawImportPath.startsWith(".") &&
              !rawImportPath.startsWith("/")) ||
            rawImportPath.includes("/node_modules/")
          ) {
            // external package (ex: "react", "@emotion/react", or "../../node_modules/...") - not enforced
            return;
          }

          // try to resolve with relative path
          try {
            absoluteImportPath = resolve.sync(rawImportPath, {
              basedir: path.dirname(absoluteCurrentFilePath),
              extensions: RESOLVE_EXTENSIONS,
            });
          } catch (e) {
            // relative path resolve failed - might be external package or invalid path
            // ignore it (don't enforce barrel pattern for invalid paths)
            return;
          }
        }
      } catch (e) {
        // alias resolve failed - might be invalid path or external package
        // ignore it (don't enforce barrel pattern for invalid paths)
        return;
      }

      // This block separation is just for readability (start of enforce barrel pattern logic)
      {
        //matched latest target path for display
        let matchedLatestTargetPath: string | null = null;

        //check if the import path is invalid
        const invalidDirectedImport = absoluteTargetPaths.some(
          (absoluteTargetPath) => {
            const targetPathEntryPoints = BARREL_ENTRY_POINT_FILE_NAMES.map(
              (entry) => path.resolve(absoluteTargetPath, entry)
            );

            //add "/" to the target path for string comparison(ex: "src/domains/test2","src/domains/test3" can be catched with "test")
            const closedTargetPath = absoluteTargetPath + "/";

            //check if the import path is a target path entry point(targetted barrel pattern entry point)
            const targetPathEntryPointed =
              targetPathEntryPoints.includes(absoluteImportPath);

            //check if the import is in the enforce barrel
            const importedEnforceBarrelFile =
              absoluteImportPath.startsWith(closedTargetPath);

            //check if the current file is in the enforce barrel
            const currentFileInEnforceBarrel =
              absoluteCurrentFilePath.startsWith(closedTargetPath);

            //check if capsured logic in target is imported outside of the target path(ex: target is 'test', "src/domains/test/components/Test.tsx" is imported at  "src/pages/menu")
            const importedOutsideOfBarrel =
              !currentFileInEnforceBarrel && importedEnforceBarrelFile;

            //check if the import path is valid
            const invalidImported =
              !targetPathEntryPointed && importedOutsideOfBarrel;

            //store the matched latest target path
            if (invalidImported) {
              matchedLatestTargetPath = absoluteTargetPath;
            }
            return invalidImported;
          }
        );

        //report if the import path is invalid in some of the target paths
        if (invalidDirectedImport) {
          context.report({
            node,
            messageId: "DirectImportDisallowed",
            data: {
              rawImportPath,
              matchedTargetPath: matchedLatestTargetPath,
            },
          });
        }
      }
    }

    return {
      ExportNamedDeclaration(node: TSESTree.ExportNamedDeclaration) {
        //check if the export is a source export(to external module)
        return checker(node);
      },
      ExportAllDeclaration(node: TSESTree.ExportAllDeclaration) {
        //check if the export is a source export(to external module)
        return checker(node);
      },
      //check only import declaration(ESM)
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        return checker(node);
      },
    };
  },
};

export { enforceBarrelPattern };
