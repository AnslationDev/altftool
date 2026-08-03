export function generateZalgoText(
  input,
  {
    upCount = 0,
    midCount = 0,
    downCount = 0,
    upMarks = [],
    midMarks = [],
    downMarks = [],
    random = Math.random,
  } = {},
) {
  const pick = (marks) => marks[Math.floor(random() * marks.length)] || "";
  let output = "";

  for (const character of String(input || "")) {
    output += character;
    if (/\s/u.test(character)) continue;
    for (let index = 0; index < upCount; index += 1) output += pick(upMarks);
    for (let index = 0; index < midCount; index += 1) output += pick(midMarks);
    for (let index = 0; index < downCount; index += 1) output += pick(downMarks);
  }

  return output;
}

export default generateZalgoText;
