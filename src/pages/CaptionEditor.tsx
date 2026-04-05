import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Caption {
  id: number;
  text: string;
  enabled: boolean;
  wordCount: number;
}

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

  const enabledCount = captions.filter((c) => c.enabled).length;

  const toggleCaption = (id: number) => {
    setCaptions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const updateCaptionText = (id: number, text: string) => {
    setCaptions((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, text, wordCount: text.split(" ").filter(Boolean).length }
          : c
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
      state: {
        projectId,
        userEmail,
        captions: enabledCaptions,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top nav bar */}
      <div className="border-b border-gray-800 bg-gray-950 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/")}
          className="text-gray-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <div className="h-4 w-px bg-gray-700" />
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm text-gray-300 font-medium">Caption Review</span>
        </div>
      </div>

      {/* Main content — centered with max width */}
      <div className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-2xl">

          {/* Page heading */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Edit Your Video Captions</h1>
            <p className="text-gray-400 text-sm">
              Review and customize the AI-generated captions. Toggle off any you don't want.
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
                {/* Caption header row */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-emerald-500 uppercase tracking-widest">
                      Caption {caption.id}
                    </span>
                    <span className="text-xs text-gray-500">
                      {caption.wordCount} words
                    </span>
                  </div>

                  {/* Toggle switch */}
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

                {/* Always-visible editable textarea */}
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
            {isGenerating
              ? "Generating..."
              : `Generate ${enabledCount} Video${enabledCount !== 1 ? "s" : ""}`}
          </button>

          {enabledCount === 0 && (
            <p className="text-center text-xs text-gray-500 mt-3">
              Enable at least one caption to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
