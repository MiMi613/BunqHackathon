/*
 * Identity of the current (single) user.
 *
 * MVP is single-user, no auth. The display name and (optional) avatar URL
 * come from build-time env vars so you can swap them without touching code.
 *  - NEXT_PUBLIC_SELF_NAME    → display name in headers / share text fallback
 *  - NEXT_PUBLIC_SELF_AVATAR  → optional URL to a real profile image
 */

export const SELF_NAME =
  process.env.NEXT_PUBLIC_SELF_NAME ?? "Me";

export const SELF_AVATAR_URL: string | undefined =
  process.env.NEXT_PUBLIC_SELF_AVATAR || undefined;
