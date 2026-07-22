// Emoji ranges (pictographs, symbols, enclosed marks, variation selectors, ZWJ).
const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{24C2}\u{2122}\u{2139}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}]/gu;

export function stripEmojis(str = "") {
  return String(str).replace(EMOJI_RE, "").replace(/\s+/g, " ").trim();
}

// Strip Markdown syntax + emojis down to clean plain text (card blurbs, intros).
export function stripMarkdown(md = "") {
  const text = String(md)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links -> text
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/^\s*[-*+]\s+/gm, "") // list bullets
    .replace(/^\s*>\s?/gm, ""); // blockquotes
  return stripEmojis(text);
}

// Heading that starts an author promo / contact block — everything from it to the
// end of the description is dropped.
const CONTACT_CUT =
  /\n#{1,6}\s*[^\n]*\b(who\s*am\s*i|who\s*i\s*am|about\s*(me|the\s*author|us)|contact|get\s*in\s*touch|reach\s*(out|me)|hire\s*me|work\s*with\s*me|book\s*a\s*call|let'?s\s*connect|connect\s*with\s*me|follow\s*me|find\s*me|my\s*(links|services|socials?)|social\s*links?|need\s*help|questions?|support\s*me)\b[^\n]*\n[\s\S]*$/i;

// Clean a workflow description for display: drop emojis, the author contact/promo
// block, and any stray emails or social/contact links — while keeping Markdown.
export function cleanDescription(md = "") {
  let text = String(md).replace(EMOJI_RE, "");
  text = text.replace(CONTACT_CUT, "\n");
  text = text.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, ""); // emails
  text = text.replace(
    /https?:\/\/(www\.)?(linkedin\.com|twitter\.com|x\.com|calendly\.com|cal\.com|wa\.me|t\.me|telegram\.me|instagram\.com|facebook\.com|discord\.(gg|com)|threads\.net|tiktok\.com|patreon\.com|buymeacoffee\.com|ko-fi\.com|youtube\.com\/@|youtu\.be)\/\S*/gi,
    ""
  ); // social / contact links
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

export function shortIntro(md = "", max = 180) {
  const text = stripMarkdown(cleanDescription(md));
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
