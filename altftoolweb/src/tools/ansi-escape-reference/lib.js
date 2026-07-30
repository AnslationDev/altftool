/**
 * ANSI Escape Code Reference & Log Decoder — pure logic.
 *
 * Everything here is offline string work over the escape-sequence grammar in
 * ECMA-48 "Control Functions for Coded Character Sets", 5th edition (June 1991),
 * which is the same document as ISO/IEC 6429 and ANSI X3.64. The extended
 * colour selectors (38/48 with 5;n or 2;r;g;b) come from ITU-T T.416 /
 * ISO/IEC 8613-6, and the de-facto semicolon spelling plus the 256-entry
 * palette layout come from the xterm "Control Sequences for xterm" (ctlseqs)
 * document. Hyperlinks are the OSC 8 convention originally written up as
 * "Hyperlinks in terminal emulators" and since implemented by VTE, iTerm2,
 * kitty, WezTerm, foot and Windows Terminal.
 *
 * No network, no DOM, no clock, no colour values. Colours are resolved to
 * NAMES ("red", "brightCyan") only — the caller maps a name onto its own
 * design tokens. Nothing in this file emits a CSS colour value of any kind.
 *
 * Reference last checked against the sources above: 2026-07-29.
 */

/** Date the tables in this file were last checked against their sources. */
export const REFERENCE_REVIEWED = "2026-07-29";

/** ESC, U+001B. The single character every sequence in this file starts with. */
export const ESC = "\u001B";

/** BEL, U+0007. One of the two legal OSC terminators (the other is ESC \). */
const BEL = "\u0007";

/** ST, U+009C — the 8-bit String Terminator form of ESC \. */
const C1_ST = "\u009C";

/** 8-bit CSI, U+009B — the single-byte form of ESC [. */
const C1_CSI = "\u009B";

/**
 * Practical input ceiling. A CI job log pasted into a browser textarea is
 * realistically a few thousand lines; 200,000 characters is roughly 2,500
 * lines of 80 columns and already far past what anyone reads on a phone.
 */
export const MAX_INPUT_LENGTH = 200000;

/** Rendered rows are capped so a runaway cursor sequence cannot allocate forever. */
export const MAX_RENDER_LINES = 2000;

/** Rendered columns are capped for the same reason (CSI 9999G is legal input). */
export const MAX_LINE_COLUMNS = 1000;

/** Tab stops every 8 columns — the default tab interval in ECMA-48 and every VT terminal. */
const TAB_WIDTH = 8;

/** Sample text in the builder snippets is capped so the snippet stays readable. */
const MAX_SAMPLE_LENGTH = 80;

/**
 * The eight colour names ECMA-48 assigns to SGR 30-37 (foreground) and
 * 40-47 (background), in parameter order.
 */
export const BASIC_COLOR_NAMES = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
];

/** The same eight with the "bright" (aixterm 90-97 / 100-107) prefix applied. */
export const BRIGHT_COLOR_NAMES = BASIC_COLOR_NAMES.map(
  (name) => `bright${name[0].toUpperCase()}${name.slice(1)}`,
);

/** Every colour name this module can produce, for the caller's token map. */
export const ALL_COLOR_NAMES = [...BASIC_COLOR_NAMES, ...BRIGHT_COLOR_NAMES];

/** How reliably a sequence is honoured in the wild. */
export const SUPPORT = {
  UNIVERSAL: "universal",
  WIDE: "wide",
  MODERN: "modern",
  PATCHY: "patchy",
  SPECIFIC: "specific",
};

export const SUPPORT_LABELS = {
  universal: "Universal",
  wide: "Widely supported",
  modern: "Modern terminals",
  patchy: "Patchy",
  specific: "Terminal-specific",
};

export const SUPPORT_NOTES = {
  universal:
    "Part of the VT100 / ECMA-48 core. Honoured by every terminal in common use, including the Windows console once virtual-terminal processing is enabled.",
  wide: "Honoured anywhere that claims xterm-256color, which is the default TERM on essentially every current Linux and macOS install.",
  modern:
    "Needs a 24-bit-colour terminal. Present in iTerm2, kitty, WezTerm, Alacritty, GNOME Terminal, Windows Terminal and VS Code's terminal; older terminals either approximate it or ignore it.",
  patchy:
    "Defined by the standard, but several terminals silently drop it or render it as something else. Do not rely on it carrying meaning on its own.",
  specific:
    "An opt-in extension, not in ECMA-48. Terminals that do not implement it usually swallow the sequence and show nothing, so the fallback is invisible text rather than garbage.",
};

/* ------------------------------------------------------------------ */
/* SGR parameter table                                                 */
/* ------------------------------------------------------------------ */

/**
 * SELECT GRAPHIC RENDITION parameters (ECMA-48, final byte "m").
 * `effect` is the machine-readable action used by the parser;
 * `meaning` is the human sentence shown in the reference table.
 */
const SGR_DEFS = [
  {
    code: "0",
    name: "Reset",
    meaning: "Clears every attribute and colour back to the terminal default.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "1",
    name: "Bold / increased intensity",
    meaning:
      "Bold weight. Many terminals also brighten the foreground colour, which is why 1;31 often looks like 91.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "2",
    name: "Faint / decreased intensity",
    meaning:
      "Dim text. Implemented as reduced opacity in most modern terminals; some render it identically to normal weight.",
    support: SUPPORT.PATCHY,
  },
  {
    code: "3",
    name: "Italic",
    meaning:
      "Italic. Needs a font with an italic face; terminals without one fall back to unstyled text or, rarely, to reverse video.",
    support: SUPPORT.PATCHY,
  },
  {
    code: "4",
    name: "Underline",
    meaning: "Single underline. 4:3 (curly) and 4:0 (off) are kitty/VTE sub-parameter extensions.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "5",
    name: "Slow blink",
    meaning: "Blink under 150 per minute. Deliberately ignored by many terminals and by CI log viewers.",
    support: SUPPORT.PATCHY,
  },
  {
    code: "6",
    name: "Rapid blink",
    meaning: "Blink at 150 per minute or more. Almost universally ignored.",
    support: SUPPORT.PATCHY,
  },
  {
    code: "7",
    name: "Reverse video",
    meaning: "Swaps foreground and background, whatever they currently are. Used for selection bars and prompts.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "8",
    name: "Conceal",
    meaning: "Hides the glyphs while keeping their width. Used for password prompts; the text is still in the byte stream.",
    support: SUPPORT.PATCHY,
  },
  {
    code: "9",
    name: "Crossed out",
    meaning: "Strikethrough. Supported by xterm, VTE, kitty, Windows Terminal and VS Code; missing in some older terminals.",
    support: SUPPORT.PATCHY,
  },
  {
    code: "21",
    name: "Doubly underlined (or bold off)",
    meaning:
      "ECMA-48 defines 21 as a double underline, but the Linux console and several others read it as 'bold off'. Ambiguous — use 22 to turn bold off.",
    support: SUPPORT.PATCHY,
  },
  {
    code: "22",
    name: "Normal intensity",
    meaning: "Cancels both 1 (bold) and 2 (faint) without touching colour.",
    support: SUPPORT.UNIVERSAL,
  },
  { code: "23", name: "Italic off", meaning: "Cancels 3.", support: SUPPORT.WIDE },
  { code: "24", name: "Underline off", meaning: "Cancels 4 and 21.", support: SUPPORT.UNIVERSAL },
  { code: "25", name: "Blink off", meaning: "Cancels 5 and 6.", support: SUPPORT.WIDE },
  { code: "27", name: "Reverse off", meaning: "Cancels 7.", support: SUPPORT.UNIVERSAL },
  { code: "28", name: "Conceal off", meaning: "Cancels 8 and makes hidden text visible again.", support: SUPPORT.WIDE },
  { code: "29", name: "Crossed out off", meaning: "Cancels 9.", support: SUPPORT.WIDE },
  {
    code: "30-37",
    name: "Foreground colour",
    meaning:
      "30 black, 31 red, 32 green, 33 yellow, 34 blue, 35 magenta, 36 cyan, 37 white — the eight names ECMA-48 defines. The actual shades come from the terminal's own palette, not from the standard.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "38;5;n",
    name: "Foreground, 256-colour palette",
    meaning:
      "Picks entry n of the xterm palette: 0-7 the basic eight, 8-15 the bright eight, 16-231 a 6x6x6 RGB cube at index 16 + 36r + 6g + b, 232-255 a 24-step grey ramp.",
    support: SUPPORT.WIDE,
  },
  {
    code: "38;2;r;g;b",
    name: "Foreground, 24-bit truecolour",
    meaning:
      "Direct RGB, each channel 0-255. ITU-T T.416 actually spells this 38:2:<colourspace>:r:g:b with colons; the semicolon form is xterm's and is what almost every library emits.",
    support: SUPPORT.MODERN,
  },
  { code: "39", name: "Default foreground", meaning: "Back to the terminal's own text colour.", support: SUPPORT.UNIVERSAL },
  {
    code: "40-47",
    name: "Background colour",
    meaning: "Same eight names as 30-37, applied to the cell background.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "48;5;n / 48;2;r;g;b",
    name: "Background, 256-colour or truecolour",
    meaning: "The background twins of 38;5;n and 38;2;r;g;b, with identical parameter shapes.",
    support: SUPPORT.WIDE,
  },
  { code: "49", name: "Default background", meaning: "Back to the terminal's own background.", support: SUPPORT.UNIVERSAL },
  {
    code: "58;5;n / 58;2;r;g;b",
    name: "Underline colour",
    meaning: "Colours the underline independently of the text. A kitty extension, also in VTE and WezTerm; ignored elsewhere.",
    support: SUPPORT.SPECIFIC,
  },
  {
    code: "90-97",
    name: "Bright foreground",
    meaning:
      "The bright eight as first-class parameters, from aixterm rather than ECMA-48. The reliable way to get a bright colour without also asking for bold.",
    support: SUPPORT.WIDE,
  },
  {
    code: "100-107",
    name: "Bright background",
    meaning: "The bright eight applied to the background, again an aixterm extension.",
    support: SUPPORT.WIDE,
  },
];

export const SGR_REFERENCE = SGR_DEFS;

/* ------------------------------------------------------------------ */
/* Cursor, erase and OSC reference tables                              */
/* ------------------------------------------------------------------ */

export const CURSOR_REFERENCE = [
  {
    code: "CSI n A",
    name: "CUU — cursor up",
    meaning: "Moves up n rows (default 1) without changing the column. Stops at the top of the scrolling region.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "CSI n B",
    name: "CUD — cursor down",
    meaning: "Moves down n rows (default 1), column unchanged.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "CSI n C",
    name: "CUF — cursor forward",
    meaning: "Moves right n columns (default 1). Does not erase what it passes over.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "CSI n D",
    name: "CUB — cursor back",
    meaning: "Moves left n columns (default 1). Also does not erase.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "CSI n E / CSI n F",
    name: "CNL / CPL — next / previous line",
    meaning: "Moves n rows down or up AND to column 1. Unlike CUU/CUD these reset the column.",
    support: SUPPORT.WIDE,
  },
  {
    code: "CSI n G",
    name: "CHA — cursor horizontal absolute",
    meaning: "Jumps to column n (1-based) on the current row. CSI 1G is the tidy way to get back to the left margin.",
    support: SUPPORT.WIDE,
  },
  {
    code: "CSI r ; c H",
    name: "CUP — cursor position",
    meaning:
      "Absolute move to row r, column c, both 1-based, both defaulting to 1. CSI f (HVP) is a synonym. CSI H alone means 'home'.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "CSI n d",
    name: "VPA — line position absolute",
    meaning: "Jumps to row n, column unchanged.",
    support: SUPPORT.WIDE,
  },
  {
    code: "CSI n S / CSI n T",
    name: "SU / SD — scroll up / down",
    meaning: "Scrolls the whole scrolling region by n lines. The cursor stays where it is.",
    support: SUPPORT.WIDE,
  },
  {
    code: "ESC 7 / ESC 8",
    name: "DECSC / DECRC — save / restore cursor",
    meaning:
      "DEC's private save and restore. Stores the position AND the current SGR attributes and character set, then puts them all back.",
    support: SUPPORT.WIDE,
  },
  {
    code: "CSI s / CSI u",
    name: "SCOSC / SCORC — save / restore cursor",
    meaning:
      "The ANSI.SYS spelling of the same idea. In xterm, CSI s is ambiguous with DECSLRM (set left/right margin) when margin mode is on, so ESC 7 / ESC 8 is the safer pair.",
    support: SUPPORT.PATCHY,
  },
  {
    code: "CSI ?25l / CSI ?25h",
    name: "DECTCEM — hide / show cursor",
    meaning: "A DEC private mode. Every spinner and progress bar hides the cursor with ?25l and must restore it with ?25h.",
    support: SUPPORT.WIDE,
  },
  {
    code: "CSI ?1049h / CSI ?1049l",
    name: "Alternate screen buffer",
    meaning:
      "Switches to a second, scrollback-free screen and back. This is why vim and less leave your scrollback untouched on exit.",
    support: SUPPORT.WIDE,
  },
];

export const ERASE_REFERENCE = [
  {
    code: "CSI 0 J",
    name: "ED 0 — erase below",
    meaning: "Clears from the cursor to the end of the screen, inclusive. This is the default when the parameter is omitted.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "CSI 1 J",
    name: "ED 1 — erase above",
    meaning: "Clears from the start of the screen to the cursor, inclusive.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "CSI 2 J",
    name: "ED 2 — erase screen",
    meaning:
      "Clears the whole screen. It does NOT move the cursor, which is why 'clear' is usually sent as CSI 2J followed by CSI H.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "CSI 3 J",
    name: "ED 3 — erase scrollback",
    meaning: "Drops the saved scrollback as well. An xterm extension, now in most terminals; older ones ignore it.",
    support: SUPPORT.WIDE,
  },
  {
    code: "CSI 0 K",
    name: "EL 0 — erase to end of line",
    meaning:
      "Clears from the cursor to the end of the row. The default. Paired with a carriage return this is how every progress bar redraws itself: \\r then CSI K then the new text.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "CSI 1 K",
    name: "EL 1 — erase to start of line",
    meaning: "Clears from the start of the row to the cursor, inclusive.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "CSI 2 K",
    name: "EL 2 — erase line",
    meaning: "Clears the whole row, cursor unmoved.",
    support: SUPPORT.UNIVERSAL,
  },
  {
    code: "CSI n X",
    name: "ECH — erase character",
    meaning: "Blanks n characters from the cursor rightwards without moving anything else along.",
    support: SUPPORT.WIDE,
  },
];

export const OSC_REFERENCE = [
  {
    code: "OSC 0 ; text BEL",
    name: "Set icon name and window title",
    meaning:
      "Sets both at once. The terminator is either BEL (0x07) or ST (ESC \\); BEL is the older xterm spelling and is what most shells emit.",
    support: SUPPORT.WIDE,
  },
  {
    code: "OSC 1 ; text BEL",
    name: "Set icon name only",
    meaning: "Sets the icon/tab name and leaves the window title alone. Several terminals map both to the tab label.",
    support: SUPPORT.PATCHY,
  },
  {
    code: "OSC 2 ; text BEL",
    name: "Set window title only",
    meaning: "The one PS1 tricks use. Ignored inside tmux unless allow-passthrough is set, and ignored by most CI log viewers.",
    support: SUPPORT.WIDE,
  },
  {
    code: "OSC 4 ; n ; spec BEL",
    name: "Set palette entry",
    meaning: "Redefines entry n of the 256-colour palette for the session. Querying it with ? is how programs detect a dark background.",
    support: SUPPORT.WIDE,
  },
  {
    code: "OSC 8 ; params ; URI ST",
    name: "Hyperlink",
    meaning:
      "Opens a link that wraps the following text; OSC 8 ;; ST with an empty URI closes it. Implemented by VTE (GNOME Terminal), iTerm2, kitty, WezTerm, foot and Windows Terminal. Terminals without it show the label text and drop the URI silently.",
    support: SUPPORT.SPECIFIC,
  },
  {
    code: "OSC 52 ; c ; base64 ST",
    name: "Clipboard write",
    meaning:
      "Puts base64 data on the system clipboard from inside the terminal — the trick that makes yanking work over SSH. Disabled by default in several terminals because any remote process could use it.",
    support: SUPPORT.SPECIFIC,
  },
  {
    code: "OSC 9 ; text BEL",
    name: "Desktop notification",
    meaning: "iTerm2 and ConEmu raise a notification; OSC 777;notify is the VTE/rxvt spelling. No cross-terminal standard exists.",
    support: SUPPORT.SPECIFIC,
  },
  {
    code: "OSC 133 ; A/B/C/D ST",
    name: "Shell integration marks",
    meaning:
      "Marks prompt start, command start, output start and exit status so the terminal can fold output and jump between commands. The FinalTerm convention, adopted by iTerm2, kitty, WezTerm and VS Code.",
    support: SUPPORT.SPECIFIC,
  },
];

/* ------------------------------------------------------------------ */
/* Colour resolution — names only, never values                        */
/* ------------------------------------------------------------------ */

/**
 * The six intensity levels of the xterm 6x6x6 colour cube (palette 16-231).
 * Level 0 is 0; levels 1-5 are 55 + 40 * level. Source: xterm ctlseqs / the
 * 256-colour table shipped with xterm since patch 111.
 */
const CUBE_LEVELS = [0, 95, 135, 175, 215, 255];

/** Grey ramp for palette 232-255: 8 + 10 * (n - 232), giving 8 to 238. */
const GREY_BASE = 8;
const GREY_STEP = 10;

/**
 * Saturation floor, on the 0-255 channel scale, below which a colour is
 * treated as a grey rather than as one of the six hues. 30/255 is about 12%,
 * which keeps near-neutral CI greys out of the coloured buckets.
 */
const GREY_SATURATION_CUTOFF = 30;

/**
 * Grey-ramp naming boundaries. xterm's four default neutral palette entries sit
 * at channel values 0 (black), 127 (bright black, 127/127/127), 229 (white,
 * 229/229/229) and 255 (bright white). Each cutoff below is the midpoint between
 * two neighbouring anchors, so a grey is named after whichever of the four it
 * is closest to.
 */
const GREY_BLACK_CUTOFF = 64; // midpoint of 0 and 127, rounded up
const GREY_DIM_CUTOFF = 178; // midpoint of 127 and 229
const GREY_WHITE_CUTOFF = 242; // midpoint of 229 and 255

/** A hue whose brightest channel is at or above this is named "bright". */
const BRIGHT_CHANNEL_CUTOFF = 170;

/**
 * Quantise an arbitrary RGB triple to one of the sixteen named ANSI colours.
 *
 * Rule: each channel is compared against the midpoint of that colour's own
 * channel range, ((max + min) / 2), giving one bit per channel; the three bits
 * index the standard black/red/green/yellow/blue/magenta/cyan/white order.
 * Near-neutral colours (max - min below the saturation floor) are named on the
 * grey ramp instead. This is a naming step, not a rendering step — it exists so
 * a 24-bit colour can be described without inventing a colour value.
 */
export function rgbToNearestAnsiName(r, g, b) {
  const channels = [r, g, b].map((v) => Math.min(255, Math.max(0, Math.round(Number(v) || 0))));
  const max = Math.max(...channels);
  const min = Math.min(...channels);

  if (max - min < GREY_SATURATION_CUTOFF) {
    if (max >= GREY_WHITE_CUTOFF) return "brightWhite";
    if (max >= GREY_DIM_CUTOFF) return "white";
    if (max >= GREY_BLACK_CUTOFF) return "brightBlack";
    return "black";
  }

  const mid = (max + min) / 2;
  const bits = channels.map((v) => (v > mid ? 1 : 0));
  const index = bits[0] + bits[1] * 2 + bits[2] * 4;
  const base = BASIC_COLOR_NAMES[index];
  return max >= BRIGHT_CHANNEL_CUTOFF ? BRIGHT_COLOR_NAMES[index] : base;
}

/**
 * Resolve one entry of the xterm 256-colour palette to a name and, for the
 * cube and grey ranges, to the RGB triple the palette defines for it.
 */
export function paletteIndexToColor(n) {
  const index = Math.round(Number(n));
  if (!Number.isFinite(index) || index < 0 || index > 255) {
    return { error: `256-colour index must be a whole number from 0 to 255 (got ${n}).` };
  }
  if (index < 8) {
    return { index, name: BASIC_COLOR_NAMES[index], band: "basic", rgb: null };
  }
  if (index < 16) {
    return { index, name: BRIGHT_COLOR_NAMES[index - 8], band: "bright", rgb: null };
  }
  if (index < 232) {
    const offset = index - 16;
    const r = CUBE_LEVELS[Math.floor(offset / 36)];
    const g = CUBE_LEVELS[Math.floor(offset / 6) % 6];
    const b = CUBE_LEVELS[offset % 6];
    return { index, name: rgbToNearestAnsiName(r, g, b), band: "cube", rgb: [r, g, b] };
  }
  const level = GREY_BASE + GREY_STEP * (index - 232);
  return { index, name: rgbToNearestAnsiName(level, level, level), band: "grey", rgb: [level, level, level] };
}

/** Human label for a colour name, e.g. "brightCyan" -> "bright cyan". */
export function colorNameLabel(name) {
  if (!name) return "default";
  return name.replace(/^bright([A-Z])/, (_m, c) => `bright ${c.toLowerCase()}`);
}

/* ------------------------------------------------------------------ */
/* Style state                                                         */
/* ------------------------------------------------------------------ */

function blankStyle() {
  return {
    bold: false,
    dim: false,
    italic: false,
    underline: false,
    blink: false,
    reverse: false,
    conceal: false,
    strike: false,
    fg: null,
    bg: null,
    link: null,
  };
}

function cloneStyle(style) {
  return { ...style };
}

/**
 * Turn the internal style into the render-ready shape the UI consumes:
 * reverse video is already applied, so the caller never does colour logic.
 * "reverse" as a colour name means "use the opposite surface".
 */
function toRenderStyle(style) {
  let fg = style.fg;
  let bg = style.bg;
  if (style.reverse) {
    const swappedFg = bg === null ? "reverse" : bg;
    const swappedBg = fg === null ? "reverse" : fg;
    fg = swappedFg;
    bg = swappedBg;
  }
  return {
    bold: style.bold,
    dim: style.dim,
    italic: style.italic,
    underline: style.underline,
    blink: style.blink,
    conceal: style.conceal,
    strike: style.strike,
    reverse: style.reverse,
    fg,
    bg,
    link: style.link,
  };
}

function sameRenderStyle(a, b) {
  return (
    a.bold === b.bold &&
    a.dim === b.dim &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.blink === b.blink &&
    a.conceal === b.conceal &&
    a.strike === b.strike &&
    a.reverse === b.reverse &&
    a.fg === b.fg &&
    a.bg === b.bg &&
    a.link === b.link
  );
}

/* ------------------------------------------------------------------ */
/* SGR parameter interpretation                                        */
/* ------------------------------------------------------------------ */

const SIMPLE_SGR = {
  0: { label: "reset all attributes", apply: (s) => Object.assign(s, blankStyle(), { link: s.link }) },
  1: { label: "bold", apply: (s) => { s.bold = true; } },
  2: { label: "faint / dim", apply: (s) => { s.dim = true; } },
  3: { label: "italic", apply: (s) => { s.italic = true; } },
  4: { label: "underline", apply: (s) => { s.underline = true; } },
  5: { label: "slow blink", apply: (s) => { s.blink = true; } },
  6: { label: "rapid blink", apply: (s) => { s.blink = true; } },
  7: { label: "reverse video", apply: (s) => { s.reverse = true; } },
  8: { label: "conceal", apply: (s) => { s.conceal = true; } },
  9: { label: "crossed out", apply: (s) => { s.strike = true; } },
  21: { label: "double underline (bold off on some terminals)", apply: (s) => { s.underline = true; } },
  22: { label: "normal intensity (bold and faint off)", apply: (s) => { s.bold = false; s.dim = false; } },
  23: { label: "italic off", apply: (s) => { s.italic = false; } },
  24: { label: "underline off", apply: (s) => { s.underline = false; } },
  25: { label: "blink off", apply: (s) => { s.blink = false; } },
  27: { label: "reverse off", apply: (s) => { s.reverse = false; } },
  28: { label: "conceal off", apply: (s) => { s.conceal = false; } },
  29: { label: "crossed out off", apply: (s) => { s.strike = false; } },
  39: { label: "default foreground", apply: (s) => { s.fg = null; } },
  49: { label: "default background", apply: (s) => { s.bg = null; } },
};

/**
 * Read one extended-colour selector starting at params[i], where params[i] is
 * "38", "48" or "58". Returns { name, consumed, label } or null when the
 * parameter run is malformed. Accepts both the xterm semicolon spelling and
 * the ITU-T T.416 colon spelling, which arrives here already flattened.
 */
function readExtendedColor(params, i) {
  const mode = params[i + 1];
  if (mode === "5") {
    const resolved = paletteIndexToColor(params[i + 2]);
    if (resolved.error) return null;
    return {
      name: resolved.name,
      consumed: 3,
      label: `256-colour palette entry ${resolved.index} (${colorNameLabel(resolved.name)} band)`,
    };
  }
  if (mode === "2") {
    const r = Number(params[i + 2]);
    const g = Number(params[i + 3]);
    const b = Number(params[i + 4]);
    if (![r, g, b].every((v) => Number.isFinite(v) && v >= 0 && v <= 255)) return null;
    return {
      name: rgbToNearestAnsiName(r, g, b),
      consumed: 5,
      label: `24-bit colour ${r},${g},${b} — nearest named ANSI colour is ${colorNameLabel(
        rgbToNearestAnsiName(r, g, b),
      )}`,
    };
  }
  return null;
}

/**
 * Apply a full SGR parameter list to a style object (mutated in place) and
 * return a list of plain-language descriptions, one per parameter consumed.
 */
export function applySgrParams(rawParams, style) {
  const params = rawParams.length === 0 ? ["0"] : rawParams;
  const notes = [];
  for (let i = 0; i < params.length; i += 1) {
    const token = params[i] === "" ? "0" : params[i];
    const code = Number(token);
    if (!Number.isFinite(code)) {
      notes.push(`${token}: not a numeric parameter — ignored`);
      continue;
    }
    if (code === 38 || code === 48 || code === 58) {
      const ext = readExtendedColor(params, i);
      if (!ext) {
        notes.push(`${code}: incomplete extended-colour selector — ignored`);
        continue;
      }
      if (code === 38) style.fg = ext.name;
      else if (code === 48) style.bg = ext.name;
      const target = code === 38 ? "foreground" : code === 48 ? "background" : "underline";
      notes.push(`${params.slice(i, i + ext.consumed).join(";")}: ${target} — ${ext.label}`);
      i += ext.consumed - 1;
      continue;
    }
    if (SIMPLE_SGR[code]) {
      SIMPLE_SGR[code].apply(style);
      notes.push(`${code}: ${SIMPLE_SGR[code].label}`);
      continue;
    }
    if (code >= 30 && code <= 37) {
      style.fg = BASIC_COLOR_NAMES[code - 30];
      notes.push(`${code}: foreground ${BASIC_COLOR_NAMES[code - 30]}`);
      continue;
    }
    if (code >= 40 && code <= 47) {
      style.bg = BASIC_COLOR_NAMES[code - 40];
      notes.push(`${code}: background ${BASIC_COLOR_NAMES[code - 40]}`);
      continue;
    }
    if (code >= 90 && code <= 97) {
      style.fg = BRIGHT_COLOR_NAMES[code - 90];
      notes.push(`${code}: foreground bright ${BASIC_COLOR_NAMES[code - 90]}`);
      continue;
    }
    if (code >= 100 && code <= 107) {
      style.bg = BRIGHT_COLOR_NAMES[code - 100];
      notes.push(`${code}: background bright ${BASIC_COLOR_NAMES[code - 100]}`);
      continue;
    }
    notes.push(`${code}: not a recognised SGR parameter — ignored`);
  }
  return notes;
}

/* ------------------------------------------------------------------ */
/* Sequence scanner                                                    */
/* ------------------------------------------------------------------ */

const CSI_NAMES = {
  A: "CUU — cursor up",
  B: "CUD — cursor down",
  C: "CUF — cursor forward",
  D: "CUB — cursor back",
  E: "CNL — cursor next line",
  F: "CPL — cursor previous line",
  G: "CHA — cursor horizontal absolute",
  H: "CUP — cursor position",
  f: "HVP — horizontal & vertical position",
  J: "ED — erase in display",
  K: "EL — erase in line",
  S: "SU — scroll up",
  T: "SD — scroll down",
  d: "VPA — line position absolute",
  m: "SGR — select graphic rendition",
  n: "DSR — device status report",
  s: "SCOSC — save cursor",
  u: "SCORC — restore cursor",
  h: "SM — set mode",
  l: "RM — reset mode",
  r: "DECSTBM — set scrolling region",
  "@": "ICH — insert character",
  P: "DCH — delete character",
  L: "IL — insert line",
  M: "DL — delete line",
  X: "ECH — erase character",
};

const CSI_KINDS = {
  m: "sgr",
  A: "cursor",
  B: "cursor",
  C: "cursor",
  D: "cursor",
  E: "cursor",
  F: "cursor",
  G: "cursor",
  H: "cursor",
  f: "cursor",
  d: "cursor",
  S: "cursor",
  T: "cursor",
  s: "cursor",
  u: "cursor",
  J: "erase",
  K: "erase",
  X: "erase",
};

const SIMPLE_ESCAPES = {
  "7": "DECSC — save cursor, attributes and character set",
  "8": "DECRC — restore cursor, attributes and character set",
  c: "RIS — reset to initial state (full terminal reset)",
  D: "IND — index (move down one line, scrolling if needed)",
  E: "NEL — next line",
  H: "HTS — set a horizontal tab stop at the cursor column",
  M: "RI — reverse index (move up one line, scrolling if needed)",
  Z: "DECID — identify terminal",
  "=": "DECKPAM — keypad into application mode",
  ">": "DECKPNM — keypad into numeric mode",
};

/** Render ESC as a visible glyph so a sequence can be printed in the DOM. */
export function visualiseSequence(raw) {
  return raw
    .replace(/\u001B/g, "ESC ")
    .replace(/\u0007/g, " BEL")
    .replace(/\u009B/g, "CSI ")
    .replace(/\u009C/g, " ST");
}

/**
 * Scan one escape sequence starting at index i (text[i] is ESC or 8-bit CSI).
 * Returns null when the byte is not the start of a recognisable sequence.
 */
function scanSequence(text, i) {
  const ch = text[i];
  const isC1Csi = ch === C1_CSI;
  const next = isC1Csi ? "[" : text[i + 1];

  if (ch === ESC && next === undefined) return null;

  if (next === "[") {
    let j = i + (isC1Csi ? 1 : 2);
    const paramStart = j;
    while (j < text.length && text.charCodeAt(j) >= 0x30 && text.charCodeAt(j) <= 0x3f) j += 1;
    const paramText = text.slice(paramStart, j);
    const interStart = j;
    while (j < text.length && text.charCodeAt(j) >= 0x20 && text.charCodeAt(j) <= 0x2f) j += 1;
    const intermediates = text.slice(interStart, j);
    if (j >= text.length) return null;
    const final = text[j];
    const finalCode = text.charCodeAt(j);
    if (finalCode < 0x40 || finalCode > 0x7e) return null;
    const privatePrefix = /^[<=>?]/.test(paramText) ? paramText[0] : "";
    const body = privatePrefix ? paramText.slice(1) : paramText;
    return {
      length: j + 1 - i,
      raw: text.slice(i, j + 1),
      type: "CSI",
      final,
      intermediates,
      privatePrefix,
      // Colon sub-parameters are flattened so 38:2:0:255:0:0 reads the same
      // as 38;2;255;0;0 (ITU-T T.416 spelling vs the xterm one).
      params: body === "" ? [] : body.split(/[;:]/),
      kind: CSI_KINDS[final] || "other",
    };
  }

  if (ch === ESC && next === "]") {
    let j = i + 2;
    while (j < text.length) {
      if (text[j] === BEL || text[j] === C1_ST) {
        return { length: j + 1 - i, raw: text.slice(i, j + 1), type: "OSC", kind: "osc" };
      }
      if (text[j] === ESC && text[j + 1] === "\\") {
        return { length: j + 2 - i, raw: text.slice(i, j + 2), type: "OSC", kind: "osc" };
      }
      j += 1;
    }
    return null;
  }

  if (ch === ESC && (next === "P" || next === "^" || next === "_" || next === "X")) {
    let j = i + 2;
    while (j < text.length) {
      if (text[j] === C1_ST) return { length: j + 1 - i, raw: text.slice(i, j + 1), type: "STRING", kind: "other" };
      if (text[j] === ESC && text[j + 1] === "\\") {
        return { length: j + 2 - i, raw: text.slice(i, j + 2), type: "STRING", kind: "other" };
      }
      j += 1;
    }
    return null;
  }

  if (ch === ESC && "()*+".includes(next)) {
    if (i + 2 >= text.length) return null;
    return { length: 3, raw: text.slice(i, i + 3), type: "CHARSET", kind: "other" };
  }

  if (ch === ESC && SIMPLE_ESCAPES[next]) {
    return { length: 2, raw: text.slice(i, i + 2), type: "ESCAPE", final: next, kind: "cursor" };
  }

  return null;
}

/** Plain-language meaning for one scanned sequence. */
function describeSequence(seq, sgrNotes) {
  if (seq.type === "CSI") {
    const nums = seq.params.map((p) => (p === "" ? "" : p));
    const first = Number(nums[0] || 1);
    const name = CSI_NAMES[seq.final] || `unassigned final byte "${seq.final}"`;
    if (seq.final === "m") {
      return { name: CSI_NAMES.m, meaning: sgrNotes.join("; ") || "reset all attributes" };
    }
    if (seq.privatePrefix === "?" && (seq.final === "h" || seq.final === "l")) {
      const on = seq.final === "h";
      const mode = nums[0] || "";
      const known = {
        1: on ? "cursor keys send application sequences" : "cursor keys send normal sequences",
        7: on ? "auto-wrap on" : "auto-wrap off",
        12: on ? "cursor blink on" : "cursor blink off",
        25: on ? "show the cursor" : "hide the cursor",
        1000: on ? "report mouse button presses" : "stop reporting mouse button presses",
        1002: on ? "report mouse drags" : "stop reporting mouse drags",
        1006: on ? "SGR-encoded mouse reports" : "plain mouse reports",
        1049: on ? "switch to the alternate screen buffer" : "switch back to the main screen buffer",
        2004: on ? "bracketed paste on" : "bracketed paste off",
      };
      return {
        name: on ? "DECSET — set private mode" : "DECRST — reset private mode",
        meaning: known[mode] || `${on ? "set" : "reset"} DEC private mode ${mode}`,
      };
    }
    const moves = {
      A: `move the cursor up ${first} row${first === 1 ? "" : "s"}`,
      B: `move the cursor down ${first} row${first === 1 ? "" : "s"}`,
      C: `move the cursor right ${first} column${first === 1 ? "" : "s"}`,
      D: `move the cursor left ${first} column${first === 1 ? "" : "s"}`,
      E: `move down ${first} row${first === 1 ? "" : "s"} and to column 1`,
      F: `move up ${first} row${first === 1 ? "" : "s"} and to column 1`,
      G: `jump to column ${first}`,
      d: `jump to row ${first}`,
      S: `scroll the screen up ${first} line${first === 1 ? "" : "s"}`,
      T: `scroll the screen down ${first} line${first === 1 ? "" : "s"}`,
      s: "save the cursor position",
      u: "restore the saved cursor position",
    };
    if (moves[seq.final]) return { name, meaning: moves[seq.final] };
    if (seq.final === "H" || seq.final === "f") {
      const row = Number(nums[0] || 1);
      const col = Number(nums[1] || 1);
      return { name, meaning: `move the cursor to row ${row}, column ${col}` };
    }
    if (seq.final === "J") {
      const mode = Number(nums[0] || 0);
      const text = {
        0: "erase from the cursor to the end of the screen",
        1: "erase from the start of the screen to the cursor",
        2: "erase the whole screen (cursor stays put)",
        3: "erase the whole screen and the scrollback",
      };
      return { name, meaning: text[mode] || `erase in display, mode ${mode}` };
    }
    if (seq.final === "K") {
      const mode = Number(nums[0] || 0);
      const text = {
        0: "erase from the cursor to the end of the line",
        1: "erase from the start of the line to the cursor",
        2: "erase the whole line",
      };
      return { name, meaning: text[mode] || `erase in line, mode ${mode}` };
    }
    if (seq.final === "X") return { name, meaning: `blank ${first} character${first === 1 ? "" : "s"} from the cursor` };
    return { name, meaning: `parameters ${seq.params.join(";") || "(default)"}` };
  }

  if (seq.type === "OSC") {
    const body = seq.raw.slice(2).replace(/(\u0007|\u009C|\u001B\\)$/, "");
    const sep = body.indexOf(";");
    const code = sep === -1 ? body : body.slice(0, sep);
    const rest = sep === -1 ? "" : body.slice(sep + 1);
    const map = {
      0: () => `set the window title and icon name to "${rest}"`,
      1: () => `set the icon name to "${rest}"`,
      2: () => `set the window title to "${rest}"`,
      4: () => `redefine palette entry — ${rest}`,
      8: () => {
        const uriSep = rest.indexOf(";");
        const uri = uriSep === -1 ? "" : rest.slice(uriSep + 1);
        return uri ? `open a hyperlink to ${uri}` : "close the current hyperlink";
      },
      9: () => `raise a desktop notification: "${rest}"`,
      52: () => "write to the system clipboard (base64 payload)",
      133: () => `shell integration mark "${rest}"`,
    };
    const meaning = map[code] ? map[code]() : `operating system command ${code}`;
    return { name: `OSC ${code}`, meaning };
  }

  if (seq.type === "ESCAPE") {
    return { name: SIMPLE_ESCAPES[seq.final], meaning: SIMPLE_ESCAPES[seq.final] };
  }
  if (seq.type === "CHARSET") {
    return { name: "SCS — select character set", meaning: `designate character set ${seq.raw.slice(1)}` };
  }
  return { name: "String control", meaning: "a DCS/PM/APC/SOS string — the payload is not displayed text" };
}

/** Support level assigned to a scanned sequence, using the tables above. */
function sequenceSupport(seq) {
  if (seq.type === "OSC") {
    const body = seq.raw.slice(2);
    const code = body.slice(0, body.indexOf(";") === -1 ? body.length : body.indexOf(";"));
    if (code === "8" || code === "52" || code === "9" || code === "133") return SUPPORT.SPECIFIC;
    return SUPPORT.WIDE;
  }
  if (seq.type === "CSI") {
    if (seq.final === "m") {
      const joined = seq.params.join(";");
      if (/\b(38|48|58);2\b/.test(joined)) return SUPPORT.MODERN;
      if (/\b(38|48|58);5\b/.test(joined)) return SUPPORT.WIDE;
      if (seq.params.some((p) => ["2", "3", "5", "6", "8", "9", "21"].includes(p))) return SUPPORT.PATCHY;
      if (seq.params.some((p) => Number(p) >= 90)) return SUPPORT.WIDE;
      return SUPPORT.UNIVERSAL;
    }
    if (seq.final === "s" || seq.final === "u") return SUPPORT.PATCHY;
    if (seq.privatePrefix === "?") return SUPPORT.WIDE;
    if ("ABCDHJKfm".includes(seq.final)) return SUPPORT.UNIVERSAL;
    return SUPPORT.WIDE;
  }
  return SUPPORT.WIDE;
}

/* ------------------------------------------------------------------ */
/* Screen buffer                                                       */
/* ------------------------------------------------------------------ */

function makeCell(char, style) {
  return { char, style };
}

/**
 * Textual spellings of ESC that a copy-paste produces once the real 0x1B byte
 * has been lost: source-code escapes (backslash-x1b, backslash-u001b, backslash-033,
 * backslash-e, optionally double-backslashed by a JSON dump), caret notation
 * as printed by `cat -v` and vim (^[), the literal word ESC, and U+241B
 * SYMBOL FOR ESCAPE.
 *
 * Each is only rewritten when it is immediately followed by [ or ], the two
 * bytes that actually begin a control sequence, so ordinary prose containing
 * the word "ESC" or a path containing \e is left alone.
 */
const TEXTUAL_ESC = /(?:\\+x1[bB]|\\+u001[bB]|\\+033|\\+e|\^\[|<ESC>|ESC|␛)(?=[[\]])/g;

/**
 * Replace textual ESC spellings with the real control character and report how
 * many were rewritten.
 */
export function normaliseEscapes(text) {
  if (typeof text !== "string") return { text: "", normalisedCount: 0 };
  let normalisedCount = 0;
  const out = text.replace(TEXTUAL_ESC, () => {
    normalisedCount += 1;
    return ESC;
  });
  return { text: out, normalisedCount };
}

/**
 * Decode terminal output into rendered rows, an inventory of every escape
 * sequence found, and a stripped plain-text copy.
 *
 * The renderer is a real (if small) screen buffer: printable characters,
 * carriage return, backspace, tab, cursor movement within and between the
 * pasted rows, and the erase functions are all applied, which is what makes
 * a progress bar collapse to its final frame instead of printing 200 times.
 * Absolute positioning (CUP) is taken relative to the first pasted row,
 * because a pasted log has no screen height to anchor to.
 */
export function decodeAnsiLog(rawInput) {
  if (typeof rawInput !== "string") {
    return { error: "Nothing to decode — paste some terminal output first." };
  }
  if (rawInput.length === 0) {
    return { error: "Nothing to decode — paste some terminal output first." };
  }
  if (rawInput.length > MAX_INPUT_LENGTH) {
    return {
      error: `That is ${rawInput.length.toLocaleString("en-US")} characters. Paste up to ${MAX_INPUT_LENGTH.toLocaleString(
        "en-US",
      )} at a time — about 2,500 lines of an 80-column log.`,
    };
  }
  const { text, normalisedCount } = normaliseEscapes(rawInput);
  if (text.length > MAX_INPUT_LENGTH) {
    return {
      error: `That is ${text.length.toLocaleString("en-US")} characters. Paste up to ${MAX_INPUT_LENGTH.toLocaleString(
        "en-US",
      )} at a time — about 2,500 lines of an 80-column log.`,
    };
  }

  const rows = [[]];
  let row = 0;
  let col = 0;
  let style = blankStyle();
  let savedCursor = null;
  const stripped = [];
  const inventory = new Map();
  let truncatedRows = false;
  let truncatedCols = false;
  const counts = { sgr: 0, cursor: 0, erase: 0, osc: 0, other: 0 };

  const ensureRow = (target) => {
    while (rows.length <= target) {
      if (rows.length >= MAX_RENDER_LINES) {
        truncatedRows = true;
        return Math.min(target, MAX_RENDER_LINES - 1);
      }
      rows.push([]);
    }
    return target;
  };

  const writeChar = (char) => {
    if (col >= MAX_LINE_COLUMNS) {
      truncatedCols = true;
      return;
    }
    const line = rows[row];
    while (line.length < col) line.push(makeCell(" ", blankStyle()));
    line[col] = makeCell(char, cloneStyle(style));
    col += 1;
  };

  const record = (seq, description, support) => {
    const key = seq.raw;
    const existing = inventory.get(key);
    if (existing) {
      existing.count += 1;
      return;
    }
    inventory.set(key, {
      raw: seq.raw,
      display: visualiseSequence(seq.raw),
      escaped: toEscapedForm(seq.raw, "hex"),
      type: seq.type,
      kind: seq.kind,
      name: description.name,
      meaning: description.meaning,
      support,
      count: 1,
    });
  };

  for (let i = 0; i < text.length; ) {
    const ch = text[i];

    if (ch === ESC || ch === C1_CSI) {
      const seq = scanSequence(text, i);
      if (seq) {
        let sgrNotes = [];
        if (seq.type === "CSI" && seq.final === "m") {
          sgrNotes = applySgrParams(seq.params, style);
          counts.sgr += 1;
        } else if (seq.kind === "cursor") {
          counts.cursor += 1;
        } else if (seq.kind === "erase") {
          counts.erase += 1;
        } else if (seq.kind === "osc") {
          counts.osc += 1;
        } else {
          counts.other += 1;
        }

        if (seq.type === "CSI" && seq.final !== "m") {
          const n = Math.max(1, Number(seq.params[0] || 1) || 1);
          if (seq.final === "A") row = Math.max(0, row - n);
          else if (seq.final === "B") row = ensureRow(row + n);
          else if (seq.final === "C") col = Math.min(MAX_LINE_COLUMNS, col + n);
          else if (seq.final === "D") col = Math.max(0, col - n);
          else if (seq.final === "E") { row = ensureRow(row + n); col = 0; }
          else if (seq.final === "F") { row = Math.max(0, row - n); col = 0; }
          else if (seq.final === "G") col = Math.min(MAX_LINE_COLUMNS, Math.max(0, n - 1));
          else if (seq.final === "d") row = ensureRow(Math.max(0, n - 1));
          else if (seq.final === "H" || seq.final === "f") {
            const r = Math.max(1, Number(seq.params[0] || 1) || 1);
            const c = Math.max(1, Number(seq.params[1] || 1) || 1);
            row = ensureRow(r - 1);
            col = Math.min(MAX_LINE_COLUMNS, c - 1);
          } else if (seq.final === "K") {
            const mode = Number(seq.params[0] || 0) || 0;
            const line = rows[row];
            if (mode === 0) line.length = Math.min(line.length, col);
            else if (mode === 1) for (let c = 0; c <= col && c < line.length; c += 1) line[c] = makeCell(" ", blankStyle());
            else if (mode === 2) line.length = 0;
          } else if (seq.final === "J") {
            const mode = Number(seq.params[0] || 0) || 0;
            if (mode === 0) {
              rows[row].length = Math.min(rows[row].length, col);
              rows.length = row + 1;
            } else if (mode === 1) {
              for (let r = 0; r < row; r += 1) rows[r] = [];
              for (let c = 0; c <= col && c < rows[row].length; c += 1) rows[row][c] = makeCell(" ", blankStyle());
            } else {
              rows.length = 0;
              rows.push([]);
              row = 0;
              col = 0;
            }
          } else if (seq.final === "X") {
            const line = rows[row];
            for (let c = col; c < col + n && c < line.length; c += 1) line[c] = makeCell(" ", blankStyle());
          } else if (seq.final === "s") {
            savedCursor = { row, col, style: cloneStyle(style) };
          } else if (seq.final === "u" && savedCursor) {
            row = ensureRow(savedCursor.row);
            col = savedCursor.col;
            style = cloneStyle(savedCursor.style);
          }
        } else if (seq.type === "ESCAPE") {
          if (seq.final === "7") savedCursor = { row, col, style: cloneStyle(style) };
          else if (seq.final === "8" && savedCursor) {
            row = ensureRow(savedCursor.row);
            col = savedCursor.col;
            style = cloneStyle(savedCursor.style);
          } else if (seq.final === "c") {
            style = blankStyle();
          } else if (seq.final === "M") {
            row = Math.max(0, row - 1);
          } else if (seq.final === "D" || seq.final === "E") {
            row = ensureRow(row + 1);
            if (seq.final === "E") col = 0;
          }
        } else if (seq.type === "OSC") {
          const body = seq.raw.slice(2).replace(/(\u0007|\u009C|\u001B\\)$/, "");
          if (body.startsWith("8;")) {
            const parts = body.split(";");
            const uri = parts.slice(2).join(";");
            style.link = uri || null;
          }
        }

        record(seq, describeSequence(seq, sgrNotes), sequenceSupport(seq));
        i += seq.length;
        continue;
      }
      // A lone ESC that starts nothing recognisable: drop it from the render
      // but keep it out of the stripped copy too, since it is not text.
      i += 1;
      continue;
    }

    if (ch === "\n") {
      stripped.push("\n");
      row = ensureRow(row + 1);
      col = 0;
      i += 1;
      continue;
    }
    if (ch === "\r") {
      col = 0;
      i += 1;
      continue;
    }
    if (ch === "\b") {
      col = Math.max(0, col - 1);
      stripped.push(ch);
      i += 1;
      continue;
    }
    if (ch === "\t") {
      stripped.push(ch);
      const next = Math.floor(col / TAB_WIDTH + 1) * TAB_WIDTH;
      col = Math.min(MAX_LINE_COLUMNS, next);
      i += 1;
      continue;
    }
    const code = text.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) {
      i += 1;
      continue;
    }
    stripped.push(ch);
    writeChar(ch);
    i += 1;
  }

  const lines = rows.slice(0, MAX_RENDER_LINES).map((cells) => {
    let end = cells.length;
    while (end > 0 && (cells[end - 1] === undefined || cells[end - 1].char === " ")) end -= 1;
    const segments = [];
    for (let c = 0; c < end; c += 1) {
      const cell = cells[c] || makeCell(" ", blankStyle());
      const render = toRenderStyle(cell.style);
      const last = segments[segments.length - 1];
      if (last && sameRenderStyle(last, render)) last.text += cell.char;
      else segments.push({ ...render, text: cell.char });
    }
    return segments;
  });

  const sequences = [...inventory.values()];
  const strippedText = stripAnsiCodes(text);

  return {
    lines,
    sequences,
    strippedText,
    truncatedRows,
    truncatedCols,
    stats: {
      normalisedCount,
      originalLength: text.length,
      strippedLength: strippedText.length,
      charactersRemoved: text.length - strippedText.length,
      totalSequences: sequences.reduce((sum, s) => sum + s.count, 0),
      uniqueSequences: sequences.length,
      renderedLines: lines.length,
      sgrCount: counts.sgr,
      cursorCount: counts.cursor,
      eraseCount: counts.erase,
      oscCount: counts.osc,
      otherCount: counts.other,
    },
  };
}

/**
 * Render a decode result as a plain-text report, for the copy button. Kept
 * here rather than in the view so the exact wording is testable.
 */
export function formatSequenceReport(result) {
  if (!result || result.error) return "";
  const { stats, sequences } = result;
  const head = [
    "ANSI escape sequence breakdown",
    `${stats.totalSequences} sequence${stats.totalSequences === 1 ? "" : "s"} found, ${stats.uniqueSequences} distinct`,
    `SGR ${stats.sgrCount} | cursor ${stats.cursorCount} | erase ${stats.eraseCount} | OSC ${stats.oscCount} | other ${stats.otherCount}`,
    `${stats.charactersRemoved} of ${stats.originalLength} characters were escape codes`,
    "",
  ];
  const body = sequences.map(
    (seq) =>
      `${seq.escaped}  (x${seq.count})\n    ${seq.name}\n    ${seq.meaning}\n    Support: ${SUPPORT_LABELS[seq.support]}`,
  );
  return [...head, ...body].join("\n");
}

/**
 * Remove every escape sequence and leave the printable text. Carriage returns
 * and newlines are preserved so the stripped copy still has the original line
 * structure; this is the same job `sed -r 's/\x1b\[[0-9;]*[mGKHF]//g'` is
 * usually asked to do, but over the whole ECMA-48 grammar rather than one regex.
 */
export function stripAnsiCodes(text) {
  if (typeof text !== "string") return "";
  const out = [];
  for (let i = 0; i < text.length; ) {
    const ch = text[i];
    if (ch === ESC || ch === C1_CSI) {
      const seq = scanSequence(text, i);
      if (seq) {
        i += seq.length;
        continue;
      }
      i += 1;
      continue;
    }
    const code = text.charCodeAt(i);
    if (code < 0x20 && ch !== "\n" && ch !== "\r" && ch !== "\t") {
      i += 1;
      continue;
    }
    if (code === 0x7f) {
      i += 1;
      continue;
    }
    out.push(ch);
    i += 1;
  }
  return out.join("");
}

/* ------------------------------------------------------------------ */
/* Builder                                                             */
/* ------------------------------------------------------------------ */

/** The four spellings of ESC that appear in real source code. */
export const ESCAPE_FORMS = [
  { id: "hex", literal: "\\x1b", note: "C, C++, Python, PHP, Perl, Go, Rust, Java 15+ text blocks" },
  { id: "octal", literal: "\\033", note: "C, bash printf, Python, Ruby — the oldest spelling" },
  { id: "e", literal: "\\e", note: "bash echo -e and printf, zsh, GCC/Clang extension, Ruby, Perl. Not POSIX, not valid in Go, Java or Python" },
  { id: "unicode", literal: "\\u001b", note: "JavaScript, TypeScript, Java, C#, JSON" },
];

function toEscapedForm(raw, form) {
  const map = { hex: "\\x1b", octal: "\\033", e: "\\e", unicode: "\\u001b" };
  const belMap = { hex: "\\x07", octal: "\\007", e: "\\a", unicode: "\\u0007" };
  return raw.split(ESC).join(map[form] || map.hex).split(BEL).join(belMap[form] || belMap.hex);
}

export { toEscapedForm };

function sanitiseSample(sample) {
  const raw = typeof sample === "string" ? sample : "";
  const cleaned = raw.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ").trim();
  const capped = cleaned.slice(0, MAX_SAMPLE_LENGTH);
  return capped.length > 0 ? capped : "Build failed";
}

function forDoubleQuoted(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function forSingleQuoted(s) {
  return s.split("'").join("'\\''");
}

const COLOR_MODES = ["none", "basic", "bright", "palette", "rgb"];

function colorParams(role, mode, options) {
  const fgBase = role === "fg" ? 30 : 40;
  const brightBase = role === "fg" ? 90 : 100;
  const extended = role === "fg" ? 38 : 48;
  const label = role === "fg" ? "foreground" : "background";

  if (mode === "none") return { params: [], notes: [] };

  if (mode === "basic" || mode === "bright") {
    const index = Math.round(Number(options.index));
    if (!Number.isInteger(index) || index < 0 || index > 7) {
      return { error: `${label} colour index must be a whole number from 0 to 7 (got ${options.index}).` };
    }
    const code = (mode === "basic" ? fgBase : brightBase) + index;
    const name = mode === "basic" ? BASIC_COLOR_NAMES[index] : BRIGHT_COLOR_NAMES[index];
    return { params: [String(code)], notes: [`${code}: ${label} ${colorNameLabel(name)}`], name };
  }

  if (mode === "palette") {
    const resolved = paletteIndexToColor(options.paletteIndex);
    if (resolved.error) return { error: resolved.error };
    return {
      params: [String(extended), "5", String(resolved.index)],
      notes: [`${extended};5;${resolved.index}: ${label} from the 256-colour palette (${resolved.band} band)`],
      name: resolved.name,
    };
  }

  if (mode === "rgb") {
    const channels = ["r", "g", "b"].map((k) => Math.round(Number(options[k])));
    if (!channels.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)) {
      return { error: `${label} RGB channels must each be a whole number from 0 to 255.` };
    }
    const name = rgbToNearestAnsiName(channels[0], channels[1], channels[2]);
    return {
      params: [String(extended), "2", ...channels.map(String)],
      notes: [`${extended};2;${channels.join(";")}: ${label} 24-bit colour (nearest named: ${colorNameLabel(name)})`],
      name,
    };
  }

  return { error: `Unknown colour mode "${mode}". Use one of: ${COLOR_MODES.join(", ")}.` };
}

/**
 * Build an SGR sequence from a set of chosen attributes.
 *
 * Parameter order follows the convention every ANSI library uses: attribute
 * parameters first, in ascending numeric order, then foreground, then
 * background. ECMA-48 applies parameters left to right, so any order works,
 * but ascending order is what a reader expects to see.
 */
export function buildSgrSequence(input) {
  const options = input && typeof input === "object" ? input : {};
  const attrOrder = [
    ["bold", 1, "bold"],
    ["dim", 2, "faint / dim"],
    ["italic", 3, "italic"],
    ["underline", 4, "underline"],
    ["blink", 5, "slow blink"],
    ["reverse", 7, "reverse video"],
    ["conceal", 8, "conceal"],
    ["strike", 9, "crossed out"],
  ];

  const params = [];
  const notes = [];
  for (const [key, code, label] of attrOrder) {
    if (options[key]) {
      params.push(String(code));
      notes.push(`${code}: ${label}`);
    }
  }

  const fg = colorParams("fg", options.fgMode || "none", {
    index: options.fgIndex,
    paletteIndex: options.fgPalette,
    r: options.fgR,
    g: options.fgG,
    b: options.fgB,
  });
  if (fg.error) return { error: fg.error };
  const bg = colorParams("bg", options.bgMode || "none", {
    index: options.bgIndex,
    paletteIndex: options.bgPalette,
    r: options.bgR,
    g: options.bgG,
    b: options.bgB,
  });
  if (bg.error) return { error: bg.error };

  params.push(...fg.params, ...bg.params);
  notes.push(...fg.notes, ...bg.notes);

  if (params.length === 0) {
    return { error: "Pick at least one attribute or colour — an empty CSI m is just a reset." };
  }

  const paramText = params.join(";");
  const raw = `${ESC}[${paramText}m`;
  const reset = `${ESC}[0m`;
  const sample = sanitiseSample(options.sample);

  const forms = ESCAPE_FORMS.map((form) => ({
    id: form.id,
    literal: form.literal,
    note: form.note,
    sequence: toEscapedForm(raw, form.id),
    reset: toEscapedForm(reset, form.id),
  }));

  const dq = forDoubleQuoted(sample);
  const sq = forSingleQuoted(sample);

  const snippets = [
    {
      id: "bash",
      label: "Bash",
      code: `printf '\\033[${paramText}m%s\\033[0m\\n' '${sq}'`,
      note: "printf expands \\033 inside the format string on every POSIX shell. echo -e is a bashism and prints the flag literally on dash.",
    },
    {
      id: "python",
      label: "Python",
      code: `print("\\x1b[${paramText}m${dq}\\x1b[0m")`,
      note: "Python understands \\x1b, \\033 and \\u001b in a str literal, but not \\e.",
    },
    {
      id: "node",
      label: "Node.js",
      code: `console.log("\\u001b[${paramText}m${dq}\\u001b[0m");`,
      note: "Guard with process.stdout.isTTY before colouring, or the codes end up in a redirected log file.",
    },
    {
      id: "go",
      label: "Go",
      code: `fmt.Printf("\\x1b[${paramText}m%s\\x1b[0m\\n", "${dq}")`,
      note: "Go string literals accept \\x1b and \\033 but reject \\e at compile time.",
    },
  ];

  const previewStyle = blankStyle();
  applySgrParams(params, previewStyle);

  return {
    params,
    paramText,
    raw,
    reset,
    forms,
    snippets,
    notes,
    sample,
    preview: toRenderStyle(previewStyle),
  };
}
