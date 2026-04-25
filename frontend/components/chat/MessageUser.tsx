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
 */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { PersonAvatar } from "@/components/atoms/PersonAvatar";
import { SELF_AVATAR_URL, SELF_NAME } from "@/lib/utils/self";
import type { UserMessage } from "@/lib/store/chatStore";

interface MessageUserProps {
  message: UserMessage;
}

export function MessageUser({ message }: MessageUserProps) {
  const [isOpen, setIsOpen] = useState(false);

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
          {message.text && (
            <div className="rounded-[20px] rounded-br-sm bg-primary px-4 py-2.5 text-sm leading-snug text-white">
              {message.text}
            </div>
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
