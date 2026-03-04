import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          background: "#313a43",
        }}
      >
        {/* Left lime accent bar */}
        <div
          style={{
            width: 8,
            height: "100%",
            background: "#ccff33",
            flexShrink: 0,
          }}
        />
        {/* Content area with padding */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 60,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: "white",
                letterSpacing: "-0.02em",
              }}
            >
              LIFTD+
            </div>
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "white",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              Cannabis education for adults.
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#bac8b2",
                lineHeight: 1.4,
              }}
            >
              Learn about cannabis for sleep, stress, and pain. Free to start.
            </div>
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#ccff33",
              fontWeight: 600,
            }}
          >
            liftdplus.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
