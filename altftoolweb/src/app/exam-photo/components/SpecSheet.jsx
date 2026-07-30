import Link from "next/link";
import { buildEmbedSnippet, isEmbeddable } from "@/app/embed/embedRegistry";
import EmbedCodeCopy from "@/app/embed/EmbedCodeCopy";
import { DERIVED_DPI, SPECS_READ_ON, confidenceLabel } from "../data/examSpecs";
import { describeDimensions, formatIsoDate, resolveTargetPixels } from "../lib/specMath";

const EM_DASH = "—";

function pixelCell(asset) {
  const target = resolveTargetPixels(asset, {}, DERIVED_DPI);
  const resolved = target.error ? null : target;
  const stated = resolved && resolved.source === "stated" && asset.physical;
  const suffix = stated
    ? ` (${asset.physical.width} x ${asset.physical.height} ${asset.physical.unit} in the notice)`
    : "";
  return `${describeDimensions(asset, resolved)}${suffix}`;
}

function sourceHost(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * The citable line: which document, which body's domain, and the day we checked
 * it. Rendered high on the page, directly under the answer-first sentence, so
 * the fact and its attribution can be lifted together.
 */
export function SourceLine({ exam }) {
  const host = sourceHost(exam.source.url);
  return (
    <p className="mt-3 text-sm break-words text-[var(--muted-foreground)]">
      <span className="font-medium text-[var(--foreground)]">Source:</span>{" "}
      <a
        href={exam.source.url}
        rel="noopener"
        className="underline decoration-[var(--border)] underline-offset-2 hover:decoration-[var(--primary)]"
      >
        {exam.source.doc}
      </a>
      {host ? ` (${host})` : ""}, checked {formatIsoDate(SPECS_READ_ON)}.
    </p>
  );
}

export function SourceStamp({ exam }) {
  const primary = exam.source.confidence === "primary";
  return (
    <div className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
      <p className="text-sm font-medium text-[var(--foreground)]">Where these figures come from</p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{exam.source.doc}</p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-[var(--muted-foreground)]">Document date</dt>
          <dd className="text-sm font-medium text-[var(--foreground)]">
            {formatIsoDate(exam.source.issued) || EM_DASH}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-[var(--muted-foreground)]">Read on</dt>
          <dd className="text-sm font-medium text-[var(--foreground)]">
            {formatIsoDate(SPECS_READ_ON)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-[var(--muted-foreground)]">Status</dt>
          <dd
            className={`text-sm font-medium ${primary ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
          >
            {confidenceLabel(exam.source.confidence)}
          </dd>
        </div>
      </dl>
      {exam.source.note ? (
        <p className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {exam.source.note}
        </p>
      ) : null}
      <p className="mt-3 text-sm break-words text-[var(--muted-foreground)]">
        Document:{" "}
        <a
          href={exam.source.url}
          rel="nofollow noopener"
          className="underline decoration-[var(--border)] underline-offset-2"
        >
          {exam.source.url}
        </a>
      </p>
    </div>
  );
}

export default function SpecSheet({ exam }) {
  return (
    <section className="mt-6" aria-labelledby="spec-table-heading">
      <h2 id="spec-table-heading" className="text-lg font-semibold text-[var(--foreground)]">
        {exam.name} upload specification
      </h2>

      <div className="mt-3 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            {exam.name} photograph and signature upload specification: file, format, file size,
            dimensions and scan resolution
          </caption>
          <thead className="bg-[var(--card)]">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">File</th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">Format</th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">File size</th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">Dimensions</th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">
                Scan resolution
              </th>
            </tr>
          </thead>
          <tbody>
            {exam.photoMode === "live-capture" ? (
              <tr className="border-t border-[var(--border)]">
                <th scope="row" className="px-4 py-3 font-medium text-[var(--foreground)]">
                  Photograph
                </th>
                <td className="px-4 py-3 text-[var(--muted-foreground)]" colSpan={4}>
                  Live capture inside the form. No file, no KB limit, no pixel size.
                </td>
              </tr>
            ) : null}
            {exam.assets.map((asset) => (
              <tr key={asset.id} className="border-t border-[var(--border)]">
                <th scope="row" className="px-4 py-3 font-medium text-[var(--foreground)]">
                  {asset.label}
                </th>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">{asset.format}</td>
                <td className="px-4 py-3 text-[var(--foreground)]">
                  {asset.minKB} to {asset.maxKB} KB
                </td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">{pixelCell(asset)}</td>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">
                  {asset.dpi ? `${asset.dpi} DPI` : "Not specified"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <caption className="sr-only">
            Other {exam.name} photograph rules printed in the same notice
          </caption>
          <thead className="bg-[var(--card)]">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">Rule</th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">
                What the notice says
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--border)]">
              <th scope="row" className="px-4 py-3 font-medium text-[var(--foreground)]">
                Background and framing
              </th>
              <td className="px-4 py-3 text-[var(--muted-foreground)]">{exam.background}</td>
            </tr>
            <tr className="border-t border-[var(--border)]">
              <th scope="row" className="px-4 py-3 font-medium text-[var(--foreground)]">
                Name and date printed on the photo
              </th>
              <td className="px-4 py-3 text-[var(--muted-foreground)]">{exam.nameDateOnPhoto}</td>
            </tr>
            {exam.photoAge ? (
              <tr className="border-t border-[var(--border)]">
                <th scope="row" className="px-4 py-3 font-medium text-[var(--foreground)]">
                  How recent the photograph must be
                </th>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">{exam.photoAge}</td>
              </tr>
            ) : null}
            {exam.photoNote ? (
              <tr className="border-t border-[var(--border)]">
                <th scope="row" className="px-4 py-3 font-medium text-[var(--foreground)]">
                  How the photograph is taken
                </th>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">{exam.photoNote}</td>
              </tr>
            ) : null}
            {exam.aadhaarNote ? (
              <tr className="border-t border-[var(--border)]">
                <th scope="row" className="px-4 py-3 font-medium text-[var(--foreground)]">
                  If the photograph or signature does not meet the standard
                </th>
                <td className="px-4 py-3 text-[var(--muted-foreground)]">{exam.aadhaarNote}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {exam.assets.some((asset) => (asset.notes || []).length) ? (
        <div className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            What the notice adds, file by file
          </h3>
          <ul className="mt-2 space-y-2">
            {exam.assets.flatMap((asset) =>
              (asset.notes || []).map((note, index) => (
                <li key={`${asset.id}-${index}`} className="text-sm text-[var(--muted-foreground)]">
                  <span className="font-medium text-[var(--foreground)]">{asset.label}:</span> {note}
                </li>
              )),
            )}
          </ul>
        </div>
      ) : null}

      {exam.extras.length ? (
        <div className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Also in this notice</h3>
          <ul className="mt-2 space-y-2">
            {exam.extras.map((extra) => (
              <li key={extra} className="text-sm text-[var(--muted-foreground)]">
                {extra}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <EmbedResizerBlock exam={exam} />
    </section>
  );
}

/**
 * "Embed this resizer" — the copy-paste iframe for coaching sites and exam
 * notification blogs, which is where this page's audience already is.
 *
 * The widget carries a followable credit link back to this page; that link is
 * the entire consideration for the widget, so the copy states it plainly.
 * Nothing here claims an install count or a number of embeds.
 */
function EmbedResizerBlock({ exam }) {
  const widgetId = `exam-photo/${exam.slug}`;
  if (!isEmbeddable(widgetId)) return null;

  return (
    <div className="mt-4 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Embed this resizer</h3>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        Put the live {exam.name} resizer on your own page with one snippet — free, responsive, light
        and dark. It resizes in the reader&rsquo;s browser, so no file is uploaded to you or to us.
        Keep the &ldquo;Widget by AltFTool&rdquo; credit link visible.
      </p>
      <div className="mt-3">
        <EmbedCodeCopy snippet={buildEmbedSnippet(widgetId)} />
      </div>
      <p className="mt-3 text-sm text-[var(--muted-foreground)]">
        <Link
          href="/embed"
          className="font-medium text-[var(--foreground)] underline decoration-[var(--border)] underline-offset-2 hover:decoration-[var(--primary)]"
        >
          Browse every embeddable AltFTool widget
        </Link>
      </p>
    </div>
  );
}
