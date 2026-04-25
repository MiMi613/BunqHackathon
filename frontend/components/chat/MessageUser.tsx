"use client";

/*
 * <MessageUser> — outgoing message bubble.
 *
 * Layout: photo (if any) above the text bubble, both right-aligned.
 * A small <PersonAvatar> sits to the right of the bubble as a visual
 * anchor, mirroring chat-app conventions where each side has an avatar.
 * Uses raw <img> (not next/image) because the source is a client-built
 * data URL.
 *
 * Tapping the receipt thumbnail opens a fullscreen lightbox so the user
 * can re-examine the picture they sent without leaving the chat.
 *
 * Tapping the bubble itself enters inline edit mode: the bubble morphs
 * into a textarea with Save / Cancel pills. Saved edits are stamped
 * with editedAt in the store, which renders a discreet "edited" hint.
 */

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, X } from "lucide-react";
import { PersonAvatar } from "@/components/atoms/PersonAvatar";
import { SELF_AVATAR_URL, SELF_NAME } from "@/lib/utils/self";
import { useChatStore, type UserMessage } from "@/lib/store/chatStore";
import { cn } from "@/lib/utils/cn";

interface MessageUserProps {
  message: UserMessage;
}

export function MessageUser({ message }: MessageUserProps) {
  const editUserMessage = useChatStore((s) => s.editUserMessage);

  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Lock body scroll while the lightbox is up, and let Esc close it.
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // When entering edit mode, focus + select the textarea and auto-size it.
  useEffect(() => {
    if (!isEditing) return;
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [isEditing]);

  const enterEdit = () => {
    setDraft(message.text);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft(message.text);
  };

  const saveEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (trimmed !== message.text) editUserMessage(message.id, trimmed);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    } else if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      saveEdit();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <div className="flex max-w-[78%] flex-col items-end gap-2">
          {message.imageDataUrl && (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="overflow-hidden rounded-[20px] border border-hairline transition-transform active:scale-[0.98]"
              aria-label="Open receipt photo"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.imageDataUrl}
                alt="Receipt"
                className="block w-44 object-cover"
              />
            </button>
          )}

          {/* Bubble + edit affordance. The pencil sits to the LEFT of the
              bubble, fading in on hover (desktop) and always discreetly
              visible on touch. Tap it to enter edit mode. */}
          {(message.text || isEditing) && (
            <div className="group flex items-end gap-1.5">
              {!isEditing && (
                <button
                  type="button"
                  onClick={enterEdit}
                  aria-label="Edit message"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-fg-dim opacity-60 transition-all hover:bg-elevated hover:text-fg hover:opacity-100 active:scale-90 group-hover:opacity-100"
                >
                  <Pencil size={13} />
                </button>
              )}

              <AnimatePresence initial={false} mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                    className="flex flex-col items-end gap-2"
                  >
                    <textarea
                      ref={textareaRef}
                      value={draft}
                      onChange={handleTextareaInput}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      enterKeyHint="done"
                      className="min-h-[40px] w-[min(78vw,420px)] resize-none rounded-[20px] rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-snug text-white outline-none ring-2 ring-primary/40 focus:ring-primary/70"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1 rounded-full bg-elevated px-3 py-1.5 text-xs font-semibold text-fg-muted transition-colors hover:text-fg active:scale-95"
                      >
                        <X size={12} strokeWidth={2.5} />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={
                          draft.trim().length === 0 ||
                          draft.trim() === message.text
                        }
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-all active:scale-95",
                          draft.trim().length === 0 ||
                            draft.trim() === message.text
                            ? "cursor-not-allowed bg-elevated text-fg-dim"
                            : "bg-gradient-to-br from-[#FF8A3C] to-[#FF6A00]",
                        )}
                      >
                        <Check size={12} strokeWidth={3} />
                        Save
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="bubble"
                    type="button"
                    onClick={enterEdit}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                    className="rounded-[20px] rounded-br-sm bg-primary px-4 py-2.5 text-left text-sm leading-snug text-white transition-transform active:scale-[0.98]"
                    aria-label="Edit message"
                  >
                    {message.text}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}

          {message.editedAt && !isEditing && (
            <span className="px-1 text-[10px] uppercase tracking-wide text-fg-dim">
              edited
            </span>
          )}
        </div>
        <PersonAvatar
          name={SELF_NAME}
          isSelf
          photoUrl={SELF_AVATAR_URL}
          size="sm"
        />
      </div>

      <AnimatePresence>
        {isOpen && message.imageDataUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setIsOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Receipt photo"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="absolute right-4 top-[calc(env(safe-area-inset-top)+1rem)] flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <motion.img
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              src={message.imageDataUrl}
              alt="Receipt"
              onClick={(e) => e.stopPropagation()}
              className="max-h-full max-w-full rounded-[16px] object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
