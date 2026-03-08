const LANGUAGE_PATTERNS = {
  python: {
    strong: [
      /^import\s+\w+/m,
      /^from\s+\w+\s+import/m,
      /\bdef\s+\w+\s*\(/m,
      /\bclass\s+\w+.*:/m,
      /\bif\s+__name__\s*==\s*['"]__main__['"]\s*:/m,
      /\bprint\s*\(/m,
      /\belif\b/m,
      /\bself\./m,
      /\b(True|False|None)\b/,
      /^\s*@\w+/m,
      /\blambda\s+/,
      /\bexcept\s+\w+/m,
      /\braise\s+\w+/m,
    ],
    weak: [
      /:\s*$/m,
      /\bin\s+range\s*\(/,
      /\blen\s*\(/,
      /\bstr\s*\(/,
      /\bint\s*\(/,
      /\blist\s*\(/,
      /\bdict\s*\(/,
    ],
  },
  javascript: {
    strong: [
      /\bconst\s+\w+\s*=/m,
      /\blet\s+\w+\s*=/m,
      /\bfunction\s+\w+\s*\(/m,
      /=>\s*[{(]/m,
      /\bconsole\.(log|error|warn)\s*\(/m,
      /\brequire\s*\(\s*['"]/m,
      /\bmodule\.exports\b/,
      /\bexport\s+(default\s+)?/m,
      /\bimport\s+.*\s+from\s+['"]/m,
      /\bdocument\.\w+/m,
      /\bwindow\.\w+/m,
      /\basync\s+function/m,
      /\bawait\s+/m,
      /\b(undefined|null)\b/,
      /===|!==/,
      /\bPromise\b/,
      /\bReact\b/,
      /\buseState\b/,
      /\buseEffect\b/,
    ],
    weak: [
      /\bvar\s+\w+/m,
      /\{[\s\S]*\}/,
      /;\s*$/m,
    ],
  },
  java: {
    strong: [
      /\bpublic\s+class\s+\w+/m,
      /\bpublic\s+static\s+void\s+main\s*\(/m,
      /\bSystem\.out\.print(ln)?\s*\(/m,
      /\bprivate\s+(static\s+)?\w+\s+\w+/m,
      /\bprotected\s+\w+/m,
      /\bpackage\s+[\w.]+;/m,
      /\bimport\s+[\w.]+;/m,
      /\bnew\s+\w+\s*\(/m,
      /\bextends\s+\w+/m,
      /\bimplements\s+\w+/m,
      /\b(String|int|boolean|double|float|long|void)\s+\w+/m,
      /\b@Override\b/m,
      /\bthrows\s+\w+/m,
      /\bArrayList\b/,
      /\bHashMap\b/,
      /\bIterator\b/,
    ],
    weak: [
      /;\s*$/m,
      /\{\s*$/m,
    ],
  },
  cpp: {
    strong: [
      /^#include\s*[<"]/m,
      /\bstd::/m,
      /\bcout\s*<</m,
      /\bcin\s*>>/m,
      /\busing\s+namespace\s+std/m,
      /\bint\s+main\s*\(\s*(int\s+argc|void)?\s*[,)]?/m,
      /\bstd::string\b/,
      /\bstd::vector\b/,
      /\bstd::map\b/,
      /\btemplate\s*</m,
      /\bclass\s+\w+\s*\{/m,
      /\b(nullptr|NULL)\b/,
      /\bvirtual\s+/m,
      /::\w+\s*\(/m,
      /\b(size_t|uint32_t|int32_t)\b/,
      /\bprintf\s*\(/m,
      /\bscanf\s*\(/m,
      /->\w+/,
    ],
    weak: [
      /\bchar\s*\*/,
      /\bconst\s+\w+\s*&/,
    ],
  },
}

export function detectLanguage(code) {
  if (!code || !code.trim()) return null

  const scores = {}

  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    let score = 0
    for (const regex of patterns.strong) {
      if (regex.test(code)) score += 3
    }
    for (const regex of patterns.weak) {
      if (regex.test(code)) score += 1
    }
    scores[lang] = score
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const [topLang, topScore] = sorted[0]
  const [, secondScore] = sorted[1] || [null, 0]

  // Need a minimum score threshold and a clear lead
  if (topScore < 3) return null
  if (topScore > 0 && topScore - secondScore >= 2) {
    return topLang
  }
  if (topScore >= 6) {
    return topLang
  }

  return null
}
