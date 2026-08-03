import { notFound } from "next/navigation";

export const metadata = {
  robots: { index: false, follow: false },
};

// A statically prerendered notFound() can be emitted as a soft 404 by Next.js.
// Keep this quarantine request-time so the HTTP response is a real 404.
export const dynamic = "force-dynamic";

/**
 * Top11 remains unavailable until every ranking and recommendation has a
 * named source, checked date, working destination, and editorial owner.
 */
export default function Top11Layout() {
  notFound();
}
