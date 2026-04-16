import { useState } from "react";

interface HeroSectionProps {
  inputMode?: "url" | "text";
  setInputMode?: (mode: "url" | "text") => void;
  articleUrl?: string;
  setArticleUrl?: (url: string) => void;
  articleText?: string;
  setArticleText?: (text: string) => void;
  userEmail?: string;
  setUserEmail?: (email: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export default function HeroSection({
  inputMode: externalInputMode,
  setInputMode: externalSetInputMode,
  articleUrl: externalArticleUrl,
  setArticleUrl: externalSetArticleUrl,
  articleText: externalArticleText,
  setArticleText: externalSetArticleText,
  userEmail: externalUserEmail,
  setUserEmail: externalSetUserEmail,
  onSubmit,
  isLoading = false,
}: HeroSectionProps = {}) {
  const [internalInputMode, setInternalInputMode] = useState<"url" | "text">("url");
  const [internalArticleUrl, setInternalArticleUrl] = useState("");
  const [internalArticleText, setInternalArticleText] = useState("");
  const [internalUserEmail, setInternalUserEmail] = useState("");

  const inputMode = externalInputMode ?? internalInputMode;
  const setInputMode = externalSetInputMode ?? setInternalInputMode;
  const articleUrl = externalArticleUrl ?? internalArticleUrl;
  const setArticleUrl = externalSetArticleUrl ?? setInternalArticleUrl;
  const articleText = externalArticleText ?? internalArticleText;
  const setArticleText = externalSetArticleText ?? setInternalArticleText;
  const userEmail = externalUserEmail ?? internalUserEmail;
  const setUserEmail = externalSetUserEmail ?? setInternalUserEmail;

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            Clip<span className="text-emerald-400">From</span>
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
          Turn your ideas into{" "}
          <span className="text-emerald-400">videos</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-lg mx-auto">
          Transform your content into engaging social media clips
        </p>

        {/* Input Card */}
        <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Input Mode Tabs */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setInputMode("url")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                inputMode === "url"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
              }`}
            >
              🔗 Paste a video URL
            </button>
            <button
              type="button"
              onClick={() => setInputMode("text")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                inputMode === "text"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300"
              }`}
            >
              📝 Paste Text Directly
            </button>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {inputMode === "url" ? (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-left">
                  Article URL
                </label>
                <input
                  type="url"
                  value={articleUrl}
                  onChange={(e) => setArticleUrl(e.target.value)}
                  placeholder="https://example.com/your-article"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-left">
                  Your Text
                </label>
                <textarea
                  value={articleText}
                  onChange={(e) => setArticleText(e.target.value)}
                  placeholder="Paste your article or content text here..."
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 text-left">
                Your Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/30 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  GENERATING...
                </span>
              ) : (
                "GENERATE VIDEOS"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
