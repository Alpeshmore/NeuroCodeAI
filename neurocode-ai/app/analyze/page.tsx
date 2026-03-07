"use client";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Navbar from "../components/Navbar";
const SimpleCodeEditor = dynamic(() => import("../components/SimpleCodeEditor"), { ssr: false });
import {
  Play,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Layers,
  Target,
  Zap,
  MessageSquare,
  Send,
  X,
  Code2,
  BookOpen,
  Lightbulb,
  Bug,
  BarChart2,
} from "lucide-react";



// --- Types ---
interface Segment {
  id: string;
  type: string;
  code: string;
  lines: string;
  complexity: number;
  confusionScore: number;
  confusionLevel: "high" | "medium" | "low";
}

interface Explanation {
  summary: string;
  detailed: string;
  analogy: string;
  steps: string[];
}

interface AnalysisResult {
  language: string;
  segments: Segment[];
  overallComplexity: number;
  analysisTime: string;
}

interface Message {
  role: "user" | "ai";
  content: string;
}

// --- Mock AI Analysis Logic ---
function analyzeCode(code: string, language: string): AnalysisResult {
  const lines = code.split("\n");
  const segments: Segment[] = [];

  // Simple heuristic-based mock analysis
  let currentStart = 1;
  let segIdx = 0;

  const functionMatches = [...code.matchAll(/(?:def |function |const \w+ = |async function )\w+/g)];

  if (functionMatches.length > 0) {
    functionMatches.forEach((match, i) => {
      const lineNum = code.substring(0, match.index).split("\n").length;
      const nextMatch = functionMatches[i + 1];
      const endLine = nextMatch
        ? code.substring(0, nextMatch.index).split("\n").length - 1
        : lines.length;

      const segCode = lines.slice(lineNum - 1, endLine).join("\n");
      const complexity = Math.min(10, Math.floor(segCode.split(/if|for|while|&&|\|\|/).length * 1.5));
      const confusionScore = Math.random() * 0.5 + (complexity > 5 ? 0.4 : 0.1);

      segments.push({
        id: `seg_${segIdx++}`,
        type: "function",
        code: segCode,
        lines: `${lineNum}–${endLine}`,
        complexity,
        confusionScore: Math.min(1, confusionScore),
        confusionLevel: confusionScore > 0.65 ? "high" : confusionScore > 0.35 ? "medium" : "low",
      });
      currentStart = endLine + 1;
    });
  } else {
    // Single block
    const complexity = Math.min(10, Math.floor(code.split(/if|for|while|&&|\|\|/).length * 1.5));
    const confusionScore = Math.random() * 0.4 + (complexity > 4 ? 0.3 : 0.1);
    segments.push({
      id: `seg_0`,
      type: "block",
      code: code,
      lines: `1–${lines.length}`,
      complexity,
      confusionScore: Math.min(1, confusionScore),
      confusionLevel: confusionScore > 0.65 ? "high" : confusionScore > 0.35 ? "medium" : "low",
    });
  }

  const avgComplexity =
    segments.reduce((a, b) => a + b.complexity, 0) / segments.length;

  return {
    language,
    segments,
    overallComplexity: Math.round(avgComplexity * 10),
    analysisTime: `${(Math.random() * 1.5 + 0.8).toFixed(1)}s`,
  };
}

function generateExplanation(segment: Segment, level: string): Explanation {
  const explanations: Record<string, Record<string, Explanation>> = {
    high: {
      beginner: {
        summary: "This code section is quite complex and may be tricky to follow.",
        detailed:
          "This segment contains multiple branching paths and possibly nested logic. Think of it like a maze—there are several routes the program can take depending on conditions. Each condition is like a fork in the road.",
        analogy:
          "Imagine a recipe that has many 'if you have X ingredient, do Y instead of Z' instructions. The more of these substitutions exist, the harder it is to follow.",
        steps: [
          "First, identify what the function takes as input",
          "Trace through each conditional branch one at a time",
          "Ask: what happens when each condition is true? False?",
          "Follow the data as it changes through each step",
          "Check the final return value or side effect",
        ],
      },
      intermediate: {
        summary: "High cyclomatic complexity detected—this function has multiple execution paths.",
        detailed:
          "The complexity score indicates this segment has several conditional branches or loops. Consider applying refactoring techniques like guard clauses, early returns, or extracting helper functions to improve readability.",
        analogy:
          "Think of it as a decision tree that's grown too wide—pruning it into smaller, named subtrees would improve clarity.",
        steps: [
          "Map the control flow graph mentally",
          "Identify any nested conditionals that could be flattened",
          "Look for early return opportunities to reduce nesting",
          "Consider extracting repeated patterns into helper functions",
        ],
      },
      advanced: {
        summary: "High-complexity segment with multiple execution paths—candidate for refactoring.",
        detailed:
          "Cyclomatic complexity >5 in this segment. Consider applying the Strategy pattern for conditional branches, or decomposing into smaller single-responsibility functions. Guard clauses can significantly reduce nesting depth.",
        analogy: "N/A at advanced level—focus on structural patterns.",
        steps: [
          "Evaluate cyclomatic complexity against team thresholds",
          "Apply single responsibility principle",
          "Consider polymorphism over conditional dispatch",
          "Review for premature optimization or over-engineering",
        ],
      },
    },
    medium: {
      beginner: {
        summary: "This part of the code has moderate complexity—let me break it down.",
        detailed:
          "This section does a few things in sequence. There are some conditions to check and possibly a loop. Follow along step by step—it's manageable once you understand each part.",
        analogy:
          "It's like following a cooking recipe with a few optional steps depending on what ingredients you have available.",
        steps: [
          "Read the function/block name to understand its purpose",
          "Identify any variables being created",
          "Trace the main happy path (when everything goes right)",
          "Then trace what happens in edge cases",
        ],
      },
      intermediate: {
        summary: "Moderate complexity—some branching logic worth understanding.",
        detailed:
          "This segment has a few decision points. The logic is manageable but worth reading carefully. Pay attention to variable mutation and any side effects.",
        analogy:
          "Like driving through a city—there are a few turns to make, but the route is clear if you follow each instruction.",
        steps: [
          "Note inputs and expected outputs",
          "Trace conditional branches",
          "Check for variable shadowing or mutation",
          "Verify edge case handling",
        ],
      },
      advanced: {
        summary: "Moderate complexity—standard patterns applied appropriately.",
        detailed:
          "Complexity within acceptable range. The patterns used here are idiomatic. Worth ensuring test coverage for each branch.",
        analogy: "",
        steps: ["Verify branch coverage in tests", "Review for any implicit type coercions"],
      },
    },
    low: {
      beginner: {
        summary: "This is straightforward code—great starting point!",
        detailed:
          "This section is simple and easy to follow. It likely does one clear thing without much branching. Perfect for understanding how basic programming concepts work.",
        analogy:
          "Like following a simple recipe with just 3 ingredients and 2 steps—very beginner-friendly!",
        steps: [
          "Read through it line by line",
          "Identify the input and output",
          "Understand what transformation is being applied",
        ],
      },
      intermediate: {
        summary: "Low complexity—clean, readable code.",
        detailed:
          "This is well-structured code with minimal branching. It follows good practices and should be easy to maintain.",
        analogy: "Clean highway driving—straight path, no unexpected turns.",
        steps: ["Verify it handles null/undefined inputs", "Check if any edge cases were missed"],
      },
      advanced: {
        summary: "Simple, clean segment.",
        detailed: "Low complexity, single responsibility. Good as-is.",
        analogy: "",
        steps: ["Check for any performance-sensitive paths that could benefit from memoization"],
      },
    },
  };

  const confusionKey = segment.confusionLevel;
  const levelKey = level as "beginner" | "intermediate" | "advanced";

  return explanations[confusionKey]?.[levelKey] ?? explanations.medium.intermediate;
}

function generateAIResponse(question: string, code: string): string {
  const q = question.toLowerCase();
  if (q.includes("what") && q.includes("do")) {
    return "This code appears to perform a computation or data transformation. The main logic involves processing the input values through a series of operations and returning or displaying the result. To understand it better, trace through with a simple example input.";
  }
  if (q.includes("why") || q.includes("purpose")) {
    return "The purpose of this code is to implement a specific algorithm or operation. The design choices here—like variable naming and control flow—suggest it was written for clarity. If you're unsure about a specific part, try adding `console.log()` statements (or print() in Python) to trace the values at each step.";
  }
  if (q.includes("error") || q.includes("bug") || q.includes("fix")) {
    return "Common errors in this pattern include: (1) Off-by-one errors in loops, (2) Null/undefined references when accessing object properties, (3) Type mismatches between expected and actual data. I'd recommend adding input validation and checking the error stack trace to identify the exact line causing the issue.";
  }
  if (q.includes("how") && q.includes("work")) {
    return "This works by first setting up the initial state or variables, then processing through the main logic—potentially with loops or conditions—and finally producing an output. The key insight is understanding the data flow: what goes in, what transformations happen, and what comes out.";
  }
  return "Great question! Based on the code analysis, this segment has a confusion score that suggests this area is worth examining closely. I recommend breaking it down into smaller parts and testing each piece independently. Would you like me to explain a specific line or concept in more detail?";
}

// --- Sample Code Examples ---
const SAMPLE_CODES: Record<string, { code: string; language: string }> = {
  python_fibonacci: {
    language: "python",
    code: `def fibonacci(n, memo={}):
    """Return the nth Fibonacci number using memoization."""
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo)
    return memo[n]

def fibonacci_sequence(count):
    """Generate a sequence of Fibonacci numbers."""
    return [fibonacci(i) for i in range(count)]

# Generate first 10 Fibonacci numbers
result = fibonacci_sequence(10)
print(f"Fibonacci sequence: {result}")`,
  },
  js_sorting: {
    language: "javascript",
    code: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pivotIndex = partition(arr, low, high);
    quickSort(arr, low, pivotIndex - 1);
    quickSort(arr, pivotIndex + 1, high);
  }
  return arr;
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  return i + 1;
}

const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log(quickSort([...numbers]));`,
  },
  python_error: {
    language: "python",
    code: `def process_user_data(users):
    results = []
    for user in users:
        # Bug: accessing key that might not exist
        age = user['age']
        name = user['name']
        
        if age >= 18:
            results.append({
                'name': name,
                'status': 'adult',
                'score': calculate_score(user)
            })
    return results

def calculate_score(user):
    # Potential division by zero
    return user['points'] / user['attempts']

# Test data with edge cases
test_users = [
    {'name': 'Alice', 'age': 25, 'points': 100, 'attempts': 5},
    {'name': 'Bob', 'age': 17},  # Missing fields!
    {'name': 'Charlie', 'age': 30, 'points': 0, 'attempts': 0}  # Division by zero!
]

print(process_user_data(test_users))`,
  },
};

// --- Main Component ---
export default function AnalyzePage() {
  const [code, setCode] = useState(SAMPLE_CODES.python_fibonacci.code);
  const [language, setLanguage] = useState("python");
  const [userLevel, setUserLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [expandedSegment, setExpandedSegment] = useState<string | null>(null);
  const [pipelineStage, setPipelineStage] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your NeuroCode AI assistant. Ask me anything about the code I've analyzed, or paste new code to get started!" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [feedback, setFeedback] = useState<Record<string, "up" | "down" | null>>({});

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) return;
    setAnalyzing(true);
    setResult(null);
    setPipelineStage(0);

    // Simulate pipeline stages
    const stages = [1, 2, 3, 4, 5, 6];
    for (const stage of stages) {
      await new Promise((r) => setTimeout(r, 350));
      setPipelineStage(stage);
    }

    await new Promise((r) => setTimeout(r, 300));
    const analysisResult = analyzeCode(code, language);
    setResult(analysisResult);
    setSelectedSegment(analysisResult.segments[0] || null);
    setAnalyzing(false);
  }, [code, language]);

  function handleSampleCode(key: string) {
    const sample = SAMPLE_CODES[key];
    setCode(sample.code);
    setLanguage(sample.language);
    setResult(null);
  }

  function handleChatSend() {
    if (!chatInput.trim()) return;
    const userMsg: Message = { role: "user", content: chatInput };
    const aiMsg: Message = { role: "ai", content: generateAIResponse(chatInput, code) };
    setChatMessages((prev) => [...prev, userMsg, aiMsg]);
    setChatInput("");
  }

  function handleFeedback(segId: string, val: "up" | "down") {
    setFeedback((prev) => ({ ...prev, [segId]: val }));
  }

  const currentExplanation = selectedSegment
    ? generateExplanation(selectedSegment, userLevel)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      <Navbar />

      {/* Top Bar */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "0.75rem 1.5rem", background: "rgba(26, 26, 46, 0.5)" }}>
        <div style={{ maxWidth: "1600px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--muted)" }}>Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-field"
              style={{ width: "auto", padding: "0.375rem 0.75rem", fontSize: "0.875rem" }}
            >
              {["python", "javascript", "typescript", "java", "cpp"].map((l) => (
                <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
              ))}
            </select>
            <span style={{ fontSize: "0.875rem", color: "var(--muted)" }}>Level:</span>
            {(["beginner", "intermediate", "advanced"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setUserLevel(l)}
                style={{
                  padding: "0.375rem 0.875rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: userLevel === l ? "1px solid #6366f1" : "1px solid var(--border)",
                  background: userLevel === l ? "rgba(99, 102, 241, 0.15)" : "transparent",
                  color: userLevel === l ? "#6366f1" : "var(--muted)",
                  textTransform: "capitalize",
                  transition: "all 0.2s",
                }}
              >
                {l}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Try sample:</span>
            {[
              { key: "python_fibonacci", label: "Fibonacci (Python)" },
              { key: "js_sorting", label: "QuickSort (JS)" },
              { key: "python_error", label: "Error Example" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleSampleCode(key)}
                style={{ padding: "0.375rem 0.75rem", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", border: "1px solid var(--border)", background: "var(--secondary)", color: "var(--muted)" }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "1.5rem", display: "grid", gridTemplateColumns: "1fr 380px", gap: "1.5rem", minHeight: "calc(100vh - 130px)" }}>

        {/* Left: Editor + Pipeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Code Editor */}
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Code2 size={16} color="#6366f1" />
                <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Code Editor</span>
                <span className="badge badge-purple" style={{ fontSize: "0.7rem" }}>{language}</span>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-primary"
                style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
              >
                {analyzing ? (
                  <>
                    <span style={{ width: "14px", height: "14px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
                    Analyzing...
                  </>
                ) : (
                  <><Play size={14} /> Analyze Code</>
                )}
              </button>
            </div>
            <div style={{ height: "380px" }}>
              <SimpleCodeEditor
                height="380px"
                language={language}
                value={code}
                onChange={(v) => setCode(v || "")}
              />
            </div>
          </div>

          {/* Analysis Pipeline */}
          <AnalysisPipeline stage={pipelineStage} analyzing={analyzing} />

          {/* Segments with Confusion Heatmap */}
          {result && (
            <ConfusionHeatmap
              result={result}
              selectedSegment={selectedSegment}
              onSelectSegment={setSelectedSegment}
              expandedSegment={expandedSegment}
              onToggleExpand={(id) => setExpandedSegment(expandedSegment === id ? null : id)}
              userLevel={userLevel}
              feedback={feedback}
              onFeedback={handleFeedback}
            />
          )}
        </div>

        {/* Right: Explanation Panel + Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Analysis Stats */}
          {result && (
            <div className="card">
              <h3 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <BarChart2 size={16} color="#6366f1" />
                Analysis Summary
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <StatBox label="Overall Complexity" value={`${result.overallComplexity}/100`} color="#f59e0b" />
                <StatBox label="Analysis Time" value={result.analysisTime} color="#10b981" />
                <StatBox label="Segments Found" value={`${result.segments.length}`} color="#6366f1" />
                <StatBox
                  label="High Confusion"
                  value={`${result.segments.filter((s) => s.confusionLevel === "high").length} segments`}
                  color="#ef4444"
                />
              </div>
            </div>
          )}

          {/* Explanation Panel */}
          <ExplanationPanel
            segment={selectedSegment}
            explanation={currentExplanation}
            userLevel={userLevel}
            onLevelChange={setUserLevel}
          />

          {/* Chat Button */}
          <button
            onClick={() => setChatOpen(true)}
            className="btn-secondary"
            style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
          >
            <MessageSquare size={16} />
            Ask AI Assistant
          </button>

          {!result && !analyzing && (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px" }}>
              <Brain size={40} color="var(--border)" style={{ margin: "0 auto 1rem" }} />
              <p style={{ fontSize: "0.875rem" }}>Run the analysis to see confusion detection and adaptive explanations</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Overlay */}
      {chatOpen && (
        <ChatPanel
          messages={chatMessages}
          input={chatInput}
          onInputChange={setChatInput}
          onSend={handleChatSend}
          onClose={() => setChatOpen(false)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .analyze-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// --- Sub-components ---

function AnalysisPipeline({ stage, analyzing }: { stage: number; analyzing: boolean }) {
  const stages = [
    { label: "Syntax", icon: <Code2 size={12} />, color: "#6366f1" },
    { label: "Semantic", icon: <Brain size={12} />, color: "#8b5cf6" },
    { label: "Complexity", icon: <Layers size={12} />, color: "#a855f7" },
    { label: "Confusion", icon: <Target size={12} />, color: "#ec4899" },
    { label: "Explanation", icon: <BookOpen size={12} />, color: "#f43f5e" },
    { label: "Error Reason", icon: <Bug size={12} />, color: "#ef4444" },
  ];

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem" }}>
      <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Zap size={14} color="#6366f1" />
        Recursive AI Pipeline
        {analyzing && <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#6366f1" }} className="animate-pulse-slow">Processing...</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
        {stages.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", flex: "none" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: i < stage ? s.color : i === stage && analyzing ? `${s.color}40` : "var(--secondary)",
                border: `2px solid ${i <= stage ? s.color : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: i < stage ? "white" : i === stage && analyzing ? s.color : "var(--muted)",
                transition: "all 0.3s",
              }}>
                {i < stage ? <CheckCircle size={14} /> : s.icon}
              </div>
              <span style={{ fontSize: "0.65rem", color: i < stage ? "var(--foreground)" : "var(--muted)", textAlign: "center", whiteSpace: "nowrap" }}>
                {s.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div style={{ flex: 1, height: "2px", background: i < stage - 1 ? s.color : "var(--border)", transition: "background 0.3s", margin: "0 2px", marginBottom: "18px" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ConfusionHeatmap({
  result, selectedSegment, onSelectSegment, expandedSegment, onToggleExpand, userLevel, feedback, onFeedback,
}: {
  result: AnalysisResult;
  selectedSegment: Segment | null;
  onSelectSegment: (s: Segment) => void;
  expandedSegment: string | null;
  onToggleExpand: (id: string) => void;
  userLevel: string;
  feedback: Record<string, "up" | "down" | null>;
  onFeedback: (id: string, val: "up" | "down") => void;
}) {
  const confusionColors = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };
  const confusionBg = { high: "rgba(239, 68, 68, 0.1)", medium: "rgba(245, 158, 11, 0.1)", low: "rgba(16, 185, 129, 0.1)" };

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Target size={16} color="#ec4899" />
        <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Confusion Heatmap</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.75rem", fontSize: "0.7rem" }}>
          {(["high", "medium", "low"] as const).map((level) => (
            <span key={level} style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: confusionColors[level] }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: confusionColors[level], display: "inline-block" }} />
              {level}
            </span>
          ))}
        </div>
      </div>
      <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {result.segments.map((segment) => {
          const isSelected = selectedSegment?.id === segment.id;
          const isExpanded = expandedSegment === segment.id;
          const explanation = generateExplanation(segment, userLevel);

          return (
            <div
              key={segment.id}
              style={{
                border: `1px solid ${isSelected ? confusionColors[segment.confusionLevel] : "var(--border)"}`,
                borderLeft: `4px solid ${confusionColors[segment.confusionLevel]}`,
                borderRadius: "8px",
                background: isSelected ? confusionBg[segment.confusionLevel] : "var(--secondary)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onClick={() => onSelectSegment(segment)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span className={`badge badge-${segment.confusionLevel === "high" ? "red" : segment.confusionLevel === "medium" ? "yellow" : "green"}`} style={{ fontSize: "0.65rem" }}>
                    {segment.confusionLevel} confusion
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Lines {segment.lines}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Complexity: {segment.complexity}/10</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "60px", height: "6px", background: "var(--border)", borderRadius: "9999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${segment.confusionScore * 100}%`, background: confusionColors[segment.confusionLevel], borderRadius: "9999px" }} />
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{Math.round(segment.confusionScore * 100)}%</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleExpand(segment.id); }}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "0.75rem 1rem" }} onClick={(e) => e.stopPropagation()}>
                  <p style={{ fontSize: "0.8rem", color: "var(--foreground)", marginBottom: "0.75rem", lineHeight: 1.6 }}>
                    {explanation.summary}
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Was this helpful?</span>
                    <button
                      onClick={() => onFeedback(segment.id, "up")}
                      style={{ background: feedback[segment.id] === "up" ? "rgba(16, 185, 129, 0.15)" : "transparent", border: `1px solid ${feedback[segment.id] === "up" ? "#10b981" : "var(--border)"}`, borderRadius: "6px", padding: "0.25rem 0.5rem", cursor: "pointer", color: feedback[segment.id] === "up" ? "#10b981" : "var(--muted)", display: "flex", gap: "0.25rem", alignItems: "center", fontSize: "0.7rem" }}
                    >
                      <ThumbsUp size={12} /> Yes
                    </button>
                    <button
                      onClick={() => onFeedback(segment.id, "down")}
                      style={{ background: feedback[segment.id] === "down" ? "rgba(239, 68, 68, 0.15)" : "transparent", border: `1px solid ${feedback[segment.id] === "down" ? "#ef4444" : "var(--border)"}`, borderRadius: "6px", padding: "0.25rem 0.5rem", cursor: "pointer", color: feedback[segment.id] === "down" ? "#ef4444" : "var(--muted)", display: "flex", gap: "0.25rem", alignItems: "center", fontSize: "0.7rem" }}
                    >
                      <ThumbsDown size={12} /> No
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExplanationPanel({
  segment, explanation, userLevel, onLevelChange,
}: {
  segment: Segment | null;
  explanation: Explanation | null;
  userLevel: string;
  onLevelChange: (l: "beginner" | "intermediate" | "advanced") => void;
}) {
  const [activeTab, setActiveTab] = useState<"summary" | "detailed" | "steps">("summary");

  if (!segment || !explanation) {
    return (
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", color: "var(--muted)", textAlign: "center", fontSize: "0.875rem" }}>
        <Lightbulb size={32} style={{ margin: "0 auto 0.75rem", color: "var(--border)" }} />
        <p>Select a code segment to see adaptive explanations</p>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden" }}>
      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <Lightbulb size={16} color="#f59e0b" />
          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>Adaptive Explanation</span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["beginner", "intermediate", "advanced"] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLevelChange(l)}
              style={{
                flex: 1, padding: "0.375rem", borderRadius: "6px", fontSize: "0.7rem",
                fontWeight: 600, cursor: "pointer", textTransform: "capitalize",
                border: userLevel === l ? "1px solid #6366f1" : "1px solid var(--border)",
                background: userLevel === l ? "rgba(99, 102, 241, 0.15)" : "transparent",
                color: userLevel === l ? "#6366f1" : "var(--muted)",
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
        {(["summary", "detailed", "steps"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: "0.5rem", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer",
              background: activeTab === tab ? "rgba(99, 102, 241, 0.1)" : "transparent",
              border: "none", borderBottom: activeTab === tab ? "2px solid #6366f1" : "2px solid transparent",
              color: activeTab === tab ? "#6366f1" : "var(--muted)", textTransform: "capitalize",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: "1rem" }}>
        {activeTab === "summary" && (
          <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "var(--foreground)" }}>
            {explanation.summary}
          </p>
        )}
        {activeTab === "detailed" && (
          <div>
            <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "var(--foreground)", marginBottom: "1rem" }}>
              {explanation.detailed}
            </p>
            {explanation.analogy && (
              <div style={{ padding: "0.75rem", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", borderRadius: "8px", fontSize: "0.8rem", color: "#fbbf24", lineHeight: 1.6 }}>
                <strong>Analogy:</strong> {explanation.analogy}
              </div>
            )}
          </div>
        )}
        {activeTab === "steps" && (
          <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {explanation.steps.map((step, i) => (
              <li key={i} style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--foreground)" }}>
                {step}
              </li>
            ))}
          </ol>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
          <AlertTriangle size={12} color="#f59e0b" />
          <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
            Confusion score: {Math.round((segment.confusionScore) * 100)}% • Complexity: {segment.complexity}/10
          </span>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ padding: "0.75rem", background: "var(--secondary)", borderRadius: "8px", border: "1px solid var(--border)" }}>
      <div style={{ fontSize: "1.125rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{label}</div>
    </div>
  );
}

function ChatPanel({
  messages, input, onInputChange, onSend, onClose,
}: {
  messages: Message[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onClose: () => void;
}) {
  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }

  return (
    <div style={{
      position: "fixed", bottom: "1.5rem", right: "1.5rem", width: "380px", maxHeight: "500px",
      background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column",
      zIndex: 100, overflow: "hidden",
    }}>
      <div style={{ padding: "0.875rem 1rem", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} className="animate-pulse-slow" />
          <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>AI Assistant</span>
        </div>
        <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "340px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%", padding: "0.625rem 0.875rem", borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
              background: msg.role === "user" ? "rgba(99, 102, 241, 0.2)" : "var(--secondary)",
              border: `1px solid ${msg.role === "user" ? "rgba(99, 102, 241, 0.3)" : "var(--border)"}`,
              fontSize: "0.8rem", lineHeight: 1.6, color: "var(--foreground)",
            }}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: "0.75rem", borderTop: "1px solid var(--border)", display: "flex", gap: "0.5rem" }}>
        <input
          className="input-field"
          style={{ flex: 1, padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}
          placeholder="Ask about the code..."
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          onClick={onSend}
          className="btn-primary"
          style={{ padding: "0.5rem 0.75rem" }}
          disabled={!input.trim()}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
