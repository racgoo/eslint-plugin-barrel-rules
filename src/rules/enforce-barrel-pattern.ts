import { TSESTree } from "@typescript-eslint/utils";
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";
import path from "path";
import resolve from "resolve";
import { Glob } from "../utils/glob";
import { Alias } from "../utils/alias";

const BARREL_ENTRY_POINT_FILE_NAMES = [
  "index.ts",
  "index.tsx",
  "index.js",
  "index.jsx",
  "index.cjs",
  "index.mjs",
  "index.d.ts",
] as const;

const RESOLVE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".d.ts",
  ".mjs",
  ".cjs",
];

type Option = {
  //paths: paths that are enforced to be barrel pattern
  paths: string[];
  //baseDir: base directory of the project
  baseDir: string;
  //isolated: true -> only allowedPaths are allowed to be imported
  isolated: boolean;
  //allowedImportPaths: paths that are allowed to be imported
  allowedImportPaths: string[];
};

type DirectImportMessageId = "DirectImportDisallowed";
type IsolatedBarrelImportMessageId = "IsolatedBarrelImportDisallowed";

const enforceBarrelPattern: RuleModule<
  DirectImportMessageId | IsolatedBarrelImportMessageId,
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
          isolated: { type: "boolean" },
          allowedImportPaths: { type: "array", items: { type: "string" } },
        },
        required: ["paths"],
        additionalProperties: false,
      },
    ],
    messages: {
      DirectImportDisallowed:
        "Please import from '{{matchedTargetPath}}'. Direct access to '{{rawImportPath}}' is not allowed. You must use the barrel pattern and only consume APIs exposed externally. This is to ensure encapsulation of internal logic and maintain module boundaries.",
      IsolatedBarrelImportDisallowed:
        "This barrel file is isolated. external import is not allowed. if you want to import outside of the barrel file, please add 'allowedImportPaths' to the plugin options.",
    },
  },

  //default options(baseDir is current working directory. almost user execute eslint in project root)
  defaultOptions: [
    {
      paths: [],
      baseDir: process.cwd(),
      isolated: false,
      allowedImportPaths: [],
    },
  ],
  create(context) {
    //extract options
    const option = context.options[0];
    const baseDir = option.baseDir;
    //get target paths(allowed wildcard with fast-glob)
    const absoluteTargetPaths = option.paths.flatMap((_path) => {
      return Glob.resolvePath(_path, baseDir);
    });
    //get allowed import paths(when isolated is true, only allowedImportPaths are allowed to be imported)
    const allowedImportPaths = option.allowedImportPaths.flatMap((_path) => {
      return Glob.resolvePath(_path, baseDir);
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
            //alias not resolved
            absoluteImportPath = resolve.sync(rawImportPath, {
              basedir: path.dirname(absoluteCurrentFilePath),
              extensions: RESOLVE_EXTENSIONS,
            });
          }
        } catch (e) {
          //not found
          return;
        }

        //enforce barrel pattern code block
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
              const importedOutsideOfTargetPath =
                !currentFileInEnforceBarrel && importedEnforceBarrelFile;

              //check if the import path is valid
              const invalidImported =
                !targetPathEntryPointed && importedOutsideOfTargetPath;

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

        //enforce isolated code block
        {
          if (option.isolated) {
            //check if current file is in the enforce barrel(outside of enforced barrel is not needed)
            const currentFileInEnforceBarrel = absoluteTargetPaths.some(
              (absoluteTargetPath) => {
                const closedTargetPath = absoluteTargetPath + "/";
                return absoluteCurrentFilePath.startsWith(closedTargetPath);
              }
            );

            //check if the import is in the same barrel
            const sameBarrel = absoluteTargetPaths.some(
              (absoluteTargetPath) => {
                const closedTargetPath = absoluteTargetPath + "/";
                //check if the import is in the enforce barrel
                const importedEnforceBarrelFile =
                  absoluteImportPath.startsWith(closedTargetPath);
                //check if the current file is in the enforce barrel
                const currentFileInEnforceBarrel =
                  absoluteCurrentFilePath.startsWith(closedTargetPath);
                return importedEnforceBarrelFile && currentFileInEnforceBarrel;
              }
            );

            //check if the import path is in the allowed import paths
            const allowedImportPath = allowedImportPaths.some(
              (allowedImportPath) => {
                return absoluteImportPath.startsWith(allowedImportPath);
              }
            );
            //report if the import path is not in the allowed import paths and not in the same barrel and current file is in the enforce barrel
            if (
              !allowedImportPath &&
              !sameBarrel &&
              currentFileInEnforceBarrel
            ) {
              context.report({
                node,
                messageId: "IsolatedBarrelImportDisallowed",
              });
            }
          }
        }
      },
    };
  },
};

export { enforceBarrelPattern };
