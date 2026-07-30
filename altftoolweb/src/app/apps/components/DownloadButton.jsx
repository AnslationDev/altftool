import { Download } from "lucide-react";

export default function DownloadButton({ href, label = "Download APK", className = "", comingSoon = false }) {
  if (comingSoon) {
    return (
      <button
        type="button"
        disabled
        title="Coming soon"
        className={`inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-md bg-[var(--muted)] px-6 py-3 text-sm font-semibold text-[var(--muted-foreground)] opacity-60 ${className}`}
      >
        <Download size={18} aria-hidden="true" />
        Coming Soon
      </button>
    );
  }

  return (
    <a
      href={href}
      download
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[image:var(--anslation-ds-cta-gradient)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-md transition duration-150 hover:-translate-y-0.5 hover:bg-[image:var(--anslation-ds-cta-gradient-hover)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] motion-reduce:transform-none motion-reduce:transition-none ${className}`}
    >
      <Download size={18} aria-hidden="true" />
      {label}
    </a>
  );
}
