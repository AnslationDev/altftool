"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [];
const transform = (input) => input.replace(/\t/g, " ").split("\n").map((l) => l.trim()).filter((l) => l.length).join("\n");

export default function Page() {
  return (
    <TextTool title={"Whitespace Cleaner"} description={"Trim each line, convert tabs to spaces and drop blank lines."} sample={"  padded line  \n\n\ttabbed line\n\n"} options={options} transform={transform} />
  );
}
