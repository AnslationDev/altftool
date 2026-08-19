const seo = {
  title: "Fancy Text Generator: Bold, Script & Bubble",
  metaDescription:
    "Type once and get six Unicode variants — bold, italic, script, monospace, wide and bubble — as real characters that paste into bios, usernames and posts.",
  intro:
    "The Fancy Text Generator rewrites whatever you type into six styled variants at once — bold, italic, script, monospace, wide-spaced and bubble — by substituting each A–Z letter with its counterpart in Unicode's Mathematical Alphanumeric Symbols block, so the result is real text rather than an image or a font. Every variant updates as you type and each has its own copy button. It is for people writing social bios, usernames, video titles and post headings in apps that strip normal formatting.",
  useCases: [
    "Your Instagram bio has no bold option and you want the first line to stand out, so you paste it in, copy the bold variant, and drop the styled characters straight into the bio field.",
    "You are naming a Discord or gaming profile and want it visually distinct from a hundred plain-text names, so you compare script and monospace side by side before picking one.",
    "A LinkedIn post needs a section heading that survives the platform's plain-text editor, so you use the bold or wide variant instead of markdown, which the editor would show literally.",
  ],
  benefits: [
    ["Six variants generated at once", "You see bold, italic, script, monospace, wide and bubble for the same input simultaneously instead of switching styles one at a time."],
    ["Real characters, not a font", "Because the output is genuine Unicode code points, the styling travels with the text into any app that accepts pasting — no font file has to be installed at the other end."],
    ["Live rendering as you type", "The preview recomputes on every keystroke, so you can see how a long username or a full bio line wraps before committing to it."],
  ],
  faqs: [
    [
      "How does fancy text work if the app has no bold button?",
      "It swaps each letter for a different Unicode character that happens to look bold, italic or script — Unicode's Mathematical Alphanumeric Symbols block contains full styled A–Z sets. The app never applies formatting; it just displays the characters you pasted.",
    ],
    [
      "Which styles does this tool produce?",
      "Six: bold, italic, script, monospace, wide (a normal space inserted between every character) and bubble (each letter followed by the combining enclosing circle, U+20DD). All six render from the same input at the same time.",
    ],
    [
      "Will fancy text hurt accessibility or search?",
      "Yes, it can. Screen readers announce mathematical bold and script characters unpredictably or letter by letter, and search does not always match them to the plain spelling, so keep styled text to short decorative lines and leave your name, key terms and body copy in ordinary letters.",
    ],
    [
      "Does it style numbers and punctuation too?",
      "No — only the 26 Latin letters A–Z are substituted in the bold, italic, script and monospace variants. Digits, spaces, emoji and punctuation pass through unchanged, so a name with numbers will come out part styled and part plain.",
    ],
  ],
};

export default seo;
