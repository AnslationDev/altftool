/**
 * Server-side security store: sessions, devices, consent, settings, events,
 * and login-attempt tracking. Admin SDK only (bypasses Firestore rules).
 */
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import {
  SECURITY_COLLECTIONS as C,
  SETTINGS_DOC_ID,
  DEFAULT_SECURITY_SETTINGS,
  PRIVACY_POLICY_VERSION,
  normalizeSettings,
} from "./config";
import {
  extractClientIp,
  maskIp,
  encryptIp,
  isIpEncryptionConfigured,
  extractGeo,
  parseUserAgent,
  computeDeviceId,
  deviceLabel,
  scoreLogin,
} from "./primitives";

/* ---------------- settings ---------------- */

export async function getSecuritySettings() {
  try {
    const snap = await adminDb.collection(C.settings).doc(SETTINGS_DOC_ID).get();
    return normalizeSettings(snap.exists ? snap.data() : DEFAULT_SECURITY_SETTINGS);
  } catch {
    return normalizeSettings(DEFAULT_SECURITY_SETTINGS);
  }
}

export async function saveSecuritySettings(patch, actor) {
  const current = await getSecuritySettings();
  const next = normalizeSettings({ ...current, ...patch });
  await adminDb.collection(C.settings).doc(SETTINGS_DOC_ID).set(
    {
      ...next,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actor?.email ?? actor?.uid ?? null,
    },
    { merge: true },
  );
  return next;
}

/* ---------------- request → security context ---------------- */

export function buildSecurityContext(request, principal = {}) {
  const headers = request?.headers;
  const ua = parseUserAgent(headers?.get?.("user-agent"));
  const ip = extractClientIp(headers);
  const masked = maskIp(ip);
  const geo = extractGeo(headers);
  const deviceId = computeDeviceId({
    uid: principal.uid,
    userAgent: ua.raw,
    maskedIp: masked,
    clientHint: headers?.get?.("sec-ch-ua-platform") || "",
  });
  return {
    ip: { masked, encrypted: encryptIp(ip), configured: isIpEncryptionConfigured() },
    ua,
    geo,
    deviceId,
    deviceLabel: deviceLabel(ua.raw),
  };
}

export function publicSessionView(ctx) {
  return {
    deviceId: ctx.deviceId,
    deviceLabel: ctx.deviceLabel,
    browser: ctx.ua.browser,
    os: ctx.ua.os,
    deviceType: ctx.ua.deviceType,
    ipMasked: ctx.ip.masked,
    country: ctx.geo?.country ?? null,
    region: ctx.geo?.region ?? null,
    city: ctx.geo?.city ?? null,
  };
}

/* ---------------- security events ---------------- */

export async function recordSecurityEvent(event) {
  try {
    const ctx = event.context;
    await adminDb.collection(C.events).add({
      type: event.type,
      severity: event.severity || "info",
      actorUid: event.uid ?? null,
      actorEmail: event.email ?? null,
      summary: event.summary ?? null,
      riskScore: event.riskScore ?? null,
      riskLevel: event.riskLevel ?? null,
      reasons: event.reasons ?? null,
      deviceId: ctx?.deviceId ?? null,
      deviceLabel: ctx?.deviceLabel ?? null,
      browser: ctx?.ua?.browser ?? null,
      os: ctx?.ua?.os ?? null,
      ipMasked: ctx?.ip?.masked ?? null,
      ipEncrypted: ctx?.ip?.encrypted ?? null,
      country: ctx?.geo?.country ?? null,
      region: ctx?.geo?.region ?? null,
      city: ctx?.geo?.city ?? null,
      metadata: event.metadata ?? null,
      createdAtMs: Date.now(),
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    console.error("recordSecurityEvent failed", err);
  }
}

/* ---------------- devices ---------------- */

function deviceDocId(uid, deviceId) {
  return `${uid}__${deviceId}`;
}

export async function upsertDevice({ uid, email, ctx }) {
  const ref = adminDb.collection(C.devices).doc(deviceDocId(uid, ctx.deviceId));
  const snap = await ref.get();
  const now = Date.now();
  const isNew = !snap.exists;
  await ref.set(
    {
      uid,
      email: email ?? null,
      deviceId: ctx.deviceId,
      label: ctx.deviceLabel,
      browser: ctx.ua.browser,
      os: ctx.ua.os,
      deviceType: ctx.ua.deviceType,
      lastCountry: ctx.geo?.country ?? null,
      lastSeenMs: now,
      ...(isNew ? { firstSeenMs: now, trusted: false, createdAt: FieldValue.serverTimestamp() } : {}),
      seenCount: FieldValue.increment(1),
    },
    { merge: true },
  );
  return { isNew, ref };
}

export async function listDevices(uid) {
  const q = await adminDb.collection(C.devices).where("uid", "==", uid).get();
  return q.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---------------- sessions ---------------- */

export async function getActiveSessionsForUser(uid) {
  const q = await adminDb.collection(C.sessions).where("uid", "==", uid).get();
  return q.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((s) => s.status === "active")
    .sort((a, b) => (a.lastSeenAtMs || 0) - (b.lastSeenAtMs || 0));
}

/**
 * Create a session on successful login. Enforces device limit, computes a
 * risk score, persists device + session, and emits a security event.
 */
export async function startSession({ uid, email, request }) {
  const settings = await getSecuritySettings();
  const ctx = buildSecurityContext(request, { uid });

  const [devices, activeSessions, recentFailures] = await Promise.all([
    listDevices(uid),
    getActiveSessionsForUser(uid),
    countRecentFailedLogins(email, settings.loginRateLimit.windowMinutes),
  ]);

  const knownDevice = devices.find((d) => d.deviceId === ctx.deviceId);
  const knownCountries = new Set(devices.map((d) => d.lastCountry).filter(Boolean));
  const isKnownCountry = ctx.geo?.country ? knownCountries.has(ctx.geo.country) : true;

  const risk = settings.suspiciousLoginDetection
    ? scoreLogin({
        isKnownDevice: Boolean(knownDevice),
        isKnownCountry,
        recentFailedAttempts: recentFailures,
        activeSessionCount: activeSessions.length,
        deviceLimit: settings.deviceLimit,
        knownDeviceCount: devices.length,
      })
    : { score: 0, level: "low", reasons: [], suspicious: false };

  // Idempotent: if this device already has an active session, REUSE it instead
  // of revoking + recreating. (Recreating revoked the prior session, whose
  // heartbeat then reported inactive and force-logged-out the admin.)
  const sameDevice = activeSessions.filter((s) => s.deviceId === ctx.deviceId);
  if (sameDevice.length) {
    const reuse = sameDevice[sameDevice.length - 1];
    await Promise.all(
      sameDevice
        .slice(0, -1)
        .map((s) => revokeSessionDoc(s.id, { reason: "reauthenticated", by: "system" })),
    );
    await upsertDevice({ uid, email, ctx });
    await adminDb.collection(C.sessions).doc(reuse.id).update({ lastSeenAtMs: Date.now() });
    return {
      sessionId: reuse.id,
      risk: {
        score: reuse.riskScore ?? 0,
        level: reuse.riskLevel ?? "low",
        reasons: reuse.riskReasons ?? [],
        suspicious: (reuse.riskLevel ?? "low") !== "low",
      },
      settings,
      session: publicSessionView(ctx),
    };
  }

  // New device → enforce the device limit by retiring the oldest sessions.
  const limit = Math.max(1, settings.deviceLimit);
  if (activeSessions.length >= limit) {
    const overflow = activeSessions.slice(0, activeSessions.length - limit + 1);
    await Promise.all(
      overflow.map((s) => revokeSessionDoc(s.id, { reason: "device_limit_exceeded", by: "system" })),
    );
  }

  await upsertDevice({ uid, email, ctx });

  const now = Date.now();
  const sessionRef = await adminDb.collection(C.sessions).add({
    uid,
    email: email ?? null,
    deviceId: ctx.deviceId,
    deviceLabel: ctx.deviceLabel,
    browser: ctx.ua.browser,
    os: ctx.ua.os,
    deviceType: ctx.ua.deviceType,
    ipMasked: ctx.ip.masked,
    ipEncrypted: ctx.ip.encrypted,
    country: ctx.geo?.country ?? null,
    region: ctx.geo?.region ?? null,
    city: ctx.geo?.city ?? null,
    status: "active",
    riskScore: risk.score,
    riskLevel: risk.level,
    riskReasons: risk.reasons,
    isNewDevice: !knownDevice,
    createdAtMs: now,
    lastSeenAtMs: now,
    createdAt: FieldValue.serverTimestamp(),
  });

  await recordSecurityEvent({
    type: risk.suspicious ? "login.suspicious" : "login.success",
    severity: risk.level === "high" ? "critical" : risk.level === "medium" ? "warning" : "info",
    uid,
    email,
    context: ctx,
    riskScore: risk.score,
    riskLevel: risk.level,
    reasons: risk.reasons,
    summary: `${ctx.deviceLabel} • ${ctx.geo?.country || "unknown"}`,
    metadata: { sessionId: sessionRef.id, isNewDevice: !knownDevice },
  });

  return {
    sessionId: sessionRef.id,
    risk,
    settings,
    session: publicSessionView(ctx),
  };
}

export async function heartbeatSession({ sessionId, uid, touch = true }) {
  const ref = adminDb.collection(C.sessions).doc(sessionId);
  const snap = await ref.get();
  if (!snap.exists) return { active: false, reason: "not_found" };
  const s = snap.data();
  if (s.uid !== uid) return { active: false, reason: "mismatch" };
  if (s.status !== "active") return { active: false, reason: s.revokedReason || s.status };

  const settings = await getSecuritySettings();
  const now = Date.now();
  const idleMs = settings.idleTimeoutMinutes * 60_000;
  const absMs = settings.sessionAbsoluteHours * 3_600_000;

  if (now - (s.lastSeenAtMs || s.createdAtMs || now) > idleMs) {
    await revokeSessionDoc(sessionId, { reason: "idle_timeout", by: "system" });
    await recordSecurityEvent({ type: "session.idle_timeout", uid, email: s.email, summary: s.deviceLabel });
    return { active: false, reason: "idle_timeout" };
  }
  if (now - (s.createdAtMs || now) > absMs) {
    await revokeSessionDoc(sessionId, { reason: "absolute_timeout", by: "system" });
    return { active: false, reason: "absolute_timeout" };
  }

  // Only advance lastSeen when the client reports real user activity, so the
  // idle timeout actually accrues during inactivity. Status-only checks
  // (touch=false) still detect admin force-logout / idle without resetting it.
  if (touch) await ref.update({ lastSeenAtMs: now });
  return { active: true, idleTimeoutMinutes: settings.idleTimeoutMinutes };
}

async function revokeSessionDoc(sessionId, { reason, by }) {
  await adminDb.collection(C.sessions).doc(sessionId).set(
    {
      status: "revoked",
      revokedReason: reason,
      revokedBy: by ?? null,
      revokedAtMs: Date.now(),
      revokedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function revokeSession({ sessionId, actor, reason = "forced_logout" }) {
  const snap = await adminDb.collection(C.sessions).doc(sessionId).get();
  if (!snap.exists) return { ok: false };
  const s = snap.data();
  await revokeSessionDoc(sessionId, { reason, by: actor?.email || actor?.uid || "superadmin" });
  await recordSecurityEvent({
    type: "session.force_logout",
    severity: "warning",
    uid: s.uid,
    email: s.email,
    summary: `${s.deviceLabel} revoked by ${actor?.email || "superadmin"}`,
    metadata: { sessionId, reason },
  });
  return { ok: true };
}

export async function listSessions({ uid = null, limit = 200 } = {}) {
  let ref = adminDb.collection(C.sessions);
  if (uid) {
    const q = await ref.where("uid", "==", uid).get();
    return q.docs.map((d) => ({ id: d.id, ...d.data() })).sort(byLastSeenDesc);
  }
  const q = await ref.orderBy("lastSeenAtMs", "desc").limit(limit).get();
  return q.docs.map((d) => ({ id: d.id, ...d.data() }));
}

function byLastSeenDesc(a, b) {
  return (b.lastSeenAtMs || 0) - (a.lastSeenAtMs || 0);
}

/* ---------------- consent ---------------- */

export async function getConsentStatus(uid) {
  const settings = await getSecuritySettings();
  const snap = await adminDb.collection(C.consents).doc(uid).get();
  const acceptedVersion = snap.exists ? snap.data().version : null;
  const required = settings.forceConsent && acceptedVersion !== settings.policyVersion;
  return {
    required,
    currentVersion: settings.policyVersion,
    acceptedVersion: acceptedVersion ?? null,
    acceptedAtMs: snap.exists ? snap.data().acceptedAtMs ?? null : null,
  };
}

export async function recordConsent({ uid, email, version, request }) {
  const ctx = buildSecurityContext(request, { uid });
  await adminDb.collection(C.consents).doc(uid).set(
    {
      uid,
      email: email ?? null,
      version,
      acceptedAtMs: Date.now(),
      acceptedAt: FieldValue.serverTimestamp(),
      ipMasked: ctx.ip.masked,
      deviceLabel: ctx.deviceLabel,
    },
    { merge: true },
  );
  await recordSecurityEvent({
    type: "consent.accepted",
    uid,
    email,
    context: ctx,
    summary: `Privacy policy v${version} accepted`,
    metadata: { version },
  });
  return { ok: true, version };
}

/* ---------------- login attempts (rate limit + suspicious) ---------------- */

export async function recordLoginAttempt({ email, success, request }) {
  const ctx = buildSecurityContext(request, { uid: email || "anon" });
  await adminDb.collection(C.loginAttempts).add({
    email: (email || "").toLowerCase() || null,
    success: Boolean(success),
    ipMasked: ctx.ip.masked,
    country: ctx.geo?.country ?? null,
    tsMs: Date.now(),
    createdAt: FieldValue.serverTimestamp(),
  });
  if (!success) {
    await recordSecurityEvent({
      type: "login.failed",
      severity: "warning",
      email,
      context: ctx,
      summary: `Failed sign-in for ${email || "unknown"}`,
    });
  }
}

export async function countRecentFailedLogins(email, windowMinutes) {
  if (!email) return 0;
  const since = Date.now() - windowMinutes * 60_000;
  const q = await adminDb
    .collection(C.loginAttempts)
    .where("email", "==", email.toLowerCase())
    .get();
  return q.docs.filter((d) => d.data().success === false && (d.data().tsMs || 0) >= since).length;
}

export async function evaluateLoginRateLimit({ email, request }) {
  const settings = await getSecuritySettings();
  const failures = await countRecentFailedLogins(email, settings.loginRateLimit.windowMinutes);
  const blocked = failures >= settings.loginRateLimit.maxAttempts;
  if (blocked) {
    const ctx = buildSecurityContext(request, { uid: email || "anon" });
    await recordSecurityEvent({
      type: "login.rate_limited",
      severity: "critical",
      email,
      context: ctx,
      summary: `Login rate limit hit for ${email}`,
      metadata: { failures, max: settings.loginRateLimit.maxAttempts },
    });
  }
  return { blocked, failures, max: settings.loginRateLimit.maxAttempts };
}

/* ---------------- events / audit reads ---------------- */

export async function listSecurityEvents({ limit = 30, cursor = null } = {}) {
  let query = adminDb.collection(C.events).orderBy("createdAtMs", "desc");
  if (cursor) query = query.startAfter(Number(cursor));
  const snap = await query.limit(limit + 1).get();
  const docs = snap.docs.slice(0, limit);
  const hasMore = snap.docs.length > limit;
  const events = docs.map((d) => ({ id: d.id, ...d.data() }));
  const nextCursor = hasMore ? events[events.length - 1]?.createdAtMs ?? null : null;
  return { events, nextCursor };
}

/* ---------------- live location (current admin's own session) ---------------- */

function sessionView(s) {
  return {
    id: s.id,
    deviceLabel: s.deviceLabel,
    browser: s.browser,
    os: s.os,
    deviceType: s.deviceType,
    ipMasked: s.ipMasked,
    country: s.country ?? null,
    region: s.region ?? null,
    city: s.city ?? null,
    riskLevel: s.riskLevel ?? "low",
    riskScore: s.riskScore ?? 0,
    createdAtMs: s.createdAtMs ?? null,
    lastSeenAtMs: s.lastSeenAtMs ?? null,
    livePlace: s.livePlace ?? null,
    liveCity: s.liveCity ?? null,
    liveRegion: s.liveRegion ?? null,
    liveCountry: s.liveCountry ?? null,
    liveLat: s.liveLat ?? null,
    liveLng: s.liveLng ?? null,
    liveAccuracy: s.liveAccuracy ?? null,
    locationUpdatedAtMs: s.locationUpdatedAtMs ?? null,
  };
}

export async function getCurrentSessionForUser(uid) {
  const active = await getActiveSessionsForUser(uid);
  if (!active.length) return null;
  const latest = active[active.length - 1]; // most recent lastSeen
  return sessionView(latest);
}

function roundCoord(n, dp = 3) {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}

export async function updateSessionLocation({ sessionId, uid, location }) {
  const ref = adminDb.collection(C.sessions).doc(sessionId);
  const snap = await ref.get();
  if (!snap.exists || snap.data().uid !== uid) return { ok: false };
  const loc = {
    livePlace: location.place ?? null,
    liveCity: location.city ?? null,
    liveRegion: location.region ?? null,
    liveCountry: location.country ?? null,
    liveLat: roundCoord(location.latitude),
    liveLng: roundCoord(location.longitude),
    liveAccuracy: location.accuracy != null ? Math.round(Number(location.accuracy)) : null,
    locationUpdatedAtMs: Date.now(),
  };
  await ref.set(loc, { merge: true });
  await recordSecurityEvent({
    type: "session.location",
    uid,
    email: snap.data().email,
    summary: location.place || `${loc.liveLat}, ${loc.liveLng}`,
    metadata: { sessionId, accuracy: loc.liveAccuracy },
  });
  return { ok: true, location: loc };
}
