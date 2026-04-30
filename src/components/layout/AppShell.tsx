import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import UpgradeModal from "@/components/UpgradeModal";

interface AppShellProps {
  children: React.ReactNode;
  activePage?: string;
}

const navItems = [
  {
    label: "Library",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: "Assets",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      </svg>
    ),
  },
  {
    label: "Analytics",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
];

export default function AppShell({ children, activePage }: AppShellProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [credits, setCredits] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_profiles")
      .select("credits_remaining, is_admin")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCredits(data.credits_remaining);
          setIsAdmin(data.is_admin ?? false);
        }
      });
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* ── Left Sidebar ── */}
      <aside className="w-56 flex-shrink-0 bg-[#0d0d0d] border-r border-gray-800 flex flex-col">

        {/* Logo + Studio badge */}
        <div className="px-4 pt-5 pb-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <polygon points="6,3 20,12 6,21"/>
              </svg>
            </div>
            <span className="font-bold text-[15px] tracking-tight">ClipFrom</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 font-medium">Studio</span>
            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-emerald-400 font-semibold tracking-widest uppercase">AI ENGINE ACTIVE</span>
            </div>
          </div>
        </div>

        {/* New Video CTA */}
        <div className="px-3 py-3">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm font-semibold transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Video
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isLibrary = item.label === "Library";
            const isActive = activePage === item.label;
            if (isLibrary) {
              return (
                <button
                  key={item.label}
                  onClick={() => navigate("/dashboard")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
                    isActive
                      ? "bg-violet-500/10 border border-violet-500/20"
                      : "hover:bg-gray-800"
                  }`}
                >
                  <span className={isActive ? "text-violet-400" : "text-gray-500"}>{item.icon}</span>
                  <span className={`text-sm ${isActive ? "text-violet-400 font-medium" : "text-gray-400"}`}>{item.label}</span>
                </button>
              );
            }
            return (
              <div
                key={item.label}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg opacity-35 cursor-not-allowed select-none"
              >
                <span className="text-gray-500">{item.icon}</span>
                <span className="text-sm text-gray-400">{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* Bottom links */}
        <div className="px-3 py-3 border-t border-gray-800 space-y-0.5">
          {user && (
            <div className="px-3 py-2 mb-1 space-y-2">
              <div>
                <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wide">Signed in as</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
              </div>
              {!isAdmin && credits !== null && (
                <div className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Credits</span>
                    <span className={`text-xs font-bold ${credits === 0 ? "text-red-400" : credits <= 2 ? "text-amber-400" : "text-violet-400"}`}>
                      {credits} left
                    </span>
                  </div>
                  <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${credits === 0 ? "bg-red-500" : credits <= 2 ? "bg-amber-500" : "bg-violet-500"}`}
                      style={{ width: `${Math.min(100, (credits / 5) * 100)}%` }}
                    />
                  </div>
                  {credits === 0 && (
                    <p className="text-[10px] text-red-400 mt-1.5">Upgrade to generate more videos</p>
                  )}
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className={`w-full mt-2 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                      credits === 0
                        ? "bg-violet-500 hover:bg-violet-600 text-white"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
                    }`}
                  >
                    Upgrade
                  </button>
                </div>
              )}
              {isAdmin && (
                <div className="px-1">
                  <span className="text-[10px] text-violet-500 font-semibold">∞ Admin</span>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => navigate("/settings")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
              activePage === "Settings"
                ? "bg-violet-500/10 border border-violet-500/20"
                : "hover:bg-gray-800"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={activePage === "Settings" ? "text-violet-400" : "text-gray-500"}>
              <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M12 2v2M4.93 4.93l1.41 1.41M2 12h2M4.93 19.07l1.41-1.41M12 20v2M19.07 19.07l-1.41-1.41M20 12h2"/>
            </svg>
            <span className={`text-sm ${activePage === "Settings" ? "text-violet-400 font-medium" : "text-gray-400"}`}>Settings</span>
          </button>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg opacity-40 cursor-not-allowed select-none">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gray-500">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="text-sm text-gray-400">Help</span>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gray-500">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            <span className="text-sm text-gray-400">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
