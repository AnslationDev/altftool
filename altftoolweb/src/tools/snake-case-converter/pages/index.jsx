"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [];
const transform = (input) => input.trim().split(/[^a-zA-Z0-9]+/).filter(Boolean).map((p) => p.toLowerCase()).join("_");

export default function Page() {
  return (
    <TextTool title={"Snake Case Converter"} description={"Convert any phrase into snake_case."} sample={"My Variable Name Here"} options={options} transform={transform} />
  );
}
