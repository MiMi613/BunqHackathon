"use client";

/*
 * <MessageUser> — outgoing message bubble.
 *
 * Photo on top (rounded, max width), text bubble below (primary orange).
 * Aligned to the right. Uses <img> directly (not next/image) because the
 * source is a data URL built client-side from FileReader.
 */

import type { UserMessage } from "@/lib/store/chatStore";

interface MessageUserProps {
  message: UserMessage;
}

export function MessageUser({ message }: MessageUserProps) {
  return (
    <div className="flex justify-end">
      <div className="flex max-w-[80%] flex-col items-end gap-2">
        {message.imageDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.imageDataUrl}
            alt="Receipt"
            className="w-48 rounded-[20px] border border-hairline object-cover"
          />
        )}
        {message.text && (
          <div className="rounded-[20px] rounded-br-sm bg-primary px-4 py-2.5 text-sm text-white">
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
