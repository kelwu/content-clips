export default function BackgroundIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-[10%] w-64 h-64 rounded-full bg-emerald-500/[0.03] blur-3xl animate-pulse" />
      <div className="absolute top-[40%] right-[5%] w-80 h-80 rounded-full bg-emerald-400/[0.02] blur-3xl animate-pulse [animation-delay:2s]" />
      <div className="absolute bottom-32 left-[20%] w-72 h-72 rounded-full bg-teal-500/[0.03] blur-3xl animate-pulse [animation-delay:4s]" />

      {/* Subtle dots */}
      <svg className="absolute top-32 right-[15%] text-emerald-500/10 w-6 h-6" fill="currentColor" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
      <svg className="absolute top-[55%] left-[8%] text-emerald-500/10 w-4 h-4" fill="currentColor" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>
      <svg className="absolute bottom-[25%] right-[12%] text-emerald-500/10 w-5 h-5" fill="currentColor" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" />
      </svg>

      {/* Thin lines */}
      <div className="absolute top-[30%] left-0 w-48 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
      <div className="absolute top-[60%] right-0 w-64 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />
      <div className="absolute bottom-[15%] left-[30%] w-40 h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent" />

      {/* Small diamond shapes */}
      <div className="absolute top-[45%] right-[25%] w-3 h-3 rotate-45 border border-emerald-500/10" />
      <div className="absolute top-[70%] left-[15%] w-2 h-2 rotate-45 border border-emerald-500/10" />
      <div className="absolute top-[20%] left-[40%] w-2.5 h-2.5 rotate-45 border border-emerald-500/10" />
    </div>
  );
}
