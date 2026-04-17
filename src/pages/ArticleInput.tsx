import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const LOG_LINES = [
  { text: "$ Initializing AI pipeline...", color: "text-gray-400" },
  { text: "✓ Article fetched successfully", color: "text-emerald-400" },
  { text: "✓ Narrative structure analyzed", color: "text-emerald-400" },
  { text: "✓ Key moments extracted", color: "text-emerald-400" },
  { text: "› Generating script segments...", color: "text-amber-400" },
  { text: "› Optimizing for short-form...", color: "text-amber-400" },
  { text: "› Writing caption variations...", color: "text-amber-400" },
  { text: "⠦ Finalizing your content...", color: "text-gray-400" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
      </svg>
    ),
    title: "Paste Your Article URL",
    desc: "Drop any article link — blog post, news story, research paper — and our AI does the rest.",
  },
  {
    step: "02",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: "AI Produces Your Video",
    desc: "Our engine writes the script, records the voiceover, sources B-roll, and stitches everything together.",
  },
  {
    step: "03",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    title: "Download & Share",
    desc: "Get a 9:16 cinematic short ready for Instagram Reels, TikTok, or YouTube Shorts — in minutes.",
  },
];

const ArticleInput = () => {
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [articleUrl, setArticleUrl] = useState("");
  const [articleText, setArticleText] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [visibleLines, setVisibleLines] = useState(0);
  const navigate = useNavigate();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stages = [
    "Analyzing your content…",
    "Extracting key insights…",
    "Generating captions…",
    "Polishing results…",
  ];

  useEffect(() => {
    if (!isLoading) return;
    setProgress(0);
    setStage(0);
    setTimeRemaining(180);
    setVisibleLines(0);

    const progressInterval = setInterval(() => setProgress((p) => Math.min(p + 0.6, 95)), 1000);
    const stageInterval = setInterval(() => setStage((s) => (s + 1) % stages.length), 20000);
    const timeInterval = setInterval(() => setTimeRemaining((t) => Math.max(t - 1, 0)), 1000);
    const logInterval = setInterval(() => setVisibleLines((v) => Math.min(v + 1, LOG_LINES.length)), 3000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      clearInterval(timeInterval);
      clearInterval(logInterval);
    };
  }, [isLoading]);

  useEffect(() => {
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    let content: string;
    if (inputMode === "url") {
      content = articleUrl.trim();
      if (!content) { toast.error("Please enter an article URL"); return; }
      try { new URL(content); } catch { toast.error("Please enter a valid URL"); return; }
    } else {
      content = articleText.trim();
      if (!content) { toast.error("Please paste some article text"); return; }
      if (content.length < 50) { toast.error("Please paste more text — at least a paragraph"); return; }
    }

    if (!userEmail.trim()) { toast.error("Please enter your email address"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) { toast.error("Please enter a valid email address"); return; }

    setIsLoading(true);
    try {
      const useAgentPipeline = import.meta.env.VITE_USE_AGENT_PIPELINE === "true";
      const webhookUrl = useAgentPipeline
        ? import.meta.env.VITE_AGENT_CONTENT_FUNCTION_URL
        : import.meta.env.VITE_N8N_CONTENT_WEBHOOK;
      if (!webhookUrl) throw new Error("Webhook URL not configured");

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({ article_url: inputMode === "url" ? content : null, status: "processing" })
        .select("id")
        .single();
      if (projectError) throw new Error("Failed to initialize project. Please try again.");

      const projectId = projectData.id;
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(useAgentPipeline && {
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
          }),
        },
        body: JSON.stringify({ content, type: inputMode, project_id: projectId, user_email: userEmail }),
      });
      if (!response.ok) throw new Error(`Pipeline failed: ${response.statusText}`);

      const pollStart = Date.now();
      const POLL_TIMEOUT_MS = 3 * 60 * 1000;

      pollingRef.current = setInterval(async () => {
        if (Date.now() - pollStart > POLL_TIMEOUT_MS) {
          clearInterval(pollingRef.current!);
          setIsLoading(false);
          toast.error("Caption generation is taking too long. Please try again.");
          return;
        }
        try {
          const { data: aiData } = await supabase
            .from("ai_generations").select("caption_options, text_content, status")
            .eq("project_id", projectId).maybeSingle();
          if (!aiData) return;
          const captions = aiData.caption_options || aiData.text_content;
          if (!captions || (Array.isArray(captions) && captions.length === 0)) return;
          const captionObj = typeof captions === "string" ? JSON.parse(captions) : captions;
          const hasContent = Array.isArray(captionObj) ? captionObj.some((v: unknown) => v) : captionObj?.text1;
          if (hasContent) {
            clearInterval(pollingRef.current!);
            const captionForEditor = Array.isArray(captionObj)
              ? captionObj.reduce((acc: Record<string, string>, text: string, i: number) => ({ ...acc, [`text${i + 1}`]: text }), {})
              : captionObj;
            navigate("/editor", { state: { projectId, userEmail, content, inputMode, captions: captionForEditor } });
          }
        } catch { /* continue polling */ }
      }, 5000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to process your content. Please try again.");
      setIsLoading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  /* ── Loading screen ── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 70%)" }}
        />
        <div className="relative z-10 w-full max-w-lg text-center">
          <div className="text-7xl font-bold tabular-nums mb-2">{Math.round(progress)}%</div>
          <p className="text-gray-400 text-sm mb-1 h-5 transition-all">{stages[stage]}</p>
          <p className="text-gray-600 text-xs mb-8">Estimated {formatTime(timeRemaining)} remaining</p>
          <div className="w-full bg-gray-800 rounded-full h-1.5 mb-10 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%`, boxShadow: "0 0 12px rgba(16,185,129,0.8), 0 0 24px rgba(16,185,129,0.3)" }}
            />
          </div>
          <div className="bg-[#0d0d0d] border border-gray-800 rounded-xl overflow-hidden text-left">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-800 bg-[#111]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 text-xs text-gray-500 font-medium select-none">AI Studio — Processing</span>
            </div>
            <div className="p-4 font-mono text-xs space-y-1.5 min-h-[160px]">
              {LOG_LINES.slice(0, visibleLines).map((line, i) => (
                <div key={i} className={`${line.color} leading-relaxed`}>
                  {line.text}
                  {i === visibleLines - 1 && (
                    <span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-1 animate-pulse align-middle" />
                  )}
                </div>
              ))}
              {visibleLines === 0 && (
                <div className="text-gray-600">
                  &nbsp;<span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-1 animate-pulse align-middle" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Landing page ── */
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "system-ui, sans-serif" }}>

        {/* Subtle noise texture overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* ── Nav ── */}
        <nav className="fixed top-0 inset-x-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-800/60">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21"/></svg>
              </div>
              <span className="font-bold text-[15px] tracking-tight">ClipFrom</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate("/features")}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Features
              </button>
              {["Showcase", "Pricing"].map((link) => (
                <button key={link} className="text-sm text-gray-400 hover:text-white transition-colors cursor-not-allowed opacity-50">{link}</button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button className="text-sm text-gray-400 hover:text-white transition-colors opacity-50 cursor-not-allowed">Login</button>
              <button className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-semibold transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative pt-32 pb-24 px-6 overflow-hidden">
          {/* Background glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
            style={{ background: "radial-gradient(ellipse at top, rgba(16,185,129,0.07) 0%, transparent 65%)" }}
          />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              {/* Left: copy + form */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-medium mb-8 tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AI-Powered Video Creation
                </div>

                <h1
                  className="mb-6 leading-[1.05] tracking-tight"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.8rem, 5vw, 4.2rem)", fontWeight: 700 }}
                >
                  Turn any article into<br />
                  <em style={{ color: "#10b981", fontStyle: "italic" }}>a cinematic story.</em>
                </h1>

                <p className="text-gray-400 text-base leading-relaxed max-w-md mb-10">
                  Paste an article URL and let our AI analyze the narrative, generate voiceovers, curate visuals, and produce your next viral short-form video.
                </p>

                {/* ── Input form ── */}
                <form onSubmit={handleSubmit} className="max-w-lg">

                  {/* Mode tabs */}
                  <div className="flex gap-1.5 mb-4 p-1 bg-gray-900 border border-gray-800 rounded-xl w-fit">
                    <button
                      type="button"
                      onClick={() => setInputMode("url")}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        inputMode === "url"
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                      </svg>
                      URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("text")}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        inputMode === "text"
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
                      </svg>
                      Paste Text
                    </button>
                  </div>

                  {/* Input card */}
                  <div className="bg-gray-900/80 border border-gray-700/80 rounded-2xl overflow-hidden backdrop-blur-sm" style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.03), 0 24px 48px rgba(0,0,0,0.4)" }}>

                    {/* Article input */}
                    <div className="p-4 border-b border-gray-800/60">
                      {inputMode === "url" ? (
                        <div className="flex items-center gap-3">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 flex-shrink-0">
                            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                          </svg>
                          <input
                            type="url"
                            value={articleUrl}
                            onChange={(e) => setArticleUrl(e.target.value)}
                            placeholder="https://your-article.com/story"
                            className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                          />
                        </div>
                      ) : (
                        <textarea
                          value={articleText}
                          onChange={(e) => setArticleText(e.target.value)}
                          placeholder="Paste your article or content here…"
                          rows={4}
                          className="w-full bg-transparent text-sm text-white placeholder-gray-600 outline-none resize-none leading-relaxed"
                        />
                      )}
                    </div>

                    {/* Email input */}
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-800/60">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 flex-shrink-0">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="your@email.com — we'll notify you when it's ready"
                        className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
                      />
                    </div>

                    {/* Submit */}
                    <div className="p-3">
                      <button
                        type="submit"
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        style={{ boxShadow: "0 0 20px rgba(16,185,129,0.25)" }}
                      >
                        Generate Video
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Trust line */}
                  <div className="flex items-center gap-4 mt-4 px-1">
                    {["9:16 vertical format", "AI voiceover", "10–15 min render"].map((item) => (
                      <span key={item} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                        <span className="w-1 h-1 rounded-full bg-emerald-600" />
                        {item}
                      </span>
                    ))}
                  </div>
                </form>
              </div>

              {/* Right: product mockup */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative w-72 h-96">

                  {/* Back card — rotated left */}
                  <div
                    className="absolute top-4 -left-6 w-40 h-72 rounded-2xl border border-gray-800 overflow-hidden"
                    style={{ background: "linear-gradient(170deg, #141a1f 0%, #0d1014 100%)", transform: "rotate(-6deg)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                  >
                    <div className="absolute inset-0 opacity-20" style={{ background: "linear-gradient(to bottom, rgba(16,185,129,0.15), transparent 40%)" }} />
                    <div className="absolute bottom-5 left-0 right-0 px-3">
                      <div className="bg-black/50 rounded-lg px-2 py-1">
                        <p className="text-[7px] text-gray-400 leading-tight">The future of AI is already here and it's reshaping...</p>
                      </div>
                    </div>
                  </div>

                  {/* Back card — rotated right */}
                  <div
                    className="absolute top-4 -right-6 w-40 h-72 rounded-2xl border border-gray-800 overflow-hidden"
                    style={{ background: "linear-gradient(170deg, #1a1a14 0%, #0d0d0a 100%)", transform: "rotate(6deg)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                  >
                    <div className="absolute inset-0 opacity-20" style={{ background: "linear-gradient(to bottom, rgba(16,185,129,0.1), transparent 40%)" }} />
                    <div className="absolute bottom-5 left-0 right-0 px-3">
                      <div className="h-1 bg-gray-700 rounded-full mb-2" />
                      <div className="h-1 bg-gray-800 rounded-full w-3/4" />
                    </div>
                  </div>

                  {/* Front card — active */}
                  <div
                    className="absolute inset-x-8 top-0 bottom-0 rounded-2xl border border-gray-700/80 overflow-hidden z-10"
                    style={{
                      background: "linear-gradient(160deg, #1c2a20 0%, #0d1410 50%, #0a0a0a 100%)",
                      boxShadow: "0 0 0 1px rgba(16,185,129,0.12), 0 32px 64px rgba(0,0,0,0.6), 0 0 40px rgba(16,185,129,0.08)",
                    }}
                  >
                    {/* Scanline texture */}
                    <div
                      className="absolute inset-0 opacity-[0.04] pointer-events-none"
                      style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.4) 3px, rgba(255,255,255,0.4) 4px)" }}
                    />

                    {/* Top status bar */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-3 pb-2">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[8px] text-emerald-400 font-semibold uppercase tracking-widest">Live</span>
                      </div>
                      <span className="text-[8px] text-gray-600">Clip 3 / 5</span>
                    </div>

                    {/* Center play area */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21"/></svg>
                      </div>
                    </div>

                    {/* Caption overlay — pill style */}
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center px-3">
                      <div
                        className="bg-black/60 rounded-full px-3 py-1.5"
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.6)" }}
                      >
                        <p className="text-white text-[9px] font-bold text-center leading-tight">
                          AI is rewriting the future of work
                        </p>
                      </div>
                    </div>

                    {/* Bottom progress bar */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full w-3/5" />
                      </div>
                    </div>

                    {/* AI badge */}
                    <div className="absolute top-10 right-3">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1">
                        <span className="text-[7px] font-semibold text-emerald-400 uppercase tracking-widest">AI</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats below mockup */}
                  <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-6">
                    {[["5", "AI clips"], ["1", "voiceover"], ["9:16", "format"]].map(([val, label]) => (
                      <div key={label} className="text-center">
                        <p className="text-sm font-bold text-white tabular-nums">{val}</p>
                        <p className="text-[9px] text-gray-600 uppercase tracking-wide">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="py-20 px-6 border-t border-gray-800/60">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">From Idea to Premiere</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto">Three steps stand between your article and a viral video.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="bg-gray-900 border border-gray-800 rounded-xl p-6 relative">
                  <div className="absolute top-4 right-4 text-[11px] font-bold text-gray-700 tabular-nums">{item.step}</div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA banner ── */}
        <section className="py-16 px-6 border-t border-gray-800/60">
          <div className="max-w-2xl mx-auto">
            <div
              className="bg-gray-900 border border-emerald-500/20 rounded-2xl p-10 text-center"
              style={{ boxShadow: "0 0 40px rgba(16,185,129,0.06)" }}
            >
              <h2 className="text-3xl font-bold mb-3">Ready to go viral?</h2>
              <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">
                Join creators turning long-form content into short-form gold — every day.
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-sm transition-colors"
              >
                Start for Free
              </button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-gray-800/60 py-10 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="6,3 20,12 6,21"/></svg>
              </div>
              <span className="font-bold text-sm">ClipFrom</span>
              <span className="text-gray-600 text-xs ml-2">AI video from any article</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-600">
              {["Product", "Company", "Privacy", "Terms"].map((link) => (
                <button key={link} className="hover:text-gray-400 transition-colors cursor-not-allowed opacity-60">{link}</button>
              ))}
            </div>
            <p className="text-xs text-gray-700">© 2026 ClipFrom. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </>
  );
};

export default ArticleInput;
