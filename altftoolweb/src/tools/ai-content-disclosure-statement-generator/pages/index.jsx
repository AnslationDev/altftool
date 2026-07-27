"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Sparkles } from "lucide-react";

import { AI_ROLES, ASSET_TYPES, CHANNELS, buildDisclosureSet } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECKBOX_CLASS =
  "h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";

const DASH = "—";

const BAND_CLASS = {
  Low: "text-[var(--success)]",
  Moderate: "text-[var(--primary)]",
  High: "text-[var(--warning)]",
  Critical: "text-[var(--danger)]",
};

const DEFAULTS = {
  assetTypeId: "image",
  aiRoleId: "generated",
  photorealistic: true,
  realPerson: false,
  publicInterest: false,
  humanReviewed: true,
  commercial: true,
  channelIds: ["own-site", "meta"],
  toolNames: "",
  publisher: "",
  reviewer: "",
};

export default function ToolHome() {
  const [assetTypeId, setAssetTypeId] = useState(DEFAULTS.assetTypeId);
  const [aiRoleId, setAiRoleId] = useState(DEFAULTS.aiRoleId);
  const [photorealistic, setPhotorealistic] = useState(DEFAULTS.photorealistic);
  const [realPerson, setRealPerson] = useState(DEFAULTS.realPerson);
  const [publicInterest, setPublicInterest] = useState(DEFAULTS.publicInterest);
  const [humanReviewed, setHumanReviewed] = useState(DEFAULTS.humanReviewed);
  const [commercial, setCommercial] = useState(DEFAULTS.commercial);
  const [channelIds, setChannelIds] = useState(DEFAULTS.channelIds);
  const [toolNames, setToolNames] = useState(DEFAULTS.toolNames);
  const [publisher, setPublisher] = useState(DEFAULTS.publisher);
  const [reviewer, setReviewer] = useState(DEFAULTS.reviewer);
  const [copiedKey, setCopiedKey] = useState("");

  const result = useMemo(
    () =>
      buildDisclosureSet({
        assetTypeId,
        aiRoleId,
        photorealistic,
        realPerson,
        publicInterest,
        humanReviewed,
        commercial,
        channelIds,
        toolNames,
        publisher,
        reviewer,
      }),
    [
      assetTypeId,
      aiRoleId,
      photorealistic,
      realPerson,
      publicInterest,
      humanReviewed,
      commercial,
      channelIds,
      toolNames,
      publisher,
      reviewer,
    ],
  );

  const hasError = Boolean(result.error);
  const isMedia = ASSET_TYPES.find((a) => a.id === assetTypeId)?.media ?? false;

  const toggleChannel = (id) => {
    setChannelIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyText = async (key, text) => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setCopiedKey("");
    }
  };

  const reset = () => {
    setAssetTypeId(DEFAULTS.assetTypeId);
    setAiRoleId(DEFAULTS.aiRoleId);
    setPhotorealistic(DEFAULTS.photorealistic);
    setRealPerson(DEFAULTS.realPerson);
    setPublicInterest(DEFAULTS.publicInterest);
    setHumanReviewed(DEFAULTS.humanReviewed);
    setCommercial(DEFAULTS.commercial);
    setChannelIds(DEFAULTS.channelIds);
    setToolNames(DEFAULTS.toolNames);
    setPublisher(DEFAULTS.publisher);
    setReviewer(DEFAULTS.reviewer);
    setCopiedKey("");
  };

  const outputs = hasError
    ? []
    : [
        { key: "long", title: "Full statement", body: result.longStatement },
        { key: "short", title: "Short label", body: result.shortLabel },
        { key: "meta", title: "Metadata credit line", body: result.metadataCredit },
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          AI and Tech Policy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          AI Content Disclosure Statement Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One asset usually needs three pieces of disclosure text and an answer to which platform
          rule applies. This produces the full statement, the short label and the metadata credit
          line, and lists the obligations engaged by what you are publishing and where.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-asset">
              What are you publishing
            </label>
            <select
              id="ad-asset"
              className={`mt-2 ${INPUT_CLASS}`}
              value={assetTypeId}
              onChange={(event) => setAssetTypeId(event.target.value)}
            >
              {ASSET_TYPES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-role">
              How the AI was used
            </label>
            <select
              id="ad-role"
              className={`mt-2 ${INPUT_CLASS}`}
              value={aiRoleId}
              onChange={(event) => setAiRoleId(event.target.value)}
            >
              {AI_ROLES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-tools">
              Model or tool names (optional, comma-separated)
            </label>
            <input
              id="ad-tools"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={toolNames}
              onChange={(event) => setToolNames(event.target.value)}
              placeholder="e.g. Midjourney, ElevenLabs"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ad-publisher">
              Publisher taking responsibility (optional)
            </label>
            <input
              id="ad-publisher"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={publisher}
              onChange={(event) => setPublisher(event.target.value)}
              placeholder="e.g. Acme Media"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ad-reviewer">
              Who reviewed it (optional)
            </label>
            <input
              id="ad-reviewer"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={reviewer}
              onChange={(event) => setReviewer(event.target.value)}
              placeholder="e.g. the commissioning editor"
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>What is true of this asset</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {isMedia ? (
              <label
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor="ad-photo"
              >
                <input
                  id="ad-photo"
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={photorealistic}
                  onChange={(event) => setPhotorealistic(event.target.checked)}
                />
                Photorealistic, not obviously stylised
              </label>
            ) : null}
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor="ad-person"
            >
              <input
                id="ad-person"
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={realPerson}
                onChange={(event) => setRealPerson(event.target.checked)}
              />
              Depicts or imitates a real, identifiable person
            </label>
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor="ad-public"
            >
              <input
                id="ad-public"
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={publicInterest}
                onChange={(event) => setPublicInterest(event.target.checked)}
              />
              Concerns a matter of public interest
            </label>
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor="ad-commercial"
            >
              <input
                id="ad-commercial"
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={commercial}
                onChange={(event) => setCommercial(event.target.checked)}
              />
              Used in advertising or a commercial claim
            </label>
            <label
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
              htmlFor="ad-review"
            >
              <input
                id="ad-review"
                type="checkbox"
                className={CHECKBOX_CLASS}
                checked={humanReviewed}
                onChange={(event) => setHumanReviewed(event.target.checked)}
              />
              A human reviewed and approved the final version
            </label>
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Where it will be published</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {CHANNELS.map((channel) => (
              <label
                key={channel.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`ad-channel-${channel.id}`}
              >
                <input
                  id={`ad-channel-${channel.id}`}
                  type="checkbox"
                  className={CHECKBOX_CLASS}
                  checked={channelIds.includes(channel.id)}
                  onChange={() => toggleChannel(channel.id)}
                />
                {channel.label}
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Disclosure exposure
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                hasError ? "text-[var(--muted-foreground)]" : BAND_CLASS[result.band]
              }`}
            >
              {hasError ? DASH : `${result.score} / 100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.band} — heuristic ranking, not a compliance verdict`}
            </p>
          </div>
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

        <dl className="mt-5 space-y-4 text-sm">
          {outputs.length === 0 ? (
            <div>
              <dt className="font-semibold text-[var(--muted-foreground)]">Disclosure text</dt>
              <dd className="mt-1">{DASH}</dd>
            </div>
          ) : (
            outputs.map((output) => (
              <div key={output.key}>
                <dt className="flex flex-wrap items-center justify-between gap-2 font-semibold text-[var(--muted-foreground)]">
                  {output.title}
                  <button
                    type="button"
                    onClick={() => copyText(output.key, output.body)}
                    aria-label={`Copy the ${output.title.toLowerCase()}`}
                    className={GHOST_BTN}
                  >
                    {copiedKey === output.key ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Copy className="h-4 w-4" aria-hidden="true" />
                    )}
                    {copiedKey === output.key ? "Copied!" : "Copy"}
                  </button>
                </dt>
                <dd className="mt-1 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 leading-6 whitespace-pre-wrap">
                  {output.body}
                </dd>
              </div>
            ))
          )}
          <div>
            <dt className="font-semibold text-[var(--muted-foreground)]">What drives the score</dt>
            <dd className="mt-1 leading-6 text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : result.drivers.length === 0
                  ? "Nothing — light assistance with human review carries the least exposure."
                  : result.drivers.join("; ")}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Obligations engaged</h2>
        <ul className="mt-4 space-y-3">
          {hasError ? (
            <li className="text-sm">{DASH}</li>
          ) : result.obligations.length === 0 ? (
            <li className="text-sm text-[var(--muted-foreground)]">
              No specific disclosure obligation is triggered by this combination. Disclosing anyway
              costs nothing and protects trust.
            </li>
          ) : (
            result.obligations.map((obligation) => (
              <li
                key={obligation.title}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <p className="text-sm font-semibold">{obligation.title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  {obligation.detail}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational, not legal advice. The obligations shown reflect Articles 50(2) and 50(4) of
        Regulation (EU) 2024/1689 (the AI Act), whose transparency duties apply from 2 August 2026,
        Section 5 of the FTC Act, and the published rules of the platforms selected. Rules differ by
        jurisdiction and change often — have counsel review anything you rely on.
      </p>
    </main>
  );
}
