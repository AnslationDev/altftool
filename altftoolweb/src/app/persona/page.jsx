import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Camera,
  Cpu,
  Fingerprint,
  Languages,
  MessageSquareQuote,
  ScrollText,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  LANGUAGES,
  MARKETS,
  MODELS,
  PRODUCTION_ROUTES,
} from "@altftool/core/persona/taxonomy";
import { getFeaturedCast, getPopulatedNiches, getStats } from "@altftool/core/persona";
import PersonaCard from "./_components/PersonaCard";
import {
  AnswerBlock,
  FaqList,
  PersonaSection,
  SectionHeading,
  StatStrip,
  Stamp,
  TileLink,
} from "./_components/Shell";

const description =
  "Design an AI influencer once and reproduce the same face on every model you already pay for. AltF Persona builds the character sheet — the locked descriptor line, the identity seed, a prompt kit per generator, a 30-day plan and the disclosure you owe.";

const FAQS = [
  {
    question: "What is AltF Persona?",
    answer:
      "It is a studio for specifying an AI influencer rather than rendering one. You make the character decisions once — features, hair, build, wardrobe, voice — and AltF Persona turns them into a character sheet: an identity seed, a locked descriptor line that must appear verbatim in every prompt, a ready-made prompt kit for ten different generators, a shot library, a 30-day content plan and the disclosure wording for your platform and market.",
  },
  {
    question: "Does AltF Persona generate images or videos?",
    answer:
      "No, and that is deliberate. AltF Persona does not generate images. It makes sure the images you generate are of the same person. You bring whichever model you already use — Midjourney, Flux, Seedream, Stable Diffusion, Sora, Veo, Kling, Runway — and the studio emits the exact prompt syntax and consistency mechanism each of them needs.",
  },
  {
    question: "Why does my AI influencer's face keep changing?",
    answer:
      "Because a prompt is not a specification. Rewording the description between generations, letting the seed float, and changing two variables at once each move the face, and together they guarantee it. The fix is a locked line you never paraphrase, a pinned seed, one variable per generation, and — above a certain level of ambition — a character reference or a trained LoRA. AltF Persona produces all four and tells you which of them your particular spec actually needs.",
  },
  {
    question: "What is a production route?",
    answer:
      "It is what a persona costs you before it works. Prompt only means text alone holds the face, which is free but least reliable. Reference means you keep one approved frame and feed it back as a character reference. Trained means a LoRA built from 12–20 frames, which is the only route that survives odd angles and motion. Every persona in the Cast carries its route, and the studio recommends yours from the choices you made rather than selling you the most expensive one.",
  },
  {
    question: "Is it free?",
    answer:
      "The studio, the cast, the shot library, the planner and the disclosure generator are free and need no account. There is nothing to meter, because the output is text. Your costs are whatever your image or video model charges, which is the same bill you were already paying.",
  },
  {
    question: "Do I have to disclose that my influencer is AI?",
    answer:
      "In every market this site covers, yes — and it is two separate obligations, not one. You disclose that the depicted creator is synthetic, and you separately disclose any commercial relationship. AltF Persona generates both lines in your post's own language, tells you where on each platform they have to sit, and names the regulator whose rule you are following.",
  },
  {
    question: "Can I build a persona that looks like a real person?",
    answer:
      "No. The trait vocabulary here is descriptive and regional rather than celebrity-shaped, and the guides say plainly that recreating a specific individual's face or voice without written permission is a publicity-rights problem in most of the markets listed. A resemblance you did not intend is still a resemblance a court can find.",
  },
  {
    question: "How is this different from an AI influencer generator?",
    answer:
      "A generator sells you credits and renders on its own servers, which means your persona lives inside their product and stops existing if you stop paying. A character sheet is portable text. It works on the model you use today and the one you switch to next year, it can be handed to a collaborator, and it can be versioned — the identity seed changes the moment a feature changes, which is the system telling you it is a different person.",
  },
];

const CAPABILITIES = [
  {
    icon: Fingerprint,
    title: "The character sheet",
    blurb:
      "An identity seed derived from your feature choices, plus the locked descriptor line every prompt has to carry verbatim.",
    href: "/persona/studio",
  },
  {
    icon: Cpu,
    title: "A prompt kit per model",
    blurb:
      "The same person rendered into Midjourney's --cref syntax, Flux's LoRA invocation, Seedream's edit phrasing and seven more.",
    href: "/persona/models",
  },
  {
    icon: Camera,
    title: "A shot library",
    blurb:
      "Reusable framing recipes that compose with any persona, each labelled with the weakest route it survives on.",
    href: "/persona/shots",
  },
  {
    icon: CalendarDays,
    title: "A 30-day plan",
    blurb:
      "Four weeks with an argument behind them, batched into a shot list so a month is produced in one sitting.",
    href: "/persona/playbook",
  },
  {
    icon: MessageSquareQuote,
    title: "Hooks and captions",
    blurb:
      "Opening lines and caption structure in the persona's own register, with the disclosure built into the shape.",
    href: "/persona/captions",
  },
  {
    icon: ShieldCheck,
    title: "Disclosure that holds up",
    blurb:
      "What you must say, in which language, and exactly where it has to sit on each platform. Eight markets.",
    href: "/persona/disclosure",
  },
  {
    icon: Wallet,
    title: "A rate card with its working shown",
    blurb:
      "What a post from this persona is worth, what running it costs, and an honest comparison against commissioning a human.",
    href: "/persona/rates",
  },
  {
    icon: Users,
    title: "Twenty-four ready-made personas",
    blurb:
      "Full character sheets you can open, copy and adapt — each with a note on what it is for and what will get it caught.",
    href: "/persona/cast",
  },
];

const STEPS = [
  {
    name: "Brief",
    text: "Pick the niche, market, platform, language and archetype. These set every default that follows.",
  },
  {
    name: "Face",
    text: "Presentation, age band, heritage and the features. One field matters more than the rest: the distinguishing mark, which is what a text prompt anchors on.",
  },
  {
    name: "Build and hair",
    text: "Hair length, texture, colour and detail; skin tone and finish; height and build.",
  },
  {
    name: "Style",
    text: "Wardrobe register, palette, home setting, signature light and camera height. These are styling decisions, so they never change the identity seed.",
  },
  {
    name: "Voice",
    text: "Tone, governing value and content pillars. This is what the captions and the 30-day plan are generated from.",
  },
  {
    name: "Lock",
    text: "Name and handle candidates, a bio, and the finished character sheet: seed, locked line, prompt kits, negative prompt, route, checklist, disclosure and plan.",
  },
];

const COMPARISON = [
  {
    approach: "Prompting from scratch each time",
    consistency: "None",
    cost: "Free",
    portable: "n/a",
    note: "Every generation is a different person wearing the same adjectives.",
  },
  {
    approach: "A hosted AI-influencer product",
    consistency: "Good, inside that product",
    cost: "Check the current plan and credit terms",
    portable: "No",
    note: "The persona lives on their servers and stops existing when you stop paying.",
  },
  {
    approach: "AltF Persona + your own model",
    consistency: "Good to excellent, by route",
    cost: "Free, plus whatever your model already costs",
    portable: "Yes — it is text",
    note: "Works on the model you use now and the one you move to next year.",
  },
  {
    approach: "Commissioning a human creator",
    consistency: "Perfect",
    cost: "Get a current quote for the same scope",
    portable: "n/a",
    note: "The only option that can give a testimonial. That is what the premium buys.",
  },
];

export async function generateMetadata() {
  const stats = getStats();

  return createPageMetadata({
    title: `AltF Persona — build an AI influencer that stays the same person`,
    description,
    path: "/persona",
    keywords: [
      "ai influencer",
      "ai influencer generator",
      "consistent ai character",
      "ai persona builder",
      "ai ugc creator",
      "virtual influencer",
      "character consistency prompt",
      "midjourney cref character",
      "ai influencer disclosure",
      `${stats.personas} ai personas`,
    ],
  });
}

export default function PersonaLandingPage() {
  const stats = getStats();
  const featured = getFeaturedCast();
  const niches = getPopulatedNiches();
  const imageModels = MODELS.filter((model) => model.kind === "image");
  const videoModels = MODELS.filter((model) => model.kind !== "image");

  return (
    <main>
      <JsonLd
        id="persona-jsonld"
        data={[
          createCollectionPageJsonLd({
            path: "/persona",
            name: "AltF Persona",
            description,
          }),
          createItemListJsonLd({
            path: "/persona",
            name: "AltF Persona sections",
            items: [
              { name: "Persona Studio", path: "/persona/studio" },
              { name: "The Cast", path: "/persona/cast" },
              { name: "Shot library", path: "/persona/shots" },
              { name: "30-day plan", path: "/persona/playbook" },
              { name: "Captions", path: "/persona/captions" },
              { name: "Model guide", path: "/persona/models" },
              { name: "Disclosure", path: "/persona/disclosure" },
              { name: "Rates", path: "/persona/rates" },
              { name: "Guides", path: "/persona/learn" },
            ],
          }),
          createHowToJsonLd({
            path: "/persona",
            name: "How to build a consistent AI influencer",
            description:
              "Six steps from a blank spec to a locked character sheet that reproduces the same face across image and video models.",
            steps: STEPS.map((step) => ({ name: step.name, text: step.text })),
          }),
          createFaqJsonLd({ path: "/persona", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
          ]),
        ]}
      />

      {/* ------------------------------ Hero ------------------------------ */}
      <div className="psn-graticule relative border-b border-border">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <Stamp className="flex items-center gap-2">
            <Fingerprint
              className="h-3.5 w-3.5"
              style={{ color: "var(--psn-accent)" }}
              aria-hidden="true"
            />
            AltF Persona
          </Stamp>

          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Design an AI influencer once.
            <span className="block" style={{ color: "var(--psn-accent-text)" }}>
              Reproduce the same face everywhere.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/persona/studio"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style={{ background: "var(--psn-accent)" }}
            >
              Open the studio
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/persona/cast"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-[var(--psn-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Browse {stats.personas} ready-made personas
            </Link>
          </div>

          <div className="mt-10 max-w-3xl">
            <AnswerBlock title="The honest version">
              <p>
                <strong className="font-semibold">
                  AltF Persona does not generate images.
                </strong>{" "}
                It makes sure the images you generate are of the same person.
                There are no credits here and nothing to meter, because the
                output is text: a specification you paste into whichever model
                you already pay for.
              </p>
              <p>
                That is the whole wedge. Everyone has an image model. Almost
                nobody has a face that survives contact with the second prompt,
                and more GPU has never been the fix for that.
              </p>
            </AnswerBlock>
          </div>
        </div>
      </div>

      {/* ------------------------------ Stats ----------------------------- */}
      <PersonaSection className="!py-8">
        <StatStrip
          items={[
            { label: "Ready-made personas", value: stats.personas, note: `across ${stats.niches} niches` },
            { label: "Shot recipes", value: stats.shots, note: `${stats.freeShots} need no reference frame` },
            { label: "Generators covered", value: MODELS.length, note: "image, video, avatar and voice" },
            { label: "Disclosure regimes", value: MARKETS.length, note: `in ${LANGUAGES.length} languages` },
          ]}
        />
      </PersonaSection>

      {/* --------------------------- The problem -------------------------- */}
      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow="Why this exists"
          title="A prompt is not a specification"
          lede="Four things move a face between generations, and most people are doing all four at once without noticing."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "You reword the description",
              detail:
                "The sentence still means the same thing to you. It does not mean the same thing to the model, and this is the single most common cause of drift.",
            },
            {
              title: "The seed floats",
              detail:
                "Without a pinned seed a re-run is a new roll of the dice. You cannot debug a face you cannot reproduce.",
            },
            {
              title: "You change two things at once",
              detail:
                "New outfit and new location in the same generation. When the face moves, you have no idea which change moved it.",
            },
            {
              title: "There is nothing to anchor on",
              detail:
                "A face built entirely from flattering adjectives has no landmark. One scar, one gap, one grey streak does more than a paragraph of beauty.",
            },
          ].map((item) => (
            <div key={item.title} className="psn-sheet rounded-xl p-5">
              <h3 className="font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </PersonaSection>

      {/* --------------------------- Capabilities ------------------------- */}
      <PersonaSection>
        <SectionHeading
          eyebrow="What you get"
          title="Everything downstream of the decision, generated"
          lede="You make the character choices. The studio produces the eight artefacts that turn those choices into a month of publishable content."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((item) => (
            <TileLink
              key={item.title}
              href={item.href}
              title={item.title}
              blurb={item.blurb}
              icon={item.icon}
            />
          ))}
        </div>
      </PersonaSection>

      {/* ------------------------------ Routes ---------------------------- */}
      <PersonaSection tone="plate" id="routes">
        <SectionHeading
          eyebrow="Production route"
          title="What a persona costs you before it works"
          lede="Every card on this site carries a coloured stripe down its leading edge. It encodes one thing: what you have to build before the face is reproducible."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {PRODUCTION_ROUTES.map((route) => (
            <div
              key={route.id}
              className={`psn-card psn-stripe psn-sheet psn-route-${route.id} rounded-xl p-6 pl-7`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {route.label}
                </h3>
                <span
                  className="psn-seed text-xs"
                  style={{ color: "var(--psn-route-ink)" }}
                >
                  {"●".repeat(route.reliability)}
                  <span className="opacity-25">
                    {"●".repeat(5 - route.reliability)}
                  </span>
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                {route.blurb}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {route.detail}
              </p>
              <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Setup</dt>
                  <dd className="font-medium text-foreground">
                    {route.setupMinutes === 0
                      ? "None"
                      : `${route.setupMinutes} min`}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">You need</dt>
                  <dd className="mt-1 space-y-1">
                    {route.needs.map((need) => (
                      <p key={need} className="text-foreground">
                        {need}
                      </p>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </PersonaSection>

      {/* ---------------------------- How it works ------------------------ */}
      <PersonaSection>
        <SectionHeading
          eyebrow="How it works"
          title="Six steps, then a sheet you can hand to anyone"
          action={
            <Link
              href="/persona/studio"
              prefetch={false}
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: "var(--psn-accent-text)" }}
            >
              Start now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.name} className="psn-sheet rounded-xl p-5">
              <span className="psn-seed text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-1 font-semibold text-foreground">{step.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </PersonaSection>

      {/* ------------------------------ Models ---------------------------- */}
      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow="Model coverage"
          title="One sheet, ten sets of syntax"
          lede="Each generator holds a face by a different mechanism. The studio emits the right one for each rather than the same prompt with a different aspect ratio."
          action={
            <Link
              href="/persona/models"
              prefetch={false}
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: "var(--psn-accent-text)" }}
            >
              Full model guide
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { title: "Image", models: imageModels },
            { title: "Video, avatar and voice", models: videoModels },
          ].map((group) => (
            <div key={group.title} className="psn-sheet rounded-xl p-5">
              <Stamp>{group.title}</Stamp>
              <ul className="mt-3 divide-y divide-border">
                {group.models.map((model) => (
                  <li key={model.slug} className="py-3">
                    <Link
                      href={`/persona/models/${model.slug}`}
                      prefetch={false}
                      className="group flex flex-wrap items-baseline justify-between gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className="font-medium text-foreground group-hover:underline">
                        {model.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {model.consistency}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </PersonaSection>

      {/* ------------------------------- Cast ----------------------------- */}
      <PersonaSection>
        <SectionHeading
          eyebrow="The cast"
          title="Open a finished sheet before you build one"
          lede={`${stats.personas} complete personas across ${stats.niches} niches. Each one carries the trap that will get it caught, because a cast where everything works is a brochure.`}
          action={
            <Link
              href="/persona/cast"
              prefetch={false}
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: "var(--psn-accent-text)" }}
            >
              All {stats.personas}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.slice(0, 6).map((entry) => (
            <PersonaCard key={entry.slug} entry={entry} />
          ))}
        </div>

        <div className="psn-rail mt-6 flex gap-2 overflow-x-auto pb-1">
          {niches.map((niche) => (
            <Link
              key={niche.slug}
              href={`/persona/niche/${niche.slug}`}
              prefetch={false}
              className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-[var(--psn-accent)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {niche.label} · {niche.count}
            </Link>
          ))}
        </div>
      </PersonaSection>

      {/* ---------------------------- Comparison -------------------------- */}
      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow="Where this sits"
          title="Four ways to get a consistent creator, compared honestly"
          lede="Including the one where you should not use us."
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="psn-stamp py-3 pr-4 font-normal">Approach</th>
                <th className="psn-stamp py-3 pr-4 font-normal">Consistency</th>
                <th className="psn-stamp py-3 pr-4 font-normal">Cost</th>
                <th className="psn-stamp py-3 pr-4 font-normal">Portable</th>
                <th className="psn-stamp py-3 font-normal">In one line</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.approach} className="border-b border-border align-top">
                  <td className="py-4 pr-4 font-medium text-foreground">
                    {row.approach}
                  </td>
                  <td className="py-4 pr-4 text-muted-foreground">
                    {row.consistency}
                  </td>
                  <td className="py-4 pr-4 text-muted-foreground">{row.cost}</td>
                  <td className="py-4 pr-4 text-muted-foreground">
                    {row.portable}
                  </td>
                  <td className="py-4 text-muted-foreground">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PersonaSection>

      {/* --------------------------- Compliance --------------------------- */}
      <PersonaSection>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <SectionHeading
              eyebrow="Disclosure"
              title="The part every other tool leaves to you"
              lede="Two separate obligations in every market on this list: that the creator is synthetic, and that the post is commercial. One does not satisfy the other."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {MARKETS.slice(0, 6).map((market) => (
                <div key={market.id} className="psn-sheet rounded-lg p-4">
                  <p className="font-medium text-foreground">{market.label}</p>
                  <p className="psn-stamp mt-1">{market.regulator}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {market.rule}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href="/persona/disclosure"
              prefetch={false}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: "var(--psn-accent-text)" }}
            >
              Generate your disclosure line
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="psn-accent-panel self-start rounded-xl p-6">
            <Languages
              className="h-5 w-5"
              style={{ color: "var(--psn-accent)" }}
              aria-hidden="true"
            />
            <h3 className="mt-3 text-lg font-semibold text-foreground">
              The disclosure follows the post, not the site
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A Hindi caption needs a Hindi disclosure — ASCI is explicit that it
              must be in the same language as the post, and an English
              &ldquo;#ad&rdquo; on a Hindi reel is a finding against you rather
              than a defence. AltF Persona carries the wording in{" "}
              {LANGUAGES.length} languages.
            </p>
            <div className="psn-rail mt-4 flex flex-wrap gap-1.5">
              {LANGUAGES.map((language) => (
                <span
                  key={language.id}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {language.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </PersonaSection>

      {/* ---------------------------- Use cases --------------------------- */}
      <PersonaSection tone="plate">
        <SectionHeading eyebrow="Who this is for" title="Four honest use cases" />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Users,
              title: "Solo creators",
              blurb:
                "You want to publish daily in a niche where your own face is not the product. The persona is a presenter, and the method is still yours.",
            },
            {
              icon: BadgeCheck,
              title: "Brands running owned channels",
              blurb:
                "A house presenter who is available at 2am, speaks four languages, and never renegotiates. Declared, on the brand's own account.",
            },
            {
              icon: ScrollText,
              title: "Agencies pitching concepts",
              blurb:
                "A character sheet is a deliverable a client can approve before anything is rendered. That is a shorter revision loop than a mood board.",
            },
            {
              icon: Wallet,
              title: "Sellers making product content",
              blurb:
                "Consistent lifestyle frames around a real product, at volume. The product must be real; the presenter can be declared as not.",
            },
          ].map((item) => (
            <div key={item.title} className="psn-sheet rounded-xl p-5">
              <item.icon
                className="h-5 w-5"
                style={{ color: "var(--psn-accent)" }}
                aria-hidden="true"
              />
              <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.blurb}
              </p>
            </div>
          ))}
        </div>
      </PersonaSection>

      {/* ------------------------------- FAQ ------------------------------ */}
      <PersonaSection>
        <SectionHeading eyebrow="Questions" title="Frequently asked" />
        <FaqList items={FAQS} />

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/persona/studio"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{ background: "var(--psn-accent)" }}
          >
            Build your persona
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/persona/pricing"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-[var(--psn-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            What it costs
          </Link>
        </div>
      </PersonaSection>
    </main>
  );
}
