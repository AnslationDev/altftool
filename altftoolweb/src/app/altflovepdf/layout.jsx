import "./altflovepdf.css";
import AltfPdfFooter from "./components/AltfPdfFooter";

export const metadata = {
  title: {
    default: "Altf❤️PDF — 100% Private PDF & Image Tools",
    template: "%s | Altf❤️PDF",
  },
  description:
    "100% Private browser-based PDF and image tools. All processing happens locally on your device. No uploads, no servers, no tracking, completely secure.",
  icons: {
    icon: "/favicon1.png",
  },
};

export default function AltfPdfLayout({ children }) {
  return (
    <div className="altf-app">
      {/* SVG SYMBOLS */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ display: "none" }}>
        <symbol id="s-home" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </symbol>
        <symbol id="s-pdf" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </symbol>
        <symbol id="s-merge" viewBox="0 0 24 24">
          <path d="M8 17l4 4 4-4" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <path d="M4 3h5l3 4H4z" />
          <path d="M20 3h-5l-3 4h8z" />
        </symbol>
        <symbol id="s-cut" viewBox="0 0 24 24">
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </symbol>
        <symbol id="s-rot" viewBox="0 0 24 24">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </symbol>
        <symbol id="s-list" viewBox="0 0 24 24">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <circle cx="3" cy="6" r="1" />
          <circle cx="3" cy="12" r="1" />
          <circle cx="3" cy="18" r="1" />
        </symbol>
        <symbol id="s-crop" viewBox="0 0 24 24">
          <path d="M6.13 1L6 16a2 2 0 002 2h15" />
          <path d="M1 6.13L16 6a2 2 0 012 2v15" />
        </symbol>
        <symbol id="s-plus" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </symbol>
        <symbol id="s-img" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </symbol>
        <symbol id="s-cam" viewBox="0 0 24 24">
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
          <circle cx="12" cy="13" r="4" />
        </symbol>
        <symbol id="s-type" viewBox="0 0 24 24">
          <polyline points="4 7 4 4 20 4 20 7" />
          <line x1="9" y1="20" x2="15" y2="20" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </symbol>
        <symbol id="s-gray" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 010 20z" />
        </symbol>
        <symbol id="s-cmp" viewBox="0 0 24 24">
          <polyline points="4 14 10 14 10 20" />
          <polyline points="20 10 14 10 14 4" />
          <line x1="10" y1="14" x2="3" y2="21" />
          <line x1="21" y1="3" x2="14" y2="10" />
        </symbol>
        <symbol id="s-hash" viewBox="0 0 24 24">
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
          <line x1="10" y1="3" x2="8" y2="21" />
          <line x1="16" y1="3" x2="14" y2="21" />
        </symbol>
        <symbol id="s-wm" viewBox="0 0 24 24">
          <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
        </symbol>
        <symbol id="s-edit" viewBox="0 0 24 24">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" />
        </symbol>
        <symbol id="s-lock" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </symbol>
        <symbol id="s-unlk" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 019.9-1" />
        </symbol>
        <symbol id="s-flat" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </symbol>
        <symbol id="s-info" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </symbol>
        <symbol id="s-fld" viewBox="0 0 24 24">
          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
        </symbol>
        <symbol id="s-del" viewBox="0 0 24 24">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
        </symbol>
        <symbol id="s-dl" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </symbol>
        <symbol id="s-cp" viewBox="0 0 24 24">
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </symbol>
        <symbol id="s-sv" viewBox="0 0 24 24">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </symbol>
        <symbol id="s-extract" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
          <line x1="12" y1="15" x2="12" y2="21" />
          <polyline points="9 18 12 21 15 18" />
        </symbol>
        <symbol id="s-globe" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </symbol>
        <symbol id="s-redact" viewBox="0 0 24 24">
          <rect x="3" y="7" width="18" height="10" rx="1" />
          <line x1="8" y1="11" x2="16" y2="13" />
          <line x1="8" y1="13" x2="16" y2="11" />
        </symbol>
        <symbol id="s-hf" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="8" x2="21" y2="8" />
          <line x1="3" y1="16" x2="21" y2="16" />
          <line x1="7" y1="12" x2="17" y2="12" />
        </symbol>
        <symbol id="s-resize" viewBox="0 0 24 24">
          <polyline points="15 3 21 3 21 9" />
          <polyline points="9 21 3 21 3 15" />
          <line x1="21" y1="3" x2="14" y2="10" />
          <line x1="3" y1="21" x2="10" y2="14" />
        </symbol>
        <symbol id="s-imgcmp" viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
          <path d="M14 14l4-4" />
          <path d="M18 14l-4-4" />
        </symbol>
        <symbol id="s-eye" viewBox="0 0 24 24">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </symbol>
        <symbol id="s-html" viewBox="0 0 24 24">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="12" y1="2" x2="12" y2="22" />
        </symbol>
        <symbol id="s-pencil" viewBox="0 0 24 24">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
        </symbol>
        <symbol id="s-scissors" viewBox="0 0 24 24">
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
          <line x1="8.12" y1="8.12" x2="12" y2="12" />
        </symbol>
        <symbol id="s-convert" viewBox="0 0 24 24">
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 014-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 01-4 4H3" />
        </symbol>
        <symbol id="s-batch" viewBox="0 0 24 24">
          <rect x="2" y="3" width="20" height="4" rx="1" />
          <rect x="2" y="10" width="20" height="4" rx="1" />
          <rect x="2" y="17" width="20" height="4" rx="1" />
          <line x1="18" y1="5" x2="22" y2="5" />
          <line x1="18" y1="12" x2="22" y2="12" />
          <line x1="18" y1="19" x2="22" y2="19" />
        </symbol>
      </svg>

      {children}
      <AltfPdfFooter />
    </div>
  );
}
