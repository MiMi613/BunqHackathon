"use client";

/*
 * <UnassignedZone> — droppable "parking" area.
 *
 * When non-empty, renders danger-tinted and blocks the Send CTA upstream.
 * When empty, renders a quiet success pill saying everything is assigned.
 * Dropping an item here clears its assignedTo array (handler in SplitCard).
 *
 * AnimatePresence makes chips fade in/out as items are reassigned in/out.
 */

import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { ItemChip } from "./ItemChip";
import { cn } from "@/lib/utils/cn";
import type { SplitItem } from "@/lib/types/split";

interface UnassignedZoneProps {
  items: SplitItem[];
}

export function UnassignedZone({ items }: UnassignedZoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: "unassigned" });
  const hasItems = items.length > 0;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-[20px] border-2 border-dashed p-3 transition-colors",
        hasItems
          ? "border-danger/60 bg-danger/5"
          : "border-hairline bg-elevated/40",
        isOver &&
          (hasItems
            ? "border-danger bg-danger/15"
            : "border-fg-muted bg-elevated"),
      )}
    >
      <div className="flex items-center gap-2 text-sm">
        {hasItems ? (
          <>
            <AlertTriangle size={16} className="text-danger" />
            <span className="font-medium text-danger">
              {items.length} unassigned — drag to a person to continue
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 size={16} className="text-success" />
            <span className="font-medium text-fg-muted">
              All items assigned
            </span>
          </>
        )}
      </div>

      {hasItems && (
        <div className="mt-3 flex flex-wrap gap-2">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
              >
                <ItemChip item={item} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
