export const meta = {
  name: 'build-tools-wave-500',
  description: 'Build a 500-tool wave: 50 agents x 10 tools, pure logic split from UI, GEO-ready SEO',
  phases: [{ title: 'Build', detail: '50 agents, 10 tools each, one tool at a time' }],
}

const WEB = '/Users/niki/knworkspace/kn1/altftool/altftoolweb'

const CATEGORIES = `"AI Tools", "PDF & Documents", "Image & Photo", "Video & Audio", "Text & Writing", "Converters", "Generators", "Calculators", "Finance Calculators", "Health Calculators", "Health & Fitness", "Developer", "Design & Color", "Marketing & Social", "Security & Privacy", "Education & Science", "Productivity", "Business", "Lifestyle", "Fun", "Games", "Other"`

const SPEC = `HOW AN ALTFTOOL TOOL IS BUILT — five files per tool. Study ${WEB}/src/tools/car-loan-emi-calculator/ first; it is a recent tool built to this spec.

FILE 1 — ${WEB}/src/tools/<slug>/tool.config.js
  const toolConfig = { slug: "<slug>", name: "<Name>", category: ["<Canonical Category>"], description: "<one line, <=150 chars>", icon: "<lucide-kebab-name>", iconColor: "text-(--primary)" };
  export default toolConfig;
  category MUST be EXACTLY one of: ${CATEGORIES}
  Note the ampersands — "Text & Writing" NOT "Text and Writing". An unknown category FAILS the build.

FILE 2 — ${WEB}/src/tools/<slug>/entry.jsx
  "use client";
  import ToolHome from "./pages";
  export default function ToolEntry() { return <ToolHome />; }

FILE 3 — ${WEB}/src/tools/<slug>/lib.js  ← THE LOGIC LIVES HERE, NOT IN THE COMPONENT
  Plain JS module. NO React, NO JSX, NO DOM. Named exports only.
  Export the constants (rates, limits, slabs, tables) and the pure function(s) that do the work,
  e.g. export function computeEmi({ principal, annualRate, months }) { ... returns a plain object }
  Rules:
   - Real formulas and real statutory rules. No stubs, no placeholder numbers, no fake results.
   - Total functions: never return NaN or Infinity. Guard divide-by-zero, negative and empty input.
     Return { error: "<plain-language reason>" } for invalid input instead of a bad number.
   - Pure: same input -> same output. No Date.now() inside the maths; take dates as arguments.
   - Every magic number gets a named constant with a comment saying where the rule comes from.
  THEN TEST IT. From ${WEB} run node against your own lib and check at least 4 cases —
  a typical case, both edges of any threshold, and one absurd input (0, negative, huge):
    node --input-type=module -e "import {fn} from './src/tools/<slug>/lib.js'; console.log(fn({...}))"
  Derive the expected answer YOURSELF from the rule first, then confirm the code matches it.
  If they disagree, the code is wrong — fix it, do not adjust your expectation.

FILE 4 — ${WEB}/src/tools/<slug>/pages/index.jsx  ← UI ONLY
  "use client"; default export a React component (React 19 + Tailwind v4).
  It imports from "../lib" and contains NO business arithmetic of its own.
   - Controlled inputs, every one with a <label htmlFor> tied to the input id.
   - Sensible defaults so a real result is on screen at first paint.
   - Result panel: rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 — one big primary
     number plus a <dl> breakdown of the supporting figures.
   - A copy-result button using navigator.clipboard with a "Copied!" state and an aria-label, and a reset button.
   - lib returning { error } => render it in bg-[var(--danger-soft)] text-[var(--danger)] rounded-md
     px-3 py-2 with role="alert", and BLANK the result figures (show an em dash) — never leave a
     stale or zero number looking like a real answer next to an error.
   - Inputs: h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none
   - Buttons: bg-[var(--primary)] text-[var(--primary-foreground)] min-h-11 active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35
   - MOBILE FIRST: single column at 375px, "grid gap-4 sm:grid-cols-2" for input pairs, no fixed
     width above 375px, tap targets >= 44px. Wide tables go in an overflow-x-auto wrapper so the
     PAGE never scrolls sideways.
   - COLOURS: semantic tokens only — var(--primary), var(--card), var(--border), var(--foreground),
     var(--muted-foreground), var(--danger), var(--success). ZERO raw hex or rgb. Works in light AND dark.
   - Format with Intl.NumberFormat. Indian money => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).
   - HOOK RULES: never read a ref (.current) inside a state updater or during render — the linter
     rejects it. Derive ids from existing state instead.

FILE 5 — ${WEB}/src/tools/<slug>/seo.js  ← this tool's OWN SEO file. Never edit a shared content file.
  const seo = {
    intro: "<2-3 sentences. Open by DEFINING what the tool computes in one quotable sentence, then who it is for and what they get. Name the actual formula, rule or standard used.>",
    useCases: ["<specific scenario>", "<specific scenario>", "<specific scenario>"],
    benefits: [["<Title>", "<one line>"], ["<Title>", "<one line>"], ["<Title>", "<one line>"]],
    faqs: [["<question>", "<answer>"], ... 4 total],
  };
  export default seo;
  Write for search engines AND for AI answer engines (GEO). That means:
   - Each FAQ question is phrased the way a person actually types or asks it.
   - Each FAQ answer leads with the direct answer in the first sentence, then one or two
     sentences of support. Include the concrete number, rate, limit or threshold where one exists.
   - Be specific and verifiable — real limits and rates, not vague copy. A wrong figure is worse
     than none. If you are unsure of a current rate, describe the rule instead of inventing a number.
   - No marketing filler, no "in today's fast-paced world", no repetition of the tool name in
     every sentence, no invented statistics.
   - Never give legal, tax or medical advice — frame it as informational and say when to consult a professional.`

const RULES = `PROCESS — build the tools ONE AT A TIME, fully finishing each before starting the next.

After each tool, parse-check all five files. From ${WEB}:
  node -e "require('@babel/parser').parse(require('fs').readFileSync('<file>','utf8'),{sourceType:'module',plugins:['jsx']})"
And run your lib.js numeric checks as described above. A tool is not done until its maths is confirmed.

Also self-check before moving on:
  - grep your files for raw colours: there must be no #rrggbb and no rgb(.
  - confirm every lucide icon you import actually exists in the installed lucide-react.
  - confirm pages/index.jsx has no arithmetic that belongs in lib.js.

DO NOT: run builds, start dev servers, commit, or touch generated files
(toolMetaMap.js, toolRuntimeMap.js, src/app/tools/generated/*, toolContentOverrides.js) or any
other shared file. Another session is working in this repo at the same time — stay strictly inside
your own src/tools/<slug>/ directories.

If a tool would need a paid API, a server, or a library not already in ${WEB}/package.json, SKIP it
and say why — never invent a dependency.
Check ${WEB}/src/tools/<slug> does not already exist; if it does, SKIP it and do not overwrite.`

phase('Build')

// The wave list is passed by PATH, not inline: 500 tools is ~100 KB of JSON and
// every agent only needs its own ten. Each agent reads its slice from the file.
const input = typeof args === 'string' ? JSON.parse(args) : args || {}
const waveFile = input.waveFile
const total = Number(input.total) || 0
const PER_AGENT = Number(input.perAgent) || 10

if (!waveFile || !total) {
  log('ERROR: expected args { waveFile, total, perAgent }')
  return { error: 'missing waveFile/total' }
}

const groups = []
for (let start = 0; start < total; start += PER_AGENT) {
  groups.push({ start, end: Math.min(start + PER_AGENT, total) })
}
log(`wave: ${total} tools -> ${groups.length} agents x ${PER_AGENT}`)

const reports = await parallel(
  groups.map(({ start, end }, gi) => () =>
    agent(
      `Your work list is in the JSON array at ${waveFile}. Read ONLY entries at index ${start} through ${end - 1} (0-based, ${end - start} tools) — for example:\n` +
        `  node -e "console.log(JSON.stringify(require('${waveFile}').slice(${start},${end}),null,1))"\n` +
        `Each entry has { slug, name, category, desc, sub }. Build those ${end - start} tools, one at a time, completely. Ignore every other entry in the file.\n\n` +
        `${SPEC}\n\n${RULES}\n\nReturn a compact report, one block per slug: built or skipped (+reason) | the rule/formula implemented | the numeric case you verified (inputs -> output) | parse-check result.`,
      { label: `build:${start}-${end - 1}`, phase: 'Build', effort: 'high' },
    ),
  ),
)

return { agents: groups.length, total, reports: reports.filter(Boolean) }
