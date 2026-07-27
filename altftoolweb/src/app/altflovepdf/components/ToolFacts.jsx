// Server component — server-rendered, animation-free factual summary for one
// Altf❤️PDF tool. This is the block answer engines and crawlers actually read:
// a question heading, a self-contained answer sentence, a real <table> of
// specs and an honest "what it does not do" list.
//
// Everything it renders comes from ../toolFacts.js, where each claim was
// verified against the tool's own implementation. Do not add copy here.
//
// Colours come from the `.altf-app` scope variables defined in
// ../altflovepdf.css (--ink / --muted / --border / --surface / --bg). That
// scope is a self-contained light island with no dark variant, so this block
// deliberately inherits it instead of the global light/dark tokens — using
// `text-foreground` here would turn white on a light panel in dark mode.
// Contrast against --bg #fbf7f6: --ink #313131 ≈ 11:1, --muted #666 ≈ 5.6:1,
// both above the WCAG AA 4.5:1 threshold for body text.

import { FAMILY_FACTS, getToolFacts } from "../toolFacts";

export default function ToolFacts({ slug, name }) {
  const facts = getToolFacts(slug);
  if (!facts || !name) return null;

  const rows = [
    ["Accepts", facts.input],
    ["Produces", facts.output],
    ["Where it runs", FAMILY_FACTS.processing],
    ["Price", FAMILY_FACTS.price],
    ["Requirements", FAMILY_FACTS.requirements],
  ].filter(([, value]) => Boolean(value));

  const muted = { color: "var(--muted)" };

  return (
    <section
      aria-labelledby={`what-is-${slug}`}
      className="mx-auto w-full max-w-4xl px-4 pb-12 sm:px-6"
      style={{ color: "var(--ink)" }}
    >
      <h2
        id={`what-is-${slug}`}
        className="text-xl font-semibold tracking-tight sm:text-2xl"
      >
        What does {name} do?
      </h2>
      <p className="mt-3 max-w-3xl text-base leading-relaxed" style={muted}>
        {facts.answer}
      </p>

      <h3 className="mt-8 text-base font-semibold sm:text-lg">
        {name} at a glance
      </h3>
      <div
        className="mt-3 overflow-x-auto rounded-xl border"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Key specifications for the {name} tool
          </caption>
          <tbody>
            {rows.map(([label, value], index) => (
              <tr
                key={label}
                style={
                  index > 0 ? { borderTop: "1px solid var(--border)" } : undefined
                }
              >
                <th
                  scope="row"
                  className="w-40 px-4 py-3 align-top font-medium"
                  style={{ background: "var(--bg)" }}
                >
                  {label}
                </th>
                <td className="px-4 py-3 align-top" style={muted}>
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {facts.notDoes?.length > 0 && (
        <>
          <h3 className="mt-8 text-base font-semibold sm:text-lg">
            What {name} does not do
          </h3>
          <ul
            className="mt-3 max-w-3xl list-disc space-y-2 pl-5 text-sm leading-relaxed"
            style={muted}
          >
            {facts.notDoes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
