const APP_STYLES = {
  "speed-test": {
    bg: "#050818",
    accent: "#38BDF8",
    accent2: "#0D9488",
    label: "Speed",
  },
  "storage-cleanup": {
    bg: "#059669",
    accent: "#34d399",
    accent2: "#047857",
    label: "Clean",
  },
  grammerly: {
    bg: "#16a34a",
    accent: "#86efac",
    accent2: "#15803d",
    label: "G",
  },
  "pdf-ocr-scanner": {
    bg: "#dc2626",
    accent: "#fca5a5",
    accent2: "#991b1b",
    label: "PDF",
  },
  anternet: {
    bg: "#0f3f2e",
    accent: "#14B8A6",
    accent2: "#143f2c",
    label: "Net",
  },
  syncplay: {
    bg: "#0f172a",
    accent: "#38BDF8",
    accent2: "#0D9488",
    label: "Sync",
  },
  "app-builder": {
    bg: "#92400e",
    accent: "#fbbf24",
    accent2: "#451a03",
    label: "Build",
  },
};

const SCREEN_TITLES = {
  "speed-test": ["Detailed Results", "Speed Meter", "History"],
  "storage-cleanup": ["Storage Scan", "Cleanup Results", "File Categories"],
  grammerly: ["Writing Editor", "Grammar Suggestions", "Corrected Text"],
  "pdf-ocr-scanner": ["Document Scanner", "OCR Text", "PDF Export"],
  anternet: ["Internet Tools", "Quick Access", "Network Status"],
  syncplay: ["Sync Room", "Playback Control", "Session History"],
  "app-builder": ["Project Builder", "Screen Planner", "App Notes"],
};

function styleFor(slug) {
  return APP_STYLES[slug] || APP_STYLES["speed-test"];
}

export function AppIconSvg({ app, className = "" }) {
  const style = styleFor(app.slug);

  return (
    <svg viewBox="0 0 96 96" role="img" aria-label={`${app.name} icon`} className={className}>
      <defs>
        <linearGradient id={`${app.slug}-icon-bg`} x1="14" y1="8" x2="82" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor={style.accent} />
          <stop offset="0.55" stopColor={style.bg} />
          <stop offset="1" stopColor={style.accent2} />
        </linearGradient>
      </defs>
      <rect width="96" height="96" rx="24" fill={`url(#${app.slug}-icon-bg)`} />
      {app.slug === "speed-test" ? (
        <>
          <path d="M23 61a25 25 0 1 1 50 0" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
          <path d="M49 53 65 36" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
          <circle cx="48" cy="56" r="5" fill="#fff" />
        </>
      ) : null}
      {app.slug === "storage-cleanup" ? (
        <>
          <path d="M32 65h29l7-27H25l7 27Z" fill="#fff" opacity=".95" />
          <path d="M37 31h22l4 8H33l4-8Z" fill="#fff" opacity=".78" />
          <path d="M38 48h18M38 57h13" stroke={style.bg} strokeWidth="5" strokeLinecap="round" />
        </>
      ) : null}
      {app.slug === "grammerly" ? (
        <>
          <circle cx="48" cy="48" r="29" fill="#fff" opacity=".95" />
          <path d="M59 39c-3-5-8-7-14-6-9 2-15 10-13 19 2 10 12 16 22 12 5-2 9-6 11-12H49" fill="none" stroke={style.bg} strokeWidth="8" strokeLinecap="round" />
        </>
      ) : null}
      {app.slug === "pdf-ocr-scanner" ? (
        <>
          <rect x="24" y="24" width="48" height="48" rx="8" fill="#fff" />
          <text x="48" y="56" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="18" fontWeight="900" fill={style.bg}>
            PDF
          </text>
        </>
      ) : null}
      {app.slug === "anternet" ? (
        <>
          <circle cx="48" cy="48" r="28" fill="#fff" opacity=".95" />
          <path d="M21 48h54M48 21c8 8 12 17 12 27S56 67 48 75M48 21C40 29 36 38 36 48s4 19 12 27" fill="none" stroke={style.bg} strokeWidth="5.8" strokeLinecap="round" />
          <path d="M26 35h44M26 61h44" fill="none" stroke={style.accent} strokeWidth="5" strokeLinecap="round" />
        </>
      ) : null}
      {app.slug === "syncplay" ? (
        <>
          <circle cx="48" cy="48" r="30" fill="#fff" opacity=".95" />
          <path d="M39 32v32l27-16-27-16Z" fill={style.bg} />
          <path d="M25 37a27 27 0 0 1 34-13M71 59a27 27 0 0 1-34 13" fill="none" stroke={style.accent} strokeWidth="6" strokeLinecap="round" />
        </>
      ) : null}
      {app.slug === "app-builder" ? (
        <>
          <rect x="22" y="23" width="52" height="50" rx="11" fill="#fff" opacity=".95" />
          <path d="M34 38h28M34 49h18M34 60h24" stroke={style.bg} strokeWidth="6" strokeLinecap="round" />
          <path d="M64 26v16h16" fill="none" stroke={style.accent} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        </>
      ) : null}
      <rect x="1" y="1" width="94" height="94" rx="23" fill="none" stroke="#fff" strokeOpacity=".16" />
    </svg>
  );
}

export function AppScreenSvg({ app, index = 0, className = "" }) {
  const style = styleFor(app.slug);
  const title = SCREEN_TITLES[app.slug]?.[index] || "Dashboard";

  return (
    <svg viewBox="0 0 390 760" role="img" aria-label={`${app.name} ${title} screen`} className={className}>
      <defs>
        <linearGradient id={`${app.slug}-${index}-screen`} x1="0" y1="0" x2="390" y2="760" gradientUnits="userSpaceOnUse">
          <stop stopColor="#07101f" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
      </defs>
      <rect width="390" height="760" rx="46" fill="#050816" />
      <rect x="16" y="16" width="358" height="728" rx="36" fill={`url(#${app.slug}-${index}-screen)`} />
      <text x="48" y="58" fontFamily="Inter, Arial, sans-serif" fontSize="15" fontWeight="900" fill="#fff">9:41</text>
      <text x="342" y="58" textAnchor="end" fontFamily="Inter, Arial, sans-serif" fontSize="15" fontWeight="900" fill="#fff">•••</text>
      <text x="195" y="126" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="17" fontWeight="900" fill="#94a3b8">{app.name}</text>
      <text x="195" y="178" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="34" fontWeight="900" fill="#fff">{title}</text>
      {app.slug === "speed-test" ? (
        <>
          <circle cx="195" cy="330" r="104" fill="none" stroke="#172554" strokeWidth="22" />
          <path d="M91 330a104 104 0 0 1 208-1" fill="none" stroke={style.accent} strokeWidth="22" strokeLinecap="round" />
          <text x="195" y="326" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="44" fontWeight="900" fill="#fff">94.75</text>
          <text x="195" y="356" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="15" fontWeight="800" fill="#94a3b8">Mbps</text>
          <rect x="56" y="486" width="126" height="76" rx="20" fill="#ffffff14" />
          <rect x="208" y="486" width="126" height="76" rx="20" fill="#ffffff14" />
          <text x="80" y="522" fontFamily="Inter, Arial, sans-serif" fontSize="14" fontWeight="800" fill="#94a3b8">Download</text>
          <text x="80" y="548" fontFamily="Inter, Arial, sans-serif" fontSize="24" fontWeight="900" fill="#fff">94.75</text>
          <text x="232" y="522" fontFamily="Inter, Arial, sans-serif" fontSize="14" fontWeight="800" fill="#94a3b8">Upload</text>
          <text x="232" y="548" fontFamily="Inter, Arial, sans-serif" fontSize="24" fontWeight="900" fill="#fff">32.16</text>
        </>
      ) : (
        app.features.slice(0, 4).map((feature, itemIndex) => (
          <g key={feature}>
            <rect x="52" y={250 + itemIndex * 92} width="286" height="70" rx="20" fill="#ffffff14" />
            <text x="78" y={286 + itemIndex * 92} fontFamily="Inter, Arial, sans-serif" fontSize="16" fontWeight="900" fill="#fff">
              {feature}
            </text>
            <rect x="78" y={300 + itemIndex * 92} width="210" height="8" rx="4" fill="#ffffff1f" />
            <rect x="78" y={300 + itemIndex * 92} width={170 - itemIndex * 22} height="8" rx="4" fill={style.accent} />
          </g>
        ))
      )}
      <rect x="52" y="660" width="286" height="48" rx="18" fill={style.accent} />
      <text x="195" y="691" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="16" fontWeight="900" fill="#fff">
        {index === 2 ? "View History" : "Continue"}
      </text>
    </svg>
  );
}
