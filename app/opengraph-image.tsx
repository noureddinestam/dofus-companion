import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Dofus Companion — l'overlay Dofus qui tient dans Alt+D";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background:
          "radial-gradient(60% 70% at 50% 0%, rgba(232,181,71,0.18), transparent 70%), #0c0e12",
        color: "#f5f5f4",
        padding: "80px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          fontSize: "22px",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#a1a1aa",
        }}
      >
        <span
          style={{
            display: "flex",
            width: "44px",
            height: "44px",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "10px",
            background: "rgba(232,181,71,0.12)",
            border: "1px solid rgba(232,181,71,0.35)",
            color: "#e8b547",
            fontSize: "20px",
            fontWeight: 600,
            letterSpacing: 0,
          }}
        >
          DC
        </span>
        Dofus Companion
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "60px",
          fontSize: "96px",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.02,
        }}
      >
        L&#39;overlay Dofus qui tient dans{" "}
        <span style={{ color: "#e8b547", marginLeft: "20px" }}>Alt+D</span>.
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "40px",
          fontSize: "30px",
          color: "#a1a1aa",
          maxWidth: "900px",
          lineHeight: 1.3,
        }}
      >
        185 donjons, stratégies bilingues FR/EN, lisible en 10 secondes.
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "20px",
          color: "#a1a1aa",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
        }}
      >
        <span>Windows · Open source · MIT</span>
        <span style={{ color: "#e8b547" }}>dofus-companion-web.vercel.app</span>
      </div>
    </div>,
    { ...size },
  );
}
