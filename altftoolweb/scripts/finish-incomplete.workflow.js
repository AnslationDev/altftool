export const meta = {
  name: 'finish-incomplete-tools',
  description: 'Finish half-built tools: add the missing lib.js / pages / seo.js and fix non-canonical categories',
  phases: [{ title: 'Finish', detail: '14 agents, ~10 tools each' }],
}

const WEB = '/Users/niki/knworkspace/kn1/altftool/altftoolweb'

const CATEGORIES = `"AI Tools", "PDF & Documents", "Image & Photo", "Video & Audio", "Text & Writing", "Converters", "Generators", "Calculators", "Finance Calculators", "Health Calculators", "Health & Fitness", "Developer", "Design & Color", "Marketing & Social", "Security & Privacy", "Education & Science", "Productivity", "Business", "Lifestyle", "Fun", "Games", "Other"`

const SPEC = `These tools are HALF-BUILT. Each already has a tool.config.js (and sometimes entry.jsx) but is missing the files that make it work, so the route is currently dead. Finish each one.

Read the existing tool.config.js first — its name and description tell you what the tool is meant to do. Honour that intent; do not redefine the tool.

FIX THE CATEGORY IF IT IS INVALID. category MUST be EXACTLY one of:
${CATEGORIES}
Values like "Design", "Photo", "Web", "Game", "Food", "Accessibility", "Creators", "Neuroscience" or "Visual Experiments" are NOT valid and fail the build — map them to the closest canonical one ("Design" -> "Design & Color", "Photo" -> "Image & Photo", "Game" -> "Games", "Web"/"Accessibility" -> "Developer", "Food"/"Creators" -> "Lifestyle", "Neuroscience"/"Visual Experiments" -> "Education & Science"). If tool.config.js has no category at all, add one.

Create whichever of these are missing:

entry.jsx
  "use client";
  import ToolHome from "./pages";
  export default function ToolEntry() { return <ToolHome />; }

lib.js  ← ALL the logic. Plain JS, no React, no JSX, no DOM. Named exports.
  Export the constants (rates, limits, tables) and pure function(s) that do the work.
  - Real formulas and real rules. No stubs, no placeholder numbers.
  - Total functions: never return NaN or Infinity. Guard divide-by-zero, negative and
    empty input; return { error: "<plain-language reason>" } instead of a bad number.
  - Pure: same input -> same output. No Date.now() inside the maths; take dates as arguments.
  - Every magic number gets a named constant with a comment saying where the rule comes from.
  THEN TEST IT from ${WEB}:
    node --input-type=module -e "import {fn} from './src/tools/<slug>/lib.js'; console.log(fn({...}))"
  Check at least 4 cases: typical, both edges of any threshold, and one absurd input.
  Derive the expected answer from the rule FIRST, then confirm the code matches it.

pages/index.jsx  ← UI ONLY, imports from "../lib", no business arithmetic of its own.
  - "use client"; default export a React component (React 19 + Tailwind v4).
  - Controlled inputs, each with a <label htmlFor> tied to the input id.
  - Sensible defaults so a real result is on screen at first paint.
  - Result panel: rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5 — one big
    primary number plus a <dl> breakdown.
  - Copy-result button (navigator.clipboard) with a "Copied!" state and aria-label, plus reset.
  - lib returning { error } => render it in bg-[var(--danger-soft)] text-[var(--danger)]
    rounded-md px-3 py-2 with role="alert", and BLANK the figures (em dash) — never leave a
    stale or zero number looking like a real answer next to an error.
  - Inputs: h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none
  - Buttons: bg-[var(--primary)] text-[var(--primary-foreground)] min-h-11 active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35
  - MOBILE FIRST: single column at 375px, "grid gap-4 sm:grid-cols-2" for input pairs, tap
    targets >= 44px, wide tables inside overflow-x-auto so the PAGE never scrolls sideways.
  - COLOURS: semantic tokens only — var(--primary), var(--card), var(--border), var(--foreground),
    var(--muted-foreground), var(--danger), var(--success). ZERO raw hex or rgb. Light AND dark.
  - Intl.NumberFormat for numbers; Indian money => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).
  - HOOK RULES: never read a ref (.current) inside a state updater or during render.

seo.js
  const seo = {
    intro: "<2-3 sentences. Open by DEFINING what the tool computes in one quotable sentence, then who it is for. Name the actual formula, rule or standard used.>",
    useCases: ["<specific scenario>", "<specific scenario>", "<specific scenario>"],
    benefits: [["<Title>", "<one line>"], ["<Title>", "<one line>"], ["<Title>", "<one line>"]],
    faqs: [["<question>", "<answer>"], ... 4 total],
  };
  export default seo;
  Written for search AND for AI answer engines: each FAQ question phrased the way a person
  actually asks it, each answer LEADING with the direct answer plus the concrete number, rate
  or limit, then one or two sentences of support. Real figures only — a wrong number is worse
  than none. No marketing filler, no invented statistics, no legal/tax/medical advice.`

const RULES = `PROCESS — finish the tools ONE AT A TIME, fully completing each before starting the next.

After each tool, parse-check every file you wrote. From ${WEB}:
  node -e "require('@babel/parser').parse(require('fs').readFileSync('<file>','utf8'),{sourceType:'module',plugins:['jsx']})"
And run the lib.js numeric checks. A tool is not done until its maths is confirmed.

Self-check before moving on:
  - grep your files for raw colours: no #rrggbb, no rgb(.
  - confirm every lucide icon you import exists in the installed lucide-react.
  - confirm pages/index.jsx holds no arithmetic that belongs in lib.js.
  - confirm the category in tool.config.js is on the canonical list above.

DO NOT: run builds, start dev servers, commit, or touch generated files (toolMetaMap.js,
toolRuntimeMap.js, src/app/tools/generated/*, toolContentOverrides.js) or any other shared
file. Another session works in this repo — stay strictly inside your own src/tools/<slug>/.

If a tool genuinely needs a paid API, a server, or a library not already in ${WEB}/package.json,
say so and leave it alone rather than inventing a dependency. If the existing tool.config.js
describes something impossible client-side, say which and why.`

phase('Finish')

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
log(`finishing ${total} half-built tools -> ${groups.length} agents x ${PER_AGENT}`)

const reports = await parallel(
  groups.map(({ start, end }, gi) => () =>
    agent(
      `Your work list is in the JSON array at ${waveFile}. Read ONLY entries at index ${start} through ${end - 1} (0-based, ${end - start} tools):\n` +
        `  node -e "console.log(JSON.stringify(require('${waveFile}').slice(${start},${end}),null,1))"\n` +
        `Each entry has { slug, name, category, desc, missing } where "missing" lists the files that do not exist yet. Finish those ${end - start} tools, one at a time. Ignore every other entry in the file.\n\n` +
        `${SPEC}\n\n${RULES}\n\nReturn a compact report, one block per slug: finished or left alone (+reason) | files created | the rule/formula implemented | the numeric case you verified (inputs -> output) | category (and whether you had to correct it) | parse-check result.`,
      { label: `finish:${start}-${end - 1}`, phase: 'Finish', effort: 'high' },
    ),
  ),
)

return { agents: groups.length, total, reports: reports.filter(Boolean) }
