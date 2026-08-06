import { notFound } from "next/navigation";

/**
 * The restored Top3 implementation contains illustrative ranking data. Keep
 * the source available for remediation, but never render it until every claim
 * is backed by a verifiable source. The request proxy also returns a hard 404;
 * this route-level guard is defense in depth for alternate runtimes.
 */
export default function Top3Page() {
  notFound();
}
