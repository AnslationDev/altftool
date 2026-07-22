"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [{"key":"mode","label":"Mode","type":"select","default":"escape","choices":[{"value":"escape","label":"Escape"},{"value":"unescape","label":"Unescape"}]}];
const transform = (input, o) => { if (o.mode === "escape") return input.split("").map((ch) => { const code = ch.charCodeAt(0); return code > 127 ? "\\u" + code.toString(16).padStart(4, "0") : ch; }).join(""); return input.replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16))); };

export default function Page() {
  return (
    <TextTool title={"Unicode Escape Tool"} description={"Escape text to \\uXXXX sequences or unescape them back to characters."} sample={"Café ☕"} options={options} transform={transform} />
  );
}
