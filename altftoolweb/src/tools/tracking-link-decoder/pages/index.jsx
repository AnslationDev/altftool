"use client";

import { useMemo, useState } from "react";
import { Check, Copy, CornerUpRight, Link2, Lock, RotateCcw, ShieldAlert } from "lucide-react";

import {
  CATALOGUE_REVIEWED,
  EXPOSURE_LABELS,
  FUNCTIONAL_COUNT,
  INDIVIDUAL_TRACKER_COUNT,
  TRACKER_COUNT,
  catalogueByGroup,
  decodeTrackingUrl,
} from "../lib";

const SAMPLE_URL =
  "https://www.example.com/blog/spring-sale?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale_2026&utm_content=hero-button&mc_cid=8f2b1c9d0a&mc_eid=3f9a71c4b2&fbclid=IwAR2Xk9pQ7vN3sT&gclid=Cj0KCQjw1abc&_hsenc=p2ANqtz-9K4c&_hsmi=248113&li_fat_id=7c2a&page=2&q=cotton+shirts&t=90&si=aB3dK9x1&tag=altftool-21#reviews";

const DASH = "—";

const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 break-all text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const CARD_CLASS = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const TH_CLASS =
  "whitespace-nowrap px-3 py-2 text-left text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase";
const TD_CLASS = "px-3 py-3 align-top text-sm text-[var(--foreground)]";

const EXPOSURE_STYLES = {
  individual: "bg-[var(--danger-soft)] text-[var(--danger)]",
  device: "bg-[var(--warning-soft)] text-[var(--warning)]",
  campaign: "bg-[var(--info-soft)] text-[var(--info)]",
  none: "bg-[var(--success-soft)] text-[var(--success)]",
  unknown: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const intFmt = new Intl.NumberFormat("en-IN");
const pctFmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

function ExposureBadge({ exposure }) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs font-semibold ${
        EXPOSURE_STYLES[exposure] || EXPOSURE_STYLES.unknown
      }`}
    >
      {EXPOSURE_LABELS[exposure] || EXPOSURE_LABELS.unknown}
    </span>
  );
}

function StatRow({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-[var(--muted-foreground)] uppercase">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--foreground)]">{value}</dd>
    </div>
  );
}

function ParamTable({ rows, verdictHeading }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[42rem] border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <th scope="col" className={TH_CLASS}>
              Parameter
            </th>
            <th scope="col" className={TH_CLASS}>
              Value
            </th>
            <th scope="col" className={TH_CLASS}>
              Who set it
            </th>
            <th scope="col" className={TH_CLASS}>
              {verdictHeading}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((param, index) => (
            <tr
              key={`${param.where}-${param.name}-${index}`}
              className="border-b border-[var(--border)] last:border-0"
            >
              <td className={TD_CLASS}>
                <span className="font-mono text-xs font-semibold break-all">{param.name}</span>
                <span className="mt-1 block">
                  <ExposureBadge exposure={param.exposure} />
                </span>
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  {param.groupLabel}
                  {param.where === "fragment" ? " · in the # fragment" : ""}
                  {param.duplicate ? " · repeated key" : ""}
                  {param.match === "prefix" ? " · matched by family prefix" : ""}
                </span>
              </td>
              <td className={`${TD_CLASS} font-mono text-xs break-all`}>
                {param.displayValue || <span className="text-[var(--muted-foreground)]">(empty)</span>}
              </td>
              <td className={`${TD_CLASS} text-xs`}>{param.setter}</td>
              <td className={`${TD_CLASS} text-xs leading-5`}>
                {param.tells}
                {param.note ? (
                  <span className="mt-1 block font-semibold text-[var(--danger)]">{param.note}</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ToolHome() {
  const [rawUrl, setRawUrl] = useState(SAMPLE_URL);
  const [copied, setCopied] = useState("");

  const result = useMemo(() => decodeTrackingUrl(rawUrl), [rawUrl]);
  const failed = Boolean(result.error);

  const catalogue = useMemo(() => catalogueByGroup(), []);

  function flagCopied(which) {
    setCopied(which);
    setTimeout(() => setCopied(""), 1800);
  }

  async function copyClean() {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.clean);
      flagCopied("clean");
    } catch {
      setCopied("");
    }
  }

  async function copyReport() {
    if (failed) return;
    const lines = [
      "Tracking Link Decoder",
      `Host: ${result.host}`,
      `Before: ${result.originalLength} characters`,
      `After: ${result.cleanLength} characters (${result.savedChars} removed)`,
      `Clean link: ${result.clean}`,
      "",
      `Removed (${result.counts.stripped}):`,
      ...result.stripped.map(
        (param) => `  ${param.name} = ${param.displayValue} — ${EXPOSURE_LABELS[param.exposure]}. ${param.tells}`,
      ),
      "",
      `Kept (${result.counts.kept}):`,
      ...result.kept.map((param) => `  ${param.name} = ${param.displayValue} — ${param.tells}`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      flagCopied("report");
    } catch {
      setCopied("");
    }
  }

  function reset() {
    setRawUrl(SAMPLE_URL);
    setCopied("");
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Link2 className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
          Tracking Link Decoder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste any link. Every query parameter is named against a catalogue of {intFmt.format(TRACKER_COUNT)}{" "}
          tracking keys and {intFmt.format(FUNCTIONAL_COUNT)} functional ones, so you can see what each one
          tells the sender and who put it there. The link is parsed with the browser&apos;s own URL API —
          there are no network calls on this page, and the URL you paste never leaves your browser.
        </p>
      </header>

      <section className="grid gap-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="tracking-url">
            The link to decode
          </label>
          <textarea
            id="tracking-url"
            className={`${TEXTAREA_CLASS} mt-1 h-32`}
            value={rawUrl}
            spellCheck={false}
            onChange={(event) => setRawUrl(event.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Loaded with a sample marketing-email link so the output is visible straight away. Replace it with
            your own.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyClean}
            disabled={failed}
            aria-label="Copy the cleaned link to the clipboard"
          >
            {copied === "clean" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "clean" ? "Copied!" : "Copy clean link"}
          </button>
          <button
            type="button"
            className={GHOST_BTN}
            onClick={copyReport}
            disabled={failed}
            aria-label="Copy the full parameter breakdown as text"
          >
            {copied === "report" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied === "report" ? "Copied!" : "Copy breakdown"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset to the sample link">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {failed ? (
        <div
          role="alert"
          className="mt-5 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </div>
      ) : null}

      <section className={`mt-5 ${CARD_CLASS}`}>
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Tracking parameters removed</p>
        <p className="mt-1 text-4xl font-bold tabular-nums sm:text-5xl">
          {failed ? DASH : intFmt.format(result.counts.stripped)}
        </p>
        <p className="mt-2 flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {failed
            ? DASH
            : result.counts.individual > 0
              ? `${intFmt.format(result.counts.individual)} of them can be tied back to one named person, not just a campaign.`
              : "None of the removed parameters identified an individual — they carried campaign or device labels only."}
        </p>

        <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-3">
          <StatRow label="Parameters found" value={failed ? DASH : intFmt.format(result.counts.total)} />
          <StatRow label="Removed" value={failed ? DASH : intFmt.format(result.counts.stripped)} />
          <StatRow label="Kept as functional" value={failed ? DASH : intFmt.format(result.counts.kept)} />
          <StatRow
            label="Before"
            value={failed ? DASH : `${intFmt.format(result.originalLength)} chars`}
          />
          <StatRow label="After" value={failed ? DASH : `${intFmt.format(result.cleanLength)} chars`} />
          <StatRow
            label="Saved"
            value={
              failed ? DASH : `${intFmt.format(result.savedChars)} (${pctFmt.format(result.savedPercent)}%)`
            }
          />
        </dl>
      </section>

      <section className={`mt-5 ${CARD_CLASS}`}>
        <h2 className="text-base font-semibold">Clean link</h2>
        <p className="mt-2 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 break-all">
          {failed ? DASH : result.clean}
        </p>
        {!failed && result.schemeAdded ? (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            No scheme was given, so <span className="font-mono">https://</span> was assumed. The before and
            after counts below both measure the normalised link, so they compare like for like.
          </p>
        ) : null}
        {!failed && result.hashKind === "text-fragment" ? (
          <p className="mt-2 text-xs text-[var(--muted-foreground)]">
            This link ends in a scroll-to-text fragment (<span className="font-mono">#:~:text=</span>). It is
            kept, because it is what makes the browser jump to and highlight that sentence — but it does show
            exactly which passage the sender wanted you to read. Fragments are never sent to the server in the
            HTTP request; only scripts running on the page can read them.
          </p>
        ) : null}
        {!failed && result.counts.sensitive > 0 ? (
          <p className="mt-3 flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-xs leading-5 font-medium text-[var(--danger)]">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {intFmt.format(result.counts.sensitive)} of the kept parameters are credentials — a sign-in code,
            token or session id. They stay because removing them breaks the link, which is exactly why this
            link should not be forwarded to anyone.
          </p>
        ) : null}
        {!failed && result.redirects.length > 0 ? (
          <div className="mt-3 rounded-md bg-[var(--info-soft)] px-3 py-2 text-xs leading-5 text-[var(--info)]">
            <p className="flex items-start gap-2 font-semibold">
              <CornerUpRight className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              This is a redirector — it logs the click before forwarding you.
            </p>
            <ul className="mt-1 list-disc pl-6">
              {result.redirects.map((redirect) => (
                <li key={redirect.name} className="font-mono break-all">
                  {redirect.name} → {redirect.url}
                </li>
              ))}
            </ul>
            <p className="mt-1">
              Paste the destination above back into this box to decode it on its own.
            </p>
          </div>
        ) : null}
      </section>

      {!failed && result.stripped.length > 0 ? (
        <section className={`mt-5 ${CARD_CLASS}`}>
          <h2 className="text-base font-semibold">Removed — what each one told them</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Of the {intFmt.format(TRACKER_COUNT)} tracking keys in the catalogue,{" "}
            {intFmt.format(INDIVIDUAL_TRACKER_COUNT)} can be resolved to one individual rather than to a
            campaign. Those are the ones that matter when a marketing email gets forwarded.
          </p>
          <ParamTable rows={result.stripped} verdictHeading="What it reveals" />
        </section>
      ) : null}

      {!failed && result.kept.length > 0 ? (
        <section className={`mt-5 ${CARD_CLASS}`}>
          <h2 className="text-base font-semibold">Kept — and why removing them would break the link</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Anything not recognised as tracking is kept. A stripper that breaks the destination is worse than
            no stripper at all, so unknown keys are left alone and flagged for you to judge.
          </p>
          <ParamTable rows={result.kept} verdictHeading="Why it was kept" />
        </section>
      ) : null}

      {!failed && result.counts.total === 0 ? (
        <section className={`mt-5 ${CARD_CLASS}`}>
          <p className="text-sm text-[var(--muted-foreground)]">
            This link carries no query parameters at all, so there is nothing to strip and nothing being
            reported back about you through the URL.
          </p>
        </section>
      ) : null}

      <section className={`mt-5 ${CARD_CLASS}`}>
        <h2 className="text-base font-semibold">The full catalogue</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {intFmt.format(TRACKER_COUNT)} tracking keys and {intFmt.format(FUNCTIONAL_COUNT)} protected
          functional keys, plus family-prefix rules for <span className="font-mono">utm_</span>,{" "}
          <span className="font-mono">pd_rd_</span>, <span className="font-mono">pf_rd_</span>,{" "}
          <span className="font-mono">mc_</span>, <span className="font-mono">_hs</span>,{" "}
          <span className="font-mono">at_</span> and <span className="font-mono">ns_</span>. Catalogue last
          reviewed {CATALOGUE_REVIEWED}.
        </p>
        {catalogue.map((group) => (
          <div key={group.id} className="mt-5">
            <h3 className="text-sm font-semibold">{group.label}</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th scope="col" className={TH_CLASS}>
                      Key
                    </th>
                    <th scope="col" className={TH_CLASS}>
                      Exposure
                    </th>
                    <th scope="col" className={TH_CLASS}>
                      What it tells them
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((row) => (
                    <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                      <td className={`${TD_CLASS} font-mono text-xs font-semibold break-all`}>{row.name}</td>
                      <td className={TD_CLASS}>
                        <ExposureBadge exposure={row.exposure} />
                      </td>
                      <td className={`${TD_CLASS} text-xs leading-5`}>{row.tells}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      <section className={`mt-5 ${CARD_CLASS}`}>
        <h2 className="text-base font-semibold">How this page reads the link</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>
            The URL is parsed with the WHATWG URL API built into the browser. The query is then split on{" "}
            <span className="font-mono">&amp;</span> exactly as the form-encoding rules in the HTML standard
            describe, and each key is percent-decoded before it is matched.
          </li>
          <li>
            Kept parameters are re-emitted in their original raw form, character for character, so the
            encoding a site depends on is never rewritten.
          </li>
          <li>
            The <span className="font-mono">#</span> fragment is parsed too, because trackers hide there. It
            is worth knowing that fragments are not sent to the server — only page scripts see them.
          </li>
          <li>
            There is no data source and nothing to go stale in the arithmetic: the character counts are
            measured off the link in front of you. The parameter catalogue itself was last reviewed on{" "}
            {CATALOGUE_REVIEWED}.
          </li>
        </ul>
      </section>
    </main>
  );
}
