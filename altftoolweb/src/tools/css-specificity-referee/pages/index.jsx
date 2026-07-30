"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gavel, Layers, RotateCcw } from "lucide-react";

import {
  CRITERION_LABELS,
  SPEC_CASCADE,
  SPEC_SELECTORS,
  analyseDevToolsPaste,
  analyseStylesheet,
  formatSpecificity,
  refereeTwoSelectors,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PANEL_CLASS = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";
const CHIP_CLASS =
  "inline-flex items-center rounded-full bg-[var(--muted)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)]";

const DASH = "—";

const MODES = [
  ["duel", "Two selectors"],
  ["devtools", "DevTools paste"],
  ["sheet", "Stylesheet"],
];

const DEFAULT_DUEL = {
  currentSelector: "#sidebar .btn",
  currentImportant: false,
  currentInline: false,
  currentLayer: "",
  wantedSelector: ".btn.primary",
  wantedImportant: false,
  wantedInline: false,
  wantedLayer: "",
  layerOrder: "",
  wantedIsLater: true,
};

const DEFAULT_PASTE = `element.style {
}
.card .title {                    style.css:88
    color: teal;
}
#main .title {                    style.css:42
    color: rebeccapurple;
}
.title {                          <style>
    color: gray !important;
}`;

const DEFAULT_SHEET = `@layer base, components;

@layer base {
  .btn { color: navy; }
}

@layer components {
  .btn.primary { color: teal; }
  #app .btn { color: olive !important; }
}

.btn { color: rebeccapurple; }
`;

const DEFAULT_ELEMENT = "button#save.btn.primary[type=submit]";
const DEFAULT_PROPERTY = "color";

function SpecBadge({ spec }) {
  return (
    <span className="inline-flex items-center rounded-md bg-[var(--muted)] px-2 py-1 font-mono text-sm font-semibold text-[var(--foreground)]">
      {formatSpecificity(spec)}
    </span>
  );
}

function TokenTable({ tokens }) {
  if (!tokens || !tokens.length) return null;
  const counted = tokens.filter((token) => token.text.trim());
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[24rem] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
          <tr>
            <th scope="col" className="py-1 pr-3 font-semibold">
              Part
            </th>
            <th scope="col" className="py-1 pr-3 font-semibold">
              Column
            </th>
            <th scope="col" className="py-1 font-semibold">
              Why
            </th>
          </tr>
        </thead>
        <tbody>
          {counted.map((token, index) => (
            <tr key={`${token.text}-${index}`} className="border-t border-[var(--border)]">
              <td className="py-1.5 pr-3 font-mono">{token.text}</td>
              <td className="py-1.5 pr-3 font-mono font-semibold">
                {token.column === "arg" ? "arg" : token.column || DASH}
              </td>
              <td className="py-1.5 text-[var(--muted-foreground)]">{token.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RankedTable({ rows, layerOrder }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
          <tr>
            <th scope="col" className="py-1 pr-3 font-semibold">
              #
            </th>
            <th scope="col" className="py-1 pr-3 font-semibold">
              Selector
            </th>
            <th scope="col" className="py-1 pr-3 font-semibold">
              a,b,c
            </th>
            <th scope="col" className="py-1 pr-3 font-semibold">
              Layer
            </th>
            <th scope="col" className="py-1 pr-3 font-semibold">
              !important
            </th>
            <th scope="col" className="py-1 font-semibold">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.selector}-${row.order}-${index}`}
              className={`border-t border-[var(--border)] ${
                index === 0 ? "font-semibold text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
              }`}
            >
              <td className="py-1.5 pr-3">{index + 1}</td>
              <td className="py-1.5 pr-3 font-mono">{row.selector}</td>
              <td className="py-1.5 pr-3 font-mono">
                {row.inline ? "inline" : formatSpecificity(row.spec)}
              </td>
              <td className="py-1.5 pr-3 font-mono">{row.layer || "unlayered"}</td>
              <td className="py-1.5 pr-3">{row.important ? "yes" : "no"}</td>
              <td className="py-1.5 font-mono">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {layerOrder && layerOrder.length ? (
        <p className={HINT_CLASS}>
          <Layers className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
          Layer order read from the source: {layerOrder.join(" → ")} → unlayered (implicit final layer).
        </p>
      ) : null}
    </div>
  );
}

export default function ToolHome() {
  const [mode, setMode] = useState("duel");
  const [duel, setDuel] = useState(DEFAULT_DUEL);
  const [paste, setPaste] = useState(DEFAULT_PASTE);
  const [pasteProperty, setPasteProperty] = useState(DEFAULT_PROPERTY);
  const [sheet, setSheet] = useState(DEFAULT_SHEET);
  const [element, setElement] = useState(DEFAULT_ELEMENT);
  const [sheetProperty, setSheetProperty] = useState(DEFAULT_PROPERTY);
  const [inlineValue, setInlineValue] = useState("");
  const [copied, setCopied] = useState(false);

  const setDuelField = (key, value) => {
    setDuel((current) => ({ ...current, [key]: value }));
    setCopied(false);
  };

  const duelResult = useMemo(
    () =>
      refereeTwoSelectors(
        {
          selector: duel.currentSelector,
          important: duel.currentImportant,
          inline: duel.currentInline,
          layer: duel.currentLayer,
        },
        {
          selector: duel.wantedSelector,
          important: duel.wantedImportant,
          inline: duel.wantedInline,
          layer: duel.wantedLayer,
        },
        { layerOrder: duel.layerOrder, wantedIsLater: duel.wantedIsLater },
      ),
    [duel],
  );

  const pasteResult = useMemo(
    () => analyseDevToolsPaste({ paste, property: pasteProperty }),
    [paste, pasteProperty],
  );

  const sheetResult = useMemo(
    () => analyseStylesheet({ css: sheet, element, property: sheetProperty, inlineValue }),
    [sheet, element, sheetProperty, inlineValue],
  );

  const active = mode === "duel" ? duelResult : mode === "devtools" ? pasteResult : sheetResult;
  const hasError = Boolean(active.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    if (mode === "duel") {
      const winnerLine =
        duelResult.winner === "tie"
          ? "Tie — the two declarations are indistinguishable."
          : `Winner: ${
              duelResult.winner === "challenger" ? duelResult.challenger.selector : duelResult.incumbent.selector
            }`;
      const lines = [
        "CSS Specificity Referee",
        winnerLine,
        `Decided by: ${CRITERION_LABELS[duelResult.criterion]}`,
        duelResult.reason,
        `Winning now: ${duelResult.incumbent.selector} = ${formatSpecificity(duelResult.incumbent.spec)}`,
        `Want to win: ${duelResult.challenger.selector} = ${formatSpecificity(duelResult.challenger.spec)}`,
      ];
      for (const flip of duelResult.flips) lines.push(`- ${flip.change}: ${flip.outcome}`);
      lines.push(SPEC_SELECTORS, SPEC_CASCADE);
      return lines.join("\n");
    }
    const lines = [
      `CSS Specificity Referee — winner for ${active.property}`,
      `${active.winner.selector} => ${active.winner.value}`,
      `Decided by: ${CRITERION_LABELS[active.criterion] || "Only one declaration"}`,
      active.reason,
      "",
      ...active.ranked.map(
        (row, index) =>
          `${index + 1}. ${row.selector} [${row.inline ? "inline" : formatSpecificity(row.spec)}]` +
          ` layer=${row.layer || "unlayered"} important=${row.important ? "yes" : "no"} -> ${row.value}`,
      ),
      SPEC_CASCADE,
    ];
    return lines.join("\n");
  }, [hasError, mode, duelResult, active]);

  const copyResult = async () => {
    if (hasError || !summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setDuel(DEFAULT_DUEL);
    setPaste(DEFAULT_PASTE);
    setPasteProperty(DEFAULT_PROPERTY);
    setSheet(DEFAULT_SHEET);
    setElement(DEFAULT_ELEMENT);
    setSheetProperty(DEFAULT_PROPERTY);
    setInlineValue("");
    setCopied(false);
  };

  const winnerLabel = hasError
    ? DASH
    : mode === "duel"
      ? duelResult.winner === "tie"
        ? "Neither — it is a tie"
        : duelResult.winner === "challenger"
          ? duelResult.challenger.selector
          : duelResult.incumbent.selector
      : active.winner.selector;

  const sideCard = (prefix, title, subtitle, side) => (
    <div className={PANEL_CLASS}>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className={HINT_CLASS}>{subtitle}</p>
      <div className="mt-3">
        <label className={LABEL_CLASS} htmlFor={`${prefix}-selector`}>
          Selector
        </label>
        <input
          id={`${prefix}-selector`}
          type="text"
          spellCheck={false}
          autoComplete="off"
          className={`mt-2 ${INPUT_CLASS}`}
          value={duel[`${prefix}Selector`]}
          disabled={duel[`${prefix}Inline`]}
          onChange={(event) => setDuelField(`${prefix}Selector`, event.target.value)}
        />
        {duel[`${prefix}Inline`] ? (
          <p className={HINT_CLASS}>A style attribute has no selector, so no specificity is counted.</p>
        ) : null}
      </div>
      <div className="mt-3">
        <label className={LABEL_CLASS} htmlFor={`${prefix}-layer`}>
          Cascade layer (blank = unlayered)
        </label>
        <input
          id={`${prefix}-layer`}
          type="text"
          spellCheck={false}
          autoComplete="off"
          placeholder="components"
          className={`mt-2 ${INPUT_CLASS}`}
          value={duel[`${prefix}Layer`]}
          disabled={duel[`${prefix}Inline`]}
          onChange={(event) => setDuelField(`${prefix}Layer`, event.target.value)}
        />
      </div>
      <div className="mt-3 grid gap-1">
        <label
          className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          htmlFor={`${prefix}-important`}
        >
          <input
            id={`${prefix}-important`}
            type="checkbox"
            className={CHECK_CLASS}
            checked={duel[`${prefix}Important`]}
            onChange={(event) => setDuelField(`${prefix}Important`, event.target.checked)}
          />
          Declared <code>!important</code>
        </label>
        <label
          className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
          htmlFor={`${prefix}-inline`}
        >
          <input
            id={`${prefix}-inline`}
            type="checkbox"
            className={CHECK_CLASS}
            checked={duel[`${prefix}Inline`]}
            onChange={(event) => setDuelField(`${prefix}Inline`, event.target.checked)}
          />
          It is a <code>style</code> attribute
        </label>
      </div>
      {!hasError && side ? (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-[var(--muted-foreground)]">Specificity</span>
          <SpecBadge spec={side.spec} />
        </div>
      ) : null}
      {!hasError && side ? <TokenTable tokens={side.tokens} /> : null}
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gavel className="h-4 w-4" aria-hidden="true" />
          Cascade referee
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">CSS Specificity Referee</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Give it the selector that is winning and the one you want to win. It returns both{" "}
          <span className="font-mono">(a,b,c)</span> triples, the cascade criterion that actually decided
          the fight, and the smallest change that flips it. Specificity is the fifth of six criteria —
          importance, style attributes and <span className="font-mono">@layer</span> are settled first.
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Comparison mode">
        {MODES.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => {
              setMode(id);
              setCopied(false);
            }}
            className={
              mode === id
                ? `${PRIMARY_BTN} flex-1 sm:flex-none`
                : `${GHOST_BTN} flex-1 sm:flex-none`
            }
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "duel" ? (
        <section className="grid gap-4 sm:grid-cols-2">
          {sideCard(
            "current",
            "Winning now",
            "The rule whose value the element is actually showing.",
            hasError ? null : duelResult.incumbent,
          )}
          {sideCard(
            "wanted",
            "Want to win",
            "The rule you expected to apply.",
            hasError ? null : duelResult.wanted,
          )}
        </section>
      ) : null}

      {mode === "duel" ? (
        <section className={`mt-4 ${PANEL_CLASS}`}>
          <h2 className="text-base font-semibold">Cascade context</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="layer-order">
                Layer order, as declared
              </label>
              <input
                id="layer-order"
                type="text"
                spellCheck={false}
                autoComplete="off"
                placeholder="reset, base, components, utilities"
                className={`mt-2 ${INPUT_CLASS}`}
                value={duel.layerOrder}
                onChange={(event) => setDuelField("layerOrder", event.target.value)}
              />
              <p className={HINT_CLASS}>
                The order from your <span className="font-mono">@layer a, b, c;</span> statement. Layers
                named above but missing here are appended in the order they appear.
              </p>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="source-order">
                Source order
              </label>
              <select
                id="source-order"
                className={`mt-2 ${INPUT_CLASS}`}
                value={duel.wantedIsLater ? "wanted" : "current"}
                onChange={(event) => setDuelField("wantedIsLater", event.target.value === "wanted")}
              >
                <option value="wanted">The wanted rule appears later</option>
                <option value="current">The winning rule appears later</option>
              </select>
              <p className={HINT_CLASS}>Only consulted when every earlier criterion ties.</p>
            </div>
          </div>
        </section>
      ) : null}

      {mode === "devtools" ? (
        <section className={PANEL_CLASS}>
          <h2 className="text-base font-semibold">Paste the DevTools Styles pane</h2>
          <p className={HINT_CLASS}>
            Copy the rules straight out of the Styles panel. Source columns like{" "}
            <span className="font-mono">style.css:42</span>, the{" "}
            <span className="font-mono">user agent stylesheet</span> label and{" "}
            <span className="font-mono">Inherited from</span> headings are stripped;{" "}
            <span className="font-mono">element.style</span> is read as a style attribute.
          </p>
          <div className="mt-3">
            <label className={LABEL_CLASS} htmlFor="paste-css">
              Styles pane
            </label>
            <textarea
              id="paste-css"
              rows={12}
              spellCheck={false}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={paste}
              onChange={(event) => {
                setPaste(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div className="mt-3 sm:max-w-xs">
            <label className={LABEL_CLASS} htmlFor="paste-property">
              Property in dispute
            </label>
            <input
              id="paste-property"
              type="text"
              spellCheck={false}
              autoComplete="off"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pasteProperty}
              onChange={(event) => {
                setPasteProperty(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </section>
      ) : null}

      {mode === "sheet" ? (
        <section className={PANEL_CLASS}>
          <h2 className="text-base font-semibold">Whole stylesheet against one element</h2>
          <p className={HINT_CLASS}>
            Every rule that sets the property on a matching element, ranked. Matching is done on the
            rightmost compound only — ancestors, combinators and states such as{" "}
            <span className="font-mono">:hover</span> cannot be checked without a live DOM and are listed
            as assumptions.
          </p>
          <div className="mt-3">
            <label className={LABEL_CLASS} htmlFor="sheet-css">
              CSS
            </label>
            <textarea
              id="sheet-css"
              rows={12}
              spellCheck={false}
              className={`mt-2 ${TEXTAREA_CLASS}`}
              value={sheet}
              onChange={(event) => {
                setSheet(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="sheet-element">
                Element
              </label>
              <input
                id="sheet-element"
                type="text"
                spellCheck={false}
                autoComplete="off"
                className={`mt-2 ${INPUT_CLASS}`}
                value={element}
                onChange={(event) => {
                  setElement(event.target.value);
                  setCopied(false);
                }}
              />
              <p className={HINT_CLASS}>
                Tag, id, classes and attributes, written like a selector:{" "}
                <span className="font-mono">button#save.btn.primary</span>.
              </p>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="sheet-property">
                Property in dispute
              </label>
              <input
                id="sheet-property"
                type="text"
                spellCheck={false}
                autoComplete="off"
                className={`mt-2 ${INPUT_CLASS}`}
                value={sheetProperty}
                onChange={(event) => {
                  setSheetProperty(event.target.value);
                  setCopied(false);
                }}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="sheet-inline">
                style attribute value for this property (optional)
              </label>
              <input
                id="sheet-inline"
                type="text"
                spellCheck={false}
                autoComplete="off"
                placeholder="hotpink  —  or  hotpink !important"
                className={`mt-2 ${INPUT_CLASS}`}
                value={inlineValue}
                onChange={(event) => {
                  setInlineValue(event.target.value);
                  setCopied(false);
                }}
              />
            </div>
          </div>
        </section>
      ) : null}

      <section className={`mt-6 ${PANEL_CLASS}`} aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Winner
            </p>
            <p className="mt-1 break-all font-mono text-2xl font-semibold leading-tight sm:text-3xl">
              {winnerLabel}
            </p>
          </div>
          {!hasError ? (
            <span className={CHIP_CLASS}>
              Decided by {CRITERION_LABELS[active.criterion] || "a single declaration"}
            </span>
          ) : null}
        </div>

        {hasError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
          >
            {active.error}
          </p>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{active.reason}</p>
        )}

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {mode === "duel" ? (
            <>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Winning now
                </dt>
                <dd className="mt-1 font-mono text-sm">
                  {hasError ? DASH : `${duelResult.incumbent.selector} = ${formatSpecificity(duelResult.incumbent.spec)}`}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Want to win
                </dt>
                <dd className="mt-1 font-mono text-sm">
                  {hasError ? DASH : `${duelResult.challenger.selector} = ${formatSpecificity(duelResult.challenger.spec)}`}
                </dd>
              </div>
            </>
          ) : (
            <>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Property
                </dt>
                <dd className="mt-1 font-mono text-sm">{hasError ? DASH : active.property}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Winning value
                </dt>
                <dd className="mt-1 font-mono text-sm">{hasError ? DASH : active.winner.value}</dd>
              </div>
            </>
          )}
        </dl>

        {!hasError && mode !== "duel" ? (
          <RankedTable rows={active.ranked} layerOrder={active.layerOrder} />
        ) : null}

        {!hasError && mode === "sheet" && sheetResult.assumptions.length ? (
          <p className={`${HINT_CLASS} mt-3`}>
            Assumed in order to match: {sheetResult.assumptions.join("; ")}.
          </p>
        ) : null}

        {!hasError && mode === "duel" && duelResult.wantedWins ? (
          <p className="mt-4 rounded-md px-3 py-2 text-sm text-[var(--success)] ring-1 ring-[var(--success)]/30">
            The selector you want already wins under these conditions.
          </p>
        ) : null}

        {!hasError && mode === "duel" && duelResult.flips.length ? (
          <div className="mt-4">
            <h3 className="text-sm font-semibold">What flips the result</h3>
            <ul className="mt-2 grid gap-2">
              {duelResult.flips.map((flip) => (
                <li
                  key={`${flip.lever}-${flip.change}`}
                  className="rounded-md border border-[var(--border)] p-3 text-sm"
                >
                  <span className="font-semibold">{flip.change}</span>
                  <span className="mt-1 block text-[var(--muted-foreground)]">{flip.outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={copyResult}
            disabled={hasError}
            aria-label="Copy the verdict to the clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied!" : "Copy verdict"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset} aria-label="Reset every field">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className={`mt-6 ${PANEL_CLASS}`}>
        <h2 className="text-base font-semibold">The order the browser sorts in</h2>
        <ol className="mt-3 grid gap-1 text-sm text-[var(--muted-foreground)]">
          <li>1. Origin and importance — an !important author declaration beats every normal one.</li>
          <li>2. Context — shadow-tree encapsulation, not modelled here.</li>
          <li>
            3. Element-attached styles — a <span className="font-mono">style</span> attribute beats any
            style rule of the same importance.
          </li>
          <li>
            4. Cascade layers — normal: the last layer wins and unlayered CSS is the implicit final
            layer; !important: reversed, the first layer wins and unlayered loses.
          </li>
          <li>5. Specificity — the higher (a,b,c), compared column by column.</li>
          <li>6. Order of appearance — the last declaration wins.</li>
        </ol>
        <p className={`${HINT_CLASS} mt-3`}>
          Rules: {SPEC_SELECTORS}; {SPEC_CASCADE}. Author origin only — user and user-agent origins,
          transitions and animations sort outside this block.
        </p>
      </section>
    </main>
  );
}
