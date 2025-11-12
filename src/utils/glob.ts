import FastGlob from "fast-glob";

class Glob {
  public static resolvePath(path: string, baseDir: string): string[] {
    //get target paths with fast-glob(directory names)
    const globResult = FastGlob.sync(path, {
      cwd: baseDir,
      onlyDirectories: true,
      absolute: true,
    });
    //if no directory was found, return empty array instead of throwing error
    //this allows the rule to continue working even if some paths don't exist yet
    return globResult;
  }
}

export { Glob };
