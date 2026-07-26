export const meta = {
  name: 'build-tools-wave',
  description: 'Build a wave of new AltFTool tools end-to-end: config, working UI, per-tool SEO content',
  phases: [{ title: 'Build', detail: 'agents build ~6 tools each, one by one' }],
}

const WEB = '/Users/niki/knworkspace/kn1/altftool/altftoolweb'

const SPEC = `HOW AN ALTFTOOL TOOL IS BUILT (follow exactly — study ${WEB}/src/tools/car-loan-emi-calculator/ first as the reference, it is a recent tool built to this exact spec):

1) ${WEB}/src/tools/<slug>/tool.config.js
   const toolConfig = { slug: "<slug>", name: "<Name>", category: ["<Canonical Category>"], description: "<one line, <=150 chars>", icon: "<lucide-kebab-name>", iconColor: "text-(--primary)" };
   export default toolConfig;
   category MUST be EXACTLY one of these strings: "AI Tools", "PDF & Documents", "Image & Photo", "Video & Audio", "Text & Writing", "Converters", "Generators", "Calculators", "Finance Calculators", "Health Calculators", "Health & Fitness", "Developer", "Design & Color", "Marketing & Social", "Security & Privacy", "Education & Science", "Productivity", "Business", "Lifestyle", "Fun", "Games", "Other".
   NOTE the ampersands — "Text & Writing" not "Text and Writing". An unknown category FAILS the build.

2) ${WEB}/src/tools/<slug>/entry.jsx
   "use client";
   import ToolHome from "./pages";
   export default function ToolEntry() { return <ToolHome />; }

3) ${WEB}/src/tools/<slug>/pages/index.jsx — the REAL tool. Requirements:
   - "use client"; default-export a React component. React 19 + Tailwind v4.
   - GENUINELY WORKING logic — real formulas/algorithms, correct edge cases. No stubs, no "coming soon", no fake results.
   - Controlled inputs with labels (htmlFor/id), sensible defaults so the page shows a live result immediately.
   - Result panel: rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5, big primary number + supporting breakdown rows.
   - Copy-result button (navigator.clipboard) with "Copied!" state + aria-label. Reset button.
   - Inputs: h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none
   - Buttons: bg-[var(--primary)] text-[var(--primary-foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 min-h-11
   - Invalid input => inline message in bg-[var(--danger-soft)] text-[var(--danger)] rounded-md px-3 py-2 with role="alert". Never NaN/Infinity on screen.
   - Mobile-first: single column, grid sm:grid-cols-2 for input pairs, no fixed widths >375px.
   - COLORS: semantic tokens only — var(--primary), var(--card), var(--border), var(--foreground), var(--muted-foreground), var(--danger), var(--success). ZERO raw hex/rgb.
   - Formatting: use Intl.NumberFormat for money/numbers. Indian currency => new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).
   - REACT HOOK RULES: never read a ref (.current) inside a state updater or during render — the linter rejects it. Derive ids from existing state instead.

4) ${WEB}/src/tools/<slug>/seo.js — this tool's OWN SEO file (do NOT edit any shared/global content file):
   const seo = {
     intro: "<2-3 sentences, specific to THIS tool, mentions what it computes and who it's for. No generic filler.>",
     useCases: ["<specific scenario>", "<specific scenario>", "<specific scenario>"],
     benefits: [["<Title>", "<one line>"], ["<Title>", "<one line>"], ["<Title>", "<one line>"]],
     faqs: [["<Real question users search>", "<accurate answer, 1-3 sentences>"], ... 4 total],
   };
   export default seo;
   Content must be ACCURATE and tool-specific (real rates/rules where applicable, e.g. actual Indian tax slabs/limits). Never invent legal/medical advice — frame as informational.`

const RULES = `PROCESS: Build the tools ONE BY ONE, fully finishing each before starting the next.
After each tool, parse-check all four files — from ${WEB} run:
  node -e "require('@babel/parser').parse(require('fs').readFileSync('<file>','utf8'),{sourceType:'module',plugins:['jsx']})"
Also sanity-run your maths in node before you finish a calculator: compute one case by hand, then confirm the function returns it.

Do NOT run builds, do NOT start servers, do NOT commit, do NOT touch generated registry files (toolMetaMap.js / toolRuntimeMap.js / src/app/tools/generated/*), do NOT edit toolContentOverrides.js or any other shared file.
If a tool would need a paid API, a server, or a library not already in ${WEB}/package.json, SKIP it and say why — do not invent dependencies.
Check ${WEB}/src/tools/<slug> does not already exist before creating; if it exists, SKIP it (do not overwrite).`

phase('Build')

let tools = []
if (Array.isArray(args)) tools = args
else if (typeof args === 'string' && args.trim().startsWith('[')) {
  try {
    const parsed = JSON.parse(args)
    if (Array.isArray(parsed)) tools = parsed
  } catch (e) {
    log('args parse failed: ' + e.message)
  }
}
log('tools received: ' + tools.length)

const PER_AGENT = 6
const groups = []
for (let i = 0; i < tools.length; i += PER_AGENT) groups.push(tools.slice(i, i + PER_AGENT))

const reports = await parallel(
  groups.map((group, gi) => () =>
    agent(
      `Build these ${group.length} AltFTool tools, one by one, completely:\n\n${group
        .map((t, i) => `${i + 1}. NAME: ${t.name}\n   SLUG: ${t.slug}\n   CATEGORY: ${t.category}\n   WHAT IT DOES: ${t.desc}\n   GROUPING: ${t.sub}`)
        .join('\n\n')}\n\n${SPEC}\n\n${RULES}\n\nReturn a compact report: for each slug -> built/skipped(+reason), one line on the logic implemented, the numeric case you verified, parse-check result.`,
      { label: `build:g${gi + 1}`, phase: 'Build', effort: 'high' },
    ),
  ),
)

return { groups: groups.length, reports: reports.filter(Boolean) }
