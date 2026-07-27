const seo = {
  intro:
    "The Subtitle UTF8 BOM Fixer adds or removes the three-byte UTF-8 byte order mark (EF BB BF, code point U+FEFF) at the start of an SRT, WebVTT or SBV file, and reports what else is wrong with the file's encoding. It detects the subtitle format from its timing lines, counts cues, flags mixed CRLF and LF line endings, finds stray U+FEFF characters buried inside cue text, and recognises mojibake left behind when UTF-8 bytes were read as Windows-1252. Everything runs locally in the browser, so the file never leaves the machine.",
  useCases: [
    "Strip the BOM from an SRT whose first subtitle disappears because a strict parser reads the mark as part of cue number 1.",
    "Add the BOM to an SRT with accented characters that a set-top box or older desktop player renders as garbled letters.",
    "Normalise a subtitle file to CRLF before handing it to a broadcast workflow that splits cue blocks on carriage returns.",
    "Confirm a .vtt file starts with the WEBVTT signature before wiring it into an HTML5 track element.",
  ],
  benefits: [
    ["Byte-accurate", "Reports the exact UTF-8 byte size before and after, so you can see the three bytes the BOM costs."],
    ["Finds hidden marks", "Catches U+FEFF characters sitting inside cue text, not just the one at the start of the file."],
    ["Runs offline", "The file is read and rewritten in the browser; no upload, no server copy of client content."],
  ],
  faqs: [
    [
      "What is a UTF-8 BOM and how many bytes does it add?",
      "It is the three bytes EF BB BF at the start of a file, the UTF-8 encoding of code point U+FEFF. It adds exactly three bytes and carries no text content; its only job is to signal that the file is UTF-8.",
    ],
    [
      "Should an SRT file have a BOM or not?",
      "It depends on the player. SRT has no formal encoding specification, so some hardware players and older desktop apps treat a missing BOM as permission to fall back to a legacy code page and mangle accented characters. Other parsers read the BOM as part of the first cue number and drop subtitle 1. Test the target player: add the BOM if accents break, strip it if the first line vanishes.",
    ],
    [
      "Does a WebVTT file need a BOM?",
      "No. The WebVTT specification requires the file to be UTF-8 and allows an optional BOM before the WEBVTT signature, so the mark is redundant. What is mandatory is that the file begins with the literal string WEBVTT, otherwise browsers reject the text track.",
    ],
    [
      "Why do my subtitles show characters like A-tilde and Euro signs?",
      "That is mojibake: UTF-8 bytes decoded with a single-byte code page such as Windows-1252. The sequence C3 A9 for e-acute shows as two characters, and a UTF-8 BOM shows as the trio U+00EF U+00BB U+00BF. The fix is to re-open or re-export the original file as UTF-8, not to search and replace the broken characters.",
    ],
  ],
};

export default seo;
