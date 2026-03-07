"use client";
import { useState } from "react";
import Link from "next/link";
import { Brain, Mail, Lock, Eye, EyeOff, ArrowRight, Github, Chrome } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = "/analyze";
    }, 1200);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.1) 0%, var(--background) 60%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", marginBottom: "2rem" }}>
        <div style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", borderRadius: "8px", padding: "6px", display: "flex" }}>
          <Brain size={20} color="white" />
        </div>
        <span style={{ fontSize: "1.125rem", fontWeight: 700, background: "linear-gradient(135deg, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          NeuroCode AI
        </span>
      </Link>

      <div
        className="card animate-slide-up"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>Welcome back</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
            Sign in to continue your learning journey
          </p>
        </div>

        {/* Social Login */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <button
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.625rem", background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", color: "var(--foreground)", fontSize: "0.875rem", fontWeight: 500 }}
            onClick={() => alert("OAuth not configured in demo")}
          >
            <Github size={16} />
            GitHub
          </button>
          <button
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.625rem", background: "var(--secondary)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", color: "var(--foreground)", fontSize: "0.875rem", fontWeight: 500 }}
            onClick={() => alert("OAuth not configured in demo")}
          >
            <Chrome size={16} />
            Google
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>or continue with email</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem", display: "block" }}>
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: "2.5rem" }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <label style={{ fontSize: "0.875rem", fontWeight: 500 }}>Password</label>
              <Link href="#" style={{ fontSize: "0.75rem", color: "#6366f1", textDecoration: "none" }}>Forgot password?</Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
                style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "0.875rem", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: "16px", height: "16px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                Signing in...
              </span>
            ) : (
              <>Sign In <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
            Sign up free
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
