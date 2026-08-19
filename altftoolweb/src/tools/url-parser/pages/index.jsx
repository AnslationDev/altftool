"use client";

import TextTool from "@/tools/_shared/batch/TextTool";

const options = [];
const transform = (input) => { const s = input.trim(); if (!s) return ""; let u; try { u = new URL(s); } catch (e) { return "Invalid URL"; } const rows = [["Protocol", u.protocol], (u.username || u.password) ? ["Userinfo", u.username + (u.password ? ":" + u.password : "")] : null, ["Host", u.host], ["Hostname", u.hostname], ["Port", u.port || "(default)"], ["Path", u.pathname], ["Hash", u.hash || "(none)"]].filter(Boolean); const q = [...u.searchParams.entries()].map(([k, v]) => "  " + k + " = " + v); return rows.map(([k, v]) => k + ": " + v).join("\n") + (q.length ? "\nQuery:\n" + q.join("\n") : ""); };

export default function Page() {
  return (
    <TextTool title={"URL Parser"} description={"Break a URL into its protocol, host, path, query and hash parts."} sample={"https://user:pw@example.com:8080/path/page?x=1&y=2#top"} options={options} transform={transform} />
  );
}
