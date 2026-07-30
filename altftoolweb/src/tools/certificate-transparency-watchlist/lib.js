/**
 * Certificate Transparency Watchlist.
 *
 * Two halves, both entirely local:
 *
 *   1. Build a watchlist from the domains you own — the crt.sh / Censys queries
 *      to run, plus the lookalike labels worth watching for, generated with the
 *      documented squatting techniques (omission, duplication, transposition,
 *      keyboard slip, homoglyph, hyphenation, TLD swap, combosquat).
 *
 *   2. Classify certificate names you paste back from a CT log search: which
 *      are yours, which are impersonations, and by which mechanism.
 *
 * Pure JavaScript: no DOM, no network, no clock, no randomness. This module
 * never queries a CT log — it prepares the query and reads the answer.
 */

/* ------------------------------------------------------------------ */
/* Punycode (RFC 3492)                                                 */
/* ------------------------------------------------------------------ */

const PUNY_BASE = 36;
const PUNY_TMIN = 1;
const PUNY_TMAX = 26;
const PUNY_SKEW = 38;
const PUNY_DAMP = 700;
const PUNY_INITIAL_BIAS = 72;
const PUNY_INITIAL_N = 128;

function punyDigit(codePoint) {
  if (codePoint >= 0x30 && codePoint <= 0x39) return codePoint - 0x30 + 26; // 0-9 -> 26..35
  if (codePoint >= 0x41 && codePoint <= 0x5a) return codePoint - 0x41; // A-Z -> 0..25
  if (codePoint >= 0x61 && codePoint <= 0x7a) return codePoint - 0x61; // a-z -> 0..25
  return -1;
}

function punyAdapt(delta, numPoints, firstTime) {
  let d = firstTime ? Math.floor(delta / PUNY_DAMP) : Math.floor(delta / 2);
  d += Math.floor(d / numPoints);
  let k = 0;
  while (d > ((PUNY_BASE - PUNY_TMIN) * PUNY_TMAX) / 2) {
    d = Math.floor(d / (PUNY_BASE - PUNY_TMIN));
    k += PUNY_BASE;
  }
  return k + Math.floor(((PUNY_BASE - PUNY_TMIN + 1) * d) / (d + PUNY_SKEW));
}

/**
 * Decode a single punycode-encoded label body (the part after "xn--").
 * Returns { ok: true, text } or { ok: false, error }.
 */
export function punycodeDecode(encoded) {
  if (typeof encoded !== "string" || encoded.length === 0) {
    return { ok: false, error: "Empty punycode body." };
  }

  let n = PUNY_INITIAL_N;
  let i = 0;
  let bias = PUNY_INITIAL_BIAS;
  const output = [];

  const lastDelim = encoded.lastIndexOf("-");
  let index = 0;
  if (lastDelim > 0) {
    for (let k = 0; k < lastDelim; k += 1) {
      const code = encoded.charCodeAt(k);
      if (code >= 0x80) return { ok: false, error: "Non-ASCII byte in the basic segment." };
      output.push(code);
    }
    index = lastDelim + 1;
  }

  while (index < encoded.length) {
    const oldi = i;
    let w = 1;
    for (let k = PUNY_BASE; ; k += PUNY_BASE) {
      if (index >= encoded.length) return { ok: false, error: "Truncated punycode sequence." };
      const digit = punyDigit(encoded.charCodeAt(index));
      index += 1;
      if (digit < 0) return { ok: false, error: "Invalid punycode digit." };
      i += digit * w;
      const t = k <= bias ? PUNY_TMIN : k >= bias + PUNY_TMAX ? PUNY_TMAX : k - bias;
      if (digit < t) break;
      w *= PUNY_BASE - t;
    }
    const outLength = output.length + 1;
    bias = punyAdapt(i - oldi, outLength, oldi === 0);
    n += Math.floor(i / outLength);
    i %= outLength;
    if (n > 0x10ffff) return { ok: false, error: "Code point out of range." };
    output.splice(i, 0, n);
    i += 1;
  }

  try {
    return { ok: true, text: String.fromCodePoint(...output) };
  } catch {
    return { ok: false, error: "Decoded to an invalid code point." };
  }
}

/** Decode every xn-- label in a hostname; leaves other labels untouched. */
export function decodeIdn(hostname) {
  const labels = hostname.split(".");
  let changed = false;
  const decoded = labels.map((label) => {
    if (!/^xn--/i.test(label)) return label;
    const result = punycodeDecode(label.slice(4));
    if (!result.ok) return label;
    changed = true;
    return result.text;
  });
  return { changed, unicode: decoded.join("."), labels: decoded };
}

/* ------------------------------------------------------------------ */
/* Scripts and confusables                                             */
/* ------------------------------------------------------------------ */

const SCRIPT_RANGES = [
  ["Latin", 0x0041, 0x005a],
  ["Latin", 0x0061, 0x007a],
  ["Latin", 0x00c0, 0x024f],
  ["Greek", 0x0370, 0x03ff],
  ["Cyrillic", 0x0400, 0x04ff],
  ["Cyrillic", 0x0500, 0x052f],
  ["Armenian", 0x0530, 0x058f],
  ["Hebrew", 0x0590, 0x05ff],
  ["Arabic", 0x0600, 0x06ff],
  ["Devanagari", 0x0900, 0x097f],
  ["Bengali", 0x0980, 0x09ff],
  ["Thai", 0x0e00, 0x0e7f],
  ["Han", 0x4e00, 0x9fff],
  ["Hiragana", 0x3040, 0x309f],
  ["Katakana", 0x30a0, 0x30ff],
  ["Hangul", 0xac00, 0xd7af],
];

/** Which scripts appear in a label. Digits and hyphens are script-neutral. */
export function detectScripts(label) {
  const found = [];
  for (const ch of label) {
    const code = ch.codePointAt(0);
    if (code === 0x2d || (code >= 0x30 && code <= 0x39)) continue; // hyphen, digits
    let name = "Other";
    for (const [script, start, end] of SCRIPT_RANGES) {
      if (code >= start && code <= end) {
        name = script;
        break;
      }
    }
    if (!found.includes(name)) found.push(name);
  }
  return found;
}

// Single code points that read as a Latin letter or digit.
const CONFUSABLE_CHARS = {
  // digits and punctuation that read as letters
  "0": "o",
  "1": "l",
  "3": "e",
  "4": "a",
  "5": "s",
  "6": "b",
  "7": "t",
  "8": "b",
  "9": "g",
  "|": "l",
  "!": "l",
  $: "s",
  // Latin letters that collapse onto each other
  i: "l",
  // Cyrillic
  "а": "a",
  "б": "b",
  "е": "e",
  "к": "k",
  "м": "m",
  "н": "h",
  "о": "o",
  "р": "p",
  "с": "c",
  "т": "t",
  "у": "y",
  "х": "x",
  "ѕ": "s",
  "і": "l",
  "ј": "j",
  "һ": "h",
  "ӏ": "l",
  "ԁ": "d",
  "ԛ": "q",
  "ԝ": "w",
  // Greek
  "α": "a",
  "ι": "l",
  "κ": "k",
  "ν": "v",
  "ο": "o",
  "ρ": "p",
  "τ": "t",
  "υ": "u",
  "χ": "x",
  // Latin lookalikes outside ASCII
  "ı": "l",
  "ł": "l",
  "ɡ": "g",
  "ɑ": "a",
  "ә": "e",
};

// Multi-character sequences that read as a single letter at a glance.
const CONFUSABLE_SEQUENCES = [
  ["rn", "m"],
  ["vv", "w"],
  ["cl", "d"],
  ["nn", "m"],
];

/**
 * Reduce a label to a comparison "skeleton": accents stripped, confusable code
 * points folded onto one Latin representative, then the multi-character
 * sequences folded. Two labels with the same skeleton look alike.
 */
export function skeleton(label) {
  if (typeof label !== "string") return "";
  const stripped = label
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

  let folded = "";
  for (const ch of stripped) {
    folded += Object.prototype.hasOwnProperty.call(CONFUSABLE_CHARS, ch)
      ? CONFUSABLE_CHARS[ch]
      : ch;
  }

  let result = folded;
  for (const [from, to] of CONFUSABLE_SEQUENCES) {
    result = result.split(from).join(to);
  }
  return result;
}

/* ------------------------------------------------------------------ */
/* Edit distance                                                       */
/* ------------------------------------------------------------------ */

/**
 * Optimal string alignment distance — Damerau-Levenshtein restricted to
 * adjacent transpositions, which is the variant that matches how typos are
 * actually made. Insertion, deletion, substitution and swap each cost 1.
 */
export function damerauLevenshtein(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return -1;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d = [];
  for (let i = 0; i <= m; i += 1) {
    d[i] = new Array(n + 1).fill(0);
    d[i][0] = i;
  }
  for (let j = 0; j <= n; j += 1) d[0][j] = j;

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[m][n];
}

/** Distance budget for a label of the given length. Fixed, not tuned. */
export function typoBudget(length) {
  if (length <= 4) return 1;
  if (length <= 9) return 2;
  return 3;
}

/* ------------------------------------------------------------------ */
/* Domain parsing                                                      */
/* ------------------------------------------------------------------ */

// Approximate public suffix set: every single label, plus these second-level
// suffixes. This is not the full Public Suffix List, which is why the tool says
// so rather than pretending otherwise.
const MULTI_LABEL_SUFFIXES = new Set([
  "co.uk", "org.uk", "ac.uk", "gov.uk", "me.uk", "net.uk", "sch.uk", "ltd.uk", "plc.uk", "nhs.uk",
  "com.au", "net.au", "org.au", "edu.au", "gov.au", "id.au", "asn.au",
  "co.in", "net.in", "org.in", "gen.in", "firm.in", "ind.in", "ac.in", "edu.in", "res.in", "gov.in", "nic.in",
  "co.jp", "ne.jp", "or.jp", "ac.jp", "go.jp", "ad.jp", "gr.jp", "lg.jp",
  "co.nz", "net.nz", "org.nz", "govt.nz", "ac.nz", "school.nz",
  "co.za", "org.za", "net.za", "gov.za", "ac.za", "web.za",
  "com.br", "net.br", "org.br", "gov.br", "edu.br",
  "com.cn", "net.cn", "org.cn", "gov.cn", "edu.cn", "ac.cn",
  "co.kr", "or.kr", "ne.kr", "go.kr", "re.kr", "pe.kr",
  "co.il", "org.il", "ac.il", "net.il", "gov.il",
  "com.mx", "com.ar", "com.tr", "com.sg", "com.hk", "com.tw", "com.my", "com.ph",
  "com.vn", "com.pk", "com.bd", "com.sa", "com.eg", "com.ng", "com.gh", "com.ua",
  "com.pl", "com.ru", "com.es", "com.pe", "com.co", "com.ec", "com.uy", "com.py",
  "com.bo", "com.ve", "com.do", "com.gt", "com.pa", "com.cy", "com.ro", "com.pt",
  "com.gr", "com.de", "org.in", "gov.sg", "edu.sg", "net.sg", "org.sg",
  "co.th", "in.th", "ac.th", "go.th", "or.th", "net.th",
  "co.id", "or.id", "ac.id", "go.id", "web.id", "my.id",
]);

const LABEL_RE = /^[a-z0-9¡-￿](?:[a-z0-9¡-￿-]*[a-z0-9¡-￿])?$/i;

/**
 * Normalise one certificate name or domain into its parts.
 * Accepts bare hostnames, wildcards, URLs, "CN=" prefixes and crt.sh rows.
 */
export function normalizeDomain(input) {
  if (typeof input !== "string") return { ok: false, input: String(input), error: "Not text." };

  let value = input.trim();
  if (value.length === 0) return { ok: false, input, error: "Empty." };

  // crt.sh pastes often carry an id column and tab-separated fields.
  if (value.includes("\t")) {
    const parts = value.split("\t").map((part) => part.trim()).filter(Boolean);
    value = parts.find((part) => part.includes(".")) || value;
  }
  value = value.replace(/^CN\s*=\s*/i, "").replace(/^DNS\s*:\s*/i, "");
  value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  value = value.split("/")[0].split("?")[0];
  value = value.replace(/^"|"$/g, "").replace(/[,;]$/, "");
  value = value.replace(/:\d+$/, "");
  value = value.replace(/\.$/, "");
  value = value.toLowerCase();

  let wildcard = false;
  if (value.startsWith("*.")) {
    wildcard = true;
    value = value.slice(2);
  }

  if (value.length === 0) return { ok: false, input, error: "Nothing left after trimming." };
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) {
    return { ok: false, input, error: "That is an IP address, not a domain name." };
  }

  const labels = value.split(".");
  if (labels.length < 2) {
    return { ok: false, input, error: "Needs at least a name and a suffix, like example.com." };
  }
  for (const label of labels) {
    if (label.length === 0) return { ok: false, input, error: "Empty label (a doubled dot)." };
    if (label.length > 63) return { ok: false, input, error: `Label "${label}" exceeds 63 characters.` };
    if (!LABEL_RE.test(label)) {
      return { ok: false, input, error: `Label "${label}" contains a character a hostname cannot hold.` };
    }
  }

  // Registrable domain = the label immediately left of the public suffix.
  let suffix = labels[labels.length - 1];
  if (labels.length >= 3) {
    const twoLabel = labels.slice(-2).join(".");
    if (MULTI_LABEL_SUFFIXES.has(twoLabel)) suffix = twoLabel;
  }
  const suffixLabelCount = suffix.split(".").length;
  const registrableIndex = labels.length - suffixLabelCount - 1;
  const registrableLabel = registrableIndex >= 0 ? labels[registrableIndex] : null;
  const registrable = registrableLabel ? `${registrableLabel}.${suffix}` : value;
  const subdomainLabels = labels.slice(0, Math.max(0, registrableIndex));

  const idn = decodeIdn(value);
  const scriptsByLabel = idn.labels.map((label) => detectScripts(label));
  const mixedScriptLabels = idn.labels.filter((label, index) => scriptsByLabel[index].length > 1);
  const unicodeRegistrableLabel =
    registrableIndex >= 0 ? idn.labels[registrableIndex] || registrableLabel : null;

  return {
    ok: true,
    input,
    domain: value,
    wildcard,
    labels,
    suffix,
    registrable,
    registrableLabel,
    registrableIndex,
    unicodeRegistrableLabel,
    subdomainLabels,
    punycode: idn.changed,
    unicode: idn.changed ? idn.unicode : null,
    unicodeLabels: idn.labels,
    mixedScriptLabels,
    scripts: Array.from(new Set(scriptsByLabel.flat())),
  };
}

/* ------------------------------------------------------------------ */
/* Variant generation                                                  */
/* ------------------------------------------------------------------ */

const QWERTY_NEIGHBOURS = {
  a: "qwsz", b: "vghn", c: "xdfv", d: "serfcx", e: "wsdr", f: "drtgvc",
  g: "ftyhbv", h: "gyujnb", i: "ujko", j: "huikmn", k: "jiolm", l: "kop",
  m: "njk", n: "bhjm", o: "iklp", p: "ol", q: "wa", r: "edft",
  s: "awedxz", t: "rfgy", u: "yhji", v: "cfgb", w: "qase", x: "zsdc",
  y: "tghu", z: "asx",
  0: "9o", 1: "2q", 2: "13w", 3: "24e", 4: "35r", 5: "46t",
  6: "57y", 7: "68u", 8: "79i", 9: "80o",
};

// Reverse of CONFUSABLE_CHARS restricted to ASCII output, so the generated
// variants are registrable rather than decorative.
const ASCII_CONFUSABLES = {
  a: ["4"],
  b: ["6", "8"],
  e: ["3"],
  g: ["9", "q"],
  i: ["1", "l"],
  l: ["1", "i"],
  m: ["rn"],
  o: ["0"],
  s: ["5"],
  t: ["7"],
  w: ["vv"],
  z: ["2"],
  d: ["cl"],
};

const COMBO_PREFIXES = ["login", "secure", "account", "my", "support", "verify", "mail", "auth", "id"];
const COMBO_SUFFIXES = ["login", "secure", "support", "verify", "account", "help", "pay", "app"];
const TLD_SWAPS = ["com", "net", "org", "co", "info", "biz", "online", "site", "xyz", "app", "io", "shop", "live", "cc"];

function uniqueSorted(values, exclude) {
  const set = new Set(values.filter((value) => value !== exclude && value.length > 0));
  return Array.from(set).sort();
}

/**
 * Generate lookalike labels for one registrable label, grouped by technique.
 * Deterministic and finite — the same label always yields the same lists.
 */
export function generateVariants(label) {
  if (typeof label !== "string" || label.length === 0) {
    return { error: "Nothing to vary." };
  }
  const chars = Array.from(label);
  const n = chars.length;

  const omission = [];
  const duplication = [];
  const transposition = [];
  const hyphenation = [];
  const keyboard = [];
  const homoglyph = [];

  for (let i = 0; i < n; i += 1) {
    omission.push(chars.slice(0, i).concat(chars.slice(i + 1)).join(""));
    duplication.push(chars.slice(0, i + 1).concat(chars.slice(i)).join(""));

    const neighbours = QWERTY_NEIGHBOURS[chars[i]] || "";
    for (const neighbour of neighbours) {
      keyboard.push(chars.slice(0, i).concat(neighbour, chars.slice(i + 1)).join(""));
    }

    const looks = ASCII_CONFUSABLES[chars[i]] || [];
    for (const look of looks) {
      homoglyph.push(chars.slice(0, i).concat(look, chars.slice(i + 1)).join(""));
    }
  }

  for (let i = 0; i < n - 1; i += 1) {
    const swapped = chars.slice();
    swapped[i] = chars[i + 1];
    swapped[i + 1] = chars[i];
    transposition.push(swapped.join(""));
    hyphenation.push(`${chars.slice(0, i + 1).join("")}-${chars.slice(i + 1).join("")}`);
  }

  const combosquat = [
    ...COMBO_PREFIXES.map((word) => `${word}-${label}`),
    ...COMBO_PREFIXES.map((word) => `${word}${label}`),
    ...COMBO_SUFFIXES.map((word) => `${label}-${word}`),
    ...COMBO_SUFFIXES.map((word) => `${label}${word}`),
  ];

  const groups = {
    omission: uniqueSorted(omission, label),
    duplication: uniqueSorted(duplication, label),
    transposition: uniqueSorted(transposition, label),
    keyboard: uniqueSorted(keyboard, label),
    homoglyph: uniqueSorted(homoglyph, label),
    hyphenation: uniqueSorted(hyphenation, label),
    combosquat: uniqueSorted(combosquat, label),
  };

  const all = uniqueSorted(Object.values(groups).flat(), label);
  return { label, groups, all, total: all.length };
}

export const VARIANT_TECHNIQUES = [
  ["omission", "Omission", "One character dropped — the single most common mistyping."],
  ["duplication", "Duplication", "One character typed twice."],
  ["transposition", "Transposition", "Two adjacent characters swapped."],
  ["keyboard", "Keyboard slip", "One character replaced by a QWERTY neighbour."],
  ["homoglyph", "Homoglyph", "One character replaced by an ASCII lookalike, such as l for 1 or rn for m."],
  ["hyphenation", "Hyphenation", "A hyphen inserted, which reads as the same word."],
  ["combosquat", "Combosquat", "The brand kept intact next to a trust word such as login or secure."],
];

/* ------------------------------------------------------------------ */
/* Watchlist                                                           */
/* ------------------------------------------------------------------ */

const CRTSH = "https://crt.sh/?q=";

/**
 * Build the watchlist for the domains you own.
 *
 * @param {string} domainsText one domain per line
 * @param {{ tldSwaps?: boolean }} [options]
 */
export function buildWatchlist(domainsText, options = {}) {
  if (typeof domainsText !== "string" || domainsText.trim().length === 0) {
    return { error: "Enter at least one domain you own, one per line." };
  }

  const lines = domainsText
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return { error: "Enter at least one domain you own, one per line." };
  }

  const parsed = lines.map(normalizeDomain);
  const valid = parsed.filter((item) => item.ok);
  const invalid = parsed.filter((item) => !item.ok);

  if (valid.length === 0) {
    return {
      error: `None of those lines parsed as a domain. First problem: ${invalid[0].input} — ${invalid[0].error}`,
    };
  }

  const wantTldSwaps = options.tldSwaps !== false;

  const entries = valid.map((item) => {
    const variants = generateVariants(item.registrableLabel || item.labels[0]);
    const tldVariants = wantTldSwaps
      ? uniqueSorted(
          TLD_SWAPS.map((tld) => `${item.registrableLabel}.${tld}`),
          item.registrable,
        )
      : [];

    return {
      domain: item.domain,
      registrable: item.registrable,
      registrableLabel: item.registrableLabel,
      suffix: item.suffix,
      queries: [
        {
          label: "Exact name",
          value: item.registrable,
          url: `${CRTSH}${encodeURIComponent(item.registrable)}`,
          note: "Certificates whose subject or SAN is exactly this name.",
        },
        {
          label: "All subdomains",
          value: `%.${item.registrable}`,
          url: `${CRTSH}${encodeURIComponent(`%.${item.registrable}`)}`,
          note: "The % is a SQL wildcard, so this returns every name under the domain.",
        },
        {
          label: "Label anywhere",
          value: `%${item.registrableLabel}%`,
          url: `${CRTSH}${encodeURIComponent(`%${item.registrableLabel}%`)}`,
          note: "Catches combosquats such as secure-brand.example and brand-login.net. Expect unrelated hits too.",
        },
      ],
      variants,
      tldVariants,
      watchNames: uniqueSorted(
        [
          ...variants.all.map((v) => `${v}.${item.suffix}`),
          ...tldVariants,
        ],
        item.registrable,
      ),
    };
  });

  const totalWatchNames = entries.reduce((sum, entry) => sum + entry.watchNames.length, 0);

  return {
    entries,
    invalid,
    domainCount: valid.length,
    invalidCount: invalid.length,
    totalWatchNames,
    techniques: VARIANT_TECHNIQUES,
  };
}

/* ------------------------------------------------------------------ */
/* Certificate name classification                                     */
/* ------------------------------------------------------------------ */

export const VERDICTS = {
  owned: { key: "owned", label: "Yours", level: "ok" },
  suspicious: { key: "suspicious", label: "Suspicious", level: "danger" },
  review: { key: "review", label: "Worth a look", level: "warn" },
  unrelated: { key: "unrelated", label: "Unrelated", level: "neutral" },
  invalid: { key: "invalid", label: "Could not parse", level: "warn" },
};

function isSubdomainOf(candidate, base) {
  return candidate === base || candidate.endsWith(`.${base}`);
}

/**
 * Classify pasted certificate names against the domains you own.
 *
 * @param {string} namesText one certificate name per line
 * @param {string} domainsText the domains you own, one per line
 */
export function analyzeCertificateNames(namesText, domainsText) {
  if (typeof namesText !== "string" || namesText.trim().length === 0) {
    return { error: "Paste the certificate names returned by your CT log search, one per line." };
  }
  if (typeof domainsText !== "string" || domainsText.trim().length === 0) {
    return { error: "Enter the domains you own first, so names can be compared against them." };
  }

  const owned = domainsText
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(normalizeDomain)
    .filter((item) => item.ok);

  if (owned.length === 0) {
    return { error: "None of the owned-domain lines parsed as a domain." };
  }

  const ownedSkeletons = owned.map((item) => ({
    domain: item.registrable,
    label: item.registrableLabel,
    suffix: item.suffix,
    skeleton: skeleton(item.registrableLabel || ""),
  }));

  const rawNames = namesText
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter(Boolean);

  const seen = new Set();
  const rows = [];

  for (const raw of rawNames) {
    const parsed = normalizeDomain(raw);
    if (!parsed.ok) {
      rows.push({ input: raw, verdict: "invalid", reasons: [parsed.error], parsed: null });
      continue;
    }
    const key = `${parsed.wildcard ? "*." : ""}${parsed.domain}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const reasons = [];
    let verdict = "unrelated";
    let matchedOwned = null;

    const ownedHit = owned.find((item) => isSubdomainOf(parsed.domain, item.registrable));
    if (ownedHit) {
      verdict = "owned";
      matchedOwned = ownedHit.registrable;
      reasons.push(
        parsed.domain === ownedHit.registrable
          ? `Exactly ${ownedHit.registrable}, a domain you listed.`
          : `A subdomain of ${ownedHit.registrable}, which you listed.`,
      );
      if (parsed.wildcard) {
        reasons.push("Wildcard certificate — it covers every direct child of that name, so confirm you issued it.");
      }
    } else {
      const candidateLabel = parsed.registrableLabel || "";
      // Compare skeletons on the rendered form, so xn-- names are judged by
      // what a user actually sees rather than by their ASCII encoding.
      const candidateSkeleton = skeleton(parsed.unicodeRegistrableLabel || candidateLabel);

      // Every hyphen-separated token in every label, in rendered form, with the
      // index of the label it came from.
      const tokens = [];
      parsed.unicodeLabels.forEach((label, index) => {
        for (const token of label.split("-")) {
          if (token.length > 0) tokens.push({ token, index });
        }
      });

      const raise = (level) => {
        if (level === "suspicious") verdict = "suspicious";
        else if (level === "review" && verdict === "unrelated") verdict = "review";
      };

      for (const item of ownedSkeletons) {
        if (!item.label) continue;
        const budget = typoBudget(item.label.length);

        // 1. Same registrable label under a different public suffix.
        if (candidateLabel === item.label && parsed.suffix !== item.suffix) {
          raise("review");
          matchedOwned = matchedOwned || item.domain;
          reasons.push(
            `Same label as ${item.domain} under a different suffix (.${parsed.suffix}). Either you registered the swap defensively, or somebody else did.`,
          );
          continue;
        }
        if (candidateLabel === item.label) continue;

        // 2. Different characters, identical rendering.
        if (candidateSkeleton && candidateSkeleton === item.skeleton) {
          raise("suspicious");
          matchedOwned = matchedOwned || item.domain;
          reasons.push(
            `Reduces to the same visual skeleton as "${item.label}" (${item.skeleton}) — the characters differ but they render alike.`,
          );
          continue;
        }

        // 3. A keystroke or two away.
        const distance = damerauLevenshtein(
          parsed.unicodeRegistrableLabel || candidateLabel,
          item.label,
        );
        if (distance > 0 && distance <= budget) {
          raise("suspicious");
          matchedOwned = matchedOwned || item.domain;
          reasons.push(
            `Edit distance ${distance} from "${item.label}" (budget ${budget} for a ${item.label.length}-character label) — one or two keystrokes away.`,
          );
          continue;
        }

        // 4. The brand kept intact as a token somewhere else in the name.
        const hit = tokens.find(
          (entry) =>
            entry.token === item.label ||
            skeleton(entry.token) === item.skeleton ||
            damerauLevenshtein(entry.token, item.label) <= (item.label.length >= 6 ? 1 : 0),
        );
        if (hit) {
          raise("suspicious");
          matchedOwned = matchedOwned || item.domain;
          reasons.push(
            hit.index < parsed.registrableIndex
              ? `"${hit.token}" sits to the left of the registrable domain, which is ${parsed.registrable} — not yours. Browsers show the rightmost part, so this reads as yours and is not.`
              : `Combosquat: "${hit.token}" keeps your label intact inside ${parsed.registrable}, next to other words.`,
          );
        }
      }

      if (parsed.punycode) {
        if (verdict === "unrelated") verdict = "review";
        reasons.push(
          `Internationalised name: ${parsed.domain} renders as ${parsed.unicode}. Punycode is legitimate, but it is also how homograph attacks are spelled.`,
        );
      }

      if (parsed.mixedScriptLabels.length > 0) {
        verdict = "suspicious";
        reasons.push(
          `A single label mixes writing systems (${parsed.scripts.join(" + ")}). Genuine names rarely do; homograph attacks always do.`,
        );
      }
    }

    rows.push({
      input: raw,
      name: key,
      domain: parsed.domain,
      wildcard: parsed.wildcard,
      registrable: parsed.registrable,
      suffix: parsed.suffix,
      punycode: parsed.punycode,
      unicode: parsed.unicode,
      verdict,
      matchedOwned,
      reasons: reasons.length > 0 ? reasons : ["No relationship to the domains you listed."],
      parsed,
    });
  }

  const counts = { owned: 0, suspicious: 0, review: 0, unrelated: 0, invalid: 0 };
  for (const row of rows) counts[row.verdict] += 1;

  const order = { suspicious: 0, review: 1, invalid: 2, unrelated: 3, owned: 4 };
  const sorted = rows.slice().sort((a, b) => {
    const byVerdict = order[a.verdict] - order[b.verdict];
    if (byVerdict !== 0) return byVerdict;
    return (a.name || a.input).localeCompare(b.name || b.input);
  });

  return {
    rows: sorted,
    counts,
    total: rows.length,
    duplicatesDropped: rawNames.length - rows.length,
    ownedDomains: owned.map((item) => item.registrable),
  };
}

/* ------------------------------------------------------------------ */
/* Plain-text exports                                                  */
/* ------------------------------------------------------------------ */

/** The watchlist as text: queries first, then the names to watch for. */
export function formatWatchlistText(watchlist) {
  if (!watchlist || watchlist.error) return "";
  const lines = [];
  for (const entry of watchlist.entries) {
    lines.push(`# ${entry.registrable}`);
    lines.push("## CT log queries");
    for (const query of entry.queries) {
      lines.push(`${query.value}\t${query.url}`);
    }
    lines.push(`## Names to watch (${entry.watchNames.length})`);
    for (const name of entry.watchNames) lines.push(name);
    lines.push("");
  }
  return lines.join("\n").trim();
}

/** The classification result as text, suspicious names first. */
export function formatFindingsText(analysis) {
  if (!analysis || analysis.error) return "";
  const lines = [
    `Certificate names checked: ${analysis.total}`,
    `Yours: ${analysis.counts.owned}  Suspicious: ${analysis.counts.suspicious}  Worth a look: ${analysis.counts.review}  Unrelated: ${analysis.counts.unrelated}  Unparsed: ${analysis.counts.invalid}`,
    "",
  ];
  for (const row of analysis.rows) {
    lines.push(`[${VERDICTS[row.verdict].label}] ${row.name || row.input}`);
    for (const reason of row.reasons) lines.push(`    ${reason}`);
  }
  return lines.join("\n").trim();
}
