import { Search } from "lucide-react";
import alphobia from "./alphobia/config";
import altftool from "./altftool/config";
import leadtree from "./leadtree/config";
import smartlucky from "./smartlucky/config";
import marketys from "./marketys/config";
import carrerbook from "./carrerbook/config";
import myluckydeal from "./myluckydeal/config";
import anternet from "./anternet/config";
import coozter from "./coozter/config";
import growvibe from "./growvibe/config";
import apexboost from "./apexboost/config";
import anslic from "./anslic/config";

// Modules shared by EVERY project. The SEO Engine is a platform-wide capability:
// each project manages its OWN SEO (its own config doc + health history, fully
// isolated) through one shared implementation. Injecting it here — rather than
// editing every project's config — means it automatically appears in the
// sidebar, routing, and RBAC permission matrix for all current and future
// projects, and per-project access is gated by hasModuleAccess everywhere.
export const SHARED_PROJECT_MODULES = {
  seo: { label: "SEO Engine", icon: Search, routeSegment: "seo", shared: true },
};

// Append the shared modules after a project's own modules (so they sort to the
// bottom of each sidebar). Shared modules act as the single source of truth for
// their definition; altftool already lists an identical `seo` entry.
function withSharedModules(project) {
  return {
    ...project,
    modules: { ...project.modules, ...SHARED_PROJECT_MODULES },
  };
}

const RAW_PROJECTS = {
  altftool,
  leadtree,
  smartlucky,
  alphobia,
  marketys,
  carrerbook,
  myluckydeal,
  anternet,
  coozter,
  growvibe,
  apexboost,
  anslic
};

export const PROJECTS = Object.fromEntries(
  Object.entries(RAW_PROJECTS).map(([id, project]) => [
    id,
    withSharedModules(project),
  ]),
);

export const getProject = (projectId) => {
  return PROJECTS[projectId];
};
