const seo = {
  title: "Base64 to ASCII Converter — Decode Base64 Online",
  h1: "Base64 to ASCII Converter",
  metaDescription:
    "Paste Base64 and get readable text instantly. Handles URL-safe, missing padding and line-wrapped MIME input, decoded in your browser — nothing uploaded.",
  intro:
    "The Base64 to ASCII Converter turns a Base64 string back into readable text using the browser's built-in atob() function and a UTF-8 TextDecoder — no library, no server round-trip. It normalises the input before decoding: whitespace and line breaks are stripped, URL-safe characters (- and _) are folded back to + and /, and missing = padding is restored, so soft-wrapped MIME blocks and unpadded URL tokens both work. If the whole input isn't one valid Base64 blob, it automatically retries line by line, so a list of separately encoded strings decodes to one result per line.",
  useCases: [
    "Reading what a Base64 payload from an API response, config file, or JWT segment actually contains",
    "Decoding a Base64 block copied out of an email header or MIME message that has been soft-wrapped across several lines",
    "Decoding a whole column of Base64 values from a log or CSV in one paste, one string per line",
  ],
  benefits: [
    [
      "Decodes as you type",
      "The output updates on every keystroke — the Convert button is only a visual cue that also scrolls the result into view on small screens. There is no request to wait on, because atob() and TextDecoder run locally.",
    ],
    [
      "Forgiving about input format",
      "Standard and URL-safe alphabets, stray newlines and tabs, and missing = padding are all handled automatically. Only a genuinely impossible length (a character count that leaves remainder 1 when divided by 4) or a character outside the Base64 alphabet is rejected, with a message saying which.",
    ],
    [
      "Full UTF-8, not just 7-bit ASCII",
      "Decoded bytes pass through TextDecoder(\"utf-8\"), so accented letters, symbols like π, and emoji come out intact instead of turning into mojibake. Output is shown in a line-numbered terminal you can expand fullscreen.",
    ],
    [
      "Nothing leaves your device",
      "The tool makes no network request at all. Decoding, file reading, copy, and download as decoded-ascii.txt all happen inside the browser tab — no account, no usage cap.",
    ],
  ],
  faqs: [
    [
      "How do I convert Base64 to ASCII text?",
      "Paste the Base64 string into the input box — the decoded text appears in the output panel immediately, with no button press needed. You can also click Paste to pull from your clipboard, or Upload File to load a plain-text .txt file, then copy the result or download it as decoded-ascii.txt.",
    ],
    [
      "Does this decode URL-safe Base64 with - and _?",
      "Yes. Before decoding, every - is converted to + and every _ to /, which is exactly the base64url alphabet used in JWTs and URL query parameters. Unpadded URL-safe tokens decode fine because the missing = padding is added automatically.",
    ],
    [
      "Do I need the = padding at the end of my Base64?",
      "No. If the string length isn't a multiple of 4, the tool appends the right number of = characters for you. The only length it can't fix is one that leaves a remainder of 1 when divided by 4 — that's mathematically impossible Base64, and you'll get \"Incomplete Base64 — the string length is invalid.\"",
    ],
    [
      "Why does it say \"This doesn't look like valid Base64\"?",
      "Because the input contains a character outside the Base64 alphabet (A–Z, a–z, 0–9, +, /, -, _, and trailing =). Common causes are quotation marks copied along with the string, a data: URI prefix such as data:text/plain;base64,, or the dots in a full JWT — remove those and paste just the encoded portion. Spaces, tabs, and newlines are fine; they're stripped automatically.",
    ],
    [
      "Can I decode multiple Base64 strings at once?",
      "Yes — put one per line. The tool first tries the entire input as a single blob, which is what handles MIME and PEM text that's been soft-wrapped across lines. If that fails and the input has multiple lines, it decodes each line as its own Base64 string and joins the results, so a list of separately padded values comes back one decoded result per line.",
    ],
    [
      "Is my Base64 data uploaded to a server?",
      "No. Decoding uses the browser's native atob() and TextDecoder, and uploaded .txt files are read locally with the FileReader API. The tool sends no network request and stores nothing — closing the tab discards everything.",
    ],
    [
      "What's the maximum Base64 string this tool can decode?",
      "10,000 characters. The input box caps at that length and shows a live counter, and uploaded files are trimmed to the same limit. 10,000 Base64 characters is roughly 7,500 bytes of decoded data, since Base64 encodes 3 bytes as 4 characters.",
    ],
    [
      "Can I decode a Base64 image or PDF here?",
      "Not usefully — this tool is for text. It decodes the bytes and then interprets them as UTF-8, so binary formats like PNG or PDF come out as a stream of replacement characters rather than a usable file. Use a Base64-to-file converter for binary data, and this one for text, JSON, JWT segments, and config values.",
    ],
  ],
  steps: [
    "Paste your Base64 into the input box, or click Paste to read the clipboard or Upload File to load a plain-text .txt file (10,000 character limit).",
    "The decoded text appears in the output terminal as you type — whitespace, URL-safe characters, and missing = padding are all handled for you.",
    "Copy the result, download it as decoded-ascii.txt, share it, or open the output fullscreen to read long text with line numbers.",
  ],
};

export default seo;
