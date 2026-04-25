# bunq Split — Hackathon trailer storyboard

**Format:** 1920×1080 @ 30fps · **Total:** 45s · **1350 frames**

## Scenes

| # | Scene | Duration | Storyboard frame range | Local 0– | Beat |
|---|---|---|---|---|---|
| 1 | Cover (logo + tagline) | 3s | 0–90 | 0–90 | Brand intro |
| 2 | Hook (chat bubbles + "It's painful.") | 7s | 90–300 | 0–210 | Problem |
| 3 | Promise (Snap → Type → Done) | 4s | 300–420 | 0–120 | Solution |
| 4 | Step 01 — Snap the receipt | 6s | 420–600 | 0–180 | Multimodal input #1 |
| 5 | Step 02 — AI splits it for you | 8s | 600–840 | 0–240 | AI core |
| 6 | Step 03 — Fix anything by dragging | 5s | 840–990 | 0–150 | User control |
| 7 | Step 04 — Send their share | 8s | 990–1230 | 0–240 | **bunq API moment** |
| 8 | Outro (Built at bunq Hackathon 7.0) | 4s | 1230–1350 | 0–120 | CTA |

## Per-scene choreography

### Scene 1 — Cover (local 0–90)
- Background: radial glow pulses behind logo (`usePulse`)
- Logo icon: `useReveal(0, springs.soft)` — scale 0.6 → 1, opacity 0 → 1
- "bunq" wordmark: per-letter mask reveal staggered 2f, starting local frame 15
- "Split" wordmark: same, starting frame 30 (white)
- Subtitle: fade-up +20 → 0, frame 50

### Scene 2 — Hook (local 0–210)
- "Splitting bills with friends?": text reveal at frame 5
- Bubble 1 ("wait how much do I owe??"): spring entrance, frame 40 (scene-local)
- Bubble 2 ("I think you had the wine"): from-right slide, frame 70
- Bubble 3 ("did Marco ever pay back?"): same, frame 105
- Subtle wobble post-entrance (rotate -1° → 1° → 0°, 12f cycle)
- "It's painful." — frame 150, scale 1.2 → 1 with weight shift 600 → 800

### Scene 3 — Promise (local 0–120)
- "We made it stupid simple.": frame 5
- 📷 Snap icon: spring entrance frame 35
- Arrow 1 draws frame 50
- 💬 Type icon: spring entrance frame 58
- Arrow 2 draws frame 73
- ✓ Done icon: spring entrance frame 81
- "Done" white → coral color flip at frame 100, with scale pulse

### Scene 4 — Snap (local 0–180)
- STEP 01 label: frame 5
- "Snap the receipt": frame 20
- Phone slides up from below, frame 35
- Camera frame brackets corner-by-corner staggered 4f, starting frame 70
- Receipt floats in from left with -8° tilt, frame 90
- Inside-phone receipt: scan-line sweep 30f, frame 120
- Shutter button: pulse loop (period 30f)
- Hold to 180

### Scene 5 — AI (local 0–240)
- STEP 02 label + "AI splits it for you": frame 5
- Receipt translates from previous position into chat thread, smooth tween 30f
- User message bubble: types in / appears, frame 70
- AI avatar (sparkle icon): pulse entrance, frame 120
- "Reading your receipt…" with loading dots, frame 130
- Shimmer effect over receipt, frame 150–210
- Hold to 240

### Scene 6 — Drag (local 0–150)
- STEP 03 + "Fix anything by dragging": frame 5
- Phone fades up, frame 30
- Card cascades in (header → status pills → person rows), staggered 8f, starting frame 45
- Drag demo: chip lifts, translates Marco → Me, frame 120–145
- Hold to 150

### Scene 7 — Send (local 0–240) — THE BUNQ MOMENT
- STEP 04 + "Send their share": frame 5
- Phone with all assignments: frame 30
- "Send to all" idle pulse glow, frame 50
- Tap interaction frame 90 (button scale 1 → 0.95 → 1)
- Button morphs to loading, frame 100
- Sequential checkmarks with haptic-style scale (0 → 1.2 → 1 spring bounce):
  - Marco → green ✓ + "Payment request sent" toast, frame 130
  - Lucia → green ✓ + toast, frame 150
- Bottom button orange → green "All payments sent", frame 180
- "Powered by bunq API" lockup, frame 200
- Hold to 240

### Scene 8 — Outro (local 0–120)
- Black background, hard cut from scene 7
- Logo icon: scale 0.8 → 1 spring, frame 5
- "bunq Split" wordmark mask reveal, frame 20
- Tagline "Built in 24h at bunq Hackathon 7.0": fade-up, frame 50
- Team + GitHub URL: fade-up, frame 75
- Ambient glow loop on logo

## Color tokens (extracted from `frontend/app/globals.css`)

| Name | Hex |
|---|---|
| `bg` | `#05101F` |
| `bgDeep` (outro) | `#000000` |
| `surface` | `#141826` |
| `elevated` | `#1E2230` |
| `accent` | `#FF6A00` |
| `accentLight` | `#FF8A3C` |
| `accentEnd` | `#FF3B5C` |
| `hot` (red-pink, "It's painful") | `#FF3B5C` |
| `success` | `#1DD67C` |
| `blue` (chat secondary) | `#2D7FF9` |
| `catPurple` | `#C026D3` |
| `catTeal` | `#14B8A6` |
| `catPink` | `#FF2E6C` |
| `ink` | `#FFFFFF` |
| `inkSubtle` | `#8B92A7` |
| `inkMuted` | `#4A5166` |

Font: **Bricolage Grotesque** (matches webapp) via `@remotion/google-fonts`.
