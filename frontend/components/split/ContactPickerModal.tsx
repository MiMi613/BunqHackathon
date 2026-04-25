"use client";

/*
 * <ContactPickerModal> — bottom-sheet contact picker for payment requests.
 *
 * Two tabs:
 *  1. "Bunq contacts" — searchable list of mock bunq contacts. Tapping a
 *     contact resolves the modal as { kind: "bunq", contact } and the
 *     parent marks the row as sent.
 *  2. "Share link" — fallback for recipients without bunq. Shows the
 *     pre-built message + bunq.me link, with a system-share button
 *     (navigator.share) and a copy-to-clipboard button. Resolves with
 *     { kind: "share", method: "system" | "copy" }.
 *
 * The picker matches the existing modal pattern (Framer Motion + dimmed
 * backdrop, body-scroll lock, Esc closes) so it feels native to the app.
 *
 * Internal state lives in <PickerSheet>, which is mounted only while
 * `open` is true — that way each session starts fresh (default tab,
 * empty query) without an effect-driven reset.
 */

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Copy,
  Link2,
  Search,
  Send,
  Share2,
  Users,
  X,
} from "lucide-react";
import { PersonAvatar } from "@/components/atoms/PersonAvatar";
import { Money } from "@/components/atoms/Money";
import { cn } from "@/lib/utils/cn";
import {
  MOCK_BUNQ_CONTACTS,
  rankContactsByName,
  type BunqContact,
} from "@/lib/mock/bunqContacts";

export type ContactPickerResult =
  | { kind: "bunq"; contact: BunqContact }
  | { kind: "share"; method: "system" | "copy" };

interface ContactPickerModalProps {
  open: boolean;
  /** Display name of the person this request is for ("Marco", "Sofia"…). */
  personName: string;
  /** Amount owed by that person, EUR. Shown in the header. */
  amount: number;
  /** Merchant label, used in the header subtitle. */
  merchant: string;
  /** Pre-built message + bunq.me link to share via system / clipboard. */
  shareText: string;
  /** Just the bunq.me URL — used for "Copy link" button. */
  bunqUrl: string;
  onClose: () => void;
  onConfirm: (result: ContactPickerResult) => void;
}

type Tab = "bunq" | "share";

export function ContactPickerModal(props: ContactPickerModalProps) {
  return (
    <AnimatePresence>
      {props.open && <PickerSheet {...props} />}
    </AnimatePresence>
  );
}

function PickerSheet({
  personName,
  amount,
  merchant,
  shareText,
  bunqUrl,
  onClose,
  onConfirm,
}: ContactPickerModalProps) {
  const [tab, setTab] = useState<Tab>("bunq");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  // Body-scroll lock + Esc-to-close, mirroring the existing lightbox modal.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Pre-rank contacts by similarity to the person's name so the most likely
  // match floats to the top, then filter by the live search query.
  const contacts = useMemo(() => {
    const ranked = rankContactsByName(MOCK_BUNQ_CONTACTS, personName);
    const q = query.trim().toLowerCase();
    if (!q) return ranked;
    return ranked.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q),
    );
  }, [personName, query]);

  const flashCopied = () => {
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const handleSystemShare = async () => {
    // navigator.share is only present in secure contexts on supported
    // browsers; gracefully fall back to copy if unavailable or cancelled.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Payment request — ${merchant}`,
          text: shareText,
        });
        onConfirm({ kind: "share", method: "system" });
        return;
      } catch {
        // User cancelled or share failed — leave the modal open so they
        // can try again or copy the link instead.
        return;
      }
    }
    await handleCopy();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      flashCopied();
      onConfirm({ kind: "share", method: "copy" });
    } catch {
      // Clipboard blocked — surface a console error and keep the modal up
      // rather than misleading the user with a fake success state.
      console.error("Clipboard write failed");
    }
  };

  const handleCopyLinkOnly = async () => {
    try {
      await navigator.clipboard.writeText(bunqUrl);
      flashCopied();
    } catch {
      console.error("Clipboard write failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Send payment request"
    >
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-t-[28px] border border-hairline bg-surface pb-[env(safe-area-inset-bottom)] sm:rounded-[28px]"
      >
        {/* Drag handle (visual only, signals "this is a sheet") */}
        <div className="flex justify-center pt-2 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-fg-dim/50" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 pb-3 pt-3">
          <PersonAvatar name={personName} size="md" />
          <div className="min-w-0 flex-1">
            <div className="text-xs uppercase tracking-wide text-fg-muted">
              Send request to
            </div>
            <div className="mt-0.5 truncate text-base font-bold leading-tight">
              {personName}
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <Money
                amount={amount}
                className="text-lg font-bold tracking-tight"
              />
              <span className="truncate text-xs text-fg-muted">
                · {merchant}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-elevated text-fg-muted transition-colors hover:text-fg active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="mx-5 mb-3 mt-1 grid grid-cols-2 gap-1 rounded-full bg-elevated p-1">
          <TabButton
            active={tab === "bunq"}
            onClick={() => setTab("bunq")}
            icon={<Users size={14} strokeWidth={2.5} />}
            label="Bunq contacts"
          />
          <TabButton
            active={tab === "share"}
            onClick={() => setTab("share")}
            icon={<Share2 size={14} strokeWidth={2.5} />}
            label="Share link"
          />
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {tab === "bunq" ? (
              <motion.div
                key="bunq"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="flex h-full flex-col"
              >
                <div className="px-5 pb-2">
                  <div className="flex items-center gap-2 rounded-[var(--radius-input)] bg-elevated px-3 py-2.5 ring-1 ring-hairline focus-within:ring-2 focus-within:ring-primary/50">
                    <Search size={15} className="text-fg-muted" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search bunq contacts…"
                      className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-dim"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                </div>

                <ul className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
                  {contacts.length === 0 ? (
                    <li className="px-2 py-10 text-center text-sm text-fg-muted">
                      No matching contacts
                    </li>
                  ) : (
                    contacts.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() =>
                            onConfirm({ kind: "bunq", contact: c })
                          }
                          className="group flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-elevated active:scale-[0.99]"
                        >
                          <PersonAvatar name={c.name} size="md" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold leading-tight">
                              {c.name}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1 text-xs text-fg-muted">
                              <span className="truncate">@{c.handle}</span>
                              {c.country && (
                                <span className="rounded-full bg-elevated/80 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-fg-dim ring-1 ring-hairline group-hover:bg-base/60">
                                  {c.country}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                            <Send size={14} strokeWidth={2.5} />
                          </div>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </motion.div>
            ) : (
              <motion.div
                key="share"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="flex h-full flex-col gap-3 px-5 pb-5"
              >
                <p className="text-sm text-fg-muted">
                  Recipient doesn&apos;t use bunq? Share the payment link
                  anywhere — they can pay without an account.
                </p>

                <div className="rounded-[20px] border border-hairline bg-elevated p-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
                    <Link2 size={11} />
                    Message preview
                  </div>
                  <p className="whitespace-pre-wrap break-words text-sm leading-snug text-fg">
                    {shareText}
                  </p>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLinkOnly}
                    className="flex items-center justify-center gap-2 rounded-full bg-elevated px-4 py-3 text-sm font-semibold text-fg transition-colors hover:bg-elevated/80 active:scale-[0.98]"
                  >
                    <AnimatePresence initial={false} mode="wait">
                      {copied ? (
                        <motion.span
                          key="copied"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="inline-flex items-center gap-2"
                        >
                          <Check size={14} strokeWidth={3} />
                          Copied
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="inline-flex items-center gap-2"
                        >
                          <Copy size={14} strokeWidth={2.5} />
                          Copy link
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  <button
                    type="button"
                    onClick={handleSystemShare}
                    className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#FF8A3C] to-[#FF6A00] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_-12px_rgba(255,106,0,0.7)] transition-shadow active:scale-[0.98]"
                  >
                    <Share2 size={14} strokeWidth={2.5} />
                    Share…
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
        active ? "text-fg" : "text-fg-muted hover:text-fg",
      )}
    >
      {active && (
        <motion.span
          layoutId="contact-picker-tab"
          className="absolute inset-0 rounded-full bg-surface ring-1 ring-hairline"
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        />
      )}
      <span className="relative inline-flex items-center gap-1.5">
        {icon}
        {label}
      </span>
    </button>
  );
}
