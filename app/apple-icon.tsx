import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// ImageResponse cannot read CSS variables; value mirrors --color-claude-600.
const ACCENT = "#c25e3d";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: ACCENT,
        }}
      >
        <svg
          width="113"
          height="144"
          viewBox="4.6 2.6 14.8 18.8"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="14" y="14" width="4" height="6" rx="2" />
          <rect x="6" y="4" width="4" height="6" rx="2" />
          <path d="M6 20h4" />
          <path d="M14 10h4" />
          <path d="M6 14h2v6" />
          <path d="M14 4h2v6" />
        </svg>
      </div>
    ),
    size
  );
}
