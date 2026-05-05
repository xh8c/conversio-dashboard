"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const LOGO_URL = "https://i.ibb.co/QvQZsP9y/Untitled-1.png";
const RAILWAY_URL = "https://web-production-f2d291.up.railway.app";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (typeof value !== "number") return;
    let start = 0;
    const steps = 30;
    const increment = value / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("dash-theme") || "dark";
    setTheme(saved);
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
      else setUser(data.user);
    });
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("dash-theme", next);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const d = theme === "dark";

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: d ? "#000" : "#f8f8f8" }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", borderTopColor: d ? "white" : "black" }}></div>
    </div>
  );

  const navItems = [
    { id: "overview", label: "Overview", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg> },
    { id: "leads", label: "Leads", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
    { id: "chatbot", label: "Chatbot", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: "customize", label: "Customize", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.5"/></svg> },
  ];

  const sidebarBg = d ? "#000" : "#ffffff";
  const mainBg = d ? "#060608" : "#f4f4f6";
  const borderColor = d ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const textPrimary = d ? "#ffffff" : "#0a0a0a";
  const textMuted = d ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)";

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Syne', sans-serif", background: mainBg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        * { scrollbar-width: thin; scrollbar-color: #333 transparent; box-sizing: border-box; }
        *::-webkit-scrollbar { width: 3px; }
        *::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        @keyframes slideIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(300%)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .sidebar-item { animation: slideIn 0.4s forwards; opacity:0; }
        .tab-content { animation: fadeUp 0.3s forwards; }
        .stat-card { animation: fadeUp 0.5s forwards; opacity:0; }
        .shimmer-line { position:relative; overflow:hidden; }
        .shimmer-line::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent); animation:shimmer 2.5s infinite; }
      `}</style>

      {/* Sidebar */}
      <div className="w-56 flex flex-col fixed h-full z-20" style={{ background: sidebarBg, borderRight: `1px solid ${borderColor}` }}>
        <div className="px-5 py-5" style={{ borderBottom: `1px solid ${borderColor}` }}>
          {LOGO_URL ? <img src={LOGO_URL} alt="Logo" className="h-7 object-contain" /> : <span style={{ color: textPrimary, fontWeight: 700, fontSize: 18 }}>Conversio</span>}
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {navItems.map((item, i) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all"
                style={{
                  animationDelay: `${i * 70}ms`,
                  background: active ? (d ? "white" : "#0a0a0a") : "transparent",
                  color: active ? (d ? "black" : "white") : textMuted,
                  boxShadow: active ? (d ? "0 0 20px rgba(255,255,255,0.12)" : "0 4px 12px rgba(0,0,0,0.15)") : "none",
                }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-5 pt-4" style={{ borderTop: `1px solid ${borderColor}` }}>
          <div className="px-3 mb-2">
            <p className="text-xs font-mono truncate" style={{ color: textMuted }}>{user.email}</p>
          </div>
          <button onClick={toggleTheme} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full transition-all mb-1" style={{ color: textMuted }} onMouseEnter={e => e.currentTarget.style.background = d ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            {d ? "☀️" : "🌙"} {d ? "Light mode" : "Dark mode"}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium w-full transition-all" style={{ color: "#ef4444" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 flex-1 min-h-screen">
        {/* Topbar */}
        <div className="px-8 py-4 flex items-center justify-between sticky top-0 z-10" style={{ background: d ? "rgba(6,6,8,0.85)" : "rgba(244,244,246,0.85)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${borderColor}` }}>
          <div>
            <h1 className="font-bold text-lg tracking-tight capitalize" style={{ color: textPrimary }}>{activeTab}</h1>
            <p className="text-xs font-mono mt-0.5" style={{ color: textMuted }}>conversio.app/dashboard</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ border: `1px solid ${borderColor}` }}>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #4ade80" }}></div>
            <span className="text-xs font-mono" style={{ color: textMuted }}>live</span>
          </div>
        </div>

        <div className="p-8 tab-content" key={activeTab}>
          {activeTab === "overview" && <Overview userId={user.id} theme={theme} />}
          {activeTab === "leads" && <Leads userId={user.id} theme={theme} />}
          {activeTab === "chatbot" && <Chatbot userId={user.id} theme={theme} />}
          {activeTab === "customize" && <Customize userId={user.id} theme={theme} />}
        </div>
      </div>
    </div>
  );
}

function useThemeVars(theme) {
  const d = theme === "dark";
  return {
    d,
    card: d ? "#0c0c0f" : "#ffffff",
    cardBorder: d ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
    textPrimary: d ? "#ffffff" : "#0a0a0a",
    textMuted: d ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)",
    textSub: d ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)",
    inputBg: d ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    inputBorder: d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)",
    codeBg: d ? "#050505" : "#f0f0f2",
  };
}

function Card({ children, style = {}, className = "" }) {
  return (
    <div className={`rounded-2xl transition-all ${className}`} style={style}>
      {children}
    </div>
  );
}

function Overview({ userId, theme }) {
  const { d, card, cardBorder, textPrimary, textMuted, textSub } = useThemeVars(theme);
  const [leads, setLeads] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("leads").select("id", { count: "exact" }).eq("user_id", userId)
      .then(({ count }) => setLeads(count || 0));
  }, [userId]);

  const stats = [
    { label: "Total Leads", value: leads, isNum: true, accent: "#6366f1", icon: "👥" },
    { label: "Chatbot Status", value: "Active", isNum: false, accent: "#10b981", icon: "🟢" },
    { label: "This Month", value: leads, isNum: true, accent: "#f59e0b", icon: "📈" },
  ];

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {stats.map((stat, i) => (
          <div key={stat.label} className="stat-card rounded-2xl p-6 relative overflow-hidden" style={{ animationDelay: `${i * 100}ms`, background: card, border: `1px solid ${cardBorder}` }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10" style={{ background: stat.accent, filter: "blur(30px)", transform: "translate(30%, -30%)" }}></div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-mono uppercase tracking-widest" style={{ color: textMuted }}>{stat.label}</p>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <p className="font-bold text-4xl tracking-tight" style={{ color: textPrimary, fontFamily: "'Syne', sans-serif" }}>
              {stat.isNum ? <AnimatedNumber value={stat.value} /> : stat.value}
            </p>
            <div className="mt-4 h-0.5 w-full rounded-full overflow-hidden shimmer-line" style={{ background: d ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)" }}></div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6" style={{ background: card, border: `1px solid ${cardBorder}` }}>
        <div className="flex items-center justify-between mb-6">
          <p className="font-semibold" style={{ color: textPrimary }}>Getting started</p>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg" style={{ color: "#6366f1", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>3 steps</span>
        </div>
        {[
          { num: "01", title: "Train your chatbot", desc: "Paste your website URL in the Chatbot tab", color: "#6366f1" },
          { num: "02", title: "Customize the widget", desc: "Set colors, bot name, and lead capture settings", color: "#f59e0b" },
          { num: "03", title: "Install on your website", desc: "Copy the script tag into your site's HTML", color: "#10b981" },
        ].map((s) => (
          <div key={s.num} className="flex items-start gap-4 mb-5 last:mb-0 group cursor-default">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all" style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
              <span className="text-xs font-mono font-bold" style={{ color: s.color }}>{s.num}</span>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm font-medium" style={{ color: textPrimary }}>{s.title}</p>
              <p className="text-xs mt-0.5" style={{ color: textMuted }}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Leads({ userId, theme }) {
  const { d, card, cardBorder, textPrimary, textMuted, textSub } = useThemeVars(theme);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("leads").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (data) setLeads(data);
      setLoading(false);
    }
    load();
  }, [userId]);

  function urgencyStyle(u) {
    if (u === "high") return { color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" };
    if (u === "medium") return { color: "#f59e0b", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" };
    return { color: textMuted, background: d ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${cardBorder}` };
  }

  function avatarColor(name) {
    const colors = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];
    const idx = (name || "?").charCodeAt(0) % colors.length;
    return colors[idx];
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: textMuted }}>Total leads</p>
          <p className="font-bold text-4xl" style={{ color: textPrimary }}>{leads.length}</p>
        </div>
        {leads.length > 0 && (
          <button
            onClick={() => {
              const csv = ["Name,Email,Intent,Budget,Timeline,Urgency,Date", ...leads.map(l => `${l.name||""},${l.email||""},${l.intent||""},${l.budget||""},${l.timeline||""},${l.urgency||""},${new Date(l.created_at).toLocaleDateString()}`)].join("\n");
              const a = document.createElement("a");
              a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
              a.download = "leads.csv"; a.click();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: d ? "white" : "#0a0a0a", color: d ? "black" : "white", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Export CSV
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", borderTopColor: d ? "white" : "black" }}></div>
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-2xl py-16 text-center" style={{ background: card, border: `1px solid ${cardBorder}` }}>
            <p className="text-sm font-mono" style={{ color: textSub }}>No leads yet — install your chatbot to start capturing</p>
          </div>
        ) : leads.map((lead) => (
          <div key={lead.id} className="rounded-2xl overflow-hidden transition-all" style={{ background: card, border: `1px solid ${cardBorder}` }}>
            <div className="px-5 py-4 flex items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white" style={{ background: avatarColor(lead.name) }}>
                  {(lead.name || "?")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: textPrimary }}>{lead.name || "—"}</p>
                  <p className="text-xs font-mono" style={{ color: textMuted }}>{lead.email || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lead.urgency && lead.urgency !== "low" && (
                  <span className="text-xs font-mono px-2.5 py-1 rounded-lg" style={urgencyStyle(lead.urgency)}>{lead.urgency}</span>
                )}
                {lead.intent && (
                  <span className="text-xs px-2.5 py-1 rounded-lg font-mono" style={{ color: "#6366f1", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>{lead.intent}</span>
                )}
                <span className="text-xs font-mono" style={{ color: textSub }}>{new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: textMuted, transform: expanded === lead.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {expanded === lead.id && (
              <div className="px-5 pb-5" style={{ borderTop: `1px solid ${cardBorder}` }}>
                <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
                  {[
                    { label: "Intent", value: lead.intent, color: "#6366f1" },
                    { label: "Budget", value: lead.budget, color: "#10b981" },
                    { label: "Timeline", value: lead.timeline, color: "#f59e0b" },
                  ].map(f => (
                    <div key={f.label} className="rounded-xl p-3" style={{ background: d ? "#050507" : "#f8f8fa", border: `1px solid ${cardBorder}` }}>
                      <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: f.color }}>{f.label}</p>
                      <p className="text-sm" style={{ color: textPrimary }}>{f.value || "—"}</p>
                    </div>
                  ))}
                </div>
                {lead.conversation && (() => {
                  try {
                    const msgs = JSON.parse(lead.conversation);
                    return (
                      <div>
                        <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: textMuted }}>Conversation</p>
                        <div className="rounded-xl p-3 max-h-48 overflow-y-auto flex flex-col gap-2" style={{ background: d ? "#050507" : "#f8f8fa", border: `1px solid ${cardBorder}` }}>
                          {msgs.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                              <div className="px-3 py-2 rounded-xl text-xs max-w-xs" style={{ background: msg.role === "user" ? "rgba(99,102,241,0.15)" : (d ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"), color: msg.role === "user" ? "#818cf8" : textMuted }}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  } catch { return null; }
                })()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Chatbot({ userId, theme }) {
  const { d, card, cardBorder, textPrimary, textMuted, inputBg, inputBorder, codeBg } = useThemeVars(theme);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleTrain() {
    if (!url) return;
    setLoading(true); setStatus(null);
    try {
      const res = await fetch(`${RAILWAY_URL}/train`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, url }),
      });
      const data = await res.json();
      setStatus({ success: true, msg: data.pages_scraped ? `Scraped ${data.pages_scraped} pages — ${data.chunks_stored} chunks stored` : "Training complete!" });
    } catch {
      setStatus({ success: false, msg: "Backend unreachable." });
    }
    setLoading(false);
  }

  const scriptTag = `<script>
window.chatbotConfig = {
  userId: "${userId}",
  apiUrl: "${RAILWAY_URL}",
};
</script>
<script src="https://conversio-dashboard.vercel.app/widget.js"></script>`;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl p-6" style={{ background: card, border: `1px solid ${cardBorder}` }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <p className="font-semibold" style={{ color: textPrimary }}>Train on website</p>
        </div>
        <p className="text-xs font-mono mb-5" style={{ color: textMuted }}>Paste your URL — we scrape every page automatically</p>
        <div className="flex gap-3">
          <input
            type="url" value={url} onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTrain()}
            placeholder="https://yourwebsite.com"
            className="flex-1 rounded-xl px-4 py-3 text-sm font-mono"
            style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, outline: "none" }}
          />
          <button onClick={handleTrain} disabled={loading}
            className="px-6 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: "#6366f1", color: "white", boxShadow: "0 4px 16px rgba(99,102,241,0.35)" }}>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 rounded-full animate-spin border-t-white"></div>
                Training
              </div>
            ) : "Train"}
          </button>
        </div>
        {status && (
          <div className="mt-4 px-4 py-3 rounded-xl text-xs font-mono" style={status.success ? { color: "#10b981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" } : { color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {status.success ? "✓ " : "✗ "}{status.msg}
          </div>
        )}
      </div>

      <div className="rounded-2xl p-6" style={{ background: card, border: `1px solid ${cardBorder}` }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><polyline points="16 18 22 12 16 6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="8 6 2 12 8 18" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <p className="font-semibold" style={{ color: textPrimary }}>Install script</p>
        </div>
        <p className="text-xs font-mono mb-5" style={{ color: textMuted }}>Paste before the closing &lt;/body&gt; tag</p>
        <div className="rounded-xl p-4 font-mono text-xs leading-relaxed" style={{ background: codeBg, border: `1px solid ${cardBorder}`, color: textMuted }}>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{scriptTag}</pre>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(scriptTag); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="mt-4 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
          style={{ background: copied ? "rgba(16,185,129,0.1)" : inputBg, color: copied ? "#10b981" : textMuted, border: `1px solid ${copied ? "rgba(16,185,129,0.3)" : cardBorder}` }}
        >
          {copied ? "✓ Copied!" : "Copy code"}
        </button>
      </div>
    </div>
  );
}

function Customize({ userId, theme }) {
  const { d, card, cardBorder, textPrimary, textMuted, textSub, inputBg, inputBorder } = useThemeVars(theme);
  const [settings, setSettings] = useState({
    botName: "Assistant", welcomeMessage: "Hi! How can I help you today?",
    fallbackMessage: "I don't have that information, please contact us directly.",
    primaryColor: "#6C63FF", position: "bottom-right",
    collectName: true, collectEmail: true, logoUrl: "",
    faqButtons: [],
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("chatbot_settings").select("*").eq("user_id", userId).single();
      if (data) setSettings({ botName: data.bot_name, welcomeMessage: data.welcome_message, fallbackMessage: data.fallback_message, primaryColor: data.primary_color, position: data.position, collectName: data.collect_name, collectEmail: data.collect_email, logoUrl: data.logo_url || "", faqButtons: data.faq_buttons || [] });
      setLoading(false);
    }
    load();
  }, [userId]);

  async function handleSave() {
    const supabase = createClient();
    const { error } = await supabase.from("chatbot_settings").upsert({
      user_id: userId, bot_name: settings.botName, welcome_message: settings.welcomeMessage,
      fallback_message: settings.fallbackMessage, primary_color: settings.primaryColor,
      position: settings.position, collect_name: settings.collectName,
      collect_email: settings.collectEmail, logo_url: settings.logoUrl,
      faq_buttons: settings.faqButtons || [],
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", borderTopColor: d ? "white" : "black" }}></div></div>;

  const inputStyle = { background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary, outline: "none" };

  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="rounded-2xl p-6" style={{ background: card, border: `1px solid ${cardBorder}` }}>
        <p className="font-semibold mb-5" style={{ color: textPrimary }}>Bot settings</p>
        <div className="flex flex-col gap-4">
          {[
            { label: "Bot name", key: "botName", placeholder: "Assistant" },
            { label: "Logo URL", key: "logoUrl", placeholder: "https://yoursite.com/logo.png", sub: "Direct image link" },
            { label: "Welcome message", key: "welcomeMessage", placeholder: "Hi! How can I help?" },
            { label: "Fallback message", key: "fallbackMessage", placeholder: "Please contact us directly." },
          ].map(field => (
            <div key={field.key}>
              <label className="text-xs font-mono uppercase tracking-widest mb-1.5 block" style={{ color: textMuted }}>{field.label}</label>
              <input value={settings[field.key]} onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })} placeholder={field.placeholder} className="w-full rounded-xl px-4 py-3 text-sm" style={inputStyle} />
              {field.sub && <p className="text-xs mt-1 font-mono" style={{ color: textSub }}>{field.sub}</p>}
            </div>
          ))}

          <div>
            <label className="text-xs font-mono uppercase tracking-widest mb-1.5 block" style={{ color: textMuted }}>Widget color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border-0" style={{ background: "transparent" }} />
              <span className="text-sm font-mono" style={{ color: textMuted }}>{settings.primaryColor}</span>
              <div className="w-6 h-6 rounded-lg" style={{ background: settings.primaryColor, boxShadow: `0 4px 12px ${settings.primaryColor}66` }}></div>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest mb-1.5 block" style={{ color: textMuted }}>Position</label>
            <div className="flex gap-2">
              {["bottom-right", "bottom-left"].map(p => (
                <button key={p} onClick={() => setSettings({ ...settings, position: p })}
                  className="flex-1 py-2.5 rounded-xl text-xs font-mono transition-all"
                  style={settings.position === p ? { background: "#6366f1", color: "white", border: "1px solid #6366f1" } : { background: inputBg, color: textMuted, border: `1px solid ${inputBorder}` }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest mb-3 block" style={{ color: textMuted }}>Lead capture</label>
            {[{ key: "collectName", label: "Collect name" }, { key: "collectEmail", label: "Collect email" }].map(f => (
              <div key={f.key} className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: textMuted }}>{f.label}</span>
                <button onClick={() => setSettings({ ...settings, [f.key]: !settings[f.key] })}
                  className="w-9 h-5 rounded-full relative transition-all"
                  style={{ background: settings[f.key] ? "#6366f1" : (d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") }}>
                  <div className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all" style={{ left: settings[f.key] ? "20px" : "2px" }}></div>
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest mb-3 block" style={{ color: textMuted }}>FAQ buttons</label>
            <div className="flex flex-col gap-2">
              {(settings.faqButtons || []).map((btn, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={btn}
                    onChange={(e) => {
                      const updated = [...settings.faqButtons];
                      updated[i] = e.target.value;
                      setSettings({ ...settings, faqButtons: updated });
                    }}
                    className="flex-1 rounded-xl px-3 py-2 text-xs font-mono"
                    style={inputStyle}
                  />
                  <button
                    onClick={() => {
                      const updated = settings.faqButtons.filter((_, idx) => idx !== i);
                      setSettings({ ...settings, faqButtons: updated });
                    }}
                    className="px-3 py-2 rounded-xl text-xs transition-all"
                    style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                  >✕</button>
                </div>
              ))}
              {(settings.faqButtons || []).length < 5 && (
                <button
                  onClick={() => setSettings({ ...settings, faqButtons: [...(settings.faqButtons || []), ""] })}
                  className="py-2 rounded-xl text-xs font-mono transition-all"
                  style={{ color: "#6366f1", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
                >+ Add button</button>
              )}
            </div>
            <p className="text-xs font-mono mt-1.5" style={{ color: textSub }}>Auto-generated when you train. Editable here.</p>
          </div>

        </div>
        <button onClick={handleSave}
          className="w-full mt-6 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: saved ? "#10b981" : "#6366f1", color: "white", boxShadow: saved ? "0 4px 16px rgba(16,185,129,0.35)" : "0 4px 16px rgba(99,102,241,0.35)" }}>
          {saved ? "✓ Saved!" : "Save changes"}
        </button>
      </div>

      {/* Preview */}
      <div className="rounded-2xl p-6" style={{ background: card, border: `1px solid ${cardBorder}` }}>
        <p className="font-semibold mb-5" style={{ color: textPrimary }}>Live preview</p>
        <div className="rounded-xl h-96 relative overflow-hidden flex items-center justify-center" style={{ background: "#000", backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "28px 28px" }}>
          <div className="w-64 rounded-2xl overflow-hidden flex flex-col" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.06)" }}>
            <div className="px-4 py-3 flex items-center gap-2 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${settings.primaryColor}ff, ${settings.primaryColor}aa)`, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)" }}></div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center z-10" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}>
                {settings.logoUrl ? <img src={settings.logoUrl} className="w-4 h-4 object-contain rounded" /> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="13" rx="3" stroke="white" strokeWidth="2"/><circle cx="9" cy="14" r="1.5" fill="white"/><circle cx="15" cy="14" r="1.5" fill="white"/></svg>}
              </div>
              <div className="z-10">
                <p className="text-white font-bold text-xs">{settings.botName || "Assistant"}</p>
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div><p className="text-white/60 text-xs">Online</p></div>
              </div>
            </div>
            <div className="p-3 flex flex-col gap-2" style={{ background: "#0a0a0a", minHeight: "80px" }}>
              <div className="flex items-end gap-1.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: settings.primaryColor }}><svg width="8" height="8" viewBox="0 0 24 24" fill="none"><rect x="3" y="8" width="18" height="13" rx="3" stroke="white" strokeWidth="2"/></svg></div>
                <div className="px-3 py-2 rounded-2xl rounded-bl-sm text-xs max-w-36" style={{ background: "#161616", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}>{settings.welcomeMessage || "Hi! How can I help?"}</div>
              </div>
              <div className="flex justify-end">
                <div className="px-3 py-2 rounded-2xl rounded-br-sm text-xs text-white" style={{ background: settings.primaryColor }}>Hello!</div>
              </div>
            </div>
            <div className="px-3 py-2 flex gap-2" style={{ background: "#050505", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
              <div className="flex-1 px-3 py-1.5 rounded-lg text-xs" style={{ background: "#111", color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}>Ask me anything...</div>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: settings.primaryColor }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: settings.primaryColor, boxShadow: `0 6px 20px ${settings.primaryColor}66` }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
      </div>
    </div>
  );
}