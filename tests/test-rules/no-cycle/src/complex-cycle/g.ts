// g.ts imports d.ts - creates cycle: d -> e -> f -> g -> d
import { d } from "./d";

export function g(): string {
  return "g" + d();
}

