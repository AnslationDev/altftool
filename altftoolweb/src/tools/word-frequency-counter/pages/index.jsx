"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [];
const transform = (input) => { const words = input.toLowerCase().match(/[a-z0-9']+/g) || []; const map = {}; for (const w of words) map[w] = (map[w] || 0) + 1; return Object.entries(map).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([w, c]) => c + "\t" + w).join("\n"); };

export default function Page() {
  return (
    <TextTool title={"Word Frequency Counter"} description={"Count how often each word appears, sorted from most to least frequent."} sample={"the cat sat on the mat the cat ran"} options={options} transform={transform} />
  );
}
