import { Download } from "lucide-react";

export default function DownloadButton({ href, label = "Download APK", className = "" }) {
  return (
    <a
      href={href}
      download
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[#0f3f2e] px-6 py-3 text-sm font-black text-white shadow-[0_16px_32px_rgba(15,63,46,0.18)] transition hover:bg-[#174b37] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5F8F00]/30 ${className}`}
    >
      <Download size={18} aria-hidden="true" />
      {label}
    </a>
  );
}
