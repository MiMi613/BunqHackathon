"use client";

/*
 * <ChatContainer> — the top-level shell for the /chat route.
 *
 * Layout (mobile-first, full viewport):
 *   ┌ header (sticky, hairline border)
 *   │ messages (flex-1, scrollable, auto-scrolls to bottom on new msg)
 *   └ input bar (sticky, safe-area padded)
 *
 * Empty state: a welcome card that explains how to start. Auto-scroll
 * uses a sentinel <div> at the end of the list with scrollIntoView.
 */

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { useChatStore } from "@/lib/store/chatStore";
import { MessageUser } from "./MessageUser";
import { MessageAgent } from "./MessageAgent";
import { InputBar } from "./InputBar";

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-[18px] bg-primary/15 text-primary">
        <Sparkles size={26} />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Split any bill in seconds</h2>
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

  // Auto-scroll to the newest message whenever the list grows or the
  // latest agent message changes (e.g. loading → ready).
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="flex h-dvh flex-col bg-base">
      <header className="flex shrink-0 items-center justify-between border-b border-hairline bg-base/80 px-4 py-3 backdrop-blur">
        <h1 className="text-base font-bold tracking-tight">bunq Split</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m) =>
              m.role === "user" ? (
                <MessageUser key={m.id} message={m} />
              ) : (
                <MessageAgent key={m.id} message={m} />
              ),
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </main>

      <InputBar />
    </div>
  );
}
