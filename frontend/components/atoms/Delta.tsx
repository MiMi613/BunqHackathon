/*
 * <Delta> — monetary variation with a directional triangle.
 *
 * Signature pattern: ▲ €5.²⁰ (green, positive) / ▼ €3.¹⁰ (red, negative).
 * Used for things like "if you move this item, X's total changes by…",
 * tip added, discount applied, etc.
 *
 * The sign is carried by the triangle: we never prefix + or − to the number.
 */

import { Money } from "./Money";
import { cn } from "@/lib/utils/cn";

interface DeltaProps {
  amount: number;
  className?: string;
}

export function Delta({ amount, className }: DeltaProps) {
  const isPositive = amount >= 0;
  const arrow = isPositive ? "▲" : "▼";
  const colorClass = isPositive ? "text-success" : "text-danger";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        colorClass,
        className,
      )}
    >
      <span className="text-[0.75em]" aria-hidden>
        {arrow}
      </span>
      <Money amount={Math.abs(amount)} />
    </span>
  );
}
