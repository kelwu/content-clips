interface LoadingScreenProps {
  stage?: string;
  progress?: number;
  timeRemaining?: number;
}

export default function LoadingScreen({
  stage = "Processing...",
  progress = 0,
  timeRemaining = 0,
}: LoadingScreenProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-md mx-auto px-6 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
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

        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <svg className="w-20 h-20 animate-spin" viewBox="0 0 80 80">
            <circle
              className="text-gray-800"
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
            <circle
              className="text-emerald-500"
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="160"
              strokeDashoffset="120"
            />
          </svg>
        </div>

        {/* Stage Text */}
        <p className="text-white text-lg font-semibold mb-6">{stage}</p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2.5 mb-3 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Progress Info */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{Math.round(progress)}% complete</span>
          <span>~{formatTime(timeRemaining)} remaining</span>
        </div>

        <p className="text-xs text-gray-500 mt-8">
          This may take a few minutes. We'll email you when it's ready.
        </p>
      </div>
    </div>
  );
}
