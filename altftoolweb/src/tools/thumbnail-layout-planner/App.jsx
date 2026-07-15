"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  GripVertical,
  Image,
  Layers,
  ListChecks,
  Palette,
  Plus,
  Printer,
  RotateCcw,
  Sparkles,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "altftools:thumbnail-layout-planner:v1";
const STAGES = ["Idea", "Planning", "Designing", "Review", "Approved", "Completed"];
const PLATFORMS = ["YouTube", "Shorts", "Instagram", "TikTok", "Facebook", "Custom"];
const CATEGORIES = ["Tutorial", "Gaming", "Product Review", "Vlog", "Podcast", "Education", "Reaction", "Custom"];
const ELEMENT_TYPES = ["Headline", "Face", "Logo", "CTA", "Background", "Arrow", "Emoji", "Shape", "Highlight", "Brand Asset"];
const POSITIONS = ["Left Side", "Center", "Right Side", "Top Left", "Top Right", "Bottom Left", "Bottom Area", "Full Background"];

const footerCards = [
  {
    title: "Uses",
    description:
      "Plan thumbnail concepts, visual hierarchy, branding colors, element placement, status, and export-ready creative notes for content teams.",
    icon: Image,
  },
  {
    title: "How It Works",
    description:
      "Create a project, add layout elements, compare versions, update workflow status, and keep all thumbnail planning details saved in your browser.",
    icon: ListChecks,
  },
];

const statusTone = {
  Idea: "border-slate-500/25 bg-slate-500/10 text-slate-300",
  Planning: "border-blue-500/25 bg-blue-500/10 text-blue-500",
  Designing: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300",
  Review: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  Approved: "border-violet-500/25 bg-violet-500/10 text-violet-300",
  Completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
};

const priorityTone = {
  High: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  Medium: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  Low: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
};

const colorSwatches = ["#22d3ee", "#2563eb", "#f59e0b", "#ef4444", "#a855f7", "#10b981", "#f8fafc"];

const starterProject = {
  id: "project-demo",
  title: "React Tutorial Thumbnail",
  videoName: "Build a Dashboard in React",
  description: "High-contrast education thumbnail with face reaction, bold headline, and dashboard preview.",
  platform: "YouTube",
  category: "Tutorial",
  status: "Designing",
  priority: "High",
  notes: "Keep the promise clear. Text must read at mobile feed size.",
  branding: {
    colors: ["#22d3ee", "#2563eb", "#f8fafc"],
    fonts: "Heavy sans headline, compact supporting text.",
    channel: "ALT creator lab",
    guidelines: "Use electric cyan accents, crisp dark backgrounds, and one obvious focal emotion.",
  },
  creativeNotes:
    "Hook: Make React dashboards feel less intimidating. Editor: emphasize face + final UI, avoid tiny code screenshots.",
  versions: [
    {
      id: "version-a",
      name: "Version A",
      focus: "Face left, headline top right, dashboard preview bottom.",
      layoutNotes: "Use strong diagonal read path from face to headline to CTA.",
      elements: [
        { id: "el-face", type: "Face", label: "Creator face", placement: "Left Side", x: 12, y: 24, w: 24, h: 46, color: "#22d3ee" },
        { id: "el-title", type: "Headline", label: "React Dashboard", placement: "Top Right", x: 48, y: 16, w: 38, h: 18, color: "#f8fafc" },
        { id: "el-cta", type: "CTA", label: "Build it fast", placement: "Bottom Area", x: 54, y: 72, w: 28, h: 12, color: "#f59e0b" },
        { id: "el-logo", type: "Logo", label: "Channel mark", placement: "Top Left", x: 5, y: 7, w: 12, h: 12, color: "#2563eb" },
      ],
    },
  ],
};

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function loadProjects() {
  if (typeof window === "undefined") return [starterProject];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [starterProject];
    return parsed.length ? parsed : [starterProject];
  } catch {
    return [starterProject];
  }
}

export default function ThumbnailLayoutPlanner() {
  const initialProjects = useMemo(() => loadProjects(), []);
  const [projects, setProjects] = useState(initialProjects);
  const [activeProjectId, setActiveProjectId] = useState(initialProjects[0]?.id || starterProject.id);
  const [activeVersionId, setActiveVersionId] = useState(initialProjects[0]?.versions?.[0]?.id || "version-a");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newElement, setNewElement] = useState({ type: "Headline", label: "", placement: "Center" });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || projects[0],
    [projects, activeProjectId],
  );

  const activeVersion = useMemo(
    () => activeProject?.versions?.find((version) => version.id === activeVersionId) || activeProject?.versions?.[0],
    [activeProject, activeVersionId],
  );

  const metrics = useMemo(() => {
    const versions = projects.flatMap((project) => project.versions || []);
    const completed = projects.filter((project) => project.status === "Completed").length;
    const pendingReview = projects.filter((project) => project.status === "Review").length;
    const active = projects.filter((project) => !["Completed", "Approved"].includes(project.status)).length;
    const progress = projects.length ? Math.round((completed / projects.length) * 100) : 0;
    return { projects: projects.length, versions: versions.length, active, completed, pendingReview, progress };
  }, [projects]);

  function notify(text, isError = false) {
    if (isError) {
      setError(text);
      setTimeout(() => setError(""), 3000);
    } else {
      setMessage(text);
      setTimeout(() => setMessage(""), 2500);
    }
  }

  function updateProject(fields) {
    setProjects((current) => current.map((project) => (project.id === activeProject.id ? { ...project, ...fields } : project)));
  }

  function updateVersion(fields) {
    updateProject({
      versions: activeProject.versions.map((version) => (version.id === activeVersion.id ? { ...version, ...fields } : version)),
    });
  }

  function updateElement(elementId, fields) {
    updateVersion({
      elements: activeVersion.elements.map((element) => (element.id === elementId ? { ...element, ...fields } : element)),
    });
  }

  function createProject() {
    const project = {
      ...starterProject,
      id: uid("project"),
      title: "Untitled Thumbnail",
      videoName: "",
      description: "",
      platform: "YouTube",
      category: "Custom",
      status: "Idea",
      priority: "Medium",
      notes: "",
      versions: [{ ...starterProject.versions[0], id: uid("version"), name: "Version A", elements: [] }],
    };
    setProjects((current) => [project, ...current]);
    setActiveProjectId(project.id);
    setActiveVersionId(project.versions[0].id);
    notify("Thumbnail project created.");
  }

  function addElement() {
    if (!newElement.label.trim()) return notify("Add an element label before placing it.", true);
    const element = {
      id: uid("element"),
      type: newElement.type,
      label: newElement.label.trim(),
      placement: newElement.placement,
      x: 36,
      y: 34,
      w: newElement.type === "Headline" ? 30 : 18,
      h: newElement.type === "Headline" ? 15 : 18,
      color: colorSwatches[activeVersion.elements.length % colorSwatches.length],
    };
    updateVersion({ elements: [...activeVersion.elements, element] });
    setNewElement({ ...newElement, label: "" });
    notify("Element added to the live layout.");
  }

  function duplicateVersion() {
    const version = {
      ...activeVersion,
      id: uid("version"),
      name: `Version ${String.fromCharCode(65 + activeProject.versions.length)}`,
      elements: activeVersion.elements.map((element) => ({ ...element, id: uid("element") })),
    };
    updateProject({ versions: [...activeProject.versions, version] });
    setActiveVersionId(version.id);
    notify("Alternate layout version created.");
  }

  async function copySummary() {
    await navigator.clipboard.writeText(buildSummary(activeProject, activeVersion, metrics));
    notify("Planning details copied.");
  }

  function exportSummary() {
    const blob = new Blob([buildSummary(activeProject, activeVersion, metrics)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(activeProject.title || "thumbnail-layout").replace(/[^\w-]+/g, "-").toLowerCase()}-planner.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!activeProject || !activeVersion) return null;

  return (
    <div className="thumbnail-planner min-h-screen overflow-x-hidden bg-(--background) px-4 py-12 font-secondary text-(--foreground) selection:bg-blue-500/30">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-3xl border border-(--border) bg-(--card) p-5 text-center shadow-xl sm:p-7">
          <div className="absolute inset-0 bg-(--section-highlight) opacity-60" />
          <div className="relative space-y-4">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-cyan-300">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 break-words">Creator layout command center</span>
            </div>
            <h1 className="text-gradient-hero break-words text-4xl font-black tracking-tighter md:text-7xl">Thumbnail Layout Planner</h1>
            <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-lg">
              Plan visual hierarchy, drag thumbnail elements, compare versions, and keep branding notes synced in-browser.
            </p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Metric label="Projects" value={metrics.projects} icon={Image} />
              <Metric label="Layouts" value={metrics.versions} icon={Layers} />
              <Metric label="Reviews" value={metrics.pendingReview} icon={Eye} />
              <Metric label="Progress" value={`${metrics.progress}%`} icon={CheckCircle2} />
            </div>
          </div>
        </header>

        <Toast message={message} error={error} onClose={() => (error ? setError("") : setMessage(""))} />

        <main className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="space-y-4">
            <GlassCard title="Project Setup" icon={Image}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={activeProjectId}
                  onChange={(event) => {
                    const nextProject = projects.find((project) => project.id === event.target.value);
                    setActiveProjectId(event.target.value);
                    setActiveVersionId(nextProject?.versions?.[0]?.id || "");
                  }}
                  className="tlp-field flex-1"
                >
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
                </select>
                <button onClick={createProject} className="tlp-primary"><Plus className="h-4 w-4" /> New</button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Thumbnail title" value={activeProject.title} onChange={(value) => updateProject({ title: value || "Untitled Thumbnail" })} />
                <Field label="Video / project name" value={activeProject.videoName} onChange={(value) => updateProject({ videoName: value })} />
                <Select label="Platform" value={activeProject.platform} options={PLATFORMS} onChange={(value) => updateProject({ platform: value })} />
                <Select label="Category" value={activeProject.category} options={CATEGORIES} onChange={(value) => updateProject({ category: value })} />
              </div>
              <Field label="Description" value={activeProject.description} onChange={(value) => updateProject({ description: value })} textarea />
              <Field label="Project notes" value={activeProject.notes} onChange={(value) => updateProject({ notes: value })} textarea />
            </GlassCard>

            <GlassCard title="Dashboard Overview" icon={ListChecks}>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Active layouts" value={metrics.active} tone="cyan" />
                <Stat label="Completed" value={metrics.completed} tone="emerald" />
                <Stat label="Pending review" value={metrics.pendingReview} tone="amber" />
                <Stat label="All versions" value={metrics.versions} tone="violet" />
              </div>
              <div className="rounded-2xl border border-(--border) bg-(--background) p-3">
                <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                  <span>Total progress</span><span>{metrics.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div className="h-full rounded-full bg-cyan-500 transition-all duration-500" style={{ width: `${metrics.progress}%` }} />
                </div>
              </div>
            </GlassCard>

            <GlassCard title="Branding Workspace" icon={Palette}>
              <div className="grid gap-3 sm:grid-cols-3">
                {(activeProject.branding.colors || []).map((color, index) => (
                  <label key={index} className="min-w-0">
                    <span className="tlp-label">Brand color {index + 1}</span>
                    <input type="color" value={color} onChange={(event) => {
                      const colors = [...activeProject.branding.colors];
                      colors[index] = event.target.value;
                      updateProject({ branding: { ...activeProject.branding, colors } });
                    }} className="h-11 w-full rounded-2xl border border-(--border) bg-(--background) p-1" />
                  </label>
                ))}
              </div>
              <Field label="Font notes" value={activeProject.branding.fonts} onChange={(value) => updateProject({ branding: { ...activeProject.branding, fonts: value } })} />
              <Field label="Channel branding" value={activeProject.branding.channel} onChange={(value) => updateProject({ branding: { ...activeProject.branding, channel: value } })} />
              <Field label="Style guidelines" value={activeProject.branding.guidelines} onChange={(value) => updateProject({ branding: { ...activeProject.branding, guidelines: value } })} textarea />
            </GlassCard>

            <GlassCard title="Creative Direction" icon={Type}>
              <Field label="Hook ideas, editor instructions, strategy notes" value={activeProject.creativeNotes} onChange={(value) => updateProject({ creativeNotes: value })} textarea large />
            </GlassCard>
          </section>

          <section className="space-y-4">
            <GlassCard title="Layout Planner" icon={Layers}>
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <select value={activeVersion.id} onChange={(event) => setActiveVersionId(event.target.value)} className="tlp-field">
                  {activeProject.versions.map((version) => <option key={version.id} value={version.id}>{version.name}</option>)}
                </select>
                <button onClick={duplicateVersion} className="tlp-soft"><Copy className="h-4 w-4" /> Duplicate</button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Version name" value={activeVersion.name} onChange={(value) => updateVersion({ name: value || "Untitled Version" })} />
                <Field label="Focus area" value={activeVersion.focus} onChange={(value) => updateVersion({ focus: value })} />
              </div>
              <Field label="Layout notes" value={activeVersion.layoutNotes} onChange={(value) => updateVersion({ layoutNotes: value })} textarea />
              <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
                <Select value={newElement.type} options={ELEMENT_TYPES} onChange={(value) => setNewElement({ ...newElement, type: value })} />
                <input value={newElement.label} onChange={(event) => setNewElement({ ...newElement, label: event.target.value })} onKeyDown={(event) => event.key === "Enter" && addElement()} placeholder="Element label" className="tlp-field" />
                <Select value={newElement.placement} options={POSITIONS} onChange={(value) => setNewElement({ ...newElement, placement: value })} />
                <button onClick={addElement} className="tlp-primary"><Plus className="h-4 w-4" /> Add</button>
              </div>
            </GlassCard>

            <div className="grid gap-4">
              <GlassCard title="Visual Elements" icon={GripVertical}>
                <div className="custom-scrollbar max-h-[520px] space-y-3 overflow-y-auto pr-1">
                  {activeVersion.elements.map((element) => (
                    <motion.div key={element.id} layout className="min-w-0 rounded-2xl border border-(--border) bg-(--background) p-3">
                      <div className="mb-3 flex items-start gap-2">
                        <GripVertical className="mt-3 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                          <Field compact label="Label" value={element.label} onChange={(value) => updateElement(element.id, { label: value })} />
                          <Select label="Type" value={element.type} options={ELEMENT_TYPES} onChange={(value) => updateElement(element.id, { type: value })} />
                        </div>
                        <button onClick={() => updateVersion({ elements: activeVersion.elements.filter((item) => item.id !== element.id) })} className="tlp-icon text-rose-400" aria-label="Delete element"><Trash2 className="h-4 w-4" /></button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        <Select label="Placement" value={element.placement} options={POSITIONS} onChange={(value) => updateElement(element.id, { placement: value })} />
                        <label><span className="tlp-label">Color</span><input type="color" value={element.color} onChange={(event) => updateElement(element.id, { color: event.target.value })} className="h-10 w-full rounded-2xl border border-(--border) bg-(--card) p-1" /></label>
                        <Field compact label="Size %" type="number" value={element.w} onChange={(value) => updateElement(element.id, { w: clamp(Number(value) || 10, 8, 70), h: clamp(Math.round((Number(value) || 10) * 0.55), 8, 45) })} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard title="Status & Timeline" icon={ListChecks}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Select label="Status" value={activeProject.status} options={STAGES} onChange={(value) => updateProject({ status: value })} />
                  <Select label="Priority" value={activeProject.priority} options={["High", "Medium", "Low"]} onChange={(value) => updateProject({ priority: value })} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={statusTone[activeProject.status]}>{activeProject.status}</Badge>
                  <Badge className={priorityTone[activeProject.priority]}>{activeProject.priority} priority</Badge>
                </div>
                <div className="space-y-3">
                  {STAGES.map((stage, index) => {
                    const activeIndex = STAGES.indexOf(activeProject.status);
                    const done = index < activeIndex || activeProject.status === "Completed";
                    const current = stage === activeProject.status;
                    return (
                      <button key={stage} onClick={() => updateProject({ status: stage })} className="grid w-full grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-(--border) bg-(--background) p-3 text-left transition-all hover:border-(--primary)">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${done ? "bg-emerald-500 text-white" : current ? "bg-cyan-500 text-slate-950" : "bg-(--background) text-muted-foreground"}`}>{done ? "✓" : index + 1}</span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-black">{stage}</span>
                          <span className="block truncate text-xs text-muted-foreground">{current ? "Current workflow stage" : done ? "Completed step" : "Upcoming step"}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            <GlassCard title="Export & Share" icon={Download}>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <button onClick={() => window.print()} className="tlp-primary"><Printer className="h-4 w-4" /> Print</button>
                <button onClick={exportSummary} className="tlp-soft"><Download className="h-4 w-4" /> Export</button>
                <button onClick={copySummary} className="tlp-soft"><Copy className="h-4 w-4" /> Copy</button>
                <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setProjects([starterProject]); setActiveProjectId(starterProject.id); setActiveVersionId("version-a"); notify("Planner restored."); }} className="tlp-danger"><RotateCcw className="h-4 w-4" /> Reset</button>
              </div>
            </GlassCard>
          </section>
        </main>
        <FooterCards />
      </div>
      <PlannerStyles />
    </div>
  );
}

function Field({ label, value, onChange, textarea = false, large = false, compact = false, type = "text" }) {
  return (
    <label className="block min-w-0">
      {label && <span className="tlp-label">{label}</span>}
      {textarea ? (
        <textarea value={value || ""} onChange={(event) => onChange(event.target.value)} className={`tlp-field resize-y ${large ? "min-h-44" : "min-h-20"}`} />
      ) : (
        <input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} className={`tlp-field ${compact ? "py-2" : ""}`} />
      )}
    </label>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <label className="block min-w-0">
      {label && <span className="tlp-label">{label}</span>}
      <select value={value} onChange={(event) => onChange(event.target.value)} className="tlp-field">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function GlassCard({ title, icon: Icon, children }) {
  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 overflow-hidden rounded-2xl border border-(--border) bg-(--card) p-3 shadow-md backdrop-blur sm:p-4">
      <div className="mb-3 flex min-w-0 items-center gap-2 border-b border-(--border) pb-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300"><Icon className="h-4 w-4" /></div>
        <h2 className="min-w-0 break-words text-xs font-black uppercase tracking-widest">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </motion.section>
  );
}

function Metric({ label, value, icon: Icon }) {
  return <div className="min-w-0 rounded-2xl border border-(--border) bg-(--background) p-3 backdrop-blur"><Icon className="mb-2 h-4 w-4 text-cyan-300" /><div className="break-words text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div><div className="mt-1 break-words text-xl font-black">{value}</div></div>;
}

function Stat({ label, value, tone }) {
  const tones = {
    cyan: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  };
  return <div className={`min-w-0 rounded-2xl border p-3 ${tones[tone]}`}><div className="break-words text-[10px] font-black uppercase tracking-widest">{label}</div><div className="mt-1 break-words text-2xl font-black">{value}</div></div>;
}

function Badge({ children, className = "border-(--border) bg-(--background) text-muted-foreground" }) {
  return <span className={`inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${className}`}><span className="min-w-0 max-w-full break-words">{children}</span></span>;
}

function Toast({ message, error, onClose }) {
  return (
    <AnimatePresence>
      {(message || error) && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${error ? "border-rose-500/20 bg-rose-500/10 text-rose-300" : "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"}`}>
          <span className="min-w-0 break-words">{error || message}</span>
          <button onClick={onClose} className="shrink-0 rounded-full p-1 hover:bg-white/10"><X className="h-4 w-4" /></button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FooterCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {footerCards.map((card) => (
        <div
          key={card.title}
          className="min-w-0 rounded-2xl border border-(--border) bg-(--card) p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--muted) text-(--primary)">
            <card.icon className="h-5 w-5" />
          </div>
          <h3 className="break-words text-lg font-bold text-(--foreground)">{card.title}</h3>
          <p className="mt-3 break-words text-sm leading-relaxed text-(--muted-foreground)">
            {card.description}
          </p>
        </div>
      ))}
    </section>
  );
}

function buildSummary(project, version, metrics) {
  const lines = [
    project.title,
    `Video/project: ${project.videoName || "Not set"}`,
    `Platform: ${project.platform}`,
    `Category: ${project.category}`,
    `Status: ${project.status}`,
    `Priority: ${project.priority}`,
    `Workspace progress: ${metrics.progress}%`,
    "",
    "Layout version:",
    `${version.name} - ${version.focus || "No focus area"}`,
    version.layoutNotes || "",
    "",
    "Elements:",
    ...version.elements.map((item) => `- ${item.type}: ${item.label} | ${item.placement} | x:${item.x}% y:${item.y}%`),
    "",
    "Branding:",
    `Colors: ${(project.branding.colors || []).join(", ")}`,
    `Fonts: ${project.branding.fonts || "-"}`,
    `Channel: ${project.branding.channel || "-"}`,
    `Guidelines: ${project.branding.guidelines || "-"}`,
    "",
    "Creative notes:",
    project.creativeNotes || "-",
  ];
  return lines.join("\n");
}

function PlannerStyles() {
  return (
    <style jsx global>{`
      .thumbnail-planner, .thumbnail-planner * { overflow-wrap: break-word; }
      .tlp-field {
        width: 100%; min-width: 0; border-radius: .9rem; border: 1px solid var(--border);
        background: var(--background); padding: .65rem .8rem; color: var(--foreground);
        font-size: .875rem; outline: none; transition: border-color .2s ease, box-shadow .2s ease;
      }
      .tlp-field:focus { border-color: rgb(34 211 238 / .65); box-shadow: 0 0 0 3px rgb(34 211 238 / .10); }
      .tlp-label { margin-bottom: .35rem; display: block; font-size: .68rem; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; color: var(--muted-foreground); }
      .tlp-primary, .tlp-soft, .tlp-danger, .tlp-icon {
        display: inline-flex; align-items: center; justify-content: center; gap: .5rem; border-radius: .9rem;
        padding: .7rem 1rem; font-size: .82rem; font-weight: 900; line-height: 1.15; max-width: 100%;
        min-width: 0; white-space: nowrap; text-align: center; transition: transform .2s ease, background .2s ease, border-color .2s ease;
      }
      .tlp-primary svg, .tlp-soft svg, .tlp-danger svg, .tlp-icon svg { flex-shrink: 0; }
      .tlp-primary:hover, .tlp-soft:hover, .tlp-danger:hover, .tlp-icon:hover { transform: translateY(-1px); }
      .tlp-primary { background: rgb(8 145 178); color: white; }
      .tlp-primary:hover { background: rgb(14 116 144); }
      .tlp-soft { border: 1px solid var(--secondary-border); background: var(--secondary-bg); color: var(--secondary-foreground); }
      .tlp-danger { border: 1px solid rgb(244 63 94 / .22); background: rgb(244 63 94 / .1); color: rgb(251 113 133); }
      .tlp-icon { border: 1px solid var(--border); background: var(--background); padding: .65rem; }
      .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgb(34 211 238 / .3); border-radius: 999px; }
      @media print {
        header, button, select, input[type="color"] { display: none !important; }
        body { background: white !important; }
        .thumbnail-planner { color: black !important; background: white !important; padding: 0 !important; }
      }
    `}</style>
  );
}


