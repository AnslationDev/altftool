"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clipboard, Sparkles } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const maps = {
  bold: ["𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇", "𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭"],
  italic: ["𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻", "𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡"],
  script: ["𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏", "𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵"],
  monospace: ["𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣", "𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉"],
};

function transform(text, style) {
  if (style === "wide") return Array.from(text).join(" ");
  if (style === "bubble") return text.replace(/[a-z]/gi, (char) => `${char}\u20dd`);
  const [lower, upper] = maps[style].map((letters) => Array.from(letters));
  return text.replace(/[a-z]/gi, (char) => {
    const index = char.toLowerCase().charCodeAt(0) - 97;
    return char === char.toUpperCase() ? upper[index] : lower[index];
  });
}

export default function ToolHome() {
  const [text, setText] = useState("AltFTool");
  const [copied, setCopied] = useState("");
  const copiedTimeoutRef = useRef(null);

  useEffect(() => () => clearTimeout(copiedTimeoutRef.current), []);

  const variants = useMemo(
    () => [
      ["Bold", transform(text, "bold")],
      ["Italic", transform(text, "italic")],
      ["Script", transform(text, "script")],
      ["Monospace", transform(text, "monospace")],
      ["Wide", transform(text, "wide")],
      ["Bubble", transform(text, "bubble")],
    ],
    [text],
  );

  const copyValue = async (label, value) => {
    setCopied((await safeCopyText(value)) ? label : "");
    clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => setCopied(""), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Sparkles className="h-4 w-4" />
            Unicode styles
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Fancy Text Generator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Create stylish Unicode text variants for social bios, usernames, titles, and posts.
          </p>
        </section>

        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <label className="block">
            <span className="text-sm font-semibold">Text</span>
            <input value={text} onChange={(event) => setText(event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-lg outline-none focus:border-[var(--primary)]" />
          </label>
          {copied && (
            <p role="status" className="mt-3 text-sm font-semibold text-[var(--success-text)]">
              {copied} copied
            </p>
          )}
        </section>

        <section className="tool-card-grid">
          {variants.map(([label, value]) => (
            <div key={label} className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase text-[var(--muted-foreground)]">{label}</h2>
                <button type="button" onClick={() => copyValue(label, value)} className="btn-secondary min-h-10 px-3 py-2">
                  <Clipboard className="h-4 w-4" />
                  Copy
                </button>
              </div>
              <p className="break-all text-xl leading-9 sm:text-2xl sm:leading-10">{value}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
