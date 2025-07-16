import FastGlob from "fast-glob";

class Glob {
  public static resolvePath(path: string, baseDir: string): string[] {
    //get target paths with fast-glob(directory names)
    const globResult = FastGlob.sync(path, {
      cwd: baseDir,
      onlyDirectories: true,
      absolute: true,
    });
    //if no directory was found, throw error
    if (globResult.length === 0) {
      throw new Error(
        `[Glob] In baseDir: ${baseDir}, path: ${path}, any directory was not found`
      );
    }
    return globResult;
  }
}

export { Glob };
