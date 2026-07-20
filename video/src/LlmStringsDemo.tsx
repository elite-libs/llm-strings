import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";

const ease = Easing.bezier(0.22, 0.61, 0.36, 1);
const value = (frame: number, start: number, end: number, from: number, to: number) =>
  interpolate(frame, [start, end], [from, to], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
const fade = (frame: number, start: number, end: number) =>
  value(frame, start, end, 0, 1);

const SyntaxString = ({
  host,
  model,
  params,
  fontSize,
}: {
  host: string;
  model: string;
  params?: string;
  fontSize: number;
}) => (
  <div
    style={{
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      fontSize,
      letterSpacing: "-0.055em",
      whiteSpace: "nowrap",
    }}
  >
    <span style={{ color: "#8a8fa6" }}>llm://</span>
    <span style={{ color: "#a9a4ff" }}>{host}</span>
    <span style={{ color: "#8a8fa6" }}>/</span>
    <span style={{ color: "#58e8be" }}>{model}</span>
    {params && <span style={{ color: "#ffc75f" }}>{params}</span>}
  </div>
);

const Pointer = ({ x, y, opacity }: { x: number; y: number; opacity: number }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      zIndex: 10,
      filter: "drop-shadow(0 9px 12px rgba(0,0,0,.45))",
    }}
  >
    <svg width="48" height="59" viewBox="0 0 48 59" fill="none">
      <path
        d="M5 4l34 28-15 2 8 17-10 5-8-18-9 13V4z"
        fill="white"
        stroke="#080812"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const Field = ({
  label,
  content,
  active,
  opacity = 1,
}: {
  label: string;
  content: React.ReactNode;
  active: boolean;
  opacity?: number;
}) => (
  <div
    style={{
      padding: "22px 24px",
      minHeight: 130,
      borderRadius: 21,
      background: active ? "rgba(129, 120, 255, .12)" : "rgba(255,255,255,.025)",
      border: `1px solid ${active ? "#9189ff" : "rgba(255,255,255,.09)"}`,
      boxShadow: active ? "0 0 0 2px rgba(145,137,255,.15), 0 22px 52px rgba(75,64,238,.2)" : "none",
      opacity,
    }}
  >
    <div
      style={{
        color: "#8990aa",
        fontSize: 17,
        letterSpacing: 1.6,
        textTransform: "uppercase",
        fontWeight: 750,
        marginBottom: 15,
      }}
    >
      {label}
    </div>
    {content}
  </div>
);

export const LlmStringsDemo = () => {
  const frame = useCurrentFrame();
  const initial = "llm://openai/gpt-5.5?cache=true";
  const typedLength = Math.min(initial.length, Math.max(0, Math.floor((frame - 4) * 0.82)));
  const typing = fade(frame, 0, 8) * (1 - fade(frame, 56, 78));
  const uiOpacity = fade(frame, 52, 74) * (1 - fade(frame, 248, 270));
  const modelOpen = fade(frame, 122, 138) * (1 - fade(frame, 178, 190));
  const switched = fade(frame, 166, 184);
  const providerFocus = fade(frame, 78, 92) * (1 - fade(frame, 112, 128));
  const modelFocus = fade(frame, 136, 152) * (1 - fade(frame, 192, 206));
  const end = fade(frame, 248, 270);
  const cameraScale = interpolate(
    frame,
    [52, 78, 102, 122, 152, 180, 210, 248],
    [0.84, 1.08, 1.5, 1.22, 1.62, 1.62, 1.18, 0.92],
    { easing: ease, extrapolateRight: "clamp" },
  );
  const cameraX = interpolate(
    frame,
    [52, 78, 102, 122, 152, 180, 210, 248],
    [-35, 92, 192, 72, -180, -180, 0, 0],
    { easing: ease, extrapolateRight: "clamp" },
  );
  const cursorOpacity = fade(frame, 70, 82) * (1 - fade(frame, 194, 210));
  const cursorX = interpolate(
    frame,
    [70, 102, 122, 152, 178, 198],
    [850, 430, 760, 955, 955, 840],
    { easing: ease, extrapolateRight: "clamp" },
  );
  const cursorY = interpolate(
    frame,
    [70, 102, 122, 152, 178, 198],
    [560, 450, 500, 455, 455, 700],
    { easing: ease, extrapolateRight: "clamp" },
  );
  const parameterOffset = interpolate(frame, [260, 310], [0, -250], {
    easing: Easing.bezier(0.1, 0.82, 0.24, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const finalLabel = fade(frame, 320, 346);

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        color: "#f8f8ff",
        background: "#080812",
        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 20% 10%, #6659fd4d, transparent 35%), radial-gradient(circle at 80% 82%, #35d5bf42, transparent 33%), linear-gradient(120deg, #0a0a1d, #14102e 50%, #07181d)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1180,
          height: 1180,
          borderRadius: "50%",
          border: "1px solid #a9a4ff28",
          top: -610,
          right: -150,
          rotate: `${frame * 0.11}deg`,
        }}
      />

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: typing,
        }}
      >
        <div style={{ width: 1460 }}>
          <div
            style={{
              color: "#6fe8d1",
              fontSize: 25,
              letterSpacing: 2.8,
              textTransform: "uppercase",
              fontWeight: 800,
              marginBottom: 30,
            }}
          >
            LLM strings
          </div>
          <div
            style={{
              padding: "46px 52px",
              borderRadius: 30,
              background: "rgba(7,7,20,.84)",
              border: "1px solid rgba(255,255,255,.12)",
              boxShadow: "0 38px 100px rgba(0,0,0,.45)",
            }}
          >
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 65, letterSpacing: "-0.07em" }}>
              <span style={{ color: "#8a8fa6" }}>{initial.slice(0, typedLength).slice(0, 6)}</span>
              <span style={{ color: "#a9a4ff" }}>{initial.slice(0, typedLength).slice(6, 12)}</span>
              <span style={{ color: "#58e8be" }}>{initial.slice(0, typedLength).slice(12, 19)}</span>
              <span style={{ color: "#ffc75f" }}>{initial.slice(0, typedLength).slice(19)}</span>
              <span style={{ color: "#ffffff", opacity: frame % 12 < 7 ? 1 : 0 }}>|</span>
            </div>
          </div>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", perspective: 1800, opacity: uiOpacity }}>
        <div
          style={{
            width: 1160,
            height: 700,
            position: "relative",
            translate: `${cameraX}px 0`,
            transform: `scale(${cameraScale}) rotateX(7deg) rotateY(-11deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div style={{ position: "absolute", inset: "44px -38px -42px 58px", borderRadius: 30, background: "#070713", border: "1px solid #ffffff10", rotate: "-2deg" }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              padding: "38px 46px",
              borderRadius: 30,
              background: "linear-gradient(135deg, rgba(26,25,54,.98), rgba(9,9,23,.99))",
              border: "1px solid rgba(255,255,255,.12)",
              boxShadow: "0 38px 100px rgba(0,0,0,.48)",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", color: "#a7aec9", fontSize: 20, fontWeight: 750, letterSpacing: 1.8, textTransform: "uppercase" }}>
              <span style={{ color: "#9189ff", marginRight: 12 }}>◈</span> LLM Strings <span style={{ marginLeft: "auto", color: "#62e8ce", fontSize: 16 }}>CONFIGURE</span>
            </div>
            <div style={{ marginTop: 28, padding: "22px 26px", borderRadius: 18, background: "#070714", border: "1px solid #ffffff16" }}>
              <SyntaxString host={switched > 0.5 ? "moonshotai" : "openai"} model={switched > 0.5 ? "kimi-k3" : "gpt-5.5"} params={switched > 0.5 ? undefined : "?cache=true"} fontSize={31} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 28 }}>
              <Field
                label="Provider"
                active={providerFocus > 0.35}
                opacity={1 - modelFocus * 0.65}
                content={<div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 29, fontWeight: 760 }}><span style={{ color: switched > 0.5 ? "#f2bd5d" : "#a9a4ff" }}>●</span>{switched > 0.5 ? "Moonshot AI" : "OpenAI"}<span style={{ marginLeft: "auto", color: "#97a0ba" }}>⌄</span></div>}
              />
              <Field
                label="Model"
                active={modelFocus > 0.35}
                opacity={1 - providerFocus * 0.65}
                content={<div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 29, fontWeight: 760 }}><span style={{ color: "#58e8be" }}>✦</span>{switched > 0.5 ? "Kimi K3" : "GPT-5.5"}<span style={{ marginLeft: "auto", color: "#97a0ba" }}>⌄</span></div>}
              />
            </div>
            <div style={{ marginTop: 20, padding: "21px 24px", display: "flex", alignItems: "center", borderRadius: 20, background: "rgba(255,255,255,.025)", border: "1px solid rgba(255,255,255,.08)" }}>
              <div><div style={{ fontWeight: 760, fontSize: 22 }}>Parameters</div><div style={{ color: "#929ab5", fontSize: 17, marginTop: 5 }}>Portable configuration, one compact string.</div></div>
              <div style={{ marginLeft: "auto", color: "#ffc75f", fontFamily: "ui-monospace, monospace", fontSize: 23 }}>{switched > 0.5 ? "—" : "cache=true"}</div>
            </div>
            <div
              style={{
                position: "absolute",
                top: 342,
                right: 46,
                width: 492,
                padding: "15px 18px",
                borderRadius: 16,
                background: "#11112a",
                border: "1px solid #6e67ee88",
                boxShadow: "0 26px 60px rgba(0,0,0,.44)",
                opacity: modelOpen,
                translate: `0 ${value(frame, 122, 138, -14, 0)}px`,
              }}
            >
              {[["GPT-5.5", "openai"], ["Kimi K3", "moonshotai"]].map(([name, host], index) => (
                <div key={name} style={{ display: "flex", alignItems: "center", padding: "13px 12px", borderRadius: 10, background: index === 1 ? "rgba(88,232,190,.13)" : "transparent", color: index === 1 ? "#f8f8ff" : "#8d96b1", fontSize: 23, fontWeight: 700 }}><span style={{ color: index === 1 ? "#58e8be" : "#78809a", marginRight: 13 }}>✦</span>{name}<span style={{ marginLeft: "auto", fontFamily: "ui-monospace, monospace", fontSize: 15 }}>{host}</span></div>
              ))}
            </div>
          </div>
          <Pointer x={cursorX} y={cursorY} opacity={cursorOpacity} />
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: end, background: "rgba(8,8,18,.92)" }}>
        <div style={{ width: 1540, textAlign: "center" }}>
          <div style={{ color: "#62e8ce", fontWeight: 800, fontSize: 23, letterSpacing: 2.7, textTransform: "uppercase", marginBottom: 28 }}>LLM connection string</div>
          <div style={{ display: "inline-block", padding: "35px 46px", borderRadius: 26, background: "#0b0b1c", border: "1px solid #ffffff16" }}>
            <SyntaxString host="moonshotai" model="kimi-k3" fontSize={55} />
          </div>
          <div style={{ height: 130, marginTop: 42, overflow: "hidden", position: "relative", display: "flex", justifyContent: "center" }}>
            <div style={{ translate: `0 ${parameterOffset}px`, display: "flex", flexDirection: "column", gap: 16 }}>
              {["?cache=true", "?temperature=0.7", "?max_tokens=4096", "?thinking=low", "?stream=true"].map((parameter) => <div key={parameter} style={{ minWidth: 420, padding: "13px 22px", borderRadius: 14, background: "rgba(255,199,95,.11)", border: "1px solid rgba(255,199,95,.22)", color: "#ffc75f", fontSize: 28, fontFamily: "ui-monospace, monospace" }}>{parameter}</div>)}
            </div>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#080812, transparent 32%, transparent 68%, #080812)" }} />
          </div>
          <div style={{ opacity: finalLabel, marginTop: 28, color: "#f7f7ff", fontFamily: "ui-monospace, monospace", fontWeight: 700, fontSize: 34, letterSpacing: "-0.04em" }}>[ configure with llm strings ]</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
