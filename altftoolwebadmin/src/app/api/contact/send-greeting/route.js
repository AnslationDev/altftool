import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { createLocalDevAdminActor, isLocalDevAdminRequest } from "@/lib/adminAccess";
import { verifyActiveAdmin } from "@/lib/serverAdminAuth";
import { hasModuleAccess } from "@/lib/permissionUtils";

export const runtime = "nodejs";

const PROJECT_ID = "carrerbook";
const CONTACT_MODULE_KEY = "contact-us";
const SETTINGS_REF = ["projects", PROJECT_ID, "contact", "settings"];
const LEADS_REF = ["projects", PROJECT_ID, "contact", "settings", "submissions"];

function httpError(message, status) {
  const error = new Error(message);
  error.status = status;
  error.expose = true;
  return error;
}

// Distinguishes "the caller's credentials are missing/invalid" (401) from an
// infrastructure fault raised while checking them. verifyActiveAdmin also reads
// Firestore, so a transient UNAVAILABLE/DEADLINE_EXCEEDED must not be reported
// to the client as an authentication failure.
function isAuthenticationFailure(error) {
  // Thrown by getBearerToken() when the Authorization header is missing/malformed.
  if (error?.message === "Unauthorized") return true;
  // firebase-admin auth errors: auth/id-token-expired, auth/argument-error, ...
  const code = error?.code || error?.errorInfo?.code || "";
  return typeof code === "string" && code.startsWith("auth/");
}

async function verifyAdminRequest(request) {
  if (isLocalDevAdminRequest(request)) {
    return createLocalDevAdminActor();
  }

  // RBAC store first, legacy `admins` as fallback (verifyActiveAdmin does both),
  // then a project-scoped module check — sending mail from the organisation's
  // sender is not something every admin of every project may do.
  let decoded;
  let admin;
  try {
    ({ decoded, admin } = await verifyActiveAdmin(request));
  } catch (authErr) {
    // "Forbidden"/"Inactive admin" = authenticated but not an eligible admin.
    if (authErr?.message === "Forbidden" || authErr?.message === "Inactive admin") {
      throw httpError("Forbidden", 403);
    }
    // Missing/expired/invalid credentials = authentication issue.
    if (isAuthenticationFailure(authErr)) {
      throw httpError("Unauthorized", 401);
    }
    // Anything else is a genuine backend fault: rethrow so the outer catch logs
    // it and answers 500 instead of telling the client to re-authenticate.
    throw authErr;
  }

  if (
    !hasModuleAccess({
      adminData: admin,
      projectId: PROJECT_ID,
      moduleKey: CONTACT_MODULE_KEY,
      action: "write",
    })
  ) {
    throw httpError("Forbidden", 403);
  }

  return { ...decoded, email: decoded?.email || admin?.email || null };
}

function renderGreetingHtml({ subject, message, lead, settings }) {
  const safeMessage = String(message || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replace(/\n/g, "<br/>");

  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#f7f7fb;padding:32px">
      <div style="max-width:640px;margin:0 auto;background:#111827;border-radius:20px;overflow:hidden;color:#fff">
        <div style="padding:28px 28px 18px;background:linear-gradient(135deg,#4f46e5,#111827)">
          <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#c7d2fe">CareerBook</div>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2">${escapeHtml(subject || settings.greetingEmailSubject || "Hello")}</h1>
        </div>
        <div style="padding:28px;background:#fff;color:#111827">
          <p style="margin:0 0 14px;font-size:16px;line-height:1.7">${safeMessage}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="margin:0;font-size:13px;line-height:1.7;color:#6b7280">
            Lead: ${escapeHtml(lead.name || "-")}<br/>
            Email: ${escapeHtml(lead.email || "-")}<br/>
            Company: ${escapeHtml(lead.companyName || "-")}<br/>
            Query: ${escapeHtml(lead.queryType || "-")}
          </p>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request) {
  try {
    const actor = await verifyAdminRequest(request);

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const leadId = typeof body?.leadId === "string" ? body.leadId.trim() : "";
    const requestedTo = typeof body?.to === "string" ? body.to.trim() : "";
    const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!leadId || !requestedTo || !subject || !message) {
      return NextResponse.json({ error: "leadId, to, subject and message are required." }, { status: 400 });
    }

    if (leadId.includes("/")) {
      return NextResponse.json({ error: "Invalid leadId." }, { status: 400 });
    }

    const settingsSnap = await adminDb.doc(`projects/${PROJECT_ID}/contact/settings`).get();
    const settings = settingsSnap.exists ? settingsSnap.data() : {};
    const leadRef = adminDb.doc(`projects/${PROJECT_ID}/contact/settings/submissions/${leadId}`);
    const leadSnap = await leadRef.get();

    if (!leadSnap.exists) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const lead = leadSnap.data() || {};

    // The recipient is always the address stored on the lead — never a
    // caller-supplied one, so this endpoint cannot be used to relay arbitrary
    // mail from the organisation's sender. A `to` that differs from the stored
    // address is ignored rather than rejected, so the feature keeps working; the
    // address actually used is echoed back and recorded in `greetingTo`.
    const to = typeof lead.email === "string" ? lead.email.trim() : "";
    if (!to) {
      return NextResponse.json({ error: "This lead has no email address on file." }, { status: 400 });
    }

    const html = renderGreetingHtml({
      subject,
      message,
      lead,
      settings,
    });

    const resendKey = process.env.RESEND_API_KEY || "";
    const fromEmail = process.env.CONTACT_FROM_EMAIL || settings.adminNotificationEmail || "CareerBook <no-reply@careerbook.local>";

    if (resendKey) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
          text: message,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Email provider rejected the request: ${errorText || response.statusText}`);
      }
    } else if (process.env.NODE_ENV !== "development") {
      throw new Error("RESEND_API_KEY is not configured.");
    } else {
      console.warn("[contact/send-greeting] Dry-run: RESEND_API_KEY missing, skipping external send.");
    }

    await leadRef.set(
      {
        emailSent: true,
        emailSentAt: FieldValue.serverTimestamp(),
        status: "contacted",
        contactedAt: FieldValue.serverTimestamp(),
        greetingSubject: subject,
        greetingMessage: message,
        greetingTo: to,
        greetingSentBy: actor.email || actor.uid || "admin",
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    return NextResponse.json({ success: true, to });
  } catch (error) {
    console.error("[contact/send-greeting]", error);
    // Only trust `status` on errors this route authored (httpError). Rethrown
    // infrastructure errors can carry unrelated `status`/`code` fields.
    const status = error?.expose && Number.isInteger(error?.status) ? error.status : 500;
    // Only surface messages this route authored; provider/internal errors stay
    // in the server log.
    const safeMessage = error?.expose && error?.message ? error.message : "Failed to send greeting.";
    return NextResponse.json({ error: safeMessage }, { status });
  }
}
