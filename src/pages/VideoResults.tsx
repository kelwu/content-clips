import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface ResultData {
  stitched_video_url?: string | null;
  caption_options?: string[] | null;
  final_caption?: string | null;
  description?: string | null;
  video_url_1?: string | null;
  video_url_2?: string | null;
  video_url_3?: string | null;
  video_url_4?: string | null;
  video_url_5?: string | null;
  status?: string | null;
}

export default function VideoResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId: projectIdParam } = useParams();

  const [result, setResult] = useState<ResultData>({});
  const [editingCaption, setEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  const [copied, setCopied] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const triggeredRef = useRef(false);

  const projectId = location.state?.projectId || projectIdParam;
  const userEmail = location.state?.userEmail;
  const approvedCaptions: { text: string }[] = location.state?.captions || [];

  // Derived state
  const videoUrlsFilled = [
    result.video_url_1, result.video_url_2, result.video_url_3,
    result.video_url_4, result.video_url_5,
  ].filter(Boolean).length;

  const stitchedReady = !!result.stitched_video_url;
  const instagramCaption = editedCaption || result.description || result.final_caption || "";
  const charCount = instagramCaption.length;

  useEffect(() => {
    if (!projectId) { navigate("/"); return; }

    // Trigger N8N once
    const triggerVideoGeneration = async () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      const webhook = import.meta.env.VITE_N8N_POLLING_WEBHOOK;
      if (!webhook) return;
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ project_id: projectId, user_email: userEmail }),
        });
      } catch (err) {
        console.warn("Could not trigger video generation:", err);
      }
    };

    const poll = async () => {
      try {
        const { data } = await supabase
          .from("ai_generations")
          .select("stitched_video_url, caption_options, final_caption, description, video_url_1, video_url_2, video_url_3, video_url_4, video_url_5, status")
          .eq("project_id", projectId)
          .maybeSingle();

        if (!data) return;
        setResult(data);

        if (data.stitched_video_url) {
          clearInterval(pollingRef.current!);
          toast.success("Your video is ready!");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    triggerVideoGeneration();
    poll();
    pollingRef.current = setInterval(poll, 10000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [projectId, userEmail, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(instagramCaption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayCaptions = approvedCaptions.length > 0
    ? approvedCaptions.map(c => c.text)
    : (Array.isArray(result.caption_options) ? result.caption_options : []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Nav */}
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/")} className="text-gray-400 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
          <span>←</span><span>Back</span>
        </button>
        <div className="h-4 w-px bg-gray-700" />
        <span className="text-sm text-gray-300 font-medium">Your Video</span>
      </div>

      <div className="flex-1 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-2xl space-y-5">

          {/* Title */}
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-1">Your Video Is Ready!</h1>
            <p className="text-gray-400 text-sm">Review your video and copy the caption for posting.</p>
          </div>

          {/* ── VIDEO SECTION ── */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {stitchedReady ? (
              <>
                <div className="aspect-video bg-black">
                  <video src={result.stitched_video_url!} controls className="w-full h-full" />
                </div>
                <div className="px-5 py-4 flex items-center justify-between border-t border-gray-800">
                  <span className="text-sm text-gray-400">Final stitched video</span>
                  <a href={result.stitched_video_url!} download
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-semibold transition-colors">
                    Download
                  </a>
                </div>
              </>
            ) : (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 text-base">✨</div>
                  <h2 className="font-semibold text-base">
                    {videoUrlsFilled === 5 ? "Stitching your video with fal.ai…" : "Generating your clips with Kling AI…"}
                  </h2>
                </div>

                {/* Progress steps */}
                <div className="space-y-3 pl-11">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${videoUrlsFilled === 5 ? "bg-emerald-500 text-white" : "bg-gray-800 border border-gray-700"}`}>
                      {videoUrlsFilled === 5 ? "✓" : (
                        <svg className="animate-spin w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`text-sm ${videoUrlsFilled === 5 ? "text-emerald-400" : "text-white"}`}>
                        Step 1 — Generate clips with Kling AI
                        {videoUrlsFilled > 0 && videoUrlsFilled < 5 && (
                          <span className="text-gray-500 ml-2">({videoUrlsFilled}/5 done)</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">One clip per approved caption · takes 5–10 min</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${videoUrlsFilled < 5 ? "bg-gray-800 border border-gray-700" : "bg-gray-800 border border-emerald-500/40"}`}>
                      {videoUrlsFilled === 5 && (
                        <svg className="animate-spin w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`text-sm ${videoUrlsFilled < 5 ? "text-gray-500" : "text-white"}`}>
                        Step 2 — Stitch into one video with fal.ai
                      </p>
                      <p className="text-xs text-gray-500">Combines all clips seamlessly · takes 3–5 min</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── INSTAGRAM CAPTION SECTION ── */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-800">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-pink-400">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
              </svg>
              <h2 className="font-semibold text-base">Share on Instagram & TikTok</h2>
            </div>

            <div className="p-5">
              {instagramCaption ? (
                <>
                  {editingCaption ? (
                    <textarea
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 resize-none focus:outline-none focus:border-emerald-500 leading-relaxed"
                      rows={10}
                      value={editedCaption || instagramCaption}
                      onChange={e => setEditedCaption(e.target.value)}
                    />
                  ) : (
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{instagramCaption}</p>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
                    <span className={`text-xs ${charCount > 2200 ? "text-red-400" : "text-gray-500"}`}>
                      {charCount.toLocaleString()} / 2,200 (Instagram limit)
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingCaption(!editingCaption); if (editingCaption && !editedCaption) setEditedCaption(""); }}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        {editingCaption ? "Done" : "Edit"}
                      </button>
                      <button
                        onClick={handleCopy}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5"
                      >
                        {copied ? "✓ Copied!" : (
                          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>Copy Caption</>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 text-gray-500 py-2">
                  <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span className="text-sm">Generating your Instagram caption…</span>
                </div>
              )}
            </div>
          </div>

          {/* ── VIDEO CAPTIONS USED ── */}
          {displayCaptions.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h2 className="font-semibold text-base">Video Captions</h2>
                <p className="text-xs text-gray-500 mt-0.5">The approved captions used in your video</p>
              </div>
              <div className="divide-y divide-gray-800">
                {displayCaptions.map((text, i) => (
                  <div key={i} className="flex items-start gap-3 px-5 py-4">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l2.5 2.5 5.5-5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="text-center pb-4">
            <button onClick={() => navigate("/")} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-sm transition-colors inline-flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              Generate Another Video
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
