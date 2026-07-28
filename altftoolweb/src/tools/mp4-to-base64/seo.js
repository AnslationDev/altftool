const seo = {
  title: "MP4 to Base64 Converter — Free, Runs in Your Browser",
  metaDescription:
    "Convert MP4, WebM, MOV, or OGV to a Base64 data URL entirely in your browser — nothing uploaded. Free, with an exact output-size preview.",
  intro:
    "This converter turns a local video file into a Base64 data URL — the data:video/mp4;base64,… string defined by RFC 2397, with the payload encoded per RFC 4648. Because Base64 writes every three bytes as four characters, the output is always exactly one third larger than the source file. It is built for developers who need to inline a short clip in HTML, CSS, JSON or a test fixture without hosting it.",
  useCases: [
    "Inline a two-second loop in a single self-contained HTML file that has to work with no network.",
    "Paste a small clip into a JSON API request body or a database seed script that only accepts text.",
    "Embed a test video inside an automated test fixture so the suite has no external asset dependency.",
  ],
  benefits: [
    ["Nothing is uploaded", "The file is read and encoded in your browser; no bytes are sent to a server."],
    ["Exact output size up front", "Shows the character count and padding before you convert, using ceil(bytes ÷ 3) × 4."],
    ["Playback check built in", "The generated data URL is fed straight back into a video element so you can confirm it decodes."],
  ],
  faqs: [
    [
      "How much bigger does Base64 make a video file?",
      "Exactly 33.3% bigger, because three bytes become four characters. A 5 MiB MP4 produces 6,990,508 Base64 characters, plus the 22-character data:video/mp4;base64, prefix.",
    ],
    [
      "What is the maximum file size I can convert here?",
      "25 MiB. The original bytes and the ~34 MB text output both have to sit in memory at once, and a JavaScript string is capped near 512 MiB in V8, so larger files risk crashing the tab.",
    ],
    [
      "Should I use a Base64 data URL for video on a real website?",
      "Only for very small clips. Inlined video cannot be range-requested, streamed or cached separately, and it inflates the HTML or CSS file by a third. Serve anything longer than a couple of seconds as a normal file over HTTP.",
    ],
    [
      "Why does the output end in one or two equals signs?",
      "That is RFC 4648 padding. When the file length is not a multiple of three, the last group is short and is padded with one '=' (length ≡ 2 mod 3) or two '=' (length ≡ 1 mod 3) so the output stays a multiple of four characters.",
    ],
  ],
};

export default seo;
