"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  RefreshCw,
  Trash2,
  RotateCcw,
  LayoutTemplate,
  FolderOpen,
  Download,
  Upload,
  Settings,
  Sun,
  Moon,
  Monitor,
  Maximize2,
  Terminal,
  FileCode2,
  FileJson,
  FileType,
  FileArchive,
  ChevronDown,
} from "lucide-react";

function Dropdown({ icon: Icon, label, children, title }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        title={title}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1.5 text-sm text-(--foreground) transition hover:bg-(--muted)"
      >
        <Icon size={15} />
        {label && <span className="hidden sm:inline">{label}</span>}
        <ChevronDown size={13} className="opacity-60" />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-(--border) bg-(--card) py-1 shadow-lg">
          {children(setOpen)}
        </div>
      )}
    </div>
  );
}

function Item({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-(--foreground) transition hover:bg-(--muted)"
    >
      <Icon size={15} className="text-(--muted-foreground)" />
      {label}
    </button>
  );
}

export default function Toolbar({
  projectName,
  onRename,
  onRun,
  autoRun,
  onToggleAutoRun,
  onClear,
  onReset,
  onOpenTemplates,
  onOpenProjects,
  onDownloadHtml,
  onDownloadCss,
  onDownloadJs,
  onDownloadZip,
  onUpload,
  onCopyAll,
  onFormat,
  onBeautifyAll,
  onMinifyAll,
  onToggleConsole,
  consoleOpen,
  theme,
  onCycleTheme,
  onToggleFullscreen,
  fullscreen,
  onRefresh,
  onOpenSettings,
}) {
  const fileRef = useRef(null);
  const themeIcon =
    theme === "dark" ? <Moon size={15} /> : theme === "light" ? <Sun size={15} /> : <Monitor size={15} />;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-(--border) bg-(--card) px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-(--primary)">
          <FileCode2 size={18} />
        </span>
        <input
          value={projectName}
          onChange={(e) => onRename(e.target.value)}
          spellCheck={false}
          className="w-40 rounded-md border border-transparent bg-transparent px-1 py-1 text-sm font-semibold text-(--foreground) outline-none transition hover:border-(--border) focus:border-(--primary)"
          aria-label="Project name"
        />
      </div>

      <div className="mx-1 h-5 w-px bg-(--border)" />

      <button
        type="button"
        onClick={onRun}
        title="Run (Ctrl+S)"
        className="flex items-center gap-1.5 rounded-lg bg-(--primary) px-3 py-1.5 text-sm font-semibold text-(--primary-foreground) transition hover:opacity-90 active:scale-95"
      >
        <Play size={15} /> Run
      </button>

      <button
        type="button"
        onClick={onToggleAutoRun}
        title="Toggle auto-run"
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition active:scale-95 ${
          autoRun
            ? "border-(--primary) bg-(--primary)/10 text-(--primary)"
            : "border-(--border) text-(--muted-foreground)"
        }`}
      >
        Auto
      </button>

      <button
        type="button"
        onClick={onRefresh}
        title="Refresh preview"
        className="flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1.5 text-sm text-(--foreground) transition hover:bg-(--muted)"
      >
        <RefreshCw size={15} />
      </button>

      <button
        type="button"
        onClick={onClear}
        title="Clear code"
        className="flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1.5 text-sm text-(--foreground) transition hover:bg-(--muted)"
      >
        <Trash2 size={15} />
      </button>

      <button
        type="button"
        onClick={onReset}
        title="Reset to default"
        className="flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1.5 text-sm text-(--foreground) transition hover:bg-(--muted)"
      >
        <RotateCcw size={15} /> Reset
      </button>

      <div className="mx-1 h-5 w-px bg-(--border)" />

      <button
        type="button"
        onClick={onOpenTemplates}
        className="flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1.5 text-sm text-(--foreground) transition hover:bg-(--muted)"
      >
        <LayoutTemplate size={15} /> Templates
      </button>

      <button
        type="button"
        onClick={onOpenProjects}
        className="flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1.5 text-sm text-(--foreground) transition hover:bg-(--muted)"
      >
        <FolderOpen size={15} /> Projects
      </button>

      <div className="ml-auto flex items-center gap-2">
        <Dropdown icon={Download} title="Download">
          {(close) => (
            <>
              <Item icon={FileType} label="Download HTML" onClick={() => { onDownloadHtml(); close(false); }} />
              <Item icon={FileJson} label="Download CSS" onClick={() => { onDownloadCss(); close(false); }} />
              <Item icon={FileCode2} label="Download JS" onClick={() => { onDownloadJs(); close(false); }} />
              <Item icon={FileArchive} label="Download .zip" onClick={() => { onDownloadZip(); close(false); }} />
              <div className="my-1 border-t border-(--border)" />
              <Item icon={FileCode2} label="Copy all code" onClick={() => { onCopyAll(); close(false); }} />
            </>
          )}
        </Dropdown>

        <Dropdown icon={FileCode2} title="Format" label="Format">
          {(close) => (
            <>
              <Item icon={FileType} label="Format HTML" onClick={() => { onFormat("html"); close(false); }} />
              <Item icon={FileJson} label="Format CSS" onClick={() => { onFormat("css"); close(false); }} />
              <Item icon={FileCode2} label="Format JS" onClick={() => { onFormat("javascript"); close(false); }} />
              <div className="my-1 border-t border-(--border)" />
              <Item icon={FileCode2} label="Beautify all" onClick={() => { onBeautifyAll(); close(false); }} />
              <Item icon={FileCode2} label="Minify all" onClick={() => { onMinifyAll(); close(false); }} />
            </>
          )}
        </Dropdown>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Upload project"
          className="flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1.5 text-sm text-(--foreground) transition hover:bg-(--muted)"
        >
          <Upload size={15} /> Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".html,.htm,.css,.js,.zip"
          multiple
          className="hidden"
          onChange={(e) => {
            onUpload(e.target.files);
            e.target.value = "";
          }}
        />

        <button
          type="button"
          onClick={onToggleConsole}
          title="Toggle console"
          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm transition hover:bg-(--muted) ${
            consoleOpen ? "border-(--primary) text-(--primary)" : "border-(--border) text-(--foreground)"
          }`}
        >
          <Terminal size={15} />
        </button>

        <button
          type="button"
          onClick={onCycleTheme}
          title="Theme"
          className="flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1.5 text-sm text-(--foreground) transition hover:bg-(--muted)"
        >
          {themeIcon}
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          title="Fullscreen preview"
          className="flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1.5 text-sm text-(--foreground) transition hover:bg-(--muted)"
        >
          <Maximize2 size={15} />
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          title="Settings"
          className="flex items-center gap-1 rounded-lg border border-(--border) px-2.5 py-1.5 text-sm text-(--foreground) transition hover:bg-(--muted)"
        >
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
}
