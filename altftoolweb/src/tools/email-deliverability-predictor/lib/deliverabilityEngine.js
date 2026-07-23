// Deterministic deliverability engine. Builds an analysis context from the
// raw inputs, runs every validator in rules.js, then derives category scores,
// the weighted overall score, spam risk, an inbox-probability ESTIMATE and a
// risk level. Same input → same output, always; no network calls.

import { RULES, CATEGORIES, SPAM_WORDS, SPAM_WORD_ALTERNATIVES, URGENCY_WORDS, fleschScore } from "./rules";

const SEVERITY_PENALTY = { error: 20, warning: 10, info: 4 };

function extractText(mode, body, doc) {
  if (mode === "html" && doc?.body) return doc.body.textContent.replace(/\s+/g, " ").trim();
  return body;
}

function extractLinks(mode, body, doc) {
  if (mode === "html" && doc) {
    return Array.from(doc.querySelectorAll("a[href]"))
      .map((a) => a.getAttribute("href") || "")
      .filter((h) => /^https?:\/\//i.test(h));
  }
  return (body.match(/https?:\/\/[^\s<>")]+/gi) || []);
}

function buildContext({ mode, subject, sender, body }) {
  let doc = null;
  if (mode === "html" && body.trim() && typeof window !== "undefined") {
    try {
      doc = new DOMParser().parseFromString(body, "text/html");
    } catch {
      doc = null;
    }
  }
  const text = extractText(mode, body, doc);
  return {
    mode,
    subject,
    sender: sender || "",
    body,
    doc,
    text,
    lowerText: text.toLowerCase(),
    lowerSubject: subject.toLowerCase(),
    words: text.split(/\s+/).filter(Boolean),
    links: extractLinks(mode, body, doc),
  };
}

function riskLevel(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Moderate";
  if (score >= 30) return "Risky";
  return "Likely Spam";
}

// Non-overlapping spans of spam/urgency phrases in the plain text, for the
// highlighted-content view. Each span carries the suggested alternative.
export function findHighlights(text) {
  const lower = text.toLowerCase();
  const candidates = [];
  const scan = (list, type) => {
    for (const phrase of list) {
      let from = 0;
      for (;;) {
        const idx = lower.indexOf(phrase, from);
        if (idx === -1) break;
        const before = idx === 0 ? "" : lower[idx - 1];
        const after = idx + phrase.length >= lower.length ? "" : lower[idx + phrase.length];
        if (phrase.includes(" ") || (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after))) {
          candidates.push({ start: idx, end: idx + phrase.length, type, phrase, alternative: SPAM_WORD_ALTERNATIVES[phrase] || "" });
        }
        from = idx + phrase.length;
      }
    }
  };
  scan(SPAM_WORDS, "spam");
  scan(URGENCY_WORDS, "urgency");

  candidates.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
  const spans = [];
  let lastEnd = -1;
  for (const span of candidates) {
    if (span.start >= lastEnd) {
      spans.push({ ...span, text: text.slice(span.start, span.end) });
      lastEnd = span.end;
    }
  }
  return spans;
}

export function analyzeDeliverability(inputs) {
  const ctx = buildContext(inputs);
  const hasContent = Boolean(ctx.body.trim() || ctx.subject.trim());

  const issues = RULES.flatMap((rule) => {
    try {
      const out = rule.run(ctx);
      return out ? (Array.isArray(out) ? out : [out]) : [];
    } catch {
      return [];
    }
  });

  // Category scores. In plain-text mode the HTML/structure category isn't
  // applicable, so its weight is redistributed across the rest.
  const applicable = CATEGORIES.filter((c) => !(c.htmlOnly && ctx.mode !== "html"));
  const weightSum = applicable.reduce((s, c) => s + c.weight, 0);

  const categoryScores = applicable.map((cat) => {
    const penalty = issues.filter((i) => i.category === cat.id).reduce((s, i) => s + SEVERITY_PENALTY[i.severity], 0);
    return { ...cat, score: Math.max(0, 100 - penalty) };
  });

  const overallScore = hasContent
    ? Math.max(0, Math.min(100, Math.round(categoryScores.reduce((s, c) => s + c.score * (c.weight / weightSum), 0))))
    : 0;

  const spamPenalty = issues.filter((i) => i.spamSignal).reduce((s, i) => s + SEVERITY_PENALTY[i.severity], 0);
  const spamRisk = Math.min(100, Math.round(spamPenalty * 1.4));

  // A derived estimate, deliberately capped at 1-97 so the tool never claims
  // certainty — actual placement depends on sender reputation and
  // SPF/DKIM/DMARC, which content analysis cannot see. Spam risk carries a
  // heavy weight here: category scores alone under-punish emails that stack
  // many individually-small spam signals.
  const inboxProbability = hasContent
    ? Math.max(1, Math.min(97, Math.round(overallScore * 0.6 + (100 - spamRisk) * 0.4)))
    : 0;

  // Risk level blends structural quality and spam signals so a spam-heavy
  // email can't land a comfortable label on formatting alone.
  const healthScore = Math.round(overallScore * 0.7 + (100 - spamRisk) * 0.3);

  const counts = { error: 0, warning: 0, info: 0 };
  issues.forEach((i) => (counts[i.severity] += 1));

  const recommendations = issues
    .slice()
    .sort((a, b) => SEVERITY_PENALTY[b.severity] - SEVERITY_PENALTY[a.severity])
    .slice(0, 6)
    .map((i) => i.fix);

  const stats = {
    chars: ctx.body.length,
    words: ctx.words.length,
    readingTimeMin: Math.max(1, Math.round(ctx.words.length / 200)),
    linkCount: ctx.links.length,
    readability: ctx.words.length >= 10 ? fleschScore(ctx.text) : null,
  };

  return {
    hasContent,
    mode: ctx.mode,
    subject: ctx.subject,
    issues: issues.sort((a, b) => SEVERITY_PENALTY[b.severity] - SEVERITY_PENALTY[a.severity]),
    counts,
    categoryScores,
    overallScore,
    spamRisk,
    inboxProbability,
    riskLevel: hasContent ? riskLevel(healthScore) : "—",
    recommendations: [...new Set(recommendations)],
    highlights: findHighlights(ctx.text),
    plainText: ctx.text,
    stats,
  };
}

export const SAMPLE_EMAIL = {
  subject: "Your February product update is here",
  sender: "team@yourcompany.com",
  mode: "plain",
  body: `Hi {FirstName},

Here's what's new this month:

1. Faster exports — reports now generate in under five seconds.
2. Two new integrations: Slack and Notion.
3. A refreshed dashboard based on your feedback.

Read the full changelog on our website, or reply to this email if you have questions — we read every response.

Best,
The Product Team

--
Acme Inc, 221B Example Street, Gurugram 122002
You're receiving this because you signed up for product updates.
Unsubscribe: https://example.com/unsubscribe`,
};

export const SAMPLE_EMAIL_RISKY = {
  subject: "FREE!!! ACT NOW - Limited Time CASH BONUS",
  sender: "no-reply@gmail.com",
  mode: "plain",
  body: `CONGRATULATIONS!! You are a WINNER!

Click here NOW to claim your 100% FREE cash bonus!!! This is a once in a lifetime offer - don't miss out! Act now, expires today!

http://bit.ly/win-big http://bit.ly/win-big http://bit.ly/win-big`,
};
