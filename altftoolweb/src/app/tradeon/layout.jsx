import { notFound } from "next/navigation";

export const metadata = {
  robots: { index: false, follow: false },
};

// A statically prerendered notFound() can be emitted as a soft 404 by Next.js.
// Keep this quarantine request-time so the HTTP response is a real 404.
export const dynamic = "force-dynamic";

/**
 * Tradeon is held from production while its illustrative market model is
 * replaced with sourced, dated financial data. Keeping the implementation in
 * Git makes the work recoverable without publishing synthetic fundamentals,
 * institutional holdings, or trade targets as facts.
 */
export default function TradeonLayout() {
  notFound();
}
