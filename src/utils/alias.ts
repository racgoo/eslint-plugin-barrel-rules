import { loadConfig } from "tsconfig-paths";
import path from "path";

class Alias {
  private constructor() {}

  public static resolvePath(
    rawPath: string,
    currentFileDir: string
  ): { absolutePath: string; type: "success" | "fail" } {
    try {
      const configResult = loadConfig(currentFileDir);
      if (configResult.resultType === "success") {
        for (const [pattern, targets] of Object.entries(configResult.paths)) {
          const origin = targets[0];
          if (pattern.includes("*")) {
            //with wildcard(@ts/*: ./src/typescript/*) => /^@key\/(.*)$/
            const patternRegex = new RegExp(
              `^${pattern.replace("*", "(.*)")}$`
            );
            //["full match", "matched path"]
            const match = rawPath.match(patternRegex);
            if (match) {
              const [, matchedPath] = match;
              const extendedOrigin = origin.replace("*", matchedPath);
              const absolutePath = path.resolve(
                `${configResult.absoluteBaseUrl}/${extendedOrigin}`
              );
              return {
                absolutePath,
                type: "success",
              };
            }
          } else {
            //without wildcard(@domain: ./src/typescript)
            if (rawPath === pattern) {
              const absolutePath = path.resolve(
                `${configResult.absoluteBaseUrl}/${origin}`
              );
              return {
                absolutePath,
                type: "success",
              };
            }
          }
        }
      }
      return {
        absolutePath: rawPath,
        type: "fail",
      };
    } catch (e) {
      return {
        absolutePath: rawPath,
        type: "fail",
      };
    }
  }
}

export { Alias };
