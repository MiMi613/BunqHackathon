"use client";

/*
 * <MessageAgent> — agent response wrapper.
 *
 * Branches on status:
 *   loading → animated dots, left-aligned, small surface bubble
 *   error   → danger-tinted bubble with the error message
 *   ready   → the SplitCard itself (full width, no bubble)
 */

import { SplitCard } from "@/components/split/SplitCard";
import type { AgentMessage } from "@/lib/store/chatStore";

interface MessageAgentProps {
  message: AgentMessage;
}

export function MessageAgent({ message }: MessageAgentProps) {
  if (message.status === "loading") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[80%] rounded-[20px] rounded-bl-sm border border-hairline bg-surface px-4 py-3">
          <div className="flex items-center gap-3 text-fg-muted">
            <div className="flex gap-1">
              <span className="size-2 animate-pulse rounded-full bg-fg-muted" />
              <span className="size-2 animate-pulse rounded-full bg-fg-muted [animation-delay:150ms]" />
              <span className="size-2 animate-pulse rounded-full bg-fg-muted [animation-delay:300ms]" />
            </div>
            <span className="text-sm">Reading your receipt…</span>
          </div>
        </div>
      </div>
    );
  }

  if (message.status === "error") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%] rounded-[20px] rounded-bl-sm border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {message.error ?? "Something went wrong parsing the receipt."}
        </div>
      </div>
    );
  }

  if (!message.splitCard) return null;
  return <SplitCard card={message.splitCard} />;
}
