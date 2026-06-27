import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db } from "@/lib/firebase";

const HOME_DOC_PATH = ["projects", "altftool", "sketchflow", "data", "home", "content"];
const homeDocRef = () => doc(db, ...HOME_DOC_PATH);

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
    accentColor: "#6965db",
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
    metaTitle: "SketchFlow - Free Online Whiteboard and Hand-Drawn Diagram Maker",
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

export const ICON_OPTIONS = [
  "Sparkles",
  "PenLine",
  "Palette",
  "Shapes",
  "MousePointer2",
  "Square",
  "Circle",
  "Zap",
  "Frame",
  "Image",
  "ShieldCheck",
  "Star",
];

export async function fetchHome() {
  const snap = await getDoc(homeDocRef());
  if (!snap.exists()) return null;
  return snap.data();
}

export async function saveHome(content) {
  await setDoc(
    homeDocRef(),
    { ...content, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function uploadHomeImage(file) {
  const storage = getStorage();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const imageRef = ref(storage, `sketchflow/home/${Date.now()}-${safeName}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}
