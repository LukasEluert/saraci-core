import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

// Logo ist weisser Schriftzug -> auf dunklem Grund rendern, damit es im Tab sichtbar ist.
export default function Icon() {
  const logo = readFileSync(join(process.cwd(), "public", "logo-white.png"));
  const src = `data:image/png;base64,${logo.toString("base64")}`;

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
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={26} height={21} alt="Saraci" />
      </div>
    ),
    size
  );
}
