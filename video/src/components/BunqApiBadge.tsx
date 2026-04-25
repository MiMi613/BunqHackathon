// "Powered by bunq API" lockup for Scene 7 (the bunq integration moment).
// Small typographic pill with a pulsing green dot — restrained but present.

import { CSSProperties } from "react";
import { colors } from "../design/tokens";
import { useReveal, usePulse } from "../design/motion";
import { FONT } from "../lib/theme";

interface BunqApiBadgeProps {
  /** Frame at which the badge fades + lifts in. */
  appearAt?: number;
  style?: CSSProperties;
}

export const BunqApiBadge: React.FC<BunqApiBadgeProps> = ({
  appearAt = 0,
  style,
}) => {
  const reveal = useReveal(appearAt, "soft");
  const dotScale = usePulse([1, 1.35], 36);

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 16px",
        borderRadius: 999,
        background: "rgba(20, 24, 38, 0.85)",
        border: `1px solid ${colors.cardBorder}`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        fontFamily: FONT,
        ...reveal,
        ...style,
      }}
    >
      <span
        style={{
          position: "relative",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: colors.success,
        }}
      >
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: colors.success,
            opacity: 0.35,
            transform: `scale(${dotScale})`,
          }}
        />
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: colors.ink,
          letterSpacing: -0.1,
        }}
      >
        Powered by{" "}
        <span style={{ color: colors.success }}>bunq</span>{" "}
        API
      </span>
    </div>
  );
};
