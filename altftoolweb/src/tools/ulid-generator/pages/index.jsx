"use client";

import GeneratorTool from "@/tools/_shared/batch/GeneratorTool";

const generate = () => { const A = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; const enc = (num, len) => { let s = ""; for (let i = len - 1; i >= 0; i--) { s = A[num % 32] + s; num = Math.floor(num / 32); } return s; }; const make = () => { const t = enc(Date.now(), 10); let r = ""; for (let i = 0; i < 16; i++) r += A[Math.floor(Math.random() * 32)]; return t + r; }; return { list: Array.from({ length: 5 }, make), caption: "26-char, time-sortable" }; };

export default function Page() {
  return (
    <GeneratorTool title={"ULID Generator"} description={"Generate sortable, unique ULIDs as an alternative to UUIDs."} buttonLabel={"New ULIDs"} generate={generate} />
  );
}
