import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

const PROJECT_ID = "carrerbook";
const SETTINGS_REF = ["projects", PROJECT_ID, "contact", "settings"];
const LEADS_REF = ["projects", PROJECT_ID, "contact", "settings", "submissions"];
const LOCAL_ADMIN_TOKEN = "local-dev-admin-token";

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
  const adminSnap = await adminDb.collection("admins").doc(decoded.uid).get();
  if (!adminSnap.exists || adminSnap.data()?.isActive === false) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }

  return decoded;
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
    const body = await request.json();
    const leadId = String(body?.leadId || "").trim();
    const to = String(body?.to || "").trim();
    const subject = String(body?.subject || "").trim();
    const message = String(body?.message || "").trim();

    if (!leadId || !to || !subject || !message) {
      return NextResponse.json({ error: "leadId, to, subject and message are required." }, { status: 400 });
    }

    const settingsSnap = await adminDb.doc(`projects/${PROJECT_ID}/contact/settings`).get();
    const settings = settingsSnap.exists ? settingsSnap.data() : {};
    const leadRef = adminDb.doc(`projects/${PROJECT_ID}/contact/settings/submissions/${leadId}`);
    const leadSnap = await leadRef.get();

    if (!leadSnap.exists) {
      return NextResponse.json({ error: "Lead not found." }, { status: 404 });
    }

    const html = renderGreetingHtml({
      subject,
      message,
      lead: leadSnap.data() || {},
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[contact/send-greeting]", error);
    return NextResponse.json({ error: error?.message || "Failed to send greeting." }, { status: error?.status || 500 });
  }
}
