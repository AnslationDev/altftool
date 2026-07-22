"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [];
const transform = (input) => input.split("\n").map((l) => l.replace(/[ \t]+/g, " ").trim()).join("\n");

export default function Page() {
  return (
    <TextTool title={"Remove Extra Spaces"} description={"Collapse multiple spaces and trim each line down to single spacing."} sample={"This   has    too   many    spaces."} options={options} transform={transform} />
  );
}
