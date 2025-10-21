import { RuleTester } from "@typescript-eslint/rule-tester";
import { isolateBarrelFile } from "../../../src/rules/isolate-barrel-file";

const tester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
    },
  },
});

tester.run("isolate-barrel-file(in same barrel)", isolateBarrelFile, {
  valid: [
    {
      name: "import something in same barrel(short path)",
      code: "import { user } from '@features/user/test-use-case-2';",
      filename: __dirname + "/src/features/user/test-use-case-1.ts",
      options: [
        {
          isolations: [
            {
              path: "src/features/user",
              allowedPaths: [],
            },
          ],
          baseDir: __dirname,
          globalAllowPaths: [],
        },
      ],
    },
    {
      name: "import something in same barrel(long path)",
      code: "import { user } from '@features/user/directory-1/directory-2/directory-3/test-use-case-2';",
      filename: __dirname + "/src/features/user/directory-1/test-use-case-1.ts",
      options: [
        {
          isolations: [
            {
              path: "src/features/user",
              allowedPaths: [],
            },
          ],
          baseDir: __dirname,
          globalAllowPaths: [],
        },
      ],
    },
  ],
  invalid: [],
});

tester.run(
  "isolate-barrel-file(import from outside of the barrel)",
  isolateBarrelFile,
  {
    valid: [
      {
        name: "import something in outside of the barrel(global allowed path)",
        code: "import { user } from '@features/user';",
        filename: __dirname + "/src/features/payment/test-use-case.ts",
        options: [
          {
            isolations: [
              {
                path: "src/features/payment",
                allowedPaths: [],
              },
            ],
            baseDir: __dirname,
            globalAllowPaths: ["src/features/user"],
          },
        ],
      },
      {
        name: "import something in outside of the barrel(global glob allowed path)",
        code: "import { user } from '@features/user';",
        filename: __dirname + "/src/features/payment/test-use-case.ts",
        options: [
          {
            isolations: [
              {
                path: "src/features/payment",
                allowedPaths: [],
              },
            ],
            baseDir: __dirname,
            globalAllowPaths: ["src/features/*"],
          },
        ],
      },
      {
        name: "import something in outside of the barrel(isolated allowed path)",
        code: "import { user } from '@features/user';",
        filename: __dirname + "/src/features/payment/test-use-case.ts",
        options: [
          {
            isolations: [
              {
                path: "src/features/payment",
                allowedPaths: ["src/features/user"],
              },
            ],
            baseDir: __dirname,
            globalAllowPaths: [],
          },
        ],
      },
      {
        name: "import something in outside of the barrel(isolated glob allowed path)",
        code: "import { user } from '@features/user';",
        filename: __dirname + "/src/features/payment/test-use-case.ts",
        options: [
          {
            isolations: [
              {
                path: "src/features/payment",
                allowedPaths: ["src/features/*"],
              },
            ],
            baseDir: __dirname,
            globalAllowPaths: [],
          },
        ],
      },
    ],
    invalid: [
      {
        name: "import something in outside of the barrel(import directly)",
        code: "import { user } from '@features/user/test-use-case-2';",
        filename: __dirname + "/src/features/payment/test-use-case.ts",
        errors: [
          {
            messageId: "IsolatedBarrelImportDisallowed",
          },
        ],
        options: [
          {
            isolations: [
              {
                path: "src/features/payment",
                allowedPaths: [],
              },
            ],
            baseDir: __dirname,
            globalAllowPaths: [],
          },
        ],
      },
      {
        name: "import something in outside of the barrel(import barrel file)",
        code: "import { user } from '@features/user';",
        filename: __dirname + "/src/features/payment/test-use-case.ts",
        errors: [
          {
            messageId: "IsolatedBarrelImportDisallowed",
          },
        ],
        options: [
          {
            isolations: [
              {
                path: "src/features/payment",
                allowedPaths: [],
              },
            ],
            baseDir: __dirname,
            globalAllowPaths: [],
          },
        ],
      },
      {
        name: "import something in outside of the barrel(wrong allowed path)",
        code: "import { user } from '@features/user/test-use-case-2';",
        filename: __dirname + "/src/features/payment/test-use-case.ts",
        errors: [
          {
            messageId: "IsolatedBarrelImportDisallowed",
          },
        ],
        options: [
          {
            isolations: [
              {
                path: "src/features/payment",
                allowedPaths: ["src/features/product"],
              },
            ],
            baseDir: __dirname,
            globalAllowPaths: [],
          },
        ],
      },
    ],
  }
);
