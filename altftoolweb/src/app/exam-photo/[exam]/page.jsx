import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createHowToJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { getRelatedContentForPreset, RelatedContentSection } from "@/platform/linking";
import { EXAM_SPECS, SPECS_READ_ON, getExamBySlug, getOtherExams } from "../data/examSpecs";
import { assetLine, buildExamSeo } from "../data/examSeo";
import { formatIsoDate } from "../lib/specMath";
import ExamResizer from "../components/ExamResizer";
import SpecSheet, { SourceLine, SourceStamp } from "../components/SpecSheet";

export const dynamic = "force-static";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return EXAM_SPECS.map((exam) => ({ exam: exam.slug }));
}

function metaDescription(exam) {
  const photo = assetLine(exam, "photo");
  const signature = assetLine(exam, "signature");
  const photoPart =
    exam.photoMode === "live-capture"
      ? "Photograph is a live capture with no KB limit"
      : `Photo ${photo}`;
  return `${exam.name} photo and signature size: ${photoPart}; signature ${signature}. From ${exam.source.doc} dated ${formatIsoDate(exam.source.issued)}. Resize a file to that target in the browser.`;
}

export async function generateMetadata({ params }) {
  const { exam: slug } = await params;
  const exam = getExamBySlug(slug);

  if (!exam) {
    return createPageMetadata({
      title: "Exam Photo Spec Not Found",
      path: `/exam-photo/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${exam.name} Photo & Signature Size - Spec + Resizer`,
    description: metaDescription(exam),
    path: `/exam-photo/${exam.slug}`,
    keywords: [
      `${exam.name} photo size`,
      `${exam.name} signature size`,
      `${exam.name} photo size in kb`,
      `${exam.name} photo resize`,
      `${exam.name} photo dimensions`,
      exam.body,
    ],
  });
}

export default async function ExamPhotoPage({ params }) {
  const { exam: slug } = await params;
  const exam = getExamBySlug(slug);

  if (!exam) notFound();

  const seo = buildExamSeo(exam);
  const path = `/exam-photo/${exam.slug}`;
  const others = getOtherExams(exam.slug, 6);
  const relatedItems = getRelatedContentForPreset(
    {
      href: path,
      title: `${exam.name} photo and signature size`,
      description: seo.intro,
      tags: [
        `${exam.name} photo size`,
        `${exam.name} signature size`,
        exam.body,
        "exam photo",
        "photo resize",
        "signature resize",
      ],
      section: "examPhoto",
    },
    "examSpec",
  );

  return (
    <>
      <JsonLd
        id={`exam-photo-schema-${exam.slug}`}
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Exam Photo & Signature Specs", path: "/exam-photo" },
            { name: `${exam.name} photo & signature size`, path },
          ]),
          createFaqJsonLd({
            path,
            questions: seo.faqs.map(([question, answer]) => ({ question, answer })),
          }),
          createHowToJsonLd({
            path,
            name: `How to resize a ${exam.name} photo or signature to the required size`,
            description: seo.intro,
            steps: seo.steps,
          }),
        ]}
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm text-[var(--muted-foreground)]">
          <Link href="/exam-photo" className="underline underline-offset-2">
            Exam photo &amp; signature specs
          </Link>{" "}
          <span aria-hidden="true">/</span> {exam.name}
        </nav>

        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {exam.name} photo and signature size
        </h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          {exam.fullName} &middot; {exam.body}
        </p>
        <p className="mt-4 text-base text-[var(--foreground)]">{seo.intro}</p>

        <SourceLine exam={exam} />

        <div className="mt-6">
          <ExamResizer exam={exam} />
        </div>

        <SpecSheet exam={exam} />

        <div className="mt-6">
          <SourceStamp exam={exam} />
        </div>

        <section className="mt-8" aria-labelledby="use-cases-heading">
          <h2 id="use-cases-heading" className="text-lg font-semibold text-[var(--foreground)]">
            Who lands on this page
          </h2>
          <ul className="mt-3 space-y-2">
            {seo.useCases.map((useCase) => (
              <li key={useCase} className="text-sm text-[var(--muted-foreground)]">
                {useCase}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8" aria-labelledby="how-heading">
          <h2 id="how-heading" className="text-lg font-semibold text-[var(--foreground)]">
            How the resizer hits the target
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            {seo.steps.map((step) => (
              <li key={step} className="text-sm text-[var(--muted-foreground)]">
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8" aria-labelledby="benefits-heading">
          <h2 id="benefits-heading" className="text-lg font-semibold text-[var(--foreground)]">
            How this page is built
          </h2>
          <dl className="mt-3 grid gap-4 sm:grid-cols-2">
            {seo.benefits.map(([title, body]) => (
              <div key={title} className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]">
                <dt className="text-sm font-semibold text-[var(--foreground)]">{title}</dt>
                <dd className="mt-1 text-sm text-[var(--muted-foreground)]">{body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-lg font-semibold text-[var(--foreground)]">
            Questions people ask about the {exam.name} photo size
          </h2>
          <dl className="mt-3 space-y-4">
            {seo.faqs.map(([question, answer]) => (
              <div key={question} className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]">
                <dt className="text-sm font-semibold text-[var(--foreground)]">{question}</dt>
                <dd className="mt-1 text-sm text-[var(--muted-foreground)]">{answer}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-8" aria-labelledby="others-heading">
          <h2 id="others-heading" className="text-lg font-semibold text-[var(--foreground)]">
            Other exam specs
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/exam-photo/${other.slug}`}
                  className="block rounded-xl bg-[var(--card)] p-4 text-sm font-medium text-[var(--foreground)] ring-1 ring-[var(--border)]"
                >
                  {other.name} photo &amp; signature size
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8" aria-labelledby="caveat-heading">
          <h2 id="caveat-heading" className="text-lg font-semibold text-[var(--foreground)]">
            Check this against the notice you are applying under
          </h2>
          <div className="mt-3 rounded-xl bg-[var(--warning-soft)] p-4 ring-1 ring-[var(--border)]">
            <p className="text-sm text-[var(--foreground)]">
              This page is not an authority on the {exam.name} specification and does not replace the
              notification. {exam.body} revises these rules from one cycle to the next, and the
              figures here were read from {exam.source.doc} on {formatIsoDate(SPECS_READ_ON)} - they
              describe that document on that date, nothing more. Before you upload anything, open{" "}
              <a
                href={exam.source.url}
                rel="noopener"
                className="underline decoration-[var(--border)] underline-offset-2 hover:decoration-[var(--primary)]"
              >
                the notice itself
              </a>{" "}
              and confirm the numbers. Where the notice and this page disagree, the notice governs
              your application.
            </p>
          </div>
        </section>
      </main>

      <RelatedContentSection
        title="Keep exploring AltFTool"
        description="Other exam specifications, and the image tools that pair with them."
        items={relatedItems}
        path={path}
        jsonLdName={`Related to the ${exam.name} photo and signature specification`}
      />
    </>
  );
}
