"use client";

/*
 * <PersonRow> — one row per person in the SplitCard.
 *
 * Acts as a droppable zone (id = "person:<id>"): dropping an ItemChip here
 * reassigns the item solely to this person.
 *
 * AnimatePresence wraps the chip list so each chip fades in when added
 * and fades out when removed (no layout animation, to stay out of dnd-kit's
 * way during active drags).
 */

import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { PersonAvatar } from "@/components/atoms/PersonAvatar";
import { Money } from "@/components/atoms/Money";
import { ItemChip } from "./ItemChip";
import { cn } from "@/lib/utils/cn";
import { computePersonTotal } from "@/lib/utils/share";
import type { Person, SplitCardData } from "@/lib/types/split";

interface PersonRowProps {
  person: Person;
  card: SplitCardData;
}

export function PersonRow({ person, card }: PersonRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `person:${person.id}`,
  });

  const items = card.items.filter((i) => i.assignedTo.includes(person.id));
  const total = computePersonTotal(card, person.id);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-[20px] border border-hairline bg-elevated p-3 transition-colors",
        isOver && "border-primary bg-primary/10",
      )}
    >
      <div className="flex items-center gap-3">
        <PersonAvatar name={person.name} isSelf={person.isSelf} size="md" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold leading-tight">
            {person.isSelf ? "Me" : person.name}
          </div>
          <div className="mt-0.5 text-xs text-fg-muted">
            {items.length === 0
              ? "No items"
              : `${items.length} ${items.length === 1 ? "item" : "items"}`}
          </div>
        </div>
        <Money amount={total} className="text-lg font-bold" />
      </div>

      {items.length > 0 && (
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
                <ItemChip item={item} sharedAmong={item.assignedTo.length} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
