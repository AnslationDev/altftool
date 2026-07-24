"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Download,
  ExternalLink,
  FileJson2,
  Info,
  ListTree,
  RotateCcw,
  Upload,
} from "lucide-react";

import {
  npmInventoryLimits,
  parseNpmSupplyChainInventory,
} from "../../_shared/npmSupplyChainInventory.mjs";
import { generateCycloneDxSbom } from "../lib/cycloneDxGenerator.mjs";

const SAMPLE = JSON.stringify(
  {
    name: "sample-app",
    lockfileVersion: 3,
    packages: {
      "": {
        name: "sample-app",
        version: "1.0.0",
        dependencies: { alpha: "^2.0.0" },
        devDependencies: { beta: "^3.0.0" },
      },
      "node_modules/alpha": {
        version: "2.1.0",
        license: "Apache-2.0",
        integrity: "sha512-local-example",
      },
      "node_modules/beta": { version: "3.2.0", license: "MIT", dev: true },
      "node_modules/alpha/node_modules/gamma": {
        version: "4.0.0",
        license: "BSD-3-Clause",
      },
    },
  },
  null,
  2,
);

const PREVIEW_LIMIT = 50_000;

function downloadBom(bom) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(bom, null, 2)], {
      type: "application/vnd.cyclonedx+json;charset=utf-8",
    }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "bom.cdx.json";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export default function SbomGenerator() {
  const [source, setSource] = useState("");
  const [fileName, setFileName] = useState("");
  const [includeVolatileMetadata, setIncludeVolatileMetadata] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function generate() {
    try {
      const inventory = parseNpmSupplyChainInventory(source, { fileName });
      let options = { metadataPolicy: "omit" };
      if (includeVolatileMetadata) {
        const id = globalThis.crypto?.randomUUID?.();
        if (!id) {
          throw new Error("This browser cannot create a secure random UUID.");
        }
        options = {
          metadataPolicy: "provided",
          serialNumber: `urn:uuid:${id}`,
          timestamp: new Date().toISOString(),
        };
      }
      setResult(generateCycloneDxSbom(inventory, options));
      setError("");
    } catch (generationError) {
      setResult(null);
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Unable to generate the SBOM.",
      );
    }
  }

  async function loadFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > npmInventoryLimits.maxFileBytes) {
      setError(
        `File exceeds the ${npmInventoryLimits.maxFileBytes.toLocaleString("en-US")}-byte limit.`,
      );
      return;
    }
    setSource(await file.text());
    setFileName(file.name);
    setResult(null);
    setError("");
  }

  function reset() {
    setSource("");
    setFileName("");
    setIncludeVolatileMetadata(false);
    setResult(null);
    setError("");
  }

  const serializedBom = result ? JSON.stringify(result.bom, null, 2) : "";
  const previewIsTruncated = serializedBom.length > PREVIEW_LIMIT;

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <header className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-pill bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <ListTree className="h-4 w-4" aria-hidden="true" />
              Local CycloneDX JSON
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">
              SBOM Generator
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Convert bounded npm manifest or lockfile data into a CycloneDX 1.7
              inventory. The generated composition is deliberately marked
              incomplete.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-soft p-4 text-sm leading-relaxed text-muted-foreground lg:max-w-sm">
            <p className="font-bold text-foreground">Honest scope</p>
            <p className="mt-1">
              This browser tool does not inspect node_modules, resolve ranges,
              reconstruct every nested edge, sign the result, or claim a
              complete installation.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Source JSON</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                package.json, package-lock.json, or npm-shrinkwrap.json
              </p>
            </div>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground focus-within:ring-2 focus-within:ring-primary">
              <Upload className="h-4 w-4" aria-hidden="true" />
              Choose JSON
              <input
                className="sr-only"
                type="file"
                accept=".json,application/json"
                onChange={loadFile}
              />
            </label>
          </div>
          {fileName ? (
            <p className="mt-3 text-xs font-semibold text-primary">
              Loaded: {fileName}
            </p>
          ) : null}
          <label
            className="mt-4 block text-sm font-bold text-foreground"
            htmlFor="sbom-source"
          >
            Manifest or lockfile
          </label>
          <textarea
            id="sbom-source"
            className="mt-2 min-h-80 w-full resize-y rounded-lg border border-border bg-canvas p-4 font-mono text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            value={source}
            maxLength={npmInventoryLimits.maxSourceCharacters}
            spellCheck={false}
            onChange={(event) => {
              setSource(event.target.value);
              setFileName("");
              setResult(null);
              setError("");
            }}
            placeholder="Paste npm JSON…"
          />
          <div className="mt-2 flex justify-between gap-3 text-xs text-muted-foreground">
            <span>{source.length.toLocaleString("en-US")} characters</span>
            <span>
              Limit{" "}
              {npmInventoryLimits.maxSourceCharacters.toLocaleString("en-US")}
            </span>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-soft p-4 text-sm text-foreground">
            <input
              className="mt-1 h-4 w-4 accent-primary"
              type="checkbox"
              checked={includeVolatileMetadata}
              onChange={(event) => {
                setIncludeVolatileMetadata(event.target.checked);
                setResult(null);
              }}
            />
            <span>
              <span className="block font-bold">
                Add timestamp and random serial number
              </span>
              <span className="mt-1 block leading-relaxed text-muted-foreground">
                Off by default for deterministic output. Enabling it
                intentionally makes each generated BOM different.
              </span>
            </span>
          </label>

          {error ? (
            <div
              className="mt-4 flex gap-3 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-foreground"
              role="alert"
            >
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-danger"
                aria-hidden="true"
              />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!source.trim()}
              onClick={generate}
            >
              <Boxes className="h-4 w-4" aria-hidden="true" />
              Generate incomplete SBOM
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => {
                setSource(SAMPLE);
                setFileName("sample-package-lock.json");
                setResult(null);
                setError("");
              }}
            >
              <FileJson2 className="h-4 w-4" aria-hidden="true" />
              Load safe sample
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={reset}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {result ? (
            <>
              <section
                className="rounded-xl border border-success bg-success-soft p-5"
                aria-live="polite"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="h-6 w-6 shrink-0 text-success"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-bold text-foreground">
                      CycloneDX JSON generated locally
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Composition completeness: <strong>incomplete</strong>.
                      Volatile metadata policy:{" "}
                      <strong>{result.summary.metadataPolicy}</strong>.
                    </p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Components", result.summary.components],
                    ["Resolved", result.summary.resolvedVersions],
                    ["Unresolved", result.summary.unresolvedVersions],
                    ["Direct edges", result.summary.directRelationships],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border border-border bg-surface p-3"
                    >
                      <dt className="text-xs font-semibold text-muted-foreground">
                        {label}
                      </dt>
                      <dd className="mt-1 text-xl font-black text-foreground">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <button
                  type="button"
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => downloadBom(result.bom)}
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download bom.cdx.json
                </button>
              </section>

              <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                <h2 className="text-lg font-bold text-foreground">
                  Required limitations
                </h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {result.limitations.map((limitation) => (
                    <li key={limitation} className="flex gap-2">
                      <Info
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : (
            <section className="rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
              <ListTree
                className="mx-auto h-10 w-10 text-primary"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-bold text-foreground">
                No SBOM yet
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Generation runs in this browser; the source document is not sent
                away.
              </p>
            </section>
          )}
        </div>
      </section>

      {result ? (
        <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                CycloneDX preview
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {previewIsTruncated
                  ? `Preview stops at ${PREVIEW_LIMIT.toLocaleString("en-US")} characters; download contains the full JSON.`
                  : "Preview contains the full generated JSON."}
              </p>
            </div>
          </div>
          <pre className="mt-4 max-h-128 overflow-auto rounded-lg border border-border bg-canvas p-4 text-xs leading-relaxed text-foreground">
            {serializedBom.slice(0, PREVIEW_LIMIT)}
          </pre>
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-bold text-foreground">
          Primary references
        </h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-primary hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href="https://cyclonedx.org/docs/1.7/json/"
            target="_blank"
            rel="noreferrer"
          >
            CycloneDX 1.7 JSON reference
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-primary hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href="https://cyclonedx.org/use-cases/compositions-components/"
            target="_blank"
            rel="noreferrer"
          >
            Composition completeness
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold text-primary hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            href="https://github.com/package-url/purl-spec"
            target="_blank"
            rel="noreferrer"
          >
            Package URL specification
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  );
}
