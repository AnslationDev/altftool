const seo = {
  title: "Audio to Base64 Data URL Converter (MP3, WAV, OGG)",
  metaDescription:
    "Encode MP3, WAV, OGG or M4A files up to 50 MB into a Base64 data URL in your browser, with exact size arithmetic and a flag past the 100 KB inline limit.",
  intro:
    "This converter turns an audio file into a Base64 data URL — the data:audio/mpeg;base64,… string you can paste directly into HTML, CSS or JavaScript instead of shipping a separate file. Encoding follows RFC 4648, which packs every 3 bytes into 4 characters, so the output is always 33% larger than the original. It is aimed at developers inlining short UI sounds, and at anyone who needs an audio clip embedded in a single self-contained file.",
  useCases: [
    "Inline a 12 KB notification chime in a JavaScript bundle so it plays with no second network request.",
    "Embed a short pronunciation clip inside a single self-contained HTML page for offline use.",
    "Check what a 480 KB MP3 would actually cost as a data URL before deciding to inline it.",
  ],
  benefits: [
    ["Never leaves your device", "The file is read and encoded in the browser; nothing is uploaded to a server."],
    ["Exact size arithmetic", "Reports Base64 length as 4 × ceil(bytes ÷ 3), the padding characters, and the full data URL length."],
    ["Tells you when not to inline", "Flags anything over 100 KB, where a normal file URL beats a data URL on caching and seeking."],
  ],
  faqs: [
    [
      "How much bigger does Base64 make an audio file?",
      "Exactly 33% bigger, plus up to 2 padding characters. Base64 encodes every 3 bytes as 4 characters, so a 480 KB MP3 becomes 640 KB of text — 4 × ceil(480000 ÷ 3) = 640,000 characters, plus about 23 characters for the data: prefix.",
    ],
    [
      "When should I inline audio as a data URL?",
      "Only for short clips, roughly under 100 KB — UI chimes, click sounds, alert tones. Above that a data URL costs more than it saves: the bytes live inside your HTML, CSS or JS, so the browser cannot cache them separately, cannot range-request them for seeking, and must parse them before the page can finish loading.",
    ],
    [
      "What does the data:audio/mpeg;base64 prefix mean?",
      "It is the data URL syntax from RFC 2397: 'data:' then the MIME type, then ';base64' to say the payload is Base64 rather than percent-encoded, then a comma and the payload. Use audio/mpeg for MP3, audio/wav for WAV, audio/ogg for OGG and Opus, and audio/mp4 for M4A.",
    ],
    [
      "Can I convert a Base64 string back into an audio file?",
      "Yes. Paste the data URL into the inspector on this page and it reports the declared MIME type and the exact decoded size in bytes; the audio player above plays the same string directly, which is the quickest way to confirm a payload is intact.",
    ],
  ],
};

export default seo;
