// a.ts imports b.ts
import { b } from "./b";

export function a(): string {
  return "a" + b();
}

