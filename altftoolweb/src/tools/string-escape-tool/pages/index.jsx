"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [{"key":"mode","label":"Mode","type":"select","default":"escape","choices":[{"value":"escape","label":"Escape"},{"value":"unescape","label":"Unescape"}]}];
const transform = (input, o) => { if (o.mode === "escape") return JSON.stringify(input).slice(1, -1); try { return JSON.parse('"' + input.replace(/"/g, '\\"') + '"'); } catch (e) { return "Invalid escaped string"; } };

export default function Page() {
  return (
    <TextTool title={"String Escape Tool"} description={"Escape a string for JSON/code (quotes, backslashes, newlines) or unescape it."} sample={"He said \"hi\"\nnext line"} options={options} transform={transform} />
  );
}
