"use client";

/*
 * <SendRequests> — global CTA at the bottom of the SplitCard.
 *
 * States:
 *  - blocked          → red pill "Assign all items before sending"
 *  - nothing owed     → muted pill "Nothing to request"
 *  - ready, not sent  → full-width orange "Send to all" button
 *  - ready, all sent  → success-tinted "All payments sent" button
 *                       (still tappable — replays each row's confirmation
 *                       toast for those who want to repeat the gesture)
 *
 * Tapping "Send to all" delegates to onSendAll(). The parent SplitCard
 * bumps the per-person sendCount, which makes each PersonRow flip to the
 * green "Payment sent" state and play its confirmation toast.
 */

import { AnimatePresence, motion } from "framer-motion";
import { Check, Lock, Send } from "lucide-react";
import { computePersonTotal } from "@/lib/utils/share";
import { cn } from "@/lib/utils/cn";
import type { SplitCardData } from "@/lib/types/split";

interface SendRequestsProps {
  card: SplitCardData;
  blocked: boolean;
  allSent: boolean;
  onSendAll: () => void;
}

export function SendRequests({
  card,
  blocked,
  allSent,
  onSendAll,
}: SendRequestsProps) {
  const othersOweSomething = card.people.some(
    (p) => !p.isSelf && computePersonTotal(card, p.id) > 0.01,
  );

  if (blocked) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-full bg-danger/10 py-2.5 text-xs font-medium text-danger">
        <Lock size={12} />
        Assign all items before sending
      </div>
    );
  }

  if (!othersOweSomething) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-full bg-elevated py-2.5 text-xs text-fg-muted">
        Nothing to request
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSendAll}
      aria-label={
        allSent ? "Replay all payment confirmations" : "Send payment requests to everyone"
      }
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white transition-[transform,background,box-shadow] duration-200 ease-out active:scale-[0.98]",
        allSent
          ? "bg-success shadow-[0_0_0_4px_rgba(29,214,124,0.18)]"
          : "bg-gradient-to-br from-[#FF8A3C] to-[#FF6A00] shadow-[0_8px_24px_-12px_rgba(255,106,0,0.7)] hover:shadow-[0_8px_28px_-8px_rgba(255,106,0,0.8)]",
      )}
    >
      <AnimatePresence initial={false} mode="wait">
        {allSent ? (
          <motion.span
            key="all-sent"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="inline-flex items-center gap-2"
          >
            <Check size={16} strokeWidth={3} />
            All payment requests sent
          </motion.span>
        ) : (
          <motion.span
            key="send-all"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="inline-flex items-center gap-2"
          >
            <Send size={15} strokeWidth={2.5} />
            Send to all
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
