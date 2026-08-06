import { notFound } from "next/navigation";
import { SPECS_READ_ON, getExamBySlug } from "@/app/exam-photo/data/examSpecs";
import { formatIsoDate } from "@/app/exam-photo/lib/specMath";
import ExamResizer from "@/app/exam-photo/components/ExamResizer";
import { isEmbeddable } from "../../../embedRegistry";
import WidgetShell from "../../WidgetShell";
import { buildWidgetMetadata } from "../../widgetMetadata";

/**
 * Widget document for an /exam-photo resizer: /embed/widget/exam-photo/<slug>.
 *
 * ExamResizer is the same client component the public page mounts, given the
 * same `exam` record (plain data throughout — strings, numbers, arrays).
 *
 * It runs entirely in the visitor's browser here too, and that is a property of
 * the component rather than of the page around it: FileReader reads the picked
 * file, a <canvas> redraws it, canvas.toDataURL() encodes the JPEG, and an
 * <a download> saves it. No upload, no fetch, no API route — which is why its
 * own "Runs in this browser. The file never leaves the device." line stays
 * accurate inside an iframe, and why it is left rendered exactly as-is.
 *
 * Deliberately no generateStaticParams: these documents are noindex by design,
 * so prerendering them would only cost Amplify artifact size.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildWidgetMetadata(`exam-photo/${slug}`);
}

export default async function ExamPhotoWidgetPage({ params, searchParams }) {
  const { slug } = await params;
  const id = `exam-photo/${slug}`;
  if (!isEmbeddable(id)) notFound();

  // isEmbeddable() answers on a normalised id — parseWidgetId trims and
  // lowercases — so a slug differing only in case or trailing whitespace passes
  // the gate. The lookup below must be given the same normalised value, or it
  // misses and the next line dereferences null: an error page where a 404
  // belongs. Normalise once, here, rather than relying on each lookup's own
  // habits (getExamBySlug lowercases but does not trim; getToolBySlug does
  // neither).
  const exam = getExamBySlug(String(slug).trim().toLowerCase());
  if (!exam) notFound();
  const { theme } = (await searchParams) || {};

  return (
    <WidgetShell id={id} theme={theme}>
      <ExamResizer exam={exam} />
      {/*
        The public page carries a full provenance block and a "the notice
        governs your application" caveat. A widget cannot carry all of that, but
        it must not present these figures as timeless either — so it names the
        document and the day it was read, in the same terms the page uses.
      */}
      <p className="mt-3 text-xs leading-5 text-(--muted-foreground)">
        Figures read from {exam.source.doc} on {formatIsoDate(SPECS_READ_ON)}. {exam.body} revises
        these rules between cycles — check the notice you are applying under before you upload.
      </p>
    </WidgetShell>
  );
}
