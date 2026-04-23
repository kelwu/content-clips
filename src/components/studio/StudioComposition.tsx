import React from "react";
import {
  Audio,
  Video,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";

export type CaptionStyle = "pill" | "bold" | "lower-third" | "none";

export interface StudioCompositionProps {
  clips: [string, string, string, string, string];
  audioUrl?: string;
  captions: [string, string, string, string, string];
  captionStyle?: CaptionStyle;
  transitionStyle?: string;
  captionTimings?: number[];
}

const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";
const CLIP_DURATION = 150;

function resolveTransition(style: string = "fade") {
  switch (style) {
    case "slide": return { presentation: slide({ direction: "from-right" as const }), duration: 35 };
    case "wipe":  return { presentation: wipe({ direction: "from-bottom-left" as const }), duration: 35 };
    case "cut":   return { presentation: fade(), duration: 5 };
    default:      return { presentation: fade(), duration: 35 };
  }
}

const KEN_BURNS_CONFIG = [
  { startScale: 1.0,  endScale: 1.12, originX: "50%", originY: "50%" },
  { startScale: 1.12, endScale: 1.0,  originX: "30%", originY: "30%" },
  { startScale: 1.0,  endScale: 1.12, originX: "70%", originY: "65%" },
  { startScale: 1.12, endScale: 1.0,  originX: "50%", originY: "72%" },
  { startScale: 1.0,  endScale: 1.1,  originX: "35%", originY: "38%" },
];

const renderWords = (
  caption: string,
  frame: number,
  startFrame: number,
  endFrame: number,
  windowSize = 3
): React.ReactNode => {
  const words = caption.split(" ").filter(Boolean);
  if (words.length === 0) return null;
  const framesPerWord = Math.max(endFrame - startFrame, 1) / words.length;
  const activeIndex = Math.min(
    Math.floor(Math.max(frame - startFrame, 0) / framesPerWord),
    words.length - 1
  );
  const winStart = Math.max(0, Math.min(activeIndex - 1, words.length - windowSize));
  const winEnd = Math.min(words.length - 1, winStart + windowSize - 1);
  return words.slice(winStart, winEnd + 1).map((word, i) => {
    const idx = winStart + i;
    const isActive = idx === activeIndex;
    return (
      <span
        key={idx}
        style={{
          display: "inline-block",
          background: isActive ? "#E89054" : "rgba(0,0,0,0.75)",
          color: isActive ? "#1a0a00" : "#ffffff",
          borderRadius: 8,
          padding: "6px 16px",
          margin: "4px",
          fontWeight: isActive ? 800 : 700,
          fontFamily: FONT,
        }}
      >
        {word}
      </span>
    );
  });
};

const ClipSegment: React.FC<{ videoUrl: string; clipIndex: number }> = ({ videoUrl, clipIndex }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { startScale, endScale, originX, originY } = KEN_BURNS_CONFIG[clipIndex];
  const scale = interpolate(frame, [0, durationInFrames], [startScale, endScale], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "#000" }}>
      {videoUrl ? (
        <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
          <Video
            src={videoUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${scale})`,
              transformOrigin: `${originX} ${originY}`,
            }}
          />
        </div>
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#555", fontSize: 32, fontFamily: "system-ui" }}>
          No video
        </div>
      )}
    </div>
  );
};

const CaptionOverlay: React.FC<{
  caption: string;
  captionStyle: CaptionStyle;
  opacity: number;
  translateY: number;
  frame: number;
  startFrame: number;
  endFrame: number;
}> = ({ caption, captionStyle, opacity, translateY, frame, startFrame, endFrame }) => {
  if (!caption || captionStyle === "none") return null;

  if (captionStyle === "bold") {
    return (
      <div style={{ position: "absolute", bottom: "12%", left: "50%", transform: `translateX(-50%) translateY(${translateY}px)`, width: "88%", display: "flex", flexWrap: "wrap", justifyContent: "center", opacity, pointerEvents: "none" }}>
        <p style={{ margin: 0, fontSize: 52, fontFamily: FONT, lineHeight: 1.3, textAlign: "center", display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
          {renderWords(caption, frame, startFrame, endFrame)}
        </p>
      </div>
    );
  }

  if (captionStyle === "lower-third") {
    const words = caption.split(" ").filter(Boolean);
    const framesPerWord = Math.max(endFrame - startFrame, 1) / words.length;
    const activeIdx = Math.min(Math.floor(Math.max(frame - startFrame, 0) / framesPerWord), words.length - 1);
    return (
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.65)", padding: "28px 48px", opacity, transform: `translateY(${translateY}px)`, pointerEvents: "none" }}>
        <div style={{ fontSize: 36, fontFamily: FONT, lineHeight: 1.5, textAlign: "left", display: "flex", flexWrap: "wrap" }}>
          {words.map((word, i) => (
            <span key={i} style={{ marginRight: 8, color: i === activeIdx ? "#E89054" : "#ffffff", fontWeight: i === activeIdx ? 800 : 600 }}>
              {word}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "absolute", bottom: "12%", left: "50%", transform: `translateX(-50%) translateY(${translateY}px)`, width: "88%", display: "flex", flexWrap: "wrap", justifyContent: "center", opacity, pointerEvents: "none" }}>
      <div style={{ fontSize: 52, fontFamily: FONT, lineHeight: 1.3, display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {renderWords(caption, frame, startFrame, endFrame)}
      </div>
    </div>
  );
};

export const StudioComposition: React.FC<StudioCompositionProps> = ({
  clips,
  audioUrl,
  captions,
  captionStyle = "pill",
  captionTimings,
  transitionStyle = "fade",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const transition = resolveTransition(transitionStyle);

  const startFrames: number[] = (() => {
    if (captionTimings && captionTimings.length === captions.length) return captionTimings;
    const wordCounts = captions.map(c => c.split(" ").filter(Boolean).length);
    const totalWords = wordCounts.reduce((a, b) => a + b, 0) || 1;
    let cumulative = 0;
    return wordCounts.map(w => {
      const f = Math.round((cumulative / totalWords) * durationInFrames);
      cumulative += w;
      return f;
    });
  })();

  const endFrames = [...startFrames.slice(1), durationInFrames];

  return (
    <div style={{ width: "100%", height: "100%", background: "#000", position: "relative" }}>
      {audioUrl && <Audio src={audioUrl} />}

      <TransitionSeries>
        {clips.map((videoUrl, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={CLIP_DURATION}>
              <ClipSegment videoUrl={videoUrl} clipIndex={i} />
            </TransitionSeries.Sequence>
            {i < clips.length - 1 && (
              <TransitionSeries.Transition
                timing={springTiming({ durationInFrames: transition.duration })}
                presentation={transition.presentation}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>

      {captionStyle !== "none" && captions.map((caption, i) => {
        const start = startFrames[i];
        const end = endFrames[i];
        const opacity = interpolate(frame, [start, start + 10, end - 10, end], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const translateY = interpolate(frame, [start, start + 10], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <CaptionOverlay key={i} caption={caption} captionStyle={captionStyle} opacity={opacity} translateY={translateY} frame={frame} startFrame={start} endFrame={end} />
        );
      })}
    </div>
  );
};
