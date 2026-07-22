"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [{"key":"find","label":"Find","type":"text","default":"cats"},{"key":"rep","label":"Replace","type":"text","default":"dogs"},{"key":"re","label":"Regex","type":"toggle","default":false},{"key":"ci","label":"Ignore case","type":"toggle","default":false}];
const transform = (input, o) => { if (!o.find) return input; try { const flags = "g" + (o.ci ? "i" : ""); const pat = o.re ? o.find : o.find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); return input.replace(new RegExp(pat, flags), o.rep); } catch (e) { return "Invalid regex: " + e.message; } };

export default function Page() {
  return (
    <TextTool title={"Find and Replace Tool"} description={"Replace text in bulk, with optional regex and case-insensitive matching."} sample={"cats are great, cats are cute"} options={options} transform={transform} />
  );
}
