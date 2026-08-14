"use client";

import { useMemo, useState } from "react";
import { DEFAULT_SPEC, normaliseSpec } from "@altftool/core/persona/compose";
import { buildBio, buildCaption, buildHooks } from "@altftool/core/persona/voice";
import {
  ARCHETYPES,
  LANGUAGES,
  NICHES,
  PILLARS,
  PLATFORMS,
} from "@altftool/core/persona/taxonomy";
import CopyBlock from "../_components/CopyBlock";
import { Stamp } from "../_components/Shell";

/*
 * A caption writer that writes the caption for you produces captions that sound
 * like a caption writer. This one produces the SHAPE — the hook, the beats, the
 * close and the disclosure — and leaves the sentences to the person who knows
 * the subject. The hooks are the exception, because a first line is a
 * rhetorical object rather than a claim, and a bank of them is genuinely useful.
 */
export default function CaptionsClient({ initialSpec }) {
  const seeded = normaliseSpec(initialSpec || DEFAULT_SPEC);
  const [spec, setSpec] = useState(seeded);
  const [pillar, setPillar] = useState(seeded.pillars[0] || "teach");
  const [topic, setTopic] = useState("");
  const [paid, setPaid] = useState(false);

  const set = (key, value) =>
    setSpec((current) => normaliseSpec({ ...current, [key]: value }));

  const cleanTopic = topic.trim();
  const hooks = useMemo(
    () => buildHooks(spec, { pillar, topic: cleanTopic || undefined, count: 5 }),
    [spec, pillar, cleanTopic],
  );
  const caption = useMemo(
    () => buildCaption(spec, { pillar, topic: cleanTopic || undefined, paid }),
    [spec, pillar, cleanTopic, paid],
  );
  const bios = useMemo(() => buildBio(spec), [spec]);
  const archetype = ARCHETYPES.find((entry) => entry.id === spec.archetype);

  return (
    <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="psn-sheet rounded-xl p-5">
        <div className="grid gap-5 lg:grid-cols-4">
          <Control label="Niche">
            <select
              value={spec.niche}
              onChange={(event) => set("niche", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {NICHES.map((niche) => (
                <option key={niche.slug} value={niche.slug}>
                  {niche.label}
                </option>
              ))}
            </select>
          </Control>

          <Control label="Archetype" hint={archetype?.voice}>
            <select
              value={spec.archetype}
              onChange={(event) => set("archetype", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {ARCHETYPES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </Control>

          <Control label="Platform" hint={`${caption.budget} character budget`}>
            <select
              value={spec.platform}
              onChange={(event) => set("platform", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {PLATFORMS.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.label}
                </option>
              ))}
            </select>
          </Control>

          <Control label="Language" hint="The disclosure follows this, not the site">
            <select
              value={spec.language}
              onChange={(event) => set("language", event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {LANGUAGES.map((language) => (
                <option key={language.id} value={language.id}>
                  {language.label}
                </option>
              ))}
            </select>
          </Control>
        </div>

        <div className="mt-5 grid gap-5 border-t border-border pt-5 lg:grid-cols-[1fr_auto]">
          <Control label="What is this post about?" hint="One noun phrase. Left empty it uses the niche.">
            <input
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="retinol, index funds, loose-lead walking…"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </Control>

          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-foreground">
              <input
                type="checkbox"
                checked={paid}
                onChange={(event) => setPaid(event.target.checked)}
                className="h-4 w-4 accent-[var(--psn-accent)]"
              />
              This is a paid post
            </label>
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-5">
          <Stamp className="mb-2">Post shape</Stamp>
          <div className="flex flex-wrap gap-1.5">
            {PILLARS.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={pillar === entry.id}
                onClick={() => setPillar(entry.id)}
                className="psn-option rounded-full px-3 py-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------- Hooks ---------------------------- */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Opening lines
        </h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          The first line is the only line most people read, and on a muted
          autoplay it is the only line most people see. The first of these is the
          archetype&rsquo;s own opener, so a persona&rsquo;s hooks sound like that
          persona rather than like the pillar.
        </p>

        <div className="mt-4 space-y-3">
          {hooks.map((hook) => (
            <CopyBlock key={hook.id} text={hook.text} tone="tight" />
          ))}
        </div>
      </section>

      {/* ------------------------------ Caption --------------------------- */}
      <section className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Caption structure
          </h2>
          <p className="w-full text-sm leading-relaxed text-muted-foreground">
            The counter measures the hook, the close and the disclosure — the
            parts that are finished text. The body beats are instructions to
            you, so counting them would report a caption as over budget on
            words nobody is going to post.
          </p>
          <span className="psn-seed text-xs text-muted-foreground">
            {caption.used} / {caption.budget} characters
            {caption.overBudget
              ? " — over budget"
              : ` · ${caption.remaining} left for the body`}
          </span>
        </div>

        <div className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
          {caption.parts.map((part) => (
            <div key={part.role} className="grid gap-2 bg-background p-5 sm:grid-cols-[7rem_1fr]">
              <Stamp className="pt-1">{part.label}</Stamp>
              <div>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground">
                  {part.text}
                </p>
                {part.note ? (
                  <p className="mt-2 text-xs text-muted-foreground">{part.note}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <CopyBlock
            label="Disclosure line"
            note={`In ${caption.language.label}, at the front`}
            text={caption.disclosure}
            tone="tight"
          />
        </div>
      </section>

      {/* -------------------------------- Bio ----------------------------- */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Bio candidates
        </h2>
        <div className="mt-4 space-y-3">
          {bios.map((bio) => (
            <div
              key={bio.id}
              className="psn-sheet flex flex-wrap items-center justify-between gap-3 rounded-lg p-4"
            >
              <p className="text-sm text-foreground">{bio.text}</p>
              <span className="psn-seed shrink-0 text-xs text-muted-foreground">
                {bio.length} chars
                {bio.fitsInstagram ? " · fits everywhere" : " · too long for Instagram"}
              </span>
            </div>
          ))}
        </div>
      </section>
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
