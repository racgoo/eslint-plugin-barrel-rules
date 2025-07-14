import { enforceBarrelPattern } from "./rules/enforce-barrel-pattern";
import { noWildcard } from "./rules/no-wildcard";

const rules = {
  "enforce-barrel-pattern": enforceBarrelPattern,
  "no-wildcard": noWildcard,
};

// ESM(eslint9+)
export default { rules };

// // CJS(eslint8+)
module.exports = { rules };
