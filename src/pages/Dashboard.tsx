import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import AppShell from "@/components/layout/AppShell";

interface Project {
  id: string;
  article_url: string | null;
  created_at: string;
  ai_generations: {
    stitched_video_url: string | null;
    video_url_1: string | null;
    status: string | null;
    description: string | null;
    caption_options: string[] | null;
  } | null;
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status || status === "processing" || status === "captions_ready") {
    return (
      <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 text-[10px] text-amber-400 font-semibold uppercase tracking-wide">
        <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
        Processing
      </span>
    );
  }
  if (status === "complete") {
    return (
      <span className="flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5 text-[10px] text-violet-400 font-semibold uppercase tracking-wide">
        <span className="w-1 h-1 rounded-full bg-violet-400" />
        Ready
      </span>
    );
  }
  if (status.includes("error") || status.includes("failed")) {
    return (
      <span className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5 text-[10px] text-red-400 font-semibold uppercase tracking-wide">
        <span className="w-1 h-1 rounded-full bg-red-400" />
        Failed
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 text-[10px] text-amber-400 font-semibold uppercase tracking-wide">
      <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
      Generating
    </span>
  );
}

function VideoThumbnail({ url }: { url: string | null }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  if (!url) {
    return (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-800">
      <video
        ref={ref}
        src={url}
        className={`w-full h-full object-cover transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={() => {
          if (ref.current) ref.current.currentTime = 0.5;
        }}
        onSeeked={() => setVisible(true)}
        onError={() => setVisible(false)}
      />
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function sourceLabel(url: string | null) {
  if (!url) return "Text input";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.slice(0, 40);
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("projects")
      .select(`
        id, article_url, created_at,
        ai_generations ( stitched_video_url, video_url_1, status, description, caption_options )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setProjects((data as unknown as Project[]) ?? []);
        setLoading(false);
      });
  }, [user?.id]);

  const complete = projects.filter(p => p.ai_generations?.status === "complete");
  const inProgress = projects.filter(p => p.ai_generations?.status !== "complete");

  return (
    <AppShell activePage="Library">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-800 bg-[#0d0d0d] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white">Library</span>
          {!loading && (
            <span className="text-xs text-gray-600">{projects.length} video{projects.length !== 1 ? "s" : ""}</span>
          )}
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-500 hover:bg-violet-600 rounded-lg text-sm font-semibold transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Video
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-600 text-sm">Loading…</div>
        ) : projects.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center py-24">
            <div className="w-14 h-14 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mb-5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">No videos yet</h2>
            <p className="text-sm text-gray-500 max-w-xs mb-6">Paste an article URL and ClipFrom will turn it into a short-form video in minutes.</p>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 rounded-xl text-sm font-semibold transition-colors"
            >
              Create your first video
            </button>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* In-progress */}
            {inProgress.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Generating</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {inProgress.map(p => (
                    <ProjectCard key={p.id} project={p} onClick={() => navigate(`/results/${p.id}`)} />
                  ))}
                </div>
              </section>
            )}

            {/* Completed */}
            {complete.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Ready</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {complete.map(p => (
                    <ProjectCard key={p.id} project={p} onClick={() => navigate(`/results/${p.id}`)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const gen = project.ai_generations;
  const caption = Array.isArray(gen?.caption_options) ? gen.caption_options[0] : null;

  return (
    <button
      onClick={onClick}
      className="group text-left bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl overflow-hidden transition-all duration-150 hover:shadow-lg hover:shadow-black/40"
    >
      {/* Thumbnail — 9:16 aspect */}
      <div className="relative w-full" style={{ paddingBottom: "177.78%" }}>
        <div className="absolute inset-0">
          <VideoThumbnail url={gen?.stitched_video_url ?? gen?.video_url_1 ?? null} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* Play overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
            </div>
          </div>
          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <StatusBadge status={gen?.status ?? null} />
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="p-3 space-y-1.5">
        <p className="text-xs text-gray-300 leading-snug line-clamp-2 min-h-[2.5rem]">
          {caption ?? gen?.description ?? "Processing…"}
        </p>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[10px] text-gray-600 truncate max-w-[80px]">{sourceLabel(project.article_url)}</span>
          <span className="text-[10px] text-gray-600 flex-shrink-0">{timeAgo(project.created_at)}</span>
        </div>
      </div>
    </button>
  );
}
