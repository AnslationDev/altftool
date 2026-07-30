const seo = {
  intro:
    "The File Encoding Conversion Tool reads a text file's raw bytes, detects its character encoding from the byte-order mark or byte patterns, and re-encodes it to UTF-8, UTF-8 with BOM, UTF-16 LE or BE, ASCII, Windows-1252 or ISO-8859-1. It decodes in strict mode first, so a file that is not actually valid in the chosen source encoding is reported rather than silently filled with replacement characters, and it can repair classic mojibake — text where UTF-8 bytes were read as Latin-1, producing sequences like Ã© and â€™. It is for developers, data engineers and anyone who has opened a CSV or log and found the accents turned into gibberish.",
  useCases: [
    "A CSV exported from an old Windows system opens with names like \"Müller\" showing as \"MÃ¼ller\", so you load it, apply the mojibake repair, and save a clean UTF-8 copy your import script accepts.",
    "A build script rejects a source file because it starts with a byte-order mark, so you convert from UTF-8 with BOM to plain UTF-8 and confirm from the byte count that exactly three bytes came off the front.",
    "You receive a Japanese subtitle or log file in Shift_JIS and need it as UTF-16 LE for a legacy Windows application, so you decode from Shift_JIS and re-encode to the target with a preview before downloading.",
  ],
  benefits: [
    ["Detection with a confidence score", "The detector checks for a BOM first, then tests ASCII, UTF-8 validity, UTF-16 patterns and single-byte Latin heuristics, and tells you how confident it is rather than just guessing silently."],
    ["Strict decode with honest warnings", "Decoding runs in fatal mode, so an invalid source encoding raises an error, and any replacement characters in the result are counted and reported before you download."],
    ["Flags lossy targets before you save", "If the text contains characters the chosen target cannot represent — anything non-Latin heading to ASCII or Windows-1252, for example — the conversion is blocked or warned about instead of quietly dropping them."],
  ],
  faqs: [
    [
      "How do I fix mojibake like Ã© or â€™ in a text file?",
      "Turn on the mojibake repair: it takes each character's code point back to a single byte and re-decodes the sequence as UTF-8, which undoes the classic case of UTF-8 bytes having been read as Latin-1. It only applies when every character is below U+0100, so genuinely multilingual text is left alone.",
    ],
    [
      "Which encodings can it read and write?",
      "It reads UTF-8, UTF-8 with BOM, UTF-16 LE and BE, GB18030, Big5, Shift_JIS, EUC-KR, ASCII, Windows-1252 and ISO-8859-1, or auto-detects. It writes UTF-8, UTF-8 with BOM, UTF-16 LE, UTF-16 BE, ASCII, Windows-1252 and ISO-8859-1.",
    ],
    [
      "Should I use UTF-8 with or without a BOM?",
      "Without, in almost every case. The three-byte BOM (EF BB BF) is unnecessary for UTF-8 and breaks shell scripts, JSON parsers and CSV importers that expect the first character to be data; add it only when a specific Windows application or Excel workflow requires it to recognise the file as Unicode.",
    ],
    [
      "Why does the converted preview look shorter than the file?",
      "Previews are capped at 9,000 characters for responsiveness — the conversion and the download still cover the whole file. The byte and character counts shown beside the preview are calculated over the entire input and output, so use those to confirm nothing was lost.",
    ],
  ],
};

export default seo;
