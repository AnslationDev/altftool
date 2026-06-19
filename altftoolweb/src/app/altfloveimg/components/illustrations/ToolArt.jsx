"use client";

import { UploadArt } from "./Spots";

let k = 0;

/* ---------- shared building blocks ---------- */
function Defs({ id, accent = "#2563eb" }) {
  return (
    <defs>
      <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#cfe9ff" /><stop offset="1" stopColor="#eaf4ff" />
      </linearGradient>
      <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#fde68a" /><stop offset="1" stopColor="#fb923c" />
      </linearGradient>
      <linearGradient id={`${id}-ac`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor={accent} /><stop offset="1" stopColor="#7c3aed" />
      </linearGradient>
    </defs>
  );
}

/* a small framed photo (the "subject") */
function Photo({ id, x, y, w, h, r = 10 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill="#fff" />
      <clipPath id={`${id}-clip`}><rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} rx={r - 4} /></clipPath>
      <g clipPath={`url(#${id}-clip)`}>
        <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} fill={`url(#${id}-sky)`} />
        <circle cx={x + w - 22} cy={y + 22} r="9" fill={`url(#${id}-sun)`} />
        <path d={`M${x + 4} ${y + h - 4} L${x + w * 0.32} ${y + h * 0.5} L${x + w * 0.52} ${y + h * 0.72} L${x + w * 0.66} ${y + h * 0.58} L${x + w - 4} ${y + h - 4} Z`} fill="#60a5fa" />
        <path d={`M${x + w * 0.28} ${y + h - 4} L${x + w * 0.55} ${y + h * 0.56} L${x + w * 0.82} ${y + h - 4} Z`} fill="#6366f1" />
      </g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill="none" stroke="#dbe3f1" strokeWidth="1.5" />
    </g>
  );
}

function Wrap({ children, size }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 240 168" fill="none" aria-hidden="true" className="ali-float">
      {children}
    </svg>
  );
}

/* ---------- per-tool scenes ---------- */

function CompressArt({ size, accent }) {
  const id = `c${++k}`;
  return (
    <Wrap size={size}>
      <Defs id={id} accent={accent} />
      <Photo id={id} x={70} y={40} w={100} h={88} />
      {/* squeeze arrows */}
      {[[40, "→"], [200, "←"]].map(([x], i) => (
        <g key={i} transform={`translate(${x},84)`}>
          <rect x={i ? 0 : -16} y={-13} width="16" height="26" rx="5" fill={`url(#${id}-ac)`} />
          <path d={i ? "M-2 0 l-12 -7 v14 z" : "M2 0 l12 -7 v14 z"} fill={`url(#${id}-ac)`} />
        </g>
      ))}
      {/* size tag */}
      <g transform="translate(120,134)">
        <rect x="-34" y="-12" width="68" height="24" rx="12" fill="#dcfce7" />
        <text x="0" y="5" textAnchor="middle" fontFamily="Geist, sans-serif" fontSize="13" fontWeight="700" fill="#16a34a">−82% KB</text>
      </g>
    </Wrap>
  );
}

function ResizeArt({ size, accent }) {
  const id = `r${++k}`;
  return (
    <Wrap size={size}>
      <Defs id={id} accent={accent} />
      <Photo id={id} x={56} y={36} w={96} h={84} />
      {/* enlarged dashed frame */}
      <rect x={56} y={36} width="128" height="108" rx="12" fill="none" stroke={accent} strokeWidth="2" strokeDasharray="6 6" />
      {/* corner handles */}
      {[[56, 36], [184, 36], [56, 144], [184, 144]].map(([x, y], i) => (
        <rect key={i} x={x - 5} y={y - 5} width="10" height="10" rx="2" fill="#fff" stroke={accent} strokeWidth="2" />
      ))}
      {/* dimension arrows */}
      <g stroke={accent} strokeWidth="1.6">
        <line x1="56" y1="156" x2="184" y2="156" />
        <line x1="200" y1="36" x2="200" y2="144" />
      </g>
      <text x="120" y="166" textAnchor="middle" fontFamily="Geist" fontSize="11" fontWeight="600" fill={accent}>W</text>
      <text x="210" y="94" fontFamily="Geist" fontSize="11" fontWeight="600" fill={accent}>H</text>
    </Wrap>
  );
}

function CropArt({ size, accent }) {
  const id = `cr${++k}`;
  return (
    <Wrap size={size}>
      <Defs id={id} accent={accent} />
      <g opacity="0.45"><Photo id={id} x={40} y={30} w={160} h={108} /></g>
      {/* crop window */}
      <rect x={78} y={50} width="96" height="74" fill="none" stroke="#fff" strokeWidth="3" />
      <rect x={78} y={50} width="96" height="74" fill="none" stroke={accent} strokeWidth="1.5" />
      {/* thirds */}
      <g stroke="#fff" strokeOpacity="0.8" strokeWidth="1">
        <line x1="110" y1="50" x2="110" y2="124" /><line x1="142" y1="50" x2="142" y2="124" />
        <line x1="78" y1="74" x2="174" y2="74" /><line x1="78" y1="100" x2="174" y2="100" />
      </g>
      {/* corner ticks */}
      {[[78, 50, 1, 1], [174, 50, -1, 1], [78, 124, 1, -1], [174, 124, -1, -1]].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x} ${y + 14 * sy} V${y} H${x + 14 * sx}`} stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" />
      ))}
    </Wrap>
  );
}

function RotateArt({ size, accent }) {
  const id = `ro${++k}`;
  return (
    <Wrap size={size}>
      <Defs id={id} accent={accent} />
      <g transform="rotate(-13 120 84)"><Photo id={id} x={72} y={44} w={96} h={80} /></g>
      {/* rotation arc */}
      <path d="M58 84 A62 62 0 0 1 182 84" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" strokeDasharray="4 7" />
      <path d="M182 84 l-8 -8 m8 8 l-10 4" stroke={accent} strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="58" cy="84" r="4" fill={accent} />
    </Wrap>
  );
}

function WatermarkArt({ size, accent }) {
  const id = `wm${++k}`;
  return (
    <Wrap size={size}>
      <Defs id={id} accent={accent} />
      <Photo id={id} x={56} y={34} w={128} h={100} />
      {/* tiled watermark text */}
      <g opacity="0.5" fill="#fff" fontFamily="Geist" fontWeight="800" fontSize="13">
        {[0, 1, 2].map((row) => [0, 1].map((col) => (
          <text key={`${row}-${col}`} x={70 + col * 60} y={58 + row * 30} transform={`rotate(-22 ${70 + col * 60} ${58 + row * 30})`}>ALTF</text>
        )))}
      </g>
      <g transform="translate(160,116)">
        <circle r="14" fill={`url(#${id}-ac)`} /><text y="5" textAnchor="middle" fontFamily="Geist" fontSize="15" fontWeight="800" fill="#fff">©</text>
      </g>
    </Wrap>
  );
}

function EditorArt({ size, accent }) {
  const id = `ed${++k}`;
  return (
    <Wrap size={size}>
      <Defs id={id} accent={accent} />
      <Photo id={id} x={36} y={36} w={104} h={96} />
      {/* adjustment panel */}
      <rect x={152} y={36} width="56" height="96" rx="10" fill="#fff" stroke="#dbe3f1" />
      {[50, 72, 94, 116].map((y, i) => (
        <g key={y}>
          <line x1="162" y1={y} x2="198" y2={y} stroke="#e6eaf2" strokeWidth="4" strokeLinecap="round" />
          <line x1="162" y1={y} x2={170 + i * 7} y2={y} stroke={`url(#${id}-ac)`} strokeWidth="4" strokeLinecap="round" />
          <circle cx={170 + i * 7} cy={y} r="4.5" fill="#fff" stroke={accent} strokeWidth="2" />
        </g>
      ))}
    </Wrap>
  );
}

function MemeArt({ size, accent }) {
  const id = `me${++k}`;
  return (
    <Wrap size={size}>
      <Defs id={id} accent={accent} />
      <Photo id={id} x={68} y={28} w={104} h={112} />
      <g fill="#fff" stroke="#000" strokeWidth="3" paintOrder="stroke" fontFamily="Impact, Geist" fontWeight="800" textAnchor="middle">
        <text x="120" y="50" fontSize="16">TOP TEXT</text>
        <text x="120" y="130" fontSize="16">BOTTOM</text>
      </g>
    </Wrap>
  );
}

function BgRemoverArt({ size }) {
  const id = `bg${++k}`;
  return (
    <Wrap size={size}>
      <Defs id={id} />
      {/* checker transparency */}
      <g>
        <rect x={56} y={30} width="128" height="108" rx="12" fill="#eef2f8" />
        {Array.from({ length: 9 }).map((_, r) => Array.from({ length: 11 }).map((__, c) => (
          ((r + c) % 2 === 0) ? <rect key={`${r}-${c}`} x={56 + c * 11.6} y={30 + r * 12} width="11.6" height="12" fill="#d6deea" /> : null
        )))}
        <rect x={56} y={30} width="128" height="108" rx="12" fill="none" stroke="#dbe3f1" strokeWidth="1.5" />
      </g>
      {/* subject bust */}
      <g>
        <circle cx="120" cy="74" r="18" fill={`url(#${id}-ac)`} />
        <path d="M90 134 a30 26 0 0 1 60 0 z" fill={`url(#${id}-ac)`} />
        {/* dashed cut outline */}
        <path d="M90 134 a30 26 0 0 1 60 0 M138 74 a18 18 0 1 0 -36 0 a18 18 0 0 0 36 0" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4 4" />
      </g>
      {/* scissors */}
      <g transform="translate(176,40)" stroke="#0f1729" strokeWidth="2" fill="none">
        <circle cx="-4" cy="6" r="3.2" /><circle cx="4" cy="6" r="3.2" />
        <path d="M-4 3 L8 -8 M4 3 L-8 -8" strokeLinecap="round" />
      </g>
    </Wrap>
  );
}

function UpscaleArt({ size, accent }) {
  const id = `up${++k}`;
  return (
    <Wrap size={size}>
      <Defs id={id} accent={accent} />
      {/* small pixelated */}
      <g>
        <rect x={34} y={62} width="44" height="44" rx="6" fill="#fff" stroke="#dbe3f1" />
        {[0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => (
          <rect key={`${r}-${c}`} x={38 + c * 9} y={66 + r * 9} width="9" height="9" fill={(r + c) % 2 ? "#bcd3f5" : "#7aa7ee"} />
        )))}
      </g>
      {/* arrow */}
      <g transform="translate(96,84)" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round">
        <line x1="0" y1="0" x2="22" y2="0" /><path d="M16 -6 L24 0 L16 6" />
      </g>
      {/* large crisp */}
      <Photo id={id} x={130} y={40} w={86} h={86} r={10} />
      {/* sparkle */}
      <path d="M150 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill={`url(#${id}-ac)`} />
      <text x="173" y="140" textAnchor="middle" fontFamily="Geist" fontSize="12" fontWeight="700" fill={accent}>4×</text>
    </Wrap>
  );
}

const FORMAT_COLORS = { JPG: "#f59e0b", PNG: "#2563eb", WEBP: "#10b981" };
function FileBadge({ x, label }) {
  const c = FORMAT_COLORS[label] || "#2563eb";
  return (
    <g transform={`translate(${x},44)`}>
      <path d="M0 0 h40 l16 16 v60 a6 6 0 0 1 -6 6 h-50 a6 6 0 0 1 -6 -6 v-70 a6 6 0 0 1 6 -6 z" fill="#fff" stroke="#dbe3f1" strokeWidth="1.5" />
      <path d="M40 0 l16 16 h-16 z" fill="#eef2f8" />
      <rect x="0" y="48" width="56" height="22" rx="6" fill={c} />
      <text x="28" y="63" textAnchor="middle" fontFamily="Geist" fontSize="12" fontWeight="800" fill="#fff">{label}</text>
    </g>
  );
}

function ConvertArt({ size, accent, from = "JPG", to = "PNG" }) {
  const id = `cv${++k}`;
  return (
    <Wrap size={size}>
      <Defs id={id} accent={accent} />
      <FileBadge x={44} label={from} />
      <FileBadge x={140} label={to} />
      {/* arrow with circular swap */}
      <g transform="translate(120,84)">
        <circle r="20" fill={`url(#${id}-ac)`} />
        <path d="M-7 -3 a7 7 0 0 1 14 0 M7 3 a7 7 0 0 1 -14 0" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M7 -3 l3 -1 -1 4 z M-7 3 l-3 1 1 -4 z" fill="#fff" />
      </g>
    </Wrap>
  );
}

const CONVERT_MAP = {
  "jpg-to-png": ["JPG", "PNG"],
  "png-to-jpg": ["PNG", "JPG"],
  "webp-to-jpg": ["WEBP", "JPG"],
  "jpg-to-webp": ["JPG", "WEBP"],
};

/* ---------- dispatcher ---------- */
export default function ToolArt({ slug, size = 220, accent = "#2563eb" }) {
  if (CONVERT_MAP[slug]) {
    const [from, to] = CONVERT_MAP[slug];
    return <ConvertArt size={size} accent={accent} from={from} to={to} />;
  }
  switch (slug) {
    case "compress": return <CompressArt size={size} accent={accent} />;
    case "resize": return <ResizeArt size={size} accent={accent} />;
    case "crop": return <CropArt size={size} accent={accent} />;
    case "rotate": return <RotateArt size={size} accent={accent} />;
    case "watermark": return <WatermarkArt size={size} accent={accent} />;
    case "editor": return <EditorArt size={size} accent={accent} />;
    case "meme": return <MemeArt size={size} accent={accent} />;
    case "background-remover": return <BgRemoverArt size={size} />;
    case "upscaler": return <UpscaleArt size={size} accent={accent} />;
    default: return <UploadArt size={size * 0.6} />;
  }
}
