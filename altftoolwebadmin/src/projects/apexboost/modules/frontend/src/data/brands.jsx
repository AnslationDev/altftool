/**
 * Real brand logos rendered as inline SVG so they stay crisp,
 * load instantly and work inside the single-file build.
 * Each entry returns a self-contained colored SVG mark + wordmark.
 */

const Google = () => (
  <svg viewBox="0 0 272 92" className="h-11 w-auto" aria-label="Google">
    <path fill="#EA4335" d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" />
    <path fill="#FBBC05" d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" />
    <path fill="#4285F4" d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" />
    <path fill="#34A853" d="M225 3v65h-9.5V3h9.5z" />
    <path fill="#EA4335" d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.05zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" />
    <path fill="#4285F4" d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z" />
  </svg>
);

const Microsoft = () => (
  <svg viewBox="0 0 130 28" className="h-9 w-auto" aria-label="Microsoft">
    <rect width="12" height="12" x="1" y="1" fill="#F25022" />
    <rect width="12" height="12" x="15" y="1" fill="#7FBA00" />
    <rect width="12" height="12" x="1" y="15" fill="#00A4EF" />
    <rect width="12" height="12" x="15" y="15" fill="#FFB900" />
    <text x="34" y="20" fontFamily="Segoe UI, Arial, sans-serif" fontSize="17" fontWeight="600" fill="#737373">Microsoft</text>
  </svg>
);

const Amazon = () => (
  <svg viewBox="0 0 100 40" className="h-10 w-auto" aria-label="Amazon">
    <text x="2" y="26" fontFamily="Arial, sans-serif" fontSize="26" fontWeight="700" fill="#221F1F" letterSpacing="-1">amazon</text>
    <path d="M20 31c14 8 40 8 56 0" stroke="#FF9900" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    <path d="M74 28l4 4-6 1z" fill="#FF9900" />
  </svg>
);

const Nike = () => (
  <svg viewBox="0 0 120 44" className="h-10 w-auto" aria-label="Nike">
    <path d="M8 30C20 18 32 8 44 6c-6 8-12 14-20 20 12-4 30-14 48-22-8 12-24 22-46 26-14 3-24 1-26-6 0 2 4 5 12 4z" fill="#111" />
    <text x="62" y="30" fontFamily="Arial Black, Arial, sans-serif" fontSize="22" fontStyle="italic" fontWeight="900" fill="#111">NIKE</text>
  </svg>
);

const Spotify = () => (
  <svg viewBox="0 0 120 40" className="h-9 w-auto" aria-label="Spotify">
    <circle cx="20" cy="20" r="18" fill="#1DB954" />
    <path d="M11 15c8-2 16-1 22 2M12 21c6-1.5 13-1 18 1.5M13 26c5-1 10-.5 14 1" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    <text x="44" y="27" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="700" fill="#191414">Spotify</text>
  </svg>
);

const Netflix = () => (
  <svg viewBox="0 0 120 40" className="h-9 w-auto" aria-label="Netflix">
    <text x="2" y="30" fontFamily="Arial Black, Arial, sans-serif" fontSize="24" fontWeight="900" fill="#E50914" letterSpacing="-1">NETFLIX</text>
  </svg>
);

const Meta = () => (
  <svg viewBox="0 0 130 40" className="h-9 w-auto" aria-label="Meta">
    <path d="M8 28c0-8 4-14 9-14 4 0 6 3 9 8 3-5 5-8 9-8 5 0 9 6 9 14 0 3-1 5-4 5-2 0-3-2-5-6-2-4-3-6-5-6s-3 2-5 6l-3 5-3-5c-2-4-3-6-5-6s-4 3-4 8c0 2-1 4-3 4s-3-2-3-9z" fill="#0081FB" />
    <text x="52" y="29" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="700" fill="#0081FB">Meta</text>
  </svg>
);

const Adobe = () => (
  <svg viewBox="0 0 120 40" className="h-9 w-auto" aria-label="Adobe">
    <path d="M2 34L14 4h8l12 30h-9l-2.5-7h-9l3-7h3.5L18 12 8 34z" fill="#FA0F00" />
    <text x="40" y="28" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="700" fill="#333">Adobe</text>
  </svg>
);

// Order matches a natural, recognizable marquee
export const brands = [
  { name: "Google", Logo: Google },
  { name: "Microsoft", Logo: Microsoft },
  { name: "Amazon", Logo: Amazon },
  { name: "Nike", Logo: Nike },
  { name: "Meta", Logo: Meta },
  { name: "Netflix", Logo: Netflix },
  { name: "Spotify", Logo: Spotify },
  { name: "Adobe", Logo: Adobe },
];
