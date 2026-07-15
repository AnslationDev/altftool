"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import Controls from "../components/Controls";
import Effects from "../components/Effects";
import Preview from "../components/Preview";
import CodePanel from "../components/CodePanel";
import StatsHistory from "../components/StatsHistory";
import Footer from "../components/Footer";
import {
  defaultSettings,
  generateCss,
  countCssProperties,
  getGoogleFontUrl,
  STORAGE_KEY,
  HISTORY_KEY,
} from "../utils/typographyUtils";

export default function ToolHome() {
  const previewRef = useRef(null);
  const [settings, setSettings] = useState(() => {
    if (typeof window === "undefined") return defaultSettings;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved ? { ...defaultSettings, ...saved } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });
  const [undoStack, setUndoStack] = useState([]);
  const [history, setHistory] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const savedHistory = JSON.parse(localStorage.getItem(HISTORY_KEY));
      return Array.isArray(savedHistory) ? savedHistory.slice(0, 6) : [];
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(0);

  const css = useMemo(() => generateCss(settings), [settings]);
  const fontUrl = useMemo(() => getGoogleFontUrl(settings), [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!fontUrl) return;
    const id = `font-css-${settings.fontFamily.replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = fontUrl;
    document.head.appendChild(link);
  }, [fontUrl, settings.fontFamily]);

  useEffect(() => {
    const measure = () => setPreviewWidth(Math.round(previewRef.current?.clientWidth || 0));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const commit = (next) => {
    setUndoStack((stack) => [settings, ...stack].slice(0, 20));
    setSettings(next);
  };

  const update = (field, value) => {
    commit({ ...settings, [field]: value });
  };

  const saveHistory = (nextSettings = settings) => {
    const item = { id: `${Date.now()}`, settings: nextSettings };
    const next = [item, ...history].slice(0, 6);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  };

  const copyCss = async () => {
    await navigator.clipboard.writeText(css);
    setCopied(true);
    saveHistory();
    setTimeout(() => setCopied(false), 1400);
  };

  const downloadCss = () => {
    const blob = new Blob([css], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "style.css";
    anchor.click();
    URL.revokeObjectURL(url);
    saveHistory();
  };

  const stats = [
    { label: "Characters", value: settings.text.length },
    { label: "Font Size", value: settings.responsive ? "clamp" : `${settings.fontSize}${settings.fontSizeUnit}` },
    { label: "Properties", value: countCssProperties(css) },
    { label: "Preview", value: `${previewWidth}px` },
    { label: "CSS Chars", value: css.length },
  ];

  return (
    <div className="font-css-studio px-2 sm:px-4 py-6">
      <Header />
      <div className="max-w-7xl mx-auto grid xl:grid-cols-[minmax(300px,420px)_1fr] gap-5">
        <div className="space-y-5 min-w-0">
          <Controls
            settings={settings}
            update={update}
            canUndo={undoStack.length > 0}
            undo={() => {
              const [previous, ...rest] = undoStack;
              if (previous) {
                setSettings(previous);
                setUndoStack(rest);
              }
            }}
            reset={() => commit(defaultSettings)}
            applyPreset={(preset) => commit({ ...settings, ...preset.settings })}
          />
          <Effects settings={settings} update={update} />
        </div>
        <div className="space-y-5 min-w-0">
          <Preview settings={settings} previewRef={previewRef} />
          <CodePanel css={css} copied={copied} onCopy={copyCss} onDownload={downloadCss} />
          <StatsHistory stats={stats} history={history} onApplyHistory={(item) => commit({ ...defaultSettings, ...item })} />
        </div>
      </div>
      <div className="max-w-7xl mx-auto">
        <Footer />
      </div>
    </div>
  );
}
