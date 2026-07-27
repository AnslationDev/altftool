/**
 * Indian Festival Greeting Card Maker — pure content + layout module.
 *
 * Holds the festival greeting phrases, the palettes, the motif geometry and the
 * card layout maths. No React, no DOM: the caller renders the returned spec as
 * SVG. Every value is derived from the arguments, so the same input always
 * produces the same card.
 */

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** HSL -> #RRGGBB (CSS Color 3 conversion). Palettes are stored as HSL numbers. */
export function hslToHex(h, s, l) {
  const hue = ((Number(h) % 360) + 360) % 360;
  const sat = clamp(Number(s), 0, 100) / 100;
  const lig = clamp(Number(l), 0, 100) / 100;
  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  let rgb;
  if (hue < 60) rgb = [c, x, 0];
  else if (hue < 120) rgb = [x, c, 0];
  else if (hue < 180) rgb = [0, c, x];
  else if (hue < 240) rgb = [0, x, c];
  else if (hue < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return `#${rgb
    .map((channel) => clamp(Math.round((channel + m) * 255), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Languages offered for the greeting line, with their endonyms. */
export const LANGUAGES = [
  { id: "en", label: "English", native: "English" },
  { id: "hi", label: "Hindi", native: "हिन्दी" },
  { id: "mr", label: "Marathi", native: "मराठी" },
  { id: "bn", label: "Bengali", native: "বাংলা" },
  { id: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { id: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { id: "ta", label: "Tamil", native: "தமிழ்" },
  { id: "te", label: "Telugu", native: "తెలుగు" },
  { id: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { id: "ml", label: "Malayalam", native: "മലയാളം" },
  { id: "ur", label: "Urdu", native: "اردو" },
];

/**
 * Festivals with their standard greeting phrases.
 * Only phrases in common everyday use are listed; a festival simply omits a
 * language rather than carrying a machine-translated line.
 * Palettes are [hue, saturation%, lightness%].
 */
export const FESTIVALS = [
  {
    id: "diwali",
    label: "Diwali / Deepavali",
    when: "Kartik Amavasya (October or November)",
    motif: "diya",
    palette: { bg: [270, 42, 14], panel: [268, 38, 20], ink: [45, 92, 82], muted: [268, 20, 78], accent: [38, 94, 56], accent2: [340, 78, 60] },
    greetings: {
      en: "Happy Diwali",
      hi: "दीपावली की हार्दिक शुभकामनाएँ",
      mr: "दिवाळीच्या हार्दिक शुभेच्छा",
      bn: "শুভ দীপাবলি",
      gu: "દિવાળીની હાર્દિક શુભકામનાઓ",
      pa: "ਦੀਵਾਲੀ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ",
      ta: "தீபாவளி நல்வாழ்த்துக்கள்",
      te: "దీపావళి శుభాకాంక్షలు",
      kn: "ದೀಪಾವಳಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು",
      ml: "ദീപാവലി ആശംസകൾ",
    },
  },
  {
    id: "holi",
    label: "Holi",
    when: "Phalguna Purnima (March)",
    motif: "splash",
    palette: { bg: [204, 70, 92], panel: [0, 0, 100], ink: [268, 44, 24], muted: [268, 16, 44], accent: [330, 82, 58], accent2: [162, 68, 44] },
    greetings: {
      en: "Happy Holi",
      hi: "होली की हार्दिक शुभकामनाएँ",
      mr: "होळीच्या हार्दिक शुभेच्छा",
      bn: "শুভ হোলি",
      gu: "હોળીની હાર્દિક શુભકામનાઓ",
      pa: "ਹੋਲੀ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ",
      te: "హోళీ శుభాకాంక్షలు",
      kn: "ಹೋಳಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು",
    },
  },
  {
    id: "eid",
    label: "Eid",
    when: "Shawwal 1 (Eid al-Fitr) and Dhul Hijjah 10 (Eid al-Adha)",
    motif: "crescent",
    palette: { bg: [162, 52, 16], panel: [162, 44, 22], ink: [45, 62, 88], muted: [162, 18, 76], accent: [45, 86, 62], accent2: [172, 62, 56] },
    greetings: {
      en: "Eid Mubarak",
      hi: "ईद मुबारक",
      ur: "عید مبارک",
      bn: "ঈদ মোবারক",
      ta: "ஈத் முபாரக்",
      ml: "ഈദ് മുബാറക്",
      te: "ఈద్ ముబారక్",
      kn: "ಈದ್ ಮುಬಾರಕ್",
    },
  },
  {
    id: "pongal",
    label: "Pongal",
    when: "Thai 1, the Tamil solar new year month (14 or 15 January)",
    motif: "sun",
    palette: { bg: [40, 88, 92], panel: [0, 0, 100], ink: [24, 62, 24], muted: [24, 20, 42], accent: [32, 92, 50], accent2: [96, 52, 38] },
    greetings: {
      en: "Happy Pongal",
      ta: "இனிய பொங்கல் நல்வாழ்த்துக்கள்",
      te: "పొంగల్ శుభాకాంక్షలు",
      hi: "पोंगल की शुभकामनाएँ",
    },
  },
  {
    id: "onam",
    label: "Onam",
    when: "Thiruvonam in the Malayalam month of Chingam (August or September)",
    motif: "pookalam",
    palette: { bg: [48, 78, 94], panel: [0, 0, 100], ink: [140, 44, 20], muted: [140, 16, 40], accent: [4, 78, 54], accent2: [140, 48, 38] },
    greetings: {
      en: "Happy Onam",
      ml: "ഓണാശംസകൾ",
      ta: "ஓணம் நல்வாழ்த்துக்கள்",
      hi: "ओणम की शुभकामनाएँ",
    },
  },
  {
    id: "ganesh-chaturthi",
    label: "Ganesh Chaturthi",
    when: "Bhadrapada Shukla Chaturthi (August or September)",
    motif: "rangoli",
    palette: { bg: [12, 78, 92], panel: [0, 0, 100], ink: [8, 62, 26], muted: [8, 18, 44], accent: [12, 84, 52], accent2: [44, 88, 50] },
    greetings: {
      en: "Happy Ganesh Chaturthi",
      mr: "गणपती बाप्पा मोरया",
      hi: "गणेश चतुर्थी की हार्दिक शुभकामनाएँ",
      gu: "ગણેશ ચતુર્થીની શુભકામનાઓ",
      kn: "ಗಣೇಶ ಚತುರ್ಥಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು",
      te: "వినాయక చవితి శుభాకాంక్షలు",
    },
  },
  {
    id: "navratri",
    label: "Navratri / Durga Puja",
    when: "Ashwin Shukla Pratipada to Dashami (September or October)",
    motif: "rangoli",
    palette: { bg: [346, 62, 92], panel: [0, 0, 100], ink: [340, 52, 26], muted: [340, 16, 44], accent: [340, 76, 52], accent2: [268, 56, 54] },
    greetings: {
      en: "Happy Navratri",
      hi: "नवरात्रि की हार्दिक शुभकामनाएँ",
      bn: "শুভ শারদীয়া",
      gu: "નવરાત્રિની હાર્દિક શુભકામનાઓ",
      mr: "नवरात्रीच्या हार्दिक शुभेच्छा",
      te: "దసరా శుభాకాంక్షలు",
      kn: "ದಸರಾ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು",
    },
  },
  {
    id: "baisakhi",
    label: "Baisakhi / Vaisakhi",
    when: "13 or 14 April, the Punjabi harvest new year",
    motif: "wheat",
    palette: { bg: [44, 86, 92], panel: [0, 0, 100], ink: [28, 58, 24], muted: [28, 18, 42], accent: [36, 92, 48], accent2: [22, 72, 46] },
    greetings: {
      en: "Happy Baisakhi",
      pa: "ਵਿਸਾਖੀ ਦੀਆਂ ਲੱਖ ਲੱਖ ਵਧਾਈਆਂ",
      hi: "बैसाखी की हार्दिक शुभकामनाएँ",
    },
  },
  {
    id: "ugadi",
    label: "Ugadi / Gudi Padwa",
    when: "Chaitra Shukla Pratipada (March or April)",
    motif: "wheat",
    palette: { bg: [96, 46, 92], panel: [0, 0, 100], ink: [136, 46, 20], muted: [136, 16, 40], accent: [96, 56, 36], accent2: [40, 88, 50] },
    greetings: {
      en: "Happy Ugadi",
      te: "ఉగాది శుభాకాంక్షలు",
      kn: "ಯುಗಾದಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು",
      mr: "गुढी पाडव्याच्या हार्दिक शुभेच्छा",
      hi: "उगादि की शुभकामनाएँ",
    },
  },
  {
    id: "raksha-bandhan",
    label: "Raksha Bandhan",
    when: "Shravana Purnima (August)",
    motif: "rangoli",
    palette: { bg: [22, 76, 94], panel: [0, 0, 100], ink: [352, 54, 28], muted: [352, 16, 46], accent: [352, 74, 54], accent2: [40, 88, 52] },
    greetings: {
      en: "Happy Raksha Bandhan",
      hi: "रक्षाबंधन की हार्दिक शुभकामनाएँ",
      mr: "रक्षाबंधनाच्या हार्दिक शुभेच्छा",
      gu: "રક્ષાબંધનની શુભકામનાઓ",
      bn: "শুভ রাখী পূর্ণিমা",
    },
  },
  {
    id: "christmas",
    label: "Christmas",
    when: "25 December",
    motif: "star",
    palette: { bg: [148, 44, 14], panel: [148, 34, 20], ink: [40, 68, 90], muted: [148, 14, 76], accent: [4, 74, 56], accent2: [44, 88, 62] },
    greetings: {
      en: "Merry Christmas",
      hi: "क्रिसमस की हार्दिक शुभकामनाएँ",
      ml: "ക്രിസ്മസ് ആശംസകൾ",
      ta: "கிறிஸ்துமஸ் வாழ்த்துக்கள்",
      te: "క్రిస్మస్ శుభాకాంక్షలు",
      kn: "ಕ್ರಿಸ್ಮಸ್ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು",
      bn: "শুভ বড়দিন",
    },
  },
  {
    id: "makar-sankranti",
    label: "Makar Sankranti / Uttarayan",
    when: "14 or 15 January, when the sun enters Makara",
    motif: "kite",
    palette: { bg: [200, 76, 92], panel: [0, 0, 100], ink: [214, 52, 24], muted: [214, 16, 44], accent: [346, 78, 56], accent2: [40, 92, 52] },
    greetings: {
      en: "Happy Makar Sankranti",
      hi: "मकर संक्रांति की हार्दिक शुभकामनाएँ",
      gu: "મકરસંક્રાંતિની શુભકામનાઓ",
      mr: "मकर संक्रांतीच्या हार्दिक शुभेच्छा",
      te: "సంక్రాంతి శుభాకాంక్షలు",
      kn: "ಸಂಕ್ರಾಂತಿ ಹಬ್ಬದ ಶುಭಾಶಯಗಳು",
    },
  },
];

/** Card sizes in SVG user units. A5 is 300 dpi print. */
export const SIZES = [
  { id: "square", label: "Square post 1080", width: 1080, height: 1080 },
  { id: "story", label: "Story 1080 x 1920", width: 1080, height: 1920 },
  { id: "a5", label: "A5 portrait (print, 300 dpi)", width: 1748, height: 2480 },
];

export const MAX_NAME_LENGTH = 40;
export const MAX_NOTE_LENGTH = 180;

/** Latin glyphs are narrower on average than Indic conjunct clusters. */
const GLYPH_EM_LATIN = 0.54;
const GLYPH_EM_INDIC = 0.66;

/** Anything outside Latin / Latin-Extended-A (U+0000-U+024F) gets the wider advance. */
const NON_LATIN = /[^\u0000-\u024F]/;

function glyphEm(text) {
  return NON_LATIN.test(String(text)) ? GLYPH_EM_INDIC : GLYPH_EM_LATIN;
}

export function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Greedy word wrap to a pixel width using the average-advance estimate. */
export function wrapText(text, fontSize, maxWidth) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const perLine = Math.max(5, Math.floor(maxWidth / (fontSize * glyphEm(clean))));
  const lines = [];
  let current = "";
  for (const word of clean.split(" ")) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= perLine) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      if (word.length > perLine) {
        lines.push(word.slice(0, perLine));
        current = word.slice(perLine);
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Font size that keeps a single line inside maxWidth, down to a floor. */
export function fitFontSize(text, idealSize, maxWidth, minSize) {
  const length = String(text ?? "").length;
  if (length === 0) return idealSize;
  const needed = maxWidth / (length * glyphEm(text));
  return Math.max(minSize, Math.min(idealSize, Math.floor(needed)));
}

/** Deterministic 32-bit hash used to seed motif jitter. */
export function hashSeed(text) {
  let hash = 2166136261;
  const source = String(text ?? "");
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** mulberry32 PRNG — deterministic for a given seed. */
export function makeRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Look up a greeting. Falls back to English when the festival has no phrase in
 * the chosen language, and reports that so the UI can say why.
 */
export function getGreeting(festivalId, languageId) {
  const festival = FESTIVALS.find((item) => item.id === festivalId) ?? FESTIVALS[0];
  const language = LANGUAGES.find((item) => item.id === languageId) ?? LANGUAGES[0];
  const phrase = festival.greetings[language.id];
  const fellBack = !phrase && language.id !== "en";
  return {
    festival,
    language,
    text: phrase || festival.greetings.en,
    english: festival.greetings.en,
    fellBack,
    availableLanguages: LANGUAGES.filter((item) => Boolean(festival.greetings[item.id])),
  };
}

/* ---------------------------------------------------------------------------
 * Motifs — plain geometry, returned as shape descriptors for the renderer.
 * ------------------------------------------------------------------------ */

function polygonPoints(cx, cy, radius, sides, rotationDeg) {
  const points = [];
  for (let i = 0; i < sides; i += 1) {
    const angle = ((360 / sides) * i + rotationDeg) * (Math.PI / 180);
    points.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return points.join(" ");
}

function starPoints(cx, cy, outer, inner, points, rotationDeg) {
  const list = [];
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = ((180 / points) * i + rotationDeg) * (Math.PI / 180);
    list.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return list.join(" ");
}

/**
 * Build the decorative shapes for a motif.
 * @returns {Array<object>} shape descriptors: circle, ellipse, polygon, line
 */
export function buildMotif(motifId, width, height, colors, seed) {
  const random = makeRandom(seed);
  const base = Math.min(width, height);
  const shapes = [];

  if (motifId === "diya") {
    const lamps = 5;
    const gap = width / (lamps + 1);
    for (let i = 1; i <= lamps; i += 1) {
      const cx = gap * i;
      const cy = height - base * 0.09;
      const bowl = base * 0.05;
      shapes.push({ id: `glow${i}`, type: "circle", cx, cy: cy - bowl * 1.5, r: bowl * 1.5, fill: colors.accent, opacity: 0.18 });
      shapes.push({ id: `bowl${i}`, type: "ellipse", cx, cy, rx: bowl, ry: bowl * 0.45, fill: colors.accent2 });
      shapes.push({
        id: `flame${i}`,
        type: "polygon",
        points: `${cx},${cy - bowl * 2.1} ${cx - bowl * 0.32},${cy - bowl * 0.5} ${cx + bowl * 0.32},${cy - bowl * 0.5}`,
        fill: colors.accent,
      });
    }
    // Hanging light string across the top.
    for (let i = 0; i <= 12; i += 1) {
      const x = (width / 12) * i;
      const y = base * 0.05 + Math.sin((i / 12) * Math.PI) * base * 0.04;
      shapes.push({ id: `bulb${i}`, type: "circle", cx: x, cy: y, r: base * 0.008, fill: i % 2 ? colors.accent : colors.accent2, opacity: 0.9 });
    }
  } else if (motifId === "splash") {
    for (let i = 0; i < 40; i += 1) {
      const edge = random() < 0.5;
      const x = edge ? random() * width * 0.16 : width - random() * width * 0.16;
      shapes.push({
        id: `s${i}`,
        type: "circle",
        cx: Math.round(x),
        cy: Math.round(random() * height),
        r: Math.round(base * 0.008 + random() * base * 0.03),
        fill: i % 3 === 0 ? colors.accent : i % 3 === 1 ? colors.accent2 : colors.ink,
        opacity: 0.35 + random() * 0.4,
      });
    }
  } else if (motifId === "crescent") {
    const cx = width * 0.5;
    const cy = height * 0.16;
    const r = base * 0.09;
    shapes.push({ id: "moon", type: "circle", cx, cy, r, fill: colors.accent });
    shapes.push({ id: "moon-cut", type: "circle", cx: cx + r * 0.42, cy: cy - r * 0.16, r: r * 0.86, fill: colors.bg });
    shapes.push({ id: "star", type: "polygon", points: starPoints(cx + r * 1.5, cy - r * 0.5, r * 0.34, r * 0.14, 5, -90), fill: colors.accent2 });
    for (let i = 0; i < 9; i += 1) {
      shapes.push({
        id: `lantern${i}`,
        type: "polygon",
        points: polygonPoints(
          (width / 10) * (i + 0.5),
          height - base * 0.06 - (i % 2) * base * 0.04,
          base * 0.03,
          8,
          22.5,
        ),
        fill: i % 2 ? colors.accent : colors.accent2,
        opacity: 0.5,
      });
    }
  } else if (motifId === "sun") {
    const cx = width * 0.5;
    const cy = height * 0.15;
    const r = base * 0.08;
    shapes.push({ id: "sun", type: "circle", cx, cy, r, fill: colors.accent });
    for (let i = 0; i < 16; i += 1) {
      const angle = (i * 22.5 * Math.PI) / 180;
      shapes.push({
        id: `ray${i}`,
        type: "line",
        x1: cx + Math.cos(angle) * r * 1.25,
        y1: cy + Math.sin(angle) * r * 1.25,
        x2: cx + Math.cos(angle) * r * 1.75,
        y2: cy + Math.sin(angle) * r * 1.75,
        stroke: colors.accent,
        strokeWidth: base * 0.008,
        opacity: 0.75,
      });
    }
    for (let i = 0; i < 8; i += 1) {
      shapes.push({
        id: `cane${i}`,
        type: "line",
        x1: (width / 8) * i + base * 0.02,
        y1: height,
        x2: (width / 8) * i + base * 0.05,
        y2: height - base * 0.16,
        stroke: colors.accent2,
        strokeWidth: base * 0.01,
        opacity: 0.6,
      });
    }
  } else if (motifId === "pookalam" || motifId === "rangoli") {
    const cx = width * 0.5;
    const cy = motifId === "pookalam" ? height * 0.84 : height * 0.86;
    const rings = 4;
    for (let ring = rings; ring >= 1; ring -= 1) {
      const radius = base * 0.045 * ring;
      const petals = 6 + ring * 4;
      for (let i = 0; i < petals; i += 1) {
        const angle = ((360 / petals) * i * Math.PI) / 180;
        shapes.push({
          id: `p${ring}-${i}`,
          type: "circle",
          cx: cx + Math.cos(angle) * radius,
          cy: cy + Math.sin(angle) * radius,
          r: base * 0.012,
          fill: ring % 2 ? colors.accent : colors.accent2,
          opacity: 0.85 - ring * 0.08,
        });
      }
    }
    shapes.push({ id: "core", type: "circle", cx, cy, r: base * 0.02, fill: colors.accent });
  } else if (motifId === "kite") {
    for (let i = 0; i < 6; i += 1) {
      const cx = width * (0.12 + random() * 0.76);
      const cy = height * (0.05 + random() * 0.28);
      const size = base * (0.035 + random() * 0.03);
      shapes.push({
        id: `kite${i}`,
        type: "polygon",
        points: `${cx},${cy - size} ${cx + size * 0.7},${cy} ${cx},${cy + size} ${cx - size * 0.7},${cy}`,
        fill: i % 2 ? colors.accent : colors.accent2,
        opacity: 0.85,
      });
      shapes.push({
        id: `tail${i}`,
        type: "line",
        x1: cx,
        y1: cy + size,
        x2: cx + size * 0.5,
        y2: cy + size * 2.4,
        stroke: colors.accent2,
        strokeWidth: base * 0.004,
        opacity: 0.6,
      });
    }
  } else if (motifId === "wheat") {
    for (let i = 0; i < 10; i += 1) {
      const x = (width / 10) * i + base * 0.03;
      shapes.push({
        id: `stalk${i}`,
        type: "line",
        x1: x,
        y1: height,
        x2: x + base * 0.02,
        y2: height - base * 0.18,
        stroke: colors.accent2,
        strokeWidth: base * 0.006,
        opacity: 0.7,
      });
      for (let g = 0; g < 5; g += 1) {
        shapes.push({
          id: `grain${i}-${g}`,
          type: "ellipse",
          cx: x + base * 0.02 - g * base * 0.004,
          cy: height - base * 0.18 + g * base * 0.02,
          rx: base * 0.008,
          ry: base * 0.014,
          fill: colors.accent,
          opacity: 0.8,
        });
      }
    }
  } else if (motifId === "star") {
    for (let i = 0; i < 10; i += 1) {
      const cx = width * (0.08 + random() * 0.84);
      const cy = height * (0.04 + random() * 0.22);
      const size = base * (0.018 + random() * 0.026);
      shapes.push({
        id: `star${i}`,
        type: "polygon",
        points: starPoints(cx, cy, size, size * 0.42, 5, -90),
        fill: i % 2 ? colors.accent2 : colors.accent,
        opacity: 0.9,
      });
      shapes.push({
        id: `thread${i}`,
        type: "line",
        x1: cx,
        y1: 0,
        x2: cx,
        y2: cy - size,
        stroke: colors.accent2,
        strokeWidth: base * 0.002,
        opacity: 0.4,
      });
    }
  }

  return shapes;
}

/* ---------------------------------------------------------------------------
 * Card layout
 * ------------------------------------------------------------------------ */

/**
 * Build the greeting card spec.
 *
 * @param {object} input
 * @param {string} input.festivalId one of FESTIVALS
 * @param {string} input.languageId one of LANGUAGES
 * @param {string} input.recipient optional "Dear ..." name
 * @param {string} input.sender optional sender name
 * @param {string} input.note optional personal line
 * @param {string} input.sizeId one of SIZES
 * @param {boolean} input.showEnglish add the English line under a non-English greeting
 * @returns {object} spec, or { error }
 */
export function buildGreetingCard({
  festivalId = FESTIVALS[0].id,
  languageId = "hi",
  recipient = "",
  sender = "",
  note = "",
  sizeId = SIZES[0].id,
  showEnglish = true,
} = {}) {
  const cleanRecipient = String(recipient).trim();
  const cleanSender = String(sender).trim();
  const cleanNote = String(note).trim();

  if (cleanRecipient.length > MAX_NAME_LENGTH) {
    return { error: `Keep the recipient name under ${MAX_NAME_LENGTH} characters.` };
  }
  if (cleanSender.length > MAX_NAME_LENGTH) {
    return { error: `Keep the sender name under ${MAX_NAME_LENGTH} characters.` };
  }
  if (cleanNote.length > MAX_NOTE_LENGTH) {
    return { error: `Keep the personal note under ${MAX_NOTE_LENGTH} characters.` };
  }
  if (!FESTIVALS.some((item) => item.id === festivalId)) {
    return { error: "Pick a festival from the list." };
  }
  if (!SIZES.some((item) => item.id === sizeId)) {
    return { error: "Pick one of the available card sizes." };
  }

  const greeting = getGreeting(festivalId, languageId);
  const festival = greeting.festival;
  const size = SIZES.find((item) => item.id === sizeId);
  const { width, height } = size;
  const base = Math.min(width, height);

  const colors = {
    bg: hslToHex(...festival.palette.bg),
    panel: hslToHex(...festival.palette.panel),
    ink: hslToHex(...festival.palette.ink),
    muted: hslToHex(...festival.palette.muted),
    accent: hslToHex(...festival.palette.accent),
    accent2: hslToHex(...festival.palette.accent2),
  };

  const margin = Math.round(width * 0.06);
  const panel = {
    x: margin,
    y: margin,
    width: width - margin * 2,
    height: height - margin * 2,
    radius: Math.round(width * 0.03),
  };
  const inner = panel.width - Math.round(width * 0.09);
  const centerX = Math.round(width / 2);

  const scale = {
    kicker: Math.round(base * 0.024),
    greeting: Math.round(base * 0.072),
    english: Math.round(base * 0.03),
    body: Math.round(base * 0.026),
    sign: Math.round(base * 0.024),
  };

  const blocks = [];
  let cursor = panel.y + Math.round(height * 0.11);

  if (cleanRecipient) {
    blocks.push({
      kind: "text",
      id: "recipient",
      text: `Dear ${cleanRecipient}`,
      x: centerX,
      y: cursor,
      size: scale.kicker,
      weight: 600,
      fill: colors.muted,
      letterSpacing: Math.round(scale.kicker * 0.1),
    });
    cursor += Math.round(scale.kicker * 2.4);
  }

  const greetingSize = fitFontSize(greeting.text, scale.greeting, inner, Math.round(scale.greeting * 0.5));
  const greetingLines = wrapText(greeting.text, greetingSize, inner);
  greetingLines.forEach((line, index) => {
    blocks.push({
      kind: "text",
      id: `greeting-${index}`,
      text: line,
      x: centerX,
      y: cursor,
      size: greetingSize,
      weight: 800,
      fill: colors.ink,
      letterSpacing: 0,
    });
    cursor += Math.round(greetingSize * 1.24);
  });

  const needsEnglish = showEnglish && greeting.language.id !== "en";
  if (needsEnglish) {
    cursor += Math.round(scale.english * 0.5);
    blocks.push({
      kind: "text",
      id: "english",
      text: greeting.english,
      x: centerX,
      y: cursor,
      size: scale.english,
      weight: 600,
      fill: colors.accent,
      letterSpacing: Math.round(scale.english * 0.08),
    });
    cursor += Math.round(scale.english * 1.9);
  }

  cursor += Math.round(scale.body * 0.6);
  blocks.push({
    kind: "rule",
    id: "rule",
    x1: centerX - Math.round(inner * 0.16),
    x2: centerX + Math.round(inner * 0.16),
    y: cursor,
    stroke: colors.accent2,
    strokeWidth: Math.max(2, Math.round(base * 0.004)),
  });
  cursor += Math.round(scale.body * 1.8);

  const noteLines = wrapText(cleanNote, scale.body, inner);
  noteLines.forEach((line, index) => {
    blocks.push({
      kind: "text",
      id: `note-${index}`,
      text: line,
      x: centerX,
      y: cursor,
      size: scale.body,
      weight: 400,
      fill: colors.muted,
      letterSpacing: 0,
    });
    cursor += Math.round(scale.body * 1.45);
  });

  const signOffY = panel.y + panel.height - Math.round(height * 0.07);
  if (cleanSender) {
    blocks.push({
      kind: "text",
      id: "sender",
      text: `— ${cleanSender}`,
      x: centerX,
      y: signOffY,
      size: scale.sign,
      weight: 600,
      fill: colors.accent2,
      letterSpacing: 0,
    });
  }

  const motif = buildMotif(
    festival.motif,
    width,
    height,
    colors,
    hashSeed(`${festival.id}|${size.id}|${cleanRecipient}|${cleanSender}`),
  );

  const overflow = cursor > signOffY - Math.round(scale.sign * 2);

  const plainText = [
    greeting.text,
    needsEnglish ? `(${greeting.english})` : "",
    cleanRecipient ? `Dear ${cleanRecipient},` : "",
    cleanNote,
    cleanSender ? `— ${cleanSender}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    width,
    height,
    panel,
    colors,
    blocks,
    motif,
    plainText,
    greetingText: greeting.text,
    englishText: greeting.english,
    languageLabel: greeting.language.label,
    languageNative: greeting.language.native,
    fellBack: greeting.fellBack,
    availableLanguages: greeting.availableLanguages,
    festivalLabel: festival.label,
    festivalWhen: festival.when,
    motifName: festival.motif,
    sizeLabel: size.label,
    overflow,
    warning: overflow
      ? "The message is running into the sign-off — shorten the note or use the taller story size."
      : greeting.fellBack
        ? `${festival.label} has no stock phrase in ${greeting.language.label} here, so the English greeting is shown.`
        : "",
  };
}
