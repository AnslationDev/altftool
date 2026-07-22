"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [{"key":"order","label":"Order","type":"select","default":"asc","choices":[{"value":"asc","label":"A → Z"},{"value":"desc","label":"Z → A"}]},{"key":"ci","label":"Ignore case","type":"toggle","default":true}];
const transform = (input, o) => { const lines = input.split("\n").filter((l) => l.length); lines.sort((a, b) => (o.ci ? a.toLowerCase() : a).localeCompare(o.ci ? b.toLowerCase() : b)); if (o.order === "desc") lines.reverse(); return lines.join("\n"); };

export default function Page() {
  return (
    <TextTool title={"Sort Lines Tool"} description={"Sort lines alphabetically, ascending or descending."} sample={"banana\napple\ncherry\ndate"} options={options} transform={transform} />
  );
}
