"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Sparkles, Eraser, Minimize2, WandSparkles, Copy, Check, Code2, Eye, Download } from "lucide-react";

const TOOLBAR_BUTTON_CLASS =
  "inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) bg-(--background) px-3 py-1.5 text-xs font-medium text-(--foreground) transition-colors hover:border-(--primary) hover:text-(--primary) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-(--border) disabled:hover:text-(--foreground)";

export default function CodeEditorPanel({ html, onChange, onFormat, onMinify, onClear, onSample, onCopy, onDownload }) {
  const [mobileView, setMobileView] = useState("code");
  const [isDark, setIsDark] = useState(true);
  const [copied, setCopied] = useState(false);
  const editorContainerRef = useRef(null);
  const editorInstanceRef = useRef(null);

  useEffect(() => {
    const checkTheme = () => setIsDark(document.documentElement.getAttribute("data-theme") !== "light");
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // Monaco's own `automaticLayout` option occasionally misses the container's
  // real size when it first settles inside a flex/grid layout like this one,
  // leaving the editor rendered at a collapsed few pixels. Measuring the
  // container ourselves and driving `.layout({width,height})` explicitly —
  // both right after mount and on every ResizeObserver tick — is the
  // reliable fix (calling `.layout()` with no args too early just re-confirms
  // whatever collapsed size the container happened to have at that instant).
  function relayoutEditor() {
    const editor = editorInstanceRef.current;
    const container = editorContainerRef.current;
    if (!editor || !container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      editor.layout({ width: rect.width, height: rect.height });
    }
  }

  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return undefined;
    const observer = new ResizeObserver(() => relayoutEditor());
    observer.observe(container);
    return () => observer.disconnect();
  }, [mobileView]);

  function handleEditorDidMount(editorInstance, monaco) {
    editorInstanceRef.current = editorInstance;
    monaco.editor.defineTheme("email-checker-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0f172a",
        "editor.foreground": "#e2e8f0",
        "editorLineNumber.foreground": "#64748b",
        "editorLineNumber.activeForeground": "#94a3b8",
      },
    });
    monaco.editor.setTheme(isDark ? "email-checker-dark" : "vs");
    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => onFormat());
    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => onClear());
    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyC, () => handleCopy());
    editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyM, () => onMinify());
    // requestAnimationFrame can be paused indefinitely for a backgrounded/
    // unfocused tab, so the initial re-layout is driven by real timers
    // (staggered a few times in case the container is still settling).
    [0, 60, 200, 500].forEach((delay) => window.setTimeout(relayoutEditor, delay));
  }

  async function handleCopy() {
    onCopy();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2 border-b border-(--border) bg-(--card)/60 p-3">
      <button type="button" onClick={onSample} className={TOOLBAR_BUTTON_CLASS}>
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Sample
      </button>
      <button
        type="button"
        onClick={onFormat}
        disabled={!html.trim()}
        className={TOOLBAR_BUTTON_CLASS}
        aria-keyshortcuts="Control+S Meta+S"
      >
        <WandSparkles className="h-3.5 w-3.5" aria-hidden="true" /> Beautify
        <span className="hidden text-[10px] text-(--muted-foreground) lg:inline">⌘S</span>
      </button>
      <button
        type="button"
        onClick={onMinify}
        disabled={!html.trim()}
        className={TOOLBAR_BUTTON_CLASS}
        aria-keyshortcuts="Control+Shift+M Meta+Shift+M"
      >
        <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" /> Minify
        <span className="hidden text-[10px] text-(--muted-foreground) lg:inline">⌘⇧M</span>
      </button>
      <button
        type="button"
        onClick={handleCopy}
        disabled={!html.trim()}
        className={TOOLBAR_BUTTON_CLASS}
        aria-keyshortcuts="Control+Shift+C Meta+Shift+C"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-success" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button type="button" onClick={onDownload} disabled={!html.trim()} className={TOOLBAR_BUTTON_CLASS}>
        <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download
      </button>
      <button
        type="button"
        onClick={onClear}
        className={`${TOOLBAR_BUTTON_CLASS} ml-auto hover:border-danger hover:text-danger`}
        aria-keyshortcuts="Control+K Meta+K"
      >
        <Eraser className="h-3.5 w-3.5" aria-hidden="true" /> Clear
        <span className="hidden text-[10px] text-(--muted-foreground) lg:inline">⌘K</span>
      </button>
    </div>
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-(--card-border) bg-(--card)/80 shadow-lg backdrop-blur-xl">
      {toolbar}

      <div className="flex gap-2 border-b border-(--border) px-3 py-2 md:hidden">
        <button
          type="button"
          onClick={() => setMobileView("code")}
          className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium ${mobileView === "code" ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--muted) text-(--muted-foreground)"}`}
        >
          <Code2 className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> Code
        </button>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium ${mobileView === "preview" ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--muted) text-(--muted-foreground)"}`}
        >
          <Eye className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> Preview
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
        <div className={`min-h-0 flex-col border-(--border) md:flex md:border-r ${mobileView === "code" ? "flex" : "hidden"}`}>
          <div className="shrink-0 border-b border-(--border) px-3 py-1.5 text-xs font-semibold text-(--muted-foreground)">HTML Source</div>
          <div ref={editorContainerRef} className="min-h-0 flex-1">
            <Editor
              height="100%"
              defaultLanguage="html"
              value={html}
              onChange={(val) => onChange(val ?? "")}
              onMount={handleEditorDidMount}
              theme={isDark ? "email-checker-dark" : "vs"}
              options={{
                fontSize: 13,
                fontFamily: '"Fira Code", "SF Mono", Monaco, Consolas, monospace',
                lineNumbers: "on",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                renderWhitespace: "boundary",
                bracketPairColorization: { enabled: true },
              }}
              loading={
                <div className="flex h-full items-center justify-center gap-2 text-sm text-(--muted-foreground)">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-(--primary) border-t-transparent" />
                  Loading editor…
                </div>
              }
            />
          </div>
        </div>

        <div className={`min-h-0 flex-col md:flex ${mobileView === "preview" ? "flex" : "hidden"}`}>
          <div className="shrink-0 border-b border-(--border) px-3 py-1.5 text-xs font-semibold text-(--muted-foreground)">Live Preview</div>
          <iframe
            title="Email HTML preview"
            srcDoc={
              html.trim()
                ? html
                : '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#94a3b8;">Your live preview will appear here</div>'
            }
            sandbox=""
            className="min-h-0 flex-1 bg-white"
          />
        </div>
      </div>
    </div>
  );
}
