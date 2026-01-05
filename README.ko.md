# 🛡️ eslint-plugin-barrel-rules

# **Advanced Barrel Pattern Enforcement for JavaScript/TypeScript Projects**

<div align="center">
  <img src="https://img.shields.io/badge/version-1.4.2-blue.svg" alt="Version"/>
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

> 💡 Tip:
>
> > 이 플러그인은 `node_modules`(외부 패키지)의 import는 제한하거나 검사하지 않습니다.  
> > 모든 규칙은 오직 프로젝트 내부(로컬 소스 파일) 경로의 import에만 적용됩니다.
>
> 코드 품질을 더욱 강화하고 싶다면, 이 플러그인과 함께 [eslint-plugin-import](https://github.com/import-js/eslint-plugin-import)의 `no-cycle` 룰을 사용하는 것을 추천합니다.  
> 이를 통해 프로젝트 내의 순환 참조(Import Cycle)도 효과적으로 감지하고 방지할 수 있습니다.

---

## 지원 환경

- ESLint 9
  > Flat config(eslint.config.js), TypeScript 지원 시 "typescript-eslint" config 사용 필요
- ESLint 8

  > Legacy config(.eslintrc.js), TypeScript 지원 시 "@typescript-eslint/parser"를 parser로 지정하고, "@typescript-eslint"를 plugin에 추가해야 함

- TypeScript Alias Import 지원
  > Import 구문에서 TypeScript 경로 별칭(예: `@ts/barrel/inner`)을 `tsconfig.json` 기반으로 자동 해석합니다.  
  > 단, ESLint 플러그인 설정에서는 alias 사용 불가능 - 상대경로나 절대경로만 사용하세요.
- Node.js (ES2015 이상)
- ES 모듈, CommonJS 모듈 모두 지원

---

## 주요 기능

- **Barrel Pattern 강제**  
  지정한 디렉토리의 index(배럴) 파일을 통해서만 import를 허용  
  (예: `import ... from "../domains/foo"`는 허용,  
  `import ... from "../domains/foo/components/Bar"`는 차단)

- **Isolation Barrel Module**  
  지정한 barrel path 외부의 모듈이 내부 파일을 직접 import하지 못하도록 막을 수 있습니다.

- **와일드카드 import/export 방지**  
  `import * as foo from "module"` 또는 `export * from "./module"`과 같은 와일드카드(네임스페이스) import/export를 금지합니다.  
  명시적인 이름 기반 import/export만 허용하여 트리쉐이킹과 코드 명확성을 높입니다.

- **고성능 glob 매칭**  
  `src/domains/*`처럼 glob 패턴으로 여러 디렉토리 지정 가능

---

## 규칙(Rules)

1. **enforce-barrel-pattern** (isolate 옵션이 제거되었습니다.)
   모듈 import 시 barrel 패턴을 강제합니다.  
   지정한 barrel 파일(예: index.ts)로만 import를 허용하고, 내부 모듈에 대한 직접 접근을 차단합니다.

   - **옵션:**
     - `paths`: barrel 패턴을 적용할 디렉토리 목록(`baseDir` 기준 상대경로)
     - `baseDir`: `paths` 기준이 되는 베이스 디렉토리 (기본값: ESLint 실행 디렉토리)

2. **no-wildcard**  
   `import * as foo from "module"` 또는 `export * from "./module"`과 같은 와일드카드(네임스페이스) import/export를 금지합니다.  
   `enforce-barrel-pattern` 룰과 함께 사용하는 것을 적극 추천합니다.  
   두 룰을 함께 적용하면 모듈 경계를 엄격하게 지킬 수 있을 뿐만 아니라,  
   트리쉐이킹을 통한 성능 향상과 코드 추적 및 유지보수의 용이성까지 모두 얻을 수 있습니다.

3. **isolate-barrel-file** (isolated 기능을 새로운 룰로 제작했습니다.)
   모듈 import 시 barrel 패턴을 강제합니다.  
   지정한 barrel 파일(예: index.ts)로만 import를 허용하고, 내부 모듈에 대한 직접 접근을 차단합니다.
   - **옵션:**
     - `isolations(Array<{ path: string, allowedPaths: string[] }>)`: `path`와 `allowedPaths`로 구성된 isolation을 추가할 수 있습니다.
     - `baseDir`: `paths` 기준이 되는 베이스 디렉토리 (기본값: ESLint 실행 디렉토리)
     - `globalAllowedPaths` : 모든 isolations에 공통적으로 허용할 경로를 지정합니다(node_modules ... etc)

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

      //barrel-file 캡슐화
      "barrel-rules/enforce-barrel-pattern": [
        "error",
        {
          // encapsulation barrel file
          paths: ["src/pages/*", "src/features/*", "src/entities/*"],
          baseDir: __dirname,
        },
      ],

      //barrel file내부에서 외부 모듈 사용 제한
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

      // "*"를 사용한 불 분명한 import/export 방지
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
      //barrel-file 캡슐화
      "barrel-rules/enforce-barrel-pattern": [
        "error",
        {
          // encapsulation barrel file
          paths: ["src/pages/*", "src/features/*", "src/entities/*"],
          baseDir: __dirname,
        },
      ],

      //barrel file내부에서 외부 모듈 사용 제한
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

      // "*"를 사용한 불 분명한 import/export 방지
      "barrel-rules/no-wildcard": ["error"],
    },
  },
]);
```

---

## 예시

### 1. 배럴 내부파일 직접 접근

```ts
file(src / index.ts);

// ❌ 내부 파일 직접 import 차단
import { Test } from "../domains/foo/components/Test";

// ✅ barrel(index) 파일을 통한 import만 허용
import { Test } from "../domains/foo";
```

### 2. 격리된 모듈 접근 (TypeScript Alias 지원)

```ts
file(src / domains / foo / index.ts);

// ❌ 격리된 barrel로의 외부 import 차단 (alias 사용해도 차단)
// barrel 외부에서 접근 (bar의 경로는 src/domains/bar/)
import { Test } from "@domains/bar/components/Test";

// ✅ 같은 barrel 내부에서의 import는 허용 (alias 지원)
import { Hook } from "@domains/foo/hooks/useTest"; // 같은 barrel 내부에서
import { Utils } from "./utils/helper"; // 같은 barrel 내부에서

// ✅ 허용된 import 경로는 사용 가능 (alias 지원)
import { SharedUtil } from "@shared/utils"; // allowedImportPaths에 "src/shared/*"가 있는 경우
```

---

## 앞으로의 계획

- 더 다양한 모듈 경계/추상화 관련 룰 추가 예정 (~Ing)
- **Alias/tsconfig 지원: TypeScript의 paths 맵핑 완벽하게 지원** (OK)
- **CJS 지원** (OK)
- **ESLint 8 지원** (OK)
- **번들 플러그인(플러그인 내 모든 기능 통합)** (OK)
- **잘못된 경로 설정 검증 기능** (OK)
- **와일드카드 import/export 제한 규칙** (OK)
- **지정한 Barrel 경로 격리** (OK)
- **빈 디렉토리 지원** (예: 'src/shares/\*'가 설정되어 있어도 shares 디렉토리가 비어있어도 됨) (OK)

---

## 문의

질문, 제안, 버그 리포트, 기여 모두 환영합니다!  
[[📬 send mail lhsung98@naver.com]](mailto:lhsung98@naver.com)
