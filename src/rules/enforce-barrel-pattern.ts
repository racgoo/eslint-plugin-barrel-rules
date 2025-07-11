import { TSESTree } from "@typescript-eslint/utils";
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";
import path from "path";
import resolve from "resolve";
import fastGlob from "fast-glob";

type Options = [{ paths: string[]; baseDir: string }];
type MessageIds = "DirectImportDisallowed";

const enforceBarrelPattern: RuleModule<MessageIds, Options> = {
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
        additionalProperties: false,
      },
    ],
    messages: {
      DirectImportDisallowed:
        "Please import from '{{matchedTargetPath}}'. Direct access to '{{rawImportPath}}' is not allowed. You must use the barrel pattern and only consume APIs exposed externally. This is to ensure encapsulation of internal logic and maintain module boundaries.",
    },
  },
  //default options(baseDir is current working directory. almost user execute eslint in project root)
  defaultOptions: [{ paths: [], baseDir: process.cwd() }],
  create(context) {
    //extract options
    const options = context.options[0];
    const baseDir = options.baseDir;

    //get target paths(allowed wildcard with fast-glob)
    const targetPaths = options.paths.flatMap((_path) =>
      fastGlob.sync(_path, {
        cwd: baseDir,
        onlyDirectories: true,
        absolute: true,
      })
    );

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
          //resolve import path
          absoluteImportPath = resolve.sync(rawImportPath, {
            basedir: path.dirname(absoluteCurrentFilePath),
            extensions: [
              ".ts",
              ".tsx",
              ".js",
              ".jsx",
              ".json",
              ".d.ts",
              ".mjs",
              ".cjs",
            ],
          });
        } catch (e) {
          //not found
          return;
        }

        //matched latest target path for display
        let matchedLatestTargetPath: string | null = null;

        //check if the import path is invalid
        const invalidDirectedImport = targetPaths.some((targetPath) => {
          const targetPathEntryPoints = [
            "index.ts",
            "index.tsx",
            "index.js",
            "index.jsx",
            "index.cjs",
            "index.mjs",
            "index.d.ts",
          ].map((entry) => path.resolve(targetPath, entry));

          //add "/" to the target path for string comparison(ex: "src/domains/test2","src/domains/test3" can be catched with "test")
          const closedTargetPath = targetPath + "/";

          //check if the import path is a target path entry point(targetted barrel pattern entry point)
          const targetPathEntryPointed =
            targetPathEntryPoints.includes(absoluteImportPath);

          //check if capsured logic in target is imported outside of the target path(ex: target is 'test', "src/domains/test/components/Test.tsx" is imported at  "src/pages/menu")
          const importedOutsideOfTargetPath =
            !absoluteCurrentFilePath.startsWith(closedTargetPath) &&
            absoluteImportPath.startsWith(closedTargetPath);

          //check if the import path is valid
          const invalidImported =
            !targetPathEntryPointed && importedOutsideOfTargetPath;

          //store the matched latest target path
          if (invalidImported) {
            matchedLatestTargetPath = targetPath;
          }
          return invalidImported;
        });

        //report if the import path is invalid in some of the target paths
        if (invalidDirectedImport) {
          context.report({
            node,
            messageId: "DirectImportDisallowed",
            data: { rawImportPath, matchedTargetPath: matchedLatestTargetPath },
          });
        }
      },
    };
  },
};

export { enforceBarrelPattern };
