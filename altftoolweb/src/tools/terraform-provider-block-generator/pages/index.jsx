"use client";

import { useMemo, useState } from "react";
import { Blocks, Check, Copy, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  CONSTRAINT_STYLES,
  DEFAULT_REQUIRED_VERSION,
  PROVIDER_CATALOG,
  expandSource,
  generateTerraformConfig,
  getCatalogEntry,
} from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const makeProvider = (id, catalogKey, configIds) => {
  const entry = getCatalogEntry(catalogKey) || PROVIDER_CATALOG[0];
  return {
    id,
    catalogKey: entry.localName,
    localName: entry.localName,
    source: entry.source,
    version: entry.version,
    styleId: "pessimistic",
    configurations: [{ id: configIds[0], alias: "", args: entry.defaultArgs }],
  };
};

const INITIAL_PROVIDERS = [
  {
    ...makeProvider(1, "aws", [101]),
    configurations: [
      { id: 101, alias: "", args: 'region = "us-east-1"' },
      { id: 102, alias: "eu", args: 'region = "eu-west-1"' },
    ],
  },
  makeProvider(2, "random", [103]),
];

const INITIAL_STATE = {
  requiredVersion: DEFAULT_REQUIRED_VERSION,
  forModule: false,
  providers: INITIAL_PROVIDERS,
  nextId: 200,
};

export default function ToolHome() {
  const [requiredVersion, setRequiredVersion] = useState(INITIAL_STATE.requiredVersion);
  const [forModule, setForModule] = useState(INITIAL_STATE.forModule);
  const [providers, setProviders] = useState(INITIAL_STATE.providers);
  const [nextId, setNextId] = useState(INITIAL_STATE.nextId);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => generateTerraformConfig({ requiredVersion, forModule, providers }),
    [requiredVersion, forModule, providers],
  );

  const failed = Boolean(result.error);

  const patchProvider = (id, patch) => {
    setProviders((previous) => previous.map((provider) => (provider.id === id ? { ...provider, ...patch } : provider)));
    setCopied(false);
  };

  const chooseCatalog = (id, catalogKey) => {
    const entry = getCatalogEntry(catalogKey);
    if (!entry) {
      patchProvider(id, { catalogKey: "custom" });
      return;
    }
    setProviders((previous) =>
      previous.map((provider) =>
        provider.id === id
          ? {
              ...provider,
              catalogKey,
              localName: entry.localName,
              source: entry.source,
              version: entry.version,
              configurations: provider.configurations.map((configuration, index) =>
                index === 0 ? { ...configuration, args: entry.defaultArgs } : configuration,
              ),
            }
          : provider,
      ),
    );
    setCopied(false);
  };

  const addProvider = () => {
    setProviders((previous) => [...previous, makeProvider(nextId, "google", [nextId + 1])]);
    setNextId((value) => value + 2);
    setCopied(false);
  };

  const removeProvider = (id) => {
    setProviders((previous) => previous.filter((provider) => provider.id !== id));
    setCopied(false);
  };

  const addConfiguration = (providerId) => {
    setProviders((previous) =>
      previous.map((provider) =>
        provider.id === providerId
          ? {
              ...provider,
              configurations: [...provider.configurations, { id: nextId, alias: "", args: "" }],
            }
          : provider,
      ),
    );
    setNextId((value) => value + 1);
    setCopied(false);
  };

  const patchConfiguration = (providerId, configId, patch) => {
    setProviders((previous) =>
      previous.map((provider) =>
        provider.id === providerId
          ? {
              ...provider,
              configurations: provider.configurations.map((configuration) =>
                configuration.id === configId ? { ...configuration, ...patch } : configuration,
              ),
            }
          : provider,
      ),
    );
    setCopied(false);
  };

  const removeConfiguration = (providerId, configId) => {
    setProviders((previous) =>
      previous.map((provider) =>
        provider.id === providerId
          ? {
              ...provider,
              configurations: provider.configurations.filter((configuration) => configuration.id !== configId),
            }
          : provider,
      ),
    );
    setCopied(false);
  };

  const reset = () => {
    setRequiredVersion(INITIAL_STATE.requiredVersion);
    setForModule(INITIAL_STATE.forModule);
    setProviders(INITIAL_STATE.providers);
    setNextId(INITIAL_STATE.nextId);
    setCopied(false);
  };

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.hcl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const rows = failed
    ? [
        ["Providers required", DASH],
        ["Provider blocks", DASH],
        ["Aliased configurations", DASH],
        ["required_version", DASH],
        ["Lines of HCL", DASH],
      ]
    : [
        ["Providers required", NUM.format(result.providerCount)],
        [
          "Provider blocks",
          result.forModule ? "None — child modules inherit them" : NUM.format(result.providerBlockCount),
        ],
        ["Aliased configurations", NUM.format(result.aliasCount)],
        ["required_version", result.requiredVersion === "" ? "Not constrained" : result.requiredVersion],
        ["Lines of HCL", NUM.format(result.lineCount)],
      ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Blocks className="h-4 w-4" aria-hidden="true" />
          Terraform HCL
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Terraform Provider Block Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build the <code>terraform</code> block, the <code>required_providers</code> map and every{" "}
          <code>provider</code> block — with real registry source addresses, version constraints and alias
          configurations, formatted the way <code>terraform fmt</code> would leave them.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Root settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="tf-required-version">
              required_version constraint
            </label>
            <input
              id="tf-required-version"
              type="text"
              className={`mt-2 ${INPUT_CLASS}`}
              placeholder=">= 1.5.0"
              value={requiredVersion}
              onChange={(event) => {
                setRequiredVersion(event.target.value);
                setCopied(false);
              }}
            />
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Leave blank to omit it. Applies to the Terraform CLI, not to the providers.
            </p>
          </div>
          <div>
            <span className={LABEL_CLASS}>Where this configuration lives</span>
            <label
              htmlFor="tf-for-module"
              className="mt-2 flex min-h-11 items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm"
            >
              <input
                id="tf-for-module"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={forModule}
                onChange={(event) => {
                  setForModule(event.target.checked);
                  setCopied(false);
                }}
              />
              This is a reusable child module
            </label>
            <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
              Child modules declare <code>configuration_aliases</code> instead of writing their own provider blocks.
            </p>
          </div>
        </div>
      </section>

      {providers.map((provider, providerIndex) => (
        <section key={provider.id} className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Provider {NUM.format(providerIndex + 1)}</h2>
            {providers.length > 1 && (
              <button
                type="button"
                onClick={() => removeProvider(provider.id)}
                aria-label={`Remove provider ${provider.localName || providerIndex + 1}`}
                className={GHOST_BTN}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor={`tf-catalog-${provider.id}`}>
                Provider
              </label>
              <select
                id={`tf-catalog-${provider.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                value={provider.catalogKey}
                onChange={(event) => chooseCatalog(provider.id, event.target.value)}
              >
                {PROVIDER_CATALOG.map((entry) => (
                  <option key={entry.localName} value={entry.localName}>
                    {entry.label} ({entry.source})
                  </option>
                ))}
                <option value="custom">Custom provider</option>
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`tf-local-${provider.id}`}>
                Local name
              </label>
              <input
                id={`tf-local-${provider.id}`}
                type="text"
                className={`mt-2 ${INPUT_CLASS}`}
                value={provider.localName}
                onChange={(event) => patchProvider(provider.id, { localName: event.target.value, catalogKey: "custom" })}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`tf-source-${provider.id}`}>
                Source address
              </label>
              <input
                id={`tf-source-${provider.id}`}
                type="text"
                className={`mt-2 ${INPUT_CLASS}`}
                placeholder="hashicorp/aws"
                value={provider.source}
                onChange={(event) => patchProvider(provider.id, { source: event.target.value, catalogKey: "custom" })}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`tf-version-${provider.id}`}>
                Version
              </label>
              <input
                id={`tf-version-${provider.id}`}
                type="text"
                inputMode="decimal"
                className={`mt-2 ${INPUT_CLASS}`}
                placeholder="5.31.0"
                value={provider.version}
                onChange={(event) => patchProvider(provider.id, { version: event.target.value })}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor={`tf-style-${provider.id}`}>
                Constraint style
              </label>
              <select
                id={`tf-style-${provider.id}`}
                className={`mt-2 ${INPUT_CLASS}`}
                value={provider.styleId}
                onChange={(event) => patchProvider(provider.id, { styleId: event.target.value })}
              >
                {CONSTRAINT_STYLES.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 break-words text-[var(--muted-foreground)]">
            Resolves to <code>{expandSource(provider.source) || "an invalid source address"}</code>
          </p>

          <div className="mt-5 space-y-4">
            {provider.configurations.map((configuration, configIndex) => (
              <div key={configuration.id} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                    {configuration.alias.trim() === ""
                      ? "Default configuration"
                      : `Alias ${provider.localName}.${configuration.alias.trim()}`}
                  </p>
                  {provider.configurations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeConfiguration(provider.id, configuration.id)}
                      aria-label={`Remove configuration ${configIndex + 1} of ${provider.localName}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      Remove
                    </button>
                  )}
                </div>
                <div className="mt-3 grid gap-4">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`tf-alias-${configuration.id}`}>
                      Alias (blank for the default configuration)
                    </label>
                    <input
                      id={`tf-alias-${configuration.id}`}
                      type="text"
                      className={`mt-2 ${INPUT_CLASS}`}
                      placeholder="eu"
                      value={configuration.alias}
                      onChange={(event) =>
                        patchConfiguration(provider.id, configuration.id, { alias: event.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`tf-args-${configuration.id}`}>
                      Arguments, one per line
                    </label>
                    <textarea
                      id={`tf-args-${configuration.id}`}
                      rows={3}
                      className={`mt-2 ${TEXTAREA_CLASS}`}
                      placeholder={'region = "eu-west-1"'}
                      value={configuration.args}
                      onChange={(event) =>
                        patchConfiguration(provider.id, configuration.id, { args: event.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => addConfiguration(provider.id)} className={`mt-4 ${GHOST_BTN}`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add aliased configuration
          </button>
        </section>
      ))}

      <button type="button" onClick={addProvider} className={`mt-6 w-full sm:w-auto ${GHOST_BTN}`}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add another provider
      </button>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Generated configuration
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${NUM.format(result.lineCount)} lines`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the problem below to generate the HCL."
                : `${NUM.format(result.providerCount)} provider${result.providerCount === 1 ? "" : "s"} required, ${NUM.format(result.providerBlockCount)} provider block${result.providerBlockCount === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the generated Terraform configuration to the clipboard"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy HCL"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the generator to its defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {failed && (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {result.error}
          </p>
        )}

        {!failed && result.warnings.length > 0 && (
          <ul role="status" className="mt-4 space-y-2">
            {result.warnings.map((warning) => (
              <li key={warning} className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
                {warning}
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-words">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <>
            <div className="mt-5 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <pre className="font-mono text-sm leading-6 text-[var(--foreground)]">{result.hcl}</pre>
            </div>

            <ul className="mt-4 space-y-1 text-xs leading-5 text-[var(--muted-foreground)]">
              {result.providers.map((provider) => (
                <li key={provider.localName}>
                  <strong className="text-[var(--foreground)]">{provider.localName}</strong> — {provider.explanation}
                </li>
              ))}
            </ul>

            {result.referenceLines.length > 0 && (
              <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
                Select an aliased configuration on a resource with{" "}
                {result.referenceLines.map((line, index) => (
                  <span key={line}>
                    {index > 0 ? ", " : ""}
                    <code>{line}</code>
                  </span>
                ))}
                .
              </p>
            )}
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Source addresses default to the public registry at registry.terraform.io when no hostname is given. Catalogue
        versions are a starting point — check the registry for the release you want before pinning. Everything runs in
        your browser.
      </p>
    </main>
  );
}
