# 🛡️ eslint-plugin-barrel-rules

# **Advanced Barrel Pattern Enforcement for JavaScript/TypeScript Projects**

<div align="center">
  <img src="https://img.shields.io/badge/version-1.1.0-blue.svg" alt="Version"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"/>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"/>
</div>

<div align="center">
  <img width="320" alt="Scry" src="https://github.com/user-attachments/assets/dc11d2d4-3896-4def-bf5f-e778086a3de8" />
</div>

Github: [https://github.com/racgoo/eslint-plugin-barrel-rules](https://github.com/racgoo/eslint-plugin-barrel-rules)

NPM: [https://www.npmjs.com/package/eslint-plugin-barrel-rules](https://www.npmjs.com/package/eslint-plugin-barrel-rules)

---

## 소개

**eslint-plugin-barrel-rules**는  
JavaScript/TypeScript 프로젝트에서 Barrel Pattern(배럴 패턴)을 강제하고, 모듈 경계와 캡슐화를 보장하는 고급 ESLint 플러그인입니다.

지정한 디렉토리(예: `src/domains/*`, `src/domains/cart`)의 내부 구현은  
오직 해당 디렉토리의 **index(배럴) 파일**을 통해서만 접근할 수 있도록 강제합니다.  
내부 파일을 직접 import하는 것을 차단하여  
**모듈화, 추상화, 유지보수성, 확장성**을 극대화합니다.

---

## 지원 환경

- ESLint 9
  > Flat config(eslint.config.js), TypeScript 지원 시 "typescript-eslint" config 사용 필요
- ESLint 8
  > Legacy config(.eslintrc.js), TypeScript 지원 시 "@typescript-eslint/parser"를 parser로 지정하고, "@typescript-eslint"를 plugin에 추가해야 함
- Node.js (ES2015 이상)
- ES 모듈, CommonJS 모듈 모두 지원

---

## 주요 기능

- **Barrel Pattern 강제**  
  지정한 디렉토리의 index(배럴) 파일을 통해서만 import를 허용  
  (예: `import ... from "../domains/foo"`는 허용,  
  `import ... from "../domains/foo/components/Bar"`는 차단)

- **고성능 glob 매칭**  
  `src/domains/*`처럼 glob 패턴으로 여러 디렉토리 지정 가능

---

## 규칙(Rules)

1. **enforce-barrel-pattern**  
   모듈 임포트 시 배럴 패턴(Barrel Pattern)을 강제합니다.  
   지정한 배럴 파일을 통해서만 임포트가 가능하며, 내부 모듈에 직접 접근하는 것을 방지합니다.

   - **옵션:**
     - `paths`: 배럴 패턴으로 보호할 디렉토리 경로(`baseDir` 기준 상대경로)
     - `baseDir` (선택): `paths` 해석 기준이 되는 디렉토리. 기본값은 ESLint 실행 위치입니다.

2. **no-wildcard**  
   `import * as foo from "module"`, `export * from "./module"`과 같은 와일드카드(네임스페이스) import/export를 금지합니다.  
   트리쉐이킹 및 코드 명확성을 위해 반드시 개별(named) import/export만 허용합니다.

---

## 설치

```bash
npm i eslint-plugin-barrel-rules --save-dev
# or
yarn add -D eslint-plugin-barrel-rules
# or
pnpm add -D eslint-plugin-barrel-rules
```

---

## Eslint8 사용법

```js
file(.eslintrc.js)

module.exports = {
  ...(any other options)
  // 타입스크립트를 사용할 경우 "@typescript-eslint/parser", "@typescript-eslint"를 설치하고 설정해 주세요.
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "barrel-rules"],
  rules: {
    "barrel-rules/enforce-barrel-pattern": [
      "error",
      {
        // 배럴 파일로 보호할 디렉토리의 경로입니다. baseDir을 기준으로 상대 경로로 설정합니다.
        paths: ["src/typescript/barrel/*", "src/javascript/barrel/*"],
        // (옵션) 설정하지 않으면 기본값은 ESLint를 실행한 위치(작업 디렉토리)입니다.
        // 예: `npx eslint .`처럼 실행하면, 실행 시점의 현재 디렉토리가 기본값이 됩니다.
        baseDir: __dirname,
      },
    ],
    // import * 또는 export * 금지
    "barrel-rules/no-wildcard": ["error"],
  },
};
```

---

## Eslint9 사용법

```js
file(eslintrc.config.js);

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import barrelRules from "eslint-plugin-barrel-rules";
// ESM에서 __dirname을 사용하기 위한 코드
import { fileURLToPath } from "url";
import path from "path";
// 커스텀 __dirname 생성
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 타입스크립트 사용 시 필요
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    // (다른 옵션들 추가 가능)
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
    },
    // barrel-rules 플러그인만 추가하면 됩니다.
    plugins: {
      "barrel-rules": barrelRules,
    },
    // barrel-rules에 대한 설정만 추가하면 됩니다.
    rules: {
      "barrel-rules/enforce-barrel-pattern": [
        "error",
        {
          // 배럴 파일로 보호할 디렉토리의 경로입니다. baseDir을 기준으로 상대 경로로 설정합니다.
          paths: ["src/typescript/barrel/*"],
          // (옵션) 설정하지 않으면 기본값은 ESLint를 실행한 위치(작업 디렉토리)입니다.
          // 예: `npx eslint .`처럼 실행하면, 실행 시점의 현재 디렉토리가 기본값이 됩니다.
          baseDir: __dirname,
        },
      ],
      // import * 또는 export * 금지
      "barrel-rules/no-wildcard": ["error"],
    },
  },
]);
```

---

## 예시

```ts
// ❌ 내부 파일을 직접 import하면 차단됩니다.
import { Test } from "../domains/foo/components/Test";

// ✅ 반드시 배럴(index) 파일을 통해 import해야 합니다.
import { Test } from "../domains/foo";
```

---

## 앞으로의 계획

- 더 다양한 모듈 경계/추상화 관련 룰 추가 예정 (~Ing)
- Alias/tsconfig 지원: TypeScript의 paths, Vite의 resolve.alias, 기타 커스텀 경로 매핑을 완벽하게 지원 (~Ing)
- **CJS 지원** (OK)
- **ESLint 8 지원** (OK)
- **번들 플러그인(플러그인 내 모든 기능 통합)** (OK)
- **잘못된 경로 설정 검증 기능** (OK)
- **와일드카드 import/export 제한 규칙** (OK)

---

## 문의

질문, 제안, 버그 리포트, 기여 모두 환영합니다!  
[[📬 send mail lhsung98@naver.com]](mailto:lhsung98@naver.com)
