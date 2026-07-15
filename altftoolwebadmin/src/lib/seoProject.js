// altftoolwebadmin/src/lib/seoProject.js
//
// ALTF Engine — project scoping for the SEO control-plane.
//
// The SEO Engine is a shared, per-project module: every project gets its own
// authoritative config document and its own health history, so the platform's
// SEO data is fully isolated per project. This helper is the single place that
// maps a project id to its Firestore locations and resolves/validates the
// project from an incoming request. Everything defaults to "altftool" so all
// existing behaviour (and the live altftool.com integration) is preserved.

import { PROJECTS } from "@/projects";

export const DEFAULT_SEO_PROJECT = "altftool";

// Resolve an arbitrary input to a known project id, falling back to the default
// when the value is missing or not a registered project. This makes every
// server route safe against spoofed/unknown ?project= values (prototype-safe).
export function resolveSeoProjectId(input) {
  const id = typeof input === "string" ? input.trim() : "";
  return id && Object.prototype.hasOwnProperty.call(PROJECTS, id)
    ? id
    : DEFAULT_SEO_PROJECT;
}

// Authoritative SEO config document for a project.
export function seoRuntimeDocPath(projectId) {
  return `projects/${resolveSeoProjectId(projectId)}/seo/runtime`;
}

// Health-snapshot collection for a project.
export function seoHealthCollectionPath(projectId) {
  return `projects/${resolveSeoProjectId(projectId)}/seo_health`;
}

// AI-generated SEO proposals collection for a project.
export function seoProposalsCollectionPath(projectId) {
  return `projects/${resolveSeoProjectId(projectId)}/seoProposals`;
}

// Read the target project from a request's ?project= query param.
export function seoProjectFromRequest(request) {
  try {
    const url = request?.nextUrl || new URL(request.url);
    return resolveSeoProjectId(url.searchParams.get("project"));
  } catch {
    return DEFAULT_SEO_PROJECT;
  }
}
