"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileCode2,
  FolderOpen,
  Import,
  Lock,
  Moon,
  MoreVertical,
  Plus,
  Search,
  Sparkles,
  Sun,
  Trash2,
  UploadCloud,
  Wand2,
  Zap,
} from "lucide-react";

const THEME_MODE_KEY = "appThemeMode";

function useLocalTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Deferred to an effect (rather than a lazy initializer) so the client's
    // first render matches the server-rendered markup and avoids a hydration
    // mismatch — the real theme is only known once `document` exists.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem(THEME_MODE_KEY, next);
    } catch {
      // theme preference persistence is best-effort
    }
    setIsDark(!isDark);
  };

  return [isDark, toggle];
}

function formatRelativeTime(timestamp) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

const FEATURE_BULLETS = [
  { icon: Zap, title: "Fast & Effortless", description: "Generate docs in minutes, not hours" },
  { icon: Code2, title: "Developer Friendly", description: "Clean, interactive & easy to use" },
  { icon: Lock, title: "Secure & Private", description: "Everything runs in your browser" },
];

// Static metadata only (no ref-touching closures) — handlers are attached
// inline in the component body so refs are read solely from event callbacks.
const QUICK_ACTIONS_META = [
  {
    key: "generate",
    icon: Wand2,
    title: "Generate from JSON",
    description: "Paste your endpoints as structured JSON",
    tint: "primary",
  },
  {
    key: "import",
    icon: UploadCloud,
    title: "Import API Spec",
    description: "Import from Swagger / OpenAPI / YAML",
    tint: "success",
  },
  {
    key: "scratch",
    icon: FileCode2,
    title: "Create from Scratch",
    description: "Start with a blank API documentation",
    tint: "warning",
  },
  {
    key: "guide",
    icon: BookOpen,
    title: "Documentation Guide",
    description: "Learn the expected JSON format",
    tint: "info",
  },
];

const WHY_LOVE_IT = [
  { title: "Interactive API explorer", description: "Try endpoints directly in the Preview tab" },
  { title: "Beautiful & themeable", description: "Looks great in light and dark mode" },
  { title: "Multiple export options", description: "JSON, YAML, Markdown, HTML & PDF" },
  { title: "Built-in analytics", description: "Latency estimates & endpoint health checks" },
];

const TINT_CLASSES = {
  primary: "bg-[var(--primary)]/10 text-[var(--primary)]",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
};

function ProjectRow({ project, onOpen, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group flex items-center gap-3 py-3 border-b border-[var(--border)] last:border-b-0">
      <button
        onClick={() => onOpen(project)}
        className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
      >
        <span className="shrink-0 w-9 h-9 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
          <FolderOpen size={16} />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[var(--foreground)] truncate">
              {project.title}
            </span>
            <span
              className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                project.status === "published"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)]"
              }`}
            >
              {project.status === "published" ? "Published" : "Draft"}
            </span>
          </span>
          <span className="block text-xs text-[var(--muted-foreground)] truncate">
            Updated {formatRelativeTime(project.updatedAt)} • {project.endpointCount}{" "}
            {project.endpointCount === 1 ? "endpoint" : "endpoints"}
          </span>
        </span>
      </button>

      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-1.5 rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
          aria-label="Project options"
        >
          <MoreVertical size={16} />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-8 z-20 w-32 rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg py-1">
              <button
                onClick={() => {
                  onOpen(project);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--foreground)] hover:bg-[var(--muted)] cursor-pointer"
              >
                <ExternalLink size={13} /> Open
              </button>
              <button
                onClick={() => {
                  onDelete(project.id);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-500/10 cursor-pointer"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Hero({
  recentProjects = [],
  onFileImport,
  onPostmanImport,
  onCreateNew,
  onGenerateShortcut,
  onOpenGuide,
  onOpenProject,
  onDeleteProject,
}) {
  const [isDark, toggleTheme] = useLocalTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [query, setQuery] = useState("");
  const [showAllProjects, setShowAllProjects] = useState(false);
  const specFileInputRef = useRef(null);
  const postmanFileInputRef = useRef(null);

  const filteredProjects = recentProjects.filter((p) =>
    p.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const visibleProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, 4);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileImport?.(file);
  };

  const quickActionHandlers = {
    generate: onGenerateShortcut,
    import: () => specFileInputRef.current?.click(),
    scratch: onCreateNew,
    guide: onOpenGuide,
  };
  const quickActions = QUICK_ACTIONS_META.map((action) => ({
    ...action,
    onClick: quickActionHandlers[action.key],
  }));

  return (
    <section className="w-full max-w-7xl mx-auto px-4 pt-6 sm:pt-10">
      <input
        ref={specFileInputRef}
        type="file"
        accept=".json,.yaml,.yml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileImport?.(file);
          e.target.value = "";
        }}
      />
      <input
        ref={postmanFileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPostmanImport?.(file);
          e.target.value = "";
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
        {/* Left — dark branding panel */}
        <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 sm:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-11 h-11 rounded-xl bg-[var(--primary)] flex items-center justify-center shrink-0">
              <BookOpen size={22} className="text-white" />
            </span>
            <div>
              <p className="font-bold leading-tight">API Documentation</p>
              <p className="text-sm text-slate-400 leading-tight">Maker</p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-[2.15rem] font-extrabold leading-[1.1] mb-3">
            Create Beautiful API Documentation in{" "}
            <span className="text-[var(--primary)]">Minutes</span>
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            Turn your API JSON, OpenAPI spec, or Postman collection into interactive,
            developer-friendly documentation — right in your browser.
          </p>

          <ul className="space-y-3 mb-6">
            {FEATURE_BULLETS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-[var(--primary)]" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{title}</span>
                  <span className="block text-xs text-slate-400">{description}</span>
                </span>
              </li>
            ))}
          </ul>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => specFileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            className={`mt-auto rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors mb-5 ${
              isDragging
                ? "border-[var(--primary)] bg-[var(--primary)]/10"
                : "border-white/20 hover:border-white/40"
            }`}
          >
            <span className="w-11 h-11 mx-auto rounded-full bg-[var(--primary)]/20 flex items-center justify-center mb-2">
              <UploadCloud size={20} className="text-[var(--primary)]" />
            </span>
            <p className="text-sm">
              Drop your OpenAPI / Swagger file here
              <br />
              or click to <span className="text-[var(--primary)] font-medium">browse</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">Supports: JSON, YAML</p>
          </div>

          <button
            onClick={onCreateNew}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-semibold py-2.5 mb-2.5 transition-opacity cursor-pointer"
          >
            <Plus size={16} /> New Documentation
          </button>
          <button
            onClick={() => postmanFileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium py-2.5 transition-colors cursor-pointer"
          >
            <Import size={16} /> Import from Postman
          </button>
        </div>

        {/* Right — dashboard */}
        <div className="flex flex-col gap-5 min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your recent projects..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="shrink-0 w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-center text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map(({ key, icon: Icon, title, description, tint, onClick }) => (
              <button
                key={key}
                onClick={onClick}
                className="text-left rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)]/50 hover:shadow-md transition-all cursor-pointer"
              >
                <span
                  className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${TINT_CLASSES[tint]}`}
                >
                  <Icon size={16} />
                </span>
                <span className="block text-sm font-semibold text-[var(--foreground)]">
                  {title}
                </span>
                <span className="block text-xs text-[var(--muted-foreground)] mt-0.5">
                  {description}
                </span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Recent projects */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)]">
                  <FolderOpen size={16} className="text-[var(--primary)]" /> Recent Projects
                </h2>
                {filteredProjects.length > 4 && (
                  <button
                    onClick={() => setShowAllProjects((v) => !v)}
                    className="text-xs font-medium text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    {showAllProjects ? "Show less" : "View all"}
                  </button>
                )}
              </div>

              {visibleProjects.length === 0 ? (
                <div className="py-8 text-center">
                  <FolderOpen size={24} className="mx-auto text-[var(--muted-foreground)] mb-2" />
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {recentProjects.length === 0
                      ? "No documentation yet — generate your first API docs to see it here."
                      : "No projects match your search."}
                  </p>
                </div>
              ) : (
                <div>
                  {visibleProjects.map((project) => (
                    <ProjectRow
                      key={project.id}
                      project={project}
                      onOpen={onOpenProject}
                      onDelete={onDeleteProject}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Why developers love it */}
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--foreground)] mb-3">
                <Sparkles size={16} className="text-[var(--primary)]" /> Why Developers Love It
              </h2>
              <ul className="space-y-3">
                {WHY_LOVE_IT.map(({ title, description }) => (
                  <li key={title} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-[var(--primary)] shrink-0 mt-0.5" />
                    <span>
                      <span className="block text-sm font-medium text-[var(--foreground)]">
                        {title}
                      </span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {description}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
