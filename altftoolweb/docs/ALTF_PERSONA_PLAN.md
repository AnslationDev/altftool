# AltF Persona — product plan

**Route:** `/persona`
**One line:** Design an AI influencer once, then reproduce the same face on every
model you already pay for.
**Status:** built 5 August 2026.

---

## 1. The name

The AltF product line names things after what the reader is actually looking at:
Atlas is a map of the useful web, Detour is a wrong turn worth taking, Lexicon is
a word list, Rabbithole is where you fall. The noun this category already uses
for "the character you invented and now have to keep consistent" is **persona** —
it is the word in every brand brief, every casting sheet and every AI-influencer
tutorial on the internet.

So: **AltF Persona**. Not "AltF Influencer" (dates instantly, and the job is
bigger than Instagram), not "AltF Avatar" (means a profile picture to most
people, and a VTuber rig to the rest), not "AltF Muse" (pretty, unsearchable).

Sub-brands inside it, used as real nouns throughout the UI:

| Term | Means |
| --- | --- |
| **Character sheet** | The locked, versioned spec of one persona. The deliverable. |
| **Identity seed** | The short deterministic token stamped on a sheet, e.g. `PSN-7K2M-4QX`. Same spec always produces the same token. |
| **Locked line** | The descriptor sentence that must appear verbatim in every prompt for the face to hold. |
| **Prompt kit** | The locked line rendered into the exact syntax of one generator. |
| **Cast** | The library of ready-made personas. |
| **Shot** | One reusable recipe — a framing, a light, a wardrobe note — that composes with any persona. |
| **Production route** | What a persona costs you before it works: prompt-only, reference, or trained. |

## 2. What theinfluencer.ai sells, and what we sell instead

theinfluencer.ai is a hosted rendering product whose current plans and credit
terms must be checked on its own site. Those credits buy server-rendered media;
the persona builder exists to feed the renderer.

We cannot sell that, and pretending otherwise would be dishonest — AltFTool is a
static front end with no inference budget. But the renderer is not where the
category actually hurts. Everyone already has image models. What nobody has is
**a face that survives contact with the second prompt**, and the fix for that is
not more GPU, it is a specification discipline: the same descriptor block, in
the same order, with the same seed, plus the right per-model consistency
mechanism (`--cref`, IP-Adapter, a LoRA).

So AltF Persona is the **system of record, not the render farm**:

| They own | We own |
| --- | --- |
| Generating the pixels | Specifying the character so anyone's pixels match |
| Credits | No credits — the spec is text, and text is free |
| One locked-in model | A prompt kit for every major model, side by side |
| "It looks consistent" | The identity seed, the locked line, and a diff when you change one |
| Silence on the law | A disclosure line per platform and per market, generated |
| A pricing page | A rate card that tells you what the persona is worth to a brand |

This is the same move Atlas made against the "101 useful websites" listicles:
the competitor ships the artefact, we ship the honest metadata that makes the
artefact usable.

**The reader-facing promise:** *AltF Persona does not generate images. It makes
sure the images you generate are of the same person.* That sentence appears on
the landing page above the fold, in the FAQ, and on the pricing page. A product
that is coy about not having a renderer would be found out in ninety seconds.

## 3. Production route — the axis the whole product hangs on

Atlas's insight was that a directory is worthless unless every entry states what
it costs you *before* it works. The equivalent question for an AI persona is:
what do I have to build before this face is reproducible?

```
prompt-only   green    Text alone holds it. Distinctive but describable features,
                       fixed seed. Cheapest, least reliable at the extremes.
reference     blue     Needs one locked reference frame you keep re-feeding
                       (--cref, IP-Adapter, a character reference upload).
trained       violet   Needs a LoRA or a fine-tune from 12–20 images. Most
                       reliable, and the only route that survives odd angles.
```

Every card in the Cast carries a route stripe down its leading edge — the
signature device, learned once on the landing page and read everywhere after.
Every studio output tells you which route the spec you just built needs and
why.

## 4. Visual language

Casting call-sheet, not SaaS gradient. The reference object is the paper sheet a
production assistant carries: a name in a heavy display weight, a plate of
monospace facts under it, a stamp in the corner.

- **The identity seed is a machine plate.** Monospace, tracked out, on a tinted
  slab. It is the thing that says "this is a specification, not a vibe".
- **The locked line is rendered as code, always.** If it looks like prose people
  will paraphrase it, and paraphrasing it is exactly what breaks the face.
- **Route stripe** — 3px on the leading edge of every persona card.
- Tokens are namespaced `--psn-*`, defined for both themes, in
  `src/app/persona/persona.css`. Dark-tuned 400-weight hues fail contrast on the
  light page, so light uses the 600/700 ramp — same rule as Atlas.

## 5. Route map

```
/persona                     landing — the argument, the capabilities, the FAQ
/persona/studio              THE FLOW. Six-step builder -> character sheet
/persona/cast                ready-made personas, filterable
/persona/cast/[slug]         one persona: full sheet, prompt kits, shot pairings
/persona/shots               the shot library, by category
/persona/shots/[slug]        one shot recipe, composed against a sample persona
/persona/playbook            30-day content calendar generator
/persona/captions            hook + caption writer in the persona's voice
/persona/models              which generator for which job, with exact syntax
/persona/models/[slug]       one model: consistency mechanism, params, limits
/persona/disclosure          AI-disclosure rules + generated disclosure line
/persona/rates               what an AI persona is worth, and cost vs a human
/persona/pricing             plans (honest: the studio is free)
/persona/learn               guides
/persona/learn/[slug]        one guide
```

## 6. Data model

Everything lives in `packages/core/src/persona/` and is imported through the
`@altftool/core/persona*` exports.

```
taxonomy.js     niches, platforms, markets, archetypes, pillars, routes,
                shot categories, model catalog — every vocabulary downstream
                pages generate from
traits.js       the builder's option lists: presentation, age band, heritage,
                face, hair, build, skin, wardrobe, palette, setting, props
compose.js      THE ENGINE. spec -> seed token, locked line, per-model prompt
                kits, negative prompt, consistency rules, route recommendation
plan.js         spec -> 30-day calendar (deterministic)
voice.js        spec -> hooks, captions, bio, name candidates
disclosure.js   platform x market -> what you must label and how
economics.js    followers x niche x market -> rate card + cost model
catalog.js      cast + shots, validated at import time, throws on bad data
data/*.js       the authored rows
```

**Determinism is a hard requirement.** No `Date.now()`, no `Math.random()`
anywhere in the engine. The identity seed is an FNV-1a hash of the normalised
spec, so the same choices always produce the same token — that is the entire
credibility of the product, and it is also what lets the studio round-trip
through a URL.

## 7. The studio flow

Six steps, all client-side, state in `localStorage` under `altf-persona-draft`
and mirrored into the URL hash so a sheet is shareable without an account.

1. **Brief** — niche, market, platform, language, archetype.
2. **Face** — presentation, age band, heritage, face shape, eyes, brows, nose,
   lips, distinguishing mark.
3. **Build & hair** — hair length/texture/colour, height, build, skin.
4. **Style** — wardrobe register, palette, signature prop, home setting.
5. **Voice** — tone, values, content pillars, catchphrase.
6. **Lock** — name + handle candidates, bio, the character sheet.

The sheet is the payoff: identity seed, locked line, six prompt kits, negative
prompt, the reproduction checklist, the recommended production route, the
disclosure line for the chosen platform and market, and a 30-day plan.

## 8. Non-goals

- **No image generation, ever, in this module.** If AltFTool later gets an
  inference budget it belongs behind `/imgprompt`, and Persona would emit into
  it — but the sheet has to stand alone or the product has no spine.
- **No likeness of real people.** The builder's heritage and feature vocabularies
  are descriptive, not celebrity-shaped, and the guides say plainly that cloning
  a real person's face without written permission is a publicity-rights problem
  in most of the markets we list. The disclosure page carries this.
- **No follower-count fabrication.** The rate card computes from inputs the user
  supplies; nothing on the site claims an AltF persona has an audience.
