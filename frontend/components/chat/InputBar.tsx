"use client";

/*
 * <InputBar> — sticky-bottom composer.
 *
 * Layout: [camera button] [textarea] [send button]
 * Above the row, when a photo is picked, a preview strip appears with a
 * remove (×) button.
 *
 * UX details:
 *  - The file input has no `capture` attr so mobile browsers offer the user
 *    a chooser between the camera and the existing photo library.
 *  - A photo is required to send (the backend needs an image to OCR).
 *  - Camera button glows orange when an image is attached.
 *  - Textarea shows a primary focus ring.
 *  - Respects iOS safe-area via env(safe-area-inset-bottom).
 */

import { useRef, useState } from "react";
import { Camera, ArrowUp, X } from "lucide-react";
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
    // reset so picking the same file twice still fires change
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter inserts a newline. Ignore IME composition
    // so users typing CJK candidates don't accidentally fire send.
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void handleSend();
    }
  };

  const hasImage = image !== null && imageDataUrl !== null;

  return (
    <div className="shrink-0 border-t border-hairline bg-surface px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      {imageDataUrl && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageDataUrl}
              alt="Selected receipt"
              className="size-14 rounded-[12px] border border-hairline object-cover"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-elevated text-fg-muted ring-2 ring-surface transition-colors hover:text-fg"
              aria-label="Remove photo"
            >
              <X size={12} />
            </button>
          </div>
          <span className="text-xs text-fg-muted">Photo attached</span>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* No `capture` attr: mobile browsers then show their native picker
            (iOS: "Take Photo" / "Photo Library" / "Choose File"; Android:
            camera + gallery chooser), letting the user pick from either. */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSending}
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full transition-all disabled:opacity-40",
            hasImage
              ? "bg-primary/15 text-primary ring-2 ring-primary/40"
              : "bg-elevated text-fg",
          )}
          aria-label="Attach photo"
        >
          <Camera size={20} />
        </button>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            hasImage ? "Who had what?" : "Add a photo of your receipt to start…"
          }
          rows={1}
          disabled={isSending}
          enterKeyHint="send"
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-[var(--radius-input)] bg-elevated px-4 py-3 text-sm text-fg outline-none transition-shadow placeholder:text-fg-dim focus:ring-2 focus:ring-primary/50 disabled:opacity-60"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-all",
            canSend
              ? "bg-gradient-to-br from-[#FF8A3C] to-[#FF6A00] active:scale-95"
              : "cursor-not-allowed bg-elevated text-fg-dim",
          )}
          aria-label="Send"
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
