# ESLint Barrel Rules Tests

이 디렉토리는 ESLint Barrel Rules 플러그인의 테스트 코드를 포함합니다.

## 테스트 구조

```
tests/
├── __fixtures__/           # 테스트용 파일들
│   ├── enforce-barrel-pattern/
│   │   ├── valid/         # 올바른 사용 예시
│   │   └── invalid/       # 잘못된 사용 예시
│   ├── isolate-barrel-file/
│   │   ├── valid/
│   │   └── invalid/
│   └── no-wildcard/
│       ├── valid/
│       └── invalid/
├── enforce-barrel-pattern.test.ts
├── isolate-barrel-file.test.ts
├── no-wildcard.test.ts
├── integration.test.ts
└── setup.ts
```

## 테스트 실행

```bash
# 모든 테스트 실행
pnpm test

# 테스트 감시 모드
pnpm test:watch

# 커버리지 포함 테스트
pnpm test:coverage
```

## 테스트 케이스 설명

### enforce-barrel-pattern

- **목적**: 베럴 패턴 강제
- **테스트**: 직접 임포트 대신 베럴 파일(index.ts)을 통한 임포트만 허용

### isolate-barrel-file

- **목적**: 베럴 파일 내부에서 외부 임포트 제한
- **테스트**: 허용된 경로와 글로벌 허용 경로만 임포트 가능

### no-wildcard

- **목적**: 와일드카드 임포트/익스포트 금지
- **테스트**: `import * as`와 `export *` 사용 금지

## 테스트 작성 가이드

1. **Valid 케이스**: 룰을 위반하지 않는 올바른 코드
2. **Invalid 케이스**: 룰을 위반하는 잘못된 코드와 예상되는 에러 메시지
3. **픽스처 파일**: 실제 파일 구조를 시뮬레이션하는 테스트용 파일들
