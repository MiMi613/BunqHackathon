"use client";

/*
 * <SendRequests> — small status hint at the bottom of the SplitCard.
 *
 * The CTA used to be a single global "Send payment requests" button, but
 * the per-person send buttons in <PersonRow> now own that action (one
 * bunq.me link per person). This component only renders a status pill:
 *
 *   blocked         → "Assign all items before sending" (red pill)
 *   nothing owed    → "Nothing to request" (muted)
 *   ready           → discoverability hint pointing at the per-person
 *                     arrow buttons in each row.
 *
 * The (card, blocked) prop interface is preserved so SplitCard does not
 * need to change.
 */

import { ArrowUpRight, Lock } from "lucide-react";
import { computePersonTotal } from "@/lib/utils/share";
import type { SplitCardData } from "@/lib/types/split";

interface SendRequestsProps {
  card: SplitCardData;
  blocked: boolean;
}

export function SendRequests({ card, blocked }: SendRequestsProps) {
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
    <div className="flex items-center justify-center gap-1.5 rounded-full bg-elevated/60 py-2.5 text-xs text-fg-muted">
      <ArrowUpRight size={12} className="text-primary" />
      Tap the arrow next to each person to send their request
    </div>
  );
}
