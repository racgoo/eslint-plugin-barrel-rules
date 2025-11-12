import { Alias } from "../../../src/utils/alias";
import path from "path";

describe("Alias.resolvePath", () => {
  const testDataDir = path.join(__dirname, "test-data");

  describe("wildcard alias", () => {
    it("should resolve @entities/* alias correctly", () => {
      const result = Alias.resolvePath(
        "@entities/user",
        path.join(testDataDir, "src", "features")
      );

      expect(result.type).toBe("success");
      expect(result.absolutePath).toBe(
        path.resolve(testDataDir, "src/entities/user")
      );
    });

    it("should resolve @features/* alias correctly", () => {
      const result = Alias.resolvePath(
        "@features/payment",
        path.join(testDataDir, "src", "features")
      );

      expect(result.type).toBe("success");
      expect(result.absolutePath).toBe(
        path.resolve(testDataDir, "src/features/payment")
      );
    });

    it("should resolve @shared/* alias correctly", () => {
      const result = Alias.resolvePath(
        "@shared/utils",
        path.join(testDataDir, "src", "features")
      );

      expect(result.type).toBe("success");
      expect(result.absolutePath).toBe(
        path.resolve(testDataDir, "src/shared/utils")
      );
    });

    it("should resolve nested path with wildcard alias", () => {
      const result = Alias.resolvePath(
        "@entities/user/components",
        path.join(testDataDir, "src", "features")
      );

      expect(result.type).toBe("success");
      expect(result.absolutePath).toBe(
        path.resolve(testDataDir, "src/entities/user/components")
      );
    });
  });

  describe("non-wildcard alias", () => {
    it("should resolve @utils alias correctly", () => {
      const result = Alias.resolvePath(
        "@utils",
        path.join(testDataDir, "src", "features")
      );

      expect(result.type).toBe("success");
      expect(result.absolutePath).toBe(
        path.resolve(testDataDir, "src/utils/index")
      );
    });
  });

  describe("non-alias paths", () => {
    it("should return fail for relative path", () => {
      const result = Alias.resolvePath(
        "../../entities/user",
        path.join(testDataDir, "src", "features")
      );

      expect(result.type).toBe("fail");
      expect(result.absolutePath).toBe("../../entities/user");
    });

    it("should return fail for external package", () => {
      const result = Alias.resolvePath(
        "react",
        path.join(testDataDir, "src", "features")
      );

      expect(result.type).toBe("fail");
      expect(result.absolutePath).toBe("react");
    });

    it("should return fail for absolute path", () => {
      const result = Alias.resolvePath(
        "/absolute/path",
        path.join(testDataDir, "src", "features")
      );

      expect(result.type).toBe("fail");
      expect(result.absolutePath).toBe("/absolute/path");
    });
  });

  describe("edge cases", () => {
    it("should handle non-existent tsconfig.json gracefully", () => {
      const nonExistentDir = path.join(__dirname, "non-existent-dir");
      const result = Alias.resolvePath("@entities/user", nonExistentDir);

      expect(result.type).toBe("fail");
      expect(result.absolutePath).toBe("@entities/user");
    });

    it("should handle invalid alias pattern", () => {
      const result = Alias.resolvePath(
        "@nonexistent/foo",
        path.join(testDataDir, "src", "features")
      );

      expect(result.type).toBe("fail");
      expect(result.absolutePath).toBe("@nonexistent/foo");
    });

    it("should handle partial match correctly", () => {
      // @entities/user/components는 @entities/*와 매치되어야 함
      const result = Alias.resolvePath(
        "@entities/user/components/Button",
        path.join(testDataDir, "src", "features")
      );

      expect(result.type).toBe("success");
      expect(result.absolutePath).toBe(
        path.resolve(testDataDir, "src/entities/user/components/Button")
      );
    });
  });
});
