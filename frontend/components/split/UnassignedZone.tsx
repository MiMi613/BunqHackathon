"use client";

/*
 * <UnassignedZone> — droppable "parking" area for items the model couldn't
 * pin to anyone (or that the user has dragged off a person).
 *
 * Tone: amber/warning, NOT danger. These items are the default state for
 * anything ambiguous — treating them as errors makes the surface feel
 * punitive. We use a warm, friendly attention tone instead and only escalate
 * to red copy on the Send CTA when the user actually tries to act.
 *
 * States:
 *  - has items: amber-tinted card with a count badge, chips below.
 *  - empty + drag in progress: dashed primary outline inviting a drop here
 *    to mark an item as unassigned again.
 *  - empty + idle: success pill confirming everything is assigned.
 */

import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle, HelpCircle } from "lucide-react";
import { ItemChip } from "./ItemChip";
import { cn } from "@/lib/utils/cn";
import type { SplitItem } from "@/lib/types/split";

interface UnassignedZoneProps {
  items: SplitItem[];
}

export function UnassignedZone({ items }: UnassignedZoneProps) {
  const { setNodeRef, isOver, active } = useDroppable({ id: "unassigned" });
  const hasItems = items.length > 0;
  const isDragActive = Boolean(active);

  // Empty & no drag in progress → render a quiet success pill.
  if (!hasItems && !isDragActive) {
    return (
      <div
        ref={setNodeRef}
        className="flex items-center justify-center gap-2 rounded-full bg-success/10 py-2 text-xs font-medium text-success"
      >
        <CheckCircle2 size={14} strokeWidth={2.5} />
        All items assigned
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-[20px] p-3 transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out",
        hasItems
          ? "border border-warning/35 bg-warning/[0.06]"
          : "border-2 border-dashed border-hairline bg-elevated/30",
        isOver &&
          (hasItems
            ? "border-warning/60 bg-warning/15"
            : "-translate-y-0.5 border-primary bg-primary/10 shadow-[0_8px_24px_-12px_rgba(255,106,0,0.6)]"),
      )}
    >
      <div className="flex items-center gap-2 text-sm">
        {hasItems ? (
          <>
            <HelpCircle size={16} className="text-warning" strokeWidth={2.5} />
            <span className="font-semibold text-fg">Unassigned</span>
            <span className="ml-auto rounded-full bg-warning/20 px-2 py-0.5 text-[11px] font-bold text-warning">
              {items.length}
            </span>
          </>
        ) : (
          <>
            <Circle size={14} className="text-fg-dim" strokeWidth={2} />
            <span className="font-medium text-fg-muted">
              Drop here to mark as unassigned
            </span>
          </>
        )}
      </div>

      {hasItems && (
        <>
          <p className="mt-1 text-[11px] leading-snug text-fg-muted">
            Drag each item onto a person, or onto Split equally.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                >
                  <ItemChip item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
