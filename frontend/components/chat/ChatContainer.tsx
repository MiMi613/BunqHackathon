"use client";

/*
 * <ChatContainer> — the top-level shell for the /chat route.
 *
 * Layout (mobile-first, full viewport):
 *   ┌ messages (flex-1, scrollable, AnimatePresence for entrance,
 *   │           auto-scrolls to bottom when the list grows)
 *   └ input bar (sticky, safe-area padded)
 *
 * No header — the chat owns the full viewport. The scroll area gets a
 * top safe-area padding so content does not sit under the iOS status bar
 * or notch when the page is opened from the home screen.
 *
 * Empty state: a welcome card with an animated brand orb.
 */

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useChatStore } from "@/lib/store/chatStore";
import { MinimizedPaymentBar } from "@/components/split/MinimizedPaymentBar";
import { MessageUser } from "./MessageUser";
import { MessageAgent } from "./MessageAgent";
import { InputBar } from "./InputBar";

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-5 py-20 text-center">
      <div className="relative">
        {/* Soft pulsing brand orb */}
        <div
          aria-hidden
          className="absolute inset-0 -m-4 animate-pulse rounded-full bg-primary/20 blur-2xl"
        />
        <div className="relative flex size-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#FF8A3C] to-[#FF3B5C] text-white">
          <Sparkles size={28} />
        </div>
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight">
          Split any bill in seconds
        </h2>
        <p className="max-w-xs text-sm text-fg-muted">
          Snap a photo of your receipt and tell us who had what. We&apos;ll
          handle the math.
        </p>
      </div>
    </div>
  );
}

export function ChatContainer() {
  const messages = useChatStore((s) => s.messages);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest message whenever the list changes (new msg,
  // loading → ready, etc.).
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="flex h-dvh flex-col bg-base">
      <main className="flex-1 overflow-y-auto px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)]">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  {m.role === "user" ? (
                    <MessageUser message={m} />
                  ) : (
                    <MessageAgent message={m} />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      <InputBar />
      <MinimizedPaymentBar />
    </div>
  );
}
