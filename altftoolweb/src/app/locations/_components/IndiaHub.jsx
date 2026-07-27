import Link from "next/link";
import { ArrowUpRight, HelpCircle, Info, ShieldAlert } from "lucide-react";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import {
  INDIA_CONVENTIONS,
  INDIA_FAQS,
  INDIA_LIMITS,
  INDIA_TOOL_GROUPS,
  INDIA_TOOL_NOTES,
} from "../_content/india";
import { CARD, CTA_CLASS, CTA_STYLE, T } from "./tokens";

/**
 * /locations/india — the one geo page with hand-written, location-specific
 * content (see DIFFERENTIATED_GEOS in src/platform/seo/geoEntities.js).
 *
 * Everything rendered here is resolved against the live tool registry: a slug
 * that no longer exists silently disappears instead of becoming a dead link,
 * and the headline tool count is derived from what actually resolved, so it
 * cannot drift away from the truth.
 */

/** Resolve the hand-written groups against the registry. */
export function buildIndiaHubModel() {
  const groups = INDIA_TOOL_GROUPS.map((group) => ({
    id: group.id,
    label: group.label,
    heading: group.heading,
    answer: group.answer,
    tools: group.slugs
      .map((slug) => {
        const meta = toolMetaMap[slug];
        if (!meta) return null;
        return {
          slug,
          name: meta.name || slug,
          description: INDIA_TOOL_NOTES[slug] || meta.description || "",
        };
      })
      .filter(Boolean),
  })).filter((group) => group.tools.length > 0);

  const seen = new Set();
  for (const group of groups) for (const tool of group.tools) seen.add(tool.slug);

  return { groups, toolCount: seen.size };
}

export function buildIndiaAnswer(toolCount) {
  return `AltFTool has ${toolCount} free tools built specifically for India: GST and income tax calculators, EMI and SIP planners, PPF, NPS and Sukanya Samriddhi projections, and offline validators for PAN, Aadhaar, GSTIN, IFSC and UPI payloads. All of them run inside your browser in rupees and on the Indian financial year of 1 April to 31 March, need no account and cost nothing — and none of them file a return, move money, or look a number up in a government database.`;
}

function SectionIcon({ children }) {
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white"
      style={{ background: T.grad }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export default function IndiaHub({ model }) {
  const { groups, toolCount } = model;

  return (
    <>
      {/* Hero — the answer comes first, in one self-contained paragraph. */}
      <section className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: T.ink }}>
          AltFTool India — free GST, income tax, EMI and Aadhaar tools
        </h1>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed" style={{ color: T.ink }}>
          {buildIndiaAnswer(toolCount)}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="#india-tools" className={CTA_CLASS} style={CTA_STYLE}>
            Jump to the tools
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          <Link
            href="/tools/all"
            className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-bold transition hover:text-(--sc-indigo)"
            style={{ backgroundColor: T.tile, color: T.ink }}
          >
            Full tool directory
          </Link>
        </div>
      </section>

      {/* What "India-specific" concretely means — real table, real facts. */}
      <section className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <h2
          className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight"
          style={{ color: T.ink }}
        >
          <SectionIcon>
            <Info className="h-4 w-4" strokeWidth={1.9} />
          </SectionIcon>
          What makes these tools India-specific?
        </h2>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed" style={{ color: T.ink }}>
          Six conventions run through every India tool. They are structural rules that do not change
          from one budget to the next — the rates and limits that do change are left to the tools
          themselves, so nothing on this page goes stale.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              India-specific conventions used across AltFTool tools
            </caption>
            <thead>
              <tr style={{ color: T.ink }}>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Convention
                </th>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  How AltFTool applies it
                </th>
                <th scope="col" className="px-3 py-2 font-extrabold">
                  Where it shows up
                </th>
              </tr>
            </thead>
            <tbody>
              {INDIA_CONVENTIONS.map((row) => (
                <tr key={row.convention} className="border-t" style={{ borderColor: T.border }}>
                  <th
                    scope="row"
                    className="whitespace-nowrap px-3 py-3 align-top font-bold"
                    style={{ color: T.ink }}
                  >
                    {row.convention}
                  </th>
                  <td className="px-3 py-3 align-top font-semibold" style={{ color: T.ink }}>
                    {row.detail}
                  </td>
                  <td
                    className="px-3 py-3 align-top font-medium leading-relaxed"
                    style={{ color: T.ink }}
                  >
                    {row.where}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Limits — stated before the tool lists, not buried after them. */}
      <section className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <h2
          className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight"
          style={{ color: T.ink }}
        >
          <SectionIcon>
            <ShieldAlert className="h-4 w-4" strokeWidth={1.9} />
          </SectionIcon>
          What these tools do not do
        </h2>
        <ul className="mt-4 space-y-2">
          {INDIA_LIMITS.map((limit) => (
            <li
              key={limit}
              className="rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed"
              style={{ backgroundColor: T.tile, color: T.ink }}
            >
              {limit}
            </li>
          ))}
        </ul>
      </section>

      {/* The tools, grouped by the job someone in India is trying to do. */}
      <div id="india-tools" className="space-y-5 scroll-mt-24">
        <nav aria-label="India tool groups" className="rounded-[24px] p-5 sm:p-7" style={CARD}>
          <h2 className="text-lg font-extrabold tracking-tight" style={{ color: T.ink }}>
            {toolCount} India tools, in {groups.length} groups
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {groups.map((group) => (
              <li key={group.id}>
                <Link
                  href={`#india-${group.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition-all duration-150 hover:-translate-y-0.5 hover:text-(--sc-indigo)"
                  style={{ backgroundColor: T.tile, color: T.ink }}
                >
                  {group.label}
                  <span className="text-xs font-semibold opacity-70">{group.tools.length}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {groups.map((group) => (
          <section
            key={group.id}
            id={`india-${group.id}`}
            className="scroll-mt-24 rounded-[24px] p-5 sm:p-7"
            style={CARD}
          >
            <h2 className="text-lg font-extrabold tracking-tight" style={{ color: T.ink }}>
              {group.heading}
            </h2>
            <p
              className="mt-3 max-w-3xl text-sm font-medium leading-relaxed"
              style={{ color: T.ink }}
            >
              {group.answer}
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.tools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/all/${tool.slug}`}
                    className="group flex h-full flex-col rounded-2xl p-4 transition-all duration-150 hover:-translate-y-0.5"
                    style={{ backgroundColor: T.tile }}
                  >
                    <span
                      className="text-sm font-extrabold group-hover:text-(--sc-indigo)"
                      style={{ color: T.ink }}
                    >
                      {tool.name}
                    </span>
                    <span
                      className="mt-1 text-xs font-medium leading-relaxed"
                      style={{ color: T.muted }}
                    >
                      {tool.description}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Hand-written FAQ — the source of the FAQPage schema on this page. */}
      <section className="rounded-[24px] p-5 sm:p-7" style={CARD}>
        <h2
          className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight"
          style={{ color: T.ink }}
        >
          <SectionIcon>
            <HelpCircle className="h-4 w-4" strokeWidth={1.9} />
          </SectionIcon>
          AltFTool India — frequently asked questions
        </h2>
        <div className="mt-4 space-y-4">
          {INDIA_FAQS.map((faq) => (
            <div key={faq.question}>
              <h3 className="text-sm font-extrabold" style={{ color: T.ink }}>
                {faq.question}
              </h3>
              <p
                className="mt-1.5 max-w-3xl text-sm font-medium leading-relaxed"
                style={{ color: T.ink }}
              >
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
