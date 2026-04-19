import { ImageResponse } from "next/og";
import { messages } from "@/lib/messages";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = messages.faq.meta.title;

export default function FaqOG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #1a1410 0%, #0a0805 100%)",
          color: "#f2ead8",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: "0.02em",
            color: "#e8b547",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              background: "#e8b547",
            }}
          />
          Dofus Companion
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 28,
              letterSpacing: "0.25em",
              color: "#c4b89c",
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            FAQ
          </div>
          <div
            style={{
              fontSize: 74,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              maxWidth: 1000,
            }}
          >
            Stratégie Klime, Songes Infinis, risque de ban.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            color: "#8a7d68",
            fontSize: 22,
          }}
        >
          <span>Réponses claires, sourcées, sans bullshit</span>
          <span style={{ color: "#e8b547", fontWeight: 600 }}>
            dofuscompanion.com/faq
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
