// f.ts imports g.ts
import { g } from "./g";

export function f(): string {
  return "f" + g();
}

