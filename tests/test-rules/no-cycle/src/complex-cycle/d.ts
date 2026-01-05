// d.ts imports e.ts
import { e } from "./e";

export function d(): string {
  return "d" + e();
}

