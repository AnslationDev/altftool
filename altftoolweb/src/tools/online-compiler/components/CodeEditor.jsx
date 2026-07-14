"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-(--muted-foreground)">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading editor…
    </div>
  ),
});

const LANG_MAP = {
  html: "html",
  css: "css",
  javascript: "javascript",
};

export default function CodeEditor({
  language,
  value,
  onChange,
  theme = "dark",
  fontSize = 14,
  tabSize = 2,
  wordWrap = true,
  minimap = true,
  onMount,
}) {
  const monacoTheme = theme === "light" ? "light" : "vs-dark";

  return (
    <div className="h-full w-full overflow-hidden">
      <MonacoEditor
        height="100%"
        theme={monacoTheme}
        language={LANG_MAP[language] || "html"}
        value={value}
        onChange={(val) => onChange(val ?? "")}
        onMount={onMount}
        options={{
          fontSize,
          tabSize,
          wordWrap: wordWrap ? "on" : "off",
          minimap: { enabled: minimap },
          lineNumbers: "on",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
          fontLigatures: true,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          renderLineHighlight: "all",
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true },
          folding: true,
          multiCursorModifier: "alt",
          formatOnPaste: true,
        }}
      />
    </div>
  );
}
