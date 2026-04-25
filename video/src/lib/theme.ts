// Mirrors the design tokens from frontend/app/globals.css so the trailer
// stays visually consistent with the actual app.

import { loadFont } from "@remotion/google-fonts/BricolageGrotesque";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
});

export const FONT = fontFamily;

export const C = {
  base: "#05101F",
  surface: "#141826",
  elevated: "#1E2230",
  primary: "#FF6A00",
  primaryLight: "#FF8A3C",
  secondary: "#2D7FF9",
  success: "#1DD67C",
  danger: "#FF3B5C",
  warning: "#F5B700",
  catPurple: "#C026D3",
  catTeal: "#14B8A6",
  catPink: "#FF2E6C",
  fg: "#FFFFFF",
  fgMuted: "#8B92A7",
  fgDim: "#4A5166",
  hairline: "rgba(255, 255, 255, 0.08)",
} as const;

// Brand orange→red gradient used for the logo tile and primary CTAs.
export const BRAND_GRADIENT = `linear-gradient(135deg, ${C.primaryLight} 0%, ${C.danger} 100%)`;
