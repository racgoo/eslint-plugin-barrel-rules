# 🛡️ eslint-plugin-barrel-rules

# **Advanced Barrel Pattern Enforcement for JavaScript/TypeScript Projects**

<div align="center">
  <img src="https://img.shields.io/badge/version-1.0.1-blue.svg" alt="Version"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License"/>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"/>
</div>

<div align="center">
  <img width="320" alt="Scry" src="https://github.com/user-attachments/assets/dc11d2d4-3896-4def-bf5f-e778086a3de8" />
</div>

Github: [https://github.com/racgoo/eslint-plugin-barrel-module](https://github.com/racgoo/eslint-plugin-barrel-module)

NPM: [https://github.com/racgoo/eslint-plugin-barrel-module](https://github.com/racgoo/eslint-plugin-barrel-module)

---

## 소개

**eslint-plugin-barrel-rules**는  
JavaScript/TypeScript 프로젝트에서 Barrel Pattern(배럴 패턴)을 강제하고, 모듈 경계와 캡슐화를 보장하는 고급 ESLint 플러그인입니다.

지정한 디렉토리(예: `src/domains/*`)의 내부 구현은  
오직 해당 디렉토리의 **index(배럴) 파일**을 통해서만 접근할 수 있도록 강제합니다.  
내부 파일을 직접 import하는 것을 차단하여  
**모듈화, 추상화, 유지보수성, 확장성**을 극대화합니다.

---

## 지원 환경

- Node.js (ES2015+)
- ES Modules(ESM)

---

## 주요 기능

- **Barrel Pattern 강제**  
  지정한 디렉토리의 index(배럴) 파일을 통해서만 import를 허용  
  (예: `import ... from "../domains/foo"`는 허용,  
  `import ... from "../domains/foo/components/Bar"`는 차단)

- **고성능 glob 매칭**  
  `src/domains/*`처럼 glob 패턴으로 여러 디렉토리 지정 가능

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

## 사용법

```js
import { fileURLToPath } from "url";
import path from "path";
import { enforceBarrelPattern } from "eslint-plugin-barrel-rules";

//ESM은 __dirname을 지원하지 않기에 직접 구현합니다.
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
          //Barrel Pattern을 강제할 디렉토리를 정의합니다(baseDir 기준으로 상대경로)
          paths: ["src/domains/*"],
          //paths들의 root경로를 지정합니다.
          baseDir: __dirname,
        },
      ],
    },
  },
];
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

- 더 다양한 모듈 경계/추상화 관련 룰 추가 예정

- **Alias/tsconfig 지원**  
  TypeScript `paths`, Vite `resolve.alias` 등 다양한 경로 매핑 완벽 지원 예정

- **Commonjs 지원**

---

## 문의

질문, 제안, 버그 리포트, 기여 모두 환영합니다!  
[[📬 send mail]](mailto:lhsung98@naver.com)
