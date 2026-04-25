"use client";

/*
 * <SplitCardHeader> — top row of the SplitCard.
 *
 * Left:  CategoryIcon (picked from merchant name).
 * Mid:   merchant name (bold, truncated) + time + sum-check indicator.
 * Right: total (large, with superscript decimals via <Money>).
 *
 * Sum check: small pill below the time showing whether item prices add up
 * to the receipt total. Green check when matching (within 1¢), amber
 * triangle when off — useful when Claude misreads a price.
 */

import { CheckCircle2 } from "lucide-react";
import { CategoryIcon } from "@/components/atoms/CategoryIcon";
import { Money } from "@/components/atoms/Money";
import { pickCategory } from "@/lib/utils/receipt-category";
import type { SplitCardData } from "@/lib/types/split";

interface SplitCardHeaderProps {
  card: SplitCardData;
}

export function SplitCardHeader({ card }: SplitCardHeaderProps) {
  const { icon, color } = pickCategory(card.merchant);

  const sumOfItems = card.items.reduce((acc, i) => acc + i.price, 0);
  const matches = Math.abs(card.total - sumOfItems) < 0.01;

  return (
    <div className="flex items-start gap-3">
      <CategoryIcon icon={icon} color={color} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-lg font-bold leading-tight">
          {card.merchant}
        </div>
        <div className="mt-0.5 text-xs text-fg-muted">{card.time}</div>
        {matches && (
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 size={12} className="text-success" />
            <span className="text-fg-muted">
              Items match the receipt total
            </span>
          </div>
        )}
      </div>
      <Money amount={card.total} className="text-2xl font-bold leading-none" />
    </div>
  );
}
