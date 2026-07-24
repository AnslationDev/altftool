import {
  DEFAULT_ENABLED_TYPES,
  PII_TYPES,
  redactText,
} from "../../universal-pii-ai-redactor/lib/redact.mjs";

const MAX_SOURCE_CHARACTERS = 2_000_000;
const MAX_MESSAGES = 5_000;

function contentToText(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        typeof part === "string"
          ? part
          : typeof part?.text === "string"
            ? part.text
            : "",
      )
      .filter(Boolean)
      .join("\n");
  }
  if (Array.isArray(content?.parts)) return contentToText(content.parts);
  if (typeof content?.text === "string") return content.text;
  return "";
}

function normalizeRole(value) {
  const role = String(value || "unknown").trim().toLowerCase();
  if (["user", "human"].includes(role)) return "user";
  if (["assistant", "model", "bot", "ai"].includes(role)) return "assistant";
  if (role === "system") return "system";
  return role.slice(0, 40) || "unknown";
}

function normalizeMessage(message, index) {
  const content = contentToText(
    message?.content ?? message?.text ?? message?.message?.content ?? message?.parts,
  );
  if (!content.trim()) return null;

  return {
    index,
    role: normalizeRole(
      message?.role ??
        message?.author?.role ??
        message?.sender ??
        message?.message?.author?.role,
    ),
    content,
    timestamp:
      message?.create_time ??
      message?.created_at ??
      message?.timestamp ??
      message?.message?.create_time ??
      null,
  };
}

function messagesFromMapping(mapping) {
  return Object.values(mapping || {})
    .map((node, index) => normalizeMessage(node?.message, index))
    .filter(Boolean)
    .sort((left, right) => Number(left.timestamp || 0) - Number(right.timestamp || 0))
    .map((message, index) => ({ ...message, index }));
}

function messagesFromJson(parsed) {
  if (Array.isArray(parsed)) {
    const directMessages = parsed.map(normalizeMessage).filter(Boolean);
    if (directMessages.length) return directMessages;
    return parsed.flatMap((item) => messagesFromJson(item));
  }
  if (!parsed || typeof parsed !== "object") return [];
  if (parsed.mapping && typeof parsed.mapping === "object") {
    return messagesFromMapping(parsed.mapping);
  }
  if (Array.isArray(parsed.messages)) {
    return parsed.messages.map(normalizeMessage).filter(Boolean);
  }
  if (Array.isArray(parsed.conversations)) {
    return parsed.conversations.flatMap((conversation) => messagesFromJson(conversation));
  }
  const single = normalizeMessage(parsed, 0);
  return single ? [single] : [];
}

function messagesFromText(text) {
  const marker = /^(user|human|assistant|model|bot|ai|system)\s*:\s*/i;
  const messages = [];
  let current = null;

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(marker);
    if (match) {
      if (current?.content.trim()) messages.push({ ...current, index: messages.length });
      current = {
        role: normalizeRole(match[1]),
        content: line.slice(match[0].length),
        timestamp: null,
      };
    } else if (current) {
      current.content += `${current.content ? "\n" : ""}${line}`;
    } else if (line.trim()) {
      current = { role: "unknown", content: line, timestamp: null };
    }
  }
  if (current?.content.trim()) messages.push({ ...current, index: messages.length });
  return messages;
}

export function parseConversation(source) {
  const raw = String(source || "");
  const text = raw.slice(0, MAX_SOURCE_CHARACTERS);
  if (!text.trim()) {
    return { ok: false, error: "Paste or upload a conversation first.", messages: [] };
  }

  let format = "text";
  let messages = [];
  try {
    const parsed = JSON.parse(text);
    messages = messagesFromJson(parsed);
    if (messages.length) format = "json";
  } catch {
    messages = messagesFromText(text);
  }

  if (!messages.length) {
    messages = [{ index: 0, role: "unknown", content: text, timestamp: null }];
  }

  return {
    ok: true,
    format,
    messages: messages.slice(0, MAX_MESSAGES),
    truncated: raw.length > text.length || messages.length > MAX_MESSAGES,
  };
}

export function scanConversation(source, options = {}) {
  const parsed = parseConversation(source);
  if (!parsed.ok) return parsed;

  const enabledTypes = options.enabledTypes || DEFAULT_ENABLED_TYPES;
  const mode = ["label", "partial", "remove"].includes(options.mode)
    ? options.mode
    : "label";
  const categoryTotals = new Map();

  const messages = parsed.messages.map((message) => {
    const result = redactText(message.content, { enabledTypes, mode });
    for (const item of result.summary) {
      const existing = categoryTotals.get(item.type) || {
        type: item.type,
        label: item.label,
        count: 0,
        uniqueValues: 0,
      };
      existing.count += item.count;
      existing.uniqueValues += item.uniqueValues;
      categoryTotals.set(item.type, existing);
    }
    return {
      index: message.index,
      role: message.role,
      redactedContent: result.output,
      detectionCount: result.total,
      categoryCount: result.summary.length,
    };
  });

  const transcript = messages
    .map((message) => `${message.role.toUpperCase()}: ${message.redactedContent}`)
    .join("\n\n");
  const detections = [...categoryTotals.values()].sort((left, right) => right.count - left.count);

  return {
    ok: true,
    format: parsed.format,
    messages,
    transcript,
    messageCount: messages.length,
    flaggedMessageCount: messages.filter((message) => message.detectionCount > 0).length,
    totalDetections: detections.reduce((sum, item) => sum + item.count, 0),
    detections,
    truncated: parsed.truncated,
    enabledTypeCount: enabledTypes.length,
    mode,
  };
}

export function buildConversationPrivacyReport(result) {
  if (!result?.ok) return null;
  return {
    generatedAt: new Date().toISOString(),
    inputFormat: result.format,
    messageCount: result.messageCount,
    flaggedMessageCount: result.flaggedMessageCount,
    totalDetections: result.totalDetections,
    detections: result.detections,
    truncated: result.truncated,
    note:
      "Counts are detector signals, not proof that all sensitive content was found. This report contains no conversation text.",
  };
}

export { DEFAULT_ENABLED_TYPES, PII_TYPES };
