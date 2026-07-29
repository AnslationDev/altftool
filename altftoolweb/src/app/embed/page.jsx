import { createPageMetadata, createBreadcrumbJsonLd } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import { PRODUCTION_SITE_URL } from "@/platform/seo/siteUrl";
import { EMBEDDABLE_CATEGORIES, getEmbeddableTools } from "./embedRegistry";
import EmbedPicker from "./EmbedPicker";

export async function generateMetadata() {
  // Derived, never hardcoded: the registry decides how many widgets exist.
  const count = getEmbeddableTools().length;
  return createPageMetadata({
    title: "Free Embeddable Widgets — Calculators & Converters",
    description: `Add free calculators and converters to your website with one copy-paste snippet. ${count} AltFTool widgets — no signup, no API key, fully responsive.`,
    path: "/embed",
    keywords: [
      "free embeddable calculator",
      "website widgets",
      "embed calculator iframe",
      "free widgets for blog",
      "oembed calculator widget",
    ],
  });
}

const STEPS = [
  { title: "Pick a widget", text: "Search every AltFTool calculator and converter below." },
  {
    title: "Copy the format you need",
    text: "Plain iframe, responsive wrapper, WordPress block, or just the URL — no account, no API key, no build step.",
  },
  {
    title: "Paste it anywhere",
    text: "Works in WordPress, Ghost, Webflow, Notion, plain HTML — anywhere an iframe works.",
  },
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
            {`Embed any of ${tools.length} AltFTool calculators and converters with a
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
              <span className="grid h-8 w-8 place-items-center rounded-full bg-(--primary-soft) text-sm font-bold text-(--primary-text)">
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
          <h2 className="text-xl font-semibold tracking-tight">Paste the URL, skip the HTML</h2>
          <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
            Every widget page publishes an{" "}
            <a
              href="https://oembed.com/"
              rel="noopener noreferrer"
              target="_blank"
              className="rounded-[4px] font-semibold text-(--primary-text) underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anslation-ds-primary-hover)]/35"
            >
              oEmbed
            </a>{" "}
            endpoint, so editors that resolve oEmbed can turn a pasted widget URL straight into the
            live widget — no HTML block, no code view. Self-hosted WordPress does this for authors
            allowed to post unfiltered HTML; Ghost resolves it in its embed card. Discourse needs
            an admin to allowlist{" "}
            <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">
              altftool.com
            </code>{" "}
            in its onebox settings first. Anywhere else, the HTML snippet still works.
          </p>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            Building your own integration? Call{" "}
            <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">
              /api/oembed?url=&hellip;
            </code>{" "}
            with a widget or tool URL and you get back a standard JSON oEmbed response, including
            the ready-to-inject <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">html</code>.
            It accepts <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">maxwidth</code>{" "}
            and <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">maxheight</code>.
          </p>
        </section>

        <section className="mt-10 max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight">Fair use</h2>
          <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
            Widgets are free for personal and commercial sites. The attribution link inside the
            widget (and the credit line in the snippet) must stay visible, and stay a normal
            followable link — that&rsquo;s the whole deal.
          </p>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            Most widgets compute in your visitor&rsquo;s browser. A few need live data — the
            currency converter fetches exchange rates from AltFTool, for example — so those make a
            network request to get it.
          </p>
          <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">
            <strong className="font-semibold text-(--foreground)">Tip:</strong> widgets follow the
            visitor&rsquo;s system theme by default. To pin one, append{" "}
            <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">
              ?theme=dark
            </code>{" "}
            or{" "}
            <code className="rounded-[6px] border border-(--border) bg-(--surface) px-1.5 py-0.5 text-xs">
              ?theme=light
            </code>{" "}
            to the iframe URL.
          </p>
        </section>
      </div>
    </main>
  );
}
