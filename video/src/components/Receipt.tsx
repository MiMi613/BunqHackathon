// Printed-thermal-receipt look. Used both as the physical receipt being
// photographed in CaptureScene and as a thumbnail in the user's chat
// message. Accepts a width prop and scales every element internally so it
// looks consistent at any size.

import type { CSSProperties } from "react";

interface ReceiptProps {
  width?: number;
  style?: CSSProperties;
}

const ITEMS = [
  ["Pizza Diavola", "11.00"],
  ["Acqua Naturale", "2.50"],
  ["Pasta Carbonara", "13.00"],
  ["Tiramisù", "6.00"],
  ["Birra Media", "5.00"],
  ["Insalata Greca", "9.00"],
  ["Coperto", "2.00"],
] as const;

export const Receipt: React.FC<ReceiptProps> = ({ width = 280, style }) => {
  const s = width / 280; // base design at 280px wide

  return (
    <div
      style={{
        width,
        background: "#FAF8F2",
        color: "#1A1A1A",
        fontFamily:
          "'SF Mono', 'Menlo', 'Consolas', 'Courier New', monospace",
        padding: 20 * s,
        fontSize: 12 * s,
        lineHeight: 1.5,
        boxShadow: "0 30px 60px -15px rgba(0,0,0,0.7)",
        position: "relative",
        ...style,
      }}
    >
      {/* serrated bottom edge — gives it that "torn paper" feel */}
      <div
        style={{
          position: "absolute",
          bottom: -8 * s,
          left: 0,
          right: 0,
          height: 8 * s,
          backgroundImage: `linear-gradient(135deg, #FAF8F2 25%, transparent 25%), linear-gradient(225deg, #FAF8F2 25%, transparent 25%)`,
          backgroundSize: `${10 * s}px ${10 * s}px`,
          backgroundPosition: "0 0",
        }}
      />

      <div
        style={{
          textAlign: "center",
          fontSize: 16 * s,
          fontWeight: 800,
          letterSpacing: 1.5,
        }}
      >
        MARIO&apos;S PIZZERIA
      </div>
      <div style={{ textAlign: "center", fontSize: 9 * s, marginTop: 2 * s }}>
        Via Roma 12, Milano
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: 9 * s,
          marginBottom: 14 * s,
          opacity: 0.7,
        }}
      >
        24/04/2026 &middot; 20:30
      </div>

      <div
        style={{
          borderTop: `1px dashed #999`,
          borderBottom: `1px dashed #999`,
          padding: `${10 * s}px 0`,
          marginBottom: 12 * s,
        }}
      >
        {ITEMS.map(([name, price], i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11 * s,
              marginBottom: 2 * s,
            }}
          >
            <span>{name}</span>
            <span>{price}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 800,
          fontSize: 14 * s,
        }}
      >
        <span>TOTAL</span>
        <span>€48.50</span>
      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: 14 * s,
          fontSize: 9 * s,
          opacity: 0.6,
          letterSpacing: 2,
        }}
      >
        — GRAZIE —
      </div>
    </div>
  );
};
