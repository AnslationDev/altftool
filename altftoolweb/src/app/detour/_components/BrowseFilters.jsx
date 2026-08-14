"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";

/*
 * Filter controls for the browse page.
 *
 * State lives in the URL rather than in React, which costs a navigation per
 * change but buys three things worth more than the milliseconds: every filtered
 * view is linkable, the back button behaves, and the results are server-rendered
 * so they are crawlable and work with JavaScript disabled.
 *
 * `scroll: false` on the push keeps the viewport where it is — re-anchoring to
 * the top of the page after ticking a box is the single most irritating thing a
 * filter UI can do.
 *
 * Taxonomy arrives as props rather than being imported. Importing it here would
 * pull all 91 categories' intro and metaDescription copy into the client bundle
 * — tens of kilobytes of prose to render a <select> of names — because bundlers
 * cannot tree-shake unused fields out of a data object.
 */

export default function BrowseFilters({ counts, families, vibes, timeBands }) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key, value) => {
      const next = new URLSearchParams(params.toString());
      if (value === null || value === "" || next.get(key) === value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      next.delete("page"); // A narrower filter invalidates the page number.
      const query = next.toString();
      router.push(query ? `/detour/browse?${query}` : "/detour/browse", {
        scroll: false,
      });
    },
    [params, router],
  );

  const toggleFlag = useCallback(
    (key) => update(key, params.get(key) === "1" ? null : "1"),
    [params, update],
  );

  const active = {
    time: params.get("time"),
    vibe: params.get("vibe"),
    category: params.get("category"),
    sfw: params.get("sfw") === "1",
    silent: params.get("silent") === "1",
    mobile: params.get("mobile") === "1",
    noaccount: params.get("noaccount") === "1",
    originals: params.get("originals") === "1",
  };

  const hasFilters = Object.values(active).some(Boolean);

  const chip = (isActive) =>
    `rounded-full border px-3 py-1.5 text-xs transition-colors ${
      isActive
        ? "border-[var(--dtr-accent)] bg-[var(--dtr-accent-soft)] font-semibold text-[var(--dtr-accent-text)]"
        : "border-border hover:bg-muted"
    }`;

  return (
    <div className="space-y-5 rounded-xl border border-border bg-card p-4">
      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Time
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {timeBands.map((band) => (
            <button
              key={band.id}
              type="button"
              onClick={() => update("time", band.id)}
              aria-pressed={active.time === band.id}
              className={chip(active.time === band.id)}
            >
              {band.label}
              <span className="ml-1.5 font-mono opacity-60">
                {counts.timeToJoy[band.id]}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Mood
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {vibes.map((vibe) => (
            <button
              key={vibe.id}
              type="button"
              onClick={() => update("vibe", vibe.id)}
              aria-pressed={active.vibe === vibe.id}
              className={chip(active.vibe === vibe.id)}
            >
              <span aria-hidden="true">{vibe.emoji}</span> {vibe.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Practicalities
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggleFlag("sfw")}
            aria-pressed={active.sfw}
            className={chip(active.sfw)}
          >
            Safe for work
          </button>
          <button
            type="button"
            onClick={() => toggleFlag("silent")}
            aria-pressed={active.silent}
            className={chip(active.silent)}
          >
            No sound needed
          </button>
          <button
            type="button"
            onClick={() => toggleFlag("mobile")}
            aria-pressed={active.mobile}
            className={chip(active.mobile)}
          >
            Works on phone
          </button>
          <button
            type="button"
            onClick={() => toggleFlag("noaccount")}
            aria-pressed={active.noaccount}
            className={chip(active.noaccount)}
          >
            No sign-up
          </button>
          <button
            type="button"
            onClick={() => toggleFlag("originals")}
            aria-pressed={active.originals}
            className={chip(active.originals)}
          >
            AltF originals
          </button>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Category
        </legend>
        <label className="sr-only" htmlFor="dtr-category">
          Filter by category
        </label>
        <select
          id="dtr-category"
          value={active.category ?? ""}
          onChange={(event) => update("category", event.target.value || null)}
          className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {families.map((family) => (
            <optgroup key={family.id} label={family.name}>
              {family.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({counts.category[category.id]})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </fieldset>

      {hasFilters ? (
        <button
          type="button"
          onClick={() => router.push("/detour/browse", { scroll: false })}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear all filters
        </button>
      ) : null}
    </div>
  );
}
