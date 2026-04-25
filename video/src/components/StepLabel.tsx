// Top-of-frame caption used across the "how it works" scenes.
//
// Visual: small uppercase orange "STEP 0X" sitting above a bold white
// description. Slides + fades in via a tiny offset for natural arrival.

import { interpolate } from "remotion";
import { C, FONT } from "../lib/theme";

interface StepLabelProps {
  step: number;
  label: string;
  /** Frame at which to begin the entrance animation. */
  appearAt?: number;
  /** Current frame from the parent scene. */
  frame: number;
}

export const StepLabel: React.FC<StepLabelProps> = ({
  step,
  label,
  appearAt = 0,
  frame,
}) => {
  const opacity = interpolate(frame, [appearAt, appearAt + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [appearAt, appearAt + 18], [-12, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 36,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT,
        opacity,
        transform: `translateY(${y}px)`,
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: C.primary,
          letterSpacing: 6,
          marginBottom: 8,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        STEP 0{step}
      </div>
      <div
        style={{
          fontSize: 44,
          fontWeight: 800,
          color: C.fg,
          letterSpacing: -1.4,
          lineHeight: 1,
        }}
      >
        {label}
      </div>
    </div>
  );
};
