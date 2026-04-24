"use client";

/*
 * <ItemChip> — a draggable chip showing one receipt item.
 *
 * Two public exports:
 *  - ItemChip: wired to useDraggable, used inside PersonRow / UnassignedZone.
 *  - ItemChipPreview: pure visual clone used inside <DragOverlay>. Overlay
 *    renders into a separate DOM subtree so it cannot reuse the draggable;
 *    we share the visual via an internal <ChipVisual> to avoid drift.
 */

import { useDraggable } from "@dnd-kit/core";
import { Money } from "@/components/atoms/Money";
import { cn } from "@/lib/utils/cn";
import type { SplitItem } from "@/lib/types/split";

interface ChipVisualProps {
  name: string;
  price: number;
  sharedAmong?: number;
  className?: string;
}

function ChipVisual({ name, price, sharedAmong = 1, className }: ChipVisualProps) {
  const displayPrice = sharedAmong > 1 ? price / sharedAmong : price;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 text-sm",
        className,
      )}
    >
      <span className="max-w-[140px] truncate font-medium">{name}</span>
      <Money amount={displayPrice} className="text-xs text-fg-muted" />
      {sharedAmong > 1 && (
        <span className="text-xs text-fg-dim">/{sharedAmong}</span>
      )}
    </span>
  );
}

interface ItemChipProps {
  item: SplitItem;
  sharedAmong?: number;
}

export function ItemChip({ item, sharedAmong = 1 }: ItemChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `item:${item.id}` });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      // touch-none: tell the browser the chip owns touch gestures so dnd-kit
      // can detect drags on mobile without the page scrolling under them.
      className={cn(
        "touch-none outline-none transition-opacity",
        isDragging && "opacity-30",
      )}
    >
      <ChipVisual name={item.name} price={item.price} sharedAmong={sharedAmong} />
    </button>
  );
}

export function ItemChipPreview({ item }: { item: SplitItem }) {
  return (
    <ChipVisual
      name={item.name}
      price={item.price}
      className="scale-105 shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
    />
  );
}
