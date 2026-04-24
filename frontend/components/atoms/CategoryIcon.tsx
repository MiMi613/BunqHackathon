/*
 * <CategoryIcon> — colored tile with a centered white icon.
 *
 * Signature pattern: rounded-[14px] square, solid category-color background,
 * white lucide-react icon in the middle. Used as the "type" marker in the
 * SplitCard header (pizza, cafe, taxi, etc.).
 *
 * Inversion of control: the icon is passed in as a prop, so we don't
 * pre-import all of lucide and the bundle stays lean. Adding a new category
 * doesn't touch this atom.
 */

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type CategoryColor =
  | "purple"
  | "teal"
  | "pink"
  | "primary"
  | "secondary"
  | "success"
  | "warning";

interface CategoryIconProps {
  icon: LucideIcon;
  color?: CategoryColor;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const COLOR_MAP: Record<CategoryColor, string> = {
  purple: "bg-cat-purple",
  teal: "bg-cat-teal",
  pink: "bg-cat-pink",
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-success",
  warning: "bg-warning",
};

const SIZE_MAP = {
  sm: { box: "size-10 rounded-[12px]", icon: 18 },
  md: { box: "size-12 rounded-[14px]", icon: 22 },
  lg: { box: "size-14 rounded-[16px]", icon: 26 },
} as const;

export function CategoryIcon({
  icon: Icon,
  color = "primary",
  size = "md",
  className,
}: CategoryIconProps) {
  const s = SIZE_MAP[size];
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center text-white",
        s.box,
        COLOR_MAP[color],
        className,
      )}
    >
      <Icon size={s.icon} strokeWidth={2} aria-hidden />
    </div>
  );
}
