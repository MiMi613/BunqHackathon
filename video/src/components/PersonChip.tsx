// Avatar tile, mirrors the app's <PersonAvatar>: 2-tone gradient with
// gloss overlay, "Me" label for self, otherwise first initial.

import { FONT } from "../lib/theme";

const PALETTE = [
  { from: "#C026D3", to: "#7E22CE" },
  { from: "#14B8A6", to: "#0D9488" },
  { from: "#FF2E6C", to: "#DB2777" },
  { from: "#2D7FF9", to: "#1D4ED8" },
  { from: "#F5B700", to: "#D97706" },
  { from: "#1DD67C", to: "#059669" },
];

const SELF = { from: "#FF8A3C", to: "#FF3B5C" };

function hash(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return Math.abs(h);
}

interface PersonChipProps {
  name: string;
  isSelf?: boolean;
  size?: number;
}

export const PersonChip: React.FC<PersonChipProps> = ({
  name,
  isSelf = false,
  size = 48,
}) => {
  const g = isSelf ? SELF : PALETTE[hash(name) % PALETTE.length];
  const label = isSelf ? "Me" : name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(135deg, ${g.from} 0%, ${g.to} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size * 0.42,
        color: "white",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)",
        }}
      />
      <span style={{ position: "relative", letterSpacing: -1 }}>{label}</span>
    </div>
  );
};
