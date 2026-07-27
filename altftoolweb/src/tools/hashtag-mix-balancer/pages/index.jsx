"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Hash, RotateCcw } from "lucide-react";

import {
  ACCOUNT_SIZES,
  INSTAGRAM_MAX_HASHTAGS,
  RECOMMENDED_MAX_HASHTAGS,
  RECOMMENDED_MIN_HASHTAGS,
  balanceHashtags,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");
const PCT = new Intl.NumberFormat("en-IN", { style: "percent", maximumFractionDigits: 0 });
const DASH = "—";

const DEFAULTS = {
  rawTags:
    "#travel 12M\n#travelgram 900k\n#solotravel 3.2M\n#hiddengems 45k\n#offbeatindia 22k\n#keralatravel 8k\n#kochifoodwalk 400\n#slowtraveldiaries 1.4k\n#wanderwithmeh 120",
  brand: "wanderwithmeh",
  accountSizeId: "small",
  setSize: "5",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [rawTags, setRawTags] = useState(DEFAULTS.rawTags);
  const [brand, setBrand] = useState(DEFAULTS.brand);
  const [accountSizeId, setAccountSizeId] = useState(DEFAULTS.accountSizeId);
  const [setSize, setSetSize] = useState(DEFAULTS.setSize);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      balanceHashtags({
        rawTags,
        brand,
        accountSizeId,
        setSize: Number(setSize),
      }),
    [rawTags, brand, accountSizeId, setSize],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError || !result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRawTags(DEFAULTS.rawTags);
    setBrand(DEFAULTS.brand);
    setAccountSizeId(DEFAULTS.accountSizeId);
    setSetSize(DEFAULTS.setSize);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Hash className="h-4 w-4" aria-hidden="true" />
          Hashtag strategy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Hashtag Mix Balancer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste hashtags with their post counts. They get tiered from mega to ultra-niche and
          assembled into a set weighted for the size of your account.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div>
          <label className={LABEL_CLASS} htmlFor="mix-tags">
            Hashtags and post counts — one per line, e.g. &quot;#travel 12M&quot;
          </label>
          <textarea
            id="mix-tags"
            className={`mt-2 ${TEXTAREA_CLASS}`}
            rows={8}
            value={rawTags}
            onChange={(event) => setRawTags(event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mix-brand">
              Your branded tags
            </label>
            <input
              id="mix-brand"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mix-size">
              Hashtags in the set (1-{INSTAGRAM_MAX_HASHTAGS})
            </label>
            <input
              id="mix-size"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={INSTAGRAM_MAX_HASHTAGS}
              step="1"
              value={setSize}
              onChange={(event) => setSetSize(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mix-account">
              Account size
            </label>
            <select
              id="mix-account"
              className={`mt-2 ${INPUT_CLASS}`}
              value={accountSizeId}
              onChange={(event) => setAccountSizeId(event.target.value)}
            >
              {ACCOUNT_SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Balanced set
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.picked.length} tags`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `Chosen from ${NUM.format(result.totalAvailable)} candidates for ${result.account.label.toLowerCase()}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the balanced hashtag set"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy set"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the hashtag balancer"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {result.picked.map((item) => (
              <li
                key={item.tag}
                className="inline-flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-sm"
              >
                <span className="font-semibold">{item.tag}</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {item.tierLabel}
                  {item.volume !== null ? ` · ${NUM.format(item.volume)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Branded tags found", hasError ? DASH : String(result.branded.length)],
            ["Tags without a post count", hasError ? DASH : String(result.unknown.length)],
            [
              "Recommended per post",
              `${RECOMMENDED_MIN_HASHTAGS}-${RECOMMENDED_MAX_HASHTAGS} (Instagram guidance)`,
            ],
            ["Platform maximum", `${INSTAGRAM_MAX_HASHTAGS} on Instagram`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.output && (
          <div className="mt-4 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6">
              {result.output}
            </pre>
          </div>
        )}
      </section>

      {!hasError && result.notes.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Notes</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Tier balance</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Tier
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Target
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    In set
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Available
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.mixRows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-semibold">{row.label}</span>
                      <span className="block text-xs text-[var(--muted-foreground)]">
                        {row.blurb}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.targetCount} ({PCT.format(row.targetShare)})
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold">{row.count}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {row.available}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Tier thresholds are based on how many posts already carry a hashtag; the target split by
        account size is a planning heuristic, not a published platform rule. Post counts change
        constantly — re-check the ones you rely on every few months.
      </p>
    </main>
  );
}
