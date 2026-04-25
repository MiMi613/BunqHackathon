// Motion helpers shared across scenes. Anything more complicated than a
// one-liner interpolate goes here so scene code stays readable.

import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CSSProperties } from "react";

import { springs } from "./tokens";

type SpringName = keyof typeof springs;
type SpringConfig = (typeof springs)[SpringName];

function resolveSpring(s?: SpringName | SpringConfig): SpringConfig {
  if (!s) return springs.smooth;
  if (typeof s === "string") return springs[s];
  return s;
}

/** Standard reveal: fades + lifts 20px. Returns inline style. */
export function useReveal(
  delay: number = 0,
  springConfig?: SpringName | SpringConfig,
): CSSProperties {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({
    frame: frame - delay,
    fps,
    config: resolveSpring(springConfig),
  });
  return {
    opacity: t,
    transform: `translateY(${(1 - t) * 20}px)`,
  };
}

/** Stagger child delay = baseDelay + index*perChild. */
export function useStagger(
  index: number,
  baseDelay: number = 0,
  perChild: number = 4,
): number {
  return baseDelay + index * perChild;
}

interface RevealedToken {
  /** The character or word being rendered. */
  text: string;
  style: CSSProperties;
}

/** Per-letter mask reveal — used by hero wordmarks like "bunq Split". */
export function useLetterReveal(
  text: string,
  delay: number = 0,
  perLetter: number = 2,
  springConfig?: SpringName | SpringConfig,
): RevealedToken[] {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return text.split("").map((char, i) => {
    const t = spring({
      frame: frame - delay - i * perLetter,
      fps,
      config: resolveSpring(springConfig ?? "snap"),
    });
    return {
      text: char === " " ? " " : char,
      style: {
        display: "inline-block",
        opacity: t,
        transform: `translateY(${(1 - t) * 60}px)`,
      },
    };
  });
}

/** Per-word reveal for headlines. */
export function useWordReveal(
  text: string,
  delay: number = 0,
  perWord: number = 3,
  springConfig?: SpringName | SpringConfig,
): RevealedToken[] {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return text.split(" ").map((word, i) => {
    const t = spring({
      frame: frame - delay - i * perWord,
      fps,
      config: resolveSpring(springConfig ?? "smooth"),
    });
    return {
      text: word,
      style: {
        display: "inline-block",
        marginRight: "0.28em",
        opacity: t,
        transform: `translateY(${(1 - t) * 40}px)`,
      },
    };
  });
}

/** Infinite gentle pulse, returns the current scale. */
export function usePulse(
  scaleRange: [number, number] = [1, 1.04],
  periodFrames: number = 60,
): number {
  const frame = useCurrentFrame();
  const t = (Math.sin((frame / periodFrames) * Math.PI * 2) + 1) / 2;
  return scaleRange[0] + (scaleRange[1] - scaleRange[0]) * t;
}

/** Subtle wobble — small rotation for chat bubbles after they land. */
export function useWobble(startFrame: number, periodFrames: number = 24): number {
  const frame = useCurrentFrame() - startFrame;
  if (frame < 0) return 0;
  // damped sine: amplitude decays so the wobble settles
  const damp = Math.exp(-frame / 30);
  return Math.sin((frame / periodFrames) * Math.PI * 2) * damp;
}

/**
 * Vertical scan-line sweep — returns the line's current Y % (0..100) and
 * opacity, or null when outside its window.
 */
export function useScanLine(
  startFrame: number,
  durationFrames: number,
): { topPct: number; opacity: number } | null {
  const frame = useCurrentFrame() - startFrame;
  if (frame < 0 || frame > durationFrames) return null;
  const t = frame / durationFrames;
  const opacity = t < 0.1 ? t * 10 : t > 0.9 ? (1 - t) * 10 : 1;
  return { topPct: t * 100, opacity };
}

/**
 * Diagonal shimmer sweep — returns the gradient's translateX (in % of the
 * parent width). Used to overlay a moving gloss on a static element.
 */
export function useShimmer(
  startFrame: number,
  durationFrames: number,
): number | null {
  const frame = useCurrentFrame() - startFrame;
  if (frame < 0 || frame > durationFrames) return null;
  const t = frame / durationFrames;
  return interpolate(t, [0, 1], [-150, 250], {
    easing: Easing.inOut(Easing.cubic),
  });
}

/**
 * Draws an SVG line or path from 0 → 1 by animating strokeDashoffset.
 * Pass the path's total length in pixels.
 */
export function useDrawLine(
  startFrame: number,
  durationFrames: number,
  pathLength: number,
  springConfig?: SpringName | SpringConfig,
): { strokeDasharray: number; strokeDashoffset: number } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({
    frame: frame - startFrame,
    fps,
    durationInFrames: durationFrames,
    config: resolveSpring(springConfig ?? "smooth"),
  });
  return {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength * (1 - t),
  };
}

/** Simple opacity fade-out window for scene-end exits. */
export function useFadeOut(startFrame: number, durationFrames: number = 12): number {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + durationFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Scale-out window for scene-end exits (pairs with useFadeOut for combo). */
export function useScaleOut(
  startFrame: number,
  durationFrames: number = 12,
  toScale: number = 0.96,
): number {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [1, toScale],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    },
  );
}
