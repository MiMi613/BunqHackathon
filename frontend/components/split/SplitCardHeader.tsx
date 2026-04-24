"use client";

/*
 * <SplitCardHeader> — top row of the SplitCard.
 *
 * Left: CategoryIcon (picked from merchant name).
 * Middle: merchant name (bold, truncated) + time (muted).
 * Right: total, large, Money atom so decimals are in superscript.
 */

import { CategoryIcon } from "@/components/atoms/CategoryIcon";
import { Money } from "@/components/atoms/Money";
import { pickCategory } from "@/lib/utils/receipt-category";
import type { SplitCardData } from "@/lib/types/split";

interface SplitCardHeaderProps {
  card: SplitCardData;
}

export function SplitCardHeader({ card }: SplitCardHeaderProps) {
  const { icon, color } = pickCategory(card.merchant);

  return (
    <div className="flex items-center gap-3">
      <CategoryIcon icon={icon} color={color} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-lg font-bold">{card.merchant}</div>
        <div className="text-xs text-fg-muted">{card.time}</div>
      </div>
      <Money amount={card.total} className="text-2xl font-bold" />
    </div>
  );
}
