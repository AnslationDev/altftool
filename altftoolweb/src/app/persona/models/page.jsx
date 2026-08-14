import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createFaqJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  MODELS,
  MODEL_KINDS,
  PRODUCTION_ROUTES,
} from "@altftool/core/persona/taxonomy";
import PromptBridge from "../_components/PromptBridge";
import {
  AnswerBlock,
  FaqList,
  PersonaSection,
  RouteChip,
  SectionHeading,
  Stamp,
} from "../_components/Shell";

const description =
  "Ten generators, and the specific mechanism each one uses to hold a face: Midjourney's character reference, a Flux LoRA, Seedream's edit phrasing, IP-Adapter on Stable Diffusion, first-frame conditioning on the video models. Which to reach for, and where each one stops.";

const FAQS = [
  {
    question: "Which AI model is best for a consistent influencer face?",
    answer:
      "It depends on how far you need it to hold. For stills alone, Midjourney with a character reference gives the best-looking result for the least setup. For anything that has to survive odd angles or motion, a Flux or Stable Diffusion LoRA is the only route that reliably works, because it is the only one where the model has actually learned the face rather than being shown a picture of it. For talking video, a trained avatar removes the problem entirely at the cost of only ever producing a talking head.",
  },
  {
    question: "Can I use one character across several models?",
    answer:
      "The descriptor line is portable and the reference frame is portable. A trained LoRA is not — it is bound to the base model it was trained on, and moving to a different base model means retraining. That is the real switching cost of the trained route, and it is worth knowing before you pick a base model rather than after.",
  },
  {
    question: "What does --cw do in Midjourney?",
    answer:
      "It sets how much of the character reference carries over. At 100 you keep face, hair and clothing; at 0 you keep the face only, which is what you want when the same person has to appear in a different outfit. It is the dial between 'same character' and 'same photo', and most consistency complaints are really a --cw that was left at the default.",
  },
  {
    question: "Why does my face drift in AI video?",
    answer:
      "Because a video model interpolating between frames re-imagines anything it was not confident about, and a face is the thing it is least confident about. Feed an approved still as the first frame and describe the motion rather than the person — describing the face again inside a video prompt is the most common way people lose it. Then cut before the drift instead of trying to prompt it away.",
  },
];

export async function generateMetadata() {
  return createPageMetadata({
    title: "AI model guide — how each generator holds a face",
    description,
    path: "/persona/models",
    keywords: [
      "midjourney character reference",
      "flux lora character consistency",
      "stable diffusion ip-adapter face",
      "consistent character ai video",
      "sora first frame character",
      "ai model comparison character consistency",
    ],
  });
}

export default function ModelsPage() {
  return (
    <main>
      <JsonLd
        id="persona-models-jsonld"
        data={[
          createCollectionPageJsonLd({
            path: "/persona/models",
            name: "AltF Persona model guide",
            description,
          }),
          createItemListJsonLd({
            path: "/persona/models",
            name: "Generators covered",
            items: MODELS.map((model) => ({
              name: model.name,
              path: `/persona/models/${model.slug}`,
            })),
          }),
          createFaqJsonLd({ path: "/persona/models", questions: FAQS }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Models", path: "/persona/models" },
          ]),
        ]}
      />

      <div className="border-b border-border">
        <div className="mx-auto max-w-[var(--anslation-ds-container)] px-4 py-10 sm:px-6 lg:px-8">
          <Stamp>Model guide</Stamp>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Every generator holds a face by a different mechanism
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>

          <div className="mt-6 max-w-3xl">
            <AnswerBlock>
              <p>
                The mistake almost everyone makes is treating these as one
                interface with different pricing. They are not. A prompt that
                works on Midjourney because of <code>--cref</code> has no
                equivalent on a video model, and the phrasing that keeps a subject
                on Seedream will re-roll the face on Flux.
              </p>
              <p>
                The studio emits the right syntax for each rather than the same
                prompt with a different aspect ratio. This page is the reasoning
                behind that.
              </p>
            </AnswerBlock>
          </div>
        </div>
      </div>

      {/* ------------------------ Route support matrix -------------------- */}
      <PersonaSection tone="plate">
        <SectionHeading
          eyebrow="At a glance"
          title="Which route each model can actually take you on"
          lede="A model that cannot be trained has a hard ceiling on how consistent it can be, no matter how well you prompt it. That is worth knowing before you build a workflow on it."
        />

        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="psn-stamp py-3 pr-4 font-normal">Model</th>
                <th className="psn-stamp py-3 pr-4 font-normal">Kind</th>
                {PRODUCTION_ROUTES.map((route) => (
                  <th key={route.id} className="psn-stamp py-3 pr-4 font-normal">
                    {route.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODELS.map((model) => (
                <tr key={model.slug} className="border-b border-border">
                  <td className="py-3 pr-4">
                    <Link
                      href={`/persona/models/${model.slug}`}
                      prefetch={false}
                      className="font-medium text-foreground hover:underline"
                    >
                      {model.name}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {MODEL_KINDS.find((kind) => kind.id === model.kind)?.label}
                  </td>
                  {PRODUCTION_ROUTES.map((route) => (
                    <td key={route.id} className="py-3 pr-4">
                      {model.routes.includes(route.id) ? (
                        <span
                          className="psn-seed text-sm"
                          style={{ color: `var(--psn-${route.id === "prompt-only" ? "prompt" : route.id})` }}
                        >
                          ●
                        </span>
                      ) : (
                        <span className="text-muted-foreground opacity-40">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PersonaSection>

      {/* ------------------------------ Cards ----------------------------- */}
      {MODEL_KINDS.map((kind) => {
        const group = MODELS.filter((model) => model.kind === kind.id);
        if (!group.length) return null;

        return (
          <PersonaSection key={kind.id} id={kind.id}>
            <SectionHeading
              eyebrow={`${group.length} ${group.length === 1 ? "model" : "models"}`}
              title={kind.label}
              lede={kind.blurb}
            />
            <div className="grid gap-4 lg:grid-cols-2">
              {group.map((model) => (
                <Link
                  key={model.slug}
                  href={`/persona/models/${model.slug}`}
                  prefetch={false}
                  className="psn-sheet flex flex-col gap-3 rounded-xl p-5 transition hover:border-[var(--psn-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {model.name}
                    </h3>
                    <span className="psn-stamp">{model.vendor}</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--psn-accent-text)" }}>
                    {model.consistency}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {model.mechanism}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    {model.routes.map((routeId) => (
                      <RouteChip
                        key={routeId}
                        route={PRODUCTION_ROUTES.find((route) => route.id === routeId)}
                      />
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </PersonaSection>
        );
      })}

      <PersonaSection tone="plate">
        <SectionHeading eyebrow="Questions" title="Frequently asked" />
        <FaqList items={FAQS} />
        <PromptBridge className="mt-10" />
      </PersonaSection>
    </main>
  );
}
