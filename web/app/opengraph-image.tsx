import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Dofus Companion, l'overlay Dofus qui tient dans Alt+D";

export default function RootOG() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        padding: "80px",
        background: "#0a0805",
        color: "#f2ead8",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          width: 200,
          height: 240,
          borderRadius: "50%",
          background: "#e8b547",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "#0a0805",
            color: "#e8b547",
            fontSize: 44,
            fontWeight: 700,
            padding: "16px 32px",
            borderRadius: 12,
            letterSpacing: "0.02em",
          }}
        >
          Alt D
        </div>
      </div>
      <div
        style={{
          fontSize: 84,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
        }}
      >
        Dofus Companion
      </div>
      <div
        style={{
          fontSize: 30,
          color: "#c4b89c",
        }}
      >
        L&apos;overlay qui tient dans Alt+D
      </div>
      <div
        style={{
          fontSize: 22,
          letterSpacing: "0.25em",
          color: "#e8b547",
          fontFamily: "monospace",
          textTransform: "uppercase",
          marginTop: 12,
        }}
      >
        185 donjons · FR / EN · Indépendant
      </div>
    </div>,
    { ...size },
  );
}
