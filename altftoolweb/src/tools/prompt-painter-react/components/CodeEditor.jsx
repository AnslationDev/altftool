import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Code2, Settings } from "lucide-react";
export const CodeEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const [isDark, setIsDark] = useState(true);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);
  const handleEditorDidMount = (editorInstance, monaco) => {
    try {
      editorRef.current = editorInstance;
      setIsEditorReady(true);
      setError(null);
      editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        const event = new CustomEvent("format-code");
        document.dispatchEvent(event);
      });
      editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
        const event = new CustomEvent("clear-code");
        document.dispatchEvent(event);
      });
      editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyC, () => {
        const event = new CustomEvent("copy-code");
        document.dispatchEvent(event);
      });
      monaco.editor.defineTheme("tailwind-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "tag", foreground: "ff6b6b", fontStyle: "bold" },
          { token: "attribute.name", foreground: "4ecdc4", fontStyle: "italic" },
          { token: "attribute.value", foreground: "45b7d1" },
          { token: "string", foreground: "98d8c8" },
          { token: "comment", foreground: "6272a4", fontStyle: "italic" },
          { token: "keyword", foreground: "ff79c6", fontStyle: "bold" }
        ],
        colors: {
          "editor.background": "#0f172a",
          "editor.foreground": "#e2e8f0",
          "editorLineNumber.foreground": "#64748b",
          "editorLineNumber.activeForeground": "#94a3b8",
          "editor.selectionBackground": "#334155",
          "editor.inactiveSelectionBackground": "#1e293b",
          "editorWidget.background": "#1e293b",
          "editorWidget.border": "#334155",
          "dropdown.background": "#1e293b"
        }
      });
      monaco.editor.setTheme(isDark ? "tailwind-dark" : "vs-dark");
      editorInstance.updateOptions({
        fontSize: 14,
        fontFamily: '"Fira Code", "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
        lineHeight: 22,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        formatOnPaste: true,
        formatOnType: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: {
          other: true,
          comments: false,
          strings: true
        },
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          indentation: true
        },
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        contextmenu: true,
        mouseWheelZoom: true,
        renderWhitespace: "boundary",
        renderControlCharacters: false
      });
    } catch (err) {
      console.error("Error mounting editor:", err);
      setError("Failed to initialize code editor. Please refresh the page.");
    }
  };
  useEffect(() => {
    if (isEditorReady && editorRef.current) {
      try {
        const win = window;
        if (win.monaco) {
          win.monaco.editor.setTheme(isDark ? "tailwind-dark" : "vs-dark");
        }
      } catch (err) {
        console.error("Error updating theme:", err);
      }
    }
  }, [isDark, isEditorReady]);
  const handleEditorChange = (val) => {
    onChange(val || "");
  };
  return <div className="h-full glass-panel rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {
    /* Header */
  }
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            <span className="w-3 h-3 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.2s" }} />
            <span className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
            <Code2 className="w-5 h-5 ml-2 text-primary" />
            <span className="text-gradient">HTML Editor</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Settings className="w-4 h-4" />
            <span>Monaco Editor</span>
          </div>
        </div>
      </div>

      {
    /* Error Message */
  }
      {error && <div className="p-4 bg-destructive/10 border-b border-destructive/20">
          <p className="text-destructive text-sm">{error}</p>
        </div>}

      {
    /* Editor Container */
  }
      <div className="flex-grow">
        <Editor
    height="100%"
    defaultLanguage="html"
    value={value}
    onChange={handleEditorChange}
    onMount={handleEditorDidMount}
    theme={isDark ? "tailwind-dark" : "vs-dark"}
    options={{
      fontSize: 14,
      fontFamily: '"Fira Code", "SF Mono", "Monaco", "Inconsolata", "Roboto Mono", monospace',
      lineHeight: 22,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: "on",
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true
      },
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true
      },
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      smoothScrolling: true,
      contextmenu: true,
      mouseWheelZoom: true,
      renderWhitespace: "boundary",
      renderControlCharacters: false
    }}
    loading={<div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              <span className="ml-3 text-foreground">Loading editor...</span>
            </div>}
  />
      </div>
    </div>;
};
