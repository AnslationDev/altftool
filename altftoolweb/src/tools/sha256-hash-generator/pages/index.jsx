"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [];
const transform = async (input) => { const data = new TextEncoder().encode(input); const buf = await crypto.subtle.digest("SHA-256", data); return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join(""); };

export default function Page() {
  return (
    <TextTool title={"SHA-256 Hash Generator"} description={"Generate a SHA-256 hash of any text, computed securely in your browser."} sample={"hello world"} options={options} transform={transform} />
  );
}
