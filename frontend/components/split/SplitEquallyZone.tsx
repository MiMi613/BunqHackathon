"use client";

/*
 * <SplitEquallyZone> — special drop target.
 *
 * Dropping an ItemChip here sets its assignedTo to ALL people, so the
 * price is divided equally (handled in SplitCard onDragEnd).
 *
 * Visual: dormant pill in the resting state to keep visual weight low,
 * promotes to a brand-tinted dashed target while a drag is in progress,
 * and lights up fully (gradient + glow) when the chip is hovering over it.
 */

import { useDroppable } from "@dnd-kit/core";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function SplitEquallyZone() {
  const { setNodeRef, isOver, active } = useDroppable({ id: "split-equally" });
  const isDragActive = Boolean(active);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out",
        // Resting: muted, low visual weight.
        !isDragActive &&
          "border border-hairline bg-elevated/40 text-fg-muted",
        // Drag in progress, not over: dashed brand-tinted invitation.
        isDragActive &&
          !isOver &&
          "border-2 border-dashed border-secondary/50 bg-secondary/[0.06] text-secondary",
        // Active drop target: full color + lift + glow.
        isOver &&
          "-translate-y-0.5 border-2 border-secondary bg-secondary/20 text-secondary shadow-[0_8px_24px_-12px_rgba(45,127,249,0.7)]",
      )}
    >
      <Users
        size={14}
        strokeWidth={2.5}
        className={cn(
          "transition-transform duration-200 ease-out",
          isOver && "scale-110",
        )}
      />
      <span>
        {isOver ? "Release to split equally" : "Split equally across everyone"}
      </span>
    </div>
  );
}
