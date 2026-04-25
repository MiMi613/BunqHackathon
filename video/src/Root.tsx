import { Composition } from "remotion";
import { MainComposition } from "./Composition";

// 45s @ 30fps = 1350 frames. 1920x1080 horizontal — best for slide decks
// and projector demos at the hackathon.
//
// Scene durations (frames):
//   Cover    90  (0–90)
//   Hook    210  (90–300)
//   Promise 120  (300–420)
//   Snap    180  (420–600)
//   AI      240  (600–840)
//   Drag    150  (840–990)
//   Send    240  (990–1230)
//   Outro   120  (1230–1350)
export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={MainComposition}
      durationInFrames={1350}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
