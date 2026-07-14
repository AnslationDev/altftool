// Pure, deterministic SVG avatar builder.
// Given a config object, returns React SVG elements. No state, no side effects,
// so the same config always renders identically (good for tests & export).

import {
  STYLES,
  FACE_SHAPES,
  EYES,
  EYEBROWS,
  MOUTHS,
  HAIR_STYLES,
  FACIAL_HAIR,
  ACCESSORIES,
  BACKGROUNDS,
  SKIN_TONES,
  HAIR_COLORS,
  ACCENT_COLORS,
  BG_COLORS,
  DEFAULT_CONFIG,
} from "./defaults";
import { createRng } from "./rng";

// ---- color helpers -------------------------------------------------------

function clamp(n) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

// Parse #rrggbb to [r,g,b]
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((v) => clamp(v).toString(16).padStart(2, "0"))
      .join("")
  );
}

// Shade a hex color by amount in [-1,1] (negative = darker).
export function shade(hex, amount) {
  const [r, g, b] = hexToRgb(hex);
  if (amount >= 0) {
    return rgbToHex(
      r + (255 - r) * amount,
      g + (255 - g) * amount,
      b + (255 - b) * amount
    );
  }
  const f = 1 + amount;
  return rgbToHex(r * f, g * f, b * f);
}

// ---- deterministic config generation -------------------------------------

// Build a fully random but valid config from any seed (string or number).
export function generateConfigFromSeed(seed) {
  const rng = createRng(seed);
  const pick = (arr) => arr[rng.int(0, arr.length - 1)];
  return {
    seed: String(seed),
    style: pick(STYLES).id,
    background: pick(BACKGROUNDS).id,
    colors: {
      skin: pick(SKIN_TONES),
      hair: pick(HAIR_COLORS),
      background: pick(BG_COLORS),
      accent: pick(ACCENT_COLORS),
    },
    features: {
      faceShape: pick(FACE_SHAPES),
      eyes: pick(EYES),
      eyebrows: pick(EYEBROWS),
      mouth: pick(MOUTHS),
      hair: pick(HAIR_STYLES),
      facialHair: pick(FACIAL_HAIR),
      accessory: pick(ACCESSORIES),
    },
  };
}

// "AI-style" generation: richer, pattern-driven seeds with curated harmony.
// No external API — we simulate a stylized generator with weighted choices.
export function generateAiConfig(seedBase) {
  const rng = createRng("ai::" + seedBase);
  const pick = (arr) => arr[rng.int(0, arr.length - 1)];
  // Curated palettes that tend to look good together.
  const palettes = [
    { skin: "#f1c27d", hair: "#3b2f2f", accent: "#14b8a6", bg: "#eef2ff" },
    { skin: "#8d5524", hair: "#1b1b1b", accent: "#f472b6", bg: "#fae8ff" },
    { skin: "#ffdbb4", hair: "#a55728", accent: "#22d3ee", bg: "#dcfce7" },
    { skin: "#e0ac69", hair: "#6b4423", accent: "#a78bfa", bg: "#e0f2fe" },
    { skin: "#c68642", hair: "#e8e8e8", accent: "#f59e0b", bg: "#fef3c7" },
  ];
  const p = pick(palettes);
  return {
    seed: "ai::" + String(seedBase),
    style: pick(STYLES).id,
    background: rng.chance(0.6) ? pick(BACKGROUNDS).id : "solid",
    colors: {
      skin: p.skin,
      hair: p.hair,
      background: p.bg,
      accent: p.accent,
    },
    features: {
      faceShape: pick(FACE_SHAPES),
      eyes: pick(EYES),
      eyebrows: pick(EYEBROWS),
      mouth: rng.chance(0.7) ? "smile" : pick(MOUTHS),
      hair: pick(HAIR_STYLES),
      facialHair: rng.chance(0.4) ? pick(FACIAL_HAIR) : "none",
      accessory: rng.chance(0.35) ? pick(ACCESSORIES) : "none",
    },
  };
}

// ---- background ----------------------------------------------------------

function Background({ config, uid }) {
  const { background, colors } = config;
  const gradients = {
    "gradient-sunset": ["#ff9a8b", "#ff6a88", "#ff99ac"],
    "gradient-ocean": ["#2af598", "#009efd", "#22d3ee"],
    "gradient-aurora": ["#a18cd1", "#fbc2eb", "#8fd3f4"],
  };

  if (background && gradients[background]) {
    const [a, b, c] = gradients[background];
    return (
      <>
        <defs>
          <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={a} />
            <stop offset="50%" stopColor={b} />
            <stop offset="100%" stopColor={c} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="240" height="240" rx="28" fill={`url(#bg-${uid})`} />
      </>
    );
  }

  if (background === "dots") {
    const dots = [];
    for (let y = 20; y < 240; y += 32) {
      for (let x = 20; x < 240; x += 32) {
        dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill={colors.background} opacity="0.6" />);
      }
    }
    return (
      <>
        <rect x="0" y="0" width="240" height="240" rx="28" fill={shade(colors.background, 0.25)} />
        {dots}
      </>
    );
  }

  if (background === "grid") {
    const lines = [];
    for (let i = 24; i < 240; i += 30) {
      lines.push(<line key={`v${i}`} x1={i} y1="0" x2={i} y2="240" stroke={colors.background} strokeWidth="2" opacity="0.7" />);
      lines.push(<line key={`h${i}`} x1="0" y1={i} x2="240" y2={i} stroke={colors.background} strokeWidth="2" opacity="0.7" />);
    }
    return (
      <>
        <rect x="0" y="0" width="240" height="240" rx="28" fill={shade(colors.background, 0.35)} />
        {lines}
      </>
    );
  }

  // solid
  return <rect x="0" y="0" width="240" height="240" rx="28" fill={colors.background} />;
}

// ---- face & features -----------------------------------------------------

function FaceShape({ shape, skin, style }) {
  const stroke = style === "geometric" ? shade(skin, -0.25) : "none";
  const strokeW = style === "geometric" ? 3 : 0;
  if (shape === "square") {
    return (
      <rect
        x="54"
        y="58"
        width="132"
        height="150"
        rx="34"
        fill={skin}
        stroke={stroke}
        strokeWidth={strokeW}
      />
    );
  }
  if (shape === "round") {
    return <circle cx="120" cy="128" r="74" fill={skin} stroke={stroke} strokeWidth={strokeW} />;
  }
  // oval
  return <ellipse cx="120" cy="128" rx="66" ry="82" fill={skin} stroke={stroke} strokeWidth={strokeW} />;
}

function Hair({ hair, hairColor, skin, style }) {
  if (hair === "bald") return null;
  const dark = shade(hairColor, -0.15);
  if (style === "pixel") {
    const map = {
      short: <rect x="62" y="58" width="116" height="34" rx="6" fill={hairColor} />,
      long: (
        <>
          <rect x="62" y="58" width="116" height="34" rx="6" fill={hairColor} />
          <rect x="62" y="58" width="18" height="120" fill={hairColor} />
          <rect x="160" y="58" width="18" height="120" fill={hairColor} />
        </>
      ),
      bun: (
        <>
          <rect x="62" y="64" width="116" height="30" rx="6" fill={hairColor} />
          <rect x="104" y="40" width="32" height="30" rx="6" fill={hairColor} />
        </>
      ),
      mohawk: <rect x="104" y="40" width="32" height="56" rx="4" fill={hairColor} />,
    };
    return map[hair] || null;
  }

  if (style === "geometric") {
    const map = {
      short: <path d="M58 96 L120 40 L182 96 L182 70 L120 26 L58 70 Z" fill={hairColor} />,
      long: (
        <>
          <path d="M58 96 L120 40 L182 96 L182 70 L120 26 L58 70 Z" fill={hairColor} />
          <rect x="56" y="92" width="20" height="96" fill={hairColor} />
          <rect x="164" y="92" width="20" height="96" fill={hairColor} />
        </>
      ),
      bun: (
        <>
          <path d="M58 96 L120 40 L182 96 L182 70 L120 26 L58 70 Z" fill={hairColor} />
          <circle cx="120" cy="36" r="16" fill={hairColor} />
        </>
      ),
      mohawk: <path d="M104 96 L120 24 L136 96 Z" fill={hairColor} />,
    };
    return map[hair] || null;
  }

  // flat & friendly (smooth curves)
  const map = {
    short: <path d="M56 110 C56 56 184 56 184 110 C170 84 150 72 120 72 C90 72 70 84 56 110 Z" fill={hairColor} />,
    long: (
      <>
        <path d="M52 150 C44 70 196 70 188 150 L188 110 C176 80 150 66 120 66 C90 66 64 80 52 110 Z" fill={hairColor} />
      </>
    ),
    bun: (
      <>
        <path d="M56 110 C56 56 184 56 184 110 C170 84 150 72 120 72 C90 72 70 84 56 110 Z" fill={hairColor} />
        <circle cx="120" cy="44" r="16" fill={hairColor} />
      </>
    ),
    mohawk: <path d="M104 112 C104 40 136 40 136 112 C130 84 110 84 104 112 Z" fill={hairColor} />,
  };
  return map[hair] || null;
}

function Eyebrows({ type, x, y, color, style }) {
  const stroke = color;
  if (style === "pixel") {
    const w = 22;
    return <rect x={x - w / 2} y={y} width={w} height="5" fill={stroke} />;
  }
  const map = {
    straight: <line x1={x - 12} y1={y + 6} x2={x + 12} y2={y + 6} stroke={stroke} strokeWidth="4" strokeLinecap="round" />,
    curved: <path d={`M${x - 12} ${y + 8} Q${x} ${y} ${x + 12} ${y + 8}`} stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />,
    raised: <path d={`M${x - 12} ${y + 9} Q${x} ${y - 3} ${x + 12} ${y + 9}`} stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />,
  };
  return map[type];
}

function Eyes({ type, x, y, style, friendly }) {
  const white = "#ffffff";
  const pupil = "#1b1b1b";
  if (style === "pixel") {
    const map = {
      round: <rect x={x - 6} y={y - 6} width="12" height="12" fill={pupil} />,
      happy: <rect x={x - 6} y={y - 3} width="12" height="6" fill={pupil} />,
      wink: <rect x={x - 6} y={y - 1} width="12" height="4" fill={pupil} />,
      closed: <rect x={x - 6} y={y - 1} width="12" height="3" fill={pupil} />,
    };
    return map[type];
  }

  if (type === "happy") {
    return <path d={`M${x - 10} ${y + 2} Q${x} ${y - 10} ${x + 10} ${y + 2}`} stroke={pupil} strokeWidth="4" fill="none" strokeLinecap="round" />;
  }
  if (type === "closed") {
    return <path d={`M${x - 10} ${y - 2} Q${x} ${y + 8} ${x + 10} ${y - 2}`} stroke={pupil} strokeWidth="4" fill="none" strokeLinecap="round" />;
  }
  if (type === "wink") {
    return (
      <>
        <circle cx={x - 1} cy={y} r={friendly ? 9 : 7} fill={white} />
        <circle cx={x - 1} cy={y + 1} r={friendly ? 4.5 : 3.5} fill={pupil} />
        <path d={`M${x - 10} ${y - 2} Q${x + 11} ${y + 6} ${x + 12} ${y - 2}`} stroke={pupil} strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    );
  }
  // round
  return (
    <>
      <circle cx={x} cy={y} r={friendly ? 10 : 8} fill={white} />
      <circle cx={x} cy={y + 1} r={friendly ? 5 : 4} fill={pupil} />
      {friendly && <circle cx={x - 3} cy={y - 3} r="2" fill={white} />}
    </>
  );
}

function Mouth({ type, y, accent, style }) {
  const stroke = "#7a3b2e";
  if (style === "pixel") {
    const map = {
      smile: <rect x="104" y={y} width="32" height="5" fill={stroke} />,
      neutral: <rect x="104" y={y + 2} width="32" height="4" fill={stroke} />,
      open: <rect x="106" y={y - 2} width="28" height="12" rx="3" fill={stroke} />,
      smirk: <rect x="104" y={y + 1} width="32" height="4" fill={stroke} />,
    };
    return map[type];
  }
  const map = {
    smile: <path d={`M100 ${y} Q120 ${y + 22} 140 ${y}`} stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />,
    neutral: <line x1="102" y1={y + 6} x2="138" y2={y + 6} stroke={stroke} strokeWidth="4" strokeLinecap="round" />,
    open: <path d={`M104 ${y} Q120 ${y + 26} 136 ${y} Z`} fill={stroke} />,
    smirk: <path d={`M102 ${y + 2} Q122 ${y + 12} 138 ${y - 2}`} stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />,
  };
  return map[type];
}

function FacialHair({ type, skin, hairColor }) {
  if (type === "none") return null;
  if (type === "stubble") {
    return <path d="M76 150 Q120 200 164 150 Q150 178 120 182 Q90 178 76 150 Z" fill={hairColor} opacity="0.35" />;
  }
  // beard
  return <path d="M70 140 Q120 210 170 140 Q156 196 120 196 Q84 196 70 140 Z" fill={hairColor} />;
}

function Accessory({ type, accent, hairColor }) {
  if (type === "none") return null;
  if (type === "glasses") {
    return (
      <>
        <circle cx="92" cy="118" r="18" fill="none" stroke={hairColor} strokeWidth="4" />
        <circle cx="148" cy="118" r="18" fill="none" stroke={hairColor} strokeWidth="4" />
        <line x1="110" y1="118" x2="130" y2="118" stroke={hairColor} strokeWidth="4" />
      </>
    );
  }
  if (type === "sunglasses") {
    return (
      <>
        <rect x="74" y="106" width="36" height="24" rx="8" fill="#1b1b1b" />
        <rect x="130" y="106" width="36" height="24" rx="8" fill="#1b1b1b" />
        <line x1="110" y1="116" x2="130" y2="116" stroke="#1b1b1b" strokeWidth="5" />
      </>
    );
  }
  // hat (cap)
  return (
    <>
      <path d="M64 78 Q120 28 176 78 Z" fill={accent} />
      <rect x="58" y="76" width="124" height="12" rx="6" fill={shade(accent, -0.15)} />
      <path d="M176 82 q20 2 24 12 q-22 0 -30 -4 Z" fill={accent} />
    </>
  );
}

function Blush({ skin, style }) {
  if (style !== "friendly") return null;
  const c = shade(skin, 0.18);
  return (
    <>
      <ellipse cx="82" cy="150" rx="12" ry="7" fill={c} opacity="0.7" />
      <ellipse cx="158" cy="150" rx="12" ry="7" fill={c} opacity="0.7" />
    </>
  );
}

// Main builder — returns the inner SVG content (everything except the root <svg>).
export function buildAvatarContent(config) {
  const { style, colors, features } = config;
  const friendly = style === "friendly";
  const uid =
    (config.seed || "x").replace(/[^a-z0-9]/gi, "") + "-" + style + "-" + features.faceShape;

  const eyebrowColor = shade(colors.hair, -0.1);

  return (
    <>
      <Background config={config} uid={uid} />
      <Hair hair={features.hair} hairColor={colors.hair} skin={colors.skin} style={style} />
      <FaceShape shape={features.faceShape} skin={colors.skin} style={style} />
      <Blush skin={colors.skin} style={style} />
      <FacialHair type={features.facialHair} skin={colors.skin} hairColor={colors.hair} />

      {/* eyes */}
      <g>
        <Eyes type={features.eyes} x={94} y={122} style={style} friendly={friendly} />
        <Eyes type={features.eyes} x={146} y={122} style={style} friendly={friendly} />
      </g>

      {/* eyebrows */}
      <g>
        <Eyebrows type={features.eyebrows} x={94} y={104} color={eyebrowColor} style={style} />
        <Eyebrows type={features.eyebrows} x={146} y={104} color={eyebrowColor} style={style} />
      </g>

      <Mouth type={features.mouth} y={150} accent={colors.accent} style={style} />
      <Accessory type={features.accessory} accent={colors.accent} hairColor={colors.hair} />
    </>
  );
}

export { DEFAULT_CONFIG };
