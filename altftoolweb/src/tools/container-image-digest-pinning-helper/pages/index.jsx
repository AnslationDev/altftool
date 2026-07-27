"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Pin, RotateCcw } from "lucide-react";

import { pinReference, scanManifest } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-40 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_DIGEST = "sha256:04ba374043ccd2fc5c593885c0eacddebabd5ca375f9323666f28dfd5a9710e3";

const DEFAULTS = {
  reference: "nginx:1.27",
  digest: DEFAULT_DIGEST,
  manifest: `FROM golang:1.22 AS builder
FROM gcr.io/distroless/static-debian12
services:
  web:
    image: nginx
  db:
    image: postgres:16.3`,
};

const DASH = "—";

const STATUS_LABELS = {
  pinned: "Pinned to digest",
  "pinned-other-algorithm": "Pinned (non-sha256 digest)",
  "mutable-tag": "Mutable tag",
  latest: ":latest tag",
  "implicit-latest": "No tag (implicit :latest)",
};

export default function ToolHome() {
  const [reference, setReference] = useState(DEFAULTS.reference);
  const [digest, setDigest] = useState(DEFAULTS.digest);
  const [manifest, setManifest] = useState(DEFAULTS.manifest);
  const [copied, setCopied] = useState(false);

  const pinResult = useMemo(() => pinReference({ reference, digest }), [reference, digest]);
  const scanResult = useMemo(() => scanManifest(manifest), [manifest]);

  const pinError = Boolean(pinResult.error);
  const scanError = Boolean(scanResult.error);

  const copyResult = async () => {
    if (pinError) return;
    try {
      await navigator.clipboard.writeText(pinResult.pinnedWithTag);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setReference(DEFAULTS.reference);
    setDigest(DEFAULTS.digest);
    setManifest(DEFAULTS.manifest);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Pin className="h-4 w-4" aria-hidden="true" />
          Containers
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Container Image Digest Pinning Helper
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Turn a mutable tag into an immutable <code>@sha256</code> reference, and scan your
          Dockerfile or manifests for images that are not pinned. Get the digest first with{" "}
          <code>docker buildx imagetools inspect &lt;image&gt;</code> or <code>crane digest</code>.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="dph-ref">
              Image reference (with or without tag)
            </label>
            <input
              id="dph-ref"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="dph-digest">
              Manifest digest (sha256:...)
            </label>
            <input
              id="dph-digest"
              className={`mt-2 ${INPUT_CLASS} font-mono`}
              type="text"
              value={digest}
              onChange={(event) => setDigest(event.target.value)}
            />
          </div>
        </div>
      </section>

      {pinError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {pinResult.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Pinned reference (tag kept as label)
            </p>
            <p className="mt-1 break-all font-mono text-lg font-semibold text-[var(--primary)]">
              {pinError ? DASH : pinResult.pinnedWithTag}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={pinError}
              aria-label="Copy the pinned image reference"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex flex-col gap-1 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <dt className="shrink-0 text-[var(--muted-foreground)]">Canonical form (tag dropped)</dt>
            <dd className="break-all font-mono font-semibold sm:text-right">
              {pinError ? DASH : pinResult.pinned}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Registry</dt>
            <dd className="text-right font-semibold">
              {pinError ? DASH : pinResult.parts.registry || "Docker Hub (default)"}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Repository</dt>
            <dd className="text-right font-mono font-semibold">{pinError ? DASH : pinResult.parts.repository}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="dph-manifest">
          Scan a Dockerfile / compose file / Kubernetes manifest
        </label>
        <textarea
          id="dph-manifest"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          spellCheck={false}
          value={manifest}
          onChange={(event) => setManifest(event.target.value)}
        />

        {scanError ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {scanResult.error}
          </p>
        ) : (
          <>
            <p className="mt-4 text-sm font-semibold">
              {scanResult.counts.pinned} of {scanResult.total} image reference
              {scanResult.total === 1 ? "" : "s"} pinned — {scanResult.counts.mutable} on mutable tags,{" "}
              {scanResult.counts.latest} on :latest or no tag.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Line</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Reference</th>
                    <th scope="col" className="py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {scanResult.findings.map((finding) => (
                    <tr key={`${finding.line}-${finding.reference}`} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">{finding.line}</td>
                      <td className="max-w-[280px] truncate py-2 pr-3 font-mono">{finding.reference}</td>
                      <td className="py-2">
                        {finding.status === "pinned" || finding.status === "pinned-other-algorithm" ? (
                          <span className="font-semibold text-[var(--success)]">{STATUS_LABELS[finding.status]}</span>
                        ) : (
                          <span className="font-semibold text-[var(--danger)]">{STATUS_LABELS[finding.status]}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A digest pins one exact manifest, so pinned images no longer receive base-image security
        updates automatically — pair pinning with a bot (Renovate, Dependabot) that bumps the digest
        when a new image is published.
      </p>
    </main>
  );
}
