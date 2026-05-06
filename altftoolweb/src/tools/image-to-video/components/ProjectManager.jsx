"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getAllProjects, deleteProject } from "../utils/projectDB";
import {
  Folder,
  Save,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  FolderOpen,
} from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

export default function ProjectManager({
  onLoad,
  onSave,
  currentProjectName,
  onNameChange,
  isSaving,
}) {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [nameInput, setNameInput] = useState(currentProjectName ?? "");
  const [deleting, setDeleting] = useState(null);
  const [saved, setSaved] = useState(false);

  // Load project list when panel opens
  useEffect(() => {
    if (!open) return;
    getAllProjects()
      .then((list) =>
        setProjects(list.sort((a, b) => b.updatedAt - a.updatedAt)),
      )
      .catch(console.error);
  }, [open]);

  const handleDelete = async (id) => {
    setDeleting(id);
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  const formatDate = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full rounded-2xl border border-(--border) bg-(--muted)/20 p-2 sm:p-4  space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-(--foreground) flex items-center gap-1">
            <Folder size={16} />
            Projects
          </p>
          <p className="text-xs text-(--muted-foreground) mt-0.5">
            Save &amp; resume your work anytime
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs border border-(--border) px-2.5 py-1 rounded-lg hover:border-(--primary)/50 text-(--foreground) transition cursor-pointer"
        >
          <span className="flex items-center gap-1">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {open ? "Hide" : "Saved"}
          </span>
        </button>
      </div>

      {/* Save row */}
      <div className="flex gap-2">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => {
            setNameInput(e.target.value);
            onNameChange(e.target.value);
          }}
          placeholder="Project name…"
          className="flex-1 text-sm bg-(--background) text-(--foreground) border border-(--border) rounded-xl px-3 py-2  focus:outline-none focus:ring-2 focus:ring-(--primary)/40"
        />

        <button
          onClick={() => {
            const name = nameInput || "Untitled Project";
            const promise = onSave(name);

            toast.promise(promise, {
              loading: "Saving...",
              success: `"${name}" saved! ✅`,
              error: "Save failed ❌",
            });

            // Button visual state
            promise
              .then(() => {
                setSaved(true);
                setTimeout(() => setSaved(false), 2500);
              })
              .catch(() => {});
          }}
          className={`
  px-3 py-2 sm:rounded-xl rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer whitespace-nowrap
    ${
      saved
        ? "bg-green-500 text-white"
        : "bg-(--primary) text-(--primary-foreground) hover:opacity-90"
    }
  `}
        >
          <span className="flex items-center gap-1">
            {saved ? <Check size={16} /> : <Save size={16} />}
            <span className="flex items-center gap-1 sm:inline-flex hidden">
              {saved ? "Saved" : "Save"}
            </span>
          </span>
        </button>
      </div>

      {/* Project list */}
      {open && (
        <div className="space-y-2">
          {projects.length === 0 ? (
            <p className="text-xs text-center text-(--muted-foreground) py-4">
              No saved projects yet
            </p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-(--border) bg-(--background) hover:border-(--primary)/40 transition"
              >
                {/* Thumbnail grid */}
                {project.slides?.some((s) => s.url) && (
                  <div className="flex gap-0.5 flex-shrink-0">
                    {project.slides
                      .filter((s) => s.url)
                      .slice(0, 3)
                      .map((slide, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-md overflow-hidden bg-(--muted)"
                        >
                          <ManagedImage
                            src={slide.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}

                    {project.slides.filter((s) => s.url).length > 3 && (
                      <div className="w-8 h-8 rounded-md bg-(--muted) flex items-center justify-center text-[10px] text-(--muted-foreground) font-bold">
                        +{project.slides.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-(--foreground) truncate">
                    {project.name}
                  </p>
                  <p className="text-[12px] text-(--muted-foreground) mt-0.5 hidden sm:block ">
                    {project.slides?.length ?? 0} slides ·{" "}
                    {formatDate(project.updatedAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => {
                      onLoad(project);
                      setOpen(false);
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-(--primary) text-(--primary-foreground) hover:opacity-90 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-1">
                      <FolderOpen size={14} />
                      <span className="flex items-center gap-1 sm:inline-flex hidden">
                        Open
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deleting === project.id}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-(--border) text-red-400 hover:bg-red-500/10 hover:border-red-400 transition cursor-pointer disabled:opacity-40"
                  >
                    {deleting === project.id ? "…" : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
