"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dices,
  Fingerprint,
  RotateCcw,
  Share2,
  Undo2,
} from "lucide-react";
import {
  DEFAULT_SPEC,
  composeSheet,
  isDefaultSpec,
  normaliseSpec,
  specToQuery,
} from "@altftool/core/persona/compose";
import {
  ARCHETYPES,
  LANGUAGES,
  MARKETS,
  NICHES,
  PILLARS,
  PLATFORMS,
} from "@altftool/core/persona/taxonomy";
import { TRAIT_FIELDS } from "@altftool/core/persona/traits";
import { buildPlan, buildShotList } from "@altftool/core/persona/plan";
import { buildBio, nameCandidates } from "@altftool/core/persona/voice";
import { buildDisclosure } from "@altftool/core/persona/disclosure";
import CopyBlock from "../_components/CopyBlock";
import DownloadSheet from "../_components/DownloadSheet";
import MonthGrid from "../_components/MonthGrid";
import PromptBridge from "../_components/PromptBridge";
import { RouteChip, SeedPlate, Stamp } from "../_components/Shell";

const STORAGE_KEY = "altf-persona-draft";

const STEPS = [
  {
    id: "brief",
    label: "Brief",
    title: "Who is this account for?",
    lede: "These five choices set every default that follows — the pillars, the shot pairings, the disclosure regime and the rate baseline.",
  },
  {
    id: "face",
    label: "Face",
    title: "The face",
    lede: "One field here matters more than all the others: the distinguishing mark. It is what a text prompt anchors on, and a face without one re-rolls every generation.",
  },
  {
    id: "build",
    label: "Build",
    title: "Hair, skin and build",
    lede: "Hair does more recognition work at scroll speed than any facial feature, because it is legible at a hundred pixels wide.",
  },
  {
    id: "style",
    label: "Style",
    title: "Wardrobe and world",
    lede: "Styling decisions, so none of them change the identity seed. Change the wardrobe and it is still the same person in different clothes — which is exactly what the seed is for.",
  },
  {
    id: "voice",
    label: "Voice",
    title: "How it talks",
    lede: "The captions, hooks and 30-day plan are generated from this step. Pick up to five pillars — more than five is not a strategy, it is a list.",
  },
  {
    id: "lock",
    label: "Lock",
    title: "The character sheet",
    lede: "Everything below is derived from your choices and reproduces exactly. Copy what you need; nothing is stored on a server.",
  },
];

/* ------------------------------------------------------------------ */

function Chips({
  options,
  value,
  onChange,
  getId = (option) => option.id,
  getLabel = (option) => option.label,
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {options.map((option) => {
        const id = getId(option);
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className="psn-option rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="block">{getLabel(option)}</span>
            {option.note ? (
              <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                {option.note}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="border-t border-border pt-6 first:border-t-0 first:pt-0">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        {hint ? (
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function TraitFields({ step, spec, set }) {
  return (
    <>
      {TRAIT_FIELDS.filter((field) => field.step === step).map((field) => (
        <Field
          key={field.key}
          label={field.label}
          hint={field.required ? undefined : "Optional"}
        >
          <Chips
            options={field.options}
            value={spec[field.key]}
            onChange={(id) => set(field.key, id)}
          />
        </Field>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */

/*
 * `initialSpec` is parsed on the server from the query string, so a shared
 * sheet is server-rendered as the right persona rather than flashing the
 * default and then correcting itself. That also keeps this route out of a
 * client-side-rendering bailout and out of the setState-in-an-effect pattern.
 */
export default function StudioClient({ initialSpec }) {
  const [spec, setSpec] = useState(() => normaliseSpec(initialSpec || DEFAULT_SPEC));
  const [stepIndex, setStepIndex] = useState(0);
  const [shared, setShared] = useState(false);
  const [notice, setNotice] = useState("");
  const shareTimer = useRef(null);
  const topRef = useRef(null);

  /*
   * Persist and mirror into the URL. The URL is the real restore mechanism —
   * a reload re-reads it on the server — so the saved draft exists only for
   * the case where you navigated away to a bare /persona/studio, and it is
   * restored on request rather than silently. A shared link must never be
   * overwritten by whatever the reader was building last week.
   */
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(spec));
    } catch {
      /* Private browsing and full quotas both throw here. The studio still
         works; only the draft is lost. */
    }
    const query = specToQuery(spec);
    const url = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [spec]);

  useEffect(() => () => window.clearTimeout(shareTimer.current), []);

  const set = useCallback((key, value) => {
    setSpec((current) => normaliseSpec({ ...current, [key]: value }));
  }, []);

  const togglePillar = useCallback((id) => {
    setSpec((current) => {
      const has = current.pillars.includes(id);
      const pillars = has
        ? current.pillars.filter((entry) => entry !== id)
        : [...current.pillars, id].slice(0, 5);
      return normaliseSpec({ ...current, pillars });
    });
  }, []);

  const go = useCallback((index) => {
    setStepIndex(Math.max(0, Math.min(STEPS.length - 1, index)));
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const randomise = useCallback(() => {
    const draft = { ...spec };
    for (const field of TRAIT_FIELDS) {
      const options = field.options;
      draft[field.key] = options[Math.floor(Math.random() * options.length)].id;
    }
    draft.niche = NICHES[Math.floor(Math.random() * NICHES.length)].slug;
    draft.archetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)].id;
    setSpec(normaliseSpec(draft));
  }, [spec]);

  const reset = useCallback(() => {
    setSpec(DEFAULT_SPEC);
    setStepIndex(0);
    setNotice("");
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clean up */
    }
  }, []);

  const resumeDraft = useCallback(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setNotice("No saved draft in this browser yet.");
        return;
      }
      const restored = normaliseSpec(JSON.parse(saved));
      if (isDefaultSpec(restored)) {
        setNotice("The saved draft is still the default persona.");
        return;
      }
      setSpec(restored);
      setNotice("");
    } catch {
      setNotice("Could not read the saved draft.");
    }
  }, []);

  const share = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}?${specToQuery(spec)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.clearTimeout(shareTimer.current);
      shareTimer.current = window.setTimeout(() => setShared(false), 1800);
    } catch {
      setShared(false);
    }
  }, [spec]);

  const sheet = useMemo(() => composeSheet(spec), [spec]);
  const step = STEPS[stepIndex];
  const onSheet = step.id === "lock";

  return (
    <div ref={topRef} className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-8 sm:px-6 lg:px-8">
      {/* ----------------------------- Step rail ---------------------------- */}
      <ol className="psn-rail mb-8 flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map((entry, index) => {
          const state =
            index === stepIndex ? "current" : index < stepIndex ? "done" : "todo";
          return (
            <li key={entry.id} className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => go(index)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span
                  data-state={state}
                  className="psn-step-dot psn-seed flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold text-muted-foreground"
                >
                  {state === "done" ? (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`text-sm font-medium ${
                    state === "current" ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {entry.label}
                </span>
              </button>
              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="mx-1 h-px w-4 bg-border sm:w-8"
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className={onSheet ? "" : "grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"}>
        {/* ---------------------------- Step body --------------------------- */}
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {step.title}
          </h2>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {step.lede}
          </p>

          <div className="mt-8 space-y-6">
            {step.id === "brief" && (
              <>
                <Field
                  label="Niche"
                  hint={sheet.niche.intro}
                >
                  <Chips
                    options={NICHES}
                    value={spec.niche}
                    onChange={(id) => set("niche", id)}
                    getId={(option) => option.slug}
                  />
                </Field>
                <Field
                  label="Platform"
                  hint={`${sheet.platform.surface} · ${sheet.platform.cadencePerWeek} posts a week · ${sheet.platform.aspect}`}
                >
                  <Chips
                    options={PLATFORMS}
                    value={spec.platform}
                    onChange={(id) => set("platform", id)}
                  />
                </Field>
                <Field
                  label="Market"
                  hint="Sets which disclosure regime applies and the rate baseline."
                >
                  <Chips
                    options={MARKETS}
                    value={spec.market}
                    onChange={(id) => set("market", id)}
                  />
                </Field>
                <Field
                  label="Language you publish in"
                  hint="The disclosure has to be in the same language as the post, not the language of your dashboard."
                >
                  <Chips
                    options={LANGUAGES}
                    value={spec.language}
                    onChange={(id) => set("language", id)}
                  />
                </Field>
                <Field
                  label="Archetype"
                  hint="The behavioural template. It sets the voice, the opening line and the pillar weighting."
                >
                  <Chips
                    options={ARCHETYPES}
                    value={spec.archetype}
                    onChange={(id) => set("archetype", id)}
                    getLabel={(option) => option.label}
                  />
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    <strong className="font-medium text-foreground">
                      {ARCHETYPES.find((a) => a.id === spec.archetype)?.label}
                    </strong>{" "}
                    — {ARCHETYPES.find((a) => a.id === spec.archetype)?.blurb}{" "}
                    {ARCHETYPES.find((a) => a.id === spec.archetype)?.strength}
                  </p>
                </Field>
              </>
            )}

            {step.id === "face" && <TraitFields step="face" spec={spec} set={set} />}
            {step.id === "build" && <TraitFields step="build" spec={spec} set={set} />}
            {step.id === "style" && <TraitFields step="style" spec={spec} set={set} />}

            {step.id === "voice" && (
              <>
                <TraitFields step="voice" spec={spec} set={set} />
                <Field
                  label="Content pillars"
                  hint={`Up to five. ${spec.pillars.length}/5 selected. Leave empty and the plan uses the niche defaults.`}
                >
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {PILLARS.map((pillar) => {
                      const active = spec.pillars.includes(pillar.id);
                      return (
                        <button
                          key={pillar.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => togglePillar(pillar.id)}
                          className="psn-option rounded-lg px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <span className="block text-sm font-medium">
                            {pillar.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {pillar.blurb}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Field>
                <Field
                  label="Name and handle"
                  hint="Optional here — the sheet suggests candidates derived from your heritage and niche choices."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={spec.name}
                      onChange={(event) => set("name", event.target.value)}
                      placeholder="Display name"
                      className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                    <input
                      type="text"
                      value={spec.handle}
                      onChange={(event) => set("handle", event.target.value)}
                      placeholder="handle"
                      className="psn-seed rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    />
                  </div>
                  <NameSuggestions spec={spec} onPick={(candidate) => {
                    set("name", candidate.name);
                    set("handle", candidate.handle);
                  }} />
                </Field>
              </>
            )}

            {onSheet && <CharacterSheet sheet={sheet} spec={spec} />}
          </div>

          {/* --------------------------- Step controls -------------------------- */}
          <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <button
              type="button"
              onClick={() => go(stepIndex - 1)}
              disabled={stepIndex === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </button>

            {stepIndex < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => go(stepIndex + 1)}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                style={{ background: "var(--psn-accent)" }}
              >
                {stepIndex === STEPS.length - 2 ? "Lock the sheet" : "Next"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}

            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={randomise}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Dices className="h-4 w-4" aria-hidden="true" />
                Surprise me
              </button>
              <button
                type="button"
                onClick={share}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                {shared ? "Link copied" : "Share"}
              </button>
              <DownloadSheet spec={spec} label="Download" className="!px-3 !py-2.5 !font-medium !text-muted-foreground hover:!text-foreground" />
              <button
                type="button"
                onClick={resumeDraft}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Undo2 className="h-4 w-4" aria-hidden="true" />
                Resume draft
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>

          {notice ? (
            <p role="status" className="mt-3 text-sm text-muted-foreground">
              {notice}
            </p>
          ) : null}
        </div>

        {/* ----------------------------- Live panel --------------------------- */}
        {!onSheet && (
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div
              className={`psn-card psn-stripe psn-sheet psn-route-${sheet.route.id} rounded-xl p-5 pl-6`}
            >
              <Stamp className="flex items-center gap-1.5">
                <Fingerprint className="h-3 w-3" aria-hidden="true" />
                Live sheet
              </Stamp>

              <p className="mt-3 text-lg font-semibold tracking-tight text-foreground">
                {spec.name || "Unnamed persona"}
              </p>
              <p className="psn-seed text-xs text-muted-foreground">
                @{spec.handle || "unset"}
              </p>

              <SeedPlate seed={sheet.seed.token} className="mt-4 w-full" />

              <div className="mt-4">
                <RouteChip route={sheet.route.route} size="lg" />
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {sheet.route.route.blurb}
                </p>
              </div>

              <dl className="mt-4 space-y-2 border-t border-border pt-4 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Niche</dt>
                  <dd className="text-right font-medium text-foreground">
                    {sheet.niche.label}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Platform</dt>
                  <dd className="text-right font-medium text-foreground">
                    {sheet.platform.label}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Seed number</dt>
                  <dd className="psn-seed text-right text-foreground">
                    {sheet.seed.numeric}
                  </dd>
                </div>
              </dl>

              <p className="psn-code mt-4 rounded-md p-3 text-[11px] leading-relaxed">
                {sheet.lockedLine}
              </p>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              The seed changes the moment a facial feature changes and stays put
              when only the styling does. That is the system telling you whether
              you are still looking at the same person.
            </p>
          </aside>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function NameSuggestions({ spec, onPick }) {
  const candidates = useMemo(() => nameCandidates(spec, 5), [spec]);

  return (
    <div className="mt-4">
      <Stamp className="mb-2">Suggestions</Stamp>
      <div className="flex flex-wrap gap-2">
        {candidates.map((candidate) => (
          <button
            key={candidate.handle}
            type="button"
            onClick={() => onPick(candidate)}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:border-[var(--psn-accent)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {candidate.name}{" "}
            <span className="psn-seed opacity-70">@{candidate.handle}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CharacterSheet({ sheet, spec }) {
  const plan = useMemo(() => buildPlan(spec, { route: sheet.route }), [spec, sheet.route]);
  const shotList = useMemo(() => buildShotList(plan), [plan]);
  const disclosure = useMemo(() => buildDisclosure({ spec }), [spec]);
  const bios = useMemo(() => buildBio(spec), [spec]);
  const planQuery = useMemo(() => specToQuery(spec), [spec]);

  return (
    <div className="space-y-10">
      {/* ---------------------------- Identity ---------------------------- */}
      <section
        className={`psn-card psn-stripe psn-sheet psn-route-${sheet.route.id} rounded-xl p-6 pl-7`}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Stamp>Character sheet</Stamp>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {spec.name || "Unnamed persona"}
            </h3>
            <p className="psn-seed text-sm text-muted-foreground">
              @{spec.handle || "unset"} · {sheet.niche.label} ·{" "}
              {sheet.platform.label}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <SeedPlate seed={sheet.seed.token} />
            <DownloadSheet spec={spec} />
          </div>
        </div>

        <div className="mt-6">
          <CopyBlock
            label="The locked line"
            note="Paste verbatim. Do not reword."
            text={sheet.lockedLine}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <CopyBlock label="Styling line" text={sheet.styleLine} tone="tight" />
          <CopyBlock
            label="Negative prompt"
            note="Protects what you made distinctive"
            text={sheet.negative}
            tone="tight"
          />
        </div>
      </section>

      {/* ------------------------------ Route ----------------------------- */}
      <section>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            Recommended production route
          </h3>
          <RouteChip route={sheet.route.route} size="lg" />
        </div>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          {sheet.route.route.detail}
        </p>

        <ul className="mt-4 space-y-2">
          {sheet.route.reasons.map((reason) => (
            <li key={reason.text} className="flex gap-3 text-sm leading-relaxed">
              <span
                aria-hidden="true"
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  background:
                    reason.weight === "up"
                      ? "var(--psn-video)"
                      : "var(--psn-still)",
                }}
              />
              <span className="text-muted-foreground">{reason.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------- Prompt kits -------------------------- */}
      <section>
        <h3 className="text-lg font-semibold text-foreground">Prompt kits</h3>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          The same person in the syntax each generator actually needs. Placeholders
          in square brackets are things only you have — a reference frame you
          approved, a LoRA trigger word, a script.
        </p>

        <div className="mt-5 space-y-4">
          {sheet.kits.map((kit) => (
            <div key={kit.slug} className="psn-sheet rounded-xl p-5">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{kit.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {kit.consistency}
                  </p>
                </div>
                <Link
                  href={`/persona/models/${kit.slug}`}
                  prefetch={false}
                  className="text-xs font-medium"
                  style={{ color: "var(--psn-accent-text)" }}
                >
                  How this model holds a face →
                </Link>
              </div>
              <CopyBlock text={kit.text} tone="tight" />
            </div>
          ))}
        </div>

        <PromptBridge className="mt-8" />
      </section>

      {/* ---------------------------- Checklist --------------------------- */}
      <section>
        <h3 className="text-lg font-semibold text-foreground">
          Reproduction checklist
        </h3>
        <ol className="mt-4 space-y-4">
          {sheet.checklist.map((item, index) => (
            <li key={item.title} className="flex gap-4">
              <span className="psn-seed mt-0.5 text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* --------------------------- Disclosure --------------------------- */}
      <section className="psn-accent-panel rounded-xl p-6">
        <Stamp style={{ color: "var(--psn-accent-text)" }}>Disclosure</Stamp>
        <h3 className="mt-1 text-lg font-semibold text-foreground">
          What you owe on {disclosure.platform.label} in {disclosure.market.label}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {disclosure.placement}
        </p>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <CopyBlock label="Profile bio line" text={disclosure.profileLine} tone="tight" />
          <CopyBlock label="Caption line" text={disclosure.captionLine} tone="tight" />
        </div>

        <Link
          href={`/persona/disclosure?market=${spec.market}&platform=${spec.platform}&language=${spec.language}`}
          prefetch={false}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: "var(--psn-accent-text)" }}
        >
          Full obligations for this combination
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      {/* ------------------------------ Bio ------------------------------- */}
      <section>
        <h3 className="text-lg font-semibold text-foreground">Bio candidates</h3>
        <div className="mt-4 space-y-3">
          {bios.map((bio) => (
            <div
              key={bio.id}
              className="psn-sheet flex flex-wrap items-center justify-between gap-3 rounded-lg p-4"
            >
              <p className="text-sm text-foreground">{bio.text}</p>
              <span className="psn-seed shrink-0 text-xs text-muted-foreground">
                {bio.length} chars{" "}
                {bio.fitsInstagram ? "· fits everywhere" : "· too long for Instagram"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------ Plan ------------------------------ */}
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            The first 30 days
          </h3>
          <Link
            href={`/persona/playbook?${planQuery}`}
            prefetch={false}
            className="text-sm font-semibold"
            style={{ color: "var(--psn-accent-text)" }}
          >
            Open the full plan →
          </Link>
        </div>

        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          {plan.summary.posts} posts and {plan.summary.restDays} rest days, using{" "}
          {plan.summary.distinctShots} distinct shot setups. About{" "}
          {Math.round(plan.summary.productionMinutes / 60)} hours of production,
          which is why the shot list below is sorted by setup rather than by date.
        </p>

        <MonthGrid plan={plan} className="mt-5" />

        <div className="mt-6 space-y-2">
          <Stamp>Batch this month by setup</Stamp>
          {shotList.slice(0, 6).map((row) => (
            <div
              key={row.shot.slug}
              className="flex items-baseline justify-between gap-3 border-b border-border pb-2 text-sm"
            >
              <Link
                href={`/persona/shots/${row.shot.slug}`}
                prefetch={false}
                className="font-medium text-foreground hover:underline"
              >
                {row.shot.title}
              </Link>
              <span className="psn-seed shrink-0 text-xs text-muted-foreground">
                ×{row.count} · days {row.days.join(", ")}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
