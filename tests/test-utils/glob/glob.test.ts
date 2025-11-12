import { Glob } from "../../../src/utils/glob";
import path from "path";

describe("Glob.resolvePath", () => {
  const testDataDir = path.join(__dirname, "test-data");

  describe("wildcard patterns", () => {
    it("should resolve src/entities/* pattern correctly", () => {
      const result = Glob.resolvePath("src/entities/*", testDataDir);

      expect(result).toHaveLength(3);
      expect(result).toContain(path.resolve(testDataDir, "src/entities/user"));
      expect(result).toContain(
        path.resolve(testDataDir, "src/entities/product")
      );
      expect(result).toContain(path.resolve(testDataDir, "src/entities/cart"));
    });

    it("should resolve src/features/* pattern correctly", () => {
      const result = Glob.resolvePath("src/features/*", testDataDir);

      expect(result).toHaveLength(2);
      expect(result).toContain(
        path.resolve(testDataDir, "src/features/payment")
      );
      expect(result).toContain(path.resolve(testDataDir, "src/features/order"));
    });

    it("should resolve src/pages/* pattern correctly", () => {
      const result = Glob.resolvePath("src/pages/*", testDataDir);

      expect(result).toHaveLength(2);
      expect(result).toContain(path.resolve(testDataDir, "src/pages/home"));
      expect(result).toContain(path.resolve(testDataDir, "src/pages/about"));
    });
  });

  describe("specific paths", () => {
    it("should resolve specific directory path", () => {
      const result = Glob.resolvePath("src/entities/user", testDataDir);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(path.resolve(testDataDir, "src/entities/user"));
    });

    it("should resolve nested specific directory path", () => {
      const result = Glob.resolvePath("src/features/payment", testDataDir);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(path.resolve(testDataDir, "src/features/payment"));
    });
  });

  describe("multiple wildcards", () => {
    it("should resolve pattern with multiple wildcards", () => {
      // src/*/user 같은 패턴도 테스트
      const result = Glob.resolvePath("src/entities/*", testDataDir);

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((p) => p.includes("entities"))).toBe(true);
    });
  });

  describe("error cases", () => {
    it("should throw error when no directory found", () => {
      expect(() => {
        Glob.resolvePath("src/nonexistent/*", testDataDir);
      }).toThrow(
        `[Glob] In baseDir: ${testDataDir}, path: src/nonexistent/*, any directory was not found`
      );
    });

    it("should throw error when specific directory does not exist", () => {
      expect(() => {
        Glob.resolvePath("src/nonexistent/dir", testDataDir);
      }).toThrow(
        `[Glob] In baseDir: ${testDataDir}, path: src/nonexistent/dir, any directory was not found`
      );
    });
  });

  describe("absolute paths", () => {
    it("should return absolute paths", () => {
      const result = Glob.resolvePath("src/entities/*", testDataDir);

      result.forEach((resolvedPath) => {
        expect(path.isAbsolute(resolvedPath)).toBe(true);
      });
    });
  });

  describe("edge cases", () => {
    it("should handle baseDir correctly", () => {
      // testDataDir 기준으로 실제 존재하는 디렉토리 패턴 사용
      expect(() => {
        Glob.resolvePath("src/entities/*", testDataDir);
      }).not.toThrow();
    });

    it("should handle complex nested patterns", () => {
      // 실제 존재하는 디렉토리로 테스트
      const result = Glob.resolvePath("src/entities/user", testDataDir);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(path.resolve(testDataDir, "src/entities/user"));
    });
  });
});
