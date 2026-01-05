// b.ts imports c.ts
import { c } from "./c";

export function b(): string {
  return "b" + c();
}

