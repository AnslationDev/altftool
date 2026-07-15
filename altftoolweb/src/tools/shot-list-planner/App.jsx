"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Camera,
  CheckCircle2,
  Copy,
  Download,
  GripVertical,
  Layers,
  Lightbulb,
  ListChecks,
  MapPin,
  Plus,
  Printer,
  RotateCcw,
  Sparkles,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "altftools:shot-list-planner:v1";

const statusOptions = {
  Planned: "border-slate-500/25 bg-slate-500/10 text-slate-300",
  Ready: "border-blue-500/25 bg-blue-500/10 text-blue-500",
  Shooting: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  Completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  "Retake Needed": "border-rose-500/25 bg-rose-500/10 text-rose-300",
};

const priorityOptions = {
  High: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  Medium: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  Low: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
};

const statTones = {
  emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  amber: "border-amber-500/20 bg-amber-500/10 text-amber-300",
  cyan: "border-blue-500/20 bg-blue-500/10 text-blue-500",
  indigo: "border-blue-500/20 bg-blue-500/10 text-blue-500",
};

const shotTypes = ["Wide Shot", "Medium Shot", "Close-Up", "OTS Shot", "POV Shot", "Tracking Shot", "Drone Shot", "Custom"];
const productionTypes = ["Short Film", "Product Ad Shoot", "Travel Vlog", "Music Video", "Documentary", "Social Reel", "Custom"];

const footerCards = [
  {
    title: "How to Use",
    description:
      "Create a project, add scenes, add shots inside each scene, then update status, priority, location, and camera notes as your shoot plan changes.",
    icon: ListChecks,
  },
  {
    title: "How It Works",
    description:
      "The planner keeps your scenes, shots, equipment, director notes, and export summary synced locally in the browser so you can plan without uploading data.",
    icon: Lightbulb,
  },
];

const defaultProject = {
  id: "project-demo",
  title: "Product Ad Shoot",
  description: "Premium tabletop launch film with hero close-ups, macro details, and clean studio movement.",
  type: "Product Ad Shoot",
  shootDate: "",
  notes: "Keep reflective surfaces clean. Shoot hero motion before teardown.",
  equipment: {
    camera: "A-cam on 50mm prime. B-cam optional for overhead inserts.",
    lens: "24-70mm zoom, 50mm prime, 100mm macro.",
    lighting: "Key softbox camera-left, strip highlight on product edge, practical reflection card.",
    audio: "Room tone, product clicks, cloth handling foley.",
    props: "Product stand, acrylic riser, microfiber cloth, brand cards.",
    reminders: "Charge batteries, format cards, bring matte spray.",
  },
  directorNotes:
    "Prioritize clean motion, tactile details, and a confident reveal. Keep background minimal and avoid busy reflections.",
  scenes: [
    {
      id: "scene-1",
      name: "Hero Reveal",
      location: "Studio table",
      notes: "Shoot before fingerprints build up.",
      shots: [
        {
          id: "shot-1",
          number: "1A",
          title: "Opening product silhouette",
          description: "Slow slider move from shadow into rim-lit product edge.",
          type: "Wide Shot",
          customType: "",
          angle: "Low angle",
          location: "Studio table",
          camera: "50mm, slow slider, f/2.8",
          notes: "Leave negative space for title lockup.",
          status: "Ready",
          priority: "High",
        },
        {
          id: "shot-2",
          number: "1B",
          title: "Macro texture pass",
          description: "Close pass across material detail and logo engraving.",
          type: "Close-Up",
          customType: "",
          angle: "Macro side angle",
          location: "Studio table",
          camera: "100mm macro, manual focus pull",
          notes: "Use black flag to control reflection.",
          status: "Planned",
          priority: "Medium",
        },
      ],
    },
  ],
};

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeProject(project) {
  return {
    ...defaultProject,
    ...project,
    equipment: { ...defaultProject.equipment, ...(project?.equipment || {}) },
    scenes: Array.isArray(project?.scenes) ? project.scenes : [],
  };
}

function loadProjects() {
  if (typeof window === "undefined") return [defaultProject];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const loaded = saved ? JSON.parse(saved).map(safeProject) : [defaultProject];
    return loaded.length ? loaded : [defaultProject];
  } catch {
    return [defaultProject];
  }
}

export default function ShotListPlanner() {
  const [projects, setProjects] = useState(loadProjects);
  const [activeProjectId, setActiveProjectId] = useState(() => loadProjects()[0]?.id || defaultProject.id);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newSceneName, setNewSceneName] = useState("");
  const [drag, setDrag] = useState(null);

  useEffect(() => {
    if (projects.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) || projects[0],
    [activeProjectId, projects],
  );

  const metrics = useMemo(() => {
    const scenes = activeProject?.scenes || [];
    const shots = scenes.flatMap((scene) => scene.shots || []);
    const completed = shots.filter((shot) => shot.status === "Completed").length;
    const ready = shots.filter((shot) => shot.status === "Ready").length;
    const progress = shots.length ? Math.round((completed / shots.length) * 100) : 0;
    return { scenes: scenes.length, shots: shots.length, completed, pending: shots.length - completed, ready, progress };
  }, [activeProject]);

  function notify(text, isError = false) {
    if (isError) {
      setError(text);
      setTimeout(() => setError(""), 3200);
    } else {
      setMessage(text);
      setTimeout(() => setMessage(""), 2600);
    }
  }

  function updateProject(fields) {
    setProjects((current) =>
      current.map((project) => (project.id === activeProject.id ? { ...project, ...fields } : project)),
    );
  }

  function updateScenes(nextScenes) {
    updateProject({ scenes: nextScenes });
  }

  function updateScene(sceneId, fields) {
    updateScenes(activeProject.scenes.map((scene) => (scene.id === sceneId ? { ...scene, ...fields } : scene)));
  }

  function updateShot(sceneId, shotId, fields) {
    updateScenes(
      activeProject.scenes.map((scene) =>
        scene.id === sceneId
          ? { ...scene, shots: scene.shots.map((shot) => (shot.id === shotId ? { ...shot, ...fields } : shot)) }
          : scene,
      ),
    );
  }

  function createProject() {
    const project = {
      ...defaultProject,
      id: uid("project"),
      title: "Untitled Production",
      description: "",
      type: "Short Film",
      shootDate: "",
      notes: "",
      directorNotes: "",
      scenes: [],
    };
    setProjects((current) => [project, ...current]);
    setActiveProjectId(project.id);
    notify("New production project created.");
  }

  function addScene() {
    const name = newSceneName.trim();
    if (!name) return notify("Add a scene name before creating it.", true);
    const scene = { id: uid("scene"), name, location: "", notes: "", shots: [] };
    updateScenes([...(activeProject.scenes || []), scene]);
    setNewSceneName("");
    notify("Scene added to the shoot plan.");
  }

  function addShot(sceneId) {
    const scene = activeProject.scenes.find((item) => item.id === sceneId);
    if (!scene) return;
    const shot = {
      id: uid("shot"),
      number: `${activeProject.scenes.indexOf(scene) + 1}${String.fromCharCode(65 + scene.shots.length)}`,
      title: "",
      description: "",
      type: "Wide Shot",
      customType: "",
      angle: "",
      location: scene.location || "",
      camera: "",
      notes: "",
      status: "Planned",
      priority: "Medium",
    };
    updateScene(sceneId, { shots: [...scene.shots, shot] });
    notify("Shot added.");
  }

  function deleteScene(sceneId) {
    updateScenes(activeProject.scenes.filter((scene) => scene.id !== sceneId));
    notify("Scene removed.");
  }

  function deleteShot(sceneId, shotId) {
    const scene = activeProject.scenes.find((item) => item.id === sceneId);
    updateScene(sceneId, { shots: scene.shots.filter((shot) => shot.id !== shotId) });
    notify("Shot removed.");
  }

  function handleDrop(target) {
    if (!drag) return;
    const scenes = [...activeProject.scenes];
    if (drag.type === "scene") {
      const [moved] = scenes.splice(drag.sceneIndex, 1);
      scenes.splice(target.sceneIndex, 0, moved);
    }
    if (drag.type === "shot") {
      const sourceScene = scenes[drag.sceneIndex];
      const targetScene = scenes[target.sceneIndex];
      const [moved] = sourceScene.shots.splice(drag.shotIndex, 1);
      targetScene.shots.splice(target.shotIndex ?? targetScene.shots.length, 0, moved);
    }
    updateScenes(scenes);
    setDrag(null);
    notify("Timeline sequence updated.");
  }

  async function copySummary() {
    const text = buildSummary(activeProject, metrics);
    await navigator.clipboard.writeText(text);
    notify("Production notes copied.");
  }

  function exportSummary() {
    const blob = new Blob([buildSummary(activeProject, metrics)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(activeProject.title || "shot-list").replace(/[^\w-]+/g, "-").toLowerCase()}-shot-list.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!activeProject) return null;

  return (
    <div className="shot-list-planner-card min-h-screen overflow-x-hidden bg-(--background) px-4 py-12 font-secondary text-(--foreground) selection:bg-blue-500/30">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-3xl border border-(--border) bg-(--card) p-5 text-center shadow-xl sm:p-7">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,.10),transparent_28%)]" />
          <div className="relative space-y-4">
            <div className="mx-auto max-w-3xl min-w-0">
              <div className="mb-1 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 break-words">Production command center</span>
              </div>
              <h1 className="text-gradient-hero break-words text-5xl font-black tracking-tighter md:text-7xl">
                Shot List Planner
              </h1>
              <p className="mx-auto max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-lg">
                Build scenes, sequence shots, track readiness, and keep production notes synced live in the browser.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Metric label="Shots" value={metrics.shots} icon={Camera} />
              <Metric label="Scenes" value={metrics.scenes} icon={Layers} />
              <Metric label="Complete" value={`${metrics.progress}%`} icon={CheckCircle2} />
            </div>
          </div>
        </header>

        <AnimatePresence>
          {(message || error) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
                error ? "border-rose-500/20 bg-rose-500/10 text-rose-300" : "border-blue-500/20 bg-blue-500/10 text-blue-500"
              }`}
            >
              <span className="min-w-0 break-words">{error || message}</span>
              <button onClick={() => (error ? setError("") : setMessage(""))} className="shrink-0 rounded-full p-1 hover:bg-white/10">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
          <section className="space-y-4">
            <GlassCard title="Project Setup" icon={Video}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select value={activeProjectId} onChange={(e) => setActiveProjectId(e.target.value)} className="field flex-1">
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>{project.title}</option>
                  ))}
                </select>
                <button onClick={createProject} className="primary-btn"><Plus className="h-4 w-4" /> New</button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Project title" value={activeProject.title} onChange={(value) => updateProject({ title: value })} required />
                <label className="block min-w-0">
                  <span className="field-label">Production type</span>
                  <select value={activeProject.type} onChange={(e) => updateProject({ type: e.target.value })} className="field">
                    {productionTypes.map((type) => <option key={type}>{type}</option>)}
                  </select>
                </label>
                <Field label="Shoot date" type="date" value={activeProject.shootDate} onChange={(value) => updateProject({ shootDate: value })} />
                <Field label="Production notes" value={activeProject.notes} onChange={(value) => updateProject({ notes: value })} />
              </div>
              <Field label="Description" value={activeProject.description} onChange={(value) => updateProject({ description: value })} textarea />
            </GlassCard>

            <GlassCard title="Dashboard Overview" icon={ListChecks}>
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Completed shots" value={metrics.completed} tone="emerald" />
                <Stat label="Pending shots" value={metrics.pending} tone="amber" />
                <Stat label="Ready shots" value={metrics.ready} tone="cyan" />
                <Stat label="Timeline progress" value={`${metrics.progress}%`} tone="indigo" />
              </div>
              <div className="rounded-2xl border border-(--border) bg-(--background) p-3">
                <div className="mb-2 flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                  <span>Shoot progress</span><span>{metrics.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${metrics.progress}%` }} />
                </div>
              </div>
            </GlassCard>

            <GlassCard title="Equipment & Camera" icon={Camera}>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.keys(activeProject.equipment).map((key) => (
                  <Field
                    key={key}
                    label={key}
                    value={activeProject.equipment[key]}
                    onChange={(value) => updateProject({ equipment: { ...activeProject.equipment, [key]: value } })}
                    textarea={["lighting", "props", "reminders"].includes(key)}
                  />
                ))}
              </div>
            </GlassCard>

          </section>

          <section className="space-y-4">
            <GlassCard title="Scene & Shot Builder" icon={Plus}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input value={newSceneName} onChange={(e) => setNewSceneName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addScene()} placeholder="Scene name, e.g. Outdoor walking scene" className="field flex-1" />
                <button onClick={addScene} className="primary-btn"><Plus className="h-4 w-4" /> Add scene</button>
              </div>
              <div className="space-y-3">
                {activeProject.scenes.map((scene, sceneIndex) => (
                  <motion.div
                    key={scene.id}
                    layout
                    draggable
                    onDragStart={() => setDrag({ type: "scene", sceneIndex })}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop({ sceneIndex })}
                    className="min-w-0 rounded-2xl border border-(--border) bg-(--background) p-3 transition-all hover:border-blue-500/25"
                  >
                    <div className="mb-3 flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start">
                      <div className="flex min-w-0 flex-1 gap-2">
                        <GripVertical className="mt-3 h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                          <Field compact label={`Scene ${sceneIndex + 1}`} value={scene.name} onChange={(value) => updateScene(scene.id, { name: value })} />
                          <Field compact label="Location" value={scene.location} onChange={(value) => updateScene(scene.id, { location: value })} />
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-wrap gap-2 lg:justify-end">
                        <button onClick={() => addShot(scene.id)} className="soft-btn"><Plus className="h-4 w-4" /> Shot</button>
                        <button onClick={() => deleteScene(scene.id)} className="icon-btn text-rose-400" aria-label="Delete scene"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <Field compact label="Scene notes" value={scene.notes} onChange={(value) => updateScene(scene.id, { notes: value })} textarea />
                    <div className="mt-3 space-y-2" onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop({ sceneIndex })}>
                      {scene.shots.map((shot, shotIndex) => (
                        <ShotCard key={shot.id} shot={shot} sceneId={scene.id} sceneIndex={sceneIndex} shotIndex={shotIndex} setDrag={setDrag} updateShot={updateShot} deleteShot={deleteShot} onDrop={handleDrop} />
                      ))}
                      {!scene.shots.length && <div className="rounded-xl border border-dashed border-(--border) p-4 text-center text-sm text-muted-foreground">Drop shots here or add a new shot.</div>}
                    </div>
                  </motion.div>
                ))}
                {!activeProject.scenes.length && <EmptyState />}
              </div>
            </GlassCard>

            <GlassCard title="Timeline Planner" icon={CalendarDays}>
              <div className="custom-scrollbar max-h-[560px] space-y-3 overflow-y-auto pr-1">
                {activeProject.scenes.map((scene, sceneIndex) => (
                  <div key={scene.id} className="rounded-2xl border border-(--border) bg-(--background) p-3">
                    <div className="mb-2 flex min-w-0 items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="break-words text-xs font-black uppercase tracking-widest text-blue-500">Scene {sceneIndex + 1}</div>
                        <div className="break-words text-sm font-black">{scene.name || "Untitled scene"}</div>
                      </div>
                      <span className="shrink-0 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500">{scene.shots.length} shots</span>
                    </div>
                    <div className="grid gap-2">
                      {scene.shots.map((shot, shotIndex) => (
                        <div key={shot.id} className="grid min-w-0 grid-cols-[auto_1fr] gap-3 rounded-xl border border-(--border) bg-(--card) p-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-xs font-black text-blue-500">{shotIndex + 1}</div>
                          <div className="min-w-0">
                            <div className="break-words text-sm font-bold">{shot.number || "Shot"} · {shot.title || "Untitled shot"}</div>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              <Badge className={statusOptions[shot.status]}>{shot.status}</Badge>
                              <Badge className={priorityOptions[shot.priority]}>{shot.priority}</Badge>
                              <Badge>{shot.type === "Custom" ? shot.customType || "Custom" : shot.type}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard title="Export & Print" icon={Download}>
              <div className="grid gap-2 sm:grid-cols-3">
                <button onClick={() => window.print()} className="primary-btn"><Printer className="h-4 w-4" /> Print</button>
                <button onClick={exportSummary} className="soft-btn"><Download className="h-4 w-4" /> Export</button>
                <button onClick={copySummary} className="soft-btn"><Copy className="h-4 w-4" /> Copy notes</button>
              </div>
              <button onClick={() => { localStorage.removeItem(STORAGE_KEY); setProjects([defaultProject]); setActiveProjectId(defaultProject.id); notify("Planner restored to starter project."); }} className="danger-btn">
                <RotateCcw className="h-4 w-4" /> Reset saved planner
              </button>
            </GlassCard>

            <GlassCard title="Director Notes" icon={Lightbulb}>
              <Field label="Creative direction, actor notes, reminders, visual references" value={activeProject.directorNotes} onChange={(value) => updateProject({ directorNotes: value })} textarea large />
            </GlassCard>
          </section>
        </main>

        <FooterCards />
      </div>
      <PlannerStyles />
    </div>
  );
}

function ShotCard({ shot, sceneId, sceneIndex, shotIndex, setDrag, updateShot, deleteShot, onDrop }) {
  return (
    <motion.div
      layout
      draggable
      onDragStart={() => setDrag({ type: "shot", sceneIndex, shotIndex })}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop({ sceneIndex, shotIndex })}
      className="min-w-0 rounded-2xl border border-(--border) bg-(--card) p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-500/25"
    >
      <div className="mb-3 flex min-w-0 flex-wrap items-start gap-2">
        <GripVertical className="mt-3 h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
        <div className="grid min-w-[180px] flex-1 gap-2 sm:grid-cols-2">
          <Field compact label="Shot number" value={shot.number} onChange={(value) => updateShot(sceneId, shot.id, { number: value })} />
          <Field compact label="Shot title" value={shot.title} onChange={(value) => updateShot(sceneId, shot.id, { title: value })} required />
        </div>
        <button onClick={() => deleteShot(sceneId, shot.id)} className="icon-btn shrink-0 text-rose-400" aria-label="Delete shot"><Trash2 className="h-4 w-4" /></button>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <label className="block min-w-0">
          <span className="field-label">Shot type</span>
          <select value={shot.type} onChange={(e) => updateShot(sceneId, shot.id, { type: e.target.value })} className="field">
            {shotTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>
        {shot.type === "Custom" && <Field compact label="Custom type" value={shot.customType} onChange={(value) => updateShot(sceneId, shot.id, { customType: value })} />}
        <Field compact label="Camera angle" value={shot.angle} onChange={(value) => updateShot(sceneId, shot.id, { angle: value })} />
        <Field compact label="Location" value={shot.location} onChange={(value) => updateShot(sceneId, shot.id, { location: value })} />
      </div>
      <Field compact label="Description" value={shot.description} onChange={(value) => updateShot(sceneId, shot.id, { description: value })} textarea />
      <div className="grid gap-2 md:grid-cols-2">
        <Field compact label="Camera details" value={shot.camera} onChange={(value) => updateShot(sceneId, shot.id, { camera: value })} />
        <Field compact label="Notes" value={shot.notes} onChange={(value) => updateShot(sceneId, shot.id, { notes: value })} />
      </div>
      <div className="mt-3 flex min-w-0 flex-wrap gap-2">
        <SelectPill value={shot.status} options={Object.keys(statusOptions)} classes={statusOptions} onChange={(value) => updateShot(sceneId, shot.id, { status: value })} />
        <SelectPill value={shot.priority} options={Object.keys(priorityOptions)} classes={priorityOptions} onChange={(value) => updateShot(sceneId, shot.id, { priority: value })} />
        <Badge><MapPin className="h-3 w-3" /> {shot.location || "No location"}</Badge>
      </div>
    </motion.div>
  );
}

function Field({ label, value, onChange, textarea = false, type = "text", large = false, compact = false }) {
  const className = `field ${textarea ? (large ? "min-h-44 resize-y" : "min-h-20 resize-y") : ""}`;
  return (
    <label className="block min-w-0">
      <span className="field-label">{label}</span>
      {textarea ? (
        <textarea value={value || ""} onChange={(event) => onChange(event.target.value)} className={className} />
      ) : (
        <input type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} className={`${className} ${compact ? "py-2" : ""}`} />
      )}
    </label>
  );
}

function SelectPill({ value, options, classes, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`min-w-0 max-w-full rounded-full border px-3 py-1.5 text-xs font-black outline-none ${classes[value]}`}>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );
}

function GlassCard({ title, icon: Icon, children }) {
  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 rounded-2xl border border-(--border) bg-(--card) p-3 shadow-md sm:p-4">
      <div className="mb-3 flex min-w-0 items-center gap-2 border-b border-(--border) pb-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500"><Icon className="h-4 w-4" /></div>
        <h2 className="min-w-0 break-words text-xs font-black uppercase tracking-widest">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </motion.section>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
      <Icon className="mb-2 h-4 w-4 text-blue-500" />
      <div className="break-words text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-xl font-black">{value}</div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const toneClass = statTones[tone] || statTones.cyan;
  return (
    <div className={`min-w-0 rounded-2xl border p-3 ${toneClass}`}>
      <div className="break-words text-[10px] font-black uppercase tracking-widest">{label}</div>
      <div className="mt-1 break-words text-2xl font-black">{value}</div>
    </div>
  );
}

function Badge({ children, className = "border-(--border) bg-(--background) text-muted-foreground" }) {
  return <span className={`inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${className}`}><span className="min-w-0 max-w-full break-words">{children}</span></span>;
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-(--border) bg-(--background) p-6 text-center">
      <AlertCircle className="mx-auto mb-2 h-7 w-7 text-blue-500" />
      <div className="font-black">No scenes yet</div>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Create a scene to start building the shot workflow.</p>
    </div>
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
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
            <card.icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-(--foreground)">{card.title}</h3>
          <p className="mt-3 text-sm leading-relaxed text-(--muted-foreground)">{card.description}</p>
        </div>
      ))}
    </section>
  );
}

function buildSummary(project, metrics) {
  const lines = [
    project.title,
    `Type: ${project.type}`,
    `Shoot date: ${project.shootDate || "Not set"}`,
    `Progress: ${metrics.completed}/${metrics.shots} shots completed (${metrics.progress}%)`,
    "",
    project.description || "",
    "",
    "Scenes and shots:",
  ];
  project.scenes.forEach((scene, sceneIndex) => {
    lines.push(`Scene ${sceneIndex + 1}: ${scene.name} (${scene.location || "No location"})`);
    scene.shots.forEach((shot, shotIndex) => {
      lines.push(`  ${shotIndex + 1}. ${shot.number} - ${shot.title || "Untitled"} | ${shot.type === "Custom" ? shot.customType || "Custom" : shot.type} | ${shot.status} | ${shot.priority}`);
      if (shot.description) lines.push(`     ${shot.description}`);
    });
  });
  lines.push("", "Equipment:", ...Object.entries(project.equipment).map(([key, value]) => `${key}: ${value || "-"}`), "", "Director notes:", project.directorNotes || "-");
  return lines.join("\n");
}

function PlannerStyles() {
  return (
    <style jsx global>{`
      .field {
        width: 100%;
        min-width: 0;
        border-radius: 0.9rem;
        border: 1px solid var(--border);
        background: var(--background);
        padding: 0.65rem 0.8rem;
        color: var(--foreground);
        font-size: 0.875rem;
        outline: none;
        overflow-wrap: anywhere;
        transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
      }
      .field:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37,99,235,.10); }
      .field-label { margin-bottom: .35rem; display: block; font-size: .68rem; font-weight: 900; text-transform: uppercase; letter-spacing: .12em; color: var(--muted-foreground); overflow-wrap: anywhere; }
      .primary-btn, .soft-btn, .danger-btn, .icon-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: .5rem; border-radius: .9rem; padding: .7rem 1rem; font-size: .82rem; font-weight: 900; transition: transform .2s ease, background .2s ease, border-color .2s ease; min-width: 0; max-width: 100%; text-align: center; line-height: 1.15; overflow-wrap: anywhere; white-space: normal;
      }
      .primary-btn { background: var(--primary); color: var(--primary-foreground); }
      .primary-btn:hover, .soft-btn:hover, .danger-btn:hover, .icon-btn:hover { transform: translateY(-1px); }
      .primary-btn:hover { background: var(--primary-hover); }
      .soft-btn { border: 1px solid var(--secondary-border); background: var(--secondary-bg); color: var(--secondary-foreground); }
      .soft-btn:hover { background: var(--secondary-hover); }
      .danger-btn { width: 100%; border: 1px solid rgba(244,63,94,.22); background: rgba(244,63,94,.1); color: rgb(251 113 133); }
      .icon-btn { border: 1px solid var(--border); background: var(--background); padding: .65rem; }
      .shot-list-planner-card, .shot-list-planner-card * {
        overflow-wrap: anywhere;
      }
      .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(37,99,235,.25); border-radius: 999px; }
      @media print {
        header, button, select, .danger-btn { print-color-adjust: exact; }
        body { background: white !important; }
      }
    `}</style>
  );
}
