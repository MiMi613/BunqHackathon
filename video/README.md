# video — bunq Split product trailer (Remotion)

A 25-second product trailer for bunq Split, written in React + Remotion.
Same design tokens as the app (`/frontend`): dark surfaces, brand orange,
Bricolage Grotesque, gradient avatars.

## Scenes

| # | Name      | Length | What happens                                              |
|---|-----------|--------|-----------------------------------------------------------|
| 1 | Title     | 3s     | Logo tile + "bunq Split" + tagline                        |
| 2 | Problem   | 4s     | Messy chat bubbles + "It's painful."                      |
| 3 | Solution  | 4s     | Three steps: Snap → Type → Done                           |
| 4 | Demo      | 6s     | Phone showing user msg → loading → SplitCard appears      |
| 5 | Send      | 5s     | Per-person ↗ buttons fire one by one with green ✓ feedback|
| 6 | Outro     | 3s     | Logo + bunq Hackathon 7.0                                 |

Output: 1920×1080 @ 30fps (750 frames total).

## Usage

```bash
cd video
npm install                # one-time
npm run dev                # opens Remotion Studio at http://localhost:3000
                           # (preview & scrub frame-by-frame)
npm run build              # renders out/bunq-split.mp4
npm run lint               # tsc --noEmit
```

First `npm run build` downloads a headless Chromium (~300 MB) — only once.

## Project layout

```
video/
├── src/
│   ├── index.ts                # registerRoot
│   ├── Root.tsx                # <Composition id="MainVideo" .../>
│   ├── Composition.tsx         # <Series> stitching the 6 scenes
│   ├── lib/
│   │   └── theme.ts            # COLORS + FONT (mirrors design system)
│   ├── components/
│   │   ├── Money.tsx           # superscript-decimal money atom
│   │   ├── PersonChip.tsx      # gradient avatar
│   │   ├── PhoneFrame.tsx      # iOS-ish phone bezel + screen
│   │   └── SplitCardMock.tsx   # SplitCard recreation for the phone
│   └── scenes/
│       ├── TitleScene.tsx
│       ├── ProblemScene.tsx
│       ├── SolutionScene.tsx
│       ├── DemoScene.tsx
│       ├── SendScene.tsx
│       └── OutroScene.tsx
├── package.json
├── tsconfig.json
├── remotion.config.ts
└── README.md
```

## Tweaking

* **Change the runtime**: edit `durationInFrames` per scene in
  `src/Composition.tsx` and the total in `src/Root.tsx`.
* **Change colors**: edit `src/lib/theme.ts` — every scene reads from `C`.
* **Change vertical (story) format**: in `Root.tsx`, swap `width={1920}
  height={1080}` for `width={1080} height={1920}`. Scenes use flex
  centering so they reflow gracefully, but a few scenes will need the
  flex direction switched.
