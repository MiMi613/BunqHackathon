// Scene 2 — Hook (local 0–210). 7s.
// "Splitting bills with friends?" → 3 chat bubbles springing in
// (with subtle wobble post-entrance) → dramatic "It's painful." reveal.

import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, typography } from "../design/tokens";
import { useFadeOut, useReveal, useWobble } from "../design/motion";
import { FONT } from "../lib/theme";

interface Bubble {
  text: string;
  side: "left" | "right";
  delay: number; // local frame
  bg: string;
}

const BUBBLES: Bubble[] = [
  { text: "wait how much do I owe??", side: "left", delay: 40, bg: "#2A2F3D" },
  { text: "I think you had the wine", side: "right", delay: 70, bg: colors.blue },
  { text: "did Marco ever pay back?", side: "left", delay: 105, bg: "#2A2F3D" },
];

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleStyle = useReveal(5, "smooth");

  // "It's painful." dramatic entrance at frame 150
  const painfulIn = spring({
    frame: frame - 150,
    fps,
    config: { damping: 15, stiffness: 90, mass: 1 },
  });
  const painfulScale = interpolate(painfulIn, [0, 1], [1.2, 1]);
  const painfulOpacity = interpolate(frame, [150, 168], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Weight shift 600 → 800 over 150–172
  const painfulWeight = Math.round(
    interpolate(frame, [150, 172], [600, 800], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  // Color glow pulse on "It's painful."
  const painfulGlow =
    150 < frame
      ? Math.abs(Math.sin(((frame - 150) / 50) * Math.PI)) * 28
      : 0;

  // Scene-end fade-out (last 14 frames)
  const exitFade = useFadeOut(196, 14);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        padding: 100,
        fontFamily: FONT,
        opacity: exitFade,
      }}
    >
      <h2
        style={{
          ...typography.h2,
          fontSize: 84,
          color: colors.ink,
          margin: 0,
          marginBottom: 70,
          textAlign: "center",
          ...titleStyle,
        }}
      >
        Splitting bills with friends?
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 22,
          maxWidth: 980,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {BUBBLES.map((b, i) => (
          <BubbleRow key={i} bubble={b} />
        ))}
      </div>

      <div style={{ flex: 1 }} />

      <p
        style={{
          ...typography.h1,
          fontSize: 120,
          fontWeight: painfulWeight,
          color: colors.hot,
          textAlign: "center",
          margin: 0,
          opacity: painfulOpacity,
          transform: `scale(${painfulScale})`,
          textShadow: `0 0 ${painfulGlow}px ${colors.hot}88`,
          letterSpacing: "-0.04em",
        }}
      >
        It&apos;s painful.
      </p>
    </AbsoluteFill>
  );
};

const BubbleRow: React.FC<{ bubble: Bubble }> = ({ bubble: b }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t = spring({
    frame: frame - b.delay,
    fps,
    config: { damping: 200, stiffness: 220, mass: 0.5 },
  });
  const opacity = interpolate(t, [0, 1], [0, 1]);
  const ty = interpolate(t, [0, 1], [30, 0]);
  const sx = interpolate(t, [0, 1], [b.side === "left" ? -50 : 50, 0]);
  const scale = interpolate(t, [0, 1], [0.85, 1]);

  // Subtle wobble after entrance — damped sine
  const wobble = useWobble(b.delay + 16, 24);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: b.side === "left" ? "flex-start" : "flex-end",
        opacity,
        transform: `translate(${sx}px, ${ty}px)`,
      }}
    >
      <div
        style={{
          background: b.bg,
          color: "white",
          fontFamily: FONT,
          fontSize: 38,
          fontWeight: 500,
          padding: "20px 32px",
          borderRadius: 28,
          borderBottomLeftRadius: b.side === "left" ? 8 : 28,
          borderBottomRightRadius: b.side === "right" ? 8 : 28,
          maxWidth: "70%",
          transform: `scale(${scale}) rotate(${wobble * 1.2}deg)`,
          transformOrigin: b.side === "left" ? "bottom left" : "bottom right",
        }}
      >
        {b.text}
      </div>
    </div>
  );
};
