const seo = {
  intro:
    "This converts text to binary and binary back to text: each character is taken as its character code and written as an 8-bit binary number, padded with leading zeros and separated from the next by a space. Type in either box and the other side updates instantly, so 'A' shows as 01000001 (code 65) and a pasted stream of space-separated bytes decodes straight back to readable characters. It is aimed at students working through number bases and at developers eyeballing what a byte actually contains.",
  useCases: [
    "You are working through a computer science exercise on ASCII and need to check your hand-worked binary for a word against a correct answer",
    "You found a string of ones and zeros in a puzzle, a CTF challenge or a forum post and want to know what it says",
    "You are explaining to someone why a text file's size in bytes matches its character count, and you want to show the actual bits behind a short phrase",
  ],
  benefits: [
    ["Two-way and live", "Edit either pane and the other rewrites immediately, and Swap flips which side is the input without retyping anything."],
    ["Rejects malformed binary out loud", "Anything other than 0, 1 and spaces in the binary pane raises an explicit error instead of silently decoding to garbage characters."],
    ["Counts both sides", "Each pane shows its character count, with whitespace excluded from the binary count, so you can confirm the 8-bits-per-character relationship at a glance."],
  ],
  faqs: [
    [
      "How is text converted to binary?",
      "Each character is looked up as its numeric character code and that number is written in base 2, zero-padded to 8 digits. 'H' is code 72, which is 01001000; a space is code 32, or 00100000. Bytes are joined with a single space so each group of 8 is readable.",
    ],
    [
      "Why is 8 bits used per character?",
      "Because standard ASCII covers codes 0 to 127 and its extended forms reach 255, both of which fit in one 8-bit byte. That is why the classic rule of thumb — one plain-text character, one byte — holds for English text.",
    ],
    [
      "What happens with emoji or non-English characters?",
      "Characters with codes above 255 produce groups longer than 8 bits, because the value is converted directly rather than encoded as UTF-8 multi-byte sequences. Latin-1 accented letters such as é (code 233) still fit in 8 bits, but for emoji and most non-Latin scripts the output will not match what a UTF-8 encoder produces.",
    ],
    [
      "What format does the binary input need to be in?",
      "Space-separated groups of ones and zeros, normally 8 per group. Line breaks and extra spaces between groups are tolerated because the input is split on any run of whitespace, but any other character triggers a validation error rather than a partial decode.",
    ],
  ],
};

export default seo;
