/*
 * <PersonAvatar> — identifying chip for a person.
 *
 * Choices:
 *  - rounded-[12px] square (not circle), consistent with <CategoryIcon>.
 *  - isSelf=true → always primary (orange) with label "Me": the current
 *    user pops immediately in any card.
 *  - Other people get a deterministic color from the palette via hash of
 *    the name → "Marco" is ALWAYS teal across the entire session. Free
 *    visual consistency.
 *  - First initial only. "Maria Rossi" → "M". Enough for a chip.
 */

import { cn } from "@/lib/utils/cn";

interface PersonAvatarProps {
  name: string;
  isSelf?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const AVATAR_PALETTE = [
  "bg-cat-purple",
  "bg-cat-teal",
  "bg-cat-pink",
  "bg-secondary",
  "bg-warning",
] as const;

// Non-crypto deterministic hash: same name → same color.
function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const SIZE_MAP = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
} as const;

export function PersonAvatar({
  name,
  isSelf = false,
  size = "md",
  className,
}: PersonAvatarProps) {
  const label = isSelf ? "Me" : name.trim().charAt(0).toUpperCase() || "?";
  const colorClass = isSelf
    ? "bg-primary"
    : AVATAR_PALETTE[hashName(name) % AVATAR_PALETTE.length];

  return (
    <div
      className={cn(
        "inline-flex select-none items-center justify-center rounded-[12px] font-semibold text-white",
        SIZE_MAP[size],
        colorClass,
        className,
      )}
      aria-label={isSelf ? "Me" : name}
    >
      {label}
    </div>
  );
}
