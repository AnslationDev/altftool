import Link from "next/link";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import JsonLd from "@/platform/seo/JsonLd";
import { createBreadcrumbJsonLd } from "@/platform/seo/generateMetadata";

export const metadata = createPageMetadata({
  title: "Open Source Licenses & Credits",
  description:
    "AltFTool is built with open-source software. Credits and license notices for the libraries and projects that power our free browser tools and games.",
  path: "/licenses",
});

/**
 * Curated credits for notable open-source dependencies with notice
 * obligations (MIT / Apache-2.0 / BSD / ISC). Full dependency metadata
 * lives in package.json; add new ports here per docs/THIRD_PARTY.md.
 */
const CREDITS = [
  { name: "React & Next.js", license: "MIT", href: "https://nextjs.org", note: "UI framework and app router powering the whole site." },
  { name: "Tailwind CSS", license: "MIT", href: "https://tailwindcss.com", note: "Utility-first styling layer." },
  { name: "Lucide Icons", license: "ISC", href: "https://lucide.dev", note: "Icon set used across the platform." },
  { name: "Radix UI", license: "MIT", href: "https://www.radix-ui.com", note: "Accessible UI primitives (dialogs, menus, switches)." },
  { name: "Firebase JS SDK", license: "Apache-2.0", href: "https://firebase.google.com", note: "Auth, Firestore content, and storage." },
  { name: "pdf-lib / jsPDF / PDF.js", license: "MIT / MIT / Apache-2.0", href: "https://mozilla.github.io/pdf.js/", note: "Client-side PDF reading, editing, and generation." },
  { name: "browser-image-compression", license: "MIT", href: "https://github.com/Donaldcwl/browser-image-compression", note: "In-browser image compression." },
  { name: "TensorFlow.js & models", license: "Apache-2.0", href: "https://www.tensorflow.org/js", note: "On-device AI features (object detection and more)." },
  { name: "Chart.js", license: "MIT", href: "https://www.chartjs.org", note: "Charts in calculators and dashboards." },
  { name: "Monaco Editor", license: "MIT", href: "https://microsoft.github.io/monaco-editor/", note: "Code editors in developer tools." },
  { name: "Leaflet", license: "BSD-2-Clause", href: "https://leafletjs.com", note: "Interactive maps." },
  { name: "framer-motion", license: "MIT", href: "https://www.framer.com/motion/", note: "Animations and transitions." },
  { name: "js-yaml, diff, jszip, file-saver", license: "MIT / BSD-3 / MIT / MIT", href: "https://github.com", note: "Data conversion and file utilities." },
  { name: "astronomy-engine", license: "MIT", href: "https://github.com/cosinekitty/astronomy", note: "Astronomy calculations." },
  { name: "compromise", license: "MIT", href: "https://github.com/spencermountain/compromise", note: "Natural-language text processing." },
];

export default function LicensesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <JsonLd
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Licenses", path: "/licenses" },
          ]),
        ]}
      />

      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span aria-hidden="true" className="px-2">
          /
        </span>
        <span className="text-foreground">Licenses</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Open Source Licenses &amp; Credits
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
        AltFTool stands on the shoulders of the open-source community. This page
        credits the projects we build with and carries the license notices their
        authors ask for. Thank you to every maintainer.
      </p>

      <section aria-labelledby="licenses-libraries" className="mt-10">
        <h2 id="licenses-libraries" className="text-xl font-bold text-foreground">
          Libraries we build with
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {CREDITS.map((credit) => (
            <li
              key={credit.name}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <a
                  href={credit.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="font-semibold text-foreground hover:text-primary"
                >
                  {credit.name}
                </a>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {credit.license}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {credit.note}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="licenses-games" className="mt-10">
        <h2 id="licenses-games" className="text-xl font-bold text-foreground">
          Games &amp; experiences
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          AltFTool games are original implementations written for this site.
          Where a game belongs to a classic genre (falling blocks, maze chase,
          endless runner), only the public-domain game mechanics are used — no
          third-party code, art, audio, or trademarks. Full provenance notes are
          kept in our engineering docs for every addition.
        </p>
      </section>

      <section aria-labelledby="licenses-contact" className="mt-10">
        <h2 id="licenses-contact" className="text-xl font-bold text-foreground">
          Questions or corrections
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          If you maintain a project we use and want an attribution updated,{" "}
          <Link href="/policypages/contact" className="font-medium text-primary hover:underline">
            contact us
          </Link>{" "}
          and we&apos;ll fix it promptly.
        </p>
      </section>
    </main>
  );
}
