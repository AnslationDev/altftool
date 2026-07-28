// The /deals hub table — the page other sites are meant to cite.
//
// A real <table> with a real <caption> and scope="col"/scope="row", so a
// screen reader announces "Row header, Entry price, value" instead of a wall
// of unlabelled cells. Horizontal overflow is contained by the wrapper, so a
// 900px table never makes the page body scroll sideways on a phone.
//
// Tokens only (master.md): no hex, no hardcoded radius or shadow, and every
// colour resolves in both themes.
//
// Server component — no interactivity, nothing reaches the client bundle.

import Link from "next/link";
import { ExternalLink } from "lucide-react";

import PriceCell from "./PriceCell";

const cellClass = "border-t border-(--border) px-4 py-3 align-top text-sm leading-6";
const headClass = "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)";

export default function SavingsTable({ rows = [], caption }) {
  if (!rows.length) return null;

  return (
    <div className="overflow-x-auto rounded-[12px] border border-(--border) bg-(--surface)">
      <table className="w-full min-w-[900px] border-collapse text-left">
        <caption className="px-4 pt-4 pb-1 text-left text-sm leading-6 text-(--muted-foreground)">
          {caption}
        </caption>
        <thead>
          <tr>
            <th scope="col" className={`${headClass} w-[19%]`}>
              Paid product
            </th>
            <th scope="col" className={`${headClass} w-[24%]`}>
              What you pay it to do
            </th>
            <th scope="col" className={`${headClass} w-[19%]`}>
              Entry price
            </th>
            <th scope="col" className={`${headClass} w-[22%]`}>
              Their free tier
            </th>
            <th scope="col" className={`${headClass} w-[16%]`}>
              Free page here
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ product, deal }) => (
            <tr key={product.key}>
              <th scope="row" className={`${cellClass} bg-(--muted) font-semibold text-(--foreground)`}>
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
              <td className={`${cellClass} text-(--muted-foreground)`}>{product.capability}</td>
              <td className={cellClass}>
                <PriceCell product={product} />
              </td>
              <td className={`${cellClass} text-(--muted-foreground)`}>{product.freeTierShort}</td>
              <td className={cellClass}>
                <Link
                  href={`/deals/${deal.slug}`}
                  className="font-semibold text-(--primary-text) underline underline-offset-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
                >
                  {deal.name}
                </Link>
                <span className="mt-1 block text-xs leading-5 text-(--muted-foreground)">
                  {deal.job}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
