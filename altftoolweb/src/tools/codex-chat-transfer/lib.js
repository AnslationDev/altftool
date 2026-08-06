const normalizeRole = (role) => {
  const value = String(role || "user").toLowerCase();
  if (value === "assistant" || value === "bot") return "assistant";
  if (value === "system") return "system";
  return "user";
};

function transcriptHeading(line) {
  const patterns = [
    /^\s*\*\*(user|assistant|bot|system):\*\*\s*(.*)$/i,
    /^\s*\*\*(user|assistant|bot|system)\*\*:\s*(.*)$/i,
    /^\s*#{1,6}\s+(user|assistant|bot|system)\s*:?\s*(.*)$/i,
  ];
  for (const pattern of patterns) {
    const match = String(line).match(pattern);
    if (match) return { role: normalizeRole(match[1]), content: match[2] };
  }
  return null;
}

export function parseMarkdownTranscript(input) {
  const messages = [];
  let currentRole = "user";
  let currentContent = [];

  const pushCurrent = () => {
    const content = currentContent.join("\n").trim();
    if (content) messages.push({ role: currentRole, content });
  };

  for (const line of String(input ?? "").split("\n")) {
    const heading = transcriptHeading(line);
    if (heading) {
      pushCurrent();
      currentRole = heading.role;
      currentContent = heading.content ? [heading.content] : [];
    } else {
      currentContent.push(line);
    }
  }
  pushCurrent();
  return messages;
}

export function parseChatInput(input) {
  const cleanInput = String(input ?? "").trim();
  if (!cleanInput) return [];

  if (!cleanInput.startsWith("[") && !cleanInput.startsWith("{")) {
    return parseMarkdownTranscript(cleanInput);
  }

  const parsed = JSON.parse(cleanInput);
  if (Array.isArray(parsed)) {
    return parsed.map((message) => ({
      role: normalizeRole(message?.role),
      content: message?.content || message?.text || "",
    }));
  }

  if (parsed && Array.isArray(parsed.messages)) {
    const messages = parsed.messages.map((message) => ({
      role: normalizeRole(message?.role),
      content: message?.content || "",
    }));
    if (parsed.system) messages.unshift({ role: "system", content: parsed.system });
    return messages;
  }

  throw new Error("JSON structure must be an array of messages or contain a messages array.");
}
