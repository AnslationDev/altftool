import { ExternalLink, Laptop, ShieldCheck } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

const PATH = "/desktop";
const NAME = "Desktop Software Directory";
const DESCRIPTION =
  "Browse a neutral directory of official desktop software download pages for Windows and Mac.";

const SOFTWARE = [
  {
    name: "Visual Studio Code",
    category: "Development",
    description: "Code editor downloads for supported desktop platforms.",
    href: "https://code.visualstudio.com/download",
  },
  {
    name: "Mozilla Firefox",
    category: "Browser",
    description: "Official Firefox desktop download options.",
    href: "https://www.mozilla.org/firefox/download/",
  },
  {
    name: "VLC media player",
    category: "Media",
    description: "Official VLC downloads from the VideoLAN project.",
    href: "https://www.videolan.org/vlc/",
  },
  {
    name: "OBS Studio",
    category: "Recording",
    description: "Official OBS Studio download page.",
    href: "https://obsproject.com/download",
  },
  {
    name: "Zoom Workplace",
    category: "Communication",
    description: "Official Zoom desktop download centre.",
    href: "https://zoom.us/download",
  },
  {
    name: "Discord",
    category: "Communication",
    description: "Official Discord desktop download page.",
    href: "https://discord.com/download",
  },
];

export const metadata = createPageMetadata({
  title: `${NAME} for Windows & Mac`,
  description: DESCRIPTION,
  path: PATH,
  keywords: ["desktop software", "Windows downloads", "Mac downloads", "official software links"],
});

export default function DesktopSoftwarePage() {
  return (
    <main className="min-h-screen bg-(--background) text-(--foreground)">
      <JsonLd
        id="desktop-collection-schema"
        data={[
          createCollectionPageJsonLd({ path: PATH, name: NAME, description: DESCRIPTION }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Desktop Software", path: PATH },
          ]),
        ]}
      />

      <section className="border-b border-(--border) bg-(--card)" aria-labelledby="desktop-software-title">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="inline-flex items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--muted) px-3 py-2 text-sm font-semibold text-(--primary)">
            <Laptop className="h-4 w-4" aria-hidden="true" />
            Official-link directory
          </p>
          <h1 id="desktop-software-title" className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
            Desktop software for Windows and Mac
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-(--muted-foreground) sm:text-lg">
            A small, unranked directory of publisher download pages. AltFTool does not assign popularity,
            sales, age, rating, or “top” labels to these apps.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8" aria-labelledby="desktop-directory-title">
        <div className="flex items-start gap-3 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--muted) p-4 text-sm leading-6 text-(--muted-foreground)">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-(--primary)" aria-hidden="true" />
          <p>
            Links below open the publisher’s website. Verify platform support, licence, price, system requirements,
            and installer signature there before downloading.
          </p>
        </div>

        <h2 id="desktop-directory-title" className="mt-10 text-3xl font-bold tracking-tight">
          Software links
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SOFTWARE.map((item) => (
            <article
              key={item.name}
              className="flex h-full flex-col rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-(--primary)">{item.category}</p>
              <h3 className="mt-2 text-lg font-semibold">{item.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-(--muted-foreground)">{item.description}</p>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-4 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary) focus-visible:outline-none focus-visible:shadow-[var(--anslation-ds-focus-ring)]"
              >
                Open official page <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
