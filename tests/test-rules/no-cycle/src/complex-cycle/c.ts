// c.ts imports a.ts - creates cycle: a -> b -> c -> a
import { a } from "./a";

export function c(): string {
  return "c" + a();
}

