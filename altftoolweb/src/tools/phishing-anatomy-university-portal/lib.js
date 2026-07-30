/**
 * University-portal phishing anatomy.
 *
 * Pure helpers — no React, no DOM, no network. The point of the module is to
 * decide, from the text of a URL alone, whether a "student portal" login page
 * is actually on the institution's own registrable domain.
 */

/**
 * Restricted academic namespaces. These matter because an attacker cannot
 * simply buy a name in them, which is why fake portals live on ordinary
 * commercial domains that only mention the university.
 */
export const ACADEMIC_SUFFIXES = [
  { suffix: "edu", note: "Restricted to US postsecondary institutions accredited by an agency recognised by the US Department of Education; the registry is operated by Educause." },
  { suffix: "ac.uk", note: "Administered by Jisc for UK further and higher education; eligibility is checked before a name is issued." },
  { suffix: "ac.in", note: "Reserved for Indian academic institutions under the .in policy administered by NIXI/ERNET." },
  { suffix: "edu.in", note: "Indian educational institutions, issued under the .in second-level policy." },
  { suffix: "edu.au", note: "Australian education sector names, issued under auDA policy to eligible institutions." },
  { suffix: "ac.nz", note: "New Zealand tertiary institutions, eligibility checked by the .nz moderator." },
  { suffix: "ac.za", note: "South African academic institutions." },
  { suffix: "ac.jp", note: "Japanese higher education and research institutions." },
  { suffix: "edu.sg", note: "Singapore educational institutions." },
  { suffix: "edu.pk", note: "Pakistani educational institutions, moderated by PKNIC." },
];

/** Two-label public suffixes we need for eTLD+1. Approximation of the PSL, weighted towards academic namespaces. */
const MULTI_LABEL_SUFFIXES = new Set([
  "ac.uk", "co.uk", "org.uk", "gov.uk", "sch.uk", "me.uk", "net.uk",
  "ac.in", "edu.in", "co.in", "net.in", "org.in", "gov.in", "nic.in", "res.in",
  "edu.au", "com.au", "net.au", "org.au", "gov.au", "asn.au",
  "ac.nz", "co.nz", "org.nz", "school.nz",
  "ac.za", "co.za", "org.za", "edu.za",
  "ac.jp", "co.jp", "or.jp", "ne.jp", "go.jp",
  "edu.sg", "com.sg", "edu.my", "com.my", "edu.pk", "com.pk", "edu.bd",
  "edu.hk", "edu.cn", "com.cn", "ac.cn", "edu.tw", "com.tw",
  "com.br", "edu.br", "com.mx", "edu.mx", "com.tr", "edu.tr",
  "ac.ir", "ac.ke", "ac.th", "edu.vn", "edu.ph", "edu.ng", "edu.gh",
]);

/** Words attackers glue onto a domain so it reads like a portal. */
export const PORTAL_DECOY_WORDS = [
  "login", "signin", "sign-in", "portal", "student", "sso", "webmail", "account",
  "auth", "secure", "verify", "myaccount", "office365", "microsoft", "outlook", "moodle", "blackboard", "canvas",
];

/** Reasons a fake portal gives for asking you to log in again. */
export const PRETEXT_PHRASES = [
  "session expired", "your account will be deactivated", "storage quota", "mailbox is full",
  "re-validate", "revalidate your account", "library access will be suspended", "confirm your student status",
  "unusual sign-in", "update your password to continue", "scholarship", "fee refund", "results are available",
];

/** What the fake login page itself gets wrong. Static reference used by the UI. */
export const PORTAL_PAGE_TELLS = [
  {
    tell: "Your password manager does not offer to fill it",
    why: "A password manager matches on the exact registrable domain, not on how the page looks. Silence from it is a stronger signal than anything on the screen.",
  },
  {
    tell: "The address bar is part of the page",
    why: "In a browser-in-the-browser attack the whole 'popup window', address bar included, is HTML drawn inside the page. Drag the window past the edge of the browser — a real one moves, a fake one cannot.",
  },
  {
    tell: "It asks for the password before the username page",
    why: "Most institutional single sign-on collects the username first, then redirects to the identity provider. A single combined form is often a copy of an older login page.",
  },
  {
    tell: "The form posts to a different host",
    why: "The page can be hosted anywhere and still submit to a collector script elsewhere. Viewing the page source and reading the form action reveals where the credentials actually go.",
  },
  {
    tell: "It accepts anything",
    why: "Harvesting pages usually reply 'incorrect password' once so you type it again carefully, then forward you to the real site so nothing seems wrong.",
  },
  {
    tell: "It asks for the authenticator code as well",
    why: "Real-time phishing kits relay your one-time code to the genuine site within seconds. A code prompt on a page you reached from a link is not proof the page is genuine.",
  },
];

/** Worked examples the UI can load. Domains are illustrative, not real sites. */
export const EXAMPLE_LINKS = [
  {
    label: "Name pushed into the subdomain",
    url: "http://ox.ac.uk.student-login.verify-portal.com/sso/login?next=https://ox.ac.uk",
    official: "ox.ac.uk",
  },
  {
    label: "The @ trick",
    url: "https://ox.ac.uk@credential-collect.example/login",
    official: "ox.ac.uk",
  },
  {
    label: "Look-alike written in another script",
    url: "https://оксфорд.com/portal",
    official: "ox.ac.uk",
  },
  {
    label: "A genuine institutional sign-in",
    url: "https://sso.ox.ac.uk/login?service=timetable",
    official: "ox.ac.uk",
  },
];

/** Ordered checks that resolve the question for a student. */
export const STUDENT_CHECKLIST = [
  "Do not use the link. Open the portal from your bookmark, the university app, or by typing the address you already know.",
  "Read the host from right to left: the last two or three labels before the first slash are the real site.",
  "Check that your password manager recognises the page. If it does not, treat the page as unknown.",
  "If you already typed the password, change it on the real portal now and sign out all sessions.",
  "Tell your university IT service desk, so the page can be blocked for everyone else.",
];

export const VERDICTS = {
  mismatch: { label: "Not your institution's domain", tone: "danger" },
  unsafe: { label: "Right domain, unsafe link", tone: "warn" },
  unknown: { label: "Domain unknown — compare it yourself", tone: "warn" },
  match: { label: "Registrable domain matches your institution", tone: "ok" },
};

/** Best-effort registrable domain (eTLD+1). */
export function registrableDomain(host) {
  const clean = String(host ?? "").trim().toLowerCase()
    .replace(/^https?:\/\//, "").replace(/[/?#].*$/, "").replace(/\.+$/, "");
  if (!clean) return "";
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(clean) || clean.includes(":")) return clean;
  const labels = clean.split(".").filter(Boolean);
  if (labels.length <= 2) return labels.join(".");
  const lastTwo = labels.slice(-2).join(".");
  if (MULTI_LABEL_SUFFIXES.has(lastTwo)) return labels.slice(-3).join(".");
  return lastTwo;
}

/** The academic suffix a host sits under, or null. */
export function academicSuffixOf(host) {
  const clean = String(host ?? "").trim().toLowerCase();
  return (
    ACADEMIC_SUFFIXES.find((entry) => clean === entry.suffix || clean.endsWith(`.${entry.suffix}`)) ?? null
  );
}

/**
 * Parse a URL into the parts a reader has to judge.
 * @returns {{error:string}|{scheme,userinfo,host,port,path,query,fragment,addedScheme:boolean}}
 */
export function splitUrl(rawUrl) {
  const raw = String(rawUrl ?? "").trim();
  if (!raw) return { error: "Paste the link you were sent." };
  // Browsers treat backslashes in the authority as slashes; normalise so the
  // host we show is the host the browser would use.
  const normalised = raw.replace(/\\/g, "/");
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(normalised);
  const candidate = hasScheme ? normalised : `https://${normalised}`;

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return { error: "That is not a link this tool can read. Copy it again, including everything up to the first space." };
  }
  if (!parsed.hostname) {
    return { error: "No host found in that link, so there is nothing to compare." };
  }

  return {
    scheme: parsed.protocol.replace(/:$/, ""),
    userinfo: parsed.username ? `${parsed.username}${parsed.password ? ":…" : ""}` : "",
    host: parsed.hostname.toLowerCase(),
    port: parsed.port,
    path: parsed.pathname,
    query: parsed.search,
    fragment: parsed.hash,
    addedScheme: !hasScheme,
    hadBackslash: raw.includes("\\"),
  };
}

function pushFinding(list, severity, weight, title, detail) {
  list.push({ severity, weight, title, detail });
}

/**
 * Compare a suspicious portal link against the institution's real domain.
 *
 * @param {object} input
 * @param {string} input.url             The link from the message.
 * @param {string} input.officialDomain  The domain you already know, e.g. "ox.ac.uk".
 */
export function analysePortalUrl({ url = "", officialDomain = "" } = {}) {
  const parts = splitUrl(url);
  if (parts.error) return { error: parts.error };

  const official = String(officialDomain ?? "").trim().toLowerCase();
  const officialReg = official ? registrableDomain(official) : "";
  const hostReg = registrableDomain(parts.host);
  const labels = parts.host.split(".").filter(Boolean);
  const regLabels = hostReg.split(".").filter(Boolean).length;
  const subdomain = labels.slice(0, Math.max(0, labels.length - regLabels)).join(".");
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(parts.host);

  const findings = [];

  if (parts.userinfo) {
    pushFinding(findings, "critical", 34, "Credentials-style text before an @ sign",
      `Everything before the @ in the authority ("${parts.userinfo}") is user information the browser ignores when choosing where to connect. The site you reach is ${parts.host}.`);
  }

  if (parts.hadBackslash) {
    pushFinding(findings, "critical", 20, "Backslashes in the link",
      "Browsers convert backslashes in the authority to forward slashes, so a link written with \\ can end the host earlier than it appears to.");
  }

  if (isIp) {
    pushFinding(findings, "critical", 30, "Raw IP address instead of a name",
      "A university portal is reached by name, with a certificate issued for that name. A bare IP address has no institutional identity attached to it at all.");
  }

  const punyLabels = labels.filter((l) => l.startsWith("xn--"));
  if (punyLabels.length) {
    pushFinding(findings, "critical", 28, "Punycode in the host",
      `The label ${punyLabels.join(", ")} is a Unicode name encoded for DNS. Characters from other scripts can render as Latin letters, so the name on screen may not be the name that was resolved.`);
  }

  if (parts.scheme === "http") {
    pushFinding(findings, "critical", 24, "Login page served over plain HTTP",
      "Anything typed into an http:// page travels unencrypted. No institutional single sign-on runs over plain HTTP.");
  } else if (parts.scheme !== "https") {
    pushFinding(findings, "warn", 16, `Unusual scheme: ${parts.scheme}`,
      "Web sign-in pages use https. Another scheme may be trying to hand the link to a different application.");
  }

  if (parts.port && parts.port !== "443" && parts.port !== "80") {
    pushFinding(findings, "warn", 12, `Non-standard port :${parts.port}`,
      "Public university services are published on the default ports. An odd port often means a service running on a rented host rather than institutional infrastructure.");
  }

  if (labels.length >= 5 && !isIp) {
    pushFinding(findings, "warn", 14, "Long chain of subdomains",
      `The host has ${labels.length} labels. Padding pushes the real domain off the right-hand edge of a phone's address bar, where it is invisible.`);
  }

  const decoyInSub = PORTAL_DECOY_WORDS.filter((w) => subdomain.includes(w));
  if (decoyInSub.length && officialReg && hostReg !== officialReg) {
    pushFinding(findings, "warn", 12, "Portal words used as decoration",
      `"${decoyInSub[0]}" appears in the subdomain, which the owner of ${hostReg} chose freely. Subdomains say nothing about who runs the site.`);
  }

  if (officialReg && subdomain.includes(officialReg.split(".")[0]) && hostReg !== officialReg) {
    pushFinding(findings, "critical", 30, "Your institution's name used as a subdomain",
      `"${officialReg.split(".")[0]}" sits to the left of ${hostReg}, so it is a label chosen by whoever owns ${hostReg}. The real owner is always the rightmost part of the host.`);
  }

  const embedded = /https?%3a%2f%2f|https?:\/\//i.test(`${parts.query}${parts.fragment}`);
  if (embedded) {
    pushFinding(findings, "warn", 14, "Another URL carried in the query string",
      "A second address in the parameters is typical of a redirect. Even on a genuine host, an open redirect can bounce you to a page the institution does not control.");
  }

  const officialAcademic = officialReg ? academicSuffixOf(officialReg) : null;
  const hostAcademic = academicSuffixOf(parts.host);
  if (officialAcademic && !hostAcademic) {
    pushFinding(findings, "critical", 22, `Your institution is on .${officialAcademic.suffix}, this link is not`,
      `${officialAcademic.note} That restriction is why fake portals use ordinary commercial domains such as ${hostReg}.`);
  }

  let verdict;
  if (!officialReg) {
    verdict = "unknown";
    pushFinding(findings, "info", 0, "No institution domain given",
      "Enter the domain you already know — from your student card, a printed handbook or the address you normally type — so the two can be compared.");
  } else if (hostReg === officialReg) {
    verdict = findings.some((f) => f.severity === "critical") ? "unsafe" : "match";
    pushFinding(findings, verdict === "match" ? "ok" : "warn", 0, "Registrable domain matches",
      `${hostReg} is the domain you named. A matching domain still does not prove the individual page is genuine if the link also carries a redirect or arrived unexpectedly.`);
  } else {
    verdict = "mismatch";
    pushFinding(findings, "critical", 36, "Different registrable domain",
      `The browser will connect to ${hostReg}, not ${officialReg}. Nothing else in the link changes that — not the subdomain, not the path, not the padlock.`);
  }

  const breakdown = [
    { part: "Scheme", value: parts.scheme, decides: false, note: parts.addedScheme ? "Assumed https because the link had no scheme." : "How the browser talks to the server." },
    ...(parts.userinfo ? [{ part: "User info (before @)", value: parts.userinfo, decides: false, note: "Ignored when choosing the destination. Pure decoration in a phishing link." }] : []),
    ...(subdomain ? [{ part: "Subdomain", value: subdomain, decides: false, note: "Chosen freely by whoever owns the registrable domain. Can say anything." }] : []),
    { part: "Registrable domain", value: hostReg, decides: true, note: "The only part that identifies the owner. Read the host right to left and stop here." },
    ...(parts.port ? [{ part: "Port", value: parts.port, decides: false, note: "Which service on the host answers." }] : []),
    { part: "Path", value: parts.path || "/", decides: false, note: "Chosen by the site owner after you have already connected. Never proves identity." },
    ...(parts.query ? [{ part: "Query", value: parts.query, decides: false, note: "Parameters passed to the page, often carrying your address or a redirect target." }] : []),
    ...(parts.fragment ? [{ part: "Fragment", value: parts.fragment, decides: false, note: "Never sent to the server at all; handled inside the browser." }] : []),
  ];

  const score = Math.min(100, findings.reduce((sum, f) => sum + f.weight, 0));
  const order = { critical: 0, warn: 1, info: 2, ok: 3 };

  return {
    score,
    verdict,
    verdictLabel: VERDICTS[verdict].label,
    tone: VERDICTS[verdict].tone,
    host: parts.host,
    registrableDomain: hostReg,
    subdomain,
    officialRegistrable: officialReg,
    breakdown,
    findings: findings.sort((a, b) => (order[a.severity] - order[b.severity]) || (b.weight - a.weight)),
  };
}
