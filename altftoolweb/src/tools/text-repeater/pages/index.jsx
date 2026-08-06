"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [{"key":"times","label":"Times","type":"number","default":5},{"key":"sep","label":"Separator","type":"select","default":"\n","choices":[{"value":"\n","label":"New line"},{"value":" ","label":"Space"},{"value":", ","label":"Comma"},{"value":"","label":"None"}]}];
const transform = (input, o) => {
  const raw = Number(o.times);
  // Floor to an integer before it reaches Array(n) — a non-integer length
  // (e.g. a typed "2.5") throws RangeError instead of being clamped.
  const n = Number.isFinite(raw) ? Math.max(0, Math.min(10000, Math.floor(raw))) : 0;
  return input ? Array(n).fill(input).join(o.sep) : "";
};

export default function Page() {
  return (
    <TextTool
      title={"Text Repeater"}
      description={"Repeat any text as many times as you like, with your choice of separator."}
      sample={"hello"}
      options={options}
      transform={transform}
      confirmClear="Clear the input text? This cannot be undone."
    />
  );
}
