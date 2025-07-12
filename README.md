# 🛡️ eslint-plugin-barrel-rules

# **Advanced Barrel Pattern Enforcement for JavaScript/TypeScript Projects**

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.3-blue.svg" alt="Version"/>
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

You can specify directories (e.g., `src/domains/*`) where  
internal implementation details must only be accessed via the directory’s **index (barrel) file**.  
Direct imports from internal files are blocked, maximizing  
**modularity, abstraction, maintainability, and scalability**.

---

## Supports

- ESLint 9 (Flat config, currently supported)
  > ⚠️ ESLint 8 (legacy config) support is planned for a future release!
- Node.js (ES2015+)
- Supports ES Modules (ESM)

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

## Usage

```js
import { fileURLToPath } from "url";
import path from "path";
import { enforceBarrelPattern } from "eslint-plugin-barrel-rules";

//ESM not support __dirname(custom __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    plugins: {
      "barrel-rules": {
        rules: {
          "enforce-barrel-pattern": enforceBarrelPattern,
        },
      },
    },
    rules: {
      "barrel-rules/enforce-barrel-pattern": [
        "error",
        {
          //Enforced directories
          paths: ["src/domains/*"],
          //BaseDir(root path, mutable)
          baseDir: __dirname,
        },
      ],
    },
  },
];
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

- **CJS Support**

---

## Contact

Questions, suggestions, bug reports, and contributions are welcome!  
[[📬 send mail]](mailto:lhsung98@naver.com)
