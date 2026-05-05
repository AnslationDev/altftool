"use client";

import { createContext, useContext, useMemo } from "react";
import { PROJECTS } from "@/projects";

const ProjectContext = createContext(null);

// Call this in server components before passing project to ProjectProvider
export function serializeProject(project) {
  return {
    id: project.id,
    name: project.name,
    color: project.color ?? null,
    moduleKeys: Object.keys(project.modules),
    modules: Object.fromEntries(
      Object.entries(project.modules).map(([key, mod]) => [
        key,
        { label: mod.label, path: mod.path }, // ← no icon
      ])
    ),
  };
}

// ProjectProvider receives the serialized (icon-free) project.
// Internally it merges icons back from the full PROJECTS registry.
export function ProjectProvider({ project: serialized, children }) {
  const hydrated = useMemo(() => {
    const full = PROJECTS[serialized.id];
    if (!full) return serialized;

    return {
      ...serialized,
      modules: Object.fromEntries(
        Object.entries(serialized.modules).map(([key, mod]) => [
          key,
          { ...mod, icon: full.modules[key]?.icon ?? null }, // icons added back client-side
        ])
      ),
    };
  }, [serialized]);

  return (
    <ProjectContext.Provider value={hydrated}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => useContext(ProjectContext);