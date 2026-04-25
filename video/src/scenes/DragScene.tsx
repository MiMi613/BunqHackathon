// Scene 6 — Drag & drop (local 0–150). 5s. STEP 03.
//
// Card carries over visually from Scene 5. User drags Marco's "Tiramisù"
// chip up to Me's row, fixing an OCR mistake. Cursor + lifted chip ghost
// mirror the app's <DragOverlay> + <ItemChipPreview>.

import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { colors } from "../design/tokens";
import { PhoneFrame } from "../components/PhoneFrame";
import {
  ChipVisual,
  SplitCardMock,
  type MockPerson,
} from "../components/SplitCardMock";
import { StepLabel } from "../components/StepLabel";

const PEOPLE_BEFORE: MockPerson[] = [
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

const PEOPLE_AFTER: MockPerson[] = [
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

const SRC = { x: 274, y: 355 };
const DST = { x: 88, y: 295 };
const ARC_PEAK_T = 0.4;
const ARC_HEIGHT = 70;

function arcCurve(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 0;
  if (t < ARC_PEAK_T) {
    return Math.sin((t / ARC_PEAK_T) * (Math.PI / 2));
  }
  return Math.cos(((t - ARC_PEAK_T) / (1 - ARC_PEAK_T)) * (Math.PI / 2));
}

export const DragScene: React.FC = () => {
  const frame = useCurrentFrame();

  const dragRaw = interpolate(frame, [42, 92], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const dragT = Easing.inOut(Easing.cubic)(dragRaw);

  const liftT = interpolate(frame, [32, 42], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const isDropped = frame >= 100;

  const ghostX = interpolate(dragT, [0, 1], [SRC.x, DST.x]);
  const ghostYStraight = interpolate(dragT, [0, 1], [SRC.y, DST.y]);
  const ghostY = ghostYStraight - ARC_HEIGHT * arcCurve(dragRaw);

  const liftScale = interpolate(liftT, [0, 1], [1.0, 1.08]);
  const settleBase = isDropped
    ? interpolate(frame, [95, 104], [1.08, 1.0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : liftScale;
  const impactBump = interpolate(frame, [95, 97, 102], [0, 0.06, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const ghostScale = settleBase + (isDropped ? impactBump : 0);

  const liftTilt = -2 * liftT;
  const ghostTilt = isDropped
    ? interpolate(frame, [95, 105], [-2, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : liftTilt;

  const cursorLiftOff = interpolate(frame, [95, 110], [0, -14], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const cursorX = ghostX + 16;
  const cursorY = ghostY + 12 + cursorLiftOff;

  const cursorOpacity = interpolate(
    frame,
    [22, 30, 100, 112],
    [0, 1, 1, 0],
  );
  const ghostOpacity = interpolate(
    frame,
    [32, 42, 100, 108],
    [0, 1, 1, 0],
  );

  const meIsOver = frame >= 70 && frame <= 96;
  const showSourceDimmed = frame >= 38 && frame < 100;

  const peopleNow: MockPerson[] = isDropped
    ? PEOPLE_AFTER
    : PEOPLE_BEFORE.map((p, i) => {
        if (i === 1 && showSourceDimmed) {
          return { ...p, dimmedItemIndex: 1 };
        }
        if (i === 0 && meIsOver) {
          return { ...p, dropZoneActive: true };
        }
        return p;
      });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colors.accent}10 0%, transparent 50%)`,
        }}
      />

      <StepLabel
        step={3}
        label="Fix anything by dragging"
        appearAt={5}
        frame={frame}
      />

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
                time="24/04/2026 · 20:30"
              />

              {/* Floating ghost chip */}
              {ghostOpacity > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: ghostY,
                    left: ghostX,
                    opacity: ghostOpacity,
                    transform: `translate(-50%, -50%) scale(${ghostScale}) rotate(${ghostTilt}deg)`,
                    transformOrigin: "center",
                    pointerEvents: "none",
                    zIndex: 50,
                  }}
                >
                  <ChipVisual
                    name="Tiramisù"
                    price={6.0}
                    lifted={liftT > 0.4 && !isDropped}
                  />
                </div>
              )}

              {/* Touch cursor */}
              {cursorOpacity > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: cursorY,
                    left: cursorX,
                    width: 34,
                    height: 34,
                    marginTop: -17,
                    marginLeft: -17,
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.35)",
                    border: "2px solid rgba(255, 255, 255, 0.95)",
                    boxShadow: "0 0 18px rgba(255, 255, 255, 0.4)",
                    opacity: cursorOpacity,
                    pointerEvents: "none",
                    zIndex: 51,
                  }}
                />
              )}
            </div>
          </div>
        </PhoneFrame>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
