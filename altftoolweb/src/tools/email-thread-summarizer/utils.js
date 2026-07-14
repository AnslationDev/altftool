const HEADER_PATTERN = /^(from|to|cc|subject|date|sent):\s*(.+)$/i;
const QUOTE_PATTERN = /^>+\s?/;
const SIGN_OFF_PATTERN = /^(best|best regards|regards|thanks|thank you|sincerely|cheers)[,!]?$/i;
const ACTION_PATTERN = /\b(please|need(?:s)? to|should|must|will|can you|could you|action item|follow[- ]?up|due)\b/i;
const DECISION_PATTERN = /\b(agreed|approved|confirmed|decided|finalized|resolved|we(?:'ll| will)|moving forward|go with|selected)\b/i;
const QUESTION_PATTERN = /\?|\b(open question|need clarification|waiting for|pending|can you confirm|could you confirm)\b/i;
const URGENT_PATTERN = /\b(urgent|asap|immediately|critical|block(?:ed|er)?|today|eod|overdue|high priority)\b/i;
const POSITIVE_PATTERN = /\b(approved|agreed|great|good|thanks|thank you|happy|resolved|complete|confirmed)\b/i;
const NEGATIVE_PATTERN = /\b(blocked|concern|issue|problem|risk|late|delay|failed|failure|cannot|can't|urgent)\b/i;
const DEADLINE_PATTERN = /\b(?:by|before|due(?: on)?|deadline(?: is)?)\s+((?:today|tomorrow|eod|eow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+eod)?|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:,\s*\d{4})?|\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)/i;

const clean = (value = "") => value.replace(/\s+/g, " ").trim();

function splitSentences(text) {
  return clean(text).split(/(?<=[.!?])\s+(?=[A-Z0-9])|\n+/).map(clean).filter((sentence) => sentence.length >= 12 && sentence.length <= 500);
}

function extractName(value) {
  const name = value.replace(/<[^>]+>/g, "").replace(/["']/g, "").trim();
  return name || value.match(/[\w.+-]+@[\w.-]+/)?.[0] || "Unknown sender";
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseThread(raw) {
  const lines = raw.replace(/\r/g, "").split("\n");
  const messages = [];
  let current = { sender: "Unknown sender", date: "", subject: "", body: [] };
  const commit = () => {
    const body = current.body.filter((line) => !QUOTE_PATTERN.test(line) && !SIGN_OFF_PATTERN.test(line.trim())).join("\n").trim();
    if (body) messages.push({ ...current, body });
  };
  for (const line of lines) {
    const header = line.match(HEADER_PATTERN);
    if (header) {
      const key = header[1].toLowerCase();
      const value = header[2].trim();
      if (key === "from" && current.body.some((item) => item.trim())) {
        commit();
        current = { sender: "Unknown sender", date: "", subject: "", body: [] };
      }
      if (key === "from") current.sender = extractName(value);
      else if (key === "date" || key === "sent") current.date = value;
      else if (key === "subject") current.subject = value.replace(/^(re|fw|fwd):\s*/i, "");
      continue;
    }
    if (/^On .+wrote:$/i.test(line.trim())) continue;
    current.body.push(line);
  }
  commit();
  if (!messages.length && clean(raw)) messages.push({ sender: "Unknown sender", date: "", subject: "", body: clean(raw) });
  return messages;
}

function unique(items, getValue = (item) => item) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getValue(item).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 120);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function inferOwner(text, sender, participants) {
  const direct = participants.find((person) => person !== "Unknown sender" && new RegExp(`\\b${person.split(/\s+/)[0].replace(/[^a-z]/gi, "")}\\b`, "i").test(text));
  if (direct) return direct;
  if (/\bI (?:will|'ll|can|need to|should)\b/i.test(text)) return sender;
  if (/\bwe (?:will|'ll|can|need to|should)\b/i.test(text)) return "Team";
  return "Unassigned";
}

function durationLabel(messages) {
  const dates = messages.map((message) => parseDate(message.date)).filter(Boolean).sort((a, b) => a - b);
  if (dates.length < 2) return "Dates unavailable";
  const minutes = Math.round((dates.at(-1) - dates[0]) / 60000);
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} hr`;
  return `${Math.round(minutes / 1440)} days`;
}

export function summarizeThread(raw, mode = "standard") {
  const messages = parseThread(raw);
  const participants = unique(messages.map((message) => message.sender));
  const allSentences = messages.flatMap((message, messageIndex) => splitSentences(message.body).map((text, sentenceIndex) => ({ text, sender: message.sender, messageIndex, sentenceIndex })));
  const actions = unique(allSentences.filter(({ text }) => ACTION_PATTERN.test(text)).map(({ text, sender }) => ({ text, owner: inferOwner(text, sender, participants), deadline: text.match(DEADLINE_PATTERN)?.[1] || "Not stated", source: sender })), (item) => item.text).slice(0, 12);
  const decisions = unique(allSentences.filter(({ text }) => DECISION_PATTERN.test(text)).map(({ text }) => text)).slice(0, 10);
  const questionItems = unique(allSentences.filter(({ text }) => QUESTION_PATTERN.test(text)).map((item) => item), (item) => item.text);
  const questions = questionItems.map((question) => {
    const later = allSentences.filter((item) => item.messageIndex > question.messageIndex).map((item) => item.text).join(" ");
    const answered = /\b(yes|no|confirmed|agreed|approved|decided|answer|will|can|cannot|can't)\b/i.test(later);
    return { text: question.text, askedBy: question.sender, status: answered ? "Possibly answered" : "No later answer detected" };
  }).slice(0, 10);
  const scored = allSentences.map((item) => {
    let score = item.sentenceIndex === 0 ? 2 : 0;
    if (ACTION_PATTERN.test(item.text)) score += 3;
    if (DECISION_PATTERN.test(item.text)) score += 3;
    if (QUESTION_PATTERN.test(item.text)) score += 2;
    if (/\b(because|however|therefore|deadline|budget|risk|priority|update)\b/i.test(item.text)) score += 1;
    score += item.messageIndex / Math.max(messages.length, 1);
    return { ...item, score };
  });
  const limits = { brief: 3, standard: 6, detailed: 10 };
  const highlights = unique(scored.sort((a, b) => b.score - a.score).slice(0, limits[mode] || 6).map(({ text }) => text));
  const positive = allSentences.filter(({ text }) => POSITIVE_PATTERN.test(text)).length;
  const negative = allSentences.filter(({ text }) => NEGATIVE_PATTERN.test(text)).length;
  const sentiment = positive === negative ? "Neutral / mixed" : positive > negative ? "Mostly positive" : "Concerned";
  const urgencyHits = allSentences.filter(({ text }) => URGENT_PATTERN.test(text)).length;
  const urgency = urgencyHits >= 2 ? "High" : urgencyHits === 1 ? "Medium" : "Normal";
  return {
    messages, participants, actions, decisions, questions, highlights,
    subject: messages.find((message) => message.subject)?.subject || "Email conversation",
    wordCount: clean(raw) ? clean(raw).split(/\s+/).length : 0,
    sentiment, urgency, duration: durationLabel(messages),
    timeline: messages.map((message, index) => ({ number: index + 1, sender: message.sender, date: message.date || "Date unavailable", preview: splitSentences(message.body)[0] || clean(message.body).slice(0, 180) })),
  };
}

export function toMarkdown(result) {
  const bullets = (items) => items.length ? items.map((item) => `- ${item}`).join("\n") : "- None detected";
  return `# ${result.subject}\n\n> Local heuristic analysis. Review important details against the original thread.\n\n## Overview\n- Messages: ${result.messages.length}\n- Participants: ${result.participants.join(", ") || "None detected"}\n- Duration: ${result.duration}\n- Urgency: ${result.urgency}\n- Tone: ${result.sentiment}\n\n## Summary\n${bullets(result.highlights)}\n\n## Decisions\n${bullets(result.decisions)}\n\n## Action items\n${bullets(result.actions.map((item) => `${item.text} (Owner: ${item.owner}; Deadline: ${item.deadline})`))}\n\n## Questions\n${bullets(result.questions.map((item) => `${item.text} — ${item.status}`))}`;
}

export const SAMPLE_THREAD = `From: Maya Chen <maya@example.com>\nTo: Product Team\nDate: July 8, 2026 9:10 AM\nSubject: Q3 onboarding refresh\n\nHi team, the user research shows that new customers are getting stuck at the workspace setup step. I recommend that we simplify it before the Q3 launch. Can you confirm whether engineering can complete this by Friday?\n\nFrom: Noah Williams <noah@example.com>\nTo: Maya Chen; Product Team\nDate: July 8, 2026 11:35 AM\nSubject: Re: Q3 onboarding refresh\n\nWe reviewed the scope and agreed to remove the optional integration screen from the initial flow. Engineering will deliver the revised setup by Friday EOD. Maya, please send the final copy by Wednesday.\n\nFrom: Priya Shah <priya@example.com>\nTo: Product Team\nDate: July 9, 2026 8:20 AM\nSubject: Re: Q3 onboarding refresh\n\nThe design is approved. One open question remains: should returning users see the new checklist? I will prepare the analytics events once that is confirmed.`;
