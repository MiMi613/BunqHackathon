"use client";

/*
 * <SendRequests> — the final CTA inside a SplitCard.
 *
 * States:
 *  - blocked=true        → disabled, "Assign all items to send"
 *  - nothing owed        → disabled, "Nothing to request" (e.g. user moved
 *                          all items onto themselves)
 *  - ready               → enabled, gradient orange CTA, ArrowUpRight icon
 *
 * On click, builds one text with one line per non-self person and invokes
 * navigator.share() (native share sheet on mobile). Falls back to
 * clipboard if the Web Share API is unavailable (desktop browsers).
 */

import { useMemo } from "react";
import { ArrowUpRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  buildShareText,
  computePersonTotal,
} from "@/lib/utils/share";
import type { SplitCardData } from "@/lib/types/split";

interface SendRequestsProps {
  card: SplitCardData;
  blocked: boolean;
}

export function SendRequests({ card, blocked }: SendRequestsProps) {
  const othersOweSomething = useMemo(
    () =>
      card.people.some(
        (p) => !p.isSelf && computePersonTotal(card, p.id) > 0,
      ),
    [card],
  );

  const disabled = blocked || !othersOweSomething;
  const label = blocked
    ? "Assign all items to send"
    : !othersOweSomething
      ? "Nothing to request"
      : "Send payment requests";

  const handleSend = async () => {
    if (disabled) return;
    const text = buildShareText(card);
    if (!text) return;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "bunq Split", text });
        return;
      } catch {
        // user cancelled or share failed silently; fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied payment requests to clipboard");
    } catch {
      alert("Could not share. Try again.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleSend}
      disabled={disabled}
      className={cn(
        "relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-3.5 font-semibold text-white transition-opacity",
        disabled
          ? "cursor-not-allowed bg-elevated text-fg-muted"
          : "bg-gradient-to-r from-[#FF8A3C] to-[#FF6A00] hover:from-[#FF7A2C] hover:to-[#E65F00] active:scale-[0.99]",
      )}
    >
      {disabled ? <Lock size={16} /> : <ArrowUpRight size={18} />}
      {label}
    </button>
  );
}
