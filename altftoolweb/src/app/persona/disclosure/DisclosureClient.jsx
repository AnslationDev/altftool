"use client";

import { useMemo, useState } from "react";
import { TriangleAlert } from "lucide-react";
import {
  buildDisclosure,
  combinedObligations,
} from "@altftool/core/persona/disclosure";
import { LANGUAGES, MARKETS, PLATFORMS } from "@altftool/core/persona/taxonomy";
import CopyBlock from "../_components/CopyBlock";
import { Disclaimer, NoteList, Stamp } from "../_components/Shell";

/* The studio links here with the combination already chosen; the page resolves
   it on the server so the obligations are server-rendered rather than corrected
   after hydration. */
export default function DisclosureClient({ initial = {} }) {
  const [market, setMarket] = useState(initial.market || "global");
  const [platform, setPlatform] = useState(initial.platform || "instagram");
  const [language, setLanguage] = useState(initial.language || "en");
  const [paid, setPaid] = useState(true);
  const [extraMarkets, setExtraMarkets] = useState([]);

  const result = useMemo(
    () => buildDisclosure({ market, platform, language, paid }),
    [market, platform, language, paid],
  );

  const combined = useMemo(
    () => combinedObligations([market, ...extraMarkets]),
    [market, extraMarkets],
  );

  const toggleMarket = (id) =>
    setExtraMarkets((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );

  return (
    <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="psn-sheet rounded-xl p-5">
        <div className="grid gap-5 lg:grid-cols-4">
          <Control label="Market" hint={result.market.regulator}>
            <select
              value={market}
              onChange={(event) => setMarket(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {MARKETS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </Control>

          <Control label="Platform" hint={result.platform.labelName}>
            <select
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {PLATFORMS.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </Control>

          <Control label="Post language" hint="Must match the post, not your dashboard">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {LANGUAGES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </Control>

          <div className="flex items-end">
            <label className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={paid}
                onChange={(event) => setPaid(event.target.checked)}
                className="h-4 w-4 accent-[var(--psn-accent)]"
              />
              Paid partnership
            </label>
          </div>
        </div>
      </div>

      {/* ------------------------------- Lines ---------------------------- */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          The wording
        </h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          {result.placement}
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <CopyBlock label="Profile bio line" text={result.profileLine} tone="tight" />
          <CopyBlock label="Caption line" text={result.captionLine} tone="tight" />
          <CopyBlock
            label="On-screen overlay"
            note={
              result.onScreenSeconds
                ? `Hold for the first ${result.onScreenSeconds} seconds`
                : "Not required on this surface"
            }
            text={result.onScreenLine}
            tone="tight"
          />
          <CopyBlock
            label="Spoken line"
            note="For video with a voiceover"
            text={result.spokenLine}
            tone="tight"
          />
        </div>
      </section>

      {/* ---------------------------- Obligations ------------------------- */}
      <section className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            What you must do
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            {result.market.summary}
          </p>
          <div className="mt-5">
            <NoteList
              items={result.obligations.map((item) => ({
                title: item.title,
                detail: item.detail,
              }))}
            />
          </div>
        </div>

        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
            <TriangleAlert
              className="h-5 w-5"
              style={{ color: "var(--psn-video)" }}
              aria-hidden="true"
            />
            Where this goes wrong
          </h2>
          <div className="mt-5">
            <NoteList
              tone="warn"
              items={result.risks.map((item) => ({
                title: item.title,
                detail: item.detail,
              }))}
            />
          </div>
        </div>
      </section>

      {/* --------------------------- Multi-market ------------------------- */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Posting into more than one market
        </h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          An account with a spread audience is subject to all of them at once.
          Add the other markets in your top five audience countries and the list
          becomes the union — the strictest-rule-wins version you should actually
          run.
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {MARKETS.filter((entry) => entry.id !== market).map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={extraMarkets.includes(entry.id)}
              onClick={() => toggleMarket(entry.id)}
              className="psn-option rounded-full px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {entry.label}
            </button>
          ))}
        </div>

        <ul className="mt-5 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {combined.map((item) => (
            <li
              key={`${item.market.id}-${item.text}`}
              className="grid gap-1 bg-background p-4 sm:grid-cols-[9rem_1fr]"
            >
              <Stamp className="pt-0.5">{item.market.label}</Stamp>
              <span className="text-[15px] leading-relaxed text-foreground">
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Disclaimer>{result.disclaimer}</Disclaimer>
    </div>
  );
}

function Control({ label, hint, children }) {
  return (
    <div>
      <label className="block">
        <span className="psn-stamp mb-2 block">{label}</span>
        {children}
      </label>
      {hint ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
