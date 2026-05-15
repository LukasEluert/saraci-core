import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#060606",
          color: "#efefef",
          paddingLeft: 18,
          paddingRight: 18,
          fontFamily:
            "'DM Mono','ui-monospace','SF Mono','Menlo','monospace'",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: -1, fontWeight: 600 }}>
          SARACI
        </div>
        <div
          style={{
            fontSize: 26,
            letterSpacing: -1,
            fontWeight: 600,
            color: "#e63030",
          }}
        >
          CORE
        </div>
      </div>
    ),
    size
  );
}
