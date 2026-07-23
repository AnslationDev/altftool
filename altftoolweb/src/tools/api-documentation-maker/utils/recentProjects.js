const STORAGE_KEY = "api-doc-maker-recent-projects";
const MAX_PROJECTS = 8;

function readAll() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(projects) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // storage full/unavailable — recent projects list is best-effort only
  }
}

export function countEndpoints(spec) {
  return Object.values(spec?.paths || {}).reduce(
    (sum, methods) => sum + Object.keys(methods || {}).length,
    0,
  );
}

export function getRecentProjects() {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveRecentProject(spec) {
  const title = spec?.info?.title?.trim() || "Untitled API";
  const projects = readAll();
  const existingIndex = projects.findIndex((p) => p.id === title);

  const entry = {
    id: title,
    title,
    version: spec?.info?.version || "1.0.0",
    endpointCount: countEndpoints(spec),
    updatedAt: Date.now(),
    status: existingIndex >= 0 ? projects[existingIndex].status : "draft",
    spec,
  };

  if (existingIndex >= 0) {
    projects[existingIndex] = entry;
  } else {
    projects.unshift(entry);
  }

  const trimmed = projects.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_PROJECTS);
  writeAll(trimmed);
  return trimmed;
}

export function markProjectPublished(title) {
  const projects = readAll();
  const idx = projects.findIndex((p) => p.id === title);
  if (idx >= 0) {
    projects[idx] = { ...projects[idx], status: "published", updatedAt: Date.now() };
    writeAll(projects);
  }
  return getRecentProjects();
}

export function deleteRecentProject(id) {
  const projects = readAll().filter((p) => p.id !== id);
  writeAll(projects);
  return projects;
}
