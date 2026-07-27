"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, RotateCcw } from "lucide-react";

import { RECOMMENDED_MAX_KEY_LENGTH, SEPARATORS, buildRedisKeyConvention } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_CLASS =
  "h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DEFAULTS = {
  app: "shop",
  includeEnv: true,
  env: "prod",
  includeTenant: true,
  tenant: "acme",
  includeVersion: false,
  version: "v1",
  entity: "user",
  sampleId: "1000",
  attribute: "profile",
  clusterHashTag: false,
  separator: ":",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => buildRedisKeyConvention(form), [form]);
  const hasError = Boolean(result.error);

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(`Template: ${result.template}\nExample:  ${result.example}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          NoSQL design
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Redis Key Naming Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Design a namespaced key convention — app, environment, tenant, version, entity, id — with
          optional Redis Cluster hash tags, validated against key hygiene rules.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rk-app">
              App namespace
            </label>
            <input id="rk-app" className={`mt-2 font-mono ${INPUT_CLASS}`} type="text" value={form.app} onChange={set("app")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rk-sep">
              Separator
            </label>
            <select id="rk-sep" className={`mt-2 ${INPUT_CLASS}`} value={form.separator} onChange={set("separator")}>
              {SEPARATORS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rk-entity">
              Entity (object type)
            </label>
            <input id="rk-entity" className={`mt-2 font-mono ${INPUT_CLASS}`} type="text" value={form.entity} onChange={set("entity")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rk-id">
              Sample object id
            </label>
            <input id="rk-id" className={`mt-2 font-mono ${INPUT_CLASS}`} type="text" value={form.sampleId} onChange={set("sampleId")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="rk-attr">
              Trailing attribute (optional, e.g. profile, followers)
            </label>
            <input id="rk-attr" className={`mt-2 font-mono ${INPUT_CLASS}`} type="text" value={form.attribute} onChange={set("attribute")} />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="rk-envon" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
              <input id="rk-envon" type="checkbox" className={CHECK_CLASS} checked={form.includeEnv} onChange={set("includeEnv")} />
              Environment segment
            </label>
            {form.includeEnv ? (
              <div className="mt-1">
                <label className="sr-only" htmlFor="rk-env">
                  Environment value
                </label>
                <input id="rk-env" className={`font-mono ${INPUT_CLASS}`} type="text" value={form.env} onChange={set("env")} placeholder="prod" />
              </div>
            ) : null}
          </div>
          <div>
            <label htmlFor="rk-tenon" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
              <input id="rk-tenon" type="checkbox" className={CHECK_CLASS} checked={form.includeTenant} onChange={set("includeTenant")} />
              Tenant segment (multi-tenant)
            </label>
            {form.includeTenant ? (
              <div className="mt-1">
                <label className="sr-only" htmlFor="rk-tenant">
                  Sample tenant id
                </label>
                <input id="rk-tenant" className={`font-mono ${INPUT_CLASS}`} type="text" value={form.tenant} onChange={set("tenant")} placeholder="acme" />
              </div>
            ) : null}
          </div>
          <div>
            <label htmlFor="rk-veron" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
              <input id="rk-veron" type="checkbox" className={CHECK_CLASS} checked={form.includeVersion} onChange={set("includeVersion")} />
              Schema version segment
            </label>
            {form.includeVersion ? (
              <div className="mt-1">
                <label className="sr-only" htmlFor="rk-version">
                  Version value
                </label>
                <input id="rk-version" className={`font-mono ${INPUT_CLASS}`} type="text" value={form.version} onChange={set("version")} placeholder="v1" />
              </div>
            ) : null}
          </div>
          <div>
            <label htmlFor="rk-hash" className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
              <input id="rk-hash" type="checkbox" className={CHECK_CLASS} checked={form.clusterHashTag} onChange={set("clusterHashTag")} />
              Redis Cluster hash tag {"{…}"}
            </label>
          </div>
        </div>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Example key
            </p>
            <p className="mt-1 break-all font-mono text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : result.example}
            </p>
            <p className="mt-1 break-all font-mono text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the template." : `Template: ${result.template}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the key template and example"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy convention"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(hasError ? [] : result.segments).map((segment, index) => (
            <div key={`${segment.label}-${index}`} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{segment.label}</dt>
              <dd className="text-right font-mono font-semibold">{segment.value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Key length</dt>
            <dd className="text-right font-semibold">
              {hasError ? DASH : `${result.length} characters (guideline ≤ ${RECOMMENDED_MAX_KEY_LENGTH})`}
            </dd>
          </div>
        </dl>

        {!hasError && result.warnings.length > 0 ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Redis allows keys up to 512 MB, but the docs recommend short object-type:id schemes like
        user:1000. Hash tags {"{…}"} are only meaningful on Redis Cluster, where the slot is computed
        from the tagged substring.
      </p>
    </main>
  );
}
