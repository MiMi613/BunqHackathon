"use client";

/*
 * <PersonRow> — one row per person in the SplitCard.
 *
 * Acts as a droppable zone (id = "person:<id>"): dropping an ItemChip here
 * reassigns the item solely to this person.
 *
 * Right side of the row:
 *  - <Money> with the person's current total.
 *  - A per-person send button (non-self only). Tapping it shares ONE
 *    bunq.me payment request link for THIS person via navigator.share()
 *    (with a clipboard fallback on desktop). Brief ✓ feedback for ~1.8s.
 *
 * The button is disabled when:
 *  - the person owes nothing (no items / 0¢), OR
 *  - any item on the card is unassigned (totals are not final).
 *
 * AnimatePresence wraps the chip list so each chip fades in when added
 * and fades out when removed (no layout animation, to stay out of dnd-kit's
 * way during active drags).
 */

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { PersonAvatar } from "@/components/atoms/PersonAvatar";
import { Money } from "@/components/atoms/Money";
import { ItemChip } from "./ItemChip";
import { cn } from "@/lib/utils/cn";
import { buildShareLine, computePersonTotal } from "@/lib/utils/share";
import type { Person, SplitCardData } from "@/lib/types/split";

interface PersonRowProps {
  person: Person;
  card: SplitCardData;
}

export function PersonRow({ person, card }: PersonRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `person:${person.id}`,
  });

  const [justSent, setJustSent] = useState(false);

  const items = card.items.filter((i) => i.assignedTo.includes(person.id));
  const total = computePersonTotal(card, person.id);
  const hasUnassigned = card.items.some((i) => i.assignedTo.length === 0);
  const canSend = !person.isSelf && total > 0.01 && !hasUnassigned;

  const handleSend = async () => {
    if (!canSend) return;
    const line = buildShareLine(card, person.id);
    if (!line) return;

    let shared = false;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: `Payment request for ${person.name}`,
          text: line,
        });
        shared = true;
      } catch {
        // user cancelled or share threw — try clipboard as fallback
      }
    }
    if (!shared) {
      try {
        await navigator.clipboard.writeText(line);
        shared = true;
      } catch {
        // nothing else to do; the button just stays in idle state
      }
    }
    if (shared) {
      setJustSent(true);
      window.setTimeout(() => setJustSent(false), 1800);
    }
  };

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
        {!person.isSelf && (
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label={
              canSend
                ? `Send €${total.toFixed(2)} payment request to ${person.name}`
                : hasUnassigned
                  ? "Resolve unassigned items first"
                  : `${person.name} has nothing to pay`
            }
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full transition-all",
              !canSend
                ? "cursor-not-allowed bg-surface text-fg-dim"
                : justSent
                  ? "bg-success text-white"
                  : "bg-gradient-to-br from-[#FF8A3C] to-[#FF6A00] text-white shadow-[0_0_0_0_rgba(255,106,0,0)] hover:shadow-[0_0_0_4px_rgba(255,106,0,0.18)] active:scale-95",
            )}
          >
            {justSent ? (
              <Check size={16} strokeWidth={3} />
            ) : (
              <ArrowUpRight size={16} strokeWidth={2.5} />
            )}
          </button>
        )}
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
