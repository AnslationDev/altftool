const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "123456789";

const rangeMap = (characters, firstCodePoint) =>
  Object.fromEntries(
    [...characters].map((character, index) => [
      character,
      String.fromCodePoint(firstCodePoint + index),
    ]),
  );

const caseInsensitiveRangeMap = (firstCodePoint) => {
  const lowercase = rangeMap(LOWERCASE, firstCodePoint);
  return Object.fromEntries(
    [...LOWERCASE].flatMap((character, index) => {
      const glyph = lowercase[character];
      return [
        [character, glyph],
        [UPPERCASE[index], glyph],
      ];
    }),
  );
};

export const STYLES = [
  {
    id: "circled",
    label: "Circled",
    map: {
      ...rangeMap(LOWERCASE, 0x24d0),
      ...rangeMap(UPPERCASE, 0x24b6),
      "0": String.fromCodePoint(0x24ea),
      ...rangeMap(DIGITS, 0x2460),
    },
  },
  {
    id: "filled",
    label: "Filled Circle",
    map: {
      ...caseInsensitiveRangeMap(0x1f150),
      "0": String.fromCodePoint(0x24ff),
      ...rangeMap(DIGITS, 0x2776),
    },
  },
  {
    id: "negative-squared",
    label: "Filled Square",
    map: caseInsensitiveRangeMap(0x1f170),
  },
  {
    id: "parenthesized",
    label: "Parenthesized",
    map: {
      ...caseInsensitiveRangeMap(0x1f110),
      ...rangeMap(DIGITS, 0x2474),
    },
  },
];

export function getEnclosedStyle(styleId) {
  return STYLES.find((style) => style.id === styleId) || STYLES[0];
}

export function transformEnclosedText(text, styleOrId = "circled") {
  const style =
    typeof styleOrId === "string" ? getEnclosedStyle(styleOrId) : styleOrId || STYLES[0];
  return [...String(text ?? "")]
    .map((character) => style.map[character] ?? style.map[character.toLowerCase()] ?? character)
    .join("");
}
