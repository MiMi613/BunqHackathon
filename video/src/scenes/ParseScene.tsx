// Scene 5 — AI (local 0–240). 8s. STEP 02.
//
// Phone center stage. Empty chat → user message (receipt thumbnail +
// caption) slides up → AI avatar + loading bubble pulses → diagonal
// shimmer sweeps across the receipt thumbnail (the AI "reading" beat) →
// SplitCard rises into place at frame 150 with its own subtle entrance.
// The card stays on screen through the end so it carries into Scene 6.

import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../design/tokens";
import { useShimmer } from "../design/motion";
import { FONT } from "../lib/theme";
import { PhoneFrame } from "../components/PhoneFrame";
import { PersonChip } from "../components/PersonChip";
import { Receipt } from "../components/Receipt";
import { SplitCardMock, type MockPerson } from "../components/SplitCardMock";
import { StepLabel } from "../components/StepLabel";

const PEOPLE: MockPerson[] = [
  {
    name: "Me",
    isSelf: true,
    total: 13.5,
    items: [
      { name: "Pizza Diavola", price: 11.0 },
      { name: "Acqua Naturale", price: 2.5 },
    ],
  },
  {
    name: "Marco",
    total: 24.0,
    items: [
      { name: "Pasta Carbonara", price: 13.0 },
      { name: "Tiramisù", price: 6.0 },
      { name: "Birra Media", price: 5.0 },
    ],
  },
  {
    name: "Lucia",
    total: 11.0,
    items: [
      { name: "Insalata Greca", price: 9.0 },
      { name: "Coperto", price: 2.0 },
    ],
  },
];

const Dots: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {[0, 1, 2].map((i) => {
      const pulse = (Math.sin((frame - i * 4) * 0.4) + 1) / 2;
      return (
        <span
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            background: colors.inkSubtle,
            opacity: 0.35 + pulse * 0.65,
          }}
        />
      );
    })}
  </div>
);

const SparklesIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    <path d="M20 3v4" />
    <path d="M22 5h-4" />
    <path d="M4 17v2" />
    <path d="M5 18H3" />
  </svg>
);

export const ParseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // user message
  const msgSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 18, stiffness: 100 },
  });
  const msgOpacity = interpolate(frame, [5, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const msgY = interpolate(msgSpring, [0, 1], [50, 0]);

  // AI sparkle entrance + bubble
  const aiSpring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 14, stiffness: 110, mass: 0.6 },
  });
  const aiOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const aiScale = interpolate(aiSpring, [0, 1], [0.7, 1]);

  // upper stack drifts up + fades when card lands
  const headerOffset = interpolate(frame, [150, 200], [0, -180], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const headerOpacity = interpolate(frame, [180, 200], [1, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // receipt shimmer sweep — frames 70–120 then 110–160
  const shimmer1 = useShimmer(70, 50);
  const shimmer2 = useShimmer(110, 50);

  // split card rises in at frame 150
  const cardSpring = spring({
    frame: frame - 150,
    fps,
    config: { damping: 22, stiffness: 110 },
  });
  const cardOpacity = interpolate(frame, [150, 195], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cardY = interpolate(cardSpring, [0, 1], [80, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: FONT }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors.accent}10 0%, transparent 50%)`,
        }}
      />

      <StepLabel step={2} label="AI splits it for you" appearAt={5} frame={frame} />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <PhoneFrame width={480} height={920}>
          <div
            style={{
              position: "absolute",
              top: 60,
              left: 0,
              right: 0,
              bottom: 90,
              padding: "16px 16px",
              overflow: "hidden",
            }}
          >
            {/* upper stack: user message + AI loading bubble */}
            <div
              style={{
                transform: `translateY(${headerOffset}px)`,
                opacity: headerOpacity,
              }}
            >
              {/* user message */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                  gap: 8,
                  marginBottom: 16,
                  opacity: msgOpacity,
                  transform: `translateY(${msgY}px)`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                    maxWidth: "78%",
                  }}
                >
                  {/* receipt thumbnail with shimmer overlay */}
                  <div
                    style={{
                      width: 176,
                      height: 132,
                      borderRadius: 20,
                      border: `1px solid ${colors.cardBorder}`,
                      overflow: "hidden",
                      position: "relative",
                      background: "#FAF8F2",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        transform: "translateX(-50%) scale(0.6)",
                        transformOrigin: "top center",
                      }}
                    >
                      <Receipt width={280} />
                    </div>
                    {/* shimmer pass 1 */}
                    {shimmer1 !== null && (
                      <Shimmer translateX={shimmer1} />
                    )}
                    {/* shimmer pass 2 (overlapping for a continuous "scanning" feel) */}
                    {shimmer2 !== null && (
                      <Shimmer translateX={shimmer2} />
                    )}
                  </div>
                  <div
                    style={{
                      background: colors.accent,
                      color: "white",
                      padding: "10px 16px",
                      borderRadius: 20,
                      borderBottomRightRadius: 2,
                      fontSize: 14,
                      lineHeight: 1.375,
                      fontFamily: FONT,
                    }}
                  >
                    I had pizza + water, Marco pasta tiramisù and beer,
                    Lucia salad + cover
                  </div>
                </div>
                <PersonChip name="Daniele" isSelf size={32} />
              </div>

              {/* AI loading bubble */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 8,
                  opacity: aiOpacity,
                  transform: `scale(${aiScale})`,
                  transformOrigin: "left bottom",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${colors.blue} 0%, ${colors.blueDeep} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  <SparklesIcon size={16} />
                </div>
                <div
                  style={{
                    maxWidth: "78%",
                    background: colors.surface,
                    border: `1px solid ${colors.cardBorder}`,
                    borderRadius: 20,
                    borderBottomLeftRadius: 2,
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontFamily: FONT,
                    color: colors.inkSubtle,
                  }}
                >
                  <Dots frame={frame} />
                  <span style={{ fontSize: 14 }}>Reading your receipt…</span>
                </div>
              </div>
            </div>

            {/* split card */}
            <div
              style={{
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
                marginTop: 16,
                position: "relative",
              }}
            >
              <SplitCardMock
                merchant="Mario's Pizzeria"
                total={48.5}
                people={PEOPLE}
                showButtons
                glowColor={colors.catPink}
                time="24/04/2026 · 20:30"
              />
            </div>
          </div>
        </PhoneFrame>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Diagonal shimmer overlay — translates a glossy gradient across its parent
const Shimmer: React.FC<{ translateX: number }> = ({ translateX }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background: `linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.55) 50%, transparent 70%)`,
      transform: `translateX(${translateX}%)`,
      mixBlendMode: "overlay",
    }}
  />
);
