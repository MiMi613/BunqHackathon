"use client";

/*
 * <ItemChip> — a draggable chip showing one receipt item.
 *
 * Two public exports:
 *  - ItemChip: wired to useDraggable, used inside PersonRow / UnassignedZone.
 *  - ItemChipPreview: pure visual clone used inside <DragOverlay>. Overlay
 *    renders into a separate DOM subtree so it cannot reuse the draggable;
 *    we share the visual via an internal <ChipVisual> to avoid drift.
 *
 * Visual language:
 *  - Solo and shared chips share the same shape, padding, and surface, so
 *    a row of chips reads as one consistent list.
 *  - Shared chips (sharedAmong >= 2) only differ in two small blue accents:
 *    the per-person price renders in `text-secondary`, and a compact `÷N`
 *    pill sits at the end. No background tint, no extra shadow — minimal
 *    by design so the share state reads without dominating the row.
 *
 * The drag preview lifts off with a brand-glow shadow + slight rotation
 * and inherits the solo / shared accents from the underlying item.
 */

import { useDraggable } from "@dnd-kit/core";
import { Money } from "@/components/atoms/Money";
import { cn } from "@/lib/utils/cn";
import type { SplitItem } from "@/lib/types/split";

interface ChipVisualProps {
  name: string;
  price: number;
  sharedAmong?: number;
  /** Adds the warm brand-glow used by the drag preview. */
  lifted?: boolean;
  /** Adds a small rotation, used by the drag preview. */
  tilted?: boolean;
}

function ChipVisual({
  name,
  price,
  sharedAmong = 1,
  lifted = false,
  tilted = false,
}: ChipVisualProps) {
  const isShared = sharedAmong > 1;
  const displayPrice = isShared ? price / sharedAmong : price;

  const transforms: string[] = [];
  if (lifted) transforms.push("scale(1.08)");
  if (tilted) transforms.push("rotate(-2deg)");

  return (
    <span
      style={{
        boxShadow: lifted
          ? "0 12px 32px -8px rgba(255, 106, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.35)"
          : undefined,
        transform: transforms.length ? transforms.join(" ") : undefined,
      }}
      className="inline-flex items-center gap-2 rounded-full border border-hairline bg-elevated px-3.5 py-1.5 text-sm tracking-tight"
    >
      <span className="max-w-[140px] truncate font-semibold text-fg">
        {name}
      </span>
      <Money
        amount={displayPrice}
        className={cn(
          "text-xs font-semibold",
          isShared ? "text-secondary" : "text-fg-muted",
        )}
      />
      {isShared && (
        <span className="inline-flex items-center rounded-full bg-secondary/15 px-1.5 py-0.5 text-[10px] font-bold leading-none tracking-tight text-secondary">
          ÷{sharedAmong}
        </span>
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
      // active:scale gives a tactile "press" before the drag actually starts.
      className={cn(
        "cursor-grab touch-none rounded-full outline-none transition-[transform,opacity] duration-150 ease-out active:cursor-grabbing active:scale-[0.97]",
        isDragging && "opacity-30",
      )}
    >
      <ChipVisual
        name={item.name}
        price={item.price}
        sharedAmong={sharedAmong}
      />
    </button>
  );
}

export function ItemChipPreview({ item }: { item: SplitItem }) {
  // Honor the chip's current sharedAmong so the drag overlay matches the
  // chip the user actually grabbed.
  return (
    <ChipVisual
      name={item.name}
      price={item.price}
      sharedAmong={Math.max(1, item.assignedTo.length)}
      lifted
      tilted
    />
  );
}
