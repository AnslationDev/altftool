import Link from "next/link";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { EXAM_SPECS, SPECS_READ_ON } from "./data/examSpecs";
import { assetLine } from "./data/examSeo";
import { formatIsoDate } from "./lib/specMath";

export const dynamic = "force-static";

export async function generateMetadata() {
  return createPageMetadata({
    title: "Exam Photo & Signature Size Specs + Resizer",
    description:
      "Photo and signature upload sizes in KB and pixels for 12 Indian exams including SSC, IBPS, SBI, UPSC, RRB, NEET and JEE, with a browser resizer for each.",
    path: "/exam-photo",
    keywords: [
      "exam photo size",
      "exam signature size in kb",
      "photo resize for exam form",
      "ssc cgl photo size",
      "ibps photo signature size",
      "neet photo size",
    ],
  });
}

function summaryLine(exam) {
  if (exam.photoMode === "live-capture") {
    return `Live photo capture (no file) · signature ${assetLine(exam, "signature")}`;
  }
  const photo = assetLine(exam, "photo");
  const signature = assetLine(exam, "signature");
  return signature ? `Photo ${photo} · signature ${signature}` : `Photo ${photo}`;
}

export default function ExamPhotoHubPage() {
  return (
    <>
      <JsonLd
        id="exam-photo-hub-schema"
        data={[
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Exam Photo & Signature Specs", path: "/exam-photo" },
          ]),
          createItemListJsonLd({
            path: "/exam-photo",
            name: "Exam photo and signature upload specifications",
            items: EXAM_SPECS.map((exam) => ({
              name: `${exam.name} photo & signature size`,
              url: `/exam-photo/${exam.slug}`,
            })),
          }),
        ]}
      />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Exam photo and signature specs
        </h1>
        <p className="mt-3 text-base text-[var(--foreground)]">
          Each page states one exam&apos;s photograph and signature upload rules exactly as the
          conducting body printed them, names the notification the figures were read from, stamps the
          date they were read, and resizes a file to that same target in the browser. The table and
          the resizer are generated from one record, so they cannot disagree.
        </p>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Specs read on {formatIsoDate(SPECS_READ_ON)}.
        </p>

        <ul className="mt-6 space-y-3">
          {EXAM_SPECS.map((exam) => (
            <li key={exam.slug}>
              <Link
                href={`/exam-photo/${exam.slug}`}
                className="block rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]"
              >
                <span className="block text-base font-semibold text-[var(--foreground)]">
                  {exam.name} photo &amp; signature size
                </span>
                <span className="mt-1 block text-sm text-[var(--muted-foreground)]">
                  {summaryLine(exam)}
                </span>
                <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                  {exam.source.doc} &middot; {formatIsoDate(exam.source.issued)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
