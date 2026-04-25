// Recreation of the app's <Money> atom: superscript decimals so the
// whole-euro figure dominates visually. Pure CSS (vertical-align + smaller
// font-size), so it stays font-consistent at any scale.

import { FONT } from "../lib/theme";
import type { CSSProperties } from "react";

interface MoneyProps {
  amount: number;
  size?: number; // base font-size in px
  color?: string;
  weight?: 400 | 500 | 600 | 700 | 800;
  style?: CSSProperties;
}

export const Money: React.FC<MoneyProps> = ({
  amount,
  size = 36,
  color = "#FFFFFF",
  weight = 700,
  style,
}) => {
  const isNeg = amount < 0;
  const abs = Math.abs(amount);
  const whole = Math.floor(abs);
  const cents = Math.round((abs - whole) * 100).toString().padStart(2, "0");

  return (
    <span
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {isNeg && "−"}€{whole}
      <span
        style={{
          fontSize: size * 0.6,
          verticalAlign: "super",
          marginLeft: -size * 0.04,
        }}
      >
        .{cents}
      </span>
    </span>
  );
};
