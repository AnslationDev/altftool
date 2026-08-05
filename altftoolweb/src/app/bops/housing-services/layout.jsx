/**
 * Housing-service routes are design previews, not operating providers.
 * Keep that distinction visible on every nested landing page so illustrative
 * names and figures cannot be mistaken for measured business claims.
 */
export default function HousingServicesLayout({ children }) {
  return (
    <>
      <aside
        className="border-y border-warning/40 bg-warning-soft px-4 py-3 text-sm text-warning-text"
        role="note"
        aria-label="Preview content notice"
      >
        <p className="mx-auto max-w-7xl">
          Design preview: provider names, ratings, customer counts, response
          times, prices, and savings shown on these sample pages are
          illustrative—not verified offers or measurements of a real business.
        </p>
      </aside>
      {children}
    </>
  );
}
