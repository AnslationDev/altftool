import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createPageMetadata,
  getSiteUrl,
} from "@/platform/seo/generateMetadata";
import {
  OPEN_DATA_LICENSE,
  EXAM_CONFIDENCE_LEVELS,
  examSpecLimitations,
  openDataCatalog,
  transformConverterLimitations,
} from "./data/openData";

export const dynamic = "force-static";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Open Data — Free JSON APIs With Attribution",
    description:
      "Two read-only JSON endpoints anyone may use: Indian exam photo and signature upload specs with the notification each figure was read from, and the AltFTool format converter index. Free with attribution, no key, CORS open.",
    path: "/open-data",
    keywords: [
      "open data api",
      "free json api",
      "exam photo size api",
      "exam signature size json",
      "format converter index",
      "open data attribution",
    ],
  });
}

const LIMITATIONS_BY_ID = {
  "exam-photo-specs": examSpecLimitations,
  "transform-converters": transformConverterLimitations,
};

function datasetJsonLd(site, dataset) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": `${site}/open-data#${dataset.id}`,
    name: dataset.name,
    description: dataset.blurb,
    url: `${site}/open-data`,
    license: `${site}/open-data`,
    isAccessibleForFree: true,
    creator: { "@id": `${site}/#organization` },
    publisher: { "@id": `${site}/#organization` },
    ...(dataset.updated ? { dateModified: dataset.updated } : {}),
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: dataset.endpoint,
      },
    ],
  };
}

export default function OpenDataPage() {
  const site = getSiteUrl();
  const catalog = openDataCatalog(site);
  const license = OPEN_DATA_LICENSE;

  return (
    <>
      <JsonLd
        id="open-data-schema"
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Open Data", path: "/open-data" },
          ]),
          ...catalog.map((dataset) => datasetJsonLd(site, dataset)),
        ]}
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="mb-3 text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span aria-hidden="true" className="px-2">
            /
          </span>
          <span className="text-foreground">Open Data</span>
        </nav>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Open data
        </h1>
        <p className="mt-3 text-base leading-relaxed text-foreground">
          Two of the datasets behind this site are published as plain JSON that
          anyone may fetch, cache, republish and build on. No key, no signup, no
          quota to apply for. One condition: credit AltFTool and link to the page
          the record came from.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Both endpoints are read-only <code className="font-mono">GET</code>,
          answer any origin —{" "}
          <code className="font-mono">Access-Control-Allow-Origin: *</code> — and
          are regenerated daily from the same records the pages on this site
          render from, so an endpoint can never quote a figure the page does not
          show.
        </p>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="open-data-license" className="mt-10">
          <h2
            id="open-data-license"
            className="text-xl font-bold text-foreground"
          >
            Licence, in plain words
          </h2>
          <div className="mt-4 rounded-xl border border-border bg-surface-soft p-4 sm:p-5">
            <p className="text-sm leading-relaxed text-foreground">
              {license.summary}
            </p>

            <h3 className="mt-5 text-sm font-semibold text-foreground">
              What attribution means here
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Credit:</span>{" "}
                {license.attribution.credit}.
              </li>
              <li>
                <span className="font-medium text-foreground">Link to:</span>{" "}
                {license.attribution.link_to}
              </li>
              <li>
                <span className="font-medium text-foreground">Where:</span>{" "}
                {license.attribution.where}
              </li>
              <li>
                <span className="font-medium text-foreground">Format:</span>{" "}
                {license.attribution.format}
              </li>
            </ul>

            <h3 className="mt-5 text-sm font-semibold text-foreground">
              No licence name
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {license.named_license_note}
            </p>

            <h3 className="mt-5 text-sm font-semibold text-foreground">
              No warranty
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {license.no_warranty}
            </p>

            <h3 className="mt-5 text-sm font-semibold text-foreground">
              Three requests, not conditions
            </h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
              {license.requests.map((request) => (
                <li key={request}>{request}</li>
              ))}
            </ul>

            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
              {license.changes}
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {catalog.map((dataset) => {
          const limitations = LIMITATIONS_BY_ID[dataset.id]?.() || [];

          return (
            <section
              key={dataset.id}
              aria-labelledby={`dataset-${dataset.id}`}
              className="mt-12"
            >
              <h2
                id={`dataset-${dataset.id}`}
                className="text-xl font-bold text-foreground"
              >
                {dataset.name}
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {dataset.recordCount} {dataset.recordNoun}
                {dataset.updated ? ` · records read on ${dataset.updated}` : ""} ·
                rendered for people at{" "}
                <Link
                  href={dataset.sourcePath}
                  className="font-medium text-primary hover:underline"
                >
                  {dataset.sourceLabel}
                </Link>
              </p>

              <p className="mt-3 overflow-x-auto rounded-lg border border-border bg-card p-3 font-mono text-xs leading-relaxed">
                <span className="text-muted-foreground">GET </span>
                <a
                  href={dataset.path}
                  className="text-primary hover:underline"
                  rel="nofollow"
                >
                  {dataset.endpoint}
                </a>
              </p>

              <p className="mt-3 text-sm leading-relaxed text-foreground">
                {dataset.blurb}
              </p>

              <h3 className="mt-6 text-sm font-semibold text-foreground">
                Attribution for this dataset
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Link to the record&apos;s{" "}
                <code className="font-mono">
                  {dataset.attributionExample.link_field}
                </code>
                :
              </p>
              <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-card p-3 text-xs leading-relaxed text-foreground">
                <code className="font-mono">
                  {dataset.attributionExample.html}
                </code>
              </pre>

              <h3 className="mt-6 text-sm font-semibold text-foreground">
                Fields on each record
              </h3>
              <dl className="mt-2 space-y-2.5">
                {dataset.fields.map(([field, meaning]) => (
                  <div key={field}>
                    <dt className="font-mono text-xs font-semibold text-foreground">
                      {field}
                    </dt>
                    <dd className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {meaning}
                    </dd>
                  </div>
                ))}
              </dl>

              {limitations.length ? (
                <>
                  <h3 className="mt-6 text-sm font-semibold text-foreground">
                    Limitations you must read before republishing
                  </h3>
                  <ul className="mt-2 list-disc space-y-2 rounded-xl bg-warning-soft p-4 pl-8 text-sm leading-relaxed text-foreground">
                    {limitations.map((limitation) => (
                      <li key={limitation}>{limitation}</li>
                    ))}
                  </ul>
                </>
              ) : null}

              {dataset.id === "exam-photo-specs" ? (
                <>
                  <h3 className="mt-6 text-sm font-semibold text-foreground">
                    What <code className="font-mono">source.confidence</code>{" "}
                    means
                  </h3>
                  <dl className="mt-2 space-y-2.5">
                    {Object.entries(EXAM_CONFIDENCE_LEVELS).map(
                      ([level, meaning]) => (
                        <div key={level}>
                          <dt className="font-mono text-xs font-semibold text-foreground">
                            {level}
                          </dt>
                          <dd className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                            {meaning}
                          </dd>
                        </div>
                      ),
                    )}
                  </dl>
                </>
              ) : null}
            </section>
          );
        })}

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="open-data-usage" className="mt-12">
          <h2 id="open-data-usage" className="text-xl font-bold text-foreground">
            Fetching it
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground">
            Nothing to configure. Both responses are pretty-printed so you can
            open them in a browser tab and read the provenance before you decide
            to trust them.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-border bg-card p-3 text-xs leading-relaxed text-foreground">
            <code className="font-mono">{`curl -s ${site}/api/open-data/exam-photo-specs | jq '.records[0].source'

fetch("${site}/api/open-data/transform-converters")
  .then((response) => response.json())
  .then(({ records }) => console.log(records.length));`}</code>
          </pre>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">Methods:</span>{" "}
              <code className="font-mono">GET</code> only. Nothing here is
              writable.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Cross-origin:
              </span>{" "}
              open to any origin, so browser-side{" "}
              <code className="font-mono">fetch</code> works from your own pages.
            </li>
            <li>
              <span className="font-medium text-foreground">Freshness:</span>{" "}
              regenerated daily. There is no push notification and no webhook —
              re-fetch on your own schedule.
            </li>
            <li>
              <span className="font-medium text-foreground">Stability:</span>{" "}
              fields are added rather than renamed where possible, and keys are
              omitted rather than set to <code className="font-mono">null</code>{" "}
              when a source document does not print that figure. Read defensively
              anyway.
            </li>
          </ul>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="open-data-not" className="mt-12">
          <h2 id="open-data-not" className="text-xl font-bold text-foreground">
            What this is not
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">
                Not a conversion API.
              </span>{" "}
              The converter index lists pages. There is no endpoint that accepts
              a file and returns a converted one.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Not an authority on any exam.
              </span>{" "}
              AltFTool is a tools site. The conducting body named in each
              record&apos;s <code className="font-mono">source.document</code> is
              the authority; open that document before you act on a figure.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Not a live feed.
              </span>{" "}
              Exam records are a dated reading of a named notification, stamped
              in <code className="font-mono">source.read_on</code>.
            </li>
          </ul>
        </section>

        {/* ---------------------------------------------------------------- */}
        <section aria-labelledby="open-data-contact" className="mt-12">
          <h2
            id="open-data-contact"
            className="text-xl font-bold text-foreground"
          >
            Corrections, and asking for more
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            If a figure is wrong, or a notification has been superseded, tell us
            and it gets fixed at the source — the pages and both endpoints are
            generated from the same records, so one correction lands everywhere.
            If you want a dataset published that is not here yet, say which one
            and what you would do with it.{" "}
            <Link
              href="/policypages/contact"
              className="font-medium text-primary hover:underline"
            >
              Contact us
            </Link>
            . Media and brand enquiries belong on the{" "}
            <Link
              href="/press"
              className="font-medium text-primary hover:underline"
            >
              press page
            </Link>
            .
          </p>
        </section>
      </main>
    </>
  );
}
