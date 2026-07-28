// Detail-page comparison: our free tool against the paid products that do the
// same job. Deliberately shaped like /alternatives ComparisonTable — same
// <caption> + scope="col"/scope="row" structure, same token vocabulary, same
// contained horizontal overflow — so the two families read as one product
// rather than two visual languages.
//
// The AltFTool column states "Free" and nothing more. No savings figure is
// computed from these prices: subtracting a subscription you were never going
// to buy from zero is not a saving, and the number would be ours rather than
// the vendor's.
//
// Server component.

import { ExternalLink } from "lucide-react";

import PriceCell from "./PriceCell";

const cellClass = "border-t border-(--border) px-4 py-3 align-top text-sm leading-6";

const OUR_COLUMN = {
  cost: "Free",
  billing: "No plan and no billing — there is no paid tier",
  freeTier: "The whole tool. Nothing is held back behind an upgrade.",
  annual: "—",
};

export default function PriceComparisonTable({ toolName, products = [], caption }) {
  if (!products.length) return null;

  const showAnnual = products.some((product) => product.price?.annual);

  const rows = [
    {
      key: "cost",
      label: "Cost to start",
      ours: <span className="font-semibold text-(--foreground)">{OUR_COLUMN.cost}</span>,
      render: (product) => <PriceCell product={product} showDetail={false} />,
    },
    {
      key: "billing",
      label: "Billing",
      ours: OUR_COLUMN.billing,
      render: (product) => product.price?.detail || "—",
    },
    showAnnual
      ? {
          key: "annual",
          label: "Annual figure",
          ours: OUR_COLUMN.annual,
          // An em dash, never "the vendor publishes no annual price". Some of
          // these records simply carry the annual figure in `headline` instead
          // (Camtasia is priced per year), so asserting an absence here would
          // be a claim the data does not support.
          render: (product) => product.price?.annual || "—",
        }
      : null,
    {
      key: "freeTier",
      label: "Their free tier",
      ours: OUR_COLUMN.freeTier,
      render: (product) => product.freeTierShort || "—",
    },
    {
      key: "checked",
      label: "Price checked",
      ours: "—",
      render: (product) =>
        product.checkedOn ? <time dateTime={product.checkedOn}>{product.checkedOn}</time> : "—",
    },
  ].filter(Boolean);

  const columnWidth = `${Math.floor(76 / (products.length + 1))}%`;

  return (
    <div className="overflow-x-auto rounded-[12px] border border-(--border) bg-(--surface)">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <caption className="px-4 pt-4 pb-1 text-left text-sm leading-6 text-(--muted-foreground)">
          {caption}
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="w-[24%] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)"
            >
              <span className="sr-only">Comparison point</span>
              <span aria-hidden="true">What you are comparing</span>
            </th>
            <th
              scope="col"
              style={{ width: columnWidth }}
              className="px-4 py-3 text-sm font-semibold text-(--primary-text)"
            >
              {`AltFTool ${toolName}`}
            </th>
            {products.map((product) => (
              <th
                key={product.key}
                scope="col"
                style={{ width: columnWidth }}
                className="px-4 py-3 text-sm font-semibold text-(--foreground)"
              >
                <a
                  href={product.homepage}
                  rel="nofollow noopener"
                  target="_blank"
                  className="inline-flex items-start gap-1.5 underline underline-offset-2 hover:text-(--primary-text) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
                >
                  {product.name}
                  <ExternalLink className="mt-1 h-3 w-3 flex-none" aria-hidden="true" />
                </a>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <th
                scope="row"
                className={`${cellClass} bg-(--muted) text-sm font-semibold text-(--foreground)`}
              >
                {row.label}
              </th>
              <td className={`${cellClass} text-(--foreground)`}>{row.ours}</td>
              {products.map((product) => (
                <td key={product.key} className={`${cellClass} text-(--muted-foreground)`}>
                  {row.render(product)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
