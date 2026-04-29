import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const C = {
  bg: "oklch(14% 0.015 250)",
  accent: "oklch(72% 0.17 280)",
  fg: "oklch(96% 0.005 250)",
  fgMuted: "oklch(65% 0.01 250)",
  surface: "oklch(18% 0.015 250)",
  strokeMed: "oklch(100% 0 0 / 0.13)",
} as const;

type Stage = "loading" | "success" | "error";

export default function InstagramCallback() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [stage, setStage] = useState<Stage>("loading");
  const [username, setUsername] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const errorParam = params.get("error");

    if (errorParam) {
      setErrorMsg("Instagram authorization was denied or cancelled.");
      setStage("error");
      return;
    }

    if (!code || !state) {
      setErrorMsg("Missing authorization code. Please try again.");
      setStage("error");
      return;
    }

    if (!session) {
      // Wait for session to hydrate — re-run when session is available
      return;
    }

    const exchange = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-oauth-callback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${session.access_token}`,
              "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ code, state }),
          }
        );
        const data = await res.json();
        if (res.ok && data.ok) {
          setUsername(data.username ?? "");
          setStage("success");
        } else {
          setErrorMsg(data.error ?? "Failed to connect Instagram account.");
          setStage("error");
        }
      } catch {
        setErrorMsg("Network error. Please try again.");
        setStage("error");
      }
    };

    exchange();
  }, [session]);

  const returnTo = sessionStorage.getItem("ig_oauth_return_to") ?? "/";

  const handleContinue = () => {
    sessionStorage.removeItem("ig_oauth_return_to");
    navigate(returnTo);
  };

  return (
    <div style={{
      background: C.bg, color: C.fg, fontFamily: '"Geist", system-ui, sans-serif',
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: C.surface, border: `1px solid ${C.strokeMed}`, borderRadius: 16,
        padding: "40px 48px", maxWidth: 420, width: "100%", textAlign: "center",
      }}>
        {stage === "loading" && (
          <>
            <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
              <svg style={{ animation: "spin 1s linear infinite" }} width="32" height="32" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke={C.accent} strokeWidth="4"/>
                <path style={{ opacity: 0.75 }} fill={C.accent} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Connecting Instagram…</h2>
            <p style={{ color: C.fgMuted, fontSize: 14, lineHeight: 1.6 }}>Exchanging your authorization code and saving your account.</p>
          </>
        )}

        {stage === "success" && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${C.accent}20`, border: `2px solid ${C.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Instagram Connected!</h2>
            {username && (
              <p style={{ color: C.fgMuted, fontSize: 14, marginBottom: 24 }}>
                Connected as <span style={{ color: C.fg, fontWeight: 600 }}>@{username}</span>
              </p>
            )}
            <button
              onClick={handleContinue}
              style={{ width: "100%", padding: "12px 0", background: C.accent, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "oklch(14% 0.015 250)", cursor: "pointer" }}
            >
              Continue
            </button>
          </>
        )}

        {stage === "error" && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "oklch(50% 0.2 20 / 0.15)", border: "2px solid oklch(50% 0.2 20 / 0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="oklch(65% 0.2 20)" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Connection Failed</h2>
            <p style={{ color: C.fgMuted, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{errorMsg}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={handleContinue}
                style={{ flex: 1, padding: "11px 0", background: "none", border: `1px solid ${C.strokeMed}`, borderRadius: 10, fontSize: 14, fontWeight: 600, color: C.fgMuted, cursor: "pointer" }}
              >
                Go Back
              </button>
              <button
                onClick={() => navigate("/")}
                style={{ flex: 1, padding: "11px 0", background: C.accent, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, color: "oklch(14% 0.015 250)", cursor: "pointer" }}
              >
                Home
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
