import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        setSignedUp(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        navigate(returnTo, { replace: true });
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">ClipFrom</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {signedUp ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                We sent a confirmation link to <span className="text-gray-200">{email}</span>. Click it to activate your account, then come back to sign in.
              </p>
              <button
                onClick={() => { setMode("signin"); setSignedUp(false); }}
                className="mt-6 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white mb-1">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                {mode === "signin" ? "Sign in to access your videos." : "Start turning articles into short-form videos."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
                >
                  {loading && (
                    <svg className="animate-spin" width={14} height={14} fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                  )}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-5">
                {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  {mode === "signin" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-700 mt-6">
          <Link to="/" className="hover:text-gray-500 transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
