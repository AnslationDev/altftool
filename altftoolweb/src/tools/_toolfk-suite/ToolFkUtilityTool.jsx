"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowDownUp,
  Binary,
  Braces,
  CheckCircle2,
  Clipboard,
  Code2,
  Copy,
  Download,
  FileCode2,
  FileText,
  Hash,
  ImageIcon,
  KeyRound,
  Link2,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toolDefinitions = {
  "text-to-base64": {
    title: "Text to Base64",
    badge: "Encoding",
    icon: Binary,
    description: "Encode readable text into Base64 and decode Base64 back into plain text.",
    mode: "text",
    sample: "AltFTool microtools are fast.",
    actions: ["textToBase64", "base64ToText", "textToHex"],
  },
  "base64-to-text": {
    title: "Base64 to Text",
    badge: "Encoding",
    icon: Binary,
    description: "Decode Base64 payloads into readable UTF-8 text.",
    mode: "text",
    sample: "QWx0RlRvb2wgbWljcm90b29scw==",
    actions: ["base64ToText", "base64ToHex", "base64UrlToBase64"],
  },
  "base64-to-ascii": {
    title: "Base64 to ASCII",
    badge: "Encoding",
    icon: Binary,
    description: "Decode Base64 and inspect ASCII-safe output.",
    mode: "text",
    sample: "SGVsbG8gQVNDSUk=",
    actions: ["base64ToText", "base64ToHex"],
  },
  "base64-to-hex": {
    title: "Base64 to Hex",
    badge: "Encoding",
    icon: Hash,
    description: "Decode Base64 and inspect the raw hexadecimal byte output.",
    mode: "text",
    sample: "QWx0RlRvb2w=",
    actions: ["base64ToHex", "base64ToText"],
  },
  "hex-to-base64": {
    title: "Hex to Base64",
    badge: "Encoding",
    icon: Hash,
    description: "Convert hexadecimal strings into Base64 and back.",
    mode: "text",
    sample: "48656c6c6f20416c7446546f6f6c",
    actions: ["hexToBase64", "base64ToHex"],
  },
  "base64-url-converter": {
    title: "Base64 URL Converter",
    badge: "Encoding",
    icon: Link2,
    description: "Switch between standard Base64 and URL-safe Base64 for tokens and web payloads.",
    mode: "text",
    sample: "AltFTool+tools/utility?",
    actions: ["textToBase64Url", "base64UrlToBase64", "base64ToBase64Url", "base64ToText"],
  },
  "base64-url-encoder": {
    title: "Base64 URL Encoder",
    badge: "Encoding",
    icon: Link2,
    description: "Encode text into URL-safe Base64 and normalize token payloads.",
    mode: "text",
    sample: "https://altftool.com/tools/all",
    actions: ["textToBase64Url", "base64ToBase64Url", "base64UrlToBase64"],
  },
  "url-escape-unescape": {
    title: "URL Escape / Unescape",
    badge: "Web",
    icon: Link2,
    description: "Encode and decode URL text for query strings and redirect parameters.",
    mode: "text",
    sample: "https://example.com/search?q=online tools & apps",
    actions: ["urlEncode", "urlDecode"],
  },
  "unicode-ascii-converter": {
    title: "Unicode / ASCII Converter",
    badge: "Text",
    icon: FileText,
    description: "Convert text into Unicode escape sequences and decode them back.",
    mode: "text",
    sample: "AltFTool",
    actions: ["textToUnicodeEscapes", "unicodeEscapesToText", "textToAsciiCodes", "asciiCodesToText"],
  },
  "morse-code-translator": {
    title: "Morse Code Translator",
    badge: "Text",
    icon: ArrowDownUp,
    description: "Translate plain text to Morse code and decode Morse code back.",
    mode: "text",
    sample: "ALT F TOOL",
    actions: ["textToMorse", "morseToText"],
  },
  "emoji-remover": {
    title: "Emoji Remover",
    badge: "Text",
    icon: Wand2,
    description: "Remove emoji and symbol noise from copied text, comments, and captions.",
    mode: "text",
    sample: "Launch day 🚀 tools are ready ✅",
    actions: ["removeEmoji", "stripExtraSpaces", "extractHashtags"],
  },
  "json-editor": {
    title: "JSON Editor",
    badge: "Developer",
    icon: Braces,
    description: "Validate, format, minify, and convert JSON snippets.",
    mode: "code",
    sample: '{"name":"AltFTool","tools":["base64","json","csv"],"active":true}',
    actions: ["formatJson", "minifyJson", "jsonToYaml", "jsonToCsv"],
  },
  "yaml-formatter": {
    title: "YAML Formatter",
    badge: "Developer",
    icon: Braces,
    description: "Clean up simple YAML, inspect keys, and convert flat YAML snippets into JSON.",
    mode: "code",
    sample: "name: AltFTool\nactive: true\ntools:\n- base64\n- json\n- csv",
    actions: ["formatYaml", "yamlToJson", "yamlKeys"],
  },
  "xml-editor": {
    title: "XML Editor",
    badge: "Developer",
    icon: Code2,
    description: "Format, minify, and lightly inspect XML documents.",
    mode: "code",
    sample: "<root><tool name=\"AltFTool\"><type>utility</type></tool></root>",
    actions: ["formatXml", "minifyXml", "xmlTags"],
  },
  "html-editor": {
    title: "HTML Editor",
    badge: "Developer",
    icon: FileCode2,
    description: "Format, minify, escape, and unescape HTML fragments.",
    mode: "code",
    sample: "<section><h1>AltFTool</h1><p>Fast online tools</p></section>",
    actions: ["formatHtml", "minifyHtml", "escapeHtml", "unescapeHtml"],
  },
  "css-tools": {
    title: "CSS Tools",
    badge: "Developer",
    icon: Code2,
    description: "Format and minify CSS while keeping it readable for quick edits.",
    mode: "code",
    sample: ".card{display:flex;color:#111;background:white}.card:hover{transform:translateY(-2px)}",
    actions: ["formatCss", "minifyCss"],
  },
  "javascript-tools": {
    title: "JavaScript Tools",
    badge: "Developer",
    icon: Code2,
    description: "Format, minify, and inspect JavaScript snippets in the browser.",
    mode: "code",
    sample: "function hello(name){const text='Hello '+name;return text.toUpperCase()}",
    actions: ["formatJs", "minifyJs", "countJs"],
  },
  "sql-formatter-online": {
    title: "SQL Formatter Online",
    badge: "Developer",
    icon: Code2,
    description: "Format SQL queries with readable line breaks for SELECT, JOIN, WHERE, and GROUP BY clauses.",
    mode: "code",
    sample: "select id,name,email from users where status='active' order by created_at desc",
    actions: ["formatSql", "minifySql"],
  },
  "csv-converter": {
    title: "CSV Converter",
    badge: "Data",
    icon: FileText,
    description: "Convert CSV into JSON, HTML tables, XML, SQL inserts, or Python dictionaries.",
    mode: "code",
    sample: "name,email\\nAda,ada@example.com\\nGrace,grace@example.com",
    actions: ["csvToJson", "csvToHtml", "csvToXml", "csvToSql", "csvToPython"],
  },
  "markdown-html-converter": {
    title: "Markdown / HTML Converter",
    badge: "Content",
    icon: FileText,
    description: "Convert common Markdown syntax into clean HTML and strip HTML back to text.",
    mode: "code",
    sample: "# AltFTool\\n\\n- Fast tools\\n- Clean output\\n\\n**Ready** to use.",
    actions: ["markdownToHtml", "htmlToText"],
  },
  "text-encryptor": {
    title: "Text Encryptor",
    badge: "Security",
    icon: KeyRound,
    description: "Hash text with SHA algorithms and create reversible passphrase-protected AES-GCM messages.",
    mode: "crypto",
    sample: "Confidential launch note",
    actions: ["sha256", "sha512", "aesEncrypt", "aesDecrypt"],
  },
  "curl-to-code-converter": {
    title: "cURL to Code Converter",
    badge: "Developer",
    icon: Code2,
    description: "Convert simple cURL commands into fetch, Axios, and Python requests snippets.",
    mode: "code",
    sample: "curl -X POST https://api.example.com/users -H 'Content-Type: application/json' -d '{\"name\":\"Ada\"}'",
    actions: ["curlToFetch", "curlToAxios", "curlToPython"],
  },
  "htaccess-to-nginx": {
    title: "HTAccess to NGINX",
    badge: "DevOps",
    icon: ShieldCheck,
    description: "Convert common Apache rewrite rules into starter NGINX rewrite blocks.",
    mode: "code",
    sample: "RewriteRule ^old-page$ /new-page [R=301,L]\\nRewriteRule ^blog/(.*)$ /posts/$1 [L]",
    actions: ["htaccessToNginx"],
  },
  "crontab-evaluator": {
    title: "Crontab Evaluator",
    badge: "DevOps",
    icon: Code2,
    description: "Preview upcoming run times for standard five-field crontab expressions.",
    mode: "cron",
    sample: "*/15 9-17 * * 1-5",
  },
  "text-diff-tool": {
    title: "Text Diff Tool",
    badge: "Developer",
    icon: FileText,
    description: "Compare two text blocks line-by-line and highlight changed lines.",
    mode: "diff",
  },
  "scientific-notation-calculator": {
    title: "Scientific Notation Calculator",
    badge: "Calculator",
    icon: Binary,
    description: "Convert large or tiny numbers into scientific and engineering notation.",
    mode: "scientific",
  },
  "base-converter": {
    title: "Base Converter",
    badge: "Calculator",
    icon: Binary,
    description: "Convert numbers between binary, octal, decimal, hexadecimal, and custom bases.",
    mode: "base",
  },
  "byte-converter": {
    title: "Byte Converter",
    badge: "Calculator",
    icon: Binary,
    description: "Convert bytes, KB, MB, GB, TB, and bits with binary or decimal units.",
    mode: "bytes",
  },
  "svg-to-image": {
    title: "SVG to Image",
    badge: "Image",
    icon: ImageIcon,
    description: "Render SVG markup to a downloadable PNG preview directly in the browser.",
    mode: "svg",
    sample: '<svg xmlns="http://www.w3.org/2000/svg" width="720" height="360"><rect width="100%" height="100%" rx="32" fill="#111827"/><text x="50%" y="52%" text-anchor="middle" fill="#fff" font-size="44" font-family="Arial">AltFTool</text></svg>',
  },
  "file-to-base64": {
    title: "File to Base64",
    badge: "Files",
    icon: Upload,
    description: "Convert any local file into a Base64 data URL for quick embeds or debugging.",
    mode: "fileToBase64",
    accept: "*/*",
  },
  "pdf-to-base64": {
    title: "PDF to Base64",
    badge: "PDF",
    icon: Upload,
    description: "Convert PDF files into Base64 data URLs without uploading them.",
    mode: "fileToBase64",
    accept: "application/pdf",
  },
  "audio-to-base64": {
    title: "Audio to Base64",
    badge: "Media",
    icon: Upload,
    description: "Convert audio files into Base64 data URLs for testing embeds and payloads.",
    mode: "fileToBase64",
    accept: "audio/*",
  },
  "mp4-to-base64": {
    title: "MP4 to Base64",
    badge: "Media",
    icon: Upload,
    description: "Convert MP4 video files into Base64 data URLs locally in your browser.",
    mode: "fileToBase64",
    accept: "video/mp4",
  },
  "base64-to-file": {
    title: "Base64 to File",
    badge: "Files",
    icon: Download,
    description: "Turn Base64 strings or data URLs into downloadable files.",
    mode: "base64ToFile",
    defaultMime: "application/octet-stream",
    defaultName: "altftool-output.bin",
  },
  "base64-to-image": {
    title: "Base64 to Image",
    badge: "Image",
    icon: ImageIcon,
    description: "Preview and download Base64 image data.",
    mode: "base64ToFile",
    preview: "image",
    defaultMime: "image/png",
    defaultName: "image.png",
  },
  "base64-to-pdf": {
    title: "Base64 to PDF",
    badge: "PDF",
    icon: Download,
    description: "Preview and download Base64 PDF data.",
    mode: "base64ToFile",
    preview: "pdf",
    defaultMime: "application/pdf",
    defaultName: "document.pdf",
  },
  "base64-audio-converter": {
    title: "Base64 Audio Converter",
    badge: "Media",
    icon: Download,
    description: "Preview and download Base64 audio data URLs.",
    mode: "base64ToFile",
    preview: "audio",
    defaultMime: "audio/mpeg",
    defaultName: "audio.mp3",
  },
  "base64-to-video": {
    title: "Base64 to Video",
    badge: "Media",
    icon: Download,
    description: "Preview and download Base64 video data URLs.",
    mode: "base64ToFile",
    preview: "video",
    defaultMime: "video/mp4",
    defaultName: "video.mp4",
  },
};

const toolPresets = {
  "text-to-base64": [
    { label: "Short note", value: "AltFTool microtools are fast.", action: "textToBase64" },
    { label: "URL token", value: "user=altftool&plan=pro", action: "textToBase64Url" },
  ],
  "base64-to-text": [
    { label: "Plain text", value: "QWx0RlRvb2wgbWljcm90b29scw==", action: "base64ToText" },
    { label: "Hex inspect", value: "SGVsbG8gQmFzZTY0", action: "base64ToHex" },
  ],
  "json-editor": [
    { label: "API JSON", value: '{"name":"AltFTool","tools":["base64","json","csv"],"active":true}', action: "formatJson" },
    { label: "JSON list", value: '[{"name":"Ada","role":"Engineer"},{"name":"Grace","role":"Scientist"}]', action: "jsonToCsv" },
  ],
  "yaml-formatter": [
    { label: "Tool config", value: "name: AltFTool\nactive: true\ntools:\n- base64\n- json\n- csv", action: "formatYaml" },
    { label: "Flat YAML", value: "title: Launch\nstatus: ready\ncount: 12", action: "yamlToJson" },
  ],
  "xml-editor": [
    { label: "XML doc", value: "<root><tool name=\"AltFTool\"><type>utility</type></tool></root>", action: "formatXml" },
    { label: "RSS item", value: "<item><title>New Tool</title><link>/tools/all</link></item>", action: "xmlTags" },
  ],
  "html-editor": [
    { label: "Section", value: "<section><h1>AltFTool</h1><p>Fast online tools</p></section>", action: "formatHtml" },
    { label: "Escape sample", value: "<button>Save & Continue</button>", action: "escapeHtml" },
  ],
  "css-tools": [
    { label: "Card CSS", value: ".card{display:flex;color:#111;background:white}.card:hover{transform:translateY(-2px)}", action: "formatCss" },
    { label: "Button CSS", value: ".btn { padding: 12px 16px; border-radius: 8px; color: white; background: #2563eb; }", action: "minifyCss" },
  ],
  "javascript-tools": [
    { label: "Function", value: "function hello(name){const text='Hello '+name;return text.toUpperCase()}", action: "formatJs" },
    { label: "Metrics", value: "const tools=['json','csv'];\nconst ready=tools.map((tool)=>tool.toUpperCase());", action: "countJs" },
  ],
  "sql-formatter-online": [
    { label: "Select query", value: "select id,name,email from users where status='active' order by created_at desc", action: "formatSql" },
    { label: "Join query", value: "select users.name,orders.total from users join orders on users.id=orders.user_id where orders.total>100", action: "formatSql" },
  ],
  "csv-converter": [
    { label: "Users CSV", value: "name,email\nAda,ada@example.com\nGrace,grace@example.com", action: "csvToJson" },
    { label: "Products CSV", value: "sku,title,price\nALT-1,JSON Tool,0\nALT-2,Base64 Tool,0", action: "csvToHtml" },
  ],
  "markdown-html-converter": [
    { label: "Feature list", value: "# AltFTool\n\n- Fast tools\n- Clean output\n\n**Ready** to use.", action: "markdownToHtml" },
    { label: "HTML text", value: "<h2>AltFTool</h2><p>Simple utilities for daily work.</p>", action: "htmlToText" },
  ],
  "curl-to-code-converter": [
    { label: "POST JSON", value: "curl -X POST https://api.example.com/users -H 'Content-Type: application/json' -d '{\"name\":\"Ada\"}'", action: "curlToFetch" },
    { label: "GET API", value: "curl https://api.example.com/tools -H 'Authorization: Bearer token'", action: "curlToPython" },
  ],
  "htaccess-to-nginx": [
    { label: "Redirects", value: "RewriteRule ^old-page$ /new-page [R=301,L]\nRewriteRule ^blog/(.*)$ /posts/$1 [L]", action: "htaccessToNginx" },
  ],
  "text-encryptor": [
    { label: "Private note", value: "Confidential launch note", action: "sha256" },
    { label: "AES payload", value: "Message to encrypt locally", action: "aesEncrypt" },
  ],
};

const actionLabels = {
  textToBase64: "Text -> Base64",
  base64ToText: "Base64 -> Text",
  textToHex: "Text -> Hex",
  base64ToHex: "Base64 -> Hex",
  hexToBase64: "Hex -> Base64",
  base64UrlToBase64: "URL-safe -> Base64",
  base64ToBase64Url: "Base64 -> URL-safe",
  textToBase64Url: "Text -> URL-safe Base64",
  urlEncode: "URL Encode",
  urlDecode: "URL Decode",
  textToUnicodeEscapes: "Text -> Unicode Escapes",
  unicodeEscapesToText: "Unicode Escapes -> Text",
  textToAsciiCodes: "Text -> ASCII Codes",
  asciiCodesToText: "ASCII Codes -> Text",
  textToMorse: "Text -> Morse",
  morseToText: "Morse -> Text",
  removeEmoji: "Remove Emoji",
  stripExtraSpaces: "Clean Spaces",
  extractHashtags: "Extract Hashtags",
  formatJson: "Format JSON",
  minifyJson: "Minify JSON",
  jsonToYaml: "JSON -> YAML",
  jsonToCsv: "JSON -> CSV",
  formatXml: "Format XML",
  minifyXml: "Minify XML",
  xmlTags: "List XML Tags",
  formatHtml: "Format HTML",
  minifyHtml: "Minify HTML",
  escapeHtml: "Escape HTML",
  unescapeHtml: "Unescape HTML",
  formatCss: "Format CSS",
  minifyCss: "Minify CSS",
  formatJs: "Format JS",
  minifyJs: "Minify JS",
  countJs: "JS Metrics",
  formatSql: "Format SQL",
  minifySql: "Minify SQL",
  csvToJson: "CSV -> JSON",
  csvToHtml: "CSV -> HTML",
  csvToXml: "CSV -> XML",
  csvToSql: "CSV -> SQL",
  csvToPython: "CSV -> Python",
  markdownToHtml: "Markdown -> HTML",
  htmlToText: "HTML -> Text",
  formatYaml: "Format YAML",
  yamlToJson: "YAML -> JSON",
  yamlKeys: "List YAML Keys",
  sha256: "SHA-256 Hash",
  sha512: "SHA-512 Hash",
  aesEncrypt: "AES Encrypt",
  aesDecrypt: "AES Decrypt",
  curlToFetch: "cURL -> fetch",
  curlToAxios: "cURL -> Axios",
  curlToPython: "cURL -> Python",
  htaccessToNginx: "Convert Rules",
};

const morseMap = {
  a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....",
  i: "..", j: ".---", k: "-.-", l: ".-..", m: "--", n: "-.", o: "---", p: ".--.",
  q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-",
  y: "-.--", z: "--..", 0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-",
  5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----.",
};
const reverseMorseMap = Object.fromEntries(Object.entries(morseMap).map(([key, value]) => [value, key]));

function getExamples(slug, definition) {
  if (toolPresets[slug]) return toolPresets[slug];
  if (!definition.sample) return [];
  return [{ label: "Example input", value: definition.sample, action: definition.actions?.[0] }];
}

function getSlugFromPath(pathname = "") {
  const parts = pathname.split("/").filter(Boolean);
  return parts.at(-1) || "text-to-base64";
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value) {
  const cleaned = String(value).trim().replace(/^data:[^,]+,/, "");
  const binary = atob(cleaned);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function textToBase64(value) {
  return bytesToBase64(encoder.encode(value));
}

function base64ToText(value) {
  return decoder.decode(base64ToBytes(value));
}

function textToHex(value) {
  return Array.from(encoder.encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(value) {
  const hex = value.replace(/[^a-fA-F0-9]/g, "");
  if (hex.length % 2) throw new Error("Hex input must contain an even number of characters.");
  return Uint8Array.from(hex.match(/.{1,2}/g)?.map((part) => parseInt(part, 16)) || []);
}

function toBase64Url(value) {
  return value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  return normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
}

function encodeSharedToolState(slug, state) {
  const payload = JSON.stringify({ v: 1, slug, state });
  return toBase64Url(bytesToBase64(encoder.encode(payload)));
}

function readSharedToolState(slug) {
  if (typeof window === "undefined") return null;

  const encoded = new URLSearchParams(window.location.search).get("state");
  if (!encoded) return null;

  try {
    const payload = JSON.parse(decoder.decode(base64ToBytes(fromBase64Url(encoded))));
    if (payload?.v !== 1 || payload?.slug !== slug || !payload?.state) return null;
    return payload.state;
  } catch {
    return null;
  }
}

function sharedString(state, key, fallback = "") {
  return typeof state?.[key] === "string" ? state[key] : fallback;
}

function sharedAction(state, actions = [], fallback) {
  return actions.includes(state?.action) ? state.action : fallback;
}

function buildSharedToolUrl(slug, state) {
  const url = new URL(window.location.href);
  url.searchParams.set("state", encodeSharedToolState(slug, state));
  return url.toString();
}

function prettyJson(value) {
  return JSON.stringify(JSON.parse(value), null, 2);
}

function jsonToYamlValue(value, indent = 0) {
  if (Array.isArray(value)) {
    return value.map((item) => `${" ".repeat(indent)}- ${jsonToYamlValue(item, indent + 2).trimStart()}`).join("\n");
  }
  if (value && typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => {
        const rendered = jsonToYamlValue(item, indent + 2);
        const complex = item && typeof item === "object";
        return `${" ".repeat(indent)}${key}:${complex ? `\n${rendered}` : ` ${rendered.trim()}`}`;
      })
      .join("\n");
  }
  return String(value);
}

function formatYaml(value) {
  let listDepth = 0;
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      if (line.startsWith("-")) {
        return `${" ".repeat(listDepth)}- ${line.replace(/^-\s*/, "")}`;
      }
      listDepth = line.endsWith(":") ? 2 : 0;
      return line.replace(/\s*:\s*/g, ": ");
    })
    .join("\n");
}

function parseYamlScalar(value) {
  const clean = value.trim();
  if (clean === "true") return true;
  if (clean === "false") return false;
  if (clean === "null" || clean === "~") return null;
  if (/^-?\d+(\.\d+)?$/.test(clean)) return Number(clean);
  return clean.replace(/^["']|["']$/g, "");
}

function simpleYamlToJson(value) {
  const result = {};
  let activeListKey = "";

  formatYaml(value).split("\n").forEach((line) => {
    if (line.startsWith("-") && activeListKey) {
      result[activeListKey].push(parseYamlScalar(line.replace(/^-\s*/, "")));
      return;
    }

    const match = line.match(/^([^:]+):(.*)$/);
    if (!match) return;
    const key = match[1].trim();
    const raw = match[2].trim();
    if (!raw) {
      activeListKey = key;
      result[key] = [];
      return;
    }
    activeListKey = "";
    result[key] = parseYamlScalar(raw);
  });

  return result;
}

function parseCsv(value) {
  const rows = [];
  let current = "";
  let row = [];
  let quoted = false;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];
    const next = value[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function csvRecords(value) {
  const rows = parseCsv(value);
  const headers = rows[0] || [];
  return rows.slice(1).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header || `column_${index + 1}`, row[index] || ""]))
  );
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function unescapeHtml(value = "") {
  return String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&");
}

function formatDelimited(value, delimiterRegex, after = "\n") {
  return value
    .replace(/\s+/g, " ")
    .replace(delimiterRegex, after)
    .trim();
}

function formatXml(value) {
  const compact = value.replace(/>\s+</g, "><").trim();
  const tokens = compact.replace(/></g, ">\n<").split("\n");
  let depth = 0;
  return tokens
    .map((token) => {
      if (/^<\//.test(token)) depth = Math.max(depth - 1, 0);
      const line = `${"  ".repeat(depth)}${token}`;
      if (/^<[^!?/][^>]*[^/]?>$/.test(token) && !/<[^>]+>.*<\/[^>]+>/.test(token)) depth += 1;
      return line;
    })
    .join("\n");
}

function formatHtml(value) {
  return formatXml(value);
}

function formatCss(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*{\s*/g, " {\n  ")
    .replace(/;\s*/g, ";\n  ")
    .replace(/\s*}\s*/g, "\n}\n")
    .replace(/,\s*/g, ", ")
    .trim();
}

function formatJs(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*{\s*/g, " {\n  ")
    .replace(/;\s*/g, ";\n")
    .replace(/\s*}\s*/g, "\n}\n")
    .replace(/,\s*/g, ", ")
    .trim();
}

function formatSql(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|GROUP BY|ORDER BY|HAVING|LIMIT|VALUES|SET)\b/gi, "\n$1")
    .replace(/\b(AND|OR)\b/gi, "\n  $1")
    .replace(/,\s*/g, ",\n  ")
    .trim();
}

function markdownToHtml(value) {
  return value
    .split(/\n{2,}/)
    .map((block) => {
      if (block.startsWith("# ")) return `<h1>${escapeHtml(block.slice(2))}</h1>`;
      if (block.startsWith("## ")) return `<h2>${escapeHtml(block.slice(3))}</h2>`;
      if (/^- /m.test(block)) {
        const items = block.split("\n").map((line) => line.replace(/^- /, "").trim()).filter(Boolean);
        return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      }
      return `<p>${escapeHtml(block).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")}</p>`;
    })
    .join("\n");
}

function parseCurl(value) {
  const url = value.match(/https?:\/\/[^\s'"]+/)?.[0] || "";
  const method = value.match(/(?:-X|--request)\s+([A-Z]+)/i)?.[1] || (/-d\s/.test(value) ? "POST" : "GET");
  const headers = [...value.matchAll(/(?:-H|--header)\s+['"]([^:'"]+):\s*([^'"]+)['"]/g)].map(([, key, val]) => [key, val]);
  const body = value.match(/(?:-d|--data|--data-raw)\s+(['"])([\s\S]*?)\1/)?.[2] || "";
  return { url, method, headers, body };
}

function simpleNginxRewrite(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^RewriteRule\s+\^?(.+?)\$?\s+(.+?)\s+\[(.*?)\]/i);
      if (!match) return `# Review manually: ${line}`;
      const [, from, to, flags] = match;
      const code = /R=(\d+)/i.exec(flags)?.[1];
      return code ? `rewrite ^/${from}$ ${to} permanent; # ${code}` : `rewrite ^/${from}$ ${to} last;`;
    })
    .join("\n");
}

function parseCronPart(part, min, max, isWeekday = false) {
  const values = new Set();
  const add = (value) => {
    const normalized = isWeekday && value === 7 ? 0 : value;
    if (normalized >= min && normalized <= max) values.add(normalized);
  };

  part.split(",").forEach((segment) => {
    const [rangePart, stepPart] = segment.split("/");
    const step = Math.max(Number(stepPart || 1), 1);
    let start = min;
    let end = max;

    if (rangePart !== "*") {
      const [from, to] = rangePart.split("-");
      start = Number(from);
      end = Number(to || from);
    }

    for (let value = start; value <= end; value += step) add(value);
  });

  return values;
}

function nextCronRuns(expression, limit = 8) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) throw new Error("Use a standard five-field cron expression: minute hour day month weekday.");

  const [minute, hour, day, month, weekday] = parts;
  const minutes = parseCronPart(minute, 0, 59);
  const hours = parseCronPart(hour, 0, 23);
  const days = parseCronPart(day, 1, 31);
  const months = parseCronPart(month, 1, 12);
  const weekdays = parseCronPart(weekday, 0, 7, true);
  const runs = [];
  const cursor = new Date();
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  for (let i = 0; i < 525600 && runs.length < limit; i += 1) {
    if (
      minutes.has(cursor.getMinutes()) &&
      hours.has(cursor.getHours()) &&
      days.has(cursor.getDate()) &&
      months.has(cursor.getMonth() + 1) &&
      weekdays.has(cursor.getDay())
    ) {
      runs.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }

  if (!runs.length) throw new Error("No run times found in the next year.");
  return runs;
}

async function sha(value, algorithm) {
  const digest = await crypto.subtle.digest(algorithm, encoder.encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function deriveKey(passphrase, salt) {
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function outputForAction(action, input, secret) {
  switch (action) {
    case "textToBase64":
      return textToBase64(input);
    case "base64ToText":
      return base64ToText(input);
    case "textToHex":
      return textToHex(input);
    case "base64ToHex":
      return textToHex(base64ToText(input));
    case "hexToBase64":
      return bytesToBase64(hexToBytes(input));
    case "base64UrlToBase64":
      return fromBase64Url(input);
    case "base64ToBase64Url":
      return toBase64Url(input);
    case "textToBase64Url":
      return toBase64Url(textToBase64(input));
    case "urlEncode":
      return encodeURIComponent(input);
    case "urlDecode":
      return decodeURIComponent(input);
    case "textToUnicodeEscapes":
      return Array.from(input).map((char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`).join("");
    case "unicodeEscapesToText":
      return input.replace(/\\u([a-fA-F0-9]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
    case "textToAsciiCodes":
      return Array.from(input).map((char) => char.charCodeAt(0)).join(" ");
    case "asciiCodesToText":
      return input.split(/\s+/).filter(Boolean).map((code) => String.fromCharCode(Number(code))).join("");
    case "textToMorse":
      return input.toLowerCase().split("").map((char) => (char === " " ? "/" : morseMap[char] || char)).join(" ");
    case "morseToText":
      return input.split(/\s+/).map((part) => (part === "/" ? " " : reverseMorseMap[part] || part)).join("").toUpperCase();
    case "removeEmoji":
      return input.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
    case "stripExtraSpaces":
      return input.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    case "extractHashtags":
      return [...input.matchAll(/#[\w-]+/g)].map((match) => match[0]).join("\n");
    case "formatJson":
      return prettyJson(input);
    case "minifyJson":
      return JSON.stringify(JSON.parse(input));
    case "jsonToYaml":
      return jsonToYamlValue(JSON.parse(input));
    case "jsonToCsv": {
      const data = JSON.parse(input);
      const rows = Array.isArray(data) ? data : [data];
      const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
      return [headers.join(","), ...rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(","))].join("\n");
    }
    case "formatXml":
      return formatXml(input);
    case "minifyXml":
      return input.replace(/>\s+</g, "><").trim();
    case "xmlTags":
      return [...input.matchAll(/<\/?([a-zA-Z0-9:_-]+)/g)].map((match) => match[1]).filter((tag, index, arr) => arr.indexOf(tag) === index).join("\n");
    case "formatHtml":
      return formatHtml(input);
    case "minifyHtml":
      return input.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
    case "escapeHtml":
      return escapeHtml(input);
    case "unescapeHtml":
      return unescapeHtml(input);
    case "formatCss":
      return formatCss(input);
    case "minifyCss":
      return input.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").trim();
    case "formatJs":
      return formatJs(input);
    case "minifyJs":
      return input.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{}();,:=+\-*/<>])\s*/g, "$1").trim();
    case "countJs":
      return JSON.stringify({
        lines: input.split("\n").length,
        functions: (input.match(/\bfunction\b|=>/g) || []).length,
        characters: input.length,
      }, null, 2);
    case "formatSql":
      return formatSql(input);
    case "minifySql":
      return input.replace(/\s+/g, " ").trim();
    case "csvToJson":
      return JSON.stringify(csvRecords(input), null, 2);
    case "csvToHtml": {
      const rows = parseCsv(input);
      return `<table>\n${rows.map((row, index) => `  <tr>${row.map((cell) => `<${index === 0 ? "th" : "td"}>${escapeHtml(cell)}</${index === 0 ? "th" : "td"}>`).join("")}</tr>`).join("\n")}\n</table>`;
    }
    case "csvToXml":
      return `<rows>\n${csvRecords(input).map((row) => `  <row>\n${Object.entries(row).map(([key, value]) => `    <${key}>${escapeHtml(value)}</${key}>`).join("\n")}\n  </row>`).join("\n")}\n</rows>`;
    case "csvToSql": {
      const records = csvRecords(input);
      const keys = Object.keys(records[0] || {});
      return records.map((row) => `INSERT INTO table_name (${keys.join(", ")}) VALUES (${keys.map((key) => `'${String(row[key] || "").replace(/'/g, "''")}'`).join(", ")});`).join("\n");
    }
    case "csvToPython":
      return JSON.stringify(csvRecords(input), null, 2).replace(/^/, "rows = ");
    case "markdownToHtml":
      return markdownToHtml(input);
    case "htmlToText":
      return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    case "formatYaml":
      return formatYaml(input);
    case "yamlToJson":
      return JSON.stringify(simpleYamlToJson(input), null, 2);
    case "yamlKeys":
      return formatYaml(input).split("\n").map((line) => line.match(/^([^:]+):/)?.[1]?.trim()).filter(Boolean).join("\n");
    case "curlToFetch": {
      const parsed = parseCurl(input);
      const headers = Object.fromEntries(parsed.headers);
      return `fetch("${parsed.url}", {\n  method: "${parsed.method}",\n  headers: ${JSON.stringify(headers, null, 2)},${parsed.body ? `\n  body: ${JSON.stringify(parsed.body)},` : ""}\n});`;
    }
    case "curlToAxios": {
      const parsed = parseCurl(input);
      return `axios({\n  url: "${parsed.url}",\n  method: "${parsed.method.toLowerCase()}",\n  headers: ${JSON.stringify(Object.fromEntries(parsed.headers), null, 2)},${parsed.body ? `\n  data: ${JSON.stringify(parsed.body)},` : ""}\n});`;
    }
    case "curlToPython": {
      const parsed = parseCurl(input);
      return `import requests\n\nresponse = requests.request(\n    "${parsed.method}",\n    "${parsed.url}",\n    headers=${JSON.stringify(Object.fromEntries(parsed.headers), null, 2)},${parsed.body ? `\n    data=${JSON.stringify(parsed.body)},` : ""}\n)\nprint(response.text)`;
    }
    case "htaccessToNginx":
      return simpleNginxRewrite(input);
    default:
      return secret ? `${secret}\n${input}` : input;
  }
}

function ToolShell({ definition, children }) {
  const Icon = definition.icon || Sparkles;
  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 lg:px-6">
      <section className="rounded-[8px] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-(--muted) text-(--primary)">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <div className="mb-2 inline-flex rounded-[6px] border border-(--border) bg-(--background) px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-(--muted-foreground)">
                {definition.badge}
              </div>
              <h1 className="text-2xl font-semibold tracking-normal text-(--foreground) sm:text-3xl">
                {definition.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-(--muted-foreground)">
                {definition.description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-(--muted-foreground)">
            {["Runs locally", "No upload", "Copy or download"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1 rounded-[7px] border border-(--border) bg-(--background) px-2.5 py-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-(--primary)" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
      {children}
    </main>
  );
}

function ActionButton({ active, children, ...props }) {
  return (
    <button
      type="button"
      className={`rounded-[7px] px-3 py-2 text-sm font-semibold transition ${
        active
          ? "bg-(--primary) text-(--primary-foreground)"
          : "border border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)"
      }`}
      {...props}
    >
      {children}
    </button>
  );
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value || "");
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="inline-flex items-center gap-2 rounded-[7px] border border-(--border) bg-(--background) px-3 py-2 text-sm font-semibold text-(--foreground) hover:border-(--primary)"
    >
      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ShareLinkButton({ slug, state }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      data-testid="share-tool-state"
      aria-label="Copy shareable tool state link"
      onClick={async () => {
        const url = buildSharedToolUrl(slug, state);
        window.history.replaceState(null, "", url);
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          // The URL is still placed in the address bar when clipboard access is unavailable.
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="inline-flex items-center gap-1.5 rounded-[7px] border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs font-semibold text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
    >
      {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}

function TextTool({ definition, slug }) {
  const sharedState = useMemo(() => readSharedToolState(slug), [slug]);
  const [input, setInput] = useState(() => sharedString(sharedState, "input", definition.sample || ""));
  const [action, setAction] = useState(() => sharedAction(sharedState, definition.actions, definition.actions[0]));
  const examples = getExamples(slug, definition);
  const result = useMemo(() => {
    try {
      return { output: outputForAction(action, input), error: "" };
    } catch (err) {
      return { output: "", error: err.message || "Unable to process input." };
    }
  }, [action, input]);

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <WorkspaceInput
        value={input}
        onChange={setInput}
        actions={definition.actions}
        active={action}
        onAction={setAction}
        examples={examples}
        share={<ShareLinkButton slug={slug} state={{ input, action }} />}
        onExample={(example) => {
          setInput(example.value);
          if (example.action) setAction(example.action);
        }}
      />
      <WorkspaceOutput value={result.output} error={result.error} />
    </div>
  );
}

function CryptoTool({ definition, slug }) {
  const sharedState = useMemo(() => readSharedToolState(slug), [slug]);
  const [input, setInput] = useState(() => sharedString(sharedState, "input", definition.sample || ""));
  const [secret, setSecret] = useState("altftool-secret");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const examples = getExamples(slug, definition);

  async function run(action) {
    setError("");
    try {
      if (action === "sha256") setOutput(await sha(input, "SHA-256"));
      if (action === "sha512") setOutput(await sha(input, "SHA-512"));
      if (action === "aesEncrypt") {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveKey(secret, salt);
        const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(input)));
        setOutput(JSON.stringify({
          v: 1,
          salt: bytesToBase64(salt),
          iv: bytesToBase64(iv),
          data: bytesToBase64(cipher),
        }));
      }
      if (action === "aesDecrypt") {
        const payload = JSON.parse(input);
        const salt = base64ToBytes(payload.salt);
        const iv = base64ToBytes(payload.iv);
        const key = await deriveKey(secret, salt);
        const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, base64ToBytes(payload.data));
        setOutput(decoder.decode(plain));
      }
    } catch (err) {
      setError(err.message || "Crypto operation failed.");
      setOutput("");
    }
  }

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <section className="rounded-[8px] border border-(--border) bg-(--card) p-4">
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Input</label>
          <ShareLinkButton slug={slug} state={{ input }} />
        </div>
        {examples.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => setInput(example.value)}
                className="rounded-[7px] border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs font-semibold text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
              >
                {example.label}
              </button>
            ))}
          </div>
        )}
        <textarea data-testid="tool-input" value={input} onChange={(e) => setInput(e.target.value)} className="mt-3 min-h-[300px] w-full rounded-[8px] border border-(--border) bg-(--background) p-3 font-mono text-sm outline-none focus:border-(--primary)" />
        <input value={secret} onChange={(e) => setSecret(e.target.value)} className="mt-3 w-full rounded-[8px] border border-(--border) bg-(--background) px-3 py-2 text-sm outline-none focus:border-(--primary)" placeholder="Passphrase for AES" />
        <div className="mt-3 flex flex-wrap gap-2">
          {definition.actions.map((item) => <ActionButton key={item} onClick={() => run(item)}>{actionLabels[item]}</ActionButton>)}
        </div>
      </section>
      <WorkspaceOutput value={output} error={error} />
    </div>
  );
}

function WorkspaceInput({ value, onChange, actions, active, onAction, examples = [], onExample, share }) {
  return (
    <section className="rounded-[8px] border border-(--border) bg-(--card) p-4">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Input</label>
        <div className="flex items-center gap-2">
          {share}
          <button type="button" onClick={() => onChange("")} className="text-xs font-semibold text-(--muted-foreground) hover:text-(--foreground)">
            Clear
          </button>
        </div>
      </div>
      {examples.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => onExample?.(example)}
              className="rounded-[7px] border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs font-semibold text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
            >
              {example.label}
            </button>
          ))}
        </div>
      )}
      <textarea
        data-testid="tool-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="mt-3 min-h-[320px] w-full rounded-[8px] border border-(--border) bg-(--background) p-3 font-mono text-sm leading-6 text-(--foreground) outline-none focus:border-(--primary)"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {actions.map((item) => (
          <ActionButton key={item} active={item === active} onClick={() => onAction(item)}>
            {actionLabels[item] || item}
          </ActionButton>
        ))}
      </div>
    </section>
  );
}

function WorkspaceOutput({ value, error }) {
  return (
    <section className="rounded-[8px] border border-(--border) bg-(--card) p-4">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Output</label>
        <CopyButton value={value} />
      </div>
      <pre data-testid="tool-output" className="mt-3 min-h-[320px] overflow-auto rounded-[8px] border border-(--border) bg-(--background) p-3 text-sm leading-6 text-(--foreground)">
        {error ? `Error: ${error}` : value}
      </pre>
    </section>
  );
}

function FileToBase64Tool({ definition }) {
  const [result, setResult] = useState("");
  const [fileName, setFileName] = useState("");

  function handleFile(file) {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setResult(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <section className="rounded-[8px] border border-dashed border-(--border) bg-(--card) p-6">
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[8px] bg-(--background) p-6 text-center">
          <Upload className="h-9 w-9 text-(--primary)" />
          <h2 className="mt-4 text-lg font-semibold text-(--foreground)">Choose a local file</h2>
          <p className="mt-2 max-w-sm text-sm text-(--muted-foreground)">The file stays in your browser and is converted to a Base64 data URL.</p>
          <label className="mt-5 inline-flex cursor-pointer rounded-[7px] bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-foreground)">
            Browse file
            <input data-testid="file-to-base64-input" type="file" accept={definition.accept} className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
          </label>
          {fileName && <p className="mt-3 text-xs text-(--muted-foreground)">{fileName}</p>}
        </div>
      </section>
      <WorkspaceOutput value={result} />
    </div>
  );
}

function Base64ToFileTool({ definition, slug }) {
  const sharedState = useMemo(() => readSharedToolState(slug), [slug]);
  const [input, setInput] = useState(() => sharedString(sharedState, "input", ""));
  const [filename, setFilename] = useState(() => sharedString(sharedState, "filename", definition.defaultName));
  const [mime, setMime] = useState(() => sharedString(sharedState, "mime", definition.defaultMime));
  const [objectUrl, setObjectUrl] = useState("");
  const [error, setError] = useState("");

  function buildFile() {
    try {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      const bytes = base64ToBytes(input);
      const type = input.match(/^data:([^;,]+)/)?.[1] || mime;
      const blob = new Blob([bytes], { type });
      setMime(type);
      setObjectUrl(URL.createObjectURL(blob));
      setError("");
      return blob;
    } catch (err) {
      setObjectUrl("");
      setError(err.message || "Invalid Base64 data.");
      return null;
    }
  }

  function download() {
    const blob = buildFile();
    if (blob) downloadBlob(blob, filename);
  }

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <section className="rounded-[8px] border border-(--border) bg-(--card) p-4">
        <div className="mb-3 flex justify-end">
          <ShareLinkButton slug={slug} state={{ input, filename, mime }} />
        </div>
        <textarea
          data-testid="tool-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste Base64 or a data URL..."
          className="min-h-[280px] w-full rounded-[8px] border border-(--border) bg-(--background) p-3 font-mono text-sm outline-none focus:border-(--primary)"
        />
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input value={filename} onChange={(e) => setFilename(e.target.value)} className="rounded-[8px] border border-(--border) bg-(--background) px-3 py-2 text-sm outline-none focus:border-(--primary)" />
          <input value={mime} onChange={(e) => setMime(e.target.value)} className="rounded-[8px] border border-(--border) bg-(--background) px-3 py-2 text-sm outline-none focus:border-(--primary)" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionButton onClick={buildFile}>Preview</ActionButton>
          <ActionButton onClick={download}>Download</ActionButton>
        </div>
      </section>
      <section data-testid="tool-output" className="rounded-[8px] border border-(--border) bg-(--card) p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Preview</p>
        <p className="mt-2 text-sm text-(--muted-foreground)">
          {error ? "Preview failed." : objectUrl ? `Decoded ${mime} ready as ${filename}.` : "Paste data and click Preview."}
        </p>
        <div className="mt-3 flex min-h-[330px] items-center justify-center rounded-[8px] border border-(--border) bg-(--background) p-3">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!error && !objectUrl && <p className="text-sm text-(--muted-foreground)">Waiting for Base64 input.</p>}
          {objectUrl && definition.preview === "image" && <img src={objectUrl} alt="Decoded preview" className="max-h-[320px] rounded-[7px] object-contain" />}
          {objectUrl && definition.preview === "audio" && <audio controls src={objectUrl} className="w-full" />}
          {objectUrl && definition.preview === "video" && <video controls src={objectUrl} className="max-h-[320px] w-full rounded-[7px]" />}
          {objectUrl && definition.preview === "pdf" && <iframe title="PDF preview" src={objectUrl} className="h-[320px] w-full rounded-[7px]" />}
          {objectUrl && !definition.preview && <p className="text-sm text-(--muted-foreground)">File is ready for download.</p>}
        </div>
      </section>
    </div>
  );
}

function BaseConverterTool({ slug }) {
  const sharedState = useMemo(() => readSharedToolState(slug), [slug]);
  const [value, setValue] = useState(() => sharedString(sharedState, "value", "255"));
  const [from, setFrom] = useState(() => {
    const base = Number(sharedState?.from);
    return [2, 8, 10, 16, 36].includes(base) ? base : 10;
  });
  const presets = [
    { label: "Decimal 255", value: "255", base: 10 },
    { label: "Binary byte", value: "11111111", base: 2 },
    { label: "Hex color", value: "FF5733", base: 16 },
  ];
  const number = parseInt(value || "0", Number(from));
  const output = Number.isFinite(number) ? {
    binary: number.toString(2),
    octal: number.toString(8),
    decimal: number.toString(10),
    hexadecimal: number.toString(16).toUpperCase(),
    base36: number.toString(36).toUpperCase(),
  } : null;

  return (
    <div className="mt-4 rounded-[8px] border border-(--border) bg-(--card) p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setValue(preset.value);
                setFrom(preset.base);
              }}
              className="rounded-[7px] border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs font-semibold text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <ShareLinkButton slug={slug} state={{ value, from }} />
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
        <input data-testid="tool-base-input" value={value} onChange={(e) => setValue(e.target.value)} className="rounded-[8px] border border-(--border) bg-(--background) px-3 py-3 font-mono text-sm outline-none focus:border-(--primary)" />
        <select value={from} onChange={(e) => setFrom(Number(e.target.value))} className="rounded-[8px] border border-(--border) bg-(--background) px-3 py-3 text-sm outline-none focus:border-(--primary)">
          {[2, 8, 10, 16, 36].map((base) => <option key={base} value={base}>Base {base}</option>)}
        </select>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {Object.entries(output || {}).map(([key, item]) => (
          <div key={key} className="rounded-[8px] border border-(--border) bg-(--background) p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">{key}</p>
            <p className="mt-2 break-all font-mono text-sm text-(--foreground)">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ByteConverterTool({ slug }) {
  const sharedState = useMemo(() => readSharedToolState(slug), [slug]);
  const [bytes, setBytes] = useState(() => sharedString(sharedState, "bytes", "1048576"));
  const presets = [
    { label: "1 MiB", value: "1048576" },
    { label: "5 MB", value: "5000000" },
    { label: "1 GB", value: "1000000000" },
  ];
  const value = Number(bytes) || 0;
  const units = {
    bits: value * 8,
    bytes: value,
    KB: value / 1000,
    KiB: value / 1024,
    MB: value / 1000 ** 2,
    MiB: value / 1024 ** 2,
    GB: value / 1000 ** 3,
    GiB: value / 1024 ** 3,
  };

  return (
    <div className="mt-4 rounded-[8px] border border-(--border) bg-(--card) p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setBytes(preset.value)}
              className="rounded-[7px] border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs font-semibold text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <ShareLinkButton slug={slug} state={{ bytes }} />
      </div>
      <input data-testid="tool-bytes-input" value={bytes} onChange={(e) => setBytes(e.target.value)} className="w-full rounded-[8px] border border-(--border) bg-(--background) px-3 py-3 font-mono text-sm outline-none focus:border-(--primary)" />
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(units).map(([key, item]) => (
          <div key={key} className="rounded-[8px] border border-(--border) bg-(--background) p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">{key}</p>
            <p className="mt-2 break-all font-mono text-sm text-(--foreground)">{item.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CronEvaluatorTool({ definition, slug }) {
  const sharedState = useMemo(() => readSharedToolState(slug), [slug]);
  const [expression, setExpression] = useState(() => sharedString(sharedState, "expression", definition.sample));
  const presets = [
    { label: "Every 15 min weekdays", value: "*/15 9-17 * * 1-5" },
    { label: "Daily 9 AM", value: "0 9 * * *" },
    { label: "Monday report", value: "30 8 * * 1" },
  ];
  const result = useMemo(() => {
    try {
      return {
        output: nextCronRuns(expression).map((date) => date.toLocaleString()).join("\n"),
        error: "",
      };
    } catch (err) {
      return { output: "", error: err.message || "Invalid cron expression." };
    }
  }, [expression]);

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[0.45fr_0.55fr]">
      <section className="rounded-[8px] border border-(--border) bg-(--card) p-4">
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Crontab Expression</label>
          <ShareLinkButton slug={slug} state={{ expression }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setExpression(preset.value)}
              className="rounded-[7px] border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs font-semibold text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <input
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          className="mt-3 w-full rounded-[8px] border border-(--border) bg-(--background) px-3 py-3 font-mono text-sm outline-none focus:border-(--primary)"
        />
        <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs text-(--muted-foreground)">
          {["minute", "hour", "day", "month", "weekday"].map((item) => (
            <span key={item} className="rounded-[7px] border border-(--border) bg-(--background) px-2 py-2">
              {item}
            </span>
          ))}
        </div>
      </section>
      <WorkspaceOutput value={result.output} error={result.error} />
    </div>
  );
}

function ScientificNotationTool({ slug }) {
  const sharedState = useMemo(() => readSharedToolState(slug), [slug]);
  const [value, setValue] = useState(() => sharedString(sharedState, "value", "123456789"));
  const presets = [
    { label: "Large number", value: "123456789" },
    { label: "Tiny decimal", value: "0.00000042" },
    { label: "Avogadro", value: "602214076000000000000000" },
  ];
  const number = Number(value);
  const valid = Number.isFinite(number);
  const exponent = valid && number !== 0 ? Math.floor(Math.log10(Math.abs(number))) : 0;
  const engineeringExponent = valid && number !== 0 ? Math.floor(exponent / 3) * 3 : 0;
  const rows = valid
    ? {
        "Scientific notation": number.toExponential(8),
        "Engineering notation": `${(number / 10 ** engineeringExponent).toFixed(6)}e${engineeringExponent}`,
        Decimal: number.toLocaleString(undefined, { maximumFractionDigits: 12 }),
        Exponent: exponent,
      }
    : {};

  return (
    <div className="mt-4 rounded-[8px] border border-(--border) bg-(--card) p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => setValue(preset.value)}
              className="rounded-[7px] border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs font-semibold text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <ShareLinkButton slug={slug} state={{ value }} />
      </div>
      <input
        data-testid="tool-scientific-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-[8px] border border-(--border) bg-(--background) px-3 py-3 font-mono text-sm outline-none focus:border-(--primary)"
      />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {valid ? Object.entries(rows).map(([key, item]) => (
          <div key={key} className="rounded-[8px] border border-(--border) bg-(--background) p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">{key}</p>
            <p className="mt-2 break-all font-mono text-sm text-(--foreground)">{item}</p>
          </div>
        )) : (
          <p className="text-sm text-red-500">Enter a valid number.</p>
        )}
      </div>
    </div>
  );
}

function TextDiffTool({ slug }) {
  const sharedState = useMemo(() => readSharedToolState(slug), [slug]);
  const [left, setLeft] = useState(() => sharedString(sharedState, "left", "AltFTool\nJSON Editor\nBase64 Tools"));
  const [right, setRight] = useState(() => sharedString(sharedState, "right", "AltFTool\nJSON Editor Pro\nBase64 Tools\nYAML Formatter"));
  const presets = [
    {
      label: "Tool list",
      left: "AltFTool\nJSON Editor\nBase64 Tools",
      right: "AltFTool\nJSON Editor Pro\nBase64 Tools\nYAML Formatter",
    },
    {
      label: "Config change",
      left: "cache: false\nregion: us\nretries: 1",
      right: "cache: true\nregion: us\nretries: 3",
    },
  ];
  const diff = useMemo(() => {
    const leftLines = left.split("\n");
    const rightLines = right.split("\n");
    const max = Math.max(leftLines.length, rightLines.length);
    const lines = [];

    for (let i = 0; i < max; i += 1) {
      const before = leftLines[i] ?? "";
      const after = rightLines[i] ?? "";
      if (before === after) {
        lines.push(`  ${before}`);
      } else {
        if (before) lines.push(`- ${before}`);
        if (after) lines.push(`+ ${after}`);
      }
    }

    return lines.join("\n");
  }, [left, right]);

  return (
    <div className="mt-4 grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-(--border) bg-(--card) p-3">
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setLeft(preset.left);
                setRight(preset.right);
              }}
              className="rounded-[7px] border border-(--border) bg-(--background) px-2.5 py-1.5 text-xs font-semibold text-(--muted-foreground) hover:border-(--primary) hover:text-(--foreground)"
            >
              {preset.label}
            </button>
          ))}
        </div>
        <ShareLinkButton slug={slug} state={{ left, right }} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[8px] border border-(--border) bg-(--card) p-4">
          <label className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Original</label>
          <textarea data-testid="tool-diff-left" value={left} onChange={(e) => setLeft(e.target.value)} className="mt-3 min-h-[240px] w-full rounded-[8px] border border-(--border) bg-(--background) p-3 font-mono text-sm outline-none focus:border-(--primary)" />
        </section>
        <section className="rounded-[8px] border border-(--border) bg-(--card) p-4">
          <label className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Changed</label>
          <textarea data-testid="tool-diff-right" value={right} onChange={(e) => setRight(e.target.value)} className="mt-3 min-h-[240px] w-full rounded-[8px] border border-(--border) bg-(--background) p-3 font-mono text-sm outline-none focus:border-(--primary)" />
        </section>
      </div>
      <WorkspaceOutput value={diff} />
    </div>
  );
}

function SvgTool({ definition, slug }) {
  const sharedState = useMemo(() => readSharedToolState(slug), [slug]);
  const [input, setInput] = useState(() => sharedString(sharedState, "input", definition.sample));
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  function render() {
    setError("");
    const img = new Image();
    const blob = new Blob([input], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width || 720;
      canvas.height = img.height || 360;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((png) => {
        if (!png) return;
        const pngUrl = URL.createObjectURL(png);
        setPreview(pngUrl);
      }, "image/png");
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError("Invalid SVG markup.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function download() {
    if (!preview) return;
    fetch(preview).then((res) => res.blob()).then((blob) => downloadBlob(blob, "altftool-svg.png"));
  }

  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      <section className="rounded-[8px] border border-(--border) bg-(--card) p-4">
        <div className="mb-3 flex justify-end">
          <ShareLinkButton slug={slug} state={{ input }} />
        </div>
        <textarea data-testid="tool-input" value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[320px] w-full rounded-[8px] border border-(--border) bg-(--background) p-3 font-mono text-sm outline-none focus:border-(--primary)" />
        <div className="mt-3 flex gap-2">
          <ActionButton onClick={render}>Render PNG</ActionButton>
          <ActionButton onClick={download}>Download PNG</ActionButton>
        </div>
      </section>
      <section data-testid="tool-output" className="rounded-[8px] border border-(--border) bg-(--card) p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Preview</p>
        <p className="mt-2 text-sm text-(--muted-foreground)">
          {error ? "SVG render failed." : preview ? "Rendered PNG ready." : "Click Render PNG."}
        </p>
        <div className="mt-3 flex min-h-[340px] items-center justify-center rounded-[8px] border border-(--border) bg-(--background) p-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!error && preview ? <img src={preview} alt="SVG preview" className="max-h-[320px] rounded-[7px]" /> : <p className="text-sm text-(--muted-foreground)">Click Render PNG.</p>}
        </div>
      </section>
    </div>
  );
}

export default function ToolFkUtilityTool() {
  const pathname = usePathname();
  const slug = getSlugFromPath(pathname);
  const definition = toolDefinitions[slug] || toolDefinitions["text-to-base64"];

  let content = null;
  if (["text", "code"].includes(definition.mode)) content = <TextTool definition={definition} slug={slug} />;
  if (definition.mode === "crypto") content = <CryptoTool definition={definition} slug={slug} />;
  if (definition.mode === "fileToBase64") content = <FileToBase64Tool definition={definition} />;
  if (definition.mode === "base64ToFile") content = <Base64ToFileTool definition={definition} slug={slug} />;
  if (definition.mode === "base") content = <BaseConverterTool slug={slug} />;
  if (definition.mode === "bytes") content = <ByteConverterTool slug={slug} />;
  if (definition.mode === "cron") content = <CronEvaluatorTool definition={definition} slug={slug} />;
  if (definition.mode === "diff") content = <TextDiffTool slug={slug} />;
  if (definition.mode === "scientific") content = <ScientificNotationTool slug={slug} />;
  if (definition.mode === "svg") content = <SvgTool definition={definition} slug={slug} />;

  return (
    <ToolShell definition={definition}>
      {content}
    </ToolShell>
  );
}

export { toolDefinitions };
