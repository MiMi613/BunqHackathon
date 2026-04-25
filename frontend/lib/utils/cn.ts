/*
 * cn() — combines clsx (conditional classNames) with tailwind-merge
 * (conflict resolution: "p-4 p-2" → "p-2" wins). The standard shadcn-style
 * helper used everywhere.
 *
 * Usage:
 *   cn("bg-surface p-4", isActive && "bg-primary", className)
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
