// Rule definitions for the deliverability engine. Each validator is a plain
// object: { id, category, severity, spamSignal, title, why, fix, example?,
// run(ctx) -> issue[] | issue | null }. The engine in deliverabilityEngine.js
// just iterates this registry, so adding a check (or later plugging in an
// AI-backed validator that returns the same issue shape) never touches the
// scoring or UI code.
//
// ctx = { mode, subject, sender, body, text, lowerText, lowerSubject, words,
//         doc (parsed HTML document or null), links[] }

export const SPAM_WORD_ALTERNATIVES = {
  free: "complimentary",
  "buy now": "explore the offer",
  "act now": "when you're ready",
  "limited time": "available this week",
  "click here": "see the details",
  urgent: "time-sensitive",
  winner: "selected",
  congratulations: "good news",
  "risk free": "no commitment",
  guarantee: "our promise",
  "cash bonus": "reward",
  "make money": "grow your income",
  "no obligation": "no pressure",
  cheap: "affordable",
  "order now": "get started",
  "don't miss out": "worth a look",
  "100%": "fully",
  "earn extra cash": "boost your earnings",
  "double your": "grow your",
  "claim now": "get yours",
  "special promotion": "a note about pricing",
  "once in a lifetime": "rare",
  "this isn't spam": "(remove this phrase)",
  "dear friend": "the recipient's name",
};

export const SPAM_WORDS = Object.keys(SPAM_WORD_ALTERNATIVES).concat([
  "prize", "jackpot", "casino", "viagra", "weight loss", "miracle", "no credit check",
  "eliminate debt", "consolidate debt", "work from home", "be your own boss",
  "while supplies last", "call now", "apply now", "money back", "extra income",
  "satisfaction guaranteed", "not junk", "lowest price", "save big",
]);

export const URGENCY_WORDS = [
  "act now", "hurry", "urgent", "last chance", "final notice", "expires today",
  "ends tonight", "don't wait", "immediately", "limited spots", "closing soon",
  "final hours", "time is running out", "deadline", "today only",
];

export const CLICKBAIT_PATTERNS = [
  "you won't believe", "shocking", "what happened next", "this one trick",
  "doctors hate", "secret they don't want", "must see", "gone wrong",
  "will blow your mind", "number 7 will", "exposed",
];

export const URL_SHORTENERS = [
  "bit.ly", "tinyurl.com", "goo.gl", "t.co", "ow.ly", "is.gd", "buff.ly",
  "cutt.ly", "rb.gy", "shorturl.at", "tiny.cc", "rebrand.ly",
];

const EMOJI_REGEX = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu;

function issue(rule, overrides = {}) {
  return {
    id: rule.id,
    category: rule.category,
    severity: rule.severity,
    spamSignal: Boolean(rule.spamSignal),
    title: rule.title,
    why: rule.why,
    fix: rule.fix,
    example: rule.example || "",
    detail: "",
    ...overrides,
  };
}

function findPhrases(lowerText, list) {
  return list.filter((phrase) =>
    phrase.includes(" ") ? lowerText.includes(phrase) : new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(lowerText),
  );
}

function capsWords(text) {
  return text.split(/\s+/).filter((w) => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w));
}

function countSyllables(word) {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  const groups = clean.match(/[aeiouy]+/g) || [];
  let n = groups.length;
  if (clean.endsWith("e") && n > 1) n -= 1;
  return Math.max(1, n);
}

export function fleschScore(text) {
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/g) || []).length);
  const words = text.split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const syllables = words.reduce((s, w) => s + countSyllables(w), 0);
  const score = 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export const CATEGORIES = [
  { id: "subject", label: "Subject Line", weight: 0.2 },
  { id: "content", label: "Content Quality", weight: 0.3 },
  { id: "links", label: "Links & URLs", weight: 0.15 },
  { id: "structure", label: "HTML & Structure", weight: 0.2, htmlOnly: true },
  { id: "practices", label: "Best Practices", weight: 0.15 },
];

export const RULES = [
  // ---------------- SUBJECT ----------------
  {
    id: "subject-missing",
    category: "subject",
    severity: "error",
    title: "No subject line",
    why: "Emails without a subject are heavily penalized by spam filters and rarely opened.",
    fix: "Write a 30-50 character subject that states the email's value plainly.",
    run: (ctx) => (!ctx.subject.trim() ? issue(RULES_BY_ID.get("subject-missing")) : null),
  },
  {
    id: "subject-length",
    category: "subject",
    severity: "info",
    title: "Subject length outside the 30-50 character sweet spot",
    why: "Short subjects waste the preview space; long ones get truncated on most inboxes.",
    fix: "Aim for 30-50 characters with the key value proposition first.",
    run: (ctx) => {
      const len = ctx.subject.trim().length;
      if (!len || (len >= 30 && len <= 50)) return null;
      return issue(RULES_BY_ID.get("subject-length"), {
        detail: `Subject is ${len} characters (${len < 30 ? "shorter" : "longer"} than the 30-50 ideal).`,
        severity: len > 70 ? "warning" : "info",
      });
    },
  },
  {
    id: "subject-spam-words",
    category: "subject",
    severity: "warning",
    spamSignal: true,
    title: "Spam-trigger words in subject",
    why: "Filters weigh the subject line more heavily than body copy — trigger phrases here are the fastest route to the spam folder.",
    fix: "Replace trigger words with neutral phrasing (see the highlighted alternatives below).",
    example: '"FREE gift inside!!!" → "A small gift for you"',
    run: (ctx) => {
      const hits = findPhrases(ctx.lowerSubject, SPAM_WORDS);
      return hits.length
        ? issue(RULES_BY_ID.get("subject-spam-words"), { detail: `Found: "${hits.slice(0, 4).join('", "')}"${hits.length > 4 ? "…" : ""}`, severity: hits.length > 2 ? "error" : "warning" })
        : null;
    },
  },
  {
    id: "subject-caps",
    category: "subject",
    severity: "warning",
    spamSignal: true,
    title: "Excessive capitalization in subject",
    why: "ALL-CAPS words are one of the oldest and strongest spam-filter signals.",
    fix: "Use sentence case; emphasize with word choice instead of caps.",
    run: (ctx) => {
      const caps = capsWords(ctx.subject);
      const allCaps = ctx.subject.trim().length > 3 && ctx.subject === ctx.subject.toUpperCase() && /[A-Z]/.test(ctx.subject);
      if (allCaps) return issue(RULES_BY_ID.get("subject-caps"), { detail: "The entire subject is ALL CAPS.", severity: "error" });
      return caps.length ? issue(RULES_BY_ID.get("subject-caps"), { detail: `${caps.length} ALL-CAPS word(s): ${caps.slice(0, 3).join(", ")}` }) : null;
    },
  },
  {
    id: "subject-emoji",
    category: "subject",
    severity: "info",
    title: "Heavy emoji use in subject",
    why: "One emoji can lift opens; three or more reads as promotional and can trip filters.",
    fix: "Keep at most one relevant emoji.",
    run: (ctx) => {
      const n = (ctx.subject.match(EMOJI_REGEX) || []).length;
      return n >= 3 ? issue(RULES_BY_ID.get("subject-emoji"), { detail: `${n} emojis in the subject.`, severity: "warning", spamSignal: true }) : null;
    },
  },
  {
    id: "subject-clickbait",
    category: "subject",
    severity: "warning",
    spamSignal: true,
    title: "Clickbait phrasing in subject",
    why: "Clickbait patterns depress long-term engagement, and engagement is a core deliverability input for Gmail/Outlook.",
    fix: "Say what the email actually contains — curiosity works better when it's honest.",
    run: (ctx) => {
      const hits = findPhrases(ctx.lowerSubject, CLICKBAIT_PATTERNS);
      return hits.length ? issue(RULES_BY_ID.get("subject-clickbait"), { detail: `Pattern: "${hits[0]}"` }) : null;
    },
  },
  {
    id: "subject-punctuation",
    category: "subject",
    severity: "warning",
    spamSignal: true,
    title: "Repeated punctuation in subject",
    why: "\"!!\" and \"??\" are classic spam markers.",
    fix: "One exclamation mark maximum — or none.",
    run: (ctx) => (/[!?]{2,}/.test(ctx.subject) ? issue(RULES_BY_ID.get("subject-punctuation")) : null),
  },

  // ---------------- CONTENT ----------------
  {
    id: "body-empty",
    category: "content",
    severity: "error",
    title: "Email body is empty",
    why: "There is nothing to analyze or send.",
    fix: "Write the email content in the editor.",
    run: (ctx) => (!ctx.text.trim() ? issue(RULES_BY_ID.get("body-empty")) : null),
  },
  {
    id: "body-spam-words",
    category: "content",
    severity: "warning",
    spamSignal: true,
    title: "Spam-trigger words in body",
    why: "Individual trigger words rarely doom an email, but several together substantially raise the spam probability.",
    fix: "Swap flagged phrases for the safer alternatives shown in the highlighted view.",
    run: (ctx) => {
      const hits = findPhrases(ctx.lowerText, SPAM_WORDS);
      if (!hits.length) return null;
      return issue(RULES_BY_ID.get("body-spam-words"), {
        detail: `${hits.length} trigger phrase(s): "${hits.slice(0, 5).join('", "')}"${hits.length > 5 ? "…" : ""}`,
        severity: hits.length >= 5 ? "error" : "warning",
      });
    },
  },
  {
    id: "body-urgency",
    category: "content",
    severity: "info",
    spamSignal: true,
    title: "Stacked urgency language",
    why: "Multiple urgency phrases read as pressure tactics to both filters and readers.",
    fix: "Keep a single genuine deadline if one exists.",
    run: (ctx) => {
      const hits = findPhrases(ctx.lowerText, URGENCY_WORDS);
      return hits.length >= 2 ? issue(RULES_BY_ID.get("body-urgency"), { detail: `${hits.length} urgency phrase(s): ${hits.slice(0, 4).join(", ")}`, severity: hits.length >= 4 ? "warning" : "info" }) : null;
    },
  },
  {
    id: "body-caps",
    category: "content",
    severity: "warning",
    spamSignal: true,
    title: "Excessive capitalization in body",
    why: "Blocks of ALL-CAPS text are a strong spam signal and hard to read.",
    fix: "Rewrite ALL-CAPS sentences in sentence case; use bold for emphasis in HTML emails.",
    run: (ctx) => {
      const caps = capsWords(ctx.text);
      return caps.length > 5 ? issue(RULES_BY_ID.get("body-caps"), { detail: `${caps.length} ALL-CAPS words.` }) : null;
    },
  },
  {
    id: "body-punctuation",
    category: "content",
    severity: "info",
    spamSignal: true,
    title: "Repeated punctuation in body",
    why: "\"!!!\", \"$$$\" and similar runs pattern-match to classic spam.",
    fix: "Use single punctuation marks.",
    run: (ctx) => {
      const n = (ctx.text.match(/([!?$*#])\1{1,}/g) || []).length;
      return n ? issue(RULES_BY_ID.get("body-punctuation"), { detail: `${n} repeated-punctuation run(s).`, severity: n > 3 ? "warning" : "info" }) : null;
    },
  },
  {
    id: "body-duplicate-words",
    category: "content",
    severity: "info",
    title: "Accidentally doubled words",
    why: "\"the the\", \"and and\" — small typos that read as careless.",
    fix: "Remove the duplicated word.",
    run: (ctx) => {
      const matches = [...ctx.lowerText.matchAll(/\b([a-z]{2,})\s+\1\b/g)].map((m) => m[1]);
      return matches.length ? issue(RULES_BY_ID.get("body-duplicate-words"), { detail: `Doubled: ${[...new Set(matches)].slice(0, 4).join(", ")}` }) : null;
    },
  },
  {
    id: "body-readability",
    category: "content",
    severity: "info",
    title: "Hard-to-read copy",
    why: "Emails skimmed on phones need short sentences and plain words; dense copy lowers engagement, which feeds back into deliverability.",
    fix: "Shorten sentences, break up ideas, prefer common words.",
    run: (ctx) => {
      if (ctx.words.length < 30) return null;
      const score = fleschScore(ctx.text);
      return score < 45 ? issue(RULES_BY_ID.get("body-readability"), { detail: `Flesch Reading Ease is ${score} (below the ~50-70 comfortable range).`, severity: score < 30 ? "warning" : "info" }) : null;
    },
  },
  {
    id: "body-paragraphs",
    category: "content",
    severity: "info",
    title: "Wall-of-text paragraphs",
    why: "Paragraphs over ~80 words are routinely skipped on mobile.",
    fix: "Split long paragraphs; one idea per paragraph, 2-4 sentences each.",
    run: (ctx) => {
      const longOnes = ctx.text.split(/\n{2,}/).filter((p) => p.split(/\s+/).filter(Boolean).length > 80);
      return longOnes.length ? issue(RULES_BY_ID.get("body-paragraphs"), { detail: `${longOnes.length} paragraph(s) exceed 80 words.` }) : null;
    },
  },
  {
    id: "body-grammar",
    category: "content",
    severity: "info",
    title: "Grammar & polish heuristics",
    why: "Double spaces, lowercase sentence starts and a bare lowercase \"i\" read as unpolished, which hurts trust and engagement.",
    fix: "Run a quick proofread before sending.",
    run: (ctx) => {
      const problems = [];
      if (/ {2,}/.test(ctx.text)) problems.push("double spaces");
      if (/\bi\b(?=[ '])/.test(ctx.text)) problems.push('lowercase "i"');
      if (/(^|[.!?]\s+)[a-z]/.test(ctx.text)) problems.push("sentence starting lowercase");
      return problems.length ? issue(RULES_BY_ID.get("body-grammar"), { detail: problems.join(" · ") }) : null;
    },
  },
  {
    id: "body-too-short",
    category: "content",
    severity: "info",
    title: "Very little text content",
    why: "Filters distrust near-empty emails, especially ones that are mostly links or images.",
    fix: "Add enough real text to carry the message on its own.",
    run: (ctx) => (ctx.text.trim() && ctx.words.length < 25 ? issue(RULES_BY_ID.get("body-too-short"), { detail: `Only ${ctx.words.length} word(s) of text.` }) : null),
  },

  // ---------------- LINKS ----------------
  {
    id: "links-http",
    category: "links",
    severity: "error",
    title: "Links not using HTTPS",
    why: "Insecure links trigger warnings in some clients and are a mild spam signal.",
    fix: "Use https:// for every link.",
    run: (ctx) => {
      const bad = ctx.links.filter((u) => /^http:\/\//i.test(u));
      return bad.length ? issue(RULES_BY_ID.get("links-http"), { detail: `${bad.length} insecure link(s).` }) : null;
    },
  },
  {
    id: "links-shorteners",
    category: "links",
    severity: "warning",
    spamSignal: true,
    title: "URL shorteners detected",
    why: "bit.ly-style links hide the destination, and spam filters treat them with heavy suspicion in bulk email.",
    fix: "Link to the full destination URL, or use a branded short domain you own.",
    run: (ctx) => {
      const bad = ctx.links.filter((u) => URL_SHORTENERS.some((s) => u.toLowerCase().includes(s)));
      return bad.length ? issue(RULES_BY_ID.get("links-shorteners"), { detail: `${bad.length} shortened link(s): ${bad.slice(0, 2).join(", ")}` }) : null;
    },
  },
  {
    id: "links-duplicates",
    category: "links",
    severity: "info",
    title: "Same URL linked many times",
    why: "Heavy repetition of one link is a mild promotional-pattern signal.",
    fix: "Consolidate into one clear CTA plus at most a couple of supporting links.",
    run: (ctx) => {
      const counts = new Map();
      ctx.links.forEach((u) => counts.set(u, (counts.get(u) || 0) + 1));
      const dupes = [...counts.entries()].filter(([, c]) => c >= 4);
      return dupes.length ? issue(RULES_BY_ID.get("links-duplicates"), { detail: `${dupes.length} URL(s) repeated 4+ times.` }) : null;
    },
  },
  {
    id: "links-excessive",
    category: "links",
    severity: "warning",
    spamSignal: true,
    title: "Too many links",
    why: "A high link count relative to text is one of the strongest structural spam signals.",
    fix: "Cut to the links that matter — one primary CTA is ideal.",
    run: (ctx) => (ctx.links.length > 10 ? issue(RULES_BY_ID.get("links-excessive"), { detail: `${ctx.links.length} links found.` }) : null),
  },
  {
    id: "links-mailto-tel",
    category: "links",
    severity: "info",
    title: "Malformed mailto:/tel: links",
    why: "A broken contact link silently fails for the recipient.",
    fix: "Use mailto:name@domain.com and tel:+countrycode-number formats.",
    run: (ctx) => {
      if (!ctx.doc) return null;
      const bad = Array.from(ctx.doc.querySelectorAll("a[href^='mailto:'], a[href^='tel:']")).filter((a) => {
        const href = a.getAttribute("href");
        if (href.startsWith("mailto:")) return !/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(href);
        return !/^tel:\+?[\d\-().\s]{5,}$/i.test(href);
      });
      return bad.length ? issue(RULES_BY_ID.get("links-mailto-tel"), { detail: `${bad.length} malformed contact link(s).`, severity: "warning" }) : null;
    },
  },

  // ---------------- STRUCTURE (HTML mode) ----------------
  {
    id: "html-skeleton",
    category: "structure",
    severity: "warning",
    title: "Missing DOCTYPE / <html> / <body> skeleton",
    why: "Without a proper skeleton, Outlook and some webmail clients fall into quirks-mode rendering.",
    fix: "Wrap the email in <!DOCTYPE html><html><head>…</head><body>…</body></html>.",
    run: (ctx) => {
      if (ctx.mode !== "html") return null;
      const raw = ctx.body.toLowerCase();
      const missing = ["<!doctype", "<html", "<body"].filter((t) => !raw.includes(t));
      return missing.length ? issue(RULES_BY_ID.get("html-skeleton"), { detail: `Missing: ${missing.join(", ")}` }) : null;
    },
  },
  {
    id: "html-img-alt",
    category: "structure",
    severity: "warning",
    title: "Images missing alt text",
    why: "With images blocked (the default in many clients), alt text is all the recipient sees; it's also an accessibility requirement.",
    fix: 'Add descriptive alt text, or alt="" for decorative spacers.',
    run: (ctx) => {
      if (!ctx.doc) return null;
      const missing = Array.from(ctx.doc.querySelectorAll("img")).filter((i) => !i.hasAttribute("alt"));
      return missing.length ? issue(RULES_BY_ID.get("html-img-alt"), { detail: `${missing.length} image(s) without alt.` }) : null;
    },
  },
  {
    id: "html-headings",
    category: "structure",
    severity: "info",
    title: "Heading hierarchy skips levels",
    why: "Screen-reader users navigate by heading level; jumps (h1 → h3) make the structure confusing.",
    fix: "Use h1 → h2 → h3 in order without skipping.",
    run: (ctx) => {
      if (!ctx.doc) return null;
      const levels = Array.from(ctx.doc.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) => Number(h.tagName[1]));
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i - 1] > 1) return issue(RULES_BY_ID.get("html-headings"), { detail: `Jumps from h${levels[i - 1]} to h${levels[i]}.` });
      }
      return null;
    },
  },
  {
    id: "html-unsupported-css",
    category: "structure",
    severity: "error",
    title: "CSS unsupported by major email clients",
    why: "Flexbox, Grid, positioning and animations collapse silently in Outlook (and partially in Gmail) — the layout just breaks.",
    fix: "Rebuild layout with nested tables and inline styles.",
    run: (ctx) => {
      if (ctx.mode !== "html") return null;
      const hits = [
        [/display\s*:\s*flex/i, "Flexbox"],
        [/display\s*:\s*grid/i, "Grid"],
        [/position\s*:\s*(fixed|absolute)/i, "position:fixed/absolute"],
        [/@keyframes|animation\s*:/i, "CSS animations"],
        [/var\(\s*--/i, "CSS variables"],
      ].filter(([re]) => re.test(ctx.body));
      return hits.length ? issue(RULES_BY_ID.get("html-unsupported-css"), { detail: `Found: ${hits.map(([, label]) => label).join(", ")}` }) : null;
    },
  },
  {
    id: "html-responsive",
    category: "structure",
    severity: "info",
    title: "No mobile-responsive signals",
    why: "Without a viewport meta or @media rules, multi-column layouts stay desktop-width on phones.",
    fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> and an @media (max-width:600px) block that stacks columns.',
    run: (ctx) => {
      if (ctx.mode !== "html") return null;
      const hasViewport = /name=["']viewport["']/i.test(ctx.body);
      const hasMedia = /@media/i.test(ctx.body);
      return !hasViewport && !hasMedia ? issue(RULES_BY_ID.get("html-responsive")) : null;
    },
  },
  {
    id: "html-fixed-width",
    category: "structure",
    severity: "info",
    title: "Fixed pixel-width table without max-width fallback",
    why: "Rigid pixel widths force horizontal scrolling on narrow screens.",
    fix: 'Pair width="600" with style="max-width:600px;width:100%".',
    run: (ctx) => {
      if (!ctx.doc) return null;
      const rigid = Array.from(ctx.doc.querySelectorAll("table[width]")).filter((t) => !/max-width|width\s*:\s*100%/i.test(t.getAttribute("style") || ""));
      return rigid.length ? issue(RULES_BY_ID.get("html-fixed-width"), { detail: `${rigid.length} rigid table(s).` }) : null;
    },
  },
  {
    id: "html-preheader",
    category: "structure",
    severity: "info",
    title: "No preheader text",
    why: "Without a hidden preheader, inboxes show the first raw line of the email as the preview snippet.",
    fix: "Add a short hidden div right after <body> summarizing the email.",
    example: '<div style="display:none;max-height:0;overflow:hidden;">Preview text here&zwnj;&nbsp;</div>',
    run: (ctx) => {
      if (ctx.mode !== "html" || !ctx.doc?.body) return null;
      const found = Array.from(ctx.doc.body.querySelectorAll("*")).slice(0, 8).some((el) => {
        const style = (el.getAttribute("style") || "").toLowerCase();
        const t = el.textContent.trim();
        return /display\s*:\s*none|max-height\s*:\s*0|font-size\s*:\s*0/.test(style) && t.length > 5 && t.length < 160;
      });
      return found ? null : issue(RULES_BY_ID.get("html-preheader"));
    },
  },

  // ---------------- BEST PRACTICES ----------------
  {
    id: "practice-unsubscribe",
    category: "practices",
    severity: "warning",
    title: "No unsubscribe option found",
    why: "Bulk email without an unsubscribe link violates CAN-SPAM/GDPR expectations, and recipients who can't unsubscribe click \"Report spam\" instead — the worst signal your domain can get.",
    fix: 'Add a visible unsubscribe link in the footer (e.g. "Unsubscribe" or "Manage preferences").',
    run: (ctx) => (/unsubscribe|opt[ -]?out|manage preferences/i.test(ctx.body) ? null : issue(RULES_BY_ID.get("practice-unsubscribe"))),
  },
  {
    id: "practice-address",
    category: "practices",
    severity: "info",
    title: "No physical mailing address",
    why: "CAN-SPAM requires a valid postal address in commercial email footers.",
    fix: "Add your company's postal address to the footer.",
    run: (ctx) => {
      if (ctx.words.length < 40) return null;
      const hasAddressHint = /\b\d{5,6}\b|street|avenue| road|suite|floor|p\.?o\.? box|gurugram|delhi|mumbai|bengaluru/i.test(ctx.text);
      return hasAddressHint ? null : issue(RULES_BY_ID.get("practice-address"));
    },
  },
  {
    id: "practice-noreply",
    category: "practices",
    severity: "warning",
    title: "no-reply sender address",
    why: "no-reply addresses depress replies, and replies are one of the strongest positive engagement signals mailbox providers track.",
    fix: "Send from a monitored address (hello@, team@, yourname@) instead.",
    run: (ctx) => (/^no-?reply@/i.test(ctx.sender.trim()) ? issue(RULES_BY_ID.get("practice-noreply")) : null),
  },
  {
    id: "practice-free-domain",
    category: "practices",
    severity: "info",
    title: "Free mailbox domain as sender",
    why: "Bulk email from gmail.com/yahoo.com addresses fails DMARC alignment at most providers and looks less professional.",
    fix: "Send campaigns from your own domain with SPF/DKIM/DMARC configured.",
    run: (ctx) => {
      const domain = ctx.sender.split("@")[1]?.toLowerCase() || "";
      return ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com"].includes(domain)
        ? issue(RULES_BY_ID.get("practice-free-domain"), { detail: `Sender domain: ${domain}` })
        : null;
    },
  },
  {
    id: "practice-image-only",
    category: "practices",
    severity: "warning",
    spamSignal: true,
    title: "Image-heavy, text-light email",
    why: "One-big-image emails are a classic spam pattern and completely blank for recipients with images off.",
    fix: "Keep a healthy text-to-image balance — the message should survive with images blocked.",
    run: (ctx) => {
      if (!ctx.doc) return null;
      const imgs = ctx.doc.querySelectorAll("img").length;
      return imgs >= 2 && ctx.words.length < 40 ? issue(RULES_BY_ID.get("practice-image-only"), { detail: `${imgs} images but only ${ctx.words.length} words of text.` }) : null;
    },
  },
];

export const RULES_BY_ID = new Map(RULES.map((r) => [r.id, r]));
