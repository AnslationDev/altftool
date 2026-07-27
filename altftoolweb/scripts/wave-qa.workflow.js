export const meta = {
  name: 'wave-maths-audit',
  description: 'Audit a built wave: re-derive each tool\'s governing rule independently, run its lib.js against it, fix confirmed HIGH defects in place',
  phases: [{ title: 'Audit', detail: 'independent re-derivation + numeric check per tool' }],
}

const WEB = '/Users/niki/knworkspace/kn1/altftool/altftoolweb'

// args: { waveFile, slugs?: [..], perAgent?: 10 }
// Audits the tools from waveFile that exist and are complete on disk (or the explicit slugs list).
const input = typeof args === 'string' ? JSON.parse(args) : args || {}
const waveFile = input.waveFile
const PER_AGENT = Number(input.perAgent) || 10

if (!waveFile && !input.slugs) {
  log('ERROR: expected args { waveFile } or { slugs }')
  return { error: 'missing waveFile/slugs' }
}

const AUDIT = `You are auditing calculators someone else built. For each slug below, in ${WEB}/src/tools/<slug>/:

1. Read lib.js and seo.js. Identify the governing rule/formula the tool claims to implement
   (statute section, standard formula, published rate table, unit definition).
2. RE-DERIVE the expected result yourself from the rule — from first principles or authoritative
   knowledge, NOT from the code. Pick 3 probing cases: one typical, one at a threshold/slab edge,
   one degenerate (zero/negative/huge).
3. Run the tool's own lib.js on those cases:
   cd ${WEB} && node --input-type=module -e "import {fn} from './src/tools/<slug>/lib.js'; console.log(fn({...}))"
4. Compare. Classify each discrepancy:
   HIGH  = wrong money/health/legal figure a user would act on (wrong slab, missing cap, wrong rate,
           inverted comparison, unit error)
   MED   = wrong in an edge case, misleading rounding, stale rate presented as current
   LOW   = cosmetic (label, wording, precision)
5. For every HIGH you CONFIRM numerically: fix lib.js (and seo.js if it states the wrong figure)
   in place, then re-run your probing cases to prove the fix. Keep the fix minimal — do not
   restructure files. For MED/LOW: report only, do not touch.
6. Also flag (report only): seo.js FAQs stating a number that contradicts lib.js constants.

Never adjust your expectation to match the code. If you cannot determine the true rule with
confidence, say so and mark the tool UNVERIFIABLE instead of guessing.
Do NOT touch generated files, shared files, builds, git.

Return one line per slug: <slug> | PASS or defects found (HIGH/MED/LOW counts) | what you checked
(cases) | fixes applied (with before->after numbers) or UNVERIFIABLE reason.`

phase('Audit')

const reports = await parallel(
  (function () {
    // Build index groups; agents read their slice from the wave file themselves.
    const groups = []
    const total = Number(input.total) || 0
    if (input.slugs) {
      for (let i = 0; i < input.slugs.length; i += PER_AGENT)
        groups.push({ slugs: input.slugs.slice(i, i + PER_AGENT) })
      return groups.map(({ slugs }, gi) => () =>
        agent(
          `Audit these ${slugs.length} tools: ${slugs.join(', ')}\n\n${AUDIT}`,
          { label: `audit:${gi}`, phase: 'Audit', effort: 'high' },
        ),
      )
    }
    for (let start = 0; start < total; start += PER_AGENT)
      groups.push({ start, end: Math.min(start + PER_AGENT, total) })
    return groups.map(({ start, end }) => () =>
      agent(
        `Your audit list is the JSON array at ${waveFile}. Read entries at index ${start} through ${end - 1} (0-based):\n` +
          `  node -e "console.log(JSON.stringify(require('${waveFile}').slice(${start},${end}).map(e=>e.slug)))"\n` +
          `Skip any slug whose directory or lib.js does not exist (report it as NOT-BUILT).\n\n${AUDIT}`,
        { label: `audit:${start}-${end - 1}`, phase: 'Audit', effort: 'high' },
      ),
    )
  })(),
)

return { reports: reports.filter(Boolean) }
