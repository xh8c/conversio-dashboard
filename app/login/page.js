"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4" style={{ fontFamily: "'Syne', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');
        .input-dark {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: white;
          transition: all 0.2s;
          font-family: 'DM Mono', monospace;
        }
        .input-dark:focus {
          outline: none;
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.05);
          box-shadow: 0 0 20px rgba(255,255,255,0.04);
        }
        .input-dark::placeholder { color: rgba(255,255,255,0.15); }
        .btn-primary {
          background: white; color: black;
          transition: all 0.2s;
          box-shadow: 0 0 30px rgba(255,255,255,0.1);
        }
        .btn-primary:hover {
          background: #f0f0f0;
          box-shadow: 0 0 40px rgba(255,255,255,0.2);
          transform: translateY(-1px);
        }
        .card {
          background: #0a0a0a;
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 0 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s forwards; }
      `}</style>

      <div className="w-full max-w-sm fade-up">
        {/* Logo */}
<div className="flex items-center justify-center mb-10">
          <img src="https://i.ibb.co/QvQZsP9y/Untitled-1.png" alt="Logo" className="h-8 object-contain" />
        </div>

        <div className="card rounded-2xl p-8">
          <h1 className="text-white font-bold text-2xl tracking-tight mb-1">Welcome back</h1>
          <p className="text-white/25 text-xs font-mono mb-7">Sign in to your account</p>

          {error && (
            <div className="border border-red-500/20 bg-red-500/5 rounded-xl px-4 py-3 mb-5">
              <p className="text-red-400 text-xs font-mono">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-white/25 text-xs font-mono uppercase tracking-widest mb-1.5 block">Email</label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="you@company.com"
                className="input-dark w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-white/25 text-xs font-mono uppercase tracking-widest mb-1.5 block">Password</label>
              <input
                type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="input-dark w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-sm font-bold mt-1 disabled:opacity-40"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border border-black/30 rounded-full animate-spin border-t-black"></div>
                  Signing in
                </div>
              ) : "Sign in"}
            </button>
          </div>
        </div>

        <p className="text-center text-white/20 text-xs font-mono mt-6">
          No account?{" "}
          <Link href="/signup" className="text-white/50 hover:text-white transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}