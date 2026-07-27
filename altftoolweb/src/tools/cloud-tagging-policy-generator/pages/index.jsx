"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tags } from "lucide-react";

import { OPTIONAL_TAGS, PROVIDERS, generateTaggingPolicy } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  orgPrefix: "acme",
  providerId: "aws",
  environments: "prod, staging, dev",
  costCenters: "cc-1010, cc-2040",
  ownerDomain: "acme.com",
  optionalIds: ["managed-by"],
};

const DASH = "—";

export default function ToolHome() {
  const [orgPrefix, setOrgPrefix] = useState(DEFAULTS.orgPrefix);
  const [providerId, setProviderId] = useState(DEFAULTS.providerId);
  const [environments, setEnvironments] = useState(DEFAULTS.environments);
  const [costCenters, setCostCenters] = useState(DEFAULTS.costCenters);
  const [ownerDomain, setOwnerDomain] = useState(DEFAULTS.ownerDomain);
  const [optionalIds, setOptionalIds] = useState(DEFAULTS.optionalIds);
  const [format, setFormat] = useState("markdown");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateTaggingPolicy({
        orgPrefix,
        providerId,
        environments,
        costCenters,
        ownerDomain,
        optionalIds,
      }),
    [orgPrefix, providerId, environments, costCenters, ownerDomain, optionalIds],
  );

  const hasError = Boolean(result.error);
  const output = hasError ? "" : format === "markdown" ? result.markdown : result.json;

  const toggleOptional = (id) => {
    setOptionalIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyResult = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setOrgPrefix(DEFAULTS.orgPrefix);
    setProviderId(DEFAULTS.providerId);
    setEnvironments(DEFAULTS.environments);
    setCostCenters(DEFAULTS.costCenters);
    setOwnerDomain(DEFAULTS.ownerDomain);
    setOptionalIds(DEFAULTS.optionalIds);
    setFormat("markdown");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Tags className="h-4 w-4" aria-hidden="true" />
          FinOps
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Cloud Tagging Policy Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Produce a mandatory tag schema for cost allocation — environment, owner, cost centre,
          application and project — with keys that respect your provider&apos;s tag limits,
          allowed-value lists and an enforcement recipe.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-prefix">
              Org prefix (namespace)
            </label>
            <input
              id="tp-prefix"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={orgPrefix}
              onChange={(event) => setOrgPrefix(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-provider">
              Cloud provider
            </label>
            <select
              id="tp-provider"
              className={`mt-2 ${INPUT_CLASS}`}
              value={providerId}
              onChange={(event) => setProviderId(event.target.value)}
            >
              {PROVIDERS.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-envs">
              Environments (comma separated)
            </label>
            <input
              id="tp-envs"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={environments}
              onChange={(event) => setEnvironments(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="tp-cc">
              Cost-centre codes (comma separated)
            </label>
            <input
              id="tp-cc"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={costCenters}
              onChange={(event) => setCostCenters(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="tp-domain">
              Owner email domain
            </label>
            <input
              id="tp-domain"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={ownerDomain}
              onChange={(event) => setOwnerDomain(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Optional tags to include
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {OPTIONAL_TAGS.map((tag) => (
              <label
                key={tag.id}
                htmlFor={`tp-opt-${tag.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
              >
                <input
                  id={`tp-opt-${tag.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={optionalIds.includes(tag.id)}
                  onChange={() => toggleOptional(tag.id)}
                />
                <span>
                  <span className="font-semibold">{tag.key}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">
                    {tag.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Tags in the policy
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.totalCount}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the policy."
                : `${result.mandatoryCount} mandatory + ${result.optionalCount} optional, generated for ${result.provider}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated tagging policy"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy policy"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2" role="group" aria-label="Output format">
          {[
            ["markdown", "Markdown"],
            ["json", "JSON"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFormat(id)}
              aria-pressed={format === id}
              className={format === id ? PRIMARY_BTN : GHOST_BTN}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[320px] whitespace-pre p-4 text-xs leading-5 text-[var(--foreground)]">
            {hasError ? DASH : output}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Key limits encoded per provider documentation: AWS keys up to 128 characters, Azure 512,
        Google Cloud labels 63 (lowercase only). Review the generated policy with your finance team
        before enforcing it — quarantine and deletion rules are a starting point, not a mandate.
      </p>
    </main>
  );
}
