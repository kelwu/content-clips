// DRAFT — content placeholder, ready for revision
import { useNavigate } from "react-router-dom";

const spotlightFeatures = [
  {
    badge: "Input",
    title: "Any Article, Any Format",
    description:
      "Paste a URL from any website — news, blogs, research, newsletters — or drop in raw text directly. ClipFrom parses the content and pulls out everything it needs.",
    bullets: ["Article URLs", "Paste raw text", "Works with any domain"],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
  },
  {
    badge: "Output",
    title: "9:16 Video Ready for Every Platform",
    description:
      "Every video is rendered in vertical format — the standard for Instagram Reels, TikTok, and YouTube Shorts. Download and post directly, no reformatting needed.",
    bullets: ["Instagram Reels", "TikTok", "YouTube Shorts"],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3.75h3m-3 3.75h3" />
      </svg>
    ),
  },
];

const gridFeatures = [
  {
    title: "AI Caption Generation",
    description:
      "Get five distinct caption options for each clip — different angles, tones, and hooks. Pick the one that fits your voice.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
  {
    title: "AI Voiceover",
    description:
      "A natural-sounding voiceover is automatically generated from your content and synced to the video.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    title: "Auto B-Roll",
    description:
      "AI selects and generates cinematic video footage to pair with each caption — no stock library subscription needed.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125v-5.875A2.25 2.25 0 014.5 10.5h15a2.25 2.25 0 012.25 2.25v5.875M6 18.375V6.75m0 11.625c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125M6 18.375V6.75A2.25 2.25 0 018.25 4.5h7.5A2.25 2.25 0 0118 6.75v11.625" />
      </svg>
    ),
  },
  {
    title: "Automatic Stitching",
    description:
      "All clips are automatically assembled into one polished final video — transitions, audio, and captions all synced.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    title: "Caption Editor",
    description:
      "Choose from AI-generated options or write your own. Fine-tune the message before anything gets rendered.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    title: "Email Delivery",
    description:
      "Drop your email and walk away. We'll notify you the moment your video is ready to download.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    title: "Performance Dashboard",
    description:
      "See how each video performs across platforms — views, downloads, and engagement all in one place.",
    comingSoon: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: "Caption Insights",
    description:
      "Track which caption styles and hooks drive the most engagement, so every video performs better than the last.",
    comingSoon: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
  },
  {
    title: "Content History",
    description:
      "Every video you've ever generated lives in your library. Reuse, remix, or re-download anytime.",
    comingSoon: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function FeaturesSection() {
  const navigate = useNavigate();

  return (
    <section className="relative px-4 py-20">
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            The full picture
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From raw article to finished video — ClipFrom automates every step of the pipeline
          </p>
        </div>

        {/* Spotlight Row — 2 large cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {spotlightFeatures.map((feature) => (
            <div
              key={feature.title}
              className="group bg-gray-900/80 border border-gray-800 rounded-2xl p-8 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
                    {feature.badge}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {feature.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-center gap-1.5 text-xs text-gray-300 bg-gray-800 rounded-full px-3 py-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Grid — 9 cards, 3x3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gridFeatures.map((feature) => (
            <div
              key={feature.title}
              className="group bg-gray-900/80 border border-gray-800 rounded-2xl p-6 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  {feature.icon}
                </div>
                {feature.comingSoon && (
                  <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-2.5 py-1">
                    Coming Soon
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <p className="text-gray-400 text-base mb-6">
            Ready to turn your content into clips?
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/30 hover:scale-[1.02] active:scale-[0.99]"
          >
            Create Your First Clip
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}
