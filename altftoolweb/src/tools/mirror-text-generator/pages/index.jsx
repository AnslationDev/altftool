"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [];
const transform = (input) => input.split("").reverse().join("");

export default function Page() {
  return (
    <TextTool title={"Mirror Text Generator"} description={"Reverse your text so it reads backwards, character by character."} sample={"Hello world"} options={options} transform={transform} />
  );
}
