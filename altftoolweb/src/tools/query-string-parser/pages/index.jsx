"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [];
const transform = (input) => { const s = input.trim().replace(/^\?/, ""); if (!s) return ""; const params = new URLSearchParams(s); const lines = [...params.entries()].map(([k, v]) => k + " = " + v); return lines.join("\n"); };

export default function Page() {
  return (
    <TextTool title={"Query String Parser"} description={"Turn a URL query string into a readable list of key/value pairs."} sample={"?name=Ada&role=dev&tags=a,b,c"} options={options} transform={transform} />
  );
}
