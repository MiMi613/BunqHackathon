// Scene 3 — Promise (local 0–120). 4s.
// "We made it stupid simple." → 3 step icons with arrows drawing between
// them. "Done" white → coral color flip with a scale pulse.

import { Fragment } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, heroGradient } from "../design/tokens";
import { useDrawLine, useReveal } from "../design/motion";
import { FONT } from "../lib/theme";

const STEPS = [
  { emoji: "📷", label: "Snap", delay: 35 },
  { emoji: "💬", label: "Type", delay: 58 },
  { emoji: "✓", label: "Done", delay: 81 },
] as const;

const ARROW_PATH_LENGTH = 80;

export const SolutionScene: React.FC = () => {
  const titleStyle = useReveal(5, "smooth");
  const arrow1 = useDrawLine(50, 8, ARROW_PATH_LENGTH);
  const arrow2 = useDrawLine(73, 8, ARROW_PATH_LENGTH);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: FONT }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 40%, ${colors.accent}1A 0%, transparent 60%)`,
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 80,
        }}
      >
        <h2
          style={{
            fontSize: 70,
            fontWeight: 600,
            color: colors.inkSubtle,
            margin: 0,
            letterSpacing: "-0.025em",
            ...titleStyle,
          }}
        >
          We made it stupid simple.
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
          {STEPS.map((step, i) => (
            <Fragment key={i}>
              <StepTile step={step} isDone={i === STEPS.length - 1} />
              {i < STEPS.length - 1 && (
                <Arrow draw={i === 0 ? arrow1 : arrow2} />
              )}
            </Fragment>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const StepTile: React.FC<{
  step: (typeof STEPS)[number];
  isDone: boolean;
}> = ({ step, isDone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame: frame - step.delay,
    fps,
    config: { damping: 12, stiffness: 100, mass: 0.6 },
  });
  const scale = interpolate(pop, [0, 1], [0.7, 1]);
  const opacity = interpolate(pop, [0, 0.5], [0, 1]);

  // "Done" color flip white → coral at frame 100
  const flipT = isDone
    ? interpolate(frame, [100, 110], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const labelColor = isDone
    ? interpolateColor(colors.ink, colors.accent, flipT)
    : colors.ink;
  const donePulse = isDone
    ? interpolate(frame, [100, 105, 115], [1, 1.08, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          width: 200,
          height: 200,
          borderRadius: 48,
          background: isDone ? heroGradient : colors.elevated,
          border: isDone ? "none" : `1px solid ${colors.cardBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 100,
          transform: `scale(${donePulse})`,
        }}
      >
        {step.emoji}
      </div>
      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: labelColor,
          letterSpacing: "-0.025em",
          transform: `scale(${donePulse})`,
        }}
      >
        {step.label}
      </div>
    </div>
  );
};

const Arrow: React.FC<{
  draw: { strokeDasharray: number; strokeDashoffset: number };
}> = ({ draw }) => {
  // Show arrowhead once line is mostly drawn
  const arrowOpacity = draw.strokeDashoffset < ARROW_PATH_LENGTH * 0.15 ? 1 : 0;
  return (
    <svg
      width={ARROW_PATH_LENGTH}
      height={20}
      viewBox={`0 0 ${ARROW_PATH_LENGTH} 20`}
      style={{ overflow: "visible" }}
    >
      <line
        x1={0}
        y1={10}
        x2={ARROW_PATH_LENGTH - 8}
        y2={10}
        stroke={colors.inkMuted}
        strokeWidth={3}
        strokeLinecap="round"
        style={draw}
      />
      <path
        d={`M${ARROW_PATH_LENGTH - 12} 4 L${ARROW_PATH_LENGTH} 10 L${ARROW_PATH_LENGTH - 12} 16`}
        fill="none"
        stroke={colors.inkMuted}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={arrowOpacity}
      />
    </svg>
  );
};

function interpolateColor(from: string, to: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r}, ${g}, ${b})`;
}
