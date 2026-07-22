"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [{"key":"times","label":"Times","type":"number","default":5},{"key":"sep","label":"Separator","type":"select","default":"\n","choices":[{"value":"\n","label":"New line"},{"value":" ","label":"Space"},{"value":", ","label":"Comma"},{"value":"","label":"None"}]}];
const transform = (input, o) => { const n = Math.max(0, Math.min(10000, Number(o.times) || 0)); return input ? Array(n).fill(input).join(o.sep) : ""; };

export default function Page() {
  return (
    <TextTool title={"Text Repeater"} description={"Repeat any text as many times as you like, with your choice of separator."} sample={"hello"} options={options} transform={transform} />
  );
}
