// Scene 8 — Outro (local 0–120). 4s.
// Hard cut to (near-)black. Logo + "bunq Split" mask reveal + tagline +
// team / GitHub URL. Subtle ambient glow loop on the logo.

import { AbsoluteFill, Img, staticFile } from "remotion";
import {
  colors,
  typography,
} from "../design/tokens";
import {
  useLetterReveal,
  usePulse,
  useReveal,
} from "../design/motion";
import { FONT } from "../lib/theme";

export const OutroScene: React.FC = () => {
  const glowScale = usePulse([1, 1.04], 80);

  const logoStyle = useReveal(5, "soft");

  const bunqLetters = useLetterReveal("bunq", 20, 3);
  const splitLetters = useLetterReveal("Split", 35, 3);

  const taglineStyle = useReveal(50, "smooth");
  const teamStyle = useReveal(75, "smooth");

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgDeep, fontFamily: FONT }}>
      {/* ambient pulsing glow behind logo */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, ${colors.accent}26 0%, transparent 50%)`,
          transform: `scale(${glowScale})`,
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <Img
            src={staticFile("bunqSplit.png")}
            style={{
              width: 160,
              height: 160,
              objectFit: "contain",
              ...logoStyle,
            }}
          />

          {/* "bunq Split" wordmark, per-letter reveal */}
          <div
            style={{
              fontSize: 130,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              display: "flex",
              gap: 22,
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
        </div>

        <p
          style={{
            ...typography.body,
            fontSize: 32,
            fontWeight: 600,
            color: colors.ink,
            margin: 0,
            ...taglineStyle,
            opacity: (taglineStyle.opacity as number) * 0.9,
          }}
        >
          Built in 24h at bunq Hackathon 7.0
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            marginTop: 18,
            ...teamStyle,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: colors.inkSubtle,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Team
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: colors.ink,
              letterSpacing: "-0.01em",
            }}
          >
            bunq split
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: colors.inkSubtle,
              letterSpacing: "0.04em",
              marginTop: 6,
            }}
          >
            github.com/MiMi613/BunqHackathon
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
