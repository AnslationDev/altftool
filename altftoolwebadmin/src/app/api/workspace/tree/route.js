// Read-only Workspace Registry API.
//
// Serves the in-memory hierarchy (Workspace → Project → Application → Module →
// Section → Feature). No Firestore, no writes — Phase 1 only exposes the
// registry so later consumers/UI can consume it.
//
//   GET /api/workspace/tree                → full workspace tree
//   GET /api/workspace/tree?path=altftool  → subtree rooted at a hierarchyPath
//   GET /api/workspace/tree?view=stats     → counts + registration issues
import { NextResponse } from "next/server";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import {
  getWorkspaceTree,
  getWorkspaceStats,
  getWorkspaceIssues,
  getWorkspaceNode,
  getWorkspaceChildren,
} from "@/lib/workspace";

export async function GET(request) {
  try {
    await verifySuperAdminRequest(request);
    const url = new URL(request.url);
    const view = url.searchParams.get("view");
    const path = url.searchParams.get("path") || "";

    if (view === "stats") {
      return NextResponse.json({ stats: getWorkspaceStats(), issues: getWorkspaceIssues() });
    }

    if (view === "children") {
      return NextResponse.json({
        path,
        node: getWorkspaceNode(path) || null,
        children: getWorkspaceChildren(path).map((n) => ({
          level: n.level, id: n.id, label: n.label, hierarchyPath: n.hierarchyPath,
          hasChildren: (n.childPaths?.length || 0) > 0,
        })),
      });
    }

    const tree = getWorkspaceTree(path);
    if (path && !tree) {
      return NextResponse.json({ error: "Unknown hierarchyPath" }, { status: 404 });
    }
    return NextResponse.json({ tree, stats: getWorkspaceStats() });
  } catch (error) {
    const status = error?.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : "Failed to load workspace registry" },
      { status },
    );
  }
}
