import { useRef, useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { detectLanguage } from '../utils/detectLanguage'

const SAMPLE_CODE = {
  python: '',
  javascript: '',
  java: '',
  cpp: '',
}

const LANGUAGE_OPTIONS = [
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'javascript', label: 'JavaScript', icon: '⚡' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚙️' },
]

export default function MonacoEditor({
  code,
  language,
  onCodeChange,
  onLanguageChange,
  onAnalyze,
  loading,
  analysisData,
}) {
  const editorRef = useRef(null)
  const [decorations, setDecorations] = useState([])
  const [detectedLang, setDetectedLang] = useState(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const detected = detectLanguage(code)
      setDetectedLang(detected)
    }, 500)
    return () => clearTimeout(timer)
  }, [code])

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor

    // Configure theme
    monaco.editor.defineTheme('neurocode-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '4B5563', fontStyle: 'italic' },
        { token: 'keyword', foreground: '818CF8' },
        { token: 'string', foreground: '34D399' },
        { token: 'number', foreground: 'FCA5A5' },
        { token: 'type', foreground: '67E8F9' },
        { token: 'function', foreground: 'FDE68A' },
      ],
      colors: {
        'editor.background': '#0a0e1a',
        'editor.foreground': '#E2E8F0',
        'editor.lineHighlightBackground': '#1e293b40',
        'editor.selectionBackground': '#312e8150',
        'editorLineNumber.foreground': '#334155',
        'editorLineNumber.activeForeground': '#6366f1',
        'editorCursor.foreground': '#818CF8',
        'editor.findMatchBackground': '#312e81aa',
        'editorGutter.background': '#0a0e1a',
        'scrollbarSlider.background': '#1e1b4b50',
        'scrollbarSlider.hoverBackground': '#312e8180',
      },
    })
    monaco.editor.setTheme('neurocode-dark')
  }

  // Apply confusion hotspot decorations
  const applyDecorations = (editor, monaco, analysis) => {
    if (!editor || !monaco || !analysis) return

    const newDecorations = analysis
      .filter(item => item.confusion_hotspot)
      .map(item => ({
        range: new monaco.Range(item.line, 1, item.line, 1),
        options: {
          isWholeLine: true,
          className: 'confusion-hotspot-line',
          glyphMarginClassName: 'confusion-glyph',
          overviewRuler: { color: '#ef4444', position: 4 },
          minimap: { color: '#ef4444', position: 1 },
        },
      }))

    const ids = editor.deltaDecorations(decorations, newDecorations)
    setDecorations(ids)
  }

  const handleFormat = async () => {
    if (editorRef.current) {
      await editorRef.current.getAction('editor.action.formatDocument')?.run()
    }
  }

  const loadSample = () => {
    const sample = SAMPLE_CODE[language] || SAMPLE_CODE.python
    onCodeChange(sample)
  }

  const currentLang = LANGUAGE_OPTIONS.find(l => l.value === language) || LANGUAGE_OPTIONS[0]

  return (
    <div className="flex flex-col h-full">
      {/* Editor toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-dark-900/60 border-b border-neural-800/40">
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="flex gap-1">
            {LANGUAGE_OPTIONS.map(lang => (
              <button
                key={lang.value}
                onClick={() => {
                  onLanguageChange(lang.value)
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  language === lang.value
                    ? 'bg-neural-600/70 text-white border border-neural-500/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/60 border border-transparent'
                }`}
              >
                <span>{lang.icon}</span>
                <span className="hidden sm:inline">{lang.label}</span>
              </button>
            ))}
          </div>

          {/* Language detection badge */}
          {detectedLang && detectedLang !== language && code.trim().length > 0 && (
            <div className="flex items-center gap-2 ml-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <span className="text-amber-400 text-xs">⚠ Detected:</span>
              <span className="text-amber-300 text-xs font-semibold capitalize">{detectedLang}</span>
              <button
                onClick={() => onLanguageChange(detectedLang)}
                className="text-[10px] text-amber-400 hover:text-amber-200 underline transition-colors"
              >
                Switch
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSample}
            className="text-xs text-slate-500 hover:text-neural-400 px-2 py-1 rounded transition-colors"
            title="Load sample code"
          >
            Sample
          </button>
          <button
            onClick={handleFormat}
            className="text-xs text-slate-500 hover:text-neural-400 px-2 py-1 rounded transition-colors"
            title="Format code"
          >
            Format
          </button>
          <div className="w-px h-4 bg-slate-700" />
          <div className="flex gap-1 text-xs text-slate-600 font-mono">
            <span>{code.split('\n').length}L</span>
            <span>·</span>
            <span>{code.length}C</span>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language === 'cpp' ? 'cpp' : language}
          value={code}
          onChange={(value) => onCodeChange(value || '')}
          onMount={handleEditorMount}
          options={{
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            minimap: { enabled: true, maxColumn: 60 },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            bracketPairColorization: { enabled: true },
            guides: { indentation: true, bracketPairs: true },
            renderLineHighlight: 'all',
            padding: { top: 16, bottom: 16 },
            glyphMargin: true,
            folding: true,
            selectOnLineNumbers: true,
            automaticLayout: true,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>

      {/* Analyze button */}
      <div className="p-4 bg-dark-900/40 border-t border-neural-800/40">
        <button
          onClick={onAnalyze}
          disabled={loading || !code.trim()}
          className="w-full btn-primary flex items-center justify-center gap-3 py-3 text-sm"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Analyzing with AI...</span>
              <div className="loading-dots flex gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
              </div>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span>Analyze with NeuroCode AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
