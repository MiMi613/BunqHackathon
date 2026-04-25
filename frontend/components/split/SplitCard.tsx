"use client";

/*
 * <SplitCard> — the critical component of the app.
 *
 * Owns a DndContext that spans the whole card. Children register as
 * draggables (ItemChip via useDraggable) and droppables (PersonRow,
 * UnassignedZone, SplitEquallyZone via useDroppable). The parent
 * onDragEnd routes the drop by id prefix:
 *   - "person:<id>"    → assignedTo = [that person]
 *   - "unassigned"     → assignedTo = []
 *   - "split-equally"  → assignedTo = all people
 *
 * The canonical state is the Zustand store's SplitCardData. All mutations
 * go through store.moveItem(splitId, itemId, newAssignedTo).
 *
 * Visual polish: a category-tinted radial glow bleeds from the top-left
 * to give depth without resorting to drop shadows (kept consistent with
 * the design system rule).
 */

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useChatStore } from "@/lib/store/chatStore";
import type { SplitCardData, SplitItem } from "@/lib/types/split";
import { pickCategory, type CategoryColor } from "@/lib/utils/receipt-category";
import { SplitCardHeader } from "./SplitCardHeader";
import { PersonRow } from "./PersonRow";
import { UnassignedZone } from "./UnassignedZone";
import { SplitEquallyZone } from "./SplitEquallyZone";
import { ItemChipPreview } from "./ItemChip";
import { SendRequests } from "./SendRequests";

// Hex per CategoryColor — used for the glow blob (inline style needed
// because Tailwind can't statically infer dynamic gradient endpoints).
const GLOW_HEX: Record<CategoryColor, string> = {
  purple: "#C026D3",
  teal: "#14B8A6",
  pink: "#FF2E6C",
  primary: "#FF6A00",
  secondary: "#2D7FF9",
  warning: "#F5B700",
};

interface SplitCardProps {
  card: SplitCardData;
}

export function SplitCard({ card }: SplitCardProps) {
  const moveItem = useChatStore((s) => s.moveItem);
  const [activeItem, setActiveItem] = useState<SplitItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const unassigned = card.items.filter((i) => i.assignedTo.length === 0);
  const { color: categoryColor } = pickCategory(card.merchant);

  const handleDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    const itemId = id.replace("item:", "");
    setActiveItem(card.items.find((i) => i.id === itemId) ?? null);
  };

  const handleDragCancel = () => setActiveItem(null);

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = e;
    if (!over) return;

    const itemId = String(active.id).replace("item:", "");
    const dropId = String(over.id);

    if (dropId === "unassigned") {
      moveItem(card.splitId, itemId, []);
    } else if (dropId === "split-equally") {
      moveItem(
        card.splitId,
        itemId,
        card.people.map((p) => p.id),
      );
    } else if (dropId.startsWith("person:")) {
      const personId = dropId.slice("person:".length);
      moveItem(card.splitId, itemId, [personId]);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-hairline bg-surface p-4">
      {/* Category-tinted radial glow — adds depth without a drop shadow. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full opacity-20 blur-3xl"
        style={{ background: GLOW_HEX[categoryColor] }}
      />

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="relative space-y-4">
          <SplitCardHeader card={card} />

          <UnassignedZone items={unassigned} />
          <SplitEquallyZone />

          <div className="space-y-2.5">
            {card.people.map((person) => (
              <PersonRow key={person.id} person={person} card={card} />
            ))}
          </div>

          <SendRequests card={card} blocked={unassigned.length > 0} />
        </div>

        <DragOverlay>
          {activeItem ? <ItemChipPreview item={activeItem} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
