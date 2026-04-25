"use client";

/*
 * <MinimizedPaymentBar> — global floating chip for the most recently sent
 * payment request. Mounted once at the chat root.
 *
 * After PersonRow confirms a recipient via the picker, the picker dismisses
 * and a chip pops up here, anchored above the InputBar. The chip carries
 * enough context to re-open the picker (shareText, bunqUrl, etc.) so the
 * user can resend or change recipient without re-tapping the row.
 *
 * Design choices:
 *  - Single-slot: replacing not stacking, to keep the surface calm.
 *  - Tap chip = re-expand picker. Separate × dismisses fully.
 *  - Recipient avatar reflects the chosen contact (or a Share2 tile when
 *    the user shared a link), so the chip visually stays consistent with
 *    *what* was just sent.
 */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, Link2, Share2, X } from "lucide-react";
import { PersonAvatar } from "@/components/atoms/PersonAvatar";
import { Money } from "@/components/atoms/Money";
import { useMinimizedPaymentStore } from "@/lib/store/minimizedPaymentStore";
import { ContactPickerModal } from "./ContactPickerModal";

export function MinimizedPaymentBar() {
  const current = useMinimizedPaymentStore((s) => s.current);
  const dismiss = useMinimizedPaymentStore((s) => s.dismiss);
  const updateRecipient = useMinimizedPaymentStore((s) => s.updateRecipient);
  const minimize = useMinimizedPaymentStore((s) => s.minimize);

  const [reopenedFor, setReopenedFor] = useState<string | null>(null);

  const isReopen = current !== null && reopenedFor === current.id;

  // The chip's left tile mirrors the chosen recipient: contact avatar for
  // a bunq pick, share/link icon for a system-share or clipboard copy.
  const recipientLabel = current
    ? current.recipient.kind === "bunq"
      ? `@${current.recipient.contact.handle}`
      : current.recipient.method === "system"
        ? "Shared via link"
        : "Link copied"
    : "";

  return (
    <>
      <AnimatePresence>
        {current && !isReopen && (
          <motion.div
            key={current.id}
            initial={{ y: 96, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 96, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
            className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-3"
            style={{ bottom: "calc(env(safe-area-inset-bottom) + 86px)" }}
          >
            <div className="pointer-events-auto flex w-full max-w-md items-center gap-1.5 rounded-full border border-success/30 bg-surface/95 py-1.5 pl-1.5 pr-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)] backdrop-blur-md">
              <button
                type="button"
                onClick={() => setReopenedFor(current.id)}
                aria-label={`Re-open payment to ${current.personName}`}
                className="group flex flex-1 items-center gap-2.5 rounded-full px-1 py-0.5 text-left transition-colors active:scale-[0.99]"
              >
                <div className="relative shrink-0">
                  {current.recipient.kind === "bunq" ? (
                    <PersonAvatar
                      name={current.recipient.contact.name}
                      size="md"
                    />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-[12px] bg-elevated text-fg-muted">
                      {current.recipient.method === "system" ? (
                        <Share2 size={16} />
                      ) : (
                        <Link2 size={16} />
                      )}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                      Sent
                    </span>
                    <span className="truncate text-sm font-semibold leading-tight">
                      {current.personName}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-fg-muted">
                    <Money
                      amount={current.amount}
                      className="font-semibold text-fg"
                    />
                    <span className="truncate">· {recipientLabel}</span>
                  </div>
                </div>
                <ChevronUp
                  size={16}
                  className="shrink-0 text-fg-muted transition-transform group-hover:-translate-y-0.5 group-hover:text-fg"
                />
              </button>
              <button
                type="button"
                onClick={dismiss}
                aria-label="Dismiss"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-elevated text-fg-muted transition-colors hover:text-fg active:scale-90"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {current && (
        <ContactPickerModal
          open={isReopen}
          personName={current.personName}
          amount={current.amount}
          merchant={current.merchant}
          shareText={current.shareText}
          bunqUrl={current.bunqUrl}
          onClose={() => setReopenedFor(null)}
          onConfirm={(result) => {
            // Re-confirming from the chip: keep the chip alive but swap in
            // the new recipient so the bar stays consistent with the most
            // recent action.
            updateRecipient(current.id, result);
            // Defensive: if the chip somehow got cleared between mount and
            // confirm (shouldn't happen in practice), reseed it so the user
            // doesn't lose the just-sent context.
            if (!useMinimizedPaymentStore.getState().current) {
              minimize({ ...current, recipient: result });
            }
            setReopenedFor(null);
          }}
        />
      )}
    </>
  );
}
