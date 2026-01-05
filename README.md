# 🛡️ eslint-plugin-barrel-rules

# **Advanced Barrel Pattern Enforcement for JavaScript/TypeScript Projects**

<div align="center">
  <img src="https://img.shields.io/badge/version-1.4.4-blue.svg" alt="Version"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"/>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"/>
</div>

<div align="center">
  <img width="320" alt="Scry" src="https://github.com/user-attachments/assets/dc11d2d4-3896-4def-bf5f-e778086a3de8" />
</div>

Github: [https://github.com/racgoo/eslint-plugin-barrel-rules](https://github.com/racgoo/eslint-plugin-barrel-rules)

NPM: [https://www.npmjs.com/package/eslint-plugin-barrel-rules](https://www.npmjs.com/package/eslint-plugin-barrel-rules)

🇰🇷 [README (Korean)](./README.ko.md)

---

## Introduction

**eslint-plugin-barrel-rules** is an advanced ESLint plugin  
that enforces the Barrel Pattern in JavaScript/TypeScript projects,  
ensuring strict module boundaries and encapsulation.

You can specify directories (e.g., `src/domains/*`, `src/domains/cart`) where  
internal implementation details must only be accessed via the directory’s **index (barrel) file**.  
Direct imports from internal files are blocked, maximizing  
**modularity, abstraction, maintainability, and scalability**.

> 💡 Tip:  
> This plugin does not restrict or track imports from `node_modules` (external packages).  
> The rules only apply to imports of internal (local source file) paths within your project.
>
> For even stronger code quality, we recommend using the `no-cycle` rule from [eslint-plugin-import](https://github.com/import-js/eslint-plugin-import) together with this plugin.  
> This allows you to detect and prevent circular dependencies (import cycles) in your project.

---

## Supports

- ESLint 9
  > Flat config(eslint.config.js), for TypeScript support, use the "typescript-eslint" config
- ESLint 8
  > Legacy config(.eslintrc.js), for TypeScript support, set "@typescript-eslint/parser" as the parser and add "@typescript-eslint" as a plugin
- TypeScript Alias Import Support
  > Automatically resolves TypeScript path aliases (e.g., `@ts/barrel/inner`) in import statements based on your `tsconfig.json`.  
  > Note: ESLint plugin configuration does not support aliases - use relative or absolute paths only.
- Node.js (ES2015+)
- Supports both ES Modules and CommonJS

---

## Features

- **Barrel Pattern Enforcement**  
  Only allows imports from the index (barrel) file of specified directories  
  (e.g., `import ... from "../domains/foo"` is allowed,  
  but `import ... from "../domains/foo/components/Bar"` is blocked)

- **Isolation Barrel Module**  
  You can prevent modules outside the specified barrel path from directly importing internal files.  
  By enabling `isolate-barrel-file`, only files within the same barrel path can freely import each other.  
  Any import from outside the enforced barrel path is completely blocked, even if it tries to import via the barrel (index) file.  
  If you want to allow specific shared imports, you can use the `allowedPaths` or `globalAllowedPaths` option.

- **Prevent Wildcard Import/Export**  
  Disallows wildcard (namespace) imports and exports such as `import * as foo from "module"` or `export * from "./module"`.  
  This enforces the use of named imports/exports for better tree-shaking and code clarity.

- **High-performance glob matching**  
  Specify multiple directories using glob patterns like `src/domains/*`

---

## Rules

1. **enforce-barrel-pattern** (Isolation is exracted as new rule :))
   Enforces the barrel pattern for module imports.  
   Only allows imports from designated barrel files and prevents direct access to internal modules.

   - **Options:**
     - `paths`: The directories to be protected by the barrel pattern (relative to `baseDir`).
     - `baseDir`: The base directory for resolving `paths`. Defaults to the ESLint execution directory.

2. **no-wildcard**  
   Disallows wildcard (namespace) imports such as `import * as foo from "module"` or `export * from "./module"`.  
   We highly recommend enabling this rule together with the `enforce-barrel-pattern` rule.  
   Using both rules together not only enforces strict module boundaries,  
   but also improves performance through better tree-shaking and makes code tracing and maintenance much easier.

3. **isolate-barrel-file** (New Rules!!!)
   Only files within the same barrel path can import each other, and any import from outside the barrel path is completely blocked (even via the barrel file).
   You can allow specific shared import paths by using the `allowedPaths` option.
   - **Options:**
     - `isolations(Array<{ path: string, allowedPaths: string[] }>)`: If you set isolation path, blocks all imports from outside the barrel path, even via the barrel file. Only allows imports within the same barrel path or from `allowedPaths` or `globalAllowedPaths`.
     - `baseDir`: The base directory for resolving `paths`. Defaults to the ESLint execution directory.
     - `globalAllowedPaths` : Array of paths that are allowed to be imported directly, even in isolation mode.

---

## Install

```bash
npm i eslint-plugin-barrel-rules --save-dev
# or
yarn add -D eslint-plugin-barrel-rules
# or
pnpm add -D eslint-plugin-barrel-rules
```

---

## Eslint8 Usage

```js
file(.eslintrc.js)

module.exports = {
  ...(any other options)
  //if you use typescript, needs "@typescript-eslint/parser", "@typescript-eslint" install and setup plz..
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "barrel-rules"],
  rules: {

   //enforce barrel capsuling
      "barrel-rules/enforce-barrel-pattern": [
        "error",
        {
          // encapsulation barrel file
          paths: ["src/pages/*", "src/features/*", "src/entities/*"],
          baseDir: __dirname,
        },
      ],

      //protect barrel file from outside module
      "barrel-rules/isolate-barrel-file": [
        "error",
        {
          //isolation options
          isolations: [
            {
              path: "src/pages/*",
              allowedPaths: ["src/features/*", "src/entities/*"],
            },
            {
              path: "src/features/*",
              allowedPaths: ["src/entities/*"],
            },
            {
              path: "src/entities/*",
              allowedPaths: [],
            },
          ],
          baseDir: __dirname,
          globalAllowPaths: ["src/shares/*", "node_modules/*"],
        },
      ],

      // protect wildcard import/export
      "barrel-rules/no-wildcard": ["error"],

  },
};
```

---

## Eslint9 Usage

```js
file(eslintrc.config.js);

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import barrelRules from "eslint-plugin-barrel-rules";
//for __dirname in ESM
import { fileURLToPath } from "url";
import path from "path";
//custom __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//typescript-config (if you use typescript, needs it)
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    ...(any other options)
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
    },
    //just set barrle-rules plugin
    plugins: {
      "barrel-rules": barrelRules,
    },
    //just set your setting for barrel-rules
    rules: {

      //enforce barrel capsuling
      "barrel-rules/enforce-barrel-pattern": [
        "error",
        {
          // encapsulation barrel file
          paths: ["src/pages/*", "src/features/*", "src/entities/*"],
          baseDir: __dirname,
        },
      ],

      //protect barrel file from outside module
      "barrel-rules/isolate-barrel-file": [
        "error",
        {
          //isolation options
          isolations: [
            {
              path: "src/pages/*",
              allowedPaths: ["src/features/*", "src/entities/*"],
            },
            {
              path: "src/features/*",
              allowedPaths: ["src/entities/*"],
            },
            {
              path: "src/entities/*",
              allowedPaths: [],
            },
          ],
          baseDir: __dirname,
          globalAllowPaths: ["src/shares/*"],
        },
      ],

      // protect wildcard import/export
      "barrel-rules/no-wildcard": ["error"],

    },
  },
]);
```

---

## Examples

### 1. Direct Access

```ts
file(src / index.ts);

// ❌ Direct import from internal file is blocked
import { Test } from "../domains/foo/components/Test";

// ✅ Must import via the barrel (index) file
import { Test } from "../domains/foo";
```

### 2. Isolated Module Access (with TypeScript Alias Support)

```ts
file(src / domains / foo / index.ts);

// ❌ External import to isolated barrel is blocked (even with alias)
// from outside barrel (bar's path is src/domains/bar/)
import { Test } from "@domains/bar/components/Test";

// ✅ Internal imports within same barrel are allowed (alias supported)
import { Hook } from "@domains/foo/hooks/useTest"; // from inside same barrel
import { Utils } from "./utils/helper"; // from inside same barrel

// ✅ Allowed import paths are permitted (alias supported)
import { SharedUtil } from "@shared/utils"; // if "src/shared/*" is in allowedPaths or globalAllowedPaths
```

---

## Future Work

- More rules for module boundaries and abstraction (~Ing)

- **Alias/tsconfig Support**  
  Fully supports TypeScript `paths` (OK)
- **CJS Support** (OK)
- **Eslint8 Support** (OK)
- **Bundle Plugin(capsure any features in plugin)**
  (OK)
- **Wrong Path Setup Validator** (OK)
- **Wildcard Import/Export Protection Rule** (OK)
- **Isolation Barrel Module** (OK)
- **Empty Directory Support** (e.g., 'src/shares/\*' can be configured even if the shares directory is empty) (OK)

---

## Contact

Questions, suggestions, bug reports, and contributions are welcome!  
[[📬 send mail lhsung98@naver.com]](mailto:lhsung98@naver.com)
