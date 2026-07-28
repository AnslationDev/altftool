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
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead className="bg-[var(--card)]">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">File</th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">Format</th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">Size</th>
              <th scope="col" className="px-4 py-3 font-semibold text-[var(--foreground)]">Dimensions</th>
            </tr>
          </thead>
          <tbody>
            {exam.photoMode === "live-capture" ? (
              <tr className="border-t border-[var(--border)]">
                <th scope="row" className="px-4 py-3 font-medium text-[var(--foreground)]">
                  Photograph
                </th>
                <td className="px-4 py-3 text-[var(--muted-foreground)]" colSpan={3}>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]">
          <dt className="text-sm text-[var(--muted-foreground)]">Background and framing</dt>
          <dd className="mt-1 text-sm text-[var(--foreground)]">{exam.background}</dd>
        </div>
        <div className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)]">
          <dt className="text-sm text-[var(--muted-foreground)]">
            Name and date printed on the photo
          </dt>
          <dd className="mt-1 text-sm text-[var(--foreground)]">{exam.nameDateOnPhoto}</dd>
        </div>
        {exam.photoNote ? (
          <div className="rounded-xl bg-[var(--card)] p-4 ring-1 ring-[var(--border)] sm:col-span-2">
            <dt className="text-sm text-[var(--muted-foreground)]">How the photograph is taken</dt>
            <dd className="mt-1 text-sm text-[var(--foreground)]">{exam.photoNote}</dd>
          </div>
        ) : null}
      </dl>

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
    </section>
  );
}
