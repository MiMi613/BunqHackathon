// Scene 4 — Snap (local 0–180). 6s. STEP 01.
//
// Receipt visible to the left of the frame (floats in from off-screen left
// with -8° tilt). Phone slides in from bottom and settles centered-right.
// Camera viewfinder fills the phone screen, showing a smaller copy of the
// receipt with brand-orange corner brackets that appear staggered. A
// vertical scan-line sweeps over the inside-phone receipt at frame 120,
// then the shutter button pulses on a loop.

import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors } from "../design/tokens";
import { usePulse, useScanLine, useStagger } from "../design/motion";
import { FONT } from "../lib/theme";
import { PhoneFrame } from "../components/PhoneFrame";
import { Receipt } from "../components/Receipt";
import { StepLabel } from "../components/StepLabel";

export const DemoScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone slides in from bottom at frame 35
  const phoneIn = spring({
    frame: frame - 35,
    fps,
    config: { damping: 18, stiffness: 90, mass: 0.8 },
  });
  const phoneTy = interpolate(phoneIn, [0, 1], [400, 40]);
  const phoneRot = interpolate(phoneIn, [0, 1], [4, -6]);
  const phoneOpacity = interpolate(frame, [35, 55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Receipt floats in from left at frame 90
  const receiptIn = spring({
    frame: frame - 90,
    fps,
    config: { damping: 22, stiffness: 80, mass: 1 },
  });
  const receiptTx = interpolate(receiptIn, [0, 1], [-500, -260]);
  const receiptOpacity = interpolate(frame, [90, 115], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const receiptBreath = Math.sin(frame * 0.05) * 3;

  // Camera brackets staggered 4f starting at frame 70
  const corners = [0, 1, 2, 3].map((i) => ({
    delay: useStagger(i, 70, 4),
    pos: i,
  }));

  // Scan-line sweep over the inside-phone receipt at frame 120, 30f
  const scan = useScanLine(120, 30);

  // Reticle pulses gently throughout
  const reticleBreath = (Math.sin((frame - 60) * 0.16) + 1) / 2;
  const reticleScale = 1 + reticleBreath * 0.04;

  // Shutter button pulse loop (period 30f)
  const shutterScale = usePulse([1, 1.05], 30);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: FONT }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 65%, #1A1F2E 0%, ${colors.bg} 75%)`,
        }}
      />

      <StepLabel step={1} label="Snap the receipt" appearAt={5} frame={frame} />

      {/* Floating receipt — enters from off-screen left */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            opacity: receiptOpacity,
            transform: `translateX(${receiptTx}px) translateY(${receiptBreath + 60}px) rotate(-8deg)`,
          }}
        >
          <Receipt width={300} />
        </div>
      </AbsoluteFill>

      {/* Phone — slides up from the bottom */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            opacity: phoneOpacity,
            transform: `translate(80px, ${phoneTy}px) rotate(${phoneRot}deg)`,
            transformOrigin: "center",
          }}
        >
          <PhoneFrame width={420} height={840}>
            {/* viewfinder UI */}
            <div style={{ position: "absolute", inset: 0 }}>
              {/* top label */}
              <div
                style={{
                  position: "absolute",
                  top: 60,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  fontFamily: FONT,
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: 3,
                }}
              >
                RECEIPT MODE
              </div>

              {/* receipt as seen through viewfinder, with scan-line overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    transform: "scale(0.65) rotate(-3deg)",
                  }}
                >
                  <Receipt width={260} />
                  {scan && (
                    <div
                      style={{
                        position: "absolute",
                        left: -10,
                        right: -10,
                        top: `${scan.topPct}%`,
                        height: 4,
                        background:
                          "linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.95) 50%, transparent 100%)",
                        boxShadow: "0 0 24px 4px rgba(255,255,255,0.6)",
                        opacity: scan.opacity,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
              </div>

              {/* focus reticle — corner brackets stagger in */}
              <div
                style={{
                  position: "absolute",
                  top: "26%",
                  left: "16%",
                  right: "16%",
                  bottom: "26%",
                  transform: `scale(${reticleScale})`,
                }}
              >
                {corners.map(({ delay, pos }) => (
                  <Bracket key={pos} pos={pos} delay={delay} />
                ))}
              </div>

              {/* shutter button — pulses */}
              <div
                style={{
                  position: "absolute",
                  bottom: 50,
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    border: "3px solid rgba(255,255,255,0.9)",
                    padding: 4,
                    transform: `scale(${shutterScale})`,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: "white",
                    }}
                  />
                </div>
              </div>
            </div>
          </PhoneFrame>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Bracket: React.FC<{ pos: 0 | 1 | 2 | 3 | number; delay: number }> = ({
  pos,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, stiffness: 220, mass: 0.5 },
  });
  const opacity = interpolate(t, [0, 1], [0, 1]);
  const scale = interpolate(t, [0, 1], [0.6, 1]);

  const positions: Array<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    brT: boolean;
    brB: boolean;
    brL: boolean;
    brR: boolean;
  }> = [
    { top: -2, left: -2, brT: true, brB: false, brL: true, brR: false },
    { top: -2, right: -2, brT: true, brB: false, brL: false, brR: true },
    { bottom: -2, left: -2, brT: false, brB: true, brL: true, brR: false },
    { bottom: -2, right: -2, brT: false, brB: true, brL: false, brR: true },
  ];
  const c = positions[pos];

  return (
    <div
      style={{
        position: "absolute",
        top: c.top,
        bottom: c.bottom,
        left: c.left,
        right: c.right,
        width: 22,
        height: 22,
        borderColor: colors.accent,
        borderTopWidth: c.brT ? 3 : 0,
        borderBottomWidth: c.brB ? 3 : 0,
        borderLeftWidth: c.brL ? 3 : 0,
        borderRightWidth: c.brR ? 3 : 0,
        borderStyle: "solid",
        opacity,
        transform: `scale(${scale})`,
      }}
    />
  );
};
