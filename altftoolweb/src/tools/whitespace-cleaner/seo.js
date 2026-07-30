const seo = {
  intro:
    "Whitespace Cleaner does three fixed things to pasted text: it replaces every tab with a single space, trims leading and trailing whitespace from each line, and deletes lines that are empty once trimmed. The cleaned text appears as you type and rejoins the surviving lines with standard newlines, so Windows CRLF line endings come out as plain LF. It is for anyone pasting text out of a PDF, spreadsheet, email or chat log that arrives padded with stray tabs, indentation and blank rows.",
  useCases: [
    "You copied a column out of a PDF or spreadsheet and every entry has leading spaces and a tab on the end before you can import it as a list.",
    "You are pasting a list of IDs, emails or filenames into a script and need one clean value per line with no empty rows in the middle.",
    "A document has double-spaced paragraphs and inconsistent indentation, and you want a flat, single-spaced block to start editing from.",
  ],
  benefits: [
    [
      "One paste, three fixes",
      "Tab conversion, per-line trimming and blank-line removal happen in a single pass, so there is nothing to configure and nothing to run twice.",
    ],
    [
      "Line endings normalised too",
      "Because each line is trimmed, a stray carriage return from Windows CRLF text is stripped and the output uses plain newlines throughout.",
    ],
    [
      "Live output",
      "The result recomputes on every keystroke, so you can see exactly which lines survived before you copy anything.",
    ],
  ],
  faqs: [
    [
      "Does it convert tabs to 2 or 4 spaces?",
      "Neither — each tab becomes exactly one space. If you need code-style indentation of 2 or 4 spaces per level, use a code formatter instead, because this tool also trims leading whitespace and would remove that indentation anyway.",
    ],
    [
      "Will it remove blank lines between my paragraphs?",
      "Yes. Every line that is empty after trimming is dropped, including deliberate paragraph breaks, so a double-spaced document comes out single-spaced. Keep your original if those breaks matter.",
    ],
    [
      "Does it collapse multiple spaces inside a line?",
      "No. Only leading and trailing whitespace on each line is removed — a run of several spaces between two words is left exactly as it is. Use a find-and-replace or a regex tool if you need internal runs collapsed.",
    ],
    [
      "Is my text uploaded anywhere?",
      "No. The whole transform is a few lines of JavaScript running in your browser tab, so the text never leaves your device and nothing is stored after you close the page.",
    ],
  ],
};

export default seo;
