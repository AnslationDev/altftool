// Server component — server-rendered, animation-free factual summary for one
// ALTF Love IMG tool: a question heading, the self-contained answer sentence,
// a real <table> of specs and an honest "what it does not do" list.
//
// Every value comes from ../data/tools.js, where each claim was verified
// against the tool's own client component. Do not add copy here.
//
// Colours use the `--ali-*` scope variables, which are mapped from the site's
// semantic tokens and overridden under [data-theme="dark"], so this block
// follows light and dark exactly like the rest of the route family.

import { FAMILY_FACTS, getTool } from "../data/tools";

export default function ToolFacts({ slug }) {
  const tool = getTool(slug);
  if (!tool?.answer) return null;

  const rows = [
    ["Accepts", tool.input || FAMILY_FACTS.accepts],
    ["Produces", tool.output],
    ["Where it runs", FAMILY_FACTS.processing],
    ["Price", FAMILY_FACTS.price],
    ["Requirements", FAMILY_FACTS.requirements],
  ].filter(([, value]) => Boolean(value));

  const muted = { color: "var(--ali-muted)" };

  return (
    <section
      aria-labelledby={`what-is-${slug}`}
      className="ali-container pb-16"
      style={{ color: "var(--ali-text)" }}
    >
      <h2
        id={`what-is-${slug}`}
        className="text-xl font-semibold tracking-tight sm:text-2xl"
      >
        What does {tool.name} do?
      </h2>
      <p className="mt-3 max-w-3xl text-base leading-relaxed" style={muted}>
        {tool.answer}
      </p>

      <h3 className="mt-8 text-base font-semibold sm:text-lg">
        {tool.name} at a glance
      </h3>
      <div
        className="mt-3 overflow-x-auto rounded-xl border"
        style={{ borderColor: "var(--ali-border)" }}
      >
        <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Key specifications for the {tool.name} tool
          </caption>
          <tbody>
            {rows.map(([label, value], index) => (
              <tr
                key={label}
                style={
                  index > 0
                    ? { borderTop: "1px solid var(--ali-border)" }
                    : undefined
                }
              >
                <th
                  scope="row"
                  className="w-40 px-4 py-3 align-top font-medium"
                  style={{ background: "var(--ali-soft)" }}
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

      {tool.notDoes?.length > 0 && (
        <>
          <h3 className="mt-8 text-base font-semibold sm:text-lg">
            What {tool.name} does not do
          </h3>
          <ul
            className="mt-3 max-w-3xl list-disc space-y-2 pl-5 text-sm leading-relaxed"
            style={muted}
          >
            {tool.notDoes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
