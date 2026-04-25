// Design tokens — single source of truth for the trailer.
//
// Colors come from frontend/app/globals.css (the real webapp). The video
// must read as the same product, so we mirror the actual hex values.

import type { CSSProperties } from "react";

export const colors = {
  bg: "#05101F",          // --color-base
  bgDeep: "#000000",      // outro hard-cut background
  surface: "#141826",     // --color-surface
  elevated: "#1E2230",    // --color-elevated
  accent: "#FF6A00",      // --color-primary
  accentLight: "#FF8A3C", // --color-primaryLight
  accentEnd: "#FF3B5C",   // --color-danger (gradient end)
  hot: "#FF3B5C",         // --color-danger (used for "It's painful")
  success: "#1DD67C",     // --color-success
  successDeep: "#0EA968", // for stronger success accents
  blue: "#2D7FF9",        // --color-secondary
  blueDeep: "#1D4ED8",
  catPurple: "#C026D3",
  catTeal: "#14B8A6",
  catPink: "#FF2E6C",
  warning: "#F5B700",
  ink: "#FFFFFF",         // --color-fg
  inkSubtle: "#8B92A7",   // --color-fgMuted
  inkMuted: "#4A5166",    // --color-fgDim
  card: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.08)", // --color-hairline
} as const;

export const accentGradient = `linear-gradient(135deg, ${colors.accentLight} 0%, ${colors.accent} 100%)`;
export const heroGradient = `linear-gradient(135deg, ${colors.accentLight} 0%, ${colors.hot} 100%)`;

// Typography presets — apply with `style={typography.display}`.
export const typography: Record<string, CSSProperties> = {
  display: {
    fontSize: 220,
    fontWeight: 800,
    letterSpacing: "-0.04em",
    lineHeight: 0.95,
  },
  h1: {
    fontSize: 110,
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: 1.0,
  },
  h2: {
    fontSize: 72,
    fontWeight: 700,
    letterSpacing: "-0.025em",
    lineHeight: 1.05,
  },
  stepLabel: {
    fontSize: 22,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: colors.accent,
  },
  body: {
    fontSize: 28,
    fontWeight: 500,
    lineHeight: 1.4,
    color: colors.inkSubtle,
  },
  caption: {
    fontSize: 18,
    fontWeight: 500,
    color: colors.inkSubtle,
    letterSpacing: "0.04em",
  },
};

// Spring configs for Remotion's `spring()`. Names communicate intent.
export const springs = {
  /** Snappy, very controlled — for crisp UI taps and quick reveals. */
  snap: { damping: 200, stiffness: 220, mass: 0.5 },
  /** Smooth and confident — for whole-element entrances. */
  smooth: { damping: 150, stiffness: 100, mass: 1 },
  /** Soft and floaty — for hero moments. */
  soft: { damping: 100, stiffness: 60, mass: 1 },
  /** Bounce — for haptic-style impact (checkmarks, drops). */
  bounce: { damping: 12, stiffness: 180, mass: 0.8 },
} as const;
