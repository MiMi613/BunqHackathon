"use client";

/*
 * <PersonRow> — one row per person in the SplitCard.
 *
 * Acts as a droppable zone (id = "person:<id>"): dropping an ItemChip here
 * reassigns the item solely to this person.
 *
 * Right side of the row:
 *  - <Money> with the person's current total.
 *  - A per-person send button (non-self only). It does NOT actually fire
 *    navigator.share / clipboard — it only delegates to the parent via
 *    onSend(). The parent owns the per-person sendCount; we read it back as
 *    a prop and replay the confirmation toast each time the count bumps
 *    (whether from this row's button or from a global "Send to all").
 *
 * The button is disabled when:
 *  - the person owes nothing (no items / 0¢), OR
 *  - any item on the card is unassigned (totals are not final).
 *
 * Drag affordance: when ANY chip is being dragged, the row gains a soft
 * primary ring as a "you can drop here" hint. When the chip is over THIS
 * row specifically, the ring intensifies, the row tints, and it lifts a
 * touch via translateY for tactile feedback.
 */

import { useEffect, useRef, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Link2, Plus, Send, Share2 } from "lucide-react";
import { PersonAvatar } from "@/components/atoms/PersonAvatar";
import { Money } from "@/components/atoms/Money";
import { ItemChip } from "./ItemChip";
import { ContactPickerModal } from "./ContactPickerModal";
import { cn } from "@/lib/utils/cn";
import {
  buildBunqMeUrl,
  buildShareLine,
  computePersonTotal,
} from "@/lib/utils/share";
import {
  useMinimizedPaymentStore,
  type Recipient,
} from "@/lib/store/minimizedPaymentStore";
import type { Person, SplitCardData } from "@/lib/types/split";

interface PersonRowProps {
  person: Person;
  card: SplitCardData;
  /** Bumped by the parent every time a "send" is fired for this person. */
  sendCount: number;
  /** Asks the parent to record one more send for this person. */
  onSend: () => void;
}

export function PersonRow({ person, card, sendCount, onSend }: PersonRowProps) {
  const { setNodeRef, isOver, active } = useDroppable({
    id: `person:${person.id}`,
  });
  const isDragActive = Boolean(active);

  const isSent = sendCount > 0;

  // Local toast trigger: bumps when sendCount increments (from this button OR
  // from "Send to all"). Skip the initial render so a row mounted with
  // sendCount > 0 doesn't fire a phantom toast.
  const [confirmTick, setConfirmTick] = useState(0);
  const prevSendCount = useRef(sendCount);
  useEffect(() => {
    if (sendCount > prevSendCount.current) setConfirmTick((n) => n + 1);
    prevSendCount.current = sendCount;
  }, [sendCount]);

  const [pickerOpen, setPickerOpen] = useState(false);

  // Local memory of the last recipient for THIS row, so the row keeps its
  // "Sent to @marco.rossi" subtitle even after the global chip is dismissed.
  const [confirmedRecipient, setConfirmedRecipient] = useState<Recipient | null>(
    null,
  );

  // While the global chip is alive AND tied to this row, prefer its recipient
  // (so re-confirming a different contact via the chip syncs the row label).
  const myKey = `${card.splitId}:${person.id}`;
  const minimizedCurrent = useMinimizedPaymentStore((s) => s.current);
  const minimize = useMinimizedPaymentStore((s) => s.minimize);
  const fromMinimized =
    minimizedCurrent?.id === myKey ? minimizedCurrent.recipient : null;
  const lastRecipient = fromMinimized ?? confirmedRecipient;

  const items = card.items.filter((i) => i.assignedTo.includes(person.id));
  const total = computePersonTotal(card, person.id);
  const hasUnassigned = card.items.some((i) => i.assignedTo.length === 0);
  const canSend = !person.isSelf && total > 0.01 && !hasUnassigned;

  const handleSend = () => {
    if (!canSend) return;
    setPickerOpen(true);
  };

  // The picker resolves successfully via either: a bunq contact tap, a
  // confirmed system share, or a clipboard copy. In all three cases we
  // count it as "sent" — the row flips to its success state.
  const shareText = buildShareLine(card, person.id) ?? "";
  const bunqUrl = buildBunqMeUrl(total, card.merchant);

  // Subtitle + recipient avatar, derived from whichever recipient we know
  // about. Falls back to the generic "Payment sent" when we have a sendCount
  // but no recipient (e.g. row was bumped via "Send to all").
  const recipientName =
    lastRecipient?.kind === "bunq" ? lastRecipient.contact.name : null;
  const recipientSubtitle = (() => {
    if (!isSent) return null;
    if (lastRecipient?.kind === "bunq") return `@${lastRecipient.contact.handle}`;
    if (lastRecipient?.kind === "share")
      return lastRecipient.method === "system"
        ? "Shared via link"
        : "Link copied";
    return "Payment sent";
  })();

  return (
    <>
    <div
      ref={setNodeRef}
      className={cn(
        "relative rounded-[20px] border bg-elevated p-3 transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out",
        // Resting state
        "border-hairline",
        // Once a payment has been confirmed, keep a subtle success accent.
        isSent && "border-success/35 bg-success/[0.04]",
        // Any drag in progress: subtle invitation ring (overrides sent tint).
        isDragActive && "border-primary/25 bg-elevated/80",
        // This row is the active target.
        isOver &&
          "-translate-y-0.5 border-primary bg-primary/10 shadow-[0_8px_24px_-12px_rgba(255,106,0,0.6)]",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <PersonAvatar name={person.name} isSelf={person.isSelf} size="md" />
          {isSent && (
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full ring-2 ring-elevated"
              aria-hidden
            >
              {/* Recipient micro-tile: who the request actually went to.
                  bunq contact → tiny overlapping avatar; share → tiny icon
                  tile. Falls back to a green check when we don't know yet. */}
              {lastRecipient?.kind === "bunq" ? (
                <span className="block size-5 overflow-hidden rounded-full ring-1 ring-success">
                  <PersonAvatar
                    name={lastRecipient.contact.name}
                    size="sm"
                    className="size-5 rounded-full text-[9px]"
                  />
                </span>
              ) : lastRecipient?.kind === "share" ? (
                <span className="flex size-5 items-center justify-center rounded-full bg-success text-white">
                  {lastRecipient.method === "system" ? (
                    <Share2 size={10} strokeWidth={3} />
                  ) : (
                    <Link2 size={10} strokeWidth={3} />
                  )}
                </span>
              ) : (
                <span className="flex size-4 items-center justify-center rounded-full bg-success">
                  <Check size={10} strokeWidth={3.5} className="text-white" />
                </span>
              )}
            </motion.span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="truncate font-semibold leading-tight">
              {person.isSelf
                ? "Me"
                : recipientName && lastRecipient?.kind === "bunq"
                  ? recipientName
                  : person.name}
            </span>
            {/* Show the receipt-side name as a secondary chip when the chosen
                contact's full name has replaced it, so the link to the
                original receipt person stays visible. */}
            {!person.isSelf &&
              recipientName &&
              lastRecipient?.kind === "bunq" &&
              recipientName.toLowerCase() !== person.name.toLowerCase() && (
                <span className="truncate text-[10px] uppercase tracking-wide text-fg-dim">
                  · {person.name}
                </span>
              )}
          </div>
          <div className="mt-0.5 text-xs text-fg-muted">
            {isSent
              ? recipientSubtitle
              : items.length === 0
                ? "No items yet"
                : `${items.length} ${items.length === 1 ? "item" : "items"}`}
          </div>
        </div>
        <Money amount={total} className="text-lg font-bold tracking-tight" />
        {!person.isSelf && (
          <button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label={
              canSend
                ? isSent
                  ? `Payment sent to ${person.name} — send again`
                  : `Send payment request to ${person.name}`
                : hasUnassigned
                  ? "Resolve unassigned items first"
                  : `${person.name} has nothing to pay`
            }
            className={cn(
              "relative flex size-9 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,box-shadow] duration-200 ease-out active:scale-[0.94]",
              !canSend
                ? "cursor-not-allowed bg-surface text-fg-dim"
                : isSent
                  ? "bg-success text-white shadow-[0_0_0_4px_rgba(29,214,124,0.18)]"
                  : "bg-gradient-to-br from-[#FF8A3C] to-[#FF6A00] text-white hover:shadow-[0_0_0_4px_rgba(255,106,0,0.18)]",
            )}
          >
            <AnimatePresence initial={false} mode="wait">
              {isSent ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                  className="flex"
                >
                  <Check size={16} strokeWidth={3} />
                </motion.span>
              ) : (
                <motion.span
                  key="send"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                  className="flex -translate-x-px"
                >
                  <Send size={15} strokeWidth={2.5} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        )}
      </div>

      {/* Floating confirmation pill — keyed on confirmTick so it replays on
          every send, including sends triggered by the global "Send to all". */}
      <AnimatePresence>
        {confirmTick > 0 && <ConfirmationPill key={confirmTick} />}
      </AnimatePresence>

      {items.length > 0 ? (
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
                <ItemChip item={item} sharedAmong={item.assignedTo.length} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        // Ghost placeholder — only meaningful while a drag is in progress, so
        // we hide it the rest of the time to keep the row compact.
        isDragActive && (
          <div
            className={cn(
              "mt-3 flex items-center justify-center gap-1.5 rounded-full border border-dashed py-2 text-xs font-medium transition-colors duration-200",
              isOver
                ? "border-primary text-primary"
                : "border-hairline text-fg-dim",
            )}
          >
            <Plus size={12} strokeWidth={2.5} />
            Drop to assign
          </div>
        )
      )}
    </div>

    <ContactPickerModal
      open={pickerOpen}
      personName={person.name}
      amount={total}
      merchant={card.merchant}
      shareText={shareText}
      bunqUrl={bunqUrl}
      onClose={() => setPickerOpen(false)}
      onConfirm={(result) => {
        setConfirmedRecipient(result);
        setPickerOpen(false);
        onSend();
        // Hand off to the global floating chip so the user can keep
        // chatting while the just-sent payment stays one tap away.
        minimize({
          id: myKey,
          personName: person.name,
          amount: total,
          merchant: card.merchant,
          recipient: result,
          shareText,
          bunqUrl,
        });
      }}
    />
    </>
  );
}

/*
 * <ConfirmationPill> — toast-style "Payment sent" badge that pops out from
 * above the row's send button, holds briefly, then fades. Auto-unmounts
 * 1.6s after mount via AnimatePresence + an internal effect — the parent
 * just keys it on a tick to replay on each send.
 */
function ConfirmationPill() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), 1600);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.96 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          className="pointer-events-none absolute -top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-success px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(29,214,124,0.7)]"
        >
          <Check size={12} strokeWidth={3} />
          Payment sent
        </motion.div>
      )}
    </AnimatePresence>
  );
}
