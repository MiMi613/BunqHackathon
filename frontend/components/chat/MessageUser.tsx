"use client";

/*
 * <MessageUser> — outgoing message bubble.
 *
 * Layout: photo (if any) above the text bubble, both right-aligned.
 * A small <PersonAvatar> sits to the right of the bubble as a visual
 * anchor, mirroring chat-app conventions where each side has an avatar.
 * Uses raw <img> (not next/image) because the source is a client-built
 * data URL.
 */

import { PersonAvatar } from "@/components/atoms/PersonAvatar";
import { SELF_AVATAR_URL, SELF_NAME } from "@/lib/utils/self";
import type { UserMessage } from "@/lib/store/chatStore";

interface MessageUserProps {
  message: UserMessage;
}

export function MessageUser({ message }: MessageUserProps) {
  return (
    <div className="flex justify-end gap-2">
      <div className="flex max-w-[78%] flex-col items-end gap-2">
        {message.imageDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.imageDataUrl}
            alt="Receipt"
            className="w-44 rounded-[20px] border border-hairline object-cover"
          />
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
  );
}
