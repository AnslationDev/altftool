export const meta = {
  name: 'seo-backfill',
  description: 'Write a per-tool seo.js for tools still falling back to the generic category template',
  phases: [{ title: 'Write SEO', detail: 'agents write GEO-shaped copy, one tool at a time' }],
}

const WEB = '/Users/niki/knworkspace/kn1/altftool/altftoolweb'

const SPEC = `These tools work, but they have no seo.js, so every one of them renders the same
generic category boilerplate: "X is a free <category> tool that runs entirely in your browser…".
Search engines see near-duplicate copy across hundreds of pages and answer engines have nothing
specific to quote. Your job is to give each tool its own.

Write ${WEB}/src/tools/<slug>/seo.js — and ONLY that file. Do not touch anything else.

  const seo = {
    intro: "...",
    useCases: ["...", "...", "..."],
    benefits: [["Title", "one line"], ["Title", "one line"], ["Title", "one line"]],
    faqs: [["question", "answer"], ... 4 total],
  };
  export default seo;

READ THE TOOL FIRST. Open its pages/index.jsx (and lib.js if present) and find out what it
actually computes or does — the real formula, standard, rate or algorithm. Everything you write
must describe THAT tool. If you cannot tell what it does from the code, say so and skip it rather
than inventing copy.

intro — 2-3 sentences. Open by DEFINING what the tool does in one quotable sentence, then who it
is for and what they get. Name the actual formula, rule or standard the code uses. This first
sentence is what an answer engine lifts, so it must stand alone without the page around it.

useCases — 3 concrete scenarios a real person would be in. Not "for professionals" — an actual
situation, with the specific thing they are trying to settle.

benefits — 3 [title, one-line] pairs. Say what the tool does better, not that it is free and
browser-based; every tool on the site is.

faqs — exactly 4. Each question phrased the way someone actually types or asks it. Each answer
LEADS WITH THE DIRECT ANSWER in the first sentence, then one or two sentences of support, and
includes the concrete number, rate, limit or threshold wherever one exists. These feed the page's
FAQPage JSON-LD, so a wrong figure ships as structured data — if you are unsure of a current rate,
describe the rule instead of guessing a number.

Never: marketing filler, invented statistics, "in today's fast-paced world", the tool name in
every sentence, or legal/tax/medical advice — frame those as informational and say when to consult
a professional.`

const RULES = `PROCESS: one tool at a time, finish it before starting the next.

After each file, parse-check it and confirm the shape. From ${WEB}:
  node --input-type=module -e "const m = await import('./src/tools/<slug>/seo.js'); const s = m.default; if (!s.intro || s.useCases.length !== 3 || s.benefits.length !== 3 || s.faqs.length !== 4) throw new Error('shape'); console.log('ok');"

Do NOT run builds or dev servers, do NOT commit, do NOT touch tool.config.js, entry.jsx, lib.js,
pages/, or any generated or shared file. Another session is working in this repo at the same time —
stay inside your own src/tools/<slug>/seo.js files.

If a tool already has a seo.js, skip it and say so — do not overwrite.`

phase('Write SEO')

const input = typeof args === 'string' ? JSON.parse(args) : args || {}
const waveFile = input.waveFile
const total = Number(input.total) || 0
const PER_AGENT = Number(input.perAgent) || 12

if (!waveFile || !total) {
  log('ERROR: expected args { waveFile, total, perAgent }')
  return { error: 'missing waveFile/total' }
}

const groups = []
for (let start = 0; start < total; start += PER_AGENT) {
  groups.push({ start, end: Math.min(start + PER_AGENT, total) })
}
log(`SEO backfill: ${total} tools -> ${groups.length} agents x ${PER_AGENT}`)

const reports = await parallel(
  groups.map(({ start, end }, gi) => () =>
    agent(
      `Your work list is the JSON array at ${waveFile}. Read ONLY entries ${start} through ${end - 1} (0-based, ${end - start} tools):\n` +
        `  node -e "console.log(JSON.stringify(require('${waveFile}').slice(${start},${end}),null,1))"\n` +
        `Each entry has { slug, name, category, desc }. Ignore every other entry in the file.\n\n` +
        `${SPEC}\n\n${RULES}\n\nReturn a compact report: for each slug -> written or skipped (+reason) | the one-sentence definition you led with | the concrete figure you cited in the FAQs.`,
      { label: `seo:${start}-${end - 1}`, phase: 'Write SEO', effort: 'high' },
    ),
  ),
)

return { agents: groups.length, total, reports: reports.filter(Boolean) }
