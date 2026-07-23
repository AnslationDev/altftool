// Decides whether a tool CAN be built as a pure browser compute tool.
// The generator only produces client-side compute() logic (+ optional text/file
// input), so tools that fundamentally need a server, a real AI model, heavy
// media/canvas libraries, or live network access are NOT buildable here and must
// be skipped rather than faked.
//
// classify(entry) -> { ok: boolean, kind: "compute"|"unsupported", reason }
//
// IMPORTANT: patterns are word-boundary anchored. A previous version used loose
// substrings (e.g. "e-?sign" matched "de[sign]", "ai" matched inside words),
// which wrongly rejected legit tools. Keep every token anchored.

// Each phrase is matched as a whole word/phrase (\b … \b). Multi-word phrases
// match across a single space.
function phraseRe(phrases) {
  const body = phrases.map((p) => p.replace(/\s+/g, "\\s+")).join("|");
  return new RegExp(`(?:^|[^a-z])(?:${body})(?:[^a-z]|$)`, "i");
}

const RULES = [
  {
    reason: "needs an AI model / API",
    re: phraseRe([
      "ai", "gpt", "chatgpt", "deepseek", "llm", "chatbot",
      "ai writer", "ai write", "essay writer", "article writer", "paragraph writer",
      "content writer", "story generator", "content improver", "paragraph completer",
      "paraphraser", "paraphrasing", "rewriter", "rewrite", "humanizer", "humanize",
      "grammar checker", "grammar fixer", "grammar correction", "summarizer",
      "summarize", "translator", "translate", "transcribe", "transcription",
      "caption generator", "voice over", "sentiment analysis",
      "image generator", "art generator", "logo generator", "text to image",
      "text to speech", "speech to text", "face detect", "object detect",
      "image detector", "fake image detector", "look alike", "face match",
    ]),
  },
  {
    reason: "needs audio/video processing",
    re: phraseRe([
      "audio", "video", "mp3", "mp4", "m4a", "wav", "mov", "mkv", "webm", "flac", "aac",
      "speech", "podcast", "screen recorder", "voice recorder", "audio recorder",
      "audio trimmer", "video trimmer", "audio speed changer", "video compressor",
      "audio to text", "video to gif", "gif to video", "subtitle", "karaoke",
      "compress video", "trim video", "convert video", "resize video", "mute video",
    ]),
  },
  {
    reason: "needs image editing (canvas/libs)",
    re: phraseRe([
      "remove background", "change background", "background remover", "background changer",
      "upscale", "upscaler", "colorize", "restore photo", "deblur", "unblur", "deepfake",
      "face swap", "cartoonize", "passport photo", "photo filter", "photo editor",
      "photo enhancer", "image resizer", "resize image", "crop image", "image cropper",
      "compress image", "image compressor", "rotate image", "flip image", "image filter",
      "add watermark", "remove watermark", "image collage", "collage maker", "meme generator",
      "profile picture", "circle crop", "png to jpg", "jpg to png", "jpg to webp",
      "png to webp", "webp to png", "webp to jpg", "heic to jpg", "old photo restorer",
      "favicon generator", "icon generator", "apple touch icon", "images swap", "image swap",
      "photo to sketch", "cartoon yourself", "pixar style", "avatar generator",
    ]),
  },
  {
    reason: "needs document processing (PDF/office libs)",
    re: phraseRe([
      "pdf", "word to pdf", "pdf to word", "excel to pdf", "pdf to excel",
      "epub", "docx", "pptx", "ocr", "scan document", "e-signature", "esignature",
      "merge pdf", "split pdf", "compress pdf", "pdf editor", "word to image",
    ]),
  },
  {
    reason: "needs live network access",
    re: phraseRe([
      "whois", "dns lookup", "dns record", "ssl checker", "ssl certificate",
      "pagespeed", "page speed", "domain checker", "domain age", "ip lookup",
      "ip address checker", "ip geolocation", "link preview", "redirect checker",
      "redirect chain", "canonical tag checker", "sitemap checker", "sitemap validator",
      "robots txt tester", "seo audit", "website speed", "backlink", "url status",
      "url shortener", "broken link", "ping test", "port scanner", "http header checker",
      "uptime", "traceroute", "reverse ip", "safe browsing", "meta tag checker",
      "web scraper", "email validator", "spam checker",
    ]),
  },
  {
    reason: "needs live external data (API/feed)",
    re: phraseRe([
      "live score", "live price", "real time", "stock price", "stock quote",
      "crypto price", "exchange rate", "currency converter", "news feed",
      "flight status", "flight tracker", "flight radar", "weather forecast",
      "weather checker", "google trends", "youtube downloader", "youtube analyzer",
      "instagram downloader", "tiktok downloader", "gold price", "metal price",
    ]),
  },
  {
    reason: "needs a native crypto/hashing library",
    re: phraseRe(["bcrypt", "argon2", "scrypt", "pbkdf2 hash"]),
  },
  {
    reason: "needs an interactive game/UI component (not a compute tool)",
    re: phraseRe([
      "connect four", "2048", "chess", "sudoku", "tic tac toe", "tic-tac-toe", "minesweeper",
      "tetris", "snake game", "candy crush", "ludo", "bingo", "hangman", "whack a mole",
      "simon says", "memory card game", "word scramble", "word search", "crossword",
      "multiplayer", "typing master", "typing test", "typing speed", "reaction time",
      "aim trainer", "whack-a-mole", "number guessing game", "rock paper scissors",
    ]),
  },
];

export function classify(entry) {
  const name = String(entry.name || entry.slug || "").replace(/-/g, " ");
  const cats = Array.isArray(entry.category) ? entry.category.join(" ") : entry.category || "";
  const hay = `${name} ${cats}`.toLowerCase();
  for (const { re, reason } of RULES) {
    if (re.test(hay)) return { ok: false, kind: "unsupported", reason };
  }
  return { ok: true, kind: "compute", reason: "pure browser logic" };
}

export function isBuildable(entry) {
  return classify(entry).ok;
}
