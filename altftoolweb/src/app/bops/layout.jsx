import BopsDemoGuard from "./BopsDemoGuard";

export const metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function BopsLayout({ children }) {
  return (
    <BopsDemoGuard>
      <aside
        className="border-y border-warning/40 bg-warning-soft px-4 py-3 text-sm text-warning-text"
        role="note"
        aria-label="Design demonstration notice"
      >
        <p className="mx-auto max-w-7xl">
          <strong>Design demonstration only.</strong> These sample service pages
          show interface concepts, not operating providers or verified offers.
          AltFTool does not sell insurance, loans, or legal services here and
          does not collect or send quote requests. Placeholder call and quote
          actions are disabled.
        </p>
      </aside>
      {children}
    </BopsDemoGuard>
  );
}
