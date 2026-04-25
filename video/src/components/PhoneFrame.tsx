// Stylised phone frame for the Demo and Send scenes. Matte black bezel
// with a notch; the screen area takes the children, clipped to the
// rounded screen radius.

import type { CSSProperties, ReactNode } from "react";
import { C } from "../lib/theme";

interface PhoneFrameProps {
  children: ReactNode;
  width?: number;
  height?: number;
  style?: CSSProperties;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  width = 540,
  height = 1100,
  style,
}) => {
  const bezel = 14;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 64,
        background: "#0a0a0a",
        padding: bezel,
        boxShadow:
          "0 0 0 2px rgba(255,255,255,0.04), 0 40px 100px -20px rgba(0,0,0,0.6)",
        position: "relative",
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 50,
          background: C.base,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* notch */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 130,
            height: 32,
            borderRadius: 18,
            background: "#000",
            zIndex: 10,
          }}
        />
        {children}
      </div>
    </div>
  );
};
