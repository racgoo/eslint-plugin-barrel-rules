import { TSESTree } from "@typescript-eslint/types";
import type { RuleModule } from "@typescript-eslint/utils/ts-eslint";

type NoWildcardImportMessageId = "NoWildcardImport";
type NoExportAllMessageId = "NoExportAll";

const noWildcard: RuleModule<
  NoWildcardImportMessageId | NoExportAllMessageId,
  []
> = {
  meta: {
    type: "problem",
    docs: {
      description: "Wildcard (namespace) import is not allowed.",
    },
    schema: [],
    messages: {
      NoWildcardImport:
        "Wildcard import (`import * as ... from ...`) is not allowed. Please use named imports instead.",
      NoExportAll:
        "Export all (`export * from ...`) is not allowed. Please use named exports instead.",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node: TSESTree.ImportDeclaration) {
        //check if the import is a wildcard import
        const hasNamespaceImport = node.specifiers.some(
          (specifier) => specifier.type === "ImportNamespaceSpecifier"
        );
        if (hasNamespaceImport) {
          context.report({
            node,
            messageId: "NoWildcardImport",
          });
        }
      },
      ExportAllDeclaration(node: TSESTree.ExportAllDeclaration) {
        context.report({
          node,
          messageId: "NoExportAll",
        });
      },
    };
  },
};

export { noWildcard };
