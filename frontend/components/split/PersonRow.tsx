"use client";

/*
 * <PersonRow> — one row per person in the SplitCard.
 *
 * Acts as a droppable zone (id = "person:<id>"): dropping an ItemChip here
 * reassigns the item solely to this person.
 *
 * Shows: avatar, name (or "Me" if self), total owed, and chips for each
 * item currently assigned (including shared items, shown with "/N" suffix
 * and per-person price).
 */

import { useDroppable } from "@dnd-kit/core";
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
          <div className="truncate font-semibold">
            {person.isSelf ? "Me" : person.name}
          </div>
          <div className="text-xs text-fg-muted">
            {items.length === 0
              ? "No items"
              : `${items.length} ${items.length === 1 ? "item" : "items"}`}
          </div>
        </div>
        <Money amount={total} className="text-lg font-bold" />
      </div>

      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <ItemChip
              key={item.id}
              item={item}
              sharedAmong={item.assignedTo.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
