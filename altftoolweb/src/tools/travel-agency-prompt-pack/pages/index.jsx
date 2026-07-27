"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plane, RotateCcw, Search } from "lucide-react";

import {
  CATEGORIES,
  GST_TOUR_OPERATOR_RATE,
  LONG_PROMPT_TOKENS,
  PROMPTS,
  TCS_OVERSEAS_TOUR_THRESHOLD_INR,
  TCS_RATE_ABOVE_THRESHOLD,
  TCS_RATE_UPTO_THRESHOLD,
  computeTourQuote,
  fillPrompt,
  searchPrompts,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const COUNT = new Intl.NumberFormat("en-IN");

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${NUM.format(Number.isFinite(value) ? value : 0)}%`;

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";
const FIRST = PROMPTS[0];

const QUOTE_DEFAULTS = {
  netCost: "50000",
  markup: "20",
  travellers: "2",
  overseas: true,
  prior: "0",
};

const exampleValues = (prompt) =>
  prompt ? Object.fromEntries(prompt.variables.map((variable) => [variable.key, variable.placeholder])) : {};

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  return Number(text);
};

export default function ToolHome() {
  const [netCost, setNetCost] = useState(QUOTE_DEFAULTS.netCost);
  const [markup, setMarkup] = useState(QUOTE_DEFAULTS.markup);
  const [travellers, setTravellers] = useState(QUOTE_DEFAULTS.travellers);
  const [overseas, setOverseas] = useState(QUOTE_DEFAULTS.overseas);
  const [prior, setPrior] = useState(QUOTE_DEFAULTS.prior);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [activeId, setActiveId] = useState(FIRST.id);
  const [values, setValues] = useState(() => exampleValues(FIRST));
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const quote = useMemo(
    () =>
      computeTourQuote({
        netCostPerPerson: toNumber(netCost),
        markupPercent: toNumber(markup),
        travellers: toNumber(travellers),
        overseas,
        priorPackagesThisYear: toNumber(prior),
      }),
    [netCost, markup, travellers, overseas, prior],
  );

  const results = useMemo(() => searchPrompts({ query, category }), [query, category]);
  const active = useMemo(() => PROMPTS.find((prompt) => prompt.id === activeId) || null, [activeId]);
  const filled = useMemo(
    () => fillPrompt({ template: active ? active.template : "", values }),
    [active, values],
  );

  const quoteFailed = Boolean(quote.error);
  const promptFailed = Boolean(filled.error);

  const quoteSummary = quoteFailed
    ? ""
    : [
        "Tour package quote",
        `Travellers: ${COUNT.format(quote.travellers)}`,
        `Selling price per person: ${money(quote.sellingPerPerson)}`,
        `Package value: ${money(quote.grossPackage)}`,
        `GST at ${pct(GST_TOUR_OPERATOR_RATE * 100)}: ${money(quote.gst)}`,
        quote.overseas ? `TCS on overseas package: ${money(quote.tcs)}` : "TCS: not applicable (domestic package)",
        `Total payable by client: ${money(quote.totalPayable)}`,
        `Per traveller: ${money(quote.perTravellerPayable)}`,
        `Agency margin: ${money(quote.agencyMargin)} (${pct(quote.marginPercentOfSelling)} of package value)`,
      ].join("\n");

  const copyQuote = async () => {
    if (!quoteSummary) return;
    try {
      await navigator.clipboard.writeText(quoteSummary);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 1500);
    } catch {
      setCopiedQuote(false);
    }
  };

  const copyPrompt = async () => {
    if (promptFailed) return;
    try {
      await navigator.clipboard.writeText(filled.text);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 1500);
    } catch {
      setCopiedPrompt(false);
    }
  };

  const selectPrompt = (prompt) => {
    setActiveId(prompt.id);
    setValues(exampleValues(prompt));
    setCopiedPrompt(false);
  };

  const updateValue = (key, value) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setCopiedPrompt(false);
  };

  const reset = () => {
    setNetCost(QUOTE_DEFAULTS.netCost);
    setMarkup(QUOTE_DEFAULTS.markup);
    setTravellers(QUOTE_DEFAULTS.travellers);
    setOverseas(QUOTE_DEFAULTS.overseas);
    setPrior(QUOTE_DEFAULTS.prior);
    setQuery("");
    setCategory("All");
    setActiveId(FIRST.id);
    setValues(exampleValues(FIRST));
    setCopiedQuote(false);
    setCopiedPrompt(false);
  };

  const quoteRows = quoteFailed
    ? [
        ["Selling price per person", DASH],
        ["Package value", DASH],
        [`GST at ${pct(GST_TOUR_OPERATOR_RATE * 100)}`, DASH],
        ["TCS on overseas package", DASH],
        ["Per traveller payable", DASH],
        ["Your cost", DASH],
        ["Agency margin", DASH],
      ]
    : [
        ["Selling price per person", money(quote.sellingPerPerson)],
        ["Package value", money(quote.grossPackage)],
        [`GST at ${pct(GST_TOUR_OPERATOR_RATE * 100)}`, money(quote.gst)],
        [
          "TCS on overseas package",
          quote.overseas
            ? `${money(quote.tcs)} (${money(quote.amountAtLowerRate)} at ${pct(TCS_RATE_UPTO_THRESHOLD * 100)}, ${money(quote.amountAtHigherRate)} at ${pct(TCS_RATE_ABOVE_THRESHOLD * 100)})`
            : "Not applicable — domestic package",
        ],
        ["Per traveller payable", money(quote.perTravellerPayable)],
        ["Your cost", money(quote.netCost)],
        ["Agency margin", `${money(quote.agencyMargin)} (${pct(quote.marginPercentOfSelling)} of package value)`],
      ];

  const promptRows = promptFailed
    ? [
        ["Prompt", DASH],
        ["Blanks filled", DASH],
        ["Words", DASH],
        ["Estimated tokens", DASH],
      ]
    : [
        ["Prompt", active ? active.title : DASH],
        ["Blanks filled", `${COUNT.format(filled.filledCount)} / ${COUNT.format(filled.totalCount)}`],
        ["Words", COUNT.format(filled.words)],
        [
          "Estimated tokens",
          `${COUNT.format(filled.estimatedTokens)}${filled.isLong ? ` — over ${COUNT.format(LONG_PROMPT_TOKENS)}` : ""}`,
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Plane className="h-4 w-4" aria-hidden="true" />
          Travel agency
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Travel Agency Prompt Pack</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A quote calculator that adds markup, {pct(GST_TOUR_OPERATOR_RATE * 100)} GST on tour operator services and TCS
          on overseas tour packages, plus {COUNT.format(PROMPTS.length)} fill-in-the-blank prompts for package copy,
          quotes, follow-ups and supplier emails.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Quote builder</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="travel-cost">
              Net cost per person (INR)
            </label>
            <input
              id="travel-cost"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={netCost}
              onChange={(event) => setNetCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="travel-markup">
              Markup (%)
            </label>
            <input
              id="travel-markup"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={markup}
              onChange={(event) => setMarkup(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="travel-heads">
              Travellers
            </label>
            <input
              id="travel-heads"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={travellers}
              onChange={(event) => setTravellers(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="travel-prior">
              Overseas packages already sold to this buyer this year (INR)
            </label>
            <input
              id="travel-prior"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10000"
              value={prior}
              onChange={(event) => setPrior(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <input
            id="travel-overseas"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={overseas}
            onChange={(event) => setOverseas(event.target.checked)}
          />
          <label className="text-sm font-semibold" htmlFor="travel-overseas">
            Overseas tour programme package (TCS applies)
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[10, 15, 20, 25].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMarkup(String(value))}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {value}% markup
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Total payable by the client
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {quoteFailed ? DASH : money(quote.totalPayable)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {quoteFailed
                ? "Fix the input above to see the quote."
                : `${COUNT.format(quote.travellers)} traveller${quote.travellers === 1 ? "" : "s"}, package value plus taxes`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyQuote}
              aria-label="Copy the quote breakdown to the clipboard"
              className={GHOST_BTN}
              disabled={quoteFailed}
            >
              {copiedQuote ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copiedQuote ? "Copied!" : "Copy quote"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the quote and the prompt" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {quoteFailed && (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {quote.error}
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {quoteRows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
          TCS on an overseas tour programme package is {pct(TCS_RATE_UPTO_THRESHOLD * 100)} up to{" "}
          {money(TCS_OVERSEAS_TOUR_THRESHOLD_INR)} of such packages per buyer per financial year and{" "}
          {pct(TCS_RATE_ABOVE_THRESHOLD * 100)} above it. TCS is not a cost to the traveller — it is credited against
          their income tax and claimed in their return. This calculator applies TCS to the package value before GST;
          confirm the basis your accountant uses.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Prompt library</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="travel-search">
              Search prompts
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="travel-search"
                type="search"
                className={`${INPUT_CLASS} pl-9`}
                placeholder="quote, visa, refund, supplier"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="travel-category">
              Category
            </label>
            <select
              id="travel-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
          {COUNT.format(results.length)} of {COUNT.format(PROMPTS.length)} prompts
        </p>

        {results.length === 0 ? (
          <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
            No prompt matches that search. Try a shorter word or set the category back to all.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {results.map((prompt) => {
              const isActive = prompt.id === activeId;
              return (
                <li key={prompt.id}>
                  <button
                    type="button"
                    onClick={() => selectPrompt(prompt)}
                    aria-pressed={isActive}
                    className={`flex min-h-11 w-full flex-col items-start gap-1 rounded-lg border p-3 text-left transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 ${
                      isActive
                        ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                        : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                      {prompt.category}
                    </span>
                    <span className="text-sm font-semibold">{prompt.title}</span>
                    <span className="text-xs leading-5 text-[var(--muted-foreground)]">{prompt.goal}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {active && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Fill in the blanks</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">{active.tip}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {active.variables.map((variable) => (
              <div key={variable.key}>
                <label className={LABEL_CLASS} htmlFor={`travel-var-${variable.key}`}>
                  {variable.label}
                </label>
                <input
                  id={`travel-var-${variable.key}`}
                  type="text"
                  className={`mt-2 ${INPUT_CLASS}`}
                  placeholder={variable.placeholder}
                  value={values[variable.key] ?? ""}
                  onChange={(event) => updateValue(variable.key, event.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyPrompt}
              aria-label="Copy the finished prompt to the clipboard"
              className={GHOST_BTN}
              disabled={promptFailed}
            >
              {copiedPrompt ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copiedPrompt ? "Copied!" : "Copy prompt"}
            </button>
            <button
              type="button"
              onClick={() => setValues(Object.fromEntries(active.variables.map((variable) => [variable.key, ""])))}
              className={GHOST_BTN}
            >
              Clear fields
            </button>
          </div>

          {promptFailed && (
            <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              {filled.error}
            </p>
          )}

          {!promptFailed && filled.missing.length > 0 && (
            <p role="status" className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
              Still blank: {filled.missing.join(", ")}. They stay visible as {"{{placeholders}}"} in the copied text.
            </p>
          )}

          <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
            {promptRows.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold break-words">{value}</dd>
              </div>
            ))}
          </dl>

          {!promptFailed && (
            <div className="mt-5 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <pre className="text-sm leading-6 break-words whitespace-pre-wrap text-[var(--foreground)]">
                {filled.text}
              </pre>
            </div>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational estimates, not tax advice. GST treatment depends on whether you act as a tour operator, an agent
        or a pure agent, and TCS depends on the buyer&apos;s aggregate for the financial year — confirm both with your
        chartered accountant before issuing an invoice. Everything runs in your browser.
      </p>
    </main>
  );
}
