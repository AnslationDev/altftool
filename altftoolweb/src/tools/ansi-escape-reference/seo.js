const seo = {
  title: "ANSI Escape Code Decoder and SGR / CSI Reference",
  metaDescription:
    "Paste a log full of ESC[0;32m and see it rendered, every sequence named with its ECMA-48 mnemonic and support level, plus a stripped plain-text copy.",
  intro:
    "An ANSI escape code decoder reads terminal output that has been captured to a file — the kind that arrives as ESC[0;32m, \\033[1;31m or ^[[2K instead of colour — and shows three things at once: the text rendered the way the terminal would have drawn it, a named breakdown of every escape sequence in the paste, and a stripped plain-text copy with the codes gone. The parser follows the escape-sequence grammar in ECMA-48 (5th edition, 1991), the same standard published as ISO/IEC 6429 and ANSI X3.64: ESC [ starts a Control Sequence, parameter bytes 0x30-0x3F run until a final byte in 0x40-0x7E, and ESC ] starts an Operating System Command that ends at BEL or ST. The 256-colour and 24-bit selectors 38;5;n and 38;2;r;g;b come from ITU-T T.416 (ISO/IEC 8613-6) by way of xterm. It is for anyone reading a CI job log, a Docker build output, a captured SSH session or a test runner's stdout that was piped into a file, and for anyone writing the codes in the first place: the builder emits the sequence in \\x1b, \\033, \\e and \\u001b form with Bash, Python, Node and Go snippets. Everything runs in your browser; the log is never uploaded.",
  useCases: [
    "Read a GitHub Actions or Jenkins log that was downloaded as a raw file, where every colour has turned into literal ESC[32m text",
    "Work out why a progress bar printed 200 times in a captured log — the decoder applies the carriage returns and CSI K erases so it collapses to its final frame",
    "Get a clean plain-text copy of a coloured log to paste into a bug report, a diff or a ticket without the escape codes travelling with it",
    "Look up what CSI 2J actually erases, whether ESC 7 or CSI s is the safer save-cursor, and which of the two OSC terminators to emit",
    "Build the exact sequence for bold bright-red on a grey background and copy it as a ready-to-paste printf, print(), console.log or fmt.Printf line",
  ],
  benefits: [
    [
      "The decoder is the landing state",
      "Paste the log and the render, the sequence inventory and the stripped copy all appear at once. There is no mode to choose and no upload step — the reference tables sit underneath, for when you need them.",
    ],
    [
      "It runs a real screen buffer, not a regex",
      "Carriage return, backspace, tab stops every 8 columns, CUU/CUD/CUF/CUB, CHA, CUP and the ED/EL erase functions are all applied to a cell grid. That is why \\r plus CSI K collapses a spinner to one line instead of leaving 200 duplicates.",
    ],
    [
      "Every sequence gets a name and a support verdict",
      "Each distinct sequence is listed with its ECMA-48 mnemonic (SGR, CUP, EL), a plain-language meaning, how many times it appeared, and whether it is universal, widely supported, modern-terminal-only, patchy or terminal-specific.",
    ],
    [
      "Colours are named, never faked",
      "The preview maps ANSI colours onto this page's own theme tokens so it stays readable in light and dark mode. The exact value — palette entry 208, or 24-bit 220,38,38 — is printed in the sequence table, so the preview is a legibility aid and the table is the record.",
    ],
    [
      "Four escape spellings, four languages",
      "The builder gives the same sequence as \\x1b, \\033, \\e and \\u001b, and notes which languages accept which: \\e is a bash and GCC extension that Go and Python reject outright, and \\u001b is the JavaScript, Java, C# and JSON spelling.",
    ],
  ],
  faqs: [
    [
      "What does ESC[0;32m actually mean?",
      "It is one SGR (Select Graphic Rendition) sequence carrying two parameters: 0 resets every attribute and colour to the terminal default, then 32 sets the foreground to green. ESC is the single byte 0x1B, the [ makes it a Control Sequence Introducer, the digits between are semicolon-separated parameters and the final m is what identifies it as SGR. The eight foreground values are 30 black, 31 red, 32 green, 33 yellow, 34 blue, 35 magenta, 36 cyan, 37 white; add 10 to each for the background (40-47), or use 90-97 and 100-107 for the bright versions.",
    ],
    [
      "Why does my log show the codes as literal text instead of colours?",
      "Because nothing interpreted them. A terminal reads 0x1B and switches into escape-parsing mode; a text editor, a browser textarea or a log-file viewer just prints the bytes. The other common cause is the opposite problem — a program that colours unconditionally instead of checking whether stdout is a TTY, so the codes get written into a redirected file that will never be rendered. In Node that check is process.stdout.isTTY; in Go it is a terminal check on os.Stdout; most CLI frameworks also honour the NO_COLOR environment variable and a --no-color flag.",
    ],
    [
      "What is the difference between 38;5;n and 38;2;r;g;b?",
      "38;5;n picks entry n of the 256-colour palette: 0-7 are the basic eight, 8-15 the bright eight, 16-231 form a 6x6x6 RGB cube addressed as 16 + 36r + 6g + b with the six levels 0, 95, 135, 175, 215 and 255, and 232-255 are a 24-step grey ramp running 8, 18, 28 up to 238. 38;2;r;g;b is direct 24-bit colour, each channel 0-255, so 38;2;220;38;38 is one specific red rather than a palette slot. 48 is the background twin of each. ITU-T T.416 actually specifies these with colons — 38:2::r:g:b — but the semicolon form xterm popularised is what nearly every library emits, and this page accepts both.",
    ],
    [
      "Which escape sequences are safe to use everywhere?",
      "The VT100 and ECMA-48 core: SGR 0, 1, 4, 7 and the colour parameters 30-37, 39, 40-47 and 49; the cursor moves CUU, CUD, CUF, CUB and CUP; and the erase functions ED (CSI J) and EL (CSI K). Those are honoured by every terminal in common use, including the Windows console once ENABLE_VIRTUAL_TERMINAL_PROCESSING is on. One step down, 256-colour and the bright 90-97 range are safe anywhere claiming xterm-256color, which is the default on current Linux and macOS installs. Treat SGR 2 (faint), 3 (italic), 5 (blink), 8 (conceal), 9 (crossed out) and 21 as decoration only — several terminals drop them silently, and 21 is read as a double underline by ECMA-48 but as 'bold off' by the Linux console. OSC 8 hyperlinks and OSC 52 clipboard writes are opt-in extensions: terminals without them swallow the sequence, so the link text still prints but the URL is lost.",
    ],
  ],
  steps: [
    "Paste the raw log into the decoder box — the ESC bytes can be real 0x1B characters, or the literal text ESC[, \\033[, \\x1b[ or ^[[ that a copy-paste usually produces.",
    "Read the rendered panel first: it applies the colours, the carriage returns and the erase sequences, so it shows what the terminal would have drawn rather than what the file contains.",
    "Scan the sequence table underneath for every distinct escape code found, how many times it appeared, its ECMA-48 name, what it does and how widely it is supported.",
    "Press Copy stripped text for a clean plain-text version with every escape sequence removed, or Copy breakdown to take the whole sequence table as text.",
    "Use the builder to pick attributes and colours, then copy the sequence in whichever escape spelling your language uses, or copy the ready-made Bash, Python, Node or Go line.",
  ],
};

export default seo;
