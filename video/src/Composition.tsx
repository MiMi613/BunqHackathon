// Stitches the eight scenes back-to-back via <Series>. Total = 1350 frames
// (45s @ 30fps). Inside-scene fade-out animations on Hook + Send do the
// "transition" work — keeps total length deterministic and avoids the
// transition-overlap math headache.
//
// Scene durations match the storyboard exactly:
//   Cover    90  (0–90)
//   Hook    210  (90–300)
//   Promise 120  (300–420)
//   Snap    180  (420–600)
//   AI      240  (600–840)
//   Drag    150  (840–990)
//   Send    240  (990–1230)
//   Outro   120  (1230–1350)

import { AbsoluteFill, Audio, Series, interpolate, staticFile } from "remotion";
import { colors } from "./design/tokens";
import { FONT } from "./lib/theme";
import { TitleScene } from "./scenes/TitleScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { SolutionScene } from "./scenes/SolutionScene";
import { DemoScene } from "./scenes/DemoScene";
import { ParseScene } from "./scenes/ParseScene";
import { DragScene } from "./scenes/DragScene";
import { SendScene } from "./scenes/SendScene";
import { OutroScene } from "./scenes/OutroScene";

const TOTAL_FRAMES = 1350;
const FADE_OUT_FRAMES = 30;

export const MainComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: FONT }}>
      <Audio
        src={staticFile("song.mp3")}
        endAt={TOTAL_FRAMES}
        volume={(f) =>
          interpolate(
            f,
            [0, 6, TOTAL_FRAMES - FADE_OUT_FRAMES, TOTAL_FRAMES],
            [0, 0.7, 0.7, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          )
        }
      />
      <Series>
        <Series.Sequence durationInFrames={90}>
          <TitleScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={210}>
          <ProblemScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <SolutionScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={180}>
          <DemoScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={240}>
          <ParseScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={150}>
          <DragScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={240}>
          <SendScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={120}>
          <OutroScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
