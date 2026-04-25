// Scene 7 — Send (local 0–240). 8s. STEP 04 — THE BUNQ MOMENT.
//
// Card with post-drag totals (Me €19.50, Marco €18.00, Lucia €11.00).
// Marco's per-row ↗ taps first → green ✓ + toast (haptic-style scale
// bounce). Then "Send to all" pulses, taps, the global CTA flips to
// success-green "All payments sent", and Lucia's ✓ + toast cascades.
// Finally, a "Powered by bunq API" lockup fades up at the bottom.
//
// Pacing (240 frames @ 30fps = 8s):
//   0–25    settle, idle pulse on "Send to all" begins
//   25–45   Marco's ↗ pulses
//   45–65   Marco taps → ✓ + toast (haptic bounce)
//   80–100  pause
//   100–125 "Send to all" pulses, then taps
//   125–150 Lucia ✓ + toast cascades; CTA flips to "All payments sent"
//   150–180 hold
//   180–210 "Powered by bunq API" lockup fades up
//   210–240 hold

import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { colors } from "../design/tokens";
import { PhoneFrame } from "../components/PhoneFrame";
import { SplitCardMock, type MockPerson } from "../components/SplitCardMock";
import { StepLabel } from "../components/StepLabel";
import { BunqApiBadge } from "../components/BunqApiBadge";

const BASE_PEOPLE: MockPerson[] = [
  {
    name: "Me",
    isSelf: true,
    total: 19.5,
    items: [
      { name: "Pizza Diavola", price: 11.0 },
      { name: "Acqua Naturale", price: 2.5 },
      { name: "Tiramisù", price: 6.0 },
    ],
  },
  {
    name: "Marco",
    total: 18.0,
    items: [
      { name: "Pasta Carbonara", price: 13.0 },
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

export const SendScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Marco: per-person send (frames 25–65)
  const marcoButtonPulse = frame >= 25 && frame < 45;
  const marcoSent = frame >= 45;
  const marcoToast = interpolate(frame, [45, 52, 70, 78], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const marcoTapRing = interpolate(frame, [43, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Send to all (frames 100–125)
  const globalPulse = frame >= 100 && frame < 125;
  const allSent = frame >= 125;
  const luciaSent = allSent;
  const luciaToast = interpolate(frame, [125, 132, 150, 158], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const globalTapRing = interpolate(frame, [123, 136], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const peopleNow: MockPerson[] = [
    BASE_PEOPLE[0],
    {
      ...BASE_PEOPLE[1],
      sent: marcoSent,
      pulsingButton: marcoButtonPulse,
      toastVisible: marcoToast,
    },
    {
      ...BASE_PEOPLE[2],
      sent: luciaSent,
      toastVisible: luciaToast,
    },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors.accent}10 0%, transparent 50%)`,
        }}
      />

      <StepLabel step={4} label="Send their share" appearAt={5} frame={frame} />

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
            <div style={{ position: "relative" }}>
              <SplitCardMock
                merchant="Mario's Pizzeria"
                total={48.5}
                people={peopleNow}
                showButtons
                glowColor={colors.catPink}
                globalCTA={allSent ? "all-sent" : "send-all"}
                globalCTAPulse={globalPulse}
                time="24/04/2026 · 20:30"
              />

              {/* Marco's tap ring */}
              {marcoTapRing > 0 && marcoTapRing < 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 296,
                    left: 362,
                    width: 36,
                    height: 36,
                    borderRadius: 999,
                    border: `2px solid ${colors.accent}`,
                    transform: `scale(${1 + marcoTapRing * 1.5})`,
                    opacity: 1 - marcoTapRing,
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Global CTA tap ring */}
              {globalTapRing > 0 && globalTapRing < 1 && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 16,
                    left: 16,
                    right: 16,
                    height: 46,
                    borderRadius: 999,
                    border: `2px solid ${colors.accent}`,
                    transform: `scale(${1 + globalTapRing * 0.05})`,
                    opacity: 1 - globalTapRing,
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          </div>
        </PhoneFrame>
      </AbsoluteFill>

      {/* Powered by bunq API lockup — bottom-center, appears at frame 180 */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <BunqApiBadge appearAt={180} />
      </div>
    </AbsoluteFill>
  );
};
