// Scene 1 — Cover (local 0–90).
// "bunq" per-letter mask reveal in coral, "Split" same in white,
// subtitle fades up. Background radial glow pulses gently.

import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { colors, typography } from "../design/tokens";
import {
  useLetterReveal,
  usePulse,
  useReveal,
} from "../design/motion";
import { FONT } from "../lib/theme";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const glowScale = usePulse([1, 1.03], 90);

  const logoStyle = useReveal(0, "soft");

  const bunqLetters = useLetterReveal("bunq", 15, 4);
  const splitLetters = useLetterReveal("Split", 30, 4);

  const subtitleStyle = useReveal(50, "smooth");

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: FONT }}>
      {/* radial brand glow with infinite pulse */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors.accent}33 0%, transparent 55%)`,
          transform: `scale(${glowScale})`,
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 40,
        }}
      >
        {/* Logo */}
        <Img
          src={staticFile("bunqSplit.png")}
          style={{
            width: 220,
            height: 220,
            objectFit: "contain",
            ...logoStyle,
          }}
        />

        {/* Wordmark — "bunq" coral gradient, "Split" white */}
        <div
          style={{
            ...typography.display,
            fontSize: 150,
            display: "flex",
            gap: 28,
          }}
        >
          <span style={{ display: "inline-flex", color: colors.accent }}>
            {bunqLetters.map((token, i) => (
              <span key={i} style={token.style}>
                {token.text}
              </span>
            ))}
          </span>
          <span style={{ display: "inline-flex", color: colors.ink }}>
            {splitLetters.map((token, i) => (
              <span key={i} style={token.style}>
                {token.text}
              </span>
            ))}
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            ...typography.body,
            fontSize: 38,
            color: colors.inkSubtle,
            margin: 0,
            ...subtitleStyle,
          }}
        >
          AI-powered bill splitter
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
