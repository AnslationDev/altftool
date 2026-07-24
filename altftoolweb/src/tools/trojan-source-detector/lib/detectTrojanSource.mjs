export const MAX_SOURCE_CHARACTERS = 1_000_000;
export const MAX_SOURCE_FINDINGS = 300;

const BIDI_CONTROLS = new Map([
  [0x061c, ["ARABIC LETTER MARK", "medium"]],
  [0x200e, ["LEFT-TO-RIGHT MARK", "medium"]],
  [0x200f, ["RIGHT-TO-LEFT MARK", "medium"]],
  [0x202a, ["LEFT-TO-RIGHT EMBEDDING", "high"]],
  [0x202b, ["RIGHT-TO-LEFT EMBEDDING", "high"]],
  [0x202c, ["POP DIRECTIONAL FORMATTING", "high"]],
  [0x202d, ["LEFT-TO-RIGHT OVERRIDE", "high"]],
  [0x202e, ["RIGHT-TO-LEFT OVERRIDE", "high"]],
  [0x2066, ["LEFT-TO-RIGHT ISOLATE", "high"]],
  [0x2067, ["RIGHT-TO-LEFT ISOLATE", "high"]],
  [0x2068, ["FIRST STRONG ISOLATE", "high"]],
  [0x2069, ["POP DIRECTIONAL ISOLATE", "high"]],
]);

const INVISIBLE_CONTROLS = new Map([
  [0x00ad, "SOFT HYPHEN"],
  [0x034f, "COMBINING GRAPHEME JOINER"],
  [0x180e, "MONGOLIAN VOWEL SEPARATOR"],
  [0x200b, "ZERO WIDTH SPACE"],
  [0x200c, "ZERO WIDTH NON-JOINER"],
  [0x200d, "ZERO WIDTH JOINER"],
  [0x2060, "WORD JOINER"],
  [0xfeff, "ZERO WIDTH NO-BREAK SPACE"],
]);

const CONFUSABLE_TO_LATIN = new Map([
  ["Α", "A"],
  ["Β", "B"],
  ["Ε", "E"],
  ["Ζ", "Z"],
  ["Η", "H"],
  ["Ι", "I"],
  ["Κ", "K"],
  ["Μ", "M"],
  ["Ν", "N"],
  ["Ο", "O"],
  ["Ρ", "P"],
  ["Τ", "T"],
  ["Υ", "Y"],
  ["Χ", "X"],
  ["а", "a"],
  ["с", "c"],
  ["е", "e"],
  ["і", "i"],
  ["ј", "j"],
  ["о", "o"],
  ["р", "p"],
  ["ѕ", "s"],
  ["х", "x"],
  ["у", "y"],
  ["А", "A"],
  ["В", "B"],
  ["Е", "E"],
  ["К", "K"],
  ["М", "M"],
  ["Н", "H"],
  ["О", "O"],
  ["Р", "P"],
  ["С", "C"],
  ["Т", "T"],
  ["Х", "X"],
]);

function normalizeText(value) {
  return typeof value === "string"
    ? value.replace(/\r\n?/g, "\n")
    : String(value ?? "");
}

function hexCodePoint(codePoint) {
  return `U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;
}

function buildLineStarts(text) {
  const starts = [0];
  for (let index = 0; index < text.length; index += 1) {
    if (text.charCodeAt(index) === 0x0a) starts.push(index + 1);
  }
  return starts;
}

function locationAt(lineStarts, index) {
  let low = 0;
  let high = lineStarts.length;
  while (low + 1 < high) {
    const middle = Math.floor((low + high) / 2);
    if (lineStarts[middle] <= index) low = middle;
    else high = middle;
  }
  return { line: low + 1, column: index - lineStarts[low] + 1 };
}

function scriptOf(character) {
  if (/\p{Script=Latin}/u.test(character)) return "Latin";
  if (/\p{Script=Cyrillic}/u.test(character)) return "Cyrillic";
  if (/\p{Script=Greek}/u.test(character)) return "Greek";
  if (/\p{Script=Hebrew}/u.test(character)) return "Hebrew";
  if (/\p{Script=Arabic}/u.test(character)) return "Arabic";
  if (/\p{Script=Devanagari}/u.test(character)) return "Devanagari";
  if (/\p{Script=Han}/u.test(character)) return "Han";
  if (/\p{Script=Hiragana}/u.test(character)) return "Hiragana";
  if (/\p{Script=Katakana}/u.test(character)) return "Katakana";
  if (/\p{Script=Hangul}/u.test(character)) return "Hangul";
  return "";
}

function identifierScripts(identifier) {
  return [...new Set([...identifier].map(scriptOf).filter(Boolean))];
}

function escapedIdentifier(identifier) {
  return [...identifier]
    .map((character) => {
      const codePoint = character.codePointAt(0);
      return codePoint > 0x7f
        ? `\\u{${codePoint.toString(16).toUpperCase()}}`
        : character;
    })
    .join("");
}

function confusableSkeleton(identifier) {
  return [...identifier]
    .map((character) => CONFUSABLE_TO_LATIN.get(character) ?? character)
    .join("");
}

export function makeControlsVisible(value) {
  return [...normalizeText(value)]
    .map((character) => {
      const codePoint = character.codePointAt(0);
      if (BIDI_CONTROLS.has(codePoint) || INVISIBLE_CONTROLS.has(codePoint)) {
        return `\\u{${codePoint.toString(16).toUpperCase()}}`;
      }
      return character;
    })
    .join("");
}

export function detectTrojanSource(value) {
  const text = normalizeText(value);
  if (text.length > MAX_SOURCE_CHARACTERS) {
    return {
      ok: false,
      error: `Source exceeds the ${MAX_SOURCE_CHARACTERS.toLocaleString("en-US")}-character limit.`,
      findings: [],
    };
  }

  const findings = [];
  const counts = { high: 0, medium: 0 };
  let truncated = false;
  const record = (severity, buildFinding) => {
    counts[severity] += 1;
    if (findings.length < MAX_SOURCE_FINDINGS) {
      findings.push(buildFinding());
      return;
    }
    truncated = true;
    if (severity !== "high") return;
    const replaceIndex = findings.findIndex(
      (finding) => finding.severity !== "high",
    );
    if (replaceIndex >= 0) findings[replaceIndex] = buildFinding();
  };
  const lineStarts = buildLineStarts(text);

  let index = 0;
  for (const character of text) {
    const codePoint = character.codePointAt(0);
    const bidi = BIDI_CONTROLS.get(codePoint);
    const invisible = INVISIBLE_CONTROLS.get(codePoint);
    if (bidi) {
      record(bidi[1], () => ({
          id: "bidi-control",
          title: bidi[0],
          severity: bidi[1],
          category: "Bidirectional control",
          codePoint: hexCodePoint(codePoint),
          ...locationAt(lineStarts, index),
          evidence: `\\u{${codePoint.toString(16).toUpperCase()}}`,
          explanation:
            "This formatting control can change visual ordering without changing the underlying source sequence.",
        }));
    } else if (invisible) {
      record("medium", () => ({
          id: "invisible-control",
          title: invisible,
          severity: "medium",
          category: "Invisible character",
          codePoint: hexCodePoint(codePoint),
          ...locationAt(lineStarts, index),
          evidence: `\\u{${codePoint.toString(16).toUpperCase()}}`,
          explanation:
            "This normally invisible character can make identifiers or source text differ from what a reviewer sees.",
        }));
    }
    index += character.length;
  }

  const identifierPattern = /[\p{L}_$][\p{L}\p{N}\p{M}_$]*/gu;
  for (const match of text.matchAll(identifierPattern)) {
    const identifier = match[0];
    const scripts = identifierScripts(identifier);
    const suspiciousMix =
      scripts.includes("Latin") &&
      (scripts.includes("Cyrillic") || scripts.includes("Greek"));
    if (!suspiciousMix) continue;
    const mapped = [...identifier].some((character) =>
      CONFUSABLE_TO_LATIN.has(character),
    );
    const severity = mapped ? "high" : "medium";
    record(severity, () => ({
        id: "mixed-script-identifier",
        title: "Mixed-script identifier",
        severity,
        category: "Identifier deception",
        scripts,
        ...locationAt(lineStarts, match.index ?? 0),
        evidence: escapedIdentifier(identifier),
        skeleton: confusableSkeleton(identifier),
        explanation:
          "This identifier mixes Latin with Greek or Cyrillic characters. Similar-looking letters can make two different identifiers appear alike.",
      }));
  }

  findings.sort(
    (left, right) =>
      left.line - right.line ||
      left.column - right.column ||
      left.id.localeCompare(right.id),
  );
  return {
    ok: true,
    findings,
    counts,
    characterCount: text.length,
    truncated,
    visibleSource: makeControlsVisible(text),
    level: counts.high > 0 ? "high" : counts.medium > 0 ? "review" : "none",
  };
}

export function buildTrojanSourceReport(result) {
  const totalFindings = result.counts.high + result.counts.medium;
  const lines = [
    "Trojan Source Scan",
    `Characters scanned: ${result.characterCount}`,
    `Findings observed: ${totalFindings}`,
    `Findings retained for review: ${result.findings.length}`,
    `High: ${result.counts.high}`,
    `Review: ${result.counts.medium}`,
    "",
  ];
  if (result.truncated) {
    lines.push(
      `INCOMPLETE DISPLAY: only ${result.findings.length} priority-retained findings are listed below.`,
      "",
    );
  }
  for (const [index, finding] of result.findings.entries()) {
    lines.push(
      `${index + 1}. ${finding.title} (${finding.severity})`,
      `Line ${finding.line}, column ${finding.column}`,
      `Visible notation: ${finding.evidence}`,
      finding.scripts
        ? `Scripts: ${finding.scripts.join(", ")}`
        : `Code point: ${finding.codePoint}`,
      "",
    );
  }
  lines.push(
    "This is a focused heuristic inspection, not a complete implementation of every Unicode security profile.",
  );
  return lines.join("\n");
}
