// Lazy tree for the Workspace Explorer.
//
//   GET /api/activity/tree?path=<hierarchyPath>
//
// Returns the DIRECT children of a node (from the Workspace Registry) each with
// its rollup activity count. Empty path = top-level projects. One level per
// request keeps the explorer cheap regardless of workspace size.
import { NextResponse } from "next/server";
import { verifySuperAdminRequest } from "@/lib/adminAccess";
import { adminDb } from "@/lib/firebaseAdmin";
import { getWorkspaceChildren, getWorkspaceNode } from "@/lib/workspace";

const ROLLUPS = "activity_rollups";
const rollupDocId = (p) => String(p || "unclassified").replace(/\//g, "~");

export async function GET(request) {
  try {
    await verifySuperAdminRequest(request);
    const url = new URL(request.url);
    const path = url.searchParams.get("path") || "";

    const children = getWorkspaceChildren(path);
    const counts = await Promise.all(
      children.map((c) =>
        adminDb.collection(ROLLUPS).doc(rollupDocId(c.hierarchyPath)).get()
          .then((s) => (s.exists ? s.data()?.count || 0 : 0))
          .catch(() => 0),
      ),
    );

    return NextResponse.json({
      path,
      node: path ? (getWorkspaceNode(path) ? { hierarchyPath: path } : null) : { hierarchyPath: "" },
      children: children.map((c, i) => ({
        level: c.level,
        id: c.id,
        label: c.label,
        hierarchyPath: c.hierarchyPath,
        hasChildren: (c.childPaths?.length || 0) > 0,
        count: counts[i],
      })),
    });
  } catch (error) {
    const status = error?.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json(
      { error: status === 401 ? "Unauthorized" : "Failed to load workspace tree" },
      { status },
    );
  }
}
