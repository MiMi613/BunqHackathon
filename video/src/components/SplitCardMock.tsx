// Mock of the real <SplitCard>. Pixel sizes here are deliberately tuned to
// match the production component (frontend/components/split/SplitCard.tsx
// and friends): same border-radius, same paddings, same text scales, same
// gradient endpoints. The mock is slightly wider than a real iPhone screen
// (424 vs ~358) because the video phone is 480 wide instead of 390 — but
// every internal value mirrors the real app.
//
// What it renders (top → bottom, with space-y-4 = 16 between sections):
//   1. Header: pizza icon, merchant, time, sum-check pill, total
//   2. Status row: "All items assigned" pill + "Split equally" pill (gap 8)
//   3. Person rows (gap 8) with avatar + name/status + total + per-person
//      ↗ button, and item chips below. When a row is "sent": green badge
//      on avatar, "Payment request sent" status, success-tinted bg, ↗ → ✓.
//   4. Optional global CTA: "Send to all" gradient OR success "All payments sent".
//
// Drag affordances (used by DragScene):
//   - dimmedItemIndex on a person → that chip renders at 30% opacity
//   - dropZoneActive on a person → row tints primary + lifts (-2px)
//
// Animation values are passed in from the scene — this component is purely
// visual.

import { C, FONT } from "../lib/theme";
import { Money } from "./Money";
import { PersonChip } from "./PersonChip";

export interface MockItem {
  name: string;
  price: number;
  /** Number of people this item is shared with (renders the `÷N` pill). */
  sharedAmong?: number;
}

export interface MockPerson {
  name: string;
  isSelf?: boolean;
  total: number;
  items: MockItem[];
  /** Marks the row as "Payment request sent". */
  sent?: boolean;
  /** Pulsing primary ring around the per-person send button. */
  pulsingButton?: boolean;
  /** 0..1 progress for the floating "Payment request sent" toast above the row. */
  toastVisible?: number;
  /** Index of an item to render at 30% opacity (drag source). */
  dimmedItemIndex?: number;
  /** Tint the row primary (drop-zone "isOver"). */
  dropZoneActive?: boolean;
}

interface SplitCardMockProps {
  merchant: string;
  total: number;
  people: MockPerson[];
  glowColor?: string;
  showButtons?: boolean;
  globalCTA?: "send-all" | "all-sent";
  globalCTAPulse?: boolean;
  /** Free-form, mirrors how the real app renders BackendInfo.time. */
  time?: string;
}

// ─── inline icons (no extra deps) ────────────────────────────────────

const PizzaIcon: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 11h.01" />
    <path d="M11 15h.01" />
    <path d="M16 16h.01" />
    <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
    <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
  </svg>
);

const CheckCircleIcon: React.FC<{ size?: number; strokeWidth?: number }> = ({
  size = 14,
  strokeWidth = 2.5,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number; strokeWidth?: number }> = ({
  size = 12,
  strokeWidth = 3,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const UsersIcon: React.FC<{ size?: number; strokeWidth?: number }> = ({
  size = 14,
  strokeWidth = 2.5,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SendIcon: React.FC<{ size?: number; strokeWidth?: number }> = ({
  size = 15,
  strokeWidth = 2.5,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const ArrowUpRightIcon: React.FC<{ size?: number; strokeWidth?: number }> = ({
  size = 16,
  strokeWidth = 2.5,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </svg>
);

// ─── shared chip visual (exported so DragScene can render a matching ghost) ─

interface ChipVisualProps {
  name: string;
  price: number;
  sharedAmong?: number;
  /** Adds the warm brand-glow used by the drag preview. */
  lifted?: boolean;
  /** Adds a small rotation, used by the drag preview. */
  tilted?: boolean;
  /** 0–1, used to dim the chip in place (drag source). */
  opacity?: number;
}

export const ChipVisual: React.FC<ChipVisualProps> = ({
  name,
  price,
  sharedAmong = 1,
  lifted = false,
  tilted = false,
  opacity = 1,
}) => {
  const isShared = sharedAmong > 1;
  const displayPrice = isShared ? price / sharedAmong : price;

  const transforms: string[] = [];
  if (lifted) transforms.push("scale(1.08)");
  if (tilted) transforms.push("rotate(-2deg)");

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8, // gap-2
        borderRadius: 999, // rounded-full
        border: `1px solid ${C.hairline}`,
        background: C.elevated,
        padding: "6px 14px", // py-1.5 px-3.5
        fontFamily: FONT,
        fontSize: 14, // text-sm
        letterSpacing: -0.3, // tracking-tight
        color: C.fg,
        opacity,
        boxShadow: lifted
          ? `0 12px 32px -8px ${C.primary}73, 0 4px 12px rgba(0, 0, 0, 0.35)`
          : undefined,
        transform: transforms.length ? transforms.join(" ") : undefined,
      }}
    >
      <span
        style={{
          fontWeight: 600, // font-semibold
          maxWidth: 140,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </span>
      <Money
        amount={displayPrice}
        size={12} // text-xs
        weight={600} // font-semibold
        color={isShared ? C.secondary : C.fgMuted}
      />
      {isShared && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: 999,
            background: `${C.secondary}26`, // bg-secondary/15
            padding: "2px 6px", // py-0.5 px-1.5
            fontSize: 10,
            fontWeight: 700, // font-bold
            color: C.secondary,
            letterSpacing: -0.3, // tracking-tight
            lineHeight: 1,
          }}
        >
          ÷{sharedAmong}
        </span>
      )}
    </span>
  );
};

// ─── card ────────────────────────────────────────────────────────────

export const SplitCardMock: React.FC<SplitCardMockProps> = ({
  merchant,
  total,
  people,
  glowColor = C.catPink,
  showButtons = true,
  globalCTA,
  globalCTAPulse = false,
  time = "24/04/2026 · 20:30",
}) => {
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 28, // --radius-card
        border: `1px solid ${C.hairline}`,
        background: C.surface,
        padding: 16, // p-4
        fontFamily: FONT,
      }}
    >
      {/* Glow lives in its own clipped layer so toasts on rows can extend
          beyond the card without being chopped off. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 28,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -96,
            left: -96,
            width: 256, // size-64
            height: 256,
            borderRadius: "50%",
            background: glowColor,
            opacity: 0.2, // opacity-20 to match real
            filter: "blur(48px)", // blur-3xl
          }}
        />
      </div>

      {/* header (space-y-4 between sections → 16 marginBottom) */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: 12, // gap-3
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 56, // size-14 (lg)
            height: 56,
            borderRadius: 16, // rounded-[16px] (lg)
            background: glowColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <PizzaIcon size={26} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 18, // text-lg
              fontWeight: 700, // font-bold
              color: C.fg,
              lineHeight: 1.25, // leading-tight
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {merchant}
          </div>
          <div style={{ fontSize: 12, color: C.fgMuted, marginTop: 2 }}>
            {time}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6, // gap-1.5
              marginTop: 6, // mt-1.5
              fontSize: 11, // text-[11px]
            }}
          >
            <span style={{ color: C.success, display: "inline-flex" }}>
              <CheckCircleIcon size={12} strokeWidth={2.5} />
            </span>
            <span style={{ color: C.fgMuted }}>
              Items match the receipt total
            </span>
          </div>
        </div>
        <Money amount={total} size={24} weight={700} style={{ lineHeight: 1 }} />
      </div>

      {/* status section (space-y-2 internal = 8) */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <AllAssignedPill />
        <SplitEquallyPill />
      </div>

      {/* people (space-y-2 = 8) */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {people.map((p, i) => (
          <PersonRowMock key={i} person={p} showButton={showButtons} />
        ))}
      </div>

      {/* global CTA (marginTop 16 to maintain space-y-4) */}
      {globalCTA && (
        <div style={{ position: "relative", marginTop: 16 }}>
          <SendAllButton state={globalCTA} pulse={globalCTAPulse} />
        </div>
      )}
    </div>
  );
};

// ─── slots & rows ────────────────────────────────────────────────────

const AllAssignedPill: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8, // gap-2
      borderRadius: 999,
      background: `${C.success}1A`, // bg-success/10
      padding: "8px 0", // py-2
      fontFamily: FONT,
      fontSize: 12, // text-xs
      fontWeight: 500, // font-medium
      color: C.success,
    }}
  >
    <CheckCircleIcon size={14} strokeWidth={2.5} />
    All items assigned
  </div>
);

const SplitEquallyPill: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8, // gap-2
      borderRadius: 999,
      border: `1px solid ${C.hairline}`,
      background: "rgba(30, 34, 48, 0.4)", // bg-elevated/40
      padding: "8px 12px", // py-2 px-3
      fontFamily: FONT,
      fontSize: 12, // text-xs
      fontWeight: 600, // font-semibold
      color: C.fgMuted,
    }}
  >
    <span style={{ color: C.fgMuted, display: "inline-flex" }}>
      <UsersIcon size={14} strokeWidth={2.5} />
    </span>
    Split equally across everyone
  </div>
);

const SendAllButton: React.FC<{
  state: "send-all" | "all-sent";
  pulse?: boolean;
}> = ({ state, pulse }) => {
  const isAllSent = state === "all-sent";

  return (
    <div style={{ position: "relative" }}>
      {pulse && !isAllSent && (
        <div
          style={{
            position: "absolute",
            inset: -5,
            borderRadius: 999,
            border: `2px solid ${C.primary}`,
            opacity: 0.55,
            pointerEvents: "none",
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8, // gap-2
          width: "100%",
          borderRadius: 999, // rounded-full
          padding: "12px 16px", // py-3 px-4
          fontFamily: FONT,
          fontSize: 14, // text-sm
          fontWeight: 600, // font-semibold
          color: "white",
          background: isAllSent
            ? C.success
            : `linear-gradient(135deg, ${C.primaryLight} 0%, ${C.primary} 100%)`,
          boxShadow: isAllSent
            ? `0 0 0 4px rgba(29, 214, 124, 0.18)` // success glow
            : `0 8px 24px -12px rgba(255, 106, 0, 0.7)`, // primary lift
        }}
      >
        {isAllSent ? (
          <>
            <CheckIcon size={16} strokeWidth={3} />
            All payments sent
          </>
        ) : (
          <>
            <SendIcon size={15} strokeWidth={2.5} />
            Send to all
          </>
        )}
      </div>
    </div>
  );
};

const PersonRowMock: React.FC<{ person: MockPerson; showButton: boolean }> = ({
  person,
  showButton,
}) => {
  const sent = !!person.sent;
  const dropActive = !!person.dropZoneActive;
  const toastT = person.toastVisible ?? 0;

  // Border + bg precedence: drop hint > sent > resting (matches real PersonRow)
  const border = dropActive
    ? `1px solid ${C.primary}`
    : sent
      ? `1px solid ${C.success}59` // success/35
      : `1px solid ${C.hairline}`;
  const bg = dropActive
    ? `${C.primary}1A` // primary/10
    : sent
      ? "rgba(29, 214, 124, 0.04)" // success/[0.04]
      : C.elevated;

  return (
    <div
      style={{
        position: "relative",
        padding: 12, // p-3
        borderRadius: 20, // rounded-[20px]
        border,
        background: bg,
        transform: dropActive ? "translateY(-2px)" : "none",
        boxShadow: dropActive
          ? `0 8px 24px -12px rgba(255, 106, 0, 0.6)`
          : "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 /* gap-3 */ }}>
        {/* avatar + sent badge */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <PersonChip name={person.name} isSelf={person.isSelf} size={40} />
          {sent && (
            <div
              style={{
                position: "absolute",
                bottom: -4, // -bottom-1
                right: -4, // -right-1
                width: 16, // size-4
                height: 16,
                borderRadius: 8,
                background: C.success,
                // ring-2 ring-elevated → 2px border colored elevated
                boxShadow: `0 0 0 2px ${C.elevated}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              <CheckIcon size={10} strokeWidth={3.5} />
            </div>
          )}
        </div>

        {/* name + status */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 16, // inherits text-base
              fontWeight: 600, // font-semibold
              color: C.fg,
              lineHeight: 1.25, // leading-tight
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {person.isSelf ? "Me" : person.name}
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 12, // text-xs
              color: C.fgMuted, // real app does NOT recolor this when sent
              marginTop: 2, // mt-0.5
            }}
          >
            {sent
              ? "Payment request sent"
              : person.items.length === 0
                ? "No items yet"
                : `${person.items.length} ${person.items.length === 1 ? "item" : "items"}`}
          </div>
        </div>

        <Money
          amount={person.total}
          size={18} // text-lg
          weight={700} // font-bold
          style={{ letterSpacing: -0.3 }} // tracking-tight
        />

        {showButton && !person.isSelf && (
          <div style={{ position: "relative" }}>
            {person.pulsingButton && !sent && (
              <div
                style={{
                  position: "absolute",
                  inset: -6,
                  borderRadius: 999,
                  border: `2px solid ${C.primary}`,
                  opacity: 0.55,
                }}
              />
            )}
            <div
              style={{
                position: "relative",
                width: 36, // size-9
                height: 36,
                borderRadius: 18,
                background: sent
                  ? C.success
                  : `linear-gradient(135deg, ${C.primaryLight} 0%, ${C.primary} 100%)`,
                boxShadow: sent
                  ? `0 0 0 4px rgba(29, 214, 124, 0.18)`
                  : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              {sent ? (
                <CheckIcon size={16} strokeWidth={3} />
              ) : (
                <ArrowUpRightIcon size={16} strokeWidth={2.5} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* item chips (mt-3 = 12, gap-2 = 8) */}
      {person.items.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 12,
          }}
        >
          {person.items.map((item, i) => (
            <ChipVisual
              key={i}
              name={item.name}
              price={item.price}
              sharedAmong={item.sharedAmong}
              opacity={person.dimmedItemIndex === i ? 0.3 : 1}
            />
          ))}
        </div>
      )}

      {/* floating "Payment request sent" toast */}
      {toastT > 0 && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -8,
            transform: `translate(-50%, ${(1 - toastT) * 12 - 18}px)`,
            opacity: toastT,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 11px",
            background: C.success,
            color: "white",
            fontFamily: FONT,
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 999,
            whiteSpace: "nowrap",
            letterSpacing: -0.2,
            boxShadow: `0 6px 18px -4px rgba(29, 214, 124, 0.5)`,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <CheckIcon size={11} strokeWidth={4} />
          Payment request sent
        </div>
      )}
    </div>
  );
};
