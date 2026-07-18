import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const at = (
  frame: number,
  start: number,
  end: number,
  from: number,
  to: number,
) =>
  interpolate(frame, [start, end], [from, to], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
const fade = (frame: number, start: number, end: number) =>
  at(frame, start, end, 0, 1);

const panel = {
  background: "linear-gradient(135deg, rgba(24,24,48,.98), rgba(10,10,24,.98))",
  border: "1px solid rgba(255,255,255,.11)",
  boxShadow: "0 35px 90px rgba(0,0,0,.48), inset 0 1px rgba(255,255,255,.06)",
  borderRadius: 28,
} as const;

const Cursor = ({
  x,
  y,
  visible = 1,
}: {
  x: number;
  y: number;
  visible?: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity: visible,
      zIndex: 8,
      filter: "drop-shadow(0 10px 12px rgba(0,0,0,.45))",
    }}
  >
    <svg width="54" height="66" viewBox="0 0 54 66" fill="none">
      <path
        d="M6 4l37 31-17 2 9 19-11 5-9-20-9 14V4z"
        fill="white"
        stroke="#0a0a18"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const Choice = ({
  label,
  icon,
  active,
  accent,
  focusAmount = 0,
}: {
  label: string;
  icon?: string;
  active: boolean;
  accent: string;
  focusAmount?: number;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 18,
      padding: "18px 22px",
      borderRadius: 16,
      border: `1px solid ${active ? accent : "rgba(255,255,255,.09)"}`,
      background: active ? `${accent}22` : "rgba(255,255,255,.035)",
      boxShadow: active
        ? `0 0 0 2px ${accent}22, 0 12px 28px ${accent}22`
        : "none",
      color: active ? "#fff" : "#9da4bc",
      fontSize: 27,
      fontWeight: 650,
      scale: 1 + focusAmount * 0.055,
    }}
  >
    {icon ? (
      <Img
        src={staticFile(icon)}
        style={{ width: 36, height: 36, objectFit: "contain" }}
      />
    ) : (
      <span style={{ width: 36, textAlign: "center" }}>✦</span>
    )}
    {label}
    {active && (
      <span style={{ marginLeft: "auto", color: accent, fontSize: 23 }}>✓</span>
    )}
  </div>
);

export const LlmStringsDemo = () => {
  const frame = useCurrentFrame();
  const intro = fade(frame, 0, 18) * (1 - fade(frame, 55, 70));
  const done = fade(frame, 278, 298);
  const motionEase = Easing.bezier(0.22, 0.61, 0.36, 1);
  const providerFocus = fade(frame, 76, 90) * (1 - fade(frame, 112, 124));
  const modelFocus = fade(frame, 150, 164) * (1 - fade(frame, 180, 192));
  const thinkingFocus = fade(frame, 210, 224) * (1 - fade(frame, 244, 256));
  const cameraScale = interpolate(
    frame,
    [0, 45, 90, 115, 165, 185, 225, 248, 280, 305, 359],
    [0.89, 1, 1.55, 1.55, 1.55, 1.55, 1.48, 1.48, 1.05, 1, 1.1],
    { easing: motionEase, extrapolateRight: "clamp" },
  );
  const cameraX = interpolate(
    frame,
    [0, 45, 90, 115, 165, 185, 225, 248, 280, 305, 359],
    [-70, -20, 235, 235, -225, -225, 0, 0, 0, 0, 0],
    { easing: motionEase, extrapolateRight: "clamp" },
  );
  const cameraY = interpolate(
    frame,
    [0, 45, 90, 115, 165, 185, 225, 248, 280, 305, 359],
    [38, 2, -18, -18, -18, -18, -145, -145, 0, 0, 0],
    { easing: motionEase, extrapolateRight: "clamp" },
  );
  const cursorOpacity = fade(frame, 48, 60);
  const cursorX = interpolate(
    frame,
    [48, 90, 115, 165, 185, 225, 248, 270, 278],
    [900, 470, 470, 1010, 1010, 775, 775, 900, 920],
    { easing: motionEase, extrapolateRight: "clamp" },
  );
  const cursorY = interpolate(
    frame,
    [48, 90, 115, 165, 185, 225, 248, 270, 278],
    [600, 350, 350, 350, 350, 560, 560, 700, 700],
    { easing: motionEase, extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        background: "#080812",
        color: "#f7f7ff",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 25% 20%, #5f55ff44, transparent 31%), radial-gradient(circle at 78% 75%, #36d6c744, transparent 32%), linear-gradient(120deg, #0a0a1c, #12102d 48%, #07171c)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1250,
          height: 1250,
          borderRadius: "50%",
          border: "1px solid #a299ff26",
          top: -520,
          right: -170,
          rotate: `${frame * 0.12}deg`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          border: "1px solid #4cf5dc22",
          bottom: -600,
          left: -190,
          rotate: `${-frame * 0.09}deg`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: 1800,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 1280,
            height: 760,
            scale: cameraScale,
            translate: `${cameraX}px ${cameraY}px`,
            transform: "rotateX(8deg) rotateY(-13deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              ...panel,
              position: "absolute",
              width: 1000,
              height: 620,
              left: 150,
              top: 90,
              padding: 44,
              opacity: 0.55,
              transform: "translate(-64px, 56px) rotateZ(-3deg)",
            }}
          />
          <div
            style={{
              ...panel,
              position: "absolute",
              width: 1080,
              height: 650,
              left: 100,
              top: 48,
              padding: 44,
              opacity: 0.82,
              transform: "translate(-24px, 24px) rotateZ(-1.2deg)",
            }}
          />
          <div
            style={{
              ...panel,
              position: "absolute",
              width: 1120,
              height: 680,
              left: 78,
              top: 20,
              padding: "38px 48px",
              overflow: "hidden",
              transformStyle: "preserve-3d",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                color: "#a7aac4",
                fontSize: 21,
                letterSpacing: 1.8,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              <span style={{ color: "#7c73ff", fontSize: 25 }}>◈</span> LLM
              Strings{" "}
              <span
                style={{ marginLeft: "auto", color: "#5fe9cc", fontSize: 18 }}
              >
                CONFIG READY
              </span>
            </div>
            <div
              style={{
                marginTop: 30,
                padding: "24px 28px",
                borderRadius: 18,
              background: "#070714",
              border: "1px solid #ffffff16",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: frame > 215 ? 21 : 31,
              whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: "#74788d" }}>llm://</span>
              <span style={{ color: "#aba6ff" }}>openrouter.ai</span>
              <span style={{ color: "#74788d" }}>/</span>
              <span style={{ color: "#57e6bd" }}>
                {frame < 151 ? "model" : "deepseek/deepseek-v4-flash"}
              </span>
              <span style={{ color: "#74788d" }}>
                {frame > 215 ? "?thinking=low" : ""}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18,
                marginTop: 28,
              }}
            >
              <div
                style={{
                  padding: 24,
                  borderRadius: 20,
                  background: `rgba(162, 153, 255, ${0.025 + providerFocus * 0.095})`,
                  border: `1px solid rgba(162, 153, 255, ${0.08 + providerFocus * 0.92})`,
                  opacity: 1 - Math.max(modelFocus, thinkingFocus) * 0.66,
                  boxShadow: `0 0 0 2px rgba(162, 153, 255, ${providerFocus * 0.16}), 0 24px 50px rgba(113, 101, 255, ${providerFocus * 0.16})`,
                }}
              >
                <div
                  style={{
                    color: "#8990aa",
                    fontSize: 18,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Provider
                </div>
                <Choice
                  label="OpenRouter"
                  icon="openrouter.svg"
                  accent="#a299ff"
                  active={frame >= 97}
                  focusAmount={providerFocus}
                />
              </div>
              <div
                style={{
                  padding: 24,
                  borderRadius: 20,
                  background: `rgba(93, 136, 255, ${0.025 + modelFocus * 0.095})`,
                  border: `1px solid rgba(93, 136, 255, ${0.08 + modelFocus * 0.92})`,
                  opacity: 1 - Math.max(providerFocus, thinkingFocus) * 0.66,
                  boxShadow: `0 0 0 2px rgba(93, 136, 255, ${modelFocus * 0.16}), 0 24px 50px rgba(93, 136, 255, ${modelFocus * 0.16})`,
                }}
              >
                <div
                  style={{
                    color: "#8990aa",
                    fontSize: 18,
                    letterSpacing: 1.4,
                    textTransform: "uppercase",
                    marginBottom: 16,
                  }}
                >
                  Model
                </div>
                <Choice
                  label="DeepSeek V4 Flash"
                  icon="deepseek.svg"
                  accent="#5d88ff"
                  active={frame >= 163}
                  focusAmount={modelFocus}
                />
              </div>
            </div>
            <div
              style={{
                marginTop: 18,
                display: "flex",
                alignItems: "center",
                padding: "20px 24px",
                borderRadius: 20,
              background: `linear-gradient(90deg, rgba(62, 205, 178, ${0.025 + thinkingFocus * 0.18}), rgba(102, 89, 253, ${0.025 + thinkingFocus * 0.24}))`,
              border: `1px solid rgba(78, 228, 194, ${0.08 + thinkingFocus * 0.92})`,
              opacity: 1 - Math.max(providerFocus, modelFocus) * 0.66,
              boxShadow: `0 0 0 2px rgba(78, 228, 194, ${thinkingFocus * 0.16}), 0 24px 50px rgba(62, 205, 178, ${thinkingFocus * 0.16})`,
              }}
            >
              <div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>Thinking</div>
                <div style={{ color: "#9da4bc", fontSize: 17, marginTop: 5 }}>
                  Balance speed and depth for every request.
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                {["Off", "Low", "Medium", "High"].map((value) => (
                  <span
                    key={value}
                    style={{
                      padding: "11px 17px",
                      borderRadius: 12,
                      fontSize: 18,
                      fontWeight: 700,
                      background:
                        value === "Low" && frame >= 235
                          ? "#52dfc7"
                          : "#ffffff0c",
                      color:
                        value === "Low" && frame >= 235 ? "#06201d" : "#9da4bc",
                    }}
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Cursor
            x={cursorX}
            y={cursorY}
            visible={cursorOpacity * (1 - done)}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 110,
          top: 118,
          opacity: intro,
          maxWidth: 690,
        }}
      >
        <div
          style={{
            color: "#71f1d8",
            fontSize: 24,
            fontWeight: 750,
            letterSpacing: 2.3,
            textTransform: "uppercase",
          }}
        >
          One portable config
        </div>
        <div
          style={{
            fontSize: 82,
            lineHeight: 1.02,
            letterSpacing: -4,
            fontWeight: 800,
            marginTop: 18,
          }}
        >
          Route any model
          <br />
          in seconds.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: done,
          background: "rgba(8, 8, 18, .92)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            scale: at(frame, 278, 325, 0.82, 1),
            translate: `0 ${at(frame, 278, 325, 35, 0)}px`,
          }}
        >
          <div
            style={{
              fontSize: 27,
              color: "#62e8ce",
              fontWeight: 750,
              letterSpacing: 2.4,
              textTransform: "uppercase",
            }}
          >
            Done
          </div>
          <div
            style={{
              fontSize: 84,
              letterSpacing: -4,
              fontWeight: 850,
              marginTop: 16,
            }}
          >
            One string. Ready to ship.
          </div>
          <div
            style={{
              marginTop: 28,
              fontFamily: "ui-monospace, monospace",
              color: "#b9b5ff",
              fontSize: 30,
            }}
          >
            llm://openrouter.ai/deepseek/deepseek-v4-flash?thinking=low
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
