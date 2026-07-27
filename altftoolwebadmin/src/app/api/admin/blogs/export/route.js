import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { enforceRateLimit } from "@altftool/core/http";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { buildRbacAdminProfile, getRbacAdminDoc } from "@/lib/serverRbac";
import {
  BLOG_EXPORT_COLUMNS,
  csvEscape,
  normalizeBlogExportRow,
} from "@/projects/altftool/modules/blogs/components/blogExportUtils";
import { isFeatureEnabled } from "@/lib/featureFlags";

export const runtime = "nodejs";

const LOCAL_ADMIN_TOKEN = "local-dev-admin-token";
const MAX_ROWS = 10_000;
const PAGE_SIZE = 500;

function getBearerToken(request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return "";
  return header.split("Bearer ")[1];
}

async function verifyAdminRequest(request) {
  const token = getBearerToken(request);

  if (process.env.NODE_ENV === "development" && token === LOCAL_ADMIN_TOKEN) {
    return { uid: "local-dev-admin", email: "admin@altftool.local" };
  }

  if (!token) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  const decoded = await adminAuth.verifyIdToken(token);

  // RBAC-first: admins created through the current flow live only under
  // super_admin_dashboard/main/admin_users, so the legacy-only lookup below
  // 403'd every one of them.
  const rbacAdmin = await getRbacAdminDoc(decoded);
  if (rbacAdmin) {
    const profile = await buildRbacAdminProfile(decoded, rbacAdmin);
    if (!profile.isActive) {
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    }
    return decoded;
  }

  // Legacy fallback for admins created before the RBAC migration.
  let snap = await adminDb.collection("admins").doc(decoded.uid).get();

  if (!snap.exists && decoded.email) {
    const byEmail = await adminDb.collection("admins").where("email", "==", decoded.email).limit(1).get();
    if (!byEmail.empty) snap = byEmail.docs[0];
  }

  if (!snap.exists || snap.data()?.isActive === false) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  return decoded;
}

function parseDate(value, endOfDay = false) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date;
}

function parseCategories(value = "") {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function serializeJsonLine(row, first) {
  return `${first ? "" : ","}\n${JSON.stringify(row)}`;
}

function serializeCsvRow(row) {
  return `${BLOG_EXPORT_COLUMNS.map((column) => csvEscape(row[column])).join(",")}\n`;
}

async function logExportAudit(actor, meta) {
  try {
    await adminDb.collection("admin_audit_logs").add({
      action: "BLOG_EXPORT",
      actorEmail: actor.email || null,
      actorUid: actor.uid || null,
      changes: meta,
      createdAt: FieldValue.serverTimestamp(),
      module: "blogs",
      summary: `Exported ${meta.rowCount} blog row${meta.rowCount === 1 ? "" : "s"} as ${meta.format}`,
    });
  } catch (error) {
    console.warn("[blog-export] audit log failed", error);
  }
}

export async function GET(request) {
  if (!isFeatureEnabled("blog_export")) {
    return NextResponse.json({ error: "Blog export is disabled" }, { status: 404 });
  }

  const limited = enforceRateLimit(NextResponse, request, {
    limit: 8,
    scope: "admin:blog-export",
    windowMs: 60_000,
  });
  if (limited) return limited;

  let actor;
  try {
    actor = await verifyAdminRequest(request);
  } catch (error) {
    return NextResponse.json({ error: error.message || "Unauthorized" }, { status: error.status || 401 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "json" ? "json" : "csv";
  const status = url.searchParams.get("status") || "all";
  const from = parseDate(url.searchParams.get("from"));
  const to = parseDate(url.searchParams.get("to"), true);
  const categories = parseCategories(url.searchParams.get("categories"));

  if ((url.searchParams.get("from") && !from) || (url.searchParams.get("to") && !to)) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }

  if (!["all", "draft", "published"].includes(status)) {
    return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  let rowCount = 0;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (format === "csv") {
          controller.enqueue(encoder.encode(`\uFEFF${BLOG_EXPORT_COLUMNS.join(",")}\n`));
        } else {
          controller.enqueue(encoder.encode("["));
        }

        let query = adminDb.collection("projects").doc("altftool").collection("blogs").orderBy("createdAt", "desc");
        if (from) query = query.where("createdAt", ">=", from);
        if (to) query = query.where("createdAt", "<=", to);
        if (status !== "all") query = query.where("status", "==", status);
        if (categories.length === 1) query = query.where("category", "==", categories[0]);
        if (categories.length > 1) query = query.where("category", "in", categories);

        let cursor = null;
        let firstJsonRow = true;

        while (rowCount < MAX_ROWS) {
          let pageQuery = query.limit(Math.min(PAGE_SIZE, MAX_ROWS - rowCount));
          if (cursor) pageQuery = pageQuery.startAfter(cursor);

          const snap = await pageQuery.get();
          if (snap.empty) break;

          for (const doc of snap.docs) {
            const row = normalizeBlogExportRow({ id: doc.id, ...doc.data() });
            controller.enqueue(encoder.encode(format === "csv" ? serializeCsvRow(row) : serializeJsonLine(row, firstJsonRow)));
            firstJsonRow = false;
            rowCount += 1;
          }

          cursor = snap.docs[snap.docs.length - 1];
          if (snap.size < PAGE_SIZE) break;
        }

        if (format === "json") controller.enqueue(encoder.encode("\n]"));
        await logExportAudit(actor, {
          categories,
          format,
          from: from?.toISOString() || "",
          rowCount,
          status,
          to: to?.toISOString() || "",
        });
        controller.close();
      } catch (error) {
        console.error("[blog-export]", error);
        controller.error(error);
      }
    },
  });

  const ext = format === "json" ? "json" : "csv";
  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="altftool-blogs-export.${ext}"`,
      "Content-Type": format === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8",
      "X-AltFTool-Export-Cap": String(MAX_ROWS),
    },
  });
}
