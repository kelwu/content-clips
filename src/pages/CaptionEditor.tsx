import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AppShell from "@/components/layout/AppShell";

interface Caption {
  id: number;
  text: string;
  enabled: boolean;
  wordCount: number;
}

const SAMPLE_TEXT = "AI is changing everything";

const styleOptions = [
  {
    id: "pill" as const,
    label: "Pill",
    preview: (
      <div className="absolute bottom-4 left-0 right-0 flex justify-center px-2">
        <div className="bg-black/60 rounded-full px-2 py-1">
          <span className="text-white text-[7px] font-bold leading-tight text-center block">
            {SAMPLE_TEXT}
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "bold" as const,
    label: "Bold",
    preview: (
      <div className="absolute bottom-4 left-0 right-0 flex justify-center px-3">
        <span
          className="text-white text-[8.5px] font-black leading-tight text-center"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,1), 0 0 20px rgba(0,0,0,0.9)" }}
        >
          {SAMPLE_TEXT}
        </span>
      </div>
    ),
  },
  {
    id: "lower-third" as const,
    label: "Lower Third",
    preview: (
      <div className="absolute bottom-0 left-0 right-0 bg-black/65 px-2 py-1.5">
        <span className="text-white text-[7px] font-semibold leading-tight block">
          {SAMPLE_TEXT}
        </span>
      </div>
    ),
  },
  {
    id: "none" as const,
    label: "Off",
    preview: (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
          <line x1="4" y1="4" x2="20" y2="20"/><path d="M9 5h11v11M5 9v10h10"/>
        </svg>
        <span className="text-gray-600 text-[6px] text-center leading-tight">No captions</span>
      </div>
    ),
  },
] as const;

export default function CaptionEditor() {
  const location = useLocation();
  const navigate = useNavigate();

  const captions_data = location.state?.captions || {};
  const projectId = location.state?.projectId;
  const userEmail = location.state?.userEmail;

  const initialCaptions: Caption[] = [1, 2, 3, 4, 5].map((i) => ({
    id: i,
    text: captions_data[`text${i}`] || `Caption ${i} will appear here after processing.`,
    enabled: true,
    wordCount: (captions_data[`text${i}`] || "").split(" ").filter(Boolean).length,
  }));

  const [captions, setCaptions] = useState<Caption[]>(initialCaptions);
  const [isGenerating, setIsGenerating] = useState(false);
  const [captionStyle, setCaptionStyle] = useState<"pill" | "bold" | "lower-third" | "none">("pill");
  const [transitionStyle, setTransitionStyle] = useState<"cut" | "fade" | "dissolve" | "wipe">("cut");
  const [videoSource, setVideoSource] = useState<"ai" | "stock" | "mix">("ai");

  const enabledCount = captions.filter((c) => c.enabled).length;

  const toggleCaption = (id: number) => {
    setCaptions((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  };

  const updateCaptionText = (id: number, text: string) => {
    setCaptions((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, text, wordCount: text.split(" ").filter(Boolean).length } : c
      )
    );
  };

  const handleGenerate = async () => {
    const enabledCaptions = captions.filter((c) => c.enabled);
    if (enabledCaptions.length === 0) {
      toast.error("Please enable at least one caption to generate videos.");
      return;
    }
    setIsGenerating(true);
    toast.success("Generating your videos...");
    navigate(`/results/${projectId}`, {
      state: { projectId, userEmail, captions: enabledCaptions, captionStyle, transitionStyle, videoSource },
    });
  };

  return (
    <AppShell>
      <div className="flex flex-col h-full bg-[#0a0a0a] text-white">
        {/* Top bar */}
        <div className="border-b border-gray-800 bg-[#0d0d0d] px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Dashboard
          </button>
          <div className="h-4 w-px bg-gray-800" />
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm text-gray-300 font-medium">Caption Review</span>
          </div>
        </div>

        {/* Two-column body */}
        <div className="flex-1 overflow-hidden flex">

          {/* ── Left column: captions ── */}
          <div className="flex-1 min-w-0 overflow-y-auto px-8 py-8">
            <div className="max-w-2xl mx-auto">

              {/* Heading */}
              <div className="mb-7">
                <h1 className="text-2xl font-bold mb-1">Edit Your Captions</h1>
                <p className="text-gray-400 text-sm">
                  Review and customize the AI-generated captions. Toggle off any you don't want included.
                </p>
              </div>

              {/* Progress bar */}
              <div className="mb-6 bg-gray-900 rounded-xl px-5 py-4 border border-gray-800">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm text-gray-400">Selected for generation</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {enabledCount} of {captions.length} captions
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${(enabledCount / captions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Captions list */}
              <div className="space-y-3 mb-8">
                {captions.map((caption) => (
                  <div
                    key={caption.id}
                    className={`rounded-xl border transition-all ${
                      !caption.enabled
                        ? "border-gray-800 bg-gray-900/40 opacity-40"
                        : "border-gray-700 bg-gray-900"
                    }`}
                  >
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">
                          Caption {caption.id}
                        </span>
                        <span className="text-xs text-gray-500">{caption.wordCount} words</span>
                      </div>
                      <div
                        onClick={() => toggleCaption(caption.id)}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                          {caption.enabled ? "Included" : "Excluded"}
                        </span>
                        <div
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            caption.enabled ? "bg-emerald-500" : "bg-gray-700"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                              caption.enabled ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <textarea
                        className={`w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 resize-none focus:outline-none focus:border-emerald-500 focus:bg-gray-800 leading-relaxed transition-colors placeholder-gray-600 ${
                          !caption.enabled ? "pointer-events-none" : ""
                        }`}
                        rows={3}
                        value={caption.text}
                        onChange={(e) => updateCaptionText(caption.id, e.target.value)}
                        disabled={!caption.enabled}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || enabledCount === 0}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-base transition-colors"
              >
                {isGenerating ? "Generating..." : "Generate Video"}
              </button>
              {enabledCount === 0 && (
                <p className="text-center text-xs text-gray-500 mt-3">
                  Enable at least one caption to continue
                </p>
              )}
            </div>
          </div>

          {/* ── Right column: caption style picker ── */}
          <div className="w-72 flex-shrink-0 border-l border-gray-800 overflow-y-auto">
            <div className="sticky top-0 p-5">

              {/* Header */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                    <rect x="2" y="7" width="20" height="14" rx="2"/>
                    <path d="M16 3l-4 4-4-4"/>
                  </svg>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Caption Style</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Choose how captions appear burned into your video. Preview shows your actual style.
                </p>
              </div>

              {/* 2×2 style grid */}
              <div className="grid grid-cols-2 gap-3">
                {styleOptions.map(({ id, label, preview }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCaptionStyle(id)}
                    className="flex flex-col items-center gap-2 group"
                  >
                    {/* 9:16 preview frame */}
                    <div
                      className={`relative w-full aspect-[9/16] rounded-lg overflow-hidden border transition-all duration-150 ${
                        captionStyle === id
                          ? "ring-2 ring-emerald-500 border-emerald-500/30 -translate-y-0.5 shadow-lg shadow-emerald-900/40"
                          : "border-gray-700 hover:border-gray-500 hover:-translate-y-0.5"
                      }`}
                      style={{
                        background: "linear-gradient(175deg, #1a1f2e 0%, #0d1014 60%, #080b0e 100%)",
                      }}
                    >
                      {/* Subtle film grain / texture */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-[0.04]"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)",
                        }}
                      />
                      {/* Vignette */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)",
                        }}
                      />
                      {preview}
                      {/* Selected indicator dot */}
                      {captionStyle === id && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/60" />
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-semibold tracking-wide uppercase transition-colors ${
                        captionStyle === id
                          ? "text-emerald-400"
                          : "text-gray-600 group-hover:text-gray-400"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active style indicator */}
              <div className="mt-5 px-3 py-2.5 rounded-lg bg-gray-900 border border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Active Style</span>
                  <span className="text-[11px] font-semibold text-emerald-400 capitalize">
                    {captionStyle === "lower-third" ? "Lower Third" : captionStyle === "none" ? "Off" : captionStyle.charAt(0).toUpperCase() + captionStyle.slice(1)}
                  </span>
                </div>
              </div>

              {/* Transition picker */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                    <path d="M5 3l14 9-14 9V3z"/>
                  </svg>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Clip Transitions</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed mb-3">How clips cut between each other.</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["cut", "fade", "dissolve", "wipe"] as const).map((t) => {
                    const labels: Record<string, string> = { cut: "Cut", fade: "Fade", dissolve: "Dissolve", wipe: "Wipe" };
                    const descs: Record<string, string> = { cut: "Instant", fade: "To black", dissolve: "Cross-fade", wipe: "Slide" };
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTransitionStyle(t)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all duration-150 ${
                          transitionStyle === t
                            ? "ring-2 ring-emerald-500 border-emerald-500/30 bg-emerald-500/5"
                            : "border-gray-700 hover:border-gray-500 bg-gray-900"
                        }`}
                      >
                        <div className="w-full h-8 rounded relative overflow-hidden bg-gray-800 flex items-center justify-center">
                          {t === "cut" && (
                            <div className="flex w-full h-full">
                              <div className="flex-1 bg-gray-700" />
                              <div className="w-px bg-emerald-400" />
                              <div className="flex-1 bg-gray-600" />
                            </div>
                          )}
                          {t === "fade" && (
                            <div className="w-full h-full" style={{ background: "linear-gradient(to right, #374151, #000, #374151)" }} />
                          )}
                          {t === "dissolve" && (
                            <div className="w-full h-full" style={{ background: "linear-gradient(to right, #374151, #4b5563)" }} />
                          )}
                          {t === "wipe" && (
                            <div className="flex w-full h-full items-center">
                              <div className="flex-1 bg-gray-700" />
                              <div className="w-1.5 h-full bg-emerald-400/60 -skew-x-6" />
                              <div className="flex-1 bg-gray-600" />
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] font-semibold uppercase tracking-wide ${transitionStyle === t ? "text-emerald-400" : "text-gray-600"}`}>
                          {labels[t]}
                        </span>
                        <span className="text-[9px] text-gray-600">{descs[t]}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Active</span>
                  <span className="text-[11px] font-semibold text-emerald-400 capitalize">{transitionStyle}</span>
                </div>
              </div>

              {/* Video Source picker */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 9l5 3-5 3V9z"/>
                  </svg>
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Video Source</span>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed mb-3">Choose where clip visuals come from.</p>
                <div className="flex flex-col gap-2">
                  {([
                    { id: "ai", label: "AI Generated", desc: "Kling AI creates cinematic clips from your captions", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> },
                    { id: "stock", label: "Stock Footage", desc: "Real Pexels clips matched to each caption", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M2 18l6-6 4 4 3-3 5 5"/></svg> },
                    { id: "mix", label: "Mix", desc: "AI clips 1, 3, 5 · Stock clips 2, 4", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg> },
                  ] as const).map(({ id, label, desc, icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setVideoSource(id)}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all duration-150 ${
                        videoSource === id
                          ? "ring-2 ring-emerald-500 border-emerald-500/30 bg-emerald-500/5"
                          : "border-gray-700 hover:border-gray-500 bg-gray-900"
                      }`}
                    >
                      <div className={`mt-0.5 flex-shrink-0 ${videoSource === id ? "text-emerald-400" : "text-gray-500"}`}>{icon}</div>
                      <div>
                        <div className={`text-[11px] font-semibold uppercase tracking-wide ${videoSource === id ? "text-emerald-400" : "text-gray-400"}`}>{label}</div>
                        <div className="text-[10px] text-gray-600 mt-0.5 leading-relaxed">{desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-3 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-between">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">Active</span>
                  <span className="text-[11px] font-semibold text-emerald-400">
                    {videoSource === "ai" ? "AI Generated" : videoSource === "stock" ? "Stock Footage" : "Mix"}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
