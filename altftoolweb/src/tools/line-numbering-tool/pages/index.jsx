"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [{"key":"start","label":"Start at","type":"number","default":1}];
const transform = (input, o) => { let n = Number(o.start) || 0; return input.split("\n").map((l) => (n++) + ". " + l).join("\n"); };

export default function Page() {
  return (
    <TextTool title={"Line Numbering Tool"} description={"Add sequential line numbers to every line of your text."} sample={"first\nsecond\nthird"} options={options} transform={transform} />
  );
}
