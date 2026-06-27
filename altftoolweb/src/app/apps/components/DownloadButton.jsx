import { Download } from "lucide-react";

export default function DownloadButton({ href, label = "Download APK", className = "" }) {
  return (
    <a
      href={href}
      download
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#0D9488,#0EA5E9)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_18px_34px_rgba(20,184,166,0.26)] transition hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#0D9488,#0EA5E9)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--primary)_25%,transparent)] ${className}`}
    >
      <Download size={18} aria-hidden="true" />
      {label}
    </a>
  );
}
