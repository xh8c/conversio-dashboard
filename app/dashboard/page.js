"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const LOGO_URL = "https://i.ibb.co/QvQZsP9y/Untitled-1.png"; // paste your logo image URL here

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
  const [sidebarReady, setSidebarReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
      else { setUser(data.user); setTimeout(() => setSidebarReady(true), 100); }
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!user) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative">
        <div className="w-8 h-8 border border-white/20 rounded-full animate-spin border-t-white"></div>
        <div className="absolute inset-0 rounded-full blur-md bg-white/10 animate-pulse"></div>
      </div>
    </div>
  );

  const navItems = [
    { id: "overview", label: "Overview", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg> },
    { id: "leads", label: "Leads", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
    { id: "chatbot", label: "Chatbot", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
    { id: "customize", label: "Customize", icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.5"/></svg> },
  ];

  return (
    <div className="min-h-screen bg-black flex" style={{ fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        
        * { scrollbar-width: thin; scrollbar-color: #222 transparent; }
        *::-webkit-scrollbar { width: 3px; }
        *::-webkit-scrollbar-thumb { background: #222; border-radius: 4px; }

        .sidebar-item {
          opacity: 0;
          transform: translateX(-12px);
          animation: slideIn 0.4s forwards;
        }
        @keyframes slideIn {
          to { opacity: 1; transform: translateX(0); }
        }
        .stat-card {
          opacity: 0;
          transform: translateY(16px);
          animation: fadeUp 0.5s forwards;
        }
        @keyframes fadeUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .glow-line {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: shimmer 3s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .nav-active {
          background: white;
          color: black !important;
          box-shadow: 0 0 20px rgba(255,255,255,0.15), 0 0 40px rgba(255,255,255,0.05);
        }
        .nav-active svg { color: black !important; }
        .card-hover {
          transition: all 0.25s ease;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .card-hover:hover {
          border-color: rgba(255,255,255,0.15);
          box-shadow: 0 0 30px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06);
          transform: translateY(-1px);
        }
        .white-glow {
          box-shadow: 0 0 40px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .btn-primary {
          background: white;
          color: black;
          transition: all 0.2s;
          box-shadow: 0 0 20px rgba(255,255,255,0.1);
        }
        .btn-primary:hover {
          background: #f0f0f0;
          box-shadow: 0 0 30px rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }
        .input-dark {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: white;
          transition: all 0.2s;
        }
        .input-dark:focus {
          outline: none;
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.05);
          box-shadow: 0 0 20px rgba(255,255,255,0.05);
        }
        .input-dark::placeholder { color: rgba(255,255,255,0.2); }
        .tab-content {
          animation: fadeUp 0.3s forwards;
        }
        .pulse-dot {
          animation: pulseDot 2s infinite;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(255,255,255,0.3); }
          50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(255,255,255,0); }
        }
      `}</style>

      {/* Sidebar */}
      <div className="w-56 flex flex-col fixed h-full border-r border-white/[0.06]" style={{ background: "#000" }}>
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/[0.06]">
          {LOGO_URL ? (
            <img src={LOGO_URL} alt="Logo" className="h-7 object-contain" />
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="black"/>
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-md blur-sm bg-white/30"></div>
              </div>
              <span className="text-white font-bold text-base tracking-tight">Conversio</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {navItems.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-all ${activeTab === item.id ? "nav-active" : "text-white/30 hover:text-white/70 hover:bg-white/[0.04]"}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-5 border-t border-white/[0.06] pt-4">
          <div className="px-3 mb-3">
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white pulse-dot"></div>
              <span className="text-white/20 text-xs font-mono truncate">{user.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium text-white/20 hover:text-white/60 hover:bg-white/[0.04] transition-all w-full"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 flex-1 min-h-screen" style={{ background: "#030303" }}>
        {/* Top bar */}
        <div className="border-b border-white/[0.04] px-8 py-4 flex items-center justify-between sticky top-0 z-10" style={{ background: "rgba(3,3,3,0.8)", backdropFilter: "blur(12px)" }}>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight capitalize">{activeTab}</h1>
            <p className="text-white/25 text-xs font-mono mt-0.5">conversio.app/dashboard</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot"></div>
            <span className="text-white/40 text-xs font-mono">live</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 tab-content" key={activeTab}>
          {activeTab === "overview" && <Overview userId={user.id} />}
          {activeTab === "leads" && <Leads userId={user.id} />}
          {activeTab === "chatbot" && <Chatbot userId={user.id} />}
          {activeTab === "customize" && <Customize userId={user.id} />}
        </div>
      </div>
    </div>
  );
}

function Overview({ userId }) {
  const [leads, setLeads] = useState(0);
  useEffect(() => {
    const supabase = createClient();
    supabase.from("leads").select("id", { count: "exact" }).eq("user_id", userId)
      .then(({ count }) => setLeads(count || 0));
  }, [userId]);

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Leads", value: leads, suffix: "", accent: true },
          { label: "Chatbot Status", value: "Active", isText: true },
          { label: "This Month", value: leads, suffix: " leads" },
        ].map((stat, i) => (
          <div key={stat.label} className="stat-card card-hover rounded-2xl p-6" style={{ animationDelay: `${i * 100}ms`, background: "#0a0a0a" }}>
            <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-4">{stat.label}</p>
            <p className="text-white font-bold text-4xl tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              {stat.isText ? stat.value : <><AnimatedNumber value={stat.value} />{stat.suffix}</>}
            </p>
            <div className="mt-4 h-px w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="h-full w-16 glow-line rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-hover rounded-2xl p-6 mb-4" style={{ background: "#0a0a0a" }}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-white font-semibold tracking-tight">Getting started</p>
          <span className="text-white/20 text-xs font-mono">3 steps</span>
        </div>
        {[
          { num: "01", title: "Train your chatbot", desc: "Paste your website URL in the Chatbot tab", done: true },
          { num: "02", title: "Customize the widget", desc: "Set colors, bot name, and lead capture settings", done: false },
          { num: "03", title: "Install on your website", desc: "Copy the script tag into your site's HTML", done: false },
        ].map((s, i) => (
          <div key={s.num} className="flex items-start gap-4 mb-5 last:mb-0 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10 group-hover:border-white/30 transition-all" style={{ background: "#111" }}>
              <span className="text-white/30 text-xs font-mono group-hover:text-white/70 transition-all">{s.num}</span>
            </div>
            <div className="flex-1 pt-1">
              <p className="text-white/80 text-sm font-medium">{s.title}</p>
              <p className="text-white/25 text-xs mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Leads({ userId }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("leads").select("*").eq("user_id", userId).order("created_at", { ascending: false });
      if (data) setLeads(data);
      setLoading(false);
    }
    load();
  }, [userId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-white/30 text-xs font-mono uppercase tracking-widest mb-1">Total</p>
          <p className="text-white font-bold text-3xl">{leads.length}</p>
        </div>
        {leads.length > 0 && (
          <button
            onClick={() => {
              const csv = ["Name,Email,Date", ...leads.map(l => `${l.name || ""},${l.email || ""},${new Date(l.created_at).toLocaleDateString()}`)].join("\n");
              const a = document.createElement("a");
              a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
              a.download = "leads.csv"; a.click();
            }}
            className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Export CSV
          </button>
        )}
      </div>

      <div className="card-hover rounded-2xl overflow-hidden" style={{ background: "#0a0a0a" }}>
        <div className="grid grid-cols-3 px-6 py-3 border-b border-white/[0.05]">
          {["Name", "Email", "Date"].map(h => (
            <span key={h} className="text-white/20 text-xs font-mono uppercase tracking-widest">{h}</span>
          ))}
        </div>
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-5 h-5 border border-white/20 rounded-full animate-spin border-t-white"></div>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-white/15 text-sm font-mono">No leads yet</p>
          </div>
        ) : leads.map((lead, i) => (
          <div key={lead.id} className="grid grid-cols-3 px-6 py-4 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors" style={{ animationDelay: `${i * 30}ms` }}>
            <span className="text-white/80 text-sm">{lead.name || "—"}</span>
            <span className="text-white/40 text-sm font-mono">{lead.email || "—"}</span>
            <span className="text-white/20 text-xs font-mono self-center">{new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Chatbot({ userId }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [settings, setSettings] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("chatbot_settings").select("*").eq("user_id", userId).single()
      .then(({ data }) => { if (data) setSettings(data); });
  }, [userId]);

  async function handleTrain() {
    if (!url) return;
    setLoading(true); setStatus(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/train", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, url }),
      });
      const data = await res.json();
      setStatus({ success: true, msg: `Scraped ${data.pages_scraped} pages — ${data.chunks_stored} chunks stored` });
    } catch {
      setStatus({ success: false, msg: "Backend unreachable. Make sure it's running on port 8000." });
    }
    setLoading(false);
  }

  const scriptTag = `<script>
window.chatbotConfig = {
  userId: "${userId}",
  apiUrl: "https://your-backend.railway.app",
};
</script>
<script src="https://your-dashboard.vercel.app/widget.js"></script>`;

  return (
    <div className="flex flex-col gap-5">
      <div className="card-hover rounded-2xl p-6" style={{ background: "#0a0a0a" }}>
        <p className="text-white font-semibold mb-1">Train on website</p>
        <p className="text-white/25 text-xs mb-5 font-mono">Paste your URL — we scrape every page automatically</p>
        <div className="flex gap-3">
          <input
            type="url" value={url} onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleTrain()}
            placeholder="https://yourwebsite.com"
            className="input-dark flex-1 rounded-xl px-4 py-3 text-sm"
          />
          <button onClick={handleTrain} disabled={loading} className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-40">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-black/30 rounded-full animate-spin border-t-black"></div>
                Training
              </div>
            ) : "Train"}
          </button>
        </div>
        {status && (
          <div className={`mt-4 px-4 py-3 rounded-xl text-xs font-mono border ${status.success ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" : "border-red-500/20 text-red-400 bg-red-500/5"}`}>
            {status.success ? "✓ " : "✗ "}{status.msg}
          </div>
        )}
      </div>

      <div className="card-hover rounded-2xl p-6" style={{ background: "#0a0a0a" }}>
        <p className="text-white font-semibold mb-1">Install script</p>
        <p className="text-white/25 text-xs mb-5 font-mono">Paste before the closing &lt;/body&gt; tag on your website</p>
        <div className="rounded-xl p-4 font-mono text-xs leading-relaxed border border-white/[0.06]" style={{ background: "#050505", color: "rgba(255,255,255,0.4)" }}>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{scriptTag}</pre>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(scriptTag); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="mt-4 px-4 py-2.5 rounded-xl text-xs font-semibold border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all flex items-center gap-2"
        >
          {copied ? "✓ Copied" : "Copy code"}
        </button>
      </div>
    </div>
  );
}

function Customize({ userId }) {
  const [settings, setSettings] = useState({
    botName: "Assistant", welcomeMessage: "Hi! How can I help you today?",
    fallbackMessage: "I don't have that information, please contact us directly.",
    primaryColor: "#6C63FF", position: "bottom-right",
    collectName: true, collectEmail: true, logoUrl: "",
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("chatbot_settings").select("*").eq("user_id", userId).single();
      if (data) setSettings({ botName: data.bot_name, welcomeMessage: data.welcome_message, fallbackMessage: data.fallback_message, primaryColor: data.primary_color, position: data.position, collectName: data.collect_name, collectEmail: data.collect_email, logoUrl: data.logo_url || "" });
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
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-5 h-5 border border-white/20 rounded-full animate-spin border-t-white"></div></div>;

  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="card-hover rounded-2xl p-6" style={{ background: "#0a0a0a" }}>
        <p className="text-white font-semibold mb-5">Bot settings</p>
        <div className="flex flex-col gap-4">
          {[
            { label: "Bot name", key: "botName", placeholder: "Assistant" },
            { label: "Logo URL", key: "logoUrl", placeholder: "https://yoursite.com/logo.png", sub: "Direct image link — shown in widget header" },
            { label: "Welcome message", key: "welcomeMessage", placeholder: "Hi! How can I help?" },
            { label: "Fallback message", key: "fallbackMessage", placeholder: "Please contact us directly." },
          ].map(field => (
            <div key={field.key}>
              <label className="text-white/30 text-xs font-mono uppercase tracking-widest mb-1.5 block">{field.label}</label>
              <input
                value={settings[field.key]}
                onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="input-dark w-full rounded-xl px-4 py-3 text-sm"
              />
              {field.sub && <p className="text-white/15 text-xs mt-1 font-mono">{field.sub}</p>}
            </div>
          ))}

          <div>
            <label className="text-white/30 text-xs font-mono uppercase tracking-widest mb-1.5 block">Widget color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent"/>
              <span className="text-white/40 text-sm font-mono">{settings.primaryColor}</span>
            </div>
          </div>

          <div>
            <label className="text-white/30 text-xs font-mono uppercase tracking-widest mb-1.5 block">Position</label>
            <div className="flex gap-2">
              {["bottom-right", "bottom-left"].map(p => (
                <button key={p} onClick={() => setSettings({ ...settings, position: p })}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-mono border transition-all ${settings.position === p ? "bg-white text-black border-white" : "border-white/10 text-white/30 hover:border-white/30 hover:text-white/60"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/30 text-xs font-mono uppercase tracking-widest mb-3 block">Lead capture</label>
            {[{ key: "collectName", label: "Collect name" }, { key: "collectEmail", label: "Collect email" }].map(f => (
              <div key={f.key} className="flex items-center justify-between mb-2">
                <span className="text-white/50 text-sm">{f.label}</span>
                <button onClick={() => setSettings({ ...settings, [f.key]: !settings[f.key] })}
                  className={`w-9 h-5 rounded-full relative transition-all ${settings[f.key] ? "bg-white" : "bg-white/10"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full absolute top-0.5 transition-all ${settings[f.key] ? "left-5 bg-black" : "left-0.5 bg-white/30"}`}></div>
                </button>
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleSave} className="btn-primary w-full mt-6 py-3 rounded-xl text-sm font-semibold">
          {saved ? "✓ Saved" : "Save changes"}
        </button>
      </div>

      {/* Live Preview */}
      <div className="card-hover rounded-2xl p-6" style={{ background: "#0a0a0a" }}>
        <p className="text-white font-semibold mb-5">Live preview</p>
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