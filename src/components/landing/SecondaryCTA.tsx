interface SecondaryCTAProps {
  onCtaClick?: (e: React.FormEvent) => void;
}

export default function SecondaryCTA({ onCtaClick }: SecondaryCTAProps) {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    onCtaClick?.(new Event("submit") as unknown as React.FormEvent);
  };

  return (
    <section className="relative px-4 py-24">
      <div className="max-w-3xl mx-auto text-center">
        {/* Glow background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
          <div className="w-96 h-96 rounded-full bg-emerald-500/[0.04] blur-3xl" />
        </div>

        <div className="relative">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to turn your content into{" "}
            <span className="text-emerald-400">videos</span>?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of creators who use ClipFrom to grow their audience.
            Start creating in seconds — no credit card required.
          </p>
          <button
            onClick={handleClick}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg px-10 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started Free
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
