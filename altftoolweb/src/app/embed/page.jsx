import { createPageMetadata, createBreadcrumbJsonLd } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import { PRODUCTION_SITE_URL } from "@/platform/seo/siteUrl";
import { EMBEDDABLE_CATEGORIES, getEmbeddableTools } from "./embedRegistry";
import EmbedPicker from "./EmbedPicker";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Free Embeddable Widgets — Calculators, Generators & Converters",
    description:
      "Add free calculators, generators, and converters to your website with one copy-paste snippet. 190+ AltFTool widgets — no signup, no API key, fully responsive.",
    path: "/embed",
    keywords: [
      "free embeddable calculator",
      "website widgets",
      "embed calculator iframe",
      "free widgets for blog",
    ],
  });
}

const STEPS = [
  { title: "Pick a widget", text: "Search 190+ calculators, generators, and converters below." },
  { title: "Copy the snippet", text: "One iframe tag — no account, no API key, no build step." },
  { title: "Paste it anywhere", text: "Works in WordPress, Ghost, Webflow, plain HTML — anywhere an iframe works." },
];

export default function EmbedHubPage() {
  const tools = getEmbeddableTools();

  return (
    <main className="bg-(--page) text-(--foreground)">
      <JsonLd
        id="embed-hub-breadcrumb"
        data={createBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Embeddable widgets", path: "/embed" },
        ])}
      />
      <div className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-5 lg:px-8">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Free widgets for your website
          </h1>
          <p className="mt-3 text-base leading-7 text-(--muted-foreground)">
            {`Embed any of ${tools.length} AltFTool calculators, generators, and converters with a
            single copy-paste snippet. Free forever, responsive, light & dark themes, and no
            signup — just keep the small "Widget by AltFTool" credit link.`}
          </p>
        </header>

        <ol className="mt-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-[12px] border border-(--border) bg-(--surface) p-4"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-(--primary) text-sm font-bold text-(--primary-foreground)">
                {index + 1}
              </span>
              <h2 className="mt-3 text-sm font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm leading-6 text-(--muted-foreground)">{step.text}</p>
            </li>
          ))}
        </ol>

        <section aria-label="Widget picker" className="mt-10">
          <EmbedPicker
            tools={tools}
            categories={EMBEDDABLE_CATEGORIES}
            baseUrl={PRODUCTION_SITE_URL}
          />
        </section>

        <section className="mt-10 max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight">Fair use</h2>
          <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
            Widgets are free for personal and commercial sites. The attribution link inside the
            widget (and the credit line in the snippet) must stay visible — that&rsquo;s the whole
            deal. Widgets run in your visitor&rsquo;s browser; we never see the data they enter.
          </p>
        </section>
      </div>
    </main>
  );
}
