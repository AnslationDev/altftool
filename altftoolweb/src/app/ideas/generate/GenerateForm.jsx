"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Shuffle } from "lucide-react";

/*
 * The generator is a navigator over the DNA space, not a prompt box.
 *
 * Every competitor's generator calls a model and hands back prose nobody has
 * checked. Ours resolves to real records that already carry a score, market
 * figures, competitors and risks — so the output can be argued with.
 */
export default function GenerateForm({ verticals, jobs, mechanisms, models, efforts }) {
  const router = useRouter();
  const params = useSearchParams();

  const [state, setState] = useState({
    v: params.get("v") ?? "",
    j: params.get("j") ?? "",
    m: params.get("m") ?? "",
    e: params.get("e") ?? "",
    mo: params.get("mo") ?? "",
  });

  function push(next) {
    const q = new URLSearchParams();
    for (const [k, val] of Object.entries(next)) if (val) q.set(k, val);
    router.push(`/ideas/generate${q.toString() ? `?${q}` : ""}`);
  }

  function submit(event) {
    event.preventDefault();
    push(state);
  }

  /* "Surprise me" is the point of a generator — it should land somewhere the
     user would not have thought to look, so it picks a full combination
     rather than nudging one field. */
  function surprise() {
    const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const next = { v: pickOne(verticals).slug, j: pickOne(jobs).slug, m: "", e: "", mo: "" };
    setState(next);
    push(next);
  }

  function reset() {
    const next = { v: "", j: "", m: "", e: "", mo: "" };
    setState(next);
    push(next);
  }

  const field = (id, label, options, placeholder) => (
    <div>
      <label
        htmlFor={`gen-${id}`}
        className="mb-1.5 block font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted-foreground"
      >
        {label}
      </label>
      <select
        id={`gen-${id}`}
        value={state[id]}
        onChange={(e) => setState((s) => ({ ...s, [id]: e.target.value }))}
        className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.slug} value={o.slug}>
            {o.name}
            {o.count != null ? ` (${o.count.toLocaleString("en-US")})` : ""}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-canvas p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {field("v", "Industry", verticals, "Any industry")}
        {field("j", "Job to replace", jobs, "Any job")}
        {field("m", "Mechanism", mechanisms, "Any mechanism")}
        {field("mo", "Revenue model", models, "Any model")}
        {field("e", "Build effort", efforts, "Any effort")}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <button
          type="submit"
          className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-[0.9375rem] font-semibold text-primary-foreground transition hover:bg-primary-hover"
        >
          Find ideas
        </button>
        <button
          type="button"
          onClick={surprise}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-5 text-[0.9375rem] font-medium text-foreground transition hover:border-border-strong hover:bg-surface-soft"
        >
          <Shuffle className="h-4 w-4" aria-hidden="true" />
          Surprise me
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-lg px-3 text-[0.9375rem] font-medium text-muted-foreground transition hover:text-foreground"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
