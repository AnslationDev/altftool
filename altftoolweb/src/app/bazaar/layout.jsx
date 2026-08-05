import { AlertTriangle } from "lucide-react";
import { notFound } from "next/navigation";

// Bazaar is a UI-only preview backed by deterministic sample data. It must
// stay unavailable unless a deploy explicitly opts in.
const isBazaarEnabled = () => process.env.ALTFT_BAZAAR_ENABLED === "true";

// Evaluate the server-only flag per request so a disabled deploy returns a
// genuine 404 instead of publishing a prerendered prototype route.
export const dynamic = "force-dynamic";

// Keep the preview out of search results even on an explicitly enabled deploy.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function BazaarLayout({ children }) {
  if (!isBazaarEnabled()) {
    notFound();
  }

  return (
    <>
      <aside
        aria-label="Bazaar preview notice"
        className="border-b border-warning bg-warning-soft px-4 py-3 text-foreground"
        role="note"
      >
        <div className="mx-auto flex max-w-7xl items-start gap-3">
          <AlertTriangle
            aria-hidden="true"
            className="mt-1 h-5 w-5 shrink-0 text-warning"
          />
          <p className="text-sm leading-6">
            <strong className="font-semibold">Private preview:</strong>{" "}
            every listing, price, seller profile, rating, verification badge,
            chat, offer, and activity count is fictional sample data. No ad is
            live, and no marketplace action is sent to a backend.
          </p>
        </div>
      </aside>
      {children}
    </>
  );
}
