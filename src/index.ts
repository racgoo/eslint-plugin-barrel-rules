import { enforceBarrelPattern } from "./rules/enforce-barrel-pattern";
import { isolateBarrelFile } from "./rules/isolate-barrel-file";
import { noWildcard } from "./rules/no-wildcard";

const rules = {
  "enforce-barrel-pattern": enforceBarrelPattern,
  "isolate-barrel-file": isolateBarrelFile,
  "no-wildcard": noWildcard,
};

// ESM(eslint9+)
export default { rules };

// // CJS(eslint8+)
module.exports = { rules };
