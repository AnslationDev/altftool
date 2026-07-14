"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toaster, toast } from "sonner";

import useHydrated from "@/hooks/useHydrated";
import { TEMPLATES, templateByName } from "../utils/templates";
import { DEFAULT_CODE, DEFAULT_SETTINGS, STORAGE_KEYS } from "../utils/defaults";
import { loadValue, saveValue, uid } from "../utils/storage";
import { buildSrcDoc } from "../utils/compile";
import {
  beautifyHtml,
  beautifyCss,
  beautifyJs,
  minifyHtml,
  minifyCss,
  minifyJs,
} from "../utils/format";
import { downloadFile, downloadProjectZip, parseUploadedFiles } from "../utils/download";

import Toolbar from "../components/Toolbar";
import CodeEditor from "../components/CodeEditor";
import PreviewPane, { DEVICES } from "../components/PreviewPane";
import ConsolePanel from "../components/ConsolePanel";
import StatusBar from "../components/StatusBar";
import TemplatesModal from "../components/TemplatesModal";
import SettingsModal from "../components/SettingsModal";
import ProjectsModal from "../components/ProjectsModal";
import Modal from "../components/Modal";

const TABS = [
  { key: "html", label: "HTML" },
  { key: "css", label: "CSS" },
  { key: "js", label: "JavaScript" },
];

function effectiveThemeOf(theme, systemDark) {
  if (theme === "system") return systemDark ? "dark" : "light";
  return theme;
}

export default function ToolHome() {
  const hydrated = useHydrated();
  const bridgeToken = useMemo(() => uid(), []);

  const [code, setCode] = useState(DEFAULT_CODE);
  const [previewCode, setPreviewCode] = useState(DEFAULT_CODE);
  const [activeTab, setActiveTab] = useState("html");

  const [projectName, setProjectName] = useState("Untitled Project");
  const [projectId, setProjectId] = useState(() => uid());

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [theme, setTheme] = useState("system");

  const [consoleLogs, setConsoleLogs] = useState([]);
  const [consoleOpen, setConsoleOpen] = useState(true);

  const [device, setDevice] = useState("desktop");
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [leftWidth, setLeftWidth] = useState(52);
  const [dragging, setDragging] = useState(false);

  const [systemDark, setSystemDark] = useState(false);
  const [memory, setMemory] = useState(null);
  const [autosaved, setAutosaved] = useState(true);

  const [modals, setModals] = useState({
    templates: false,
    projects: false,
    settings: false,
  });

  const effectiveTheme = effectiveThemeOf(theme, systemDark);
  const editorTheme = effectiveTheme === "dark" ? "dark" : "light";

  const srcDoc = useMemo(
    () =>
      buildSrcDoc({
        html: previewCode.html,
        css: previewCode.css,
        js: previewCode.js,
        bridgeToken,
      }),
    [previewCode.html, previewCode.css, previewCode.js, bridgeToken]
  );

  // ----- System theme tracking -------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // ----- Memory polling (Chromium only) -----------------------------------
  useEffect(() => {
    const tick = () => {
      const m =
        typeof performance !== "undefined" && performance.memory
          ? performance.memory.usedJSHeapSize / 1048576
          : null;
      setMemory(m);
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, []);

  // ----- Restore saved state ---------------------------------------------
  useEffect(() => {
    if (!hydrated) return;
    const apply = () => {
      const cur = loadValue(STORAGE_KEYS.current, null);
      if (!cur) return;
      if (cur.code) setCode(cur.code);
      if (cur.code) setPreviewCode(cur.code);
      if (cur.projectName) setProjectName(cur.projectName);
      if (cur.projectId) setProjectId(cur.projectId);
      if (cur.settings) setSettings((s) => ({ ...s, ...cur.settings }));
      if (cur.theme) setTheme(cur.theme);
      if (typeof cur.layout === "number") setLeftWidth(cur.layout);
    };
    apply();
  }, [hydrated]);

  // ----- Console bridge ---------------------------------------------------
  useEffect(() => {
    const handler = (e) => {
      const d = e.data;
      if (!d || d.__oc !== bridgeToken) return;
      if (d.type === "console" || d.type === "error") {
        setConsoleLogs((prev) =>
          [...prev, { level: d.level, text: d.text, time: d.time }].slice(-200)
        );
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [bridgeToken]);

  // ----- Auto-run (debounced) --------------------------------------------
  useEffect(() => {
    if (!hydrated) return;
    if (!settings.autoRun) return;
    const t = setTimeout(() => setPreviewCode(code), settings.runDelay);
    return () => clearTimeout(t);
  }, [code, settings.autoRun, settings.runDelay, hydrated]);

  // ----- Autosave (debounced) --------------------------------------------
  useEffect(() => {
    if (!hydrated) return;
    if (!settings.autoSave) {
      const markSaved = () => setAutosaved(true);
      markSaved();
      return;
    }
    const markUnsaved = () => setAutosaved(false);
    markUnsaved();
    const id = setTimeout(() => {
      const persist = () => {
        saveValue(STORAGE_KEYS.current, {
          code,
          projectName,
          projectId,
          settings,
          theme,
          layout: leftWidth,
        });
        const list = loadValue(STORAGE_KEYS.projects, []);
        const existing = list.find((p) => p.id === projectId);
        const entry = {
          id: projectId,
          name: projectName,
          html: code.html,
          css: code.css,
          js: code.js,
          favorite: existing?.favorite || false,
          createdAt: existing?.createdAt || Date.now(),
          updatedAt: Date.now(),
        };
        const next = [entry, ...list.filter((p) => p.id !== projectId)].slice(0, 50);
        saveValue(STORAGE_KEYS.projects, next);
        setAutosaved(true);
      };
      persist();
    }, 600);
    return () => clearTimeout(id);
  }, [hydrated, settings.autoSave, code, projectName, projectId, settings, theme, leftWidth]);

  // ----- Actions ----------------------------------------------------------
  const updateCode = useCallback((key, value) => {
    setCode((prev) => ({ ...prev, [key]: value }));
  }, []);

  const runNow = useCallback(() => setPreviewCode(code), [code]);

  const clearCode = useCallback(() => {
    setCode({ html: "", css: "", js: "" });
    setPreviewCode({ html: "", css: "", js: "" });
  }, []);

  const resetCode = useCallback(() => {
    setCode(DEFAULT_CODE);
    setPreviewCode(DEFAULT_CODE);
    toast.success("Reset to default");
  }, []);

  const applyTemplate = useCallback((name) => {
    const t = templateByName(name);
    if (!t) return;
    setCode({ html: t.html, css: t.css, js: t.js });
    setPreviewCode({ html: t.html, css: t.css, js: t.js });
    setModals((m) => ({ ...m, templates: false }));
    toast.success(`Loaded "${name}"`);
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme((t) => (t === "system" ? "dark" : t === "dark" ? "light" : "system"));
  }, []);

  const copyAll = useCallback(async () => {
    const joined = `<!-- HTML -->\n${code.html}\n\n/* CSS */\n${code.css}\n\n/* JS */\n${code.js}`;
    try {
      await navigator.clipboard.writeText(joined);
      toast.success("All code copied");
    } catch {
      toast.error("Copy failed");
    }
  }, [code]);

  const handleFormat = useCallback(
    (lang) => {
      const map = { html: beautifyHtml, css: beautifyCss, javascript: beautifyJs };
      const fn = map[lang];
      if (!fn) return;
      setCode((prev) => ({ ...prev, [lang === "javascript" ? "js" : lang]: fn(prev[lang === "javascript" ? "js" : lang], settings.tabSize) }));
      toast.success(`Formatted ${lang === "javascript" ? "JavaScript" : lang}`);
    },
    [settings.tabSize]
  );

  const beautifyAll = useCallback(() => {
    setCode((prev) => ({
      html: beautifyHtml(prev.html, settings.tabSize),
      css: beautifyCss(prev.css, settings.tabSize),
      js: beautifyJs(prev.js, settings.tabSize),
    }));
    toast.success("Beautified all");
  }, [settings.tabSize]);

  const minifyAll = useCallback(() => {
    setCode((prev) => ({
      html: minifyHtml(prev.html),
      css: minifyCss(prev.css),
      js: minifyJs(prev.js),
    }));
    toast.success("Minified all");
  }, []);

  const downloadHtml = useCallback(
    () => downloadFile(`${projectName || "project"}.html`, previewCode.html, "text/html"),
    [projectName, previewCode.html]
  );
  const downloadCss = useCallback(
    () => downloadFile(`${projectName || "project"}.css`, previewCode.css, "text/css"),
    [projectName, previewCode.css]
  );
  const downloadJs = useCallback(
    () => downloadFile(`${projectName || "project"}.js`, previewCode.js, "text/javascript"),
    [projectName, previewCode.js]
  );
  const downloadZip = useCallback(
    () => downloadProjectZip(projectName, previewCode),
    [projectName, previewCode]
  );

  const handleUpload = useCallback(
    async (files) => {
      if (!files || !files.length) return;
      const res = await parseUploadedFiles(files);
      const next = {};
      if (res.html) next.html = res.html;
      if (res.css) next.css = res.css;
      if (res.js) next.js = res.js;
      if (Object.keys(next).length) {
        setCode((prev) => ({ ...prev, ...next }));
        setPreviewCode((prev) => ({ ...prev, ...next }));
        if (res.name) setProjectName(res.name);
        toast.success("Project imported");
      } else {
        toast.error("No compatible files found");
      }
    },
    []
  );

  // ----- Projects management ---------------------------------------------
  const openProject = useCallback((p) => {
    setProjectId(p.id);
    setProjectName(p.name);
    const next = { html: p.html, css: p.css, js: p.js };
    setCode(next);
    setPreviewCode(next);
    setModals((m) => ({ ...m, projects: false }));
    toast.success(`Opened "${p.name}"`);
  }, []);

  const newProject = useCallback(() => {
    setProjectId(uid());
    setProjectName("Untitled Project");
    setCode(DEFAULT_CODE);
    setPreviewCode(DEFAULT_CODE);
    setModals((m) => ({ ...m, projects: false }));
  }, []);

  const duplicateProject = useCallback(
    (id) => {
      const list = loadValue(STORAGE_KEYS.projects, []);
      const src = list.find((p) => p.id === id);
      if (!src) return;
      const copy = { ...src, id: uid(), name: `${src.name} (copy)`, updatedAt: Date.now() };
      saveValue(STORAGE_KEYS.projects, [copy, ...list]);
      toast.success("Project duplicated");
    },
    []
  );

  const deleteProject = useCallback((id) => {
    const list = loadValue(STORAGE_KEYS.projects, []);
    saveValue(STORAGE_KEYS.projects, list.filter((p) => p.id !== id));
    toast.success("Project deleted");
  }, []);

  const toggleFavorite = useCallback((id) => {
    const list = loadValue(STORAGE_KEYS.projects, []);
    saveValue(
      STORAGE_KEYS.projects,
      list.map((p) => (p.id === id ? { ...p, favorite: !p.favorite } : p))
    );
  }, []);

  // ----- Keyboard shortcuts ----------------------------------------------
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        runNow();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runNow]);

  // ----- Resizer ----------------------------------------------------------
  const containerRef = useRef(null);
  const startDrag = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(true);
      const move = (ev) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
        const pct = Math.min(80, Math.max(20, (x / rect.width) * 100));
        setLeftWidth(pct);
      };
      const up = () => {
        setDragging(false);
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
        window.removeEventListener("touchmove", move);
        window.removeEventListener("touchend", up);
      };
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
      window.addEventListener("touchmove", move);
      window.addEventListener("touchend", up);
    },
    []
  );

  const activeCode = code[activeTab];
  const projects = hydrated ? loadValue(STORAGE_KEYS.projects, []) : [];

  return (
    <div
      data-theme={effectiveTheme}
      className="flex h-screen flex-col bg-(--background) text-(--foreground)"
    >
      <Toaster position="top-center" richColors />

      <Toolbar
        projectName={projectName}
        onRename={setProjectName}
        onRun={runNow}
        autoRun={settings.autoRun}
        onToggleAutoRun={() => setSettings((s) => ({ ...s, autoRun: !s.autoRun }))}
        onClear={clearCode}
        onReset={resetCode}
        onOpenTemplates={() => setModals((m) => ({ ...m, templates: true }))}
        onOpenProjects={() => setModals((m) => ({ ...m, projects: true }))}
        onDownloadHtml={downloadHtml}
        onDownloadCss={downloadCss}
        onDownloadJs={downloadJs}
        onDownloadZip={downloadZip}
        onUpload={handleUpload}
        onCopyAll={copyAll}
        onFormat={handleFormat}
        onBeautifyAll={beautifyAll}
        onMinifyAll={minifyAll}
        onToggleConsole={() => setConsoleOpen((v) => !v)}
        consoleOpen={consoleOpen}
        theme={theme}
        onCycleTheme={cycleTheme}
        onToggleFullscreen={() => setFullscreen((v) => !v)}
        fullscreen={fullscreen}
        onRefresh={runNow}
        onOpenSettings={() => setModals((m) => ({ ...m, settings: true }))}
      />

      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {!fullscreen && (
          <div
            className="flex min-w-0 flex-col border-r border-(--border)"
            style={{ width: `${leftWidth}%` }}
          >
            <div className="flex items-center gap-1 border-b border-(--border) bg-(--card) px-2 py-1.5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`rounded-md px-3 py-1 text-sm font-medium transition ${
                    activeTab === t.key
                      ? "bg-(--primary) text-(--primary-foreground)"
                      : "text-(--muted-foreground) hover:bg-(--muted)"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1">
              <CodeEditor
                language={activeTab}
                value={code[activeTab]}
                onChange={(val) => updateCode(activeTab, val)}
                theme={editorTheme}
                fontSize={settings.fontSize}
                tabSize={settings.tabSize}
                wordWrap={settings.wordWrap}
                minimap={settings.minimap}
              />
            </div>

            <StatusBar
              code={activeCode}
              autosaved={autosaved}
              memory={memory}
              language={activeTab}
            />
          </div>
        )}

        {!fullscreen && (
          <div
            onMouseDown={startDrag}
            onTouchStart={startDrag}
            className={`w-1.5 cursor-col-resize bg-(--border) transition-colors hover:bg-(--primary) ${
              dragging ? "bg-(--primary)" : ""
            }`}
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2 border-b border-(--border) bg-(--card) px-3 py-1.5">
            <span className="text-xs font-semibold text-(--muted-foreground)">Preview</span>
            <div className="flex items-center gap-1">
              {Object.keys(DEVICES).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDevice(d)}
                  className={`rounded-md px-2 py-1 text-xs transition ${
                    device === d
                      ? "bg-(--primary)/10 text-(--primary)"
                      : "text-(--muted-foreground) hover:bg-(--muted)"
                  }`}
                >
                  {DEVICES[d].label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-(--muted-foreground)">Zoom</span>
              <input
                type="range"
                min={0.4}
                max={1.5}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-24 accent-(--primary)"
              />
              <span className="w-10 text-right text-xs text-(--muted-foreground)">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            <PreviewPane
              srcDoc={srcDoc}
              reloadKey={previewCode.js + previewCode.html + previewCode.css}
              device={device}
              zoom={zoom}
            />
          </div>

          {consoleOpen && (
            <div className="h-48 border-t border-(--border)">
              <ConsolePanel logs={consoleLogs} onClear={() => setConsoleLogs([])} />
            </div>
          )}
        </div>
      </div>

      <TemplatesModal
        open={modals.templates}
        onClose={() => setModals((m) => ({ ...m, templates: false }))}
        onPick={applyTemplate}
      />
      <SettingsModal
        open={modals.settings}
        onClose={() => setModals((m) => ({ ...m, settings: false }))}
        settings={settings}
        onChange={setSettings}
      />
      <ProjectsModal
        open={modals.projects}
        onClose={() => setModals((m) => ({ ...m, projects: false }))}
        projects={projects}
        currentId={projectId}
        onOpen={openProject}
        onDelete={deleteProject}
        onToggleFavorite={toggleFavorite}
        onNew={newProject}
        onDuplicate={duplicateProject}
      />
    </div>
  );
}
