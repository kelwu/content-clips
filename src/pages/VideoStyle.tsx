import { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";

const CAPTION_STYLES = [
  { value: "pill", label: "Pill", desc: "Active word highlighted in orange" },
  { value: "bold", label: "Bold", desc: "Yellow karaoke word highlight" },
  { value: "lower-third", label: "Lower Third", desc: "Subtitle bar at bottom" },
  { value: "none", label: "Off", desc: "No caption overlay" },
];

const C = {
  bg: "oklch(14% 0.015 250)",
  surface: "oklch(18% 0.015 250)",
  surfaceRaised: "oklch(21% 0.015 250)",
  accent: "oklch(72% 0.17 280)",
  fg: "oklch(96% 0.005 250)",
  fgMuted: "oklch(65% 0.01 250)",
  fgDim: "oklch(45% 0.01 250)",
  strokeSoft: "oklch(100% 0 0 / 0.08)",
  strokeMed: "oklch(100% 0 0 / 0.13)",
} as const;

export default function VideoStyle() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();

  const userEmail: string = location.state?.userEmail ?? "";
  const wordCount: number = location.state?.wordCount ?? 0;

  const [captionStyle, setCaptionStyle] = useState("pill");

  const handleGenerate = () => {
    navigate(`/results/${projectId}`, {
      state: {
        projectId,
        userEmail,
        captionStyle,
        sourceMode: "video",
        captions: [],
        transitionStyle: "cut",
        videoSource: "user",
      },
    });
  };

  return (
    <AppShell>
      <div style={{
        minHeight: "100vh", background: C.bg, color: C.fg,
        fontFamily: '"Geist", system-ui, sans-serif',
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>
        <div style={{ maxWidth: 480, width: "100%" }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, background: "#10b981", borderRadius: "50%", boxShadow: "0 0 8px #10b981" }} />
              <span style={{ color: "#10b981", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Transcript Ready
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>
              Choose your style
            </h1>
            <p style={{ color: C.fgDim, fontSize: 14, margin: 0, lineHeight: 1.5 }}>
              {wordCount > 0 ? `${wordCount} words transcribed · ` : ""}B-roll clips will be added automatically
            </p>
          </div>

          {/* Caption style picker */}
          <div style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: C.fgDim, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              Caption Style
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {CAPTION_STYLES.map(style => {
                const isSelected = captionStyle === style.value;
                return (
                  <button
                    key={style.value}
                    type="button"
                    onClick={() => setCaptionStyle(style.value)}
                    style={{
                      padding: "16px",
                      border: `1.5px solid ${isSelected ? C.accent : C.strokeMed}`,
                      borderRadius: 12,
                      background: isSelected ? `oklch(72% 0.17 280 / 0.1)` : C.surface,
                      color: C.fg,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{style.label}</div>
                    <div style={{ color: C.fgDim, fontSize: 12, lineHeight: 1.4 }}>{style.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* What happens next */}
          <div style={{
            background: C.surface, border: `1px solid ${C.strokeSoft}`,
            borderRadius: 12, padding: "14px 16px", marginBottom: 24,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.fgDim} strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: C.fgMuted, lineHeight: 1.5 }}>
                We'll pull relevant B-roll clips for each segment of your video, add your caption style, and render the final 9:16 cut. Usually takes <strong style={{ color: C.fg }}>3–5 minutes</strong>.
              </p>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            style={{
              width: "100%", padding: "14px",
              background: C.accent, border: "none", borderRadius: 12,
              color: "oklch(14% 0.015 250)", fontSize: 15, fontWeight: 700,
              cursor: "pointer", letterSpacing: "-0.01em",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Generate Video
          </button>
        </div>
      </div>
    </AppShell>
  );
}
