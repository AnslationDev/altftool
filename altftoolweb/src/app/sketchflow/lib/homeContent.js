export const HOME_DOC_PATH = ["projects", "altftool", "sketchflow", "data", "home", "content"];

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "altftool-bca36";
const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAYKc0SBXyY3bfKLkmcCrPf-NsPF8p_Z50";

export const ALL_TOOLS = [
  { id: "select", label: "Selection", shortcut: "V", enabled: true },
  { id: "rectangle", label: "Rectangle", shortcut: "R", enabled: true },
  { id: "diamond", label: "Diamond", shortcut: "D", enabled: true },
  { id: "ellipse", label: "Ellipse", shortcut: "E", enabled: true },
  { id: "arrow", label: "Arrow", shortcut: "A", enabled: true },
  { id: "line", label: "Line", shortcut: "L", enabled: true },
  { id: "freedraw", label: "Freedraw", shortcut: "P", enabled: true },
  { id: "text", label: "Text", shortcut: "T", enabled: true },
  { id: "eraser", label: "Eraser", shortcut: "X", enabled: true },
  { id: "image", label: "Image", shortcut: "I", enabled: true },
  { id: "frame", label: "Frame", shortcut: "F", enabled: true },
  { id: "laser", label: "Laser Pointer", shortcut: "K", enabled: true },
];

export const DEFAULT_HOME_CONTENT = {
  branding: {
    appName: "SketchFlow",
    tagline: "Hand-drawn infinite whiteboard",
    accentColor: "#14b8a6",
    brandIconKey: "Sparkles",
  },
  tools: {
    items: ALL_TOOLS.map((tool) => ({ ...tool })),
  },
  ui: {
    commandPalettePlaceholder: "Run a command…",
    propertiesTitle: "Properties",
    exportFilePrefix: "sketchflow",
    googleFontUrl: "https://fonts.googleapis.com/css2?family=Architects+Daughter&display=swap",
  },
  defaults: {
    strokeColor: "#1f2937",
    backgroundColor: "transparent",
    fillStyle: "hachure",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    fontSize: 28,
    fontFamily: '"Architects Daughter", Excalifont, Virgil, system-ui, sans-serif',
    textAlign: "left",
    arrowType: "straight",
    startArrowhead: "none",
    endArrowhead: "triangle",
    fontOptions: [
      '"Architects Daughter", Excalifont, Virgil, system-ui, sans-serif',
      "system-ui, sans-serif",
      "Georgia, serif",
      "monospace",
    ],
  },
  seo: {
    // The old value rendered 75 characters with the layout's " | AltFTool"
    // suffix — that is what /sketchflow serves today, and mobile SERPs (84% of
    // this site's clicks) cut it well before "Diagram Maker". 57 rendered now.
    // NOTE: fetchHomeContent merges the Firestore home doc over this default,
    // so if an admin has saved a seo.metaTitle it still wins; that override
    // has to be shortened in the admin app, not here.
    metaTitle: "SketchFlow - Free Online Whiteboard & Diagrams",
    metaDescription:
      "Use SketchFlow by AltFTool to draw diagrams, flowcharts, notes, arrows, shapes, text, and images on an infinite hand-drawn whiteboard. Export your work as PNG, SVG, or SketchFlow JSON.",
    keywords:
      "SketchFlow, online whiteboard, Excalidraw alternative, diagram maker, flowchart tool, hand drawn whiteboard, online sketch tool, AltFTool",
    ogTitle: "SketchFlow - Free Online Whiteboard and Diagram Maker",
    ogDescription:
      "Create hand-drawn diagrams, notes, arrows, shapes, text, and image-based sketches on a fast infinite canvas.",
    ogImage: "",
  },
  settings: {
    gridEnabled: true,
    gridStep: 32,
    darkModeDefault: false,
    historyLimit: 200,
    storageKey: "altftool-sketchflow-scene-v1",
    autosaveIntervalMs: 2000,
    includeBackgroundDefault: true,
    cameraDefault: { x: 420, y: 240, zoom: 1 },
    customJson: {},
  },
};

function mergeContent(base, override) {
  if (Array.isArray(base) || Array.isArray(override)) {
    // For arrays, use override if it exists; otherwise keep the base default.
    return override === undefined || override === null ? base : override;
  }
  if (base && typeof base === "object" && override && typeof override === "object") {
    const out = { ...base };
    // Iterate base keys so ALL default fields are always populated, even when
    // the Firestore document predates a newly-added field.
    for (const key of Object.keys(base)) {
      out[key] = mergeContent(base[key], override[key]);
    }
    return out;
  }
  return override === undefined || override === null || override === "" ? base : override;
}

function decodeValue(value) {
  if (value === null || value === undefined) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("mapValue" in value) return decodeFields(value.mapValue.fields || {});
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(decodeValue);
  return null;
}

function decodeFields(fields) {
  const out = {};
  for (const key of Object.keys(fields)) out[key] = decodeValue(fields[key]);
  return out;
}

export async function fetchHomeContent() {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY) return DEFAULT_HOME_CONTENT;

  const docPath = HOME_DOC_PATH.join("/");
  const url =
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}` +
    `/databases/(default)/documents/${docPath}?key=${FIREBASE_API_KEY}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return DEFAULT_HOME_CONTENT;
    const json = await res.json();
    if (!json.fields) return DEFAULT_HOME_CONTENT;
    const decoded = decodeFields(json.fields);
    // Strip server-managed fields (e.g. updatedAt) that should not leak into
    // the frontend config object.
    const { updatedAt: _updatedAt, ...contentFields } = decoded;
    return mergeContent(DEFAULT_HOME_CONTENT, contentFields);
  } catch {
    return DEFAULT_HOME_CONTENT;
  }
}

export function seoKeywords(seo) {
  if (Array.isArray(seo?.keywords)) return seo.keywords;
  if (typeof seo?.keywords === "string") {
    return seo.keywords.split(",").map((k) => k.trim()).filter(Boolean);
  }
  return [];
}

export function resolveToolbarItems(toolsConfig) {
  const items = toolsConfig?.items?.length ? toolsConfig.items : ALL_TOOLS;
  return items.filter((tool) => tool.enabled !== false);
}
