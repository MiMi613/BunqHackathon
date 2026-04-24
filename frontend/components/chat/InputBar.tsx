"use client";

/*
 * <InputBar> — sticky-bottom composer.
 *
 * Layout: [camera button] [textarea] [send button]
 * Above the row, when a photo is picked, a small preview strip appears
 * with a remove (×) button.
 *
 * Choices:
 *  - capture="environment" tells iOS/Android to open the rear camera
 *    when tapping the camera button (best UX for receipts).
 *  - A photo is required to send: the send button is disabled until both
 *    a photo AND some text are present (the backend needs a user_prompt).
 *  - Respects iOS safe-area with pb calc'ing env(safe-area-inset-bottom).
 */

import { useRef, useState } from "react";
import { Camera, Send, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useChatStore } from "@/lib/store/chatStore";

export function InputBar() {
  const send = useChatStore((s) => s.send);

  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSend =
    !isSending && text.trim().length > 0 && image !== null && imageDataUrl;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImageDataUrl(String(reader.result));
    reader.readAsDataURL(file);
    // reset the input value so picking the same file twice still fires change
    e.target.value = "";
  };

  const clearImage = () => {
    setImage(null);
    setImageDataUrl(null);
  };

  const handleSend = async () => {
    if (!canSend || !image || !imageDataUrl) return;
    setIsSending(true);
    try {
      await send({ text: text.trim(), image, imageDataUrl });
      setText("");
      setImage(null);
      setImageDataUrl(null);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="shrink-0 border-t border-hairline bg-surface px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {imageDataUrl && (
        <div className="mb-2 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageDataUrl}
            alt="Selected receipt"
            className="size-14 rounded-[12px] object-cover"
          />
          <button
            type="button"
            onClick={clearImage}
            className="flex items-center gap-1 rounded-full bg-elevated px-3 py-1 text-xs text-fg-muted"
          >
            <X size={14} />
            Remove
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-elevated text-fg disabled:opacity-40"
          aria-label="Attach photo"
        >
          <Camera size={20} />
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            image ? "Who had what?" : "Add a photo of your receipt to start…"
          }
          rows={1}
          disabled={isSending}
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-[var(--radius-input)] bg-elevated px-4 py-3 text-sm text-fg outline-none placeholder:text-fg-dim disabled:opacity-60"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-opacity",
            !canSend && "cursor-not-allowed opacity-40",
          )}
          aria-label="Send"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
