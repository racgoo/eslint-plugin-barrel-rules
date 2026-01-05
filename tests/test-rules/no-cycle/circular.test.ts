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

// Helper to manually initialize the import graph for testing
// This simulates the graph state after processing the first file
function setupGraphForCycleTest() {
  const userServicePath = path.resolve(
    __dirname,
    "src/features/user/user-service.ts"
  );
  const userRepositoryPath = path.resolve(
    __dirname,
    "src/features/user/user-repository.ts"
  );

  // Simulate that user-repository.ts has already been processed
  // and it imports user-service.ts
  if (!importGraph.has(userRepositoryPath)) {
    importGraph.set(userRepositoryPath, new Set());
  }
  const repoImports = importGraph.get(userRepositoryPath)!;

  // Resolve the import path from user-repository.ts to user-service.ts
  try {
    const resolvedPath = resolve.sync("./user-service", {
      basedir: path.dirname(userRepositoryPath),
      extensions: RESOLVE_EXTENSIONS,
    });
    repoImports.add(resolvedPath);
  } catch (e) {
    // If resolution fails, use the expected path
    repoImports.add(userServicePath);
  }

  return {
    userServicePath,
    userRepositoryPath,
  };
}

tester.run("no-cycle(circular dependency)", noCycle, {
  valid: [
    {
      name: "no circular dependency - simple import from entities",
      code: "import { user } from '../../entities/user';",
      filename: __dirname + "/src/features/user/user-service.ts",
      options: [],
    },
    {
      name: "no circular dependency - import from different feature",
      code: "import { paymentService } from '../payment/payment-service';",
      filename: __dirname + "/src/features/user/user-service.ts",
      options: [],
    },
    {
      name: "external import should not trigger cycle detection",
      code: "import { something } from 'some-external-package';",
      filename: __dirname + "/src/features/user/user-service.ts",
      options: [],
    },
    {
      name: "node_modules import should not trigger cycle detection",
      code: "import { something } from '../../../node_modules/some-package';",
      filename: __dirname + "/src/features/user/user-service.ts",
      options: [],
    },
    {
      name: "export from should not trigger cycle if no cycle exists",
      code: "export { user } from '../../entities/user';",
      filename: __dirname + "/src/features/user/user-service.ts",
      options: [],
    },
    {
      name: "multiple imports from same module should not create cycle",
      code: "import { a } from './file-a';\nimport { b } from './file-b';",
      filename: __dirname + "/src/features/user/user-service.ts",
      options: [],
    },
  ],
  invalid: [
    {
      name: "circular dependency - A imports B, B imports A (bidirectional cycle)",
      code: "import { userRepository } from './user-repository';",
      filename: __dirname + "/src/features/user/user-service.ts",
      errors: [
        {
          messageId: "CircularDependency",
        },
      ],
      options: [],
    },
  ],
});

// Setup graph for import chain test
const moduleBPath = path.resolve(__dirname, "src/features/user/module-b.ts");
const moduleCPath = path.resolve(__dirname, "src/features/user/module-c.ts");
try {
  const resolvedC = resolve.sync("./module-c", {
    basedir: path.dirname(moduleBPath),
    extensions: RESOLVE_EXTENSIONS,
  });
  importGraph.set(moduleBPath, new Set([resolvedC]));
} catch (e) {
  importGraph.set(moduleBPath, new Set([moduleCPath]));
}

tester.run("no-cycle(import chain without cycle)", noCycle, {
  valid: [
    {
      name: "import chain without cycle - A -> B -> C",
      code: "import { moduleB } from './module-b';",
      filename: __dirname + "/src/features/user/module-a.ts",
      options: [],
      // Note: module-b imports module-c, module-a imports module-b
      // This creates a chain but no cycle
    },
  ],
  invalid: [],
});

// Test payment/index <-> user/index cycle
tester.run("no-cycle(circular dependency - barrel files)", noCycle, {
  valid: [],
  invalid: [
    {
      name: "circular dependency via export - payment index exports user which creates cycle",
      code: "export { userService } from '../user';",
      filename: __dirname + "/src/features/payment/index.ts",
      errors: [
        {
          messageId: "CircularDependency",
        },
      ],
      options: [],
    },
  ],
});

// Setup graph for user-service <-> user-repository cycle test
// This simulates that user-repository.ts has already been processed
// and it imports user-service.ts, so when user-service.ts is processed,
// it will detect the bidirectional cycle
setupGraphForCycleTest();

// Setup graph for payment/index <-> user/index cycle test
function setupPaymentUserCycleTest() {
  const paymentIndexPath = path.resolve(
    __dirname,
    "src/features/payment/index.ts"
  );
  const userIndexPath = path.resolve(__dirname, "src/features/user/index.ts");

  // Simulate that user/index.ts has already been processed
  // and it imports from payment/index.ts
  if (!importGraph.has(userIndexPath)) {
    importGraph.set(userIndexPath, new Set());
  }
  const userIndexImports = importGraph.get(userIndexPath)!;

  // Resolve the import path from user/index.ts to payment/index.ts
  try {
    const resolvedPath = resolve.sync("../payment", {
      basedir: path.dirname(userIndexPath),
      extensions: RESOLVE_EXTENSIONS,
    });
    userIndexImports.add(resolvedPath);
  } catch (e) {
    // If resolution fails, use the expected path
    userIndexImports.add(paymentIndexPath);
  }
}

// Setup graph before running the payment/user cycle test
setupPaymentUserCycleTest();
