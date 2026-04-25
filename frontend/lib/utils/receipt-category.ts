/*
 * Maps a merchant name to a visual category (icon + color) for the
 * SplitCard header tile. Pure heuristic — cheap keyword match on the
 * merchant string. Unknown merchants fall back to a generic "utensils"
 * meal icon.
 */

import {
  Car,
  Coffee,
  Pizza,
  ShoppingBag,
  Utensils,
  type LucideIcon,
} from "lucide-react";

export type CategoryColor =
  | "purple"
  | "teal"
  | "pink"
  | "primary"
  | "secondary"
  | "warning";

export interface Category {
  icon: LucideIcon;
  color: CategoryColor;
}

export function pickCategory(merchant: string): Category {
  const m = merchant.toLowerCase();
  if (/pizz/.test(m)) return { icon: Pizza, color: "pink" };
  if (/caf|coffee|bar|pub/.test(m)) return { icon: Coffee, color: "warning" };
  if (/uber|taxi|lyft|bolt|ride/.test(m)) return { icon: Car, color: "secondary" };
  if (/shop|store|market|grocery/.test(m))
    return { icon: ShoppingBag, color: "teal" };
  return { icon: Utensils, color: "purple" };
}
