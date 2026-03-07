"use client";
import Link from "next/link";
import { useState } from "react";
import { Brain, Code2, BarChart3, LogIn, Menu, X, Zap } from "lucide-react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      style={{
        background: "rgba(15, 15, 26, 0.95)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(10px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              borderRadius: "8px",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Brain size={20} color="white" />
          </div>
          <span
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            NeuroCode AI
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
          }}
          className="hidden-mobile"
        >
          <NavLink href="/analyze" icon={<Code2 size={16} />} label="Analyze" />
          <NavLink href="/progress" icon={<BarChart3 size={16} />} label="Progress" />
        </div>

        {/* Desktop Auth Buttons */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          className="hidden-mobile"
        >
          <Link href="/login" className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
            <LogIn size={16} />
            Sign In
          </Link>
          <Link href="/analyze" className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>
            <Zap size={16} />
            Try Free
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "0.375rem",
            cursor: "pointer",
            color: "var(--foreground)",
            display: "none",
          }}
          className="show-mobile"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "1rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <Link
            href="/analyze"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--foreground)",
              textDecoration: "none",
              padding: "0.5rem 0",
            }}
          >
            <Code2 size={16} />
            Analyze Code
          </Link>
          <Link
            href="/progress"
            onClick={() => setMobileOpen(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--foreground)",
              textDecoration: "none",
              padding: "0.5rem 0",
            }}
          >
            <BarChart3 size={16} />
            Learning Progress
          </Link>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.75rem", display: "flex", gap: "0.75rem" }}>
            <Link href="/login" className="btn-secondary" style={{ flex: 1, justifyContent: "center", fontSize: "0.875rem" }}>
              Sign In
            </Link>
            <Link href="/analyze" className="btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: "0.875rem" }}>
              Try Free
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.375rem",
        color: "var(--muted)",
        textDecoration: "none",
        fontSize: "0.875rem",
        fontWeight: 500,
        transition: "color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
    >
      {icon}
      {label}
    </Link>
  );
}
