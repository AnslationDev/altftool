"use client";

import { PROJECTS } from "@/projects";

export default function PermissionSummary({ admin }) {
  if (admin.roleType === "superadmin") {
    return (
      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
        Full Access
      </span>
    );
  }

  const pills = [];

  // Multi-project permissions via projectAccess
  for (const [projectId, project] of Object.entries(PROJECTS)) {
    const perms = admin.projectAccess?.[projectId]?.permissions ?? {};
    for (const [mod, p] of Object.entries(perms)) {
      if (p?.read || p?.write || p?.delete) {
        const acts = [p.read && "R", p.write && "W", p.delete && "D"].filter(Boolean);
        const moduleLabel = project.modules[mod]?.label ?? mod;
        pills.push({
          key: `${projectId}/${mod}`,
          label: moduleLabel,
          projectName: project.name,
          acts,
        });
      }
    }
  }

  // Legacy fallback — flat permissions object
  if (!pills.length) {
    for (const [mod, p] of Object.entries(admin.permissions ?? {})) {
      if (p?.read || p?.write || p?.delete) {
        const acts = [p.read && "R", p.write && "W", p.delete && "D"].filter(Boolean);
        pills.push({ key: mod, label: mod, projectName: null, acts });
      }
    }
  }

  if (!pills.length) {
    return <span className="text-xs text-gray-400">No access</span>;
  }

  return (
    <div className="flex flex-wrap gap-1 max-w-[260px]">
      {pills.slice(0, 3).map(({ key, label, projectName, acts }) => (
        <span
          key={key}
          className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded capitalize"
        >
          {projectName ? `${projectName} · ${label}` : label}{" "}
          <span className="text-indigo-400">{acts.join("/")}</span>
        </span>
      ))}
      {pills.length > 3 && (
        <span className="text-[10px] text-gray-400">+{pills.length - 3} more</span>
      )}
    </div>
  );
}