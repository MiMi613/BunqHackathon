"use client";

/*
 * <MessageAgent> — agent response wrapper.
 *
 * Loading: small surface bubble with three pulsing dots.
 * Error:   danger-tinted bubble with the message.
 * Ready:   the full SplitCard, no bubble (the card itself is the message).
 *
 * A small Sparkles tile sits to the left in loading/error states as a
 * visual anchor — for "ready" we let the SplitCard own the full width
 * so its glow and content can breathe.
 */

import { Sparkles } from "lucide-react";
import { SplitCard } from "@/components/split/SplitCard";
import type { AgentMessage } from "@/lib/store/chatStore";

interface MessageAgentProps {
  message: AgentMessage;
}

function AgentTile() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-secondary to-[#1D4ED8] text-white">
      <Sparkles size={16} />
    </div>
  );
}

export function MessageAgent({ message }: MessageAgentProps) {
  if (message.status === "loading") {
    return (
      <div className="flex justify-start gap-2">
        <AgentTile />
        <div className="max-w-[78%] rounded-[20px] rounded-bl-sm border border-hairline bg-surface px-4 py-3">
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
      <div className="flex justify-start gap-2">
        <AgentTile />
        <div className="max-w-[88%] rounded-[20px] rounded-bl-sm border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {message.error ?? "Something went wrong parsing the receipt."}
        </div>
      </div>
    );
  }

  if (!message.splitCard) return null;
  return <SplitCard card={message.splitCard} />;
}
