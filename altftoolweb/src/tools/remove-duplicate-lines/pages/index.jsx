"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [{"key":"ci","label":"Ignore case","type":"toggle","default":false}];
const transform = (input, o) => { const seen = new Set(); const out = []; for (const line of input.split("\n")) { const key = o.ci ? line.toLowerCase() : line; if (!seen.has(key)) { seen.add(key); out.push(line); } } return out.join("\n"); };

export default function Page() {
  return (
    <TextTool title={"Remove Duplicate Lines"} description={"Delete repeated lines and keep only the first occurrence of each."} sample={"apple\nbanana\napple\ncherry\nbanana"} options={options} transform={transform} />
  );
}
