"use client";
import { useEffect, useRef } from "react";
import type { editor as MonacoEditor } from "monaco-editor";

interface SimpleEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
}

export default function SimpleCodeEditor({ value, onChange, language, height = "380px" }: SimpleEditorProps) {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    import("monaco-editor").then((monaco) => {
      if (cancelled || !containerRef.current) return;

      // Clean up previous editor
      if (editorRef.current) {
        editorRef.current.dispose();
      }

      const editor = monaco.editor.create(containerRef.current, {
        value: valueRef.current,
        language: language === "cpp" ? "cpp" : language,
        theme: "vs-dark",
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        padding: { top: 12 },
        fontFamily: "'Fira Code', 'Cascadia Code', monospace",
        automaticLayout: true,
      });

      editor.onDidChangeModelContent(() => {
        onChange(editor.getValue());
      });

      editorRef.current = editor;
    });

    return () => {
      cancelled = true;
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Sync external value changes (e.g. sample code loading)
  useEffect(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== value) {
        editorRef.current.setValue(value);
      }
    }
  }, [value]);

  return <div ref={containerRef} style={{ height, width: "100%" }} />;
}
