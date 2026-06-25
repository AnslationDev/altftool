/**
 * Security module configuration: Firestore collection names, default
 * (configurable) settings, and the privacy-policy version used for consent.
 */

export const SECURITY_COLLECTIONS = {
  sessions: "admin_sessions",
  devices: "admin_devices",
  consents: "admin_consents",
  events: "security_events",
  settings: "security_settings",
  loginAttempts: "security_login_attempts",
  audit: "admin_audit_logs",
};

export const SETTINGS_DOC_ID = "global";

/**
 * Bump POLICY_VERSION whenever the Privacy & Security policy text changes.
 * Admins whose stored consent version is lower will be re-prompted.
 */
export const PRIVACY_POLICY_VERSION = "2026.06.2";

export const PRIVACY_POLICY_SUMMARY =
  "To protect your account and the platform, we record security-relevant " +
  "activity for each admin session: the device and browser you use, an " +
  "anonymised (masked) IP address with an encrypted copy retained for " +
  "security investigations, your approximate location (country/region from " +
  "network metadata), sign-in times, and the administrative actions you " +
  "perform. If you choose “Detect my live location”, your browser asks for " +
  "permission and your precise location (rounded for privacy) is attached to " +
  "your session so admins can verify access. This data is used only for " +
  "security, auditing, and abuse prevention, is visible only to Super Admins, " +
  "and is never sold or used for advertising.";

export const DEFAULT_SECURITY_SETTINGS = Object.freeze({
  deviceLimit: 3, // max concurrent active devices per admin
  idleTimeoutMinutes: 30, // auto sign-out after inactivity
  sessionAbsoluteHours: 24, // hard cap on a single session
  loginRateLimit: { maxAttempts: 8, windowMinutes: 10 }, // per email/IP
  suspiciousLoginDetection: true,
  forceConsent: true,
  policyVersion: PRIVACY_POLICY_VERSION,
});

export function normalizeSettings(raw) {
  const s = raw || {};
  const rl = s.loginRateLimit || {};
  return {
    deviceLimit: clampInt(s.deviceLimit, 1, 25, DEFAULT_SECURITY_SETTINGS.deviceLimit),
    idleTimeoutMinutes: clampInt(s.idleTimeoutMinutes, 1, 480, DEFAULT_SECURITY_SETTINGS.idleTimeoutMinutes),
    sessionAbsoluteHours: clampInt(s.sessionAbsoluteHours, 1, 168, DEFAULT_SECURITY_SETTINGS.sessionAbsoluteHours),
    loginRateLimit: {
      maxAttempts: clampInt(rl.maxAttempts, 1, 100, DEFAULT_SECURITY_SETTINGS.loginRateLimit.maxAttempts),
      windowMinutes: clampInt(rl.windowMinutes, 1, 120, DEFAULT_SECURITY_SETTINGS.loginRateLimit.windowMinutes),
    },
    suspiciousLoginDetection:
      typeof s.suspiciousLoginDetection === "boolean"
        ? s.suspiciousLoginDetection
        : DEFAULT_SECURITY_SETTINGS.suspiciousLoginDetection,
    forceConsent:
      typeof s.forceConsent === "boolean" ? s.forceConsent : DEFAULT_SECURITY_SETTINGS.forceConsent,
    policyVersion: s.policyVersion || PRIVACY_POLICY_VERSION,
  };
}

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
