"use client";

/*
 * <PersonAvatar> — profile-photo-style chip for a person.
 *
 * Variants:
 *  - photoUrl provided → renders the image full-bleed.
 *  - else → renders a deterministic 2-tone diagonal gradient with a gloss
 *    overlay and the person's initial. Self always uses the brand
 *    orange→red gradient with the "Me" label so it stays instantly
 *    recognisable across cards.
 *
 * The gradient pair is picked from PALETTE via a stable hash of the name,
 * so "Marco" is ALWAYS the same gradient throughout the session.
 */

import { cn } from "@/lib/utils/cn";

interface PersonAvatarProps {
  name: string;
  isSelf?: boolean;
  size?: "sm" | "md" | "lg";
  photoUrl?: string;
  className?: string;
}

interface Gradient {
  from: string;
  to: string;
}

// Six rich gradients, complementary to the category palette in @theme.
const PALETTE: Gradient[] = [
  { from: "#C026D3", to: "#7E22CE" }, // purple
  { from: "#14B8A6", to: "#0D9488" }, // teal
  { from: "#FF2E6C", to: "#DB2777" }, // pink
  { from: "#2D7FF9", to: "#1D4ED8" }, // blue
  { from: "#F5B700", to: "#D97706" }, // amber
  { from: "#1DD67C", to: "#059669" }, // green
];

const SELF_GRADIENT: Gradient = { from: "#FF8A3C", to: "#FF3B5C" };

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const SIZE_MAP = {
  sm: "size-8 text-xs rounded-[10px]",
  md: "size-10 text-sm rounded-[12px]",
  lg: "size-12 text-base rounded-[14px]",
} as const;

export function PersonAvatar({
  name,
  isSelf = false,
  size = "md",
  photoUrl,
  className,
}: PersonAvatarProps) {
  const label = isSelf ? "Me" : name.trim().charAt(0).toUpperCase() || "?";
  const gradient = isSelf
    ? SELF_GRADIENT
    : PALETTE[hashName(name) % PALETTE.length];

  return (
    <div
      className={cn(
        "relative inline-flex select-none items-center justify-center overflow-hidden font-semibold text-white",
        SIZE_MAP[size],
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
      }}
      aria-label={isSelf ? "Me" : name}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          {/* Gloss overlay: gives the tile a touch of depth without a real shadow */}
          <span
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/15"
          />
          <span className="relative tracking-tight">{label}</span>
        </>
      )}
    </div>
  );
}
