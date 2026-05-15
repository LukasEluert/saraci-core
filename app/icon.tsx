import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#060606",
          color: "#e63030",
          fontSize: 18,
          fontWeight: 600,
          fontFamily:
            "'DM Mono','ui-monospace','SF Mono','Menlo','monospace'",
        }}
      >
        SC
      </div>
    ),
    size
  );
}
