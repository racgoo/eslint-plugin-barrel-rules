import { enforceBarrelPattern } from "./rules/enforce-barrel-pattern";

const rules = {
  "enforce-barrel-pattern": enforceBarrelPattern,
};

// ESM(eslint9+)
export default { rules };

// // CJS(eslint8+)
module.exports = { rules };
