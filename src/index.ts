import { enforceBarrelPattern } from "./rules/enforce-barrel-pattern";
import { isolateBarrelFile } from "./rules/isolate-barrel-file";
import { noWildcard } from "./rules/no-wildcard";
import { noCycle } from "./rules/no-cycle";

const rules = {
  "enforce-barrel-pattern": enforceBarrelPattern,
  "isolate-barrel-file": isolateBarrelFile,
  "no-wildcard": noWildcard,
  "no-cycle": noCycle,
};

export default { rules };
