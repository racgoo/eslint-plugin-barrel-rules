import { loadConfig } from "tsconfig-paths";
import path from "path";

type AliasResult =
  | { absolutePath: string; type: "success" }
  | { absolutePath: string; type: "fail" };

/**
 * Alias path resolver using tsconfig.json paths configuration
 *
 * Resolves TypeScript path aliases (e.g., @entities/*, @utils) to absolute file paths
 * by reading tsconfig.json configuration.
 */
class Alias {
  private constructor() {}

  /**
   * Resolves an alias path to an absolute file path
   *
   * @param rawPath - The alias path to resolve (e.g., "@entities/user", "@utils")
   * @param currentFileDir - The directory of the current file (used to find tsconfig.json)
   * @returns Result object with absolutePath and type ("success" or "fail")
   *
   * @example
   * // With wildcard alias: "@entities/*" -> "src/entities/*"
   * Alias.resolvePath("@entities/user", "/project/src/features")
   * // Returns: { absolutePath: "/project/src/entities/user", type: "success" }
   *
   * @example
   * // Without wildcard: "@utils" -> "src/utils/index"
   * Alias.resolvePath("@utils", "/project/src/features")
   * // Returns: { absolutePath: "/project/src/utils/index", type: "success" }
   */
  public static resolvePath(
    rawPath: string,
    currentFileDir: string
  ): AliasResult {
    try {
      const configResult = loadConfig(currentFileDir);

      // If tsconfig.json not found or invalid, return fail
      if (configResult.resultType !== "success") {
        return this.createFailResult(rawPath);
      }

      const { paths, absoluteBaseUrl } = configResult;

      // Try to match the rawPath against each alias pattern
      for (const [aliasPattern, targetPaths] of Object.entries(paths)) {
        const targetPath = targetPaths[0]; // Use first target (tsconfig supports multiple)

        const matchResult = this.tryMatchPattern(
          rawPath,
          aliasPattern,
          targetPath,
          absoluteBaseUrl
        );

        if (matchResult) {
          return matchResult;
        }
      }

      // No matching pattern found
      return Alias.createFailResult(rawPath);
    } catch (error) {
      // Any error during resolution results in failure
      return Alias.createFailResult(rawPath);
    }
  }

  /**
   * Attempts to match a raw path against an alias pattern
   *
   * @param rawPath - The path to match (e.g., "@entities/user")
   * @param aliasPattern - The alias pattern from tsconfig (e.g., "@entities/*")
   * @param targetPath - The target path from tsconfig (e.g., "src/entities/*")
   * @param baseUrl - The absolute base URL from tsconfig
   * @returns Success result if matched, null otherwise
   */
  private static tryMatchPattern(
    rawPath: string,
    aliasPattern: string,
    targetPath: string,
    baseUrl: string
  ): AliasResult | null {
    const hasWildcard = aliasPattern.includes("*");

    if (hasWildcard) {
      return this.matchWildcardPattern(
        rawPath,
        aliasPattern,
        targetPath,
        baseUrl
      );
    } else {
      return this.matchExactPattern(rawPath, aliasPattern, targetPath, baseUrl);
    }
  }

  /**
   * Matches a wildcard alias pattern (e.g., "@entities/*")
   *
   * Pattern: "@entities/*" -> Target: "src/entities/*"
   * Input: "@entities/user" -> Matches: "user" -> Output: "src/entities/user"
   *
   * Note: The original implementation uses simple string replacement for regex,
   * which works because alias patterns typically don't contain special regex chars.
   * We maintain this behavior for compatibility.
   */
  private static matchWildcardPattern(
    rawPath: string,
    aliasPattern: string,
    targetPath: string,
    baseUrl: string
  ): AliasResult | null {
    // Convert pattern to regex: "@entities/*" -> "^@entities/(.*)$"
    // Note: We don't escape special chars here to match original behavior
    // Alias patterns in tsconfig.json typically don't contain regex special chars
    const regexPattern = `^${aliasPattern.replace(/\*/g, "(.*)")}$`;
    const regex = new RegExp(regexPattern);

    const match = rawPath.match(regex);
    if (!match) {
      return null;
    }

    // match[0] is the full match, match[1] is the captured group
    // Example: "@entities/user" -> match[1] = "user"
    const capturedPath = match[1];

    // Replace * in target path with the captured path
    // Example: "src/entities/*" + "user" -> "src/entities/user"
    const resolvedTargetPath = targetPath.replace(/\*/g, capturedPath);

    // Build absolute path using the same method as original code
    // Original: path.resolve(`${absoluteBaseUrl}/${extendedOrigin}`)
    // This maintains exact compatibility with original behavior
    const absolutePath = path.resolve(`${baseUrl}/${resolvedTargetPath}`);

    return Alias.createSuccessResult(absolutePath);
  }

  /**
   * Matches an exact alias pattern (no wildcard)
   *
   * Pattern: "@utils" -> Target: "src/utils/index"
   * Input: "@utils" -> Output: "src/utils/index"
   */
  private static matchExactPattern(
    rawPath: string,
    aliasPattern: string,
    targetPath: string,
    baseUrl: string
  ): AliasResult | null {
    // Exact match required for non-wildcard patterns
    if (rawPath !== aliasPattern) {
      return null;
    }

    // Build absolute path using the same method as original code
    // Original: path.resolve(`${absoluteBaseUrl}/${origin}`)
    const absolutePath = path.resolve(`${baseUrl}/${targetPath}`);

    return Alias.createSuccessResult(absolutePath);
  }

  /**
   * Creates a success result
   */
  private static createSuccessResult(absolutePath: string): AliasResult {
    return {
      absolutePath,
      type: "success",
    };
  }

  /**
   * Creates a fail result
   */
  private static createFailResult(originalPath: string): AliasResult {
    return {
      absolutePath: originalPath,
      type: "fail",
    };
  }
}

export { Alias };
