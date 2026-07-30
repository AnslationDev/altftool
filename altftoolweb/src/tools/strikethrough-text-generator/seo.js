const seo = {
  intro:
    "The Strikethrough Text Generator adds U+0336, the Unicode combining long stroke overlay, after every character you type, producing c̶r̶o̶s̶s̶e̶d̶-̶o̶u̶t̶ ̶t̶e̶x̶t̶ that survives copy and paste into places with no formatting toolbar. Because the line is part of the characters themselves rather than HTML or markdown, it works in social bios, usernames, chat messages and comment boxes that strip styling. It is for anyone who wants a struck-through price, a crossed-out joke or a deliberately edited-looking line where the platform gives them no way to format text.",
  useCases: [
    "You are writing a social bio and want the old job title crossed out next to the new one, but the bio field accepts plain text only.",
    "You are posting a price change and want the original figure struck through in a comment box that has no formatting buttons.",
    "You want the crossed-out-then-corrected joke — writing one word, striking it, following with the real one — in a chat app that does not support markdown.",
  ],
  benefits: [
    ["Formatting that travels with the text", "The stroke is a combining character inside the string, so it survives copy and paste into fields that discard every kind of markup."],
    ["Every character, including punctuation and spaces", "The overlay is applied across the whole input rather than to letters only, so the line runs unbroken instead of stopping at each space."],
    ["Live output as you type", "The struck version updates with each keystroke, so you can see exactly how it will render before you paste it somewhere public."],
  ],
  faqs: [
    [
      "How does strikethrough text work without HTML?",
      "It uses a Unicode combining character — U+0336, the combining long stroke overlay — placed after each character so the font draws a line through it. The result is ordinary text data, which is why it pastes intact into fields that strip HTML and markdown.",
    ],
    [
      "Will it count against a character limit?",
      "Yes, and roughly double. Each visible character becomes two code points — the letter plus the combining stroke — so a 20-character phrase consumes about 40 characters of a bio or post limit. Keep struck text short in fields with tight caps.",
    ],
    [
      "Does strikethrough text work everywhere?",
      "In most modern apps and browsers, but rendering depends on the font. A few older systems and unusual fonts draw the overlay slightly offset or not at all, and some screen readers announce the combining marks awkwardly, so avoid it for information a reader must not miss.",
    ],
    [
      "Is this the same as the strikethrough button in a text editor?",
      "No. An editor applies a formatting attribute to unchanged text, which the software can strip or search around; this changes the characters themselves. That is what makes it work in plain-text fields, but it also means search and copy-paste treat the result as different characters from the original word.",
    ],
  ],
};

export default seo;
