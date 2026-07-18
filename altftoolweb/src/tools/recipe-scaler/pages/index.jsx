"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChefHat,
  ClipboardPaste,
  Copy,
  FileDown,
  Info,
  ListChecks,
  Plus,
  RotateCcw,
  Scaling,
  Trash2,
  Users,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const UNITS = ["", "cup", "tbsp", "tsp", "ml", "l", "g", "kg", "oz", "lb", "piece", "pinch", "clove", "can", "slice"];
const FRACTION_UNITS = new Set(["", "cup", "tbsp", "tsp", "piece", "pinch", "clove", "can", "slice"]);
const PLURAL_UNITS = { cup: "cups", piece: "pieces", pinch: "pinches", clove: "cloves", can: "cans", slice: "slices" };

const UNIT_ALIASES = {
  cup: ["cup", "cups", "c"],
  tbsp: ["tbsp", "tbs", "tbsps", "tablespoon", "tablespoons", "tb"],
  tsp: ["tsp", "tsps", "teaspoon", "teaspoons"],
  ml: ["ml", "milliliter", "milliliters", "millilitre", "millilitres"],
  l: ["l", "liter", "liters", "litre", "litres"],
  g: ["g", "gm", "gms", "gram", "grams"],
  kg: ["kg", "kgs", "kilogram", "kilograms"],
  oz: ["oz", "ounce", "ounces"],
  lb: ["lb", "lbs", "pound", "pounds"],
  piece: ["piece", "pieces", "pc", "pcs"],
  pinch: ["pinch", "pinches"],
  clove: ["clove", "cloves"],
  can: ["can", "cans", "tin", "tins"],
  slice: ["slice", "slices"],
};

const UNICODE_FRACTIONS = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅕": 0.2,
  "⅖": 0.4,
  "⅗": 0.6,
  "⅘": 0.8,
  "⅙": 1 / 6,
  "⅚": 5 / 6,
  "⅛": 0.125,
  "⅜": 0.375,
  "⅝": 0.625,
  "⅞": 0.875,
};

const FRACTION_GLYPHS = [
  [0, ""],
  [1 / 8, "⅛"],
  [1 / 6, "⅙"],
  [1 / 4, "¼"],
  [1 / 3, "⅓"],
  [3 / 8, "⅜"],
  [1 / 2, "½"],
  [5 / 8, "⅝"],
  [2 / 3, "⅔"],
  [3 / 4, "¾"],
  [5 / 6, "⅚"],
  [7 / 8, "⅞"],
  [1, ""],
];

const trimNumber = (value, maxDigits = 2) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: maxDigits }).format(Number.isFinite(value) ? value : 0);

function parseQty(raw) {
  if (raw === null || raw === undefined) return NaN;
  let text = String(raw).trim();
  if (!text) return NaN;
  let total = 0;
  let matchedGlyph = false;
  for (const [glyph, val] of Object.entries(UNICODE_FRACTIONS)) {
    if (text.includes(glyph)) {
      total += val;
      text = text.replace(glyph, "");
      matchedGlyph = true;
    }
  }
  text = text.trim();
  if (!text) return matchedGlyph ? total : NaN;
  const mixed = text.match(/^(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (mixed) return total + Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = text.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (frac && Number(frac[2]) !== 0) return total + Number(frac[1]) / Number(frac[2]);
  const num = Number(text.replace(",", "."));
  if (Number.isFinite(num)) return total + num;
  return matchedGlyph ? total : NaN;
}

function formatQty(value) {
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (value < 0.016) return trimNumber(value, 3);
  const whole = Math.floor(value + 1e-9);
  const rem = value - whole;
  let best = FRACTION_GLYPHS[0];
  let bestDiff = Math.abs(rem - best[0]);
  for (const cand of FRACTION_GLYPHS) {
    const diff = Math.abs(rem - cand[0]);
    if (diff < bestDiff) {
      best = cand;
      bestDiff = diff;
    }
  }
  if (bestDiff <= 0.03) {
    let wholePart = whole;
    let glyph = best[1];
    if (best[0] === 1) {
      wholePart += 1;
      glyph = "";
    }
    if (best[0] === 0) glyph = "";
    if (wholePart === 0 && !glyph) return trimNumber(value, 3);
    return glyph ? `${wholePart > 0 ? wholePart : ""}${glyph}` : String(wholePart);
  }
  return trimNumber(value);
}

function formatScaled(value, unit) {
  if (!Number.isFinite(value)) return "?";
  if (FRACTION_UNITS.has(unit)) return formatQty(value);
  if (unit === "g" || unit === "ml") return trimNumber(value >= 10 ? Math.round(value) : Math.round(value * 10) / 10, 1);
  if (unit === "oz") return trimNumber(Math.round(value * 10) / 10, 1);
  return trimNumber(value);
}

const unitLabel = (unit, qty) => (qty > 1 && PLURAL_UNITS[unit] ? PLURAL_UNITS[unit] : unit);

function upgradeHint(value, unit) {
  if (!Number.isFinite(value) || value <= 0) return "";
  if (unit === "tsp" && value >= 3) {
    const tbsp = Math.floor(value / 3);
    const rem = value - tbsp * 3;
    return `= ${formatQty(tbsp)} tbsp${rem > 0.04 ? ` + ${formatQty(rem)} tsp` : ""}`;
  }
  if (unit === "tbsp") {
    if (value >= 4) {
      const quarters = Math.floor(value / 4);
      const rem = value - quarters * 4;
      const cups = quarters / 4;
      return `= ${formatQty(cups)} ${cups > 1 ? "cups" : "cup"}${rem > 0.04 ? ` + ${formatQty(rem)} tbsp` : ""}`;
    }
    if (value < 1) return `= ${formatQty(value * 3)} tsp`;
  }
  if (unit === "cup" && value < 0.24) return `= ${formatQty(value * 16)} tbsp`;
  if (unit === "ml" && value >= 1000) return `= ${trimNumber(value / 1000)} l`;
  if (unit === "l" && value < 1) return `= ${trimNumber(value * 1000)} ml`;
  if (unit === "g" && value >= 1000) return `= ${trimNumber(value / 1000)} kg`;
  if (unit === "kg" && value < 1) return `= ${trimNumber(value * 1000)} g`;
  if (unit === "oz" && value >= 16) {
    const lb = Math.floor(value / 16);
    const rem = value - lb * 16;
    return `= ${lb} lb${rem > 0.05 ? ` + ${trimNumber(rem, 1)} oz` : ""}`;
  }
  if (unit === "lb" && value < 1) return `= ${trimNumber(value * 16, 1)} oz`;
  return "";
}

const ADVISORY_RULES = [
  {
    id: "leavening",
    chip: "Leavening",
    test: (name) => ["baking powder", "baking soda", "bicarb", "yeast"].some((k) => name.includes(k)),
    note: "Leavening (baking powder, soda, yeast) does not scale 1:1 — beyond 2x, start with roughly 75-90% of the linear amount so bakes do not dome and collapse.",
  },
  {
    id: "salt",
    chip: "Salt — to taste",
    test: (name) => ["salt", "soy sauce", "fish sauce", "miso", "stock cube", "bouillon"].some((k) => name.includes(k)),
    note: "Salt and salty sauces intensify in bigger batches. Add about 75% of the scaled amount first, then taste and adjust.",
  },
  {
    id: "spice",
    chip: "Spice — to taste",
    test: (name) =>
      [
        "pepper",
        "chilli",
        "chili",
        "cayenne",
        "paprika",
        "masala",
        "cumin",
        "coriander",
        "turmeric",
        "cinnamon",
        "nutmeg",
        "cardamom",
        "allspice",
        "curry powder",
        "vanilla",
        "extract",
        "zest",
        "ground cloves",
      ].some((k) => name.includes(k)),
    note: "Spices, extracts and zest compound in large batches. Start near 80% of the scaled amount and adjust at the end.",
  },
  {
    id: "egg",
    chip: "Round to whole",
    test: (name) => /\beggs?\b/.test(name),
    note: "Eggs are indivisible — round to the nearest whole egg, or whisk one and use half by weight (about 25 g).",
  },
];

const advisoriesFor = (name) => {
  const lower = (name || "").toLowerCase();
  if (!lower.trim()) return [];
  return ADVISORY_RULES.filter((rule) => rule.test(lower));
};

const SAMPLE_RECIPES = [
  {
    label: "Fluffy pancakes (serves 4)",
    name: "Fluffy pancakes",
    servings: 4,
    target: 6,
    rows: [
      ["1 1/2", "cup", "all-purpose flour"],
      ["3 1/2", "tsp", "baking powder"],
      ["1", "tsp", "salt"],
      ["1", "tbsp", "sugar"],
      ["1 1/4", "cup", "milk"],
      ["1", "piece", "egg"],
      ["3", "tbsp", "butter, melted"],
      ["1", "tsp", "vanilla extract"],
    ],
  },
  {
    label: "Choc-chip cookies (makes 24)",
    name: "Chocolate chip cookies",
    servings: 24,
    target: 36,
    rows: [
      ["2 1/4", "cup", "all-purpose flour"],
      ["1", "tsp", "baking soda"],
      ["1", "tsp", "salt"],
      ["1", "cup", "butter, softened"],
      ["3/4", "cup", "granulated sugar"],
      ["3/4", "cup", "brown sugar, packed"],
      ["1", "tsp", "vanilla extract"],
      ["2", "piece", "eggs"],
      ["2", "cup", "chocolate chips"],
    ],
  },
  {
    label: "Dal tadka (serves 4)",
    name: "Dal tadka",
    servings: 4,
    target: 8,
    rows: [
      ["1", "cup", "toor dal, rinsed"],
      ["3", "cup", "water"],
      ["1/2", "tsp", "turmeric"],
      ["1", "tsp", "salt"],
      ["2", "tbsp", "ghee"],
      ["1", "tsp", "cumin seeds"],
      ["4", "clove", "garlic, sliced"],
      ["2", "piece", "dried red chillies"],
      ["1", "piece", "onion, chopped"],
      ["2", "piece", "tomatoes, chopped"],
    ],
  },
];

let rowIdCounter = 0;
const makeRow = (qty, unit, name) => {
  rowIdCounter += 1;
  return { id: `row-${rowIdCounter}`, qty, unit, name };
};
const instantiateRows = (rows) => rows.map(([qty, unit, name]) => makeRow(qty, unit, name));

const INITIAL_ROWS = instantiateRows(SAMPLE_RECIPES[0].rows);

const PAN_SHAPES = [
  { id: "round", label: "Round" },
  { id: "square", label: "Square" },
  { id: "rect", label: "Rectangle" },
];

const PAN_PRESETS = {
  in: [
    { label: '6" round', shape: "round", a: "6", b: "" },
    { label: '8" round', shape: "round", a: "8", b: "" },
    { label: '9" round', shape: "round", a: "9", b: "" },
    { label: '8" square', shape: "square", a: "8", b: "" },
    { label: '9" square', shape: "square", a: "9", b: "" },
    { label: "9x13 sheet", shape: "rect", a: "13", b: "9" },
  ],
  cm: [
    { label: "15 cm round", shape: "round", a: "15", b: "" },
    { label: "20 cm round", shape: "round", a: "20", b: "" },
    { label: "23 cm round", shape: "round", a: "23", b: "" },
    { label: "20 cm square", shape: "square", a: "20", b: "" },
    { label: "23 cm square", shape: "square", a: "23", b: "" },
    { label: "33x23 tray", shape: "rect", a: "33", b: "23" },
  ],
};

function panArea(pan) {
  const a = Number(pan.a);
  const b = Number(pan.b);
  if (!Number.isFinite(a) || a <= 0) return 0;
  if (pan.shape === "round") return Math.PI * (a / 2) ** 2;
  if (pan.shape === "square") return a * a;
  if (!Number.isFinite(b) || b <= 0) return 0;
  return a * b;
}

const panLabel = (pan, unit) => {
  if (pan.shape === "round") return `${pan.a || "?"} ${unit} round`;
  if (pan.shape === "square") return `${pan.a || "?"} ${unit} square`;
  return `${pan.a || "?"}x${pan.b || "?"} ${unit} pan`;
};

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function parsePastedLine(line) {
  let cleaned = line.replace(/^[-*•]\s*/, "").trim();
  if (!cleaned) return null;
  cleaned = cleaned.replace(/^(\d+(?:[.,]\d+)?)([a-zA-Z]+)/, "$1 $2");
  const tokens = cleaned.split(/\s+/);
  const qtyTokens = [];
  while (tokens.length && qtyTokens.length < 2 && /^[\d¼½¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞.,/]+$/.test(tokens[0])) {
    qtyTokens.push(tokens.shift());
  }
  let unit = "";
  if (tokens.length) {
    const candidate = tokens[0].toLowerCase().replace(/[.,]$/, "");
    for (const [canonical, aliases] of Object.entries(UNIT_ALIASES)) {
      if (aliases.includes(candidate)) {
        unit = canonical;
        tokens.shift();
        break;
      }
    }
  }
  if (tokens.length && tokens[0].toLowerCase() === "of") tokens.shift();
  const name = tokens.join(" ").trim();
  const qty = qtyTokens.join(" ");
  if (!qty && !name) return null;
  return { qty, unit, name: name || (unit ? "" : cleaned) };
}

function AdvisoryChip({ chip }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
      <AlertTriangle className="h-3 w-3 text-[var(--anslation-ds-danger)]" />
      {chip}
    </span>
  );
}

function PanEditor({ title, pan, onChange, panUnit, idPrefix }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="text-sm font-semibold">{title}</p>
      <label className="mt-2 block" htmlFor={`${idPrefix}-shape`}>
        <span className="text-xs font-semibold text-[var(--muted-foreground)]">Shape</span>
        <select
          id={`${idPrefix}-shape`}
          value={pan.shape}
          onChange={(event) => onChange({ ...pan, shape: event.target.value })}
          className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
        >
          {PAN_SHAPES.map((shape) => (
            <option key={shape.id} value={shape.id}>
              {shape.label}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="block" htmlFor={`${idPrefix}-a`}>
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">
            {pan.shape === "round" ? "Diameter" : pan.shape === "square" ? "Side" : "Length"} ({panUnit})
          </span>
          <input
            id={`${idPrefix}-a`}
            type="number"
            min="0"
            step="0.5"
            value={pan.a}
            onChange={(event) => onChange({ ...pan, a: event.target.value })}
            className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
          />
        </label>
        {pan.shape === "rect" && (
          <label className="block" htmlFor={`${idPrefix}-b`}>
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Width ({panUnit})</span>
            <input
              id={`${idPrefix}-b`}
              type="number"
              min="0"
              step="0.5"
              value={pan.b}
              onChange={(event) => onChange({ ...pan, b: event.target.value })}
              className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            />
          </label>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PAN_PRESETS[panUnit].map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange({ shape: preset.shape, a: preset.a, b: preset.b })}
            className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[11px] font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [scaleMode, setScaleMode] = useState("servings");
  const [recipeName, setRecipeName] = useState(SAMPLE_RECIPES[0].name);
  const [origServings, setOrigServings] = useState(String(SAMPLE_RECIPES[0].servings));
  const [targetServings, setTargetServings] = useState(String(SAMPLE_RECIPES[0].target));
  const [panUnit, setPanUnit] = useState("in");
  const [panFrom, setPanFrom] = useState({ shape: "round", a: "8", b: "" });
  const [panTo, setPanTo] = useState({ shape: "round", a: "9", b: "" });
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [copied, setCopied] = useState(false);

  const factor = useMemo(() => {
    if (scaleMode === "servings") {
      const orig = Number(origServings);
      const target = Number(targetServings);
      if (!Number.isFinite(orig) || !Number.isFinite(target) || orig <= 0 || target <= 0) return 1;
      return target / orig;
    }
    const fromArea = panArea(panFrom);
    const toArea = panArea(panTo);
    if (fromArea <= 0 || toArea <= 0) return 1;
    return toArea / fromArea;
  }, [scaleMode, origServings, targetServings, panFrom, panTo]);

  const modeSummary =
    scaleMode === "servings"
      ? `${origServings || "?"} → ${targetServings || "?"} servings`
      : `${panLabel(panFrom, panUnit)} → ${panLabel(panTo, panUnit)} (by area)`;

  const scaledRows = useMemo(
    () =>
      rows.map((row) => {
        const hasQty = row.qty.trim() !== "";
        const parsed = parseQty(row.qty);
        const scaled = hasQty && Number.isFinite(parsed) ? parsed * factor : NaN;
        return {
          ...row,
          scaled,
          qtyText: hasQty ? formatScaled(scaled, row.unit) : "",
          unitText: row.unit ? unitLabel(row.unit, Number.isFinite(scaled) ? scaled : 1) : "",
          hint: Number.isFinite(scaled) ? upgradeHint(scaled, row.unit) : "",
          advisories: advisoriesFor(row.name),
          parseFailed: hasQty && !Number.isFinite(parsed),
        };
      }),
    [rows, factor]
  );

  const advisoryNotes = useMemo(() => {
    const seen = new Set();
    const notes = [];
    scaledRows.forEach((row) => {
      row.advisories.forEach((rule) => {
        if (seen.has(rule.id)) return;
        seen.add(rule.id);
        notes.push(rule.note);
      });
    });
    if (factor >= 1.5) {
      notes.push(
        "Cooking time does not scale linearly — a bigger batch needs a little longer at the same temperature, not double. Check doneness early and often."
      );
    } else if (factor > 0 && factor <= 0.67) {
      notes.push("Smaller batches cook faster — start checking doneness 20-30% earlier than the original time.");
    }
    if (scaleMode === "pan") {
      notes.push("Pan scaling keeps batter depth the same. If your new pan is deeper or shallower, adjust the bake time.");
    }
    return notes;
  }, [scaledRows, factor, scaleMode]);

  const copyText = useMemo(() => {
    const lines = [`${recipeName.trim() || "Scaled recipe"} — x${trimNumber(factor)}`, modeSummary, ""];
    scaledRows.forEach((row) => {
      if (!row.name.trim() && !row.qtyText) return;
      const qtyPart = row.qtyText ? `${row.qtyText} ` : "";
      const unitPart = row.unitText ? `${row.unitText} ` : "";
      lines.push(`- ${qtyPart}${unitPart}${row.name}${row.hint ? ` (${row.hint})` : ""}`.trim());
    });
    if (advisoryNotes.length) {
      lines.push("", "Watch-outs:");
      advisoryNotes.forEach((note) => lines.push(`- ${note}`));
    }
    lines.push("", `Generated with ALTFTool Recipe Scaler · ${new Date().toLocaleString()}`);
    return lines.join("\n");
  }, [recipeName, factor, modeSummary, scaledRows, advisoryNotes]);

  const updateRow = (id, patch) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const addRow = () => {
    setRows((prev) => [...prev, makeRow("", "", "")]);
  };

  const applySample = (sample) => {
    setRecipeName(sample.name);
    setScaleMode("servings");
    setOrigServings(String(sample.servings));
    setTargetServings(String(sample.target));
    setRows(instantiateRows(sample.rows));
  };

  const parsePasted = () => {
    const parsed = pasteText
      .split("\n")
      .map(parsePastedLine)
      .filter(Boolean)
      .map((item) => makeRow(item.qty, item.unit, item.name));
    if (!parsed.length) return;
    setRows((prev) => {
      const nonEmpty = prev.filter((row) => row.qty.trim() || row.name.trim());
      return [...nonEmpty, ...parsed];
    });
    setPasteText("");
    setShowPaste(false);
  };

  const copyRecipe = async () => {
    const success = await safeCopyText(copyText);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const multiplyServings = (multiplier) => {
    const orig = Number(origServings);
    if (!Number.isFinite(orig) || orig <= 0) return;
    const next = orig * multiplier;
    setTargetServings(String(Math.round(next * 100) / 100));
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ChefHat className="h-4 w-4" />
            Kitchen helper
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Recipe Scaler & Serving Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Resize any recipe by servings or pan size. Get fraction-friendly amounts, smarter unit suggestions, and
            honest warnings about the things that never scale 1:1 — salt, spices, and leavening.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[400px_1fr]">
          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "servings", label: "By servings", icon: Users },
                  { id: "pan", label: "By pan size", icon: Scaling },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScaleMode(item.id)}
                    className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-3 text-sm font-semibold transition ${
                      scaleMode === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              {scaleMode === "servings" ? (
                <div className="mt-5 grid gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block" htmlFor="orig-servings">
                      <span className="text-sm font-semibold">Original servings</span>
                      <input
                        id="orig-servings"
                        type="number"
                        min="0"
                        value={origServings}
                        onChange={(event) => setOrigServings(event.target.value)}
                        className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                    <label className="block" htmlFor="target-servings">
                      <span className="text-sm font-semibold">Target servings</span>
                      <input
                        id="target-servings"
                        type="number"
                        min="0"
                        value={targetServings}
                        onChange={(event) => setTargetServings(event.target.value)}
                        className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Half it", value: 0.5 },
                      { label: "x1.5", value: 1.5 },
                      { label: "Double", value: 2 },
                      { label: "Triple", value: 3 },
                    ].map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onClick={() => multiplyServings(chip.value)}
                        className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">Pan dimensions</span>
                    <div className="inline-flex rounded-md border border-[var(--border)] p-0.5">
                      {["in", "cm"].map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => setPanUnit(unit)}
                          className={`rounded px-3 py-1 text-xs font-semibold transition ${
                            panUnit === unit
                              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "text-[var(--muted-foreground)]"
                          }`}
                        >
                          {unit}
                        </button>
                      ))}
                    </div>
                  </div>
                  <PanEditor title="Original pan" pan={panFrom} onChange={setPanFrom} panUnit={panUnit} idPrefix="pan-from" />
                  <PanEditor title="Target pan" pan={panTo} onChange={setPanTo} panUnit={panUnit} idPrefix="pan-to" />
                  <p className="text-xs leading-5 text-[var(--muted-foreground)]">
                    Scaling uses the pan area ratio, assuming the same batter depth. Round area = π x (d/2)².
                  </p>
                </div>
              )}

              <div className="mt-5 rounded-lg bg-[var(--muted)] p-4" aria-live="polite">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Scale factor</p>
                <p className="mt-1 text-3xl font-semibold text-[var(--primary)]">x{trimNumber(factor)}</p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{modeSummary}</p>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">Sample recipes</span>
                <button
                  type="button"
                  onClick={() => applySample(SAMPLE_RECIPES[0])}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
              <div className="grid gap-2">
                {SAMPLE_RECIPES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => applySample(sample)}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <label className="block min-w-[200px] flex-1" htmlFor="recipe-name">
                  <span className="text-sm font-semibold">Recipe name (optional)</span>
                  <input
                    id="recipe-name"
                    type="text"
                    value={recipeName}
                    onChange={(event) => setRecipeName(event.target.value)}
                    placeholder="e.g. Sunday pancakes"
                    className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPaste((prev) => !prev)}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <ClipboardPaste className="h-4 w-4" />
                    Paste list
                  </button>
                  <button type="button" onClick={addRow} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Plus className="h-4 w-4" />
                    Add row
                  </button>
                </div>
              </div>

              {showPaste && (
                <div className="mt-4 rounded-md border border-[var(--border)] bg-[var(--muted)] p-3">
                  <label className="block" htmlFor="paste-box">
                    <span className="text-sm font-semibold">Paste ingredients — one per line</span>
                    <textarea
                      id="paste-box"
                      rows={5}
                      value={pasteText}
                      onChange={(event) => setPasteText(event.target.value)}
                      placeholder={"2 cups flour\n1 1/2 tsp baking powder\n½ tsp salt\n3 tbsp butter"}
                      className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                    />
                  </label>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Understands fractions (1/2, ½, 1 1/2) and common units (cups, tbsp, tsp, g, ml...).
                    </p>
                    <button type="button" onClick={parsePasted} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                      <ListChecks className="h-4 w-4" />
                      Parse & add
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 overflow-x-auto">
                <div className="min-w-[460px]">
                  <div className="grid grid-cols-[84px_100px_1fr_40px] gap-2 px-1 pb-1 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                    <span>Qty</span>
                    <span>Unit</span>
                    <span>Ingredient</span>
                    <span className="sr-only">Remove</span>
                  </div>
                  <div className="grid gap-2">
                    {rows.map((row, index) => (
                      <div key={row.id} className="grid grid-cols-[84px_100px_1fr_40px] items-center gap-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          aria-label={`Quantity for ingredient ${index + 1}`}
                          value={row.qty}
                          onChange={(event) => updateRow(row.id, { qty: event.target.value })}
                          placeholder="1 1/2"
                          className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                        <select
                          aria-label={`Unit for ingredient ${index + 1}`}
                          value={row.unit}
                          onChange={(event) => updateRow(row.id, { unit: event.target.value })}
                          className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        >
                          {UNITS.map((unit) => (
                            <option key={unit || "none"} value={unit}>
                              {unit || "—"}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          aria-label={`Name for ingredient ${index + 1}`}
                          value={row.name}
                          onChange={(event) => updateRow(row.id, { name: event.target.value })}
                          placeholder="all-purpose flour"
                          className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                        <button
                          type="button"
                          onClick={() => removeRow(row.id)}
                          aria-label={`Remove ingredient ${index + 1}`}
                          className="inline-flex h-11 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {rows.length === 0 && (
                <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                  No ingredients yet — add a row or paste a list to get started.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Scaled recipe · x{trimNumber(factor)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={copyRecipe} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy recipe"}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadTextFile("scaled-recipe.txt", copyText)}
                    className="btn-secondary min-h-9 px-3 py-1.5 text-sm"
                  >
                    <FileDown className="h-4 w-4" />
                    Download
                  </button>
                </div>
              </div>

              <ul className="mt-4 grid gap-2">
                {scaledRows
                  .filter((row) => row.name.trim() || row.qtyText)
                  .map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-wrap items-baseline gap-x-2 gap-y-1 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5"
                    >
                      <span className="text-base font-semibold text-[var(--primary)]">
                        {row.qtyText}
                        {row.unitText ? ` ${row.unitText}` : ""}
                      </span>
                      <span className="text-sm">{row.name}</span>
                      {row.hint && <span className="text-xs text-[var(--muted-foreground)]">{row.hint}</span>}
                      {row.parseFailed && (
                        <span className="text-xs font-semibold text-[var(--anslation-ds-danger)]">check quantity</span>
                      )}
                      {row.advisories.map((rule) => (
                        <AdvisoryChip key={rule.id} chip={rule.chip} />
                      ))}
                    </li>
                  ))}
              </ul>

              {advisoryNotes.length > 0 && (
                <div className="mt-4 rounded-md bg-[var(--muted)] p-4">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="h-4 w-4 text-[var(--anslation-ds-danger)]" />
                    Watch-outs for this scale
                  </p>
                  <ul className="mt-2 grid gap-1.5 text-sm leading-6 text-[var(--muted-foreground)]">
                    {advisoryNotes.map((note) => (
                      <li key={note}>• {note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <p className="inline-flex items-center gap-2 text-sm font-semibold">
            <Info className="h-4 w-4 text-[var(--primary)]" />
            What scales cleanly — and what does not
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            {[
              [
                "Spices & heat",
                "Chilli, pepper, and warm spices compound as batches grow. Scale to ~80% first, taste, then adjust.",
              ],
              [
                "Salt & umami",
                "Salt, soy, and fish sauce read stronger in volume. Add three-quarters of the scaled amount, then season.",
              ],
              [
                "Leavening",
                "Baking powder, soda, and yeast follow surface-and-structure rules, not straight math. Use 75-90% when doubling or more.",
              ],
              [
                "Time & temperature",
                "Keep oven temperature the same and extend time modestly. A doubled cake is deeper, not twice as fast.",
              ],
            ].map(([title, body]) => (
              <div key={title} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
            Pan math worth knowing: an 8-inch round to a 9-inch round is already x1.27, because area grows with the
            square of the diameter. This tool does that area math for you in pan mode.
          </p>
        </section>
      </div>
    </main>
  );
}
