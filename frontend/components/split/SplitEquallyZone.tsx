"use client";

/*
 * <SplitEquallyZone> — special drop target.
 *
 * Dropping an ItemChip here sets its assignedTo to ALL people, so the
 * price is divided equally (handled in SplitCard onDragEnd).
 */

import { useDroppable } from "@dnd-kit/core";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function SplitEquallyZone() {
  const { setNodeRef, isOver } = useDroppable({ id: "split-equally" });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-[20px] border border-dashed border-secondary/40 bg-secondary/5 p-3 transition-colors",
        isOver && "border-secondary bg-secondary/20",
      )}
    >
      <div className="flex items-center gap-2 text-sm">
        <Users size={16} className="text-secondary" />
        <span className="font-medium text-secondary">
          Drop here to split equally
        </span>
      </div>
    </div>
  );
}
