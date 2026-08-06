import { LANGUAGE_ALIASES, SUPPORTED_LANGUAGES } from "./constants.js";

export function parseChatFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let result;
        switch (ext) {
          case "json":
            result = parseJSON(e.target.result);
            break;
          case "md":
            result = parseMarkdown(e.target.result);
            break;
          case "txt":
            result = parseText(e.target.result);
            break;
          case "html":
          case "htm":
            result = parseHTML(e.target.result);
            break;
          case "csv":
            result = parseCSV(e.target.result);
            break;
          default:
            result = parseText(e.target.result);
        }
        resolve(result);
      } catch (err) {
        reject(new Error(`Failed to parse: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    if (
      ext === "json" ||
      ext === "md" ||
      ext === "txt" ||
      ext === "html" ||
      ext === "htm" ||
      ext === "csv"
    ) {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  });
}

export function parsePastedContent(text) {
  text = text.trim();
  if (text.startsWith("[") || text.startsWith("{")) {
    return parseJSON(text);
  }
  if (text.includes("```") || /^#{1,6}\s/m.test(text)) {
    return parseMarkdown(text);
  }
  if (/^("([^"]*)"|[^,]*),/m.test(text)) {
    return parseCSV(text);
  }
  return parseText(text);
}

function parseJSON(content) {
  const data = JSON.parse(content);
  if (Array.isArray(data)) {
    return {
      title: "ChatGPT Conversation",
      createdAt: new Date().toISOString(),
      messages: data.flatMap((item) => extractMessages(item)),
    };
  }
  if (data.messages || data.conversation) {
    const msgs = data.messages || data.conversation || [];
    const title = data.title || data.conversation_title || "ChatGPT Conversation";
    return {
      title,
      createdAt: data.created_at || data.create_time || new Date().toISOString(),
      messages: msgs.map((m) => normalizeMessage(m)),
    };
  }
  if (data.text || data.content) {
    return parseText(data.text || data.content);
  }
  return {
    title: "ChatGPT Conversation",
    createdAt: new Date().toISOString(),
    messages: extractMessages(data),
  };
}

function extractMessages(data) {
  if (typeof data !== "object" || data === null) return [];
  const messages = [];

  // ChatGPT's data export stores each message inside a mapping node instead of
  // placing role/content beside one another. Recognize that documented shape
  // before the generic recursive walk so an official conversations.json file
  // does not parse into an empty thread.
  if (data.message?.author?.role && data.message?.content) {
    const message = data.message;
    messages.push(
      normalizeMessage({
        id: message.id || data.id,
        role: message.author.role,
        content: message.content,
        create_time: message.create_time,
      }),
    );
    return messages;
  }

  if (data.role && data.content) {
    messages.push(normalizeMessage(data));
  }
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) {
      for (const item of data[key]) {
        messages.push(...extractMessages(item));
      }
    } else if (typeof data[key] === "object" && data[key] !== null) {
      messages.push(...extractMessages(data[key]));
    }
  }
  return messages;
}

function normalizeMessage(msg) {
  const role = msg.role === "user" ? "user" : "assistant";
  let content = "";
  if (typeof msg.content === "string") {
    content = msg.content;
  } else if (msg.content?.parts) {
    content = msg.content.parts.map((p) => (typeof p === "string" ? p : JSON.stringify(p))).join("\n\n");
  } else if (typeof msg.content === "object" && msg.content !== null) {
    content = JSON.stringify(msg.content);
  }
  const parts = parseContent(content);
  const rawTimestamp = msg.timestamp || msg.create_time;
  const timestamp =
    typeof rawTimestamp === "number" && rawTimestamp > 0 && rawTimestamp < 1e12
      ? rawTimestamp * 1000
      : rawTimestamp || new Date().toISOString();
  return {
    id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content: parts.text,
    timestamp,
    codeBlocks: parts.codeBlocks,
    tables: parts.tables,
    images: [],
    links: [],
  };
}

function parseContent(text) {
  const codeBlocks = [];
  const tables = [];
  let processed = text;

  const codeRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let match;
  let idx = 0;
  while ((match = codeRegex.exec(text)) !== null) {
    const lang = match[1].toLowerCase() || "text";
    const code = match[2].trim();
    codeBlocks.push({
      id: `code-${idx++}`,
      language: LANGUAGE_ALIASES[lang] || lang,
      code,
    });
  }

  const tableRegex = /^\|(.+)\|\n\|[-| ]+\|\n(\|.+\|\n?)*/gm;
  while ((match = tableRegex.exec(text)) !== null) {
    const rows = match[0].trim().split("\n");
    const headers = rows[0]
      .split("|")
      .map((h) => h.trim())
      .filter(Boolean);
    const data = rows.slice(2).map((row) =>
      row
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean)
    );
    tables.push({ headers, data });
  }

  return { text: processed, codeBlocks, tables };
}

function parseMarkdown(text) {
  const lines = text.split("\n");
  const messages = [];
  let currentRole = null;
  let currentContent = [];
  let title = "ChatGPT Conversation";

  const titleMatch = text.match(/^#\s+(.+)/m);
  if (titleMatch) title = titleMatch[1];

  const roleRegex = /^>\s*\*\*(User|Assistant|You|ChatGPT):?\*\*/i;
  const altRoleRegex = /^>\s*\*\*(.+?)\*\*\s*$/;

  for (const line of lines) {
    const match = line.match(roleRegex);
    if (match) {
      if (currentRole && currentContent.length) {
        messages.push(buildMessage(currentRole, currentContent.join("\n")));
      }
      currentRole = match[1].toLowerCase() === "user" || match[1].toLowerCase() === "you" ? "user" : "assistant";
      currentContent = [];
      continue;
    }
    const altMatch = line.match(altRoleRegex);
    if (altMatch && (currentRole === null)) {
      continue;
    }
    if (currentRole) {
      currentContent.push(line);
    }
  }
  if (currentRole && currentContent.length) {
    messages.push(buildMessage(currentRole, currentContent.join("\n")));
  }

  if (messages.length === 0) {
    messages.push(buildMessage("assistant", text));
  }

  return {
    title,
    createdAt: new Date().toISOString(),
    messages,
  };
}

function buildMessage(role, content) {
  const cleaned = content
    .replace(/^>\s*/gm, "")
    .replace(/^\*\*(.*?)\*\*:\s*/m, "")
    .trim();
  const parts = parseContent(cleaned);
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content: parts.text,
    timestamp: new Date().toISOString(),
    codeBlocks: parts.codeBlocks,
    tables: parts.tables,
    images: [],
    links: [],
  };
}

function parseText(text) {
  return {
    title: "ChatGPT Conversation",
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: "msg-1",
        role: "assistant",
        content: text,
        timestamp: new Date().toISOString(),
        codeBlocks: [],
        tables: [],
        images: [],
        links: [],
      },
    ],
  };
}

function parseHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const title = doc.title || "ChatGPT Conversation";
  const body = doc.body?.textContent || "";
  const codeEls = doc.querySelectorAll("pre code, code");
  const codeBlocks = Array.from(codeEls).map((el, i) => ({
    id: `code-${i}`,
    language: (el.className || "").replace(/^language-/, "") || "text",
    code: el.textContent || "",
  }));
  return {
    title,
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: "msg-1",
        role: "assistant",
        content: body,
        timestamp: new Date().toISOString(),
        codeBlocks,
        tables: [],
        images: [],
        links: [],
      },
    ],
  };
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  const messages = [];
  for (const line of lines) {
    const parts = line.split(",");
    if (parts.length >= 2) {
      const role = parts[0].replace(/["']/g, "").toLowerCase().trim();
      const content = parts.slice(1).join(",").replace(/["']/g, "").trim();
      if (role === "user" || role === "assistant") {
        messages.push(buildMessage(role, content));
      }
    }
  }
  if (messages.length === 0) {
    messages.push(buildMessage("assistant", text));
  }
  return {
    title: "ChatGPT Conversation",
    createdAt: new Date().toISOString(),
    messages,
  };
}

export function extractStats(conversation) {
  if (!conversation?.messages) {
    return {
      totalMessages: 0,
      userMessages: 0,
      assistantMessages: 0,
      wordCount: 0,
      charCount: 0,
      codeBlocks: 0,
      tables: 0,
      images: 0,
      links: 0,
      readingTime: 0,
    };
  }
  const msgs = conversation.messages;
  const userMessages = msgs.filter((m) => m.role === "user").length;
  const assistantMessages = msgs.filter((m) => m.role === "assistant").length;
  const allText = msgs.map((m) => m.content).join(" ");
  const words = allText.trim() ? allText.trim().split(/\s+/).length : 0;
  const chars = allText.length;
  const codeBlocks = msgs.reduce((sum, m) => sum + (m.codeBlocks?.length || 0), 0);
  const tables = msgs.reduce((sum, m) => sum + (m.tables?.length || 0), 0);
  const images = msgs.reduce((sum, m) => sum + (m.images?.length || 0), 0);
  const links = msgs.reduce((sum, m) => sum + (m.links?.length || 0), 0);
  const readingTime = Math.max(1, Math.ceil(words / 200));

  return {
    totalMessages: msgs.length,
    userMessages,
    assistantMessages,
    wordCount: words,
    charCount: chars,
    codeBlocks,
    tables,
    images,
    links,
    readingTime,
  };
}
