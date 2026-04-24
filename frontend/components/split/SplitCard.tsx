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
 * go through store.moveItem(splitId, itemId, newAssignedTo) which triggers
 * a re-render of every subscribed PersonRow / UnassignedZone.
 *
 * Sensors:
 *   - PointerSensor with distance=8 avoids accidental drags on tap.
 *   - TouchSensor with delay=200ms lets the user still scroll the page
 *     (a brief hold is required before dragging starts).
 *
 * DragOverlay: renders a floating preview of the active chip while dragging.
 * The original chip stays in place at opacity 30% for spatial reference.
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
import { SplitCardHeader } from "./SplitCardHeader";
import { PersonRow } from "./PersonRow";
import { UnassignedZone } from "./UnassignedZone";
import { SplitEquallyZone } from "./SplitEquallyZone";
import { ItemChipPreview } from "./ItemChip";
import { SendRequests } from "./SendRequests";

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
    <div className="rounded-[var(--radius-card)] border border-hairline bg-surface p-4">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
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
