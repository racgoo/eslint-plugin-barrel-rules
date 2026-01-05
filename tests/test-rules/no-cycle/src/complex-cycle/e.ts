// e.ts imports f.ts
import { f } from "./f";

export function e(): string {
  return "e" + f();
}

