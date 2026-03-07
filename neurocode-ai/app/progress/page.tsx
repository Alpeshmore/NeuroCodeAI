"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import {
  BarChart2,
  Brain,
  TrendingUp,
  CheckCircle,
  Clock,
  Target,
  BookOpen,
  Code2,
  Zap,
  Award,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  Cell,
} from "recharts";

// --- Mock Data ---
const sessionData = [
  { date: "Jan 15", sessions: 2, confusionResolved: 5, timeSpent: 25 },
  { date: "Jan 17", sessions: 1, confusionResolved: 3, timeSpent: 15 },
  { date: "Jan 20", sessions: 3, confusionResolved: 8, timeSpent: 45 },
  { date: "Jan 23", sessions: 2, confusionResolved: 6, timeSpent: 30 },
  { date: "Jan 25", sessions: 4, confusionResolved: 12, timeSpent: 60 },
  { date: "Jan 28", sessions: 2, confusionResolved: 9, timeSpent: 40 },
  { date: "Feb 1", sessions: 5, confusionResolved: 15, timeSpent: 75 },
  { date: "Feb 5", sessions: 3, confusionResolved: 10, timeSpent: 50 },
];

const skillData = [
  { skill: "Loops", mastery: 82 },
  { skill: "Functions", mastery: 75 },
  { skill: "Recursion", mastery: 58 },
  { skill: "Data Structures", mastery: 65 },
  { skill: "Algorithms", mastery: 45 },
  { skill: "Error Handling", mastery: 70 },
  { skill: "OOP", mastery: 40 },
  { skill: "Async/Await", mastery: 55 },
];

const radarData = [
  { concept: "Syntax", value: 88 },
  { concept: "Logic", value: 72 },
  { concept: "Semantics", value: 65 },
  { concept: "Patterns", value: 58 },
  { concept: "Debugging", value: 76 },
  { concept: "Concepts", value: 60 },
];

const recentSessions = [
  {
    date: "Feb 5, 2026",
    duration: "18 min",
    language: "Python",
    segmentsAnalyzed: 5,
    confusionResolved: 4,
    topic: "Fibonacci with memoization",
    improvement: "+12%",
  },
  {
    date: "Feb 3, 2026",
    duration: "22 min",
    language: "JavaScript",
    segmentsAnalyzed: 7,
    confusionResolved: 5,
    topic: "QuickSort algorithm",
    improvement: "+8%",
  },
  {
    date: "Feb 1, 2026",
    duration: "35 min",
    language: "Python",
    segmentsAnalyzed: 10,
    confusionResolved: 8,
    topic: "Error handling patterns",
    improvement: "+15%",
  },
  {
    date: "Jan 28, 2026",
    duration: "14 min",
    language: "TypeScript",
    segmentsAnalyzed: 4,
    confusionResolved: 3,
    topic: "Generic types",
    improvement: "+5%",
  },
];

const recommendations = [
  { topic: "Recursion", reason: "Confusion score 0.72 – still unclear", priority: "high", language: "Python" },
  { topic: "Async/Await", reason: "Limited practice – only 2 sessions", priority: "medium", language: "JavaScript" },
  { topic: "Object-Oriented Programming", reason: "Low mastery (40%) – needs reinforcement", priority: "high", language: "Java" },
  { topic: "Algorithm Complexity", reason: "Related to sorting confusion", priority: "medium", language: "Any" },
];

const knowledgeGaps = [
  { concept: "Closure scoping", severity: "high", sessions: 3 },
  { concept: "Mutable default arguments (Python)", severity: "high", sessions: 5 },
  { concept: "Promise chaining", severity: "medium", sessions: 2 },
  { concept: "Type coercion in JS", severity: "medium", sessions: 4 },
];

const COLORS = ["#6366f1", "#a855f7", "#ec4899", "#f43f5e", "#ef4444", "#f59e0b", "#10b981", "#3b82f6"];

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "history" | "recommendations">("overview");

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      <Navbar />

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "1.5rem", background: "rgba(26, 26, 46, 0.5)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Brain size={24} color="#6366f1" />
                Learning Progress
              </h1>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                Track your code comprehension journey and identify knowledge gaps
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link href="/analyze" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}>
                <Code2 size={16} />
                Analyze Code
              </Link>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.25rem", marginTop: "1.25rem" }}>
            {(["overview", "skills", "history", "recommendations"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
                  textTransform: "capitalize", border: activeTab === tab ? "1px solid #6366f1" : "1px solid transparent",
                  background: activeTab === tab ? "rgba(99, 102, 241, 0.15)" : "transparent",
                  color: activeTab === tab ? "#6366f1" : "var(--muted)", transition: "all 0.2s",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "skills" && <SkillsTab />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "recommendations" && <RecommendationsTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {[
          { icon: <Clock size={20} color="#6366f1" />, label: "Total Study Time", value: "6h 23m", sub: "+2h this week", color: "#6366f1" },
          { icon: <Target size={20} color="#ec4899" />, label: "Confusion Resolved", value: "68", sub: "out of 82 total", color: "#ec4899" },
          { icon: <CheckCircle size={20} color="#10b981" />, label: "Concepts Mastered", value: "24", sub: "across 3 languages", color: "#10b981" },
          { icon: <TrendingUp size={20} color="#f59e0b" />, label: "Overall Progress", value: "67%", sub: "+12% this month", color: "#f59e0b" },
          { icon: <Zap size={20} color="#a855f7" />, label: "Analysis Sessions", value: "31", sub: "8 this week", color: "#a855f7" },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: stat.color }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div style={{ background: `${stat.color}20`, borderRadius: "8px", padding: "6px", display: "flex" }}>{stat.icon}</div>
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, marginTop: "0.25rem" }}>{stat.label}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.25rem" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress Chart + Radar */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div className="card">
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={16} color="#6366f1" />
            Confusion Resolution Over Time
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={sessionData}>
              <defs>
                <linearGradient id="confusionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2d2d4e", borderRadius: "8px", fontSize: "0.8rem" }} />
              <Area type="monotone" dataKey="confusionResolved" stroke="#6366f1" fill="url(#confusionGrad)" strokeWidth={2} name="Resolved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Brain size={16} color="#a855f7" />
            Concept Mastery Radar
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="concept" tick={{ fontSize: 11, fill: "#64748b" }} />
              <Radar name="Mastery" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2d2d4e", borderRadius: "8px", fontSize: "0.8rem" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Knowledge Gaps */}
      <div className="card">
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Target size={16} color="#ef4444" />
          Knowledge Gaps Detected
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {knowledgeGaps.map((gap, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--secondary)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span className={`badge badge-${gap.severity === "high" ? "red" : "yellow"}`} style={{ fontSize: "0.65rem" }}>
                  {gap.severity}
                </span>
                <span style={{ fontSize: "0.875rem" }}>{gap.concept}</span>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Appeared in {gap.sessions} sessions</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkillsTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="card">
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BarChart2 size={16} color="#6366f1" />
          Skill Mastery Breakdown
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {skillData.map((skill, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                <span style={{ fontSize: "0.875rem" }}>{skill.skill}</span>
                <span style={{ fontSize: "0.875rem", fontWeight: 600, color: skill.mastery >= 70 ? "#10b981" : skill.mastery >= 50 ? "#f59e0b" : "#ef4444" }}>
                  {skill.mastery}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${skill.mastery}%`,
                  background: skill.mastery >= 70 ? "linear-gradient(90deg, #10b981, #059669)" :
                    skill.mastery >= 50 ? "linear-gradient(90deg, #f59e0b, #d97706)" :
                      "linear-gradient(90deg, #ef4444, #dc2626)",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BarChart2 size={16} color="#a855f7" />
          Mastery Distribution
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={skillData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis type="category" dataKey="skill" tick={{ fontSize: 12, fill: "#94a3b8" }} width={120} />
            <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2d2d4e", borderRadius: "8px", fontSize: "0.8rem" }} />
            <Bar dataKey="mastery" radius={[0, 4, 4, 0]}>
              {skillData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.mastery >= 70 ? "#10b981" : entry.mastery >= 50 ? "#f59e0b" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function HistoryTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="card">
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Clock size={16} color="#6366f1" />
          Recent Analysis Sessions
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {recentSessions.map((session, i) => (
            <div key={i} style={{ padding: "1rem", background: "var(--secondary)", borderRadius: "10px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.375rem" }}>{session.topic}</div>
                  <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Clock size={12} /> {session.duration}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Code2 size={12} /> {session.language}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <BarChart2 size={12} /> {session.segmentsAnalyzed} segments
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#10b981", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <CheckCircle size={12} /> {session.confusionResolved} resolved
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{session.date}</span>
                  <span className="badge badge-green" style={{ fontSize: "0.7rem" }}>{session.improvement}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <TrendingUp size={16} color="#10b981" />
          Study Time per Session
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={sessionData}>
            <defs>
              <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
            <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2d2d4e", borderRadius: "8px", fontSize: "0.8rem" }} formatter={(v) => [`${v} min`, "Time Spent"]} />
            <Area type="monotone" dataKey="timeSpent" stroke="#10b981" fill="url(#timeGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function RecommendationsTab() {
  const priorityColors = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div className="card">
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <BookOpen size={16} color="#6366f1" />
          Personalized Learning Recommendations
        </h3>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1.25rem" }}>
          Based on your confusion patterns and knowledge gaps, the AI recommends these topics:
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {recommendations.map((rec, i) => (
            <div key={i} style={{ padding: "1rem", background: "var(--secondary)", borderRadius: "10px", border: `1px solid ${rec.priority === "high" ? "rgba(239,68,68,0.3)" : "var(--border)"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
                    <span style={{ fontWeight: 600 }}>{rec.topic}</span>
                    <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>{rec.language}</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{rec.reason}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span
                    className={`badge badge-${rec.priority === "high" ? "red" : "yellow"}`}
                    style={{ fontSize: "0.65rem" }}
                  >
                    {rec.priority} priority
                  </span>
                  <Link
                    href="/analyze"
                    style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "#6366f1", textDecoration: "none" }}
                  >
                    Practice <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
        <div className="card">
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Award size={16} color="#f59e0b" />
            Learning Milestones
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { label: "First Analysis Session", completed: true },
              { label: "5 Confusion Points Resolved", completed: true },
              { label: "10 Sessions Completed", completed: true },
              { label: "Master a Concept (80%+)", completed: true },
              { label: "Resolve 50 Confusion Points", completed: true },
              { label: "Learn 3 Languages", completed: false },
              { label: "100 Analysis Sessions", completed: false },
            ].map((milestone, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <CheckCircle size={16} color={milestone.completed ? "#10b981" : "var(--border)"} />
                <span style={{ fontSize: "0.8rem", color: milestone.completed ? "var(--foreground)" : "var(--muted)" }}>
                  {milestone.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RefreshCw size={16} color="#6366f1" />
            Weekly Learning Goal
          </h3>
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "3rem", fontWeight: 800, color: "#6366f1" }}>6/8</div>
            <div style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1.25rem" }}>sessions this week</div>
            <div className="progress-bar" style={{ height: "8px" }}>
              <div className="progress-fill" style={{ width: "75%" }} />
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.75rem" }}>
              2 more sessions to reach your weekly goal!
            </p>
          </div>
          <Link href="/analyze" className="btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}>
            <Zap size={16} />
            Continue Learning
          </Link>
        </div>
      </div>
    </div>
  );
}
