const seo = {
  intro:
    "This scanner walks pasted text one codepoint at a time and names every character that is invisible, deceptive, or borrowed from a script it does not belong to. It reports zero-width and formatting characters, control codes, private-use codepoints and unusual whitespace; it tracks whether bidirectional embeddings and isolates are balanced, which is the mechanism behind the Trojan Source attack (CVE-2021-42574); it decodes the hidden ASCII payload carried by U+E0000-block tag characters; and it applies UTS #39 mixed-script detection per word, folding look-alike letters to a Latin skeleton so you can read what a string is pretending to be. Hostnames are converted in both directions with the RFC 3492 Punycode algorithm. Everything runs in the browser and nothing is uploaded.",
  useCases: [
    "Review a pull request that renders innocently but might contain a bidirectional override reordering what the compiler actually reads.",
    "Check a link from an email or chat before clicking: the scanner shows the A-label a browser will resolve and whether the visible name is Latin letters at all.",
    "Work out why a copied password, API key or shell command fails to match — a zero-width space or a non-breaking space is usually the answer, and the cleaned output is copy-ready.",
  ],
  benefits: [
    [
      "Named, not just counted",
      "Each finding gives the real Unicode character name, its codepoint, its category, how many times it appears and the line and column of the first one.",
    ],
    [
      "Punycode both ways, computed here",
      "Bootstring encode and decode are implemented in full, so an xn-- label is shown as it renders and a Unicode hostname is shown as it goes on the wire — matched against the RFC 3492 test vectors.",
    ],
    [
      "Mixed-script checked per label",
      "Every internationalised domain ends in an ASCII TLD, so a naive whole-name check flags all of them. Scripts are compared within each label, and a label written entirely in one non-Latin script that still reads as Latin is called out separately as a whole-script confusable.",
    ],
  ],
  faqs: [
    [
      "What is the Trojan Source attack and how does this detect it?",
      "Trojan Source (CVE-2021-42574) uses bidirectional control characters to make source code display in an order different from the order a compiler parses. The tell is not just the presence of those characters but the balance: an embedding opened with U+202A or U+202B, or an override opened with U+202D or U+202E, must be closed by U+202C, and an isolate opened with U+2066 to U+2068 must be closed by U+2069. This page tracks the stack across the whole text and reports any control that is never terminated, along with any stray terminator.",
    ],
    [
      "What are Unicode tag characters and why would text contain them?",
      "The block from U+E0000 to U+E007F was intended for language tagging and is now deprecated. Codepoints U+E0020 to U+E007E map one-for-one onto printable ASCII and render as absolutely nothing in every normal font, which makes them a clean channel for text a human never sees — watermarks, tracking markers, or instructions aimed at a system that reads the string. The scanner decodes any such run back to the ASCII it spells and shows it.",
    ],
    [
      "How does a homograph domain work, and what does the skeleton show me?",
      "Cyrillic а (U+0430) and Latin a (U+0061) render identically in almost every typeface but are different characters, so the two spellings of apple.com are different domains. Registrars mostly block labels that mix scripts, which is why the dangerous case is the whole-script confusable: a label written entirely in Cyrillic that still reads as English. The skeleton column shows the Latin string a label imitates once every look-alike is folded, and the A-label column shows the xn-- form that actually gets resolved.",
    ],
    [
      "Is a clean result a guarantee that the text is safe?",
      "No. This checks characters, not meaning. It cannot tell you that a domain is fraudulent, that an attachment is malicious, or that a message is a scam written entirely in ordinary ASCII — most phishing is. The confusable table is also the widely abused Latin subset of the Unicode confusables data rather than the whole file, so an unusual look-alike may not be named, though its script will still be reported.",
    ],
  ],
};

export default seo;
