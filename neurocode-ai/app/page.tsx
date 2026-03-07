import Link from "next/link";
import Navbar from "./components/Navbar";
import {
  Brain,
  Code2,
  Zap,
  Shield,
  BarChart3,
  ChevronRight,
  ArrowRight,
  Star,
  Layers,
  Target,
  RefreshCw,
} from "lucide-react";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      <Navbar />

      <HeroSection />
      <FeaturesSection />
      <PipelineSection />
      <TestimonialsSection />
      <CtaSection />
      <FooterSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section
      style={{
        padding: "5rem 1.5rem 4rem",
        textAlign: "center",
        background:
          "radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "9999px",
            padding: "0.375rem 1rem",
            fontSize: "0.8rem",
            color: "#a5b4fc",
            marginBottom: "1.5rem",
          }}
        >
          <Zap size={14} />
          Confusion-Aware Recursive Code Intelligence
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: "1.5rem",
            color: "var(--foreground)",
          }}
        >
          Understand Code.{" "}
          <span className="gradient-text">Not Just Fix It.</span>
        </h1>

        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--muted)",
            marginBottom: "2.5rem",
            maxWidth: "600px",
            margin: "0 auto 2.5rem",
          }}
        >
          NeuroCode AI detects where you struggle with code, then generates
          personalized explanations at your level—helping you truly understand,
          not just copy solutions.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/analyze" className="btn-primary" style={{ fontSize: "1rem", padding: "0.875rem 2rem" }}>
            <Code2 size={18} />
            Start Analyzing
            <ArrowRight size={16} />
          </Link>
          <Link href="/register" className="btn-secondary" style={{ fontSize: "1rem", padding: "0.875rem 2rem" }}>
            Create Free Account
          </Link>
        </div>

        <div
          style={{
            display: "flex",
            gap: "2rem",
            justifyContent: "center",
            marginTop: "3rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "50K+", label: "Active Learners" },
            { value: "85%", label: "Confusion Resolved" },
            { value: "<3s", label: "Analysis Time" },
            { value: "6", label: "AI Micro-Models" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#a5b4fc" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <Brain size={24} color="#6366f1" />,
      title: "Confusion Detection",
      description: "AI monitors your interaction patterns to detect exactly where you struggle with code comprehension.",
      color: "#6366f1",
    },
    {
      icon: <Layers size={24} color="#a855f7" />,
      title: "Recursive Micro-Models",
      description: "6 specialized AI micro-models analyze syntax, semantics, complexity, and confusion in stages.",
      color: "#a855f7",
    },
    {
      icon: <Target size={24} color="#ec4899" />,
      title: "Adaptive Explanations",
      description: "Explanations automatically adjust to your level based on detected confusion signals.",
      color: "#ec4899",
    },
    {
      icon: <RefreshCw size={24} color="#10b981" />,
      title: "Recursive Refinement",
      description: "When confusion persists, the system recursively generates alternative explanations.",
      color: "#10b981",
    },
    {
      icon: <BarChart3 size={24} color="#f59e0b" />,
      title: "Learning Memory",
      description: "Tracks your progress, identifies knowledge gaps, and personalizes future explanations.",
      color: "#f59e0b",
    },
    {
      icon: <Shield size={24} color="#3b82f6" />,
      title: "Privacy-First",
      description: "Your code is never shared. Anonymous by default. GDPR and CCPA compliant.",
      color: "#3b82f6",
    },
  ];

  return (
    <section style={{ padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 700, marginBottom: "1rem" }}>
            How NeuroCode AI Works
          </h2>
          <p style={{ color: "var(--muted)", maxWidth: "500px", margin: "0 auto" }}>
            A recursive AI pipeline that analyzes your code in stages, detects confusion, and adapts to your learning level.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {features.map((feature, i) => (
            <div key={i} className="card card-hover" style={{ position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${feature.color}, transparent)` }} />
              <div style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}40`, borderRadius: "10px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>{feature.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PipelineSection() {
  const pipeline = [
    { title: "Syntax Analyzer", description: "Parses code structure and validates syntax across multiple languages.", color: "#6366f1" },
    { title: "Semantic Analyzer", description: "Uses Graph Neural Networks on AST to understand code intent and logic.", color: "#8b5cf6" },
    { title: "Complexity Scorer", description: "Evaluates cognitive load of each code segment with 20+ metrics.", color: "#a855f7" },
    { title: "Confusion Detector", description: "Multi-modal transformer predicts confusion probability per segment.", color: "#ec4899" },
    { title: "Explanation Generator", description: "Fine-tuned LLM creates adaptive explanations at your learning level.", color: "#f43f5e" },
    { title: "Error Reasoner", description: "Causal reasoning network traces error origins and suggests fixes.", color: "#ef4444" },
  ];

  return (
    <section style={{ padding: "4rem 1.5rem", background: "rgba(99, 102, 241, 0.03)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700, marginBottom: "1rem" }}>
            Recursive AI Pipeline
          </h2>
          <p style={{ color: "var(--muted)" }}>
            6 specialized micro-models working together to understand your code
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {pipeline.map((stage, i) => (
            <div key={i} style={{ display: "flex", gap: "1rem", padding: "1rem", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "10px" }}>
              <div style={{ background: `${stage.color}20`, border: `1px solid ${stage.color}50`, borderRadius: "8px", width: "36px", height: "36px", minWidth: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.875rem", fontWeight: 700, color: stage.color }}>
                {i + 1}
              </div>
              <div>
                <h4 style={{ fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.9rem" }}>{stage.title}</h4>
                <p style={{ color: "var(--muted)", fontSize: "0.8rem", lineHeight: 1.5 }}>{stage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { name: "Sarah Chen", role: "CS Student, Stanford", avatar: "SC", rating: 5, comment: "NeuroCode AI completely changed how I debug. Instead of just telling me what's wrong, it explains WHY. I actually understand the code now." },
    { name: "Marcus Johnson", role: "Junior Developer", avatar: "MJ", rating: 5, comment: "The confusion detection is uncanny—it somehow knows exactly which part I'm confused about before I even ask." },
    { name: "Priya Patel", role: "Coding Instructor", avatar: "PP", rating: 5, comment: "I use NeuroCode AI to identify where my students commonly get confused. The confusion heatmaps are incredibly useful for teaching." },
  ];

  return (
    <section style={{ padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", fontWeight: 700 }}>
            Loved by Learners
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {testimonials.map((t, i) => (
            <div key={i} className="card">
              <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1rem" }}>
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} color="#f59e0b" fill="#f59e0b" />
                ))}
              </div>
              <p style={{ color: "var(--foreground)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.25rem", fontStyle: "italic" }}>
                &ldquo;{t.comment}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "white" }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{t.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: "0.75rem" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section style={{ padding: "5rem 1.5rem", textAlign: "center", background: "radial-gradient(ellipse at 50% 100%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, marginBottom: "1rem" }}>
          Ready to{" "}
          <span className="gradient-text">Truly Understand</span> Code?
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "1.125rem" }}>
          Join thousands of developers and students. Free to get started—no credit card required.
        </p>
        <Link href="/analyze" className="btn-primary" style={{ fontSize: "1.125rem", padding: "1rem 2.5rem" }}>
          <Zap size={20} />
          Start Analyzing for Free
          <ChevronRight size={18} />
        </Link>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "2rem 1.5rem", textAlign: "center", color: "var(--muted)", fontSize: "0.875rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Brain size={16} color="#6366f1" />
          <span style={{ fontWeight: 600, color: "var(--foreground)" }}>NeuroCode AI</span>
        </div>
        <p>© 2026 NeuroCode AI. Learning-first, not output-first.</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <Link href="/analyze" style={{ color: "var(--muted)", textDecoration: "none" }}>Analyze</Link>
          <Link href="/progress" style={{ color: "var(--muted)", textDecoration: "none" }}>Progress</Link>
          <Link href="/login" style={{ color: "var(--muted)", textDecoration: "none" }}>Sign In</Link>
        </div>
      </div>
    </footer>
  );
}
