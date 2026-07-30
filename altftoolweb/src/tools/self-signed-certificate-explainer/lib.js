/**
 * Self-signed certificate risk explainer.
 *
 * TLS gives you two things: confidentiality and authentication. A self-signed
 * certificate still delivers the first one against a passive eavesdropper, and
 * delivers none of the second — an active attacker on the path can present its
 * own self-signed certificate and the client has no way to tell the difference.
 * That single fact is what makes self-signed fine in some places and reckless
 * in others, and it is what this module scores.
 *
 * Documented behaviour the findings rely on:
 *  - http://localhost, http://127.0.0.1 and http://[::1] are potentially
 *    trustworthy origins under the W3C Secure Contexts specification, so
 *    service workers, getUserMedia, WebCrypto's SubtleCrypto and the rest of
 *    the secure-context APIs already work there without any certificate.
 *  - Once a host has sent a Strict-Transport-Security header, browsers remove
 *    the certificate-warning bypass for that host. There is no "Proceed
 *    anyway" link, so a self-signed certificate on an HSTS host is simply
 *    unreachable in a browser.
 *  - Chrome has ignored the certificate Common Name since Chrome 58; a
 *    subjectAltName entry is required. Apple platforms have required SANs
 *    since iOS 13 and macOS 10.15.
 *  - Publicly trusted TLS certificates are capped at 398 days by the CA/Browser
 *    Forum Baseline Requirements (effective 1 September 2020). Ballot SC-081,
 *    adopted in 2025, steps that down to 200 days in March 2026, 100 days in
 *    March 2027 and 47 days in March 2029 — so automated renewal stops being
 *    optional for public certificates.
 *  - Android apps targeting API level 24 (Android 7.0) and above do not trust
 *    user-installed CA certificates by default; a Network Security Config is
 *    needed, which is why "just install our CA" fails on Android.
 *  - HTTP Public Key Pinning was removed from Chrome in version 72 and is not
 *    a usable alternative today.
 *
 * Informational engineering guidance, not a security audit of your system.
 */

export const CONTEXTS = [
  {
    id: "localhost",
    label: "Local development on localhost",
    base: 5,
    guidance:
      "You usually need no certificate at all. localhost is already a secure context, so service workers, getUserMedia and WebCrypto work over plain HTTP. If you do want HTTPS locally, generate a local CA with mkcert so the browser trusts it silently instead of training you to click through a warning.",
  },
  {
    id: "ci",
    label: "CI or test fixture",
    base: 5,
    guidance:
      "A throwaway self-signed certificate is fine here — the client and server are both yours and both short-lived. Generate it inside the job rather than committing a key, and never reuse the fixture's trust settings in application code.",
  },
  {
    id: "lan-device",
    label: "A device on your own LAN (NAS, printer, router UI)",
    base: 25,
    guidance:
      "Acceptable if only you use it. The better fix is a real certificate from a public CA issued by DNS-01 challenge against a domain you own, pointed at the private IP — the host never has to be reachable from the internet for that to work.",
  },
  {
    id: "internal-corp",
    label: "An internal service used across a company",
    base: 40,
    guidance:
      "Run a private CA properly instead of scattering self-signed leaves. An internal ACME CA distributes and renews certificates automatically, and the root goes out once through device management. Self-signed leaves here mean nobody can tell a real outage from an attack.",
  },
  {
    id: "m2m",
    label: "Machine-to-machine API or mTLS",
    base: 35,
    guidance:
      "Self-signed is defensible when the client pins the exact certificate or its own CA, because you have replaced the public trust store with a smaller, tighter one. It is indefensible when the client simply skips verification to make it work.",
  },
  {
    id: "staging",
    label: "Staging or preview, used by real people",
    base: 60,
    guidance:
      "Use the same certificate path as production. Staging is where habits are formed, and staging often holds a copy of real data. A free automated public certificate costs nothing and removes the warning entirely.",
  },
  {
    id: "iot",
    label: "A device shipped to customers",
    base: 75,
    guidance:
      "Do not ship a self-signed certificate that end users must accept. The customer cannot distinguish your certificate from an attacker's, and the click-through habit follows them everywhere. Ship with a device-specific certificate from a CA you control and pin your own root in the companion app.",
  },
  {
    id: "public",
    label: "Public production site",
    base: 95,
    guidance:
      "There is no case for it. Automated public certificates are free, issue in seconds, and renew without human involvement. A self-signed certificate here means browser interstitials, blocked HSTS hosts, and failed API clients.",
  },
];

export const CONTEXT_IDS = CONTEXTS.map((item) => item.id);

export const TRUST_MODELS = [
  {
    id: "self-signed-leaf",
    label: "A bare self-signed certificate, trusted nowhere",
    factor: 1,
    authentication: "None. Any active attacker can substitute their own certificate undetected.",
  },
  {
    id: "self-signed-pinned",
    label: "Self-signed, but the client pins this exact certificate",
    factor: 0.35,
    authentication:
      "Strong for this one pair. The pin is the trust anchor, so substitution fails — but rotation is now a manual, breaking change.",
  },
  {
    id: "private-ca",
    label: "Issued by a private CA installed in the trust stores",
    factor: 0.45,
    authentication:
      "Real, within your fleet. Anything holding your root will verify the certificate; anything outside it will not.",
  },
  {
    id: "public-ca",
    label: "Issued by a publicly trusted CA",
    factor: 0.15,
    authentication: "Real and universal. This is the baseline everything else is measured against.",
  },
];

export const TRUST_MODEL_IDS = TRUST_MODELS.map((item) => item.id);

/**
 * Exposure penalties. These describe how much there is to lose, so they are
 * scaled by the same trust factor as the baseline: a public site behind a
 * properly issued certificate is not made risky by having users or handling
 * credentials, it is made risky by not being able to prove who it is.
 *
 * disabledVerification is the exception. Turning verification off in the
 * client discards whatever trust anchor you configured, so it both forces the
 * trust factor back to 1 and adds a flat penalty of its own.
 */
export const PENALTIES = {
  handlesSecrets: 15,
  teachesClickThrough: 20,
  internetReachable: 15,
  browserUsers: 8,
};

export const DISABLED_VERIFICATION_PENALTY = 25;

/** Risk bands, low bound inclusive. */
export const BANDS = [
  { min: 85, id: "stop", label: "Do not ship this", tone: "danger" },
  { min: 65, id: "risky", label: "Risky — fix before anyone else depends on it", tone: "danger" },
  { min: 40, id: "habit", label: "Bad habit — it will spread", tone: "warning" },
  { min: 20, id: "conditional", label: "Acceptable with conditions", tone: "warning" },
  { min: 0, id: "fine", label: "Fine as it is", tone: "success" },
];

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/**
 * Score a self-signed certificate setup.
 *
 * @param {object} input
 * @param {string} input.context      One of CONTEXT_IDS.
 * @param {string} input.trustModel   One of TRUST_MODEL_IDS.
 * @param {boolean} input.browserUsers        Humans reach it in a browser.
 * @param {boolean} input.handlesSecrets      It carries credentials, personal or payment data.
 * @param {boolean} input.teachesClickThrough Humans are told to accept the warning.
 * @param {boolean} input.disabledVerification Client code turns verification off.
 * @param {boolean} input.internetReachable   The host answers from the public internet.
 * @param {boolean} input.hstsEnabled         The host sends Strict-Transport-Security.
 * @param {boolean} input.androidApp          An Android app is one of the clients.
 * @returns {object} assessment, or { error }.
 */
export function assessCertificate({
  context,
  trustModel,
  browserUsers = false,
  handlesSecrets = false,
  teachesClickThrough = false,
  disabledVerification = false,
  internetReachable = false,
  hstsEnabled = false,
  androidApp = false,
} = {}) {
  const ctx = CONTEXTS.find((item) => item.id === context);
  if (!ctx) return { error: "Choose where this certificate is being used." };

  const model = TRUST_MODELS.find((item) => item.id === trustModel);
  if (!model) return { error: "Choose how clients are meant to trust this certificate." };

  // Skipping verification in the client throws away whatever anchor was
  // configured, so the trust model stops counting for anything.
  const factor = disabledVerification ? 1 : model.factor;

  // Every contribution is an integer so the breakdown adds up to the score.
  const baseAfterTrust = Math.round(ctx.base * factor);
  let score = baseAfterTrust;
  const contributions = [
    { label: `${ctx.label} — baseline exposure`, points: ctx.base },
    {
      label: disabledVerification
        ? "Verification is disabled, so the trust model counts for nothing (×1)"
        : `${model.label} — trust multiplier ×${model.factor}`,
      points: baseAfterTrust - ctx.base,
    },
  ];

  const addPenalty = (flag, key, label) => {
    if (!flag) return;
    const points = Math.round(PENALTIES[key] * factor);
    score += points;
    contributions.push({ label, points });
  };

  addPenalty(browserUsers, "browserUsers", "People reach it in a browser");
  addPenalty(handlesSecrets, "handlesSecrets", "It carries credentials or personal data");
  addPenalty(teachesClickThrough, "teachesClickThrough", "Humans are trained to accept the warning");
  addPenalty(internetReachable, "internetReachable", "Reachable from the public internet");

  if (disabledVerification) {
    score += DISABLED_VERIFICATION_PENALTY;
    contributions.push({
      label: "Client code turns certificate verification off",
      points: DISABLED_VERIFICATION_PENALTY,
    });
  } else if (model.id === "public-ca" || model.id === "self-signed-pinned") {
    score -= 5;
    contributions.push({ label: "Identity is actually verified", points: -5 });
  }

  score = Math.round(clamp(score, 0, 100));
  const band = BANDS.find((item) => score >= item.min);

  const findings = [];
  const push = (severity, title, detail, fix) =>
    findings.push({ severity, title, detail, fix });

  if (disabledVerification) {
    push(
      "critical",
      "Verification is switched off in the client",
      "Setting rejectUnauthorized to false, passing curl -k, or verify=False removes authentication for every host that code talks to, not just the one you were debugging. Encryption still happens, so traffic looks fine while an on-path attacker reads and rewrites it.",
      "Delete the flag and install the issuing CA instead, or pass that one CA to the client as its trust anchor for that connection only.",
    );
  }

  if (teachesClickThrough) {
    push(
      "critical",
      "You are training people to ignore certificate warnings",
      "This is the real cost of self-signed certificates. Someone who has clicked through a hundred internal warnings will click through the one that matters. The habit does not stay inside your network.",
      "Make the warning impossible: distribute a private CA root through device management, or use a publicly trusted certificate so there is never anything to click through.",
    );
  }

  if (hstsEnabled && ["self-signed-leaf", "self-signed-pinned"].includes(model.id) && browserUsers) {
    push(
      "critical",
      "HSTS removes the bypass entirely",
      "Once a host has sent Strict-Transport-Security, browsers drop the Proceed anyway link for it. The site is not merely warned about — in a browser it is unreachable until the certificate validates.",
      "Either serve a certificate that chains to a trusted root, or drop the HSTS header on this host while it is untrusted. Clearing local HSTS state is a workaround for one machine, not a fix.",
    );
  }

  if (androidApp && model.id === "private-ca") {
    push(
      "high",
      "Android apps will not see your installed CA",
      "Apps targeting API level 24 (Android 7.0) and later ignore user-installed CA certificates by default, so telling users to install your root does nothing for the app — only for the system browser.",
      "Ship a Network Security Config that names your CA as a trust anchor for the specific domains, or pin the certificate in the app's networking layer.",
    );
  }

  if (handlesSecrets && model.id === "self-signed-leaf") {
    push(
      "high",
      "Real credentials over an unauthenticated channel",
      "Self-signed gives confidentiality against a passive listener and nothing against an active one. A machine-in-the-middle can present its own self-signed certificate, terminate the connection and collect every credential that crosses it.",
      "Fix the trust anchor before anything else: pin the certificate in the client, or issue from a CA the clients already trust.",
    );
  }

  if (internetReachable && model.id !== "public-ca") {
    push(
      "high",
      "Publicly reachable without public trust",
      "Anything on the open internet is scanned continuously. A host presenting an untrusted certificate is both an availability problem and a signal that the service is unmaintained.",
      "Automated certificates from a public CA are free and issue in under a minute. If the hostname must stay private, use a DNS-01 challenge so the host never needs to accept inbound requests for validation.",
    );
  }

  if (context === "localhost") {
    push(
      "info",
      "You may not need a certificate here at all",
      "localhost, 127.0.0.1 and [::1] are potentially trustworthy origins under the Secure Contexts specification, so service workers, getUserMedia, the Clipboard API and WebCrypto's SubtleCrypto all work over plain HTTP.",
      "Only add local TLS when you need to reproduce something HTTPS-specific, such as Secure cookies, HSTS behaviour or mixed-content rules — and then use a local CA rather than a bare self-signed certificate.",
    );
  }

  if (model.id === "self-signed-pinned") {
    push(
      "medium",
      "Pinning moves the problem to rotation",
      "A pin is a strong trust anchor and a hard operational constraint: the day the certificate is replaced, every client that has not been updated first will fail closed.",
      "Pin the CA rather than the leaf where you can, keep a backup pin for the next key, and give the certificate a long enough life that rotation is a planned event.",
    );
  }

  if (model.id === "public-ca") {
    push(
      "info",
      "Watch the shrinking validity window",
      "Publicly trusted certificates are capped at 398 days today, dropping to 200 days in March 2026, 100 days in March 2027 and 47 days in March 2029 under CA/Browser Forum ballot SC-081.",
      "Automate renewal now. Any process that depends on someone remembering will break once certificates last weeks rather than a year.",
    );
  }

  if (["self-signed-leaf", "self-signed-pinned", "private-ca"].includes(model.id)) {
    push(
      "medium",
      "Include a subjectAltName, not just a Common Name",
      "Chrome has ignored the certificate Common Name since Chrome 58, and Apple platforms have required SANs since iOS 13 and macOS 10.15. A CN-only certificate fails even when the name matches.",
      "Generate the certificate with a SAN entry per hostname and IP address the clients will actually use.",
    );
  }

  const severityRank = { critical: 0, high: 1, medium: 2, info: 3 };
  findings.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  const guarantees = [
    {
      label: "Hidden from a passive eavesdropper",
      value: true,
      note: "Encryption works the same regardless of who signed the certificate.",
    },
    {
      label: "Protected from an active machine-in-the-middle",
      value: model.id !== "self-signed-leaf" && !disabledVerification,
      note:
        model.id === "self-signed-leaf"
          ? "No. Nothing distinguishes your certificate from an attacker's."
          : disabledVerification
            ? "No — the client skips the check, so the trust anchor is never consulted."
            : model.authentication,
    },
    {
      label: "Loads in a browser without a warning",
      value: model.id === "public-ca" || model.id === "private-ca",
      note:
        model.id === "private-ca"
          ? "Only on machines that already hold your root certificate."
          : model.id === "public-ca"
            ? "Yes, on any up-to-date client."
            : "No. Every browser shows an interstitial, and HSTS hosts show no way past it.",
    },
    {
      label: "Works for third-party API clients you do not control",
      value: model.id === "public-ca",
      note:
        model.id === "public-ca"
          ? "Yes — that is the point of public trust."
          : "No. Every client would have to be configured with your anchor first.",
    },
    {
      label: "Appears in Certificate Transparency logs",
      value: model.id === "public-ca",
      note:
        model.id === "public-ca"
          ? "Yes, which lets you monitor for certificates issued for your names."
          : "No. Internal hostnames stay private, but you also lose the audit trail.",
    },
  ];

  return {
    score,
    band,
    context: ctx,
    trustModel: model,
    contributions,
    findings,
    guarantees,
    criticalCount: findings.filter((item) => item.severity === "critical").length,
    guidance: ctx.guidance,
  };
}

/** Plain-text export for the copy button. */
export function formatAssessment(result) {
  if (!result || result.error) return "";
  const lines = [
    "Self-signed certificate risk assessment",
    `${result.context.label} · ${result.trustModel.label}`,
    `Risk score ${result.score}/100 — ${result.band.label}`,
    "",
    "FINDINGS:",
    ...result.findings.flatMap((item) => [
      `  [${item.severity.toUpperCase()}] ${item.title}`,
      `      ${item.detail}`,
      `      Fix: ${item.fix}`,
    ]),
    "",
    "WHAT YOU ACTUALLY GET:",
    ...result.guarantees.map((item) => `  ${item.value ? "yes" : "no "} — ${item.label}`),
    "",
    `RECOMMENDED: ${result.guidance}`,
  ];
  return lines.join("\n");
}
