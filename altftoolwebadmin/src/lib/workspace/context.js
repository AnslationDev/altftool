// Workspace Context builder.
//
// Combines the resolved hierarchy node (via the resolver) with the actor and an
// optional device/context passthrough, into the single object every consumer
// (Audit, Analytics, …) reads. Phase 2 only builds the context — it does NOT
// write events or parse request headers (that belongs to Phase 3's event model).

import { resolveWorkspaceNode } from "./resolve";

function normalizeActor(actor) {
  if (!actor || typeof actor !== "object") {
    return { uid: null, email: null, role: null };
  }
  return {
    uid: actor.uid ?? actor.actorUid ?? null,
    email: actor.email ?? actor.actorEmail ?? null,
    role: actor.role ?? actor.roleType ?? actor.actorRole ?? null,
  };
}

/**
 * Build the workspace context for an activity.
 * @param {object} input   resolver input (explicit metadata and/or route)
 * @param {{actor?:object, device?:object}} [opts]
 * @returns {{ node: object, actor: object, device: object|null, resolvedBy: string }}
 */
export function buildWorkspaceContext(input = {}, opts = {}) {
  // Defaults only cover `undefined`; guard explicit nulls so an actor-less or
  // metadata-less call that passes null (rather than omitting the arg) can't
  // crash the audit path.
  if (opts == null) opts = {};
  const node = resolveWorkspaceNode(input);
  const actor = normalizeActor(opts.actor);
  // device/context is passed through untouched here (browser/os/ip/geo are
  // enriched by the event layer in Phase 3, from the request or client).
  const device = opts.device ?? opts.context ?? null;
  return { node, actor, device, resolvedBy: node.source };
}
