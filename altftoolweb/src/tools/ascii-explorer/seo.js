const seo = {
  intro:
    "The ASCII Explorer is a searchable reference for all 128 characters of the 7-bit ASCII table, showing each code in decimal, hexadecimal, octal and 8-bit binary alongside its character and full name. Type a character to get its code, or a code from 0 to 127 to get the character, and the matching row scrolls into view and highlights. It is built for students, embedded and protocol developers, and anyone debugging a byte stream who needs to know what 0x0D or 65 actually is.",
  useCases: [
    "You are reading a hex dump and hit 0D 0A, and want to confirm that is carriage return followed by line feed rather than data.",
    "You are writing a C exercise that converts a digit character to its numeric value and need to check that '0' is code 48, so subtracting 48 works.",
    "A parser is choking on an invisible byte in a file, and you want to look up which control character code 27 or code 9 corresponds to.",
  ],
  benefits: [
    ["Four bases per character at once", "Every row shows decimal, hex, zero-padded octal and 8-bit binary side by side, so you never convert between them by hand."],
    ["Control codes are named, not blank", "All 33 control characters carry their mnemonic and meaning — LF is line feed, ESC is escape, DC1 is XON — instead of appearing as empty cells."],
    ["Search and filter across the whole table", "Filter to control or printable characters and search by character, decimal code, hex value or description name in one field."],
  ],
  faqs: [
    [
      "How many ASCII characters are there, and how many are printable?",
      "128 in total, numbered 0 to 127 because ASCII is a 7-bit code. 95 of them are printable (codes 32 to 126, starting with space), and the remaining 33 are control characters: codes 0 to 31 plus DEL at 127.",
    ],
    [
      "What is the ASCII code for A and a?",
      "Uppercase A is 65 (0x41) and lowercase a is 97 (0x61). Every letter pair differs by exactly 32, which is a single bit — bit 5 — so flipping that one bit changes case for the whole alphabet.",
    ],
    [
      "What are the ASCII codes for newline, tab and space?",
      "Line feed (LF) is 10, carriage return (CR) is 13, horizontal tab is 9 and space is 32. Windows text files traditionally end lines with CR followed by LF (13 then 10) while Unix uses LF alone, which is the source of most stray-character bugs in text files.",
    ],
    [
      "Why does my character return nothing in the lookup?",
      "Because it is above code 127 and therefore outside 7-bit ASCII. Accented letters, curly quotes, emoji and every non-Latin script live in Unicode, where they are typically encoded in UTF-8 as two to four bytes; only the first 128 Unicode code points match ASCII exactly.",
    ],
  ],
};

export default seo;
