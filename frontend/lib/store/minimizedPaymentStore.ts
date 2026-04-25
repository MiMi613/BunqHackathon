"use client";

/*
 * Minimized payment chip store.
 *
 * Holds at most one "in flight, just sent" payment request at a time so
 * the user can keep chatting while the confirmation stays accessible.
 * PersonRow pushes here on picker confirm; <MinimizedPaymentBar> reads
 * here to render the floating chip + the re-expanded picker.
 *
 * Single-slot on purpose: a second send replaces the first, which keeps
 * the UI predictable (one chip, never a stack).
 */

import { create } from "zustand";
import type { BunqContact } from "@/lib/mock/bunqContacts";

export type Recipient =
  | { kind: "bunq"; contact: BunqContact }
  | { kind: "share"; method: "system" | "copy" };

export interface MinimizedPayment {
  /** Stable per-row key so re-confirming the same row replaces in place. */
  id: string;
  /** Receipt-side person name (display in row label). */
  personName: string;
  amount: number;
  merchant: string;
  recipient: Recipient;
  shareText: string;
  bunqUrl: string;
}

interface State {
  current: MinimizedPayment | null;
  minimize: (p: MinimizedPayment) => void;
  /** Replace recipient on the current chip (used when re-confirming). */
  updateRecipient: (id: string, recipient: Recipient) => void;
  dismiss: () => void;
}

export const useMinimizedPaymentStore = create<State>((set) => ({
  current: null,
  minimize: (p) => set({ current: p }),
  updateRecipient: (id, recipient) =>
    set((s) =>
      s.current && s.current.id === id
        ? { current: { ...s.current, recipient } }
        : s,
    ),
  dismiss: () => set({ current: null }),
}));
