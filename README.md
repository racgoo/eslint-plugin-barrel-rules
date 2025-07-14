# 🛡️ eslint-plugin-barrel-rules

# **Advanced Barrel Pattern Enforcement for JavaScript/TypeScript Projects**

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.4-blue.svg" alt="Version"/>
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

---

## Supports

- ESLint 9
  > Flat config(eslint.config.js), for TypeScript support, use the "typescript-eslint" config
- ESLint 8
  > Legacy config(.eslintrc.js), for TypeScript support, set "@typescript-eslint/parser" as the parser and add "@typescript-eslint" as a plugin
- Node.js (ES2015+)
- Supports both ES Modules and CommonJS

---

## Features

- **Barrel Pattern Enforcement**  
  Only allows imports from the index (barrel) file of specified directories  
  (e.g., `import ... from "../domains/foo"` is allowed,  
  but `import ... from "../domains/foo/components/Bar"` is blocked)

- **High-performance glob matching**  
  Specify multiple directories using glob patterns like `src/domains/*`

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
    "barrel-rules/enforce-barrel-pattern": [
      "error",
      {
        // The path to the directory that should be protected by using a barrel file. This path is relative to baseDir.
        paths: ["src/typescript/barrel/*", "src/javascript/barrel/*"],
        // Optional config. The default value is the directory where ESLint is executed.
// For example, if you run `npx eslint .`, the default will be the current working directory at the time of execution.
        baseDir: __dirname,
      },
    ],
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
      "barrel-rules/enforce-barrel-pattern": [
        "error",
        {
          // The path to the directory that should be protected by using a barrel file. This path is relative to baseDir.
          paths: ["src/typescript/barrel/*"],
          // Optional config. The default value is the directory where ESLint is executed.
          // For example, if you run `npx eslint .`, the default will be the current working directory at the time of execution.
          baseDir: __dirname,
        },
      ],
    },
  },
]);
```

---

## Example

```ts
// ❌ Direct import from internal file is blocked
import { Test } from "../domains/foo/components/Test";

// ✅ Must import via the barrel (index) file
import { Test } from "../domains/foo";
```

---

## Future Work

- More rules for module boundaries and abstraction

- **Alias/tsconfig Support**  
  Fully supports TypeScript `paths`, Vite `resolve.alias`, and other custom path mappings

- **CJS Support** (OK)
- **Eslint8 Support** (OK)
- **Bundle Plugin(capsure any features in plugin)**
  (OK)
- **Wrong Path Setup Validator** (OK)

---

## Contact

Questions, suggestions, bug reports, and contributions are welcome!  
[[📬 send mail lhsung98@naver.com]](mailto:lhsung98@naver.com)
