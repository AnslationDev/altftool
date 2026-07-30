const seo = {
  title: "MP4 to Base64 — Free Video to Base64 Converter",
  h1: "MP4 to Base64 — Video to Base64 Converter",
  metaDescription:
    "Convert MP4, WebM, MOV or OGV to a Base64 data URL in your browser — nothing uploaded, with the exact output size shown before you convert.",
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
    [
      "Can I convert video formats other than MP4?",
      "Yes — four containers are accepted: MP4 (including .m4v), WebM, QuickTime .mov and Ogg .ogv. The MIME type of whichever file you pick is written into the data URL prefix, so a WebM comes back as data:video/webm;base64, and still plays in the built-in preview.",
    ],
    [
      "Is my video uploaded anywhere?",
      "No. The file is read straight from your device with the browser's own file API and encoded in the page, so the bytes never leave your machine — there is no server, no account and no upload step, which is the point of doing it in the browser.",
    ],
    [
      "How do I get the converted string out?",
      "Copy data URL puts the whole string on your clipboard, and Download .txt saves it next to your file name as <name>.base64.txt. The panel only prints the first 400 characters on screen, because rendering several million characters would lock up the tab.",
    ],
    [
      "How do I check the Base64 actually decodes?",
      "The tool feeds the generated data URL straight back into a video element below the result, so if the preview plays, the string is valid and complete. If it does not play, the browser cannot decode that codec, which is a codec problem rather than a Base64 one.",
    ],
  ],
  steps: [
    "Pick a local MP4, WebM, MOV or OGV file — anything up to 25 MiB, which is the ceiling because the Base64 text is a third larger again and has to fit in memory.",
    "Check the size figures before converting: the tool reports the source bytes and the exact character count the Base64 output will have.",
    "Convert, confirm the clip plays in the preview underneath, then use Copy data URL or Download .txt to take the string away.",
  ],
};

export default seo;
