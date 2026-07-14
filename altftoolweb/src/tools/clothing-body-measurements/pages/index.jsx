"use client";

import { useMemo, useState, useCallback } from "react";
import {
  Ruler,
  Copy,
  RotateCcw,
  Shirt,
  Heart,
  Baby,
  ArrowLeftRight,
  User,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

/* ============================================================
   DATA
   ============================================================ */

const BODY_PARTS = [
  { id: "chest", label: "Chest", icon: Heart },
  { id: "waist", label: "Waist", icon: Heart },
  { id: "hips", label: "Hips", icon: Heart },
  { id: "inseam", label: "Inseam", icon: Ruler },
  { id: "sleeve", label: "Sleeve", icon: Ruler },
  { id: "neck", label: "Neck", icon: Ruler },
  { id: "shoulder", label: "Shoulder", icon: Ruler },
  { id: "height", label: "Height", icon: User },
];

const CATEGORIES = [
  { id: "body",     label: "Body Measurements", icon: User,  color: "text-teal-600 dark:text-teal-400" },
  { id: "womens",   label: "Women's",           icon: Shirt, color: "text-pink-600 dark:text-pink-400" },
  { id: "mens",     label: "Men's",             icon: Shirt, color: "text-blue-600 dark:text-blue-400" },
  { id: "kids",     label: "Kids'",             icon: Baby,  color: "text-amber-600 dark:text-amber-400" },
];

const WOMENS_SUBS = [
  { id: "tops",     label: "Tops / Blouses" },
  { id: "bottoms",  label: "Bottoms / Pants" },
  { id: "dresses",  label: "Dresses" },
  { id: "jeans",    label: "Jeans" },
  { id: "shoes",    label: "Shoes" },
];

const MENS_SUBS = [
  { id: "shirts",   label: "Shirts" },
  { id: "pants",    label: "Pants / Jeans" },
  { id: "suits",    label: "Suits / Jackets" },
  { id: "shoes",    label: "Shoes" },
];

const KIDS_SUBS = [
  { id: "tops",     label: "Tops / Bottoms" },
  { id: "shoes",    label: "Shoes" },
];

/* ---------- sizing tables ---------- */

const WOMENS_TOPS = {
  systems: ["US Size", "UK Size", "EU Size", "International"],
  rows: [
    { US: "XS (0–2)",  UK: "4–6",  EU: "32–34", INTL: "XS", bust: "31–32", waist: "24–25", hip: "34–35" },
    { US: "S (4–6)",   UK: "8–10", EU: "36–38", INTL: "S",  bust: "33–34", waist: "26–27", hip: "36–37" },
    { US: "M (8–10)",  UK: "12–14", EU: "38–40", INTL: "M", bust: "35–36", waist: "28–29", hip: "38–39" },
    { US: "L (12–14)", UK: "16–18", EU: "42–44", INTL: "L", bust: "37–38", waist: "30–32", hip: "40–42" },
    { US: "XL (16–18)", UK: "20–22", EU: "46–48", INTL: "XL", bust: "39–41", waist: "33–35", hip: "43–45" },
    { US: "XXL (20–22)", UK: "24–26", EU: "50–52", INTL: "XXL", bust: "42–44", waist: "36–38", hip: "46–48" },
  ],
};

const WOMENS_BOTTOMS = {
  systems: ["US Size", "UK Size", "EU Size"],
  rows: [
    { US: "0",  UK: "2",  EU: "30", waist: "24–25", hip: "34–35" },
    { US: "2",  UK: "4",  EU: "32", waist: "25–26", hip: "35–36" },
    { US: "4",  UK: "6",  EU: "34", waist: "26–27", hip: "36–37" },
    { US: "6",  UK: "8",  EU: "36", waist: "27–28", hip: "37–38" },
    { US: "8",  UK: "10", EU: "38", waist: "28–29", hip: "38–39" },
    { US: "10", UK: "12", EU: "40", waist: "29–30", hip: "39–40" },
    { US: "12", UK: "14", EU: "42", waist: "30–32", hip: "40–42" },
    { US: "14", UK: "16", EU: "44", waist: "32–34", hip: "42–44" },
    { US: "16", UK: "18", EU: "46", waist: "34–36", hip: "44–46" },
    { US: "18", UK: "20", EU: "48", waist: "36–38", hip: "46–48" },
  ],
};

const WOMENS_DRESSES = {
  systems: ["US Size", "UK Size", "EU Size", "International"],
  rows: [
    { US: "XS (0–2)",  UK: "4–6",  EU: "32–34", INTL: "XS", bust: "31–32", waist: "24–25", hip: "34–35" },
    { US: "S (4–6)",   UK: "8–10", EU: "36–38", INTL: "S",  bust: "33–34", waist: "26–27", hip: "36–37" },
    { US: "M (8–10)",  UK: "12–14", EU: "38–40", INTL: "M", bust: "35–36", waist: "28–29", hip: "38–39" },
    { US: "L (12–14)", UK: "16–18", EU: "42–44", INTL: "L", bust: "37–38", waist: "30–32", hip: "40–42" },
    { US: "XL (16–18)", UK: "20–22", EU: "46–48", INTL: "XL", bust: "39–41", waist: "33–35", hip: "43–45" },
    { US: "XXL (20–22)", UK: "24–26", EU: "50–52", INTL: "XXL", bust: "42–44", waist: "36–38", hip: "46–48" },
  ],
};

const WOMENS_JEANS = {
  systems: ["US Size", "UK Size", "EU Size"],
  rows: [
    { US: "24", UK: "4",  EU: "30", waist: "24",  hip: "34" },
    { US: "25", UK: "6",  EU: "32", waist: "25",  hip: "35" },
    { US: "26", UK: "8",  EU: "34", waist: "26",  hip: "36" },
    { US: "27", UK: "10", EU: "36", waist: "27",  hip: "37" },
    { US: "28", UK: "12", EU: "38", waist: "28",  hip: "38" },
    { US: "29", UK: "14", EU: "40", waist: "29",  hip: "39" },
    { US: "30", UK: "16", EU: "42", waist: "30",  hip: "40" },
    { US: "31", UK: "18", EU: "44", waist: "31",  hip: "41" },
    { US: "32", UK: "20", EU: "46", waist: "32",  hip: "42" },
  ],
};

const WOMENS_SHOES = {
  systems: ["US", "UK", "EU", "Foot (cm)"],
  rows: [
    { US: "5",   UK: "2.5", EU: "35",   cm: "21.6" },
    { US: "5.5", UK: "3",   EU: "35.5", cm: "22.1" },
    { US: "6",   UK: "3.5", EU: "36",   cm: "22.6" },
    { US: "6.5", UK: "4",   EU: "37",   cm: "23.1" },
    { US: "7",   UK: "4.5", EU: "37.5", cm: "23.6" },
    { US: "7.5", UK: "5",   EU: "38",   cm: "24.1" },
    { US: "8",   UK: "5.5", EU: "38.5", cm: "24.6" },
    { US: "8.5", UK: "6",   EU: "39",   cm: "25.1" },
    { US: "9",   UK: "6.5", EU: "40",   cm: "25.6" },
    { US: "9.5", UK: "7",   EU: "41",   cm: "26.1" },
    { US: "10",  UK: "7.5", EU: "42",   cm: "26.7" },
  ],
};

const MENS_SHIRTS = {
  systems: ["US/UK", "EU", "International"],
  rows: [
    { US: "XS",   EU: "42–44", INTL: "XS", neck: "13.5–14", chest: "32–34", sleeve: "31–32" },
    { US: "S",    EU: "44–46", INTL: "S",  neck: "14–14.5", chest: "34–36", sleeve: "32–33" },
    { US: "M",    EU: "46–48", INTL: "M",  neck: "15–15.5", chest: "36–38", sleeve: "33–34" },
    { US: "L",    EU: "48–50", INTL: "L",  neck: "16–16.5", chest: "38–40", sleeve: "34–35" },
    { US: "XL",   EU: "50–52", INTL: "XL", neck: "17–17.5", chest: "40–42", sleeve: "35–36" },
    { US: "XXL",  EU: "52–54", INTL: "XXL", neck: "18–18.5", chest: "42–44", sleeve: "36–37" },
  ],
};

const MENS_PANTS = {
  systems: ["US/UK", "EU", "International"],
  rows: [
    { US: "28", EU: "42", INTL: "XS", waist: "28", inseam: "30–32" },
    { US: "29", EU: "44", INTL: "S",  waist: "29", inseam: "30–32" },
    { US: "30", EU: "46", INTL: "S",  waist: "30", inseam: "30–32" },
    { US: "31", EU: "46–48", INTL: "M", waist: "31", inseam: "30–34" },
    { US: "32", EU: "48", INTL: "M",  waist: "32", inseam: "30–34" },
    { US: "33", EU: "48–50", INTL: "M", waist: "33", inseam: "30–34" },
    { US: "34", EU: "50", INTL: "L",  waist: "34", inseam: "30–34" },
    { US: "36", EU: "52", INTL: "XL", waist: "36", inseam: "30–34" },
    { US: "38", EU: "54", INTL: "XXL", waist: "38", inseam: "30–34" },
    { US: "40", EU: "56", INTL: "XXL", waist: "40", inseam: "30–34" },
  ],
};

const MENS_SUITS = {
  systems: ["US/UK", "EU", "International"],
  rows: [
    { US: "34", EU: "44", INTL: "XS", chest: "34", waist: "28" },
    { US: "36", EU: "46", INTL: "S",  chest: "36", waist: "30" },
    { US: "38", EU: "48", INTL: "M",  chest: "38", waist: "32" },
    { US: "40", EU: "50", INTL: "L",  chest: "40", waist: "34" },
    { US: "42", EU: "52", INTL: "XL", chest: "42", waist: "36" },
    { US: "44", EU: "54", INTL: "XXL", chest: "44", waist: "38" },
    { US: "46", EU: "56", INTL: "XXL", chest: "46", waist: "40" },
  ],
};

const MENS_SHOES = {
  systems: ["US", "UK", "EU", "Foot (cm)"],
  rows: [
    { US: "6",   UK: "5",   EU: "38",   cm: "23.6" },
    { US: "6.5", UK: "5.5", EU: "38.5", cm: "24.1" },
    { US: "7",   UK: "6",   EU: "39",   cm: "24.6" },
    { US: "7.5", UK: "6.5", EU: "39.5", cm: "25.0" },
    { US: "8",   UK: "7",   EU: "40",   cm: "25.4" },
    { US: "8.5", UK: "7.5", EU: "41",   cm: "25.9" },
    { US: "9",   UK: "8",   EU: "42",   cm: "26.3" },
    { US: "9.5", UK: "8.5", EU: "42.5", cm: "26.8" },
    { US: "10",  UK: "9",   EU: "43",   cm: "27.2" },
    { US: "10.5", UK: "9.5", EU: "43.5", cm: "27.7" },
    { US: "11",  UK: "10",  EU: "44",   cm: "28.1" },
    { US: "12",  UK: "11",  EU: "45",   cm: "29.0" },
    { US: "13",  UK: "12",  EU: "46",   cm: "30.0" },
  ],
};

const KIDS_TOPS = {
  systems: ["Age", "US", "EU", "Height (cm)", "Height (in)"],
  rows: [
    { Age: "0–3M",  US: "0–3M",  EU: "50–56",  cm: "51–56",    inches: "20–22" },
    { Age: "3–6M",  US: "3–6M",  EU: "56–62",  cm: "56–61",    inches: "22–24" },
    { Age: "6–9M",  US: "6–9M",  EU: "62–68",  cm: "61–66",    inches: "24–26" },
    { Age: "9–12M", US: "9–12M", EU: "68–74",  cm: "66–71",    inches: "26–28" },
    { Age: "12–18M", US: "12–18M", EU: "74–80", cm: "71–76",   inches: "28–30" },
    { Age: "18–24M", US: "18–24M", EU: "80–86", cm: "76–81",   inches: "30–32" },
    { Age: "2T",     US: "2T",    EU: "86–92",  cm: "81–86",    inches: "32–34" },
    { Age: "3T",     US: "3T",    EU: "92–98",  cm: "86–91",    inches: "34–36" },
    { Age: "4T",     US: "4T",    EU: "98–104", cm: "91–96",    inches: "36–38" },
    { Age: "5",      US: "5",     EU: "104–110", cm: "96–102",  inches: "38–40" },
    { Age: "6",      US: "6",     EU: "110–116", cm: "102–108", inches: "40–42" },
    { Age: "7",      US: "7",     EU: "116–122", cm: "108–114", inches: "42–44" },
    { Age: "8",      US: "8",     EU: "122–128", cm: "114–120", inches: "44–46" },
    { Age: "10",     US: "10",    EU: "128–134", cm: "120–126", inches: "46–48" },
    { Age: "12",     US: "12",    EU: "134–140", cm: "126–132", inches: "48–50" },
  ],
};

const KIDS_SHOES = {
  systems: ["Age", "US", "UK", "EU", "Foot (cm)"],
  rows: [
    { Age: "0–6M", US: "0–2",   UK: "0–1",   EU: "16–17", cm: "8.3–9.5" },
    { Age: "6–12M", US: "2–4",   UK: "1–2",   EU: "17–19", cm: "9.5–11.0" },
    { Age: "12–18M", US: "4–5",  UK: "2–3",   EU: "19–20", cm: "11.0–12.7" },
    { Age: "18–24M", US: "5–6",  UK: "3–4",   EU: "20–21", cm: "12.7–13.3" },
    { Age: "2–3T",  US: "6–7",   UK: "4–5",   EU: "21–22", cm: "13.3–14.0" },
    { Age: "3–4T",  US: "7–8",   UK: "5–6",   EU: "22–23", cm: "14.0–14.7" },
    { Age: "4–5",   US: "8–9",   UK: "6–7",   EU: "23–24", cm: "14.7–15.3" },
    { Age: "5–6",   US: "9–10",  UK: "7–8",   EU: "24–25", cm: "15.3–16.0" },
    { Age: "6–7",   US: "10–11", UK: "8–9",   EU: "25–26", cm: "16.0–16.7" },
    { Age: "7–8",   US: "11–12", UK: "9–10",  EU: "26–27", cm: "16.7–17.3" },
    { Age: "8–9",   US: "12–13", UK: "10–11", EU: "27–28", cm: "17.3–18.0" },
    { Age: "9–10",  US: "13–1",  UK: "11–12", EU: "28–29", cm: "18.0–18.7" },
    { Age: "10–11", US: "1–2",   UK: "12–13", EU: "29–30", cm: "18.7–19.3" },
    { Age: "11–12", US: "2–3",   UK: "13–1",  EU: "30–31", cm: "19.3–20.0" },
  ],
};

/* ---------- table lookup ---------- */

const TABLE_MAP = {
  womens: { tops: WOMENS_TOPS, bottoms: WOMENS_BOTTOMS, dresses: WOMENS_DRESSES, jeans: WOMENS_JEANS, shoes: WOMENS_SHOES },
  mens:   { shirts: MENS_SHIRTS, pants: MENS_PANTS, suits: MENS_SUITS, shoes: MENS_SHOES },
  kids:   { tops: KIDS_TOPS, shoes: KIDS_SHOES },
};

const SUBS_MAP = { womens: WOMENS_SUBS, mens: MENS_SUBS, kids: KIDS_SUBS };

/* ============================================================
   HELPERS
   ============================================================ */

function convertBodyMeasurement(value, fromUnit, toUnit) {
  const num = parseFloat(value);
  if (isNaN(num)) return "";
  if (fromUnit === toUnit) return value;
  if (fromUnit === "in" && toUnit === "cm") return (num * 2.54).toFixed(1);
  if (fromUnit === "cm" && toUnit === "in") return (num / 2.54).toFixed(1);
  if (fromUnit === "in" && toUnit === "ftin") {
    const ft = Math.floor(num / 12);
    const inch = Math.round(num % 12);
    return `${ft}′ ${inch}″`;
  }
  if (fromUnit === "cm" && toUnit === "ftin") {
    const totalIn = num / 2.54;
    const ft = Math.floor(totalIn / 12);
    const inch = Math.round(totalIn % 12);
    return `${ft}′ ${inch}″`;
  }
  if (fromUnit === "ftin" && toUnit === "in") {
    const match = value.match(/(\d+)\s*['′]\s*(\d+)\s*["″]?/);
    if (match) return String(Number(match[1]) * 12 + Number(match[2]));
    return value;
  }
  if (fromUnit === "ftin" && toUnit === "cm") {
    const match = value.match(/(\d+)\s*['′]\s*(\d+)\s*["″]?/);
    if (match) return ((Number(match[1]) * 12 + Number(match[2])) * 2.54).toFixed(1);
    return value;
  }
  return value;
}

function findRow(table, systemKey, value) {
  if (!table || !value) return null;
  const normalized = value.trim().toLowerCase();
  return table.rows.find((row) => {
    const cell = String(row[systemKey] || "").toLowerCase();
    return cell === normalized || cell.startsWith(normalized) || normalized.startsWith(cell);
  }) || null;
}

/* ============================================================
   COMPONENTS
   ============================================================ */

function BodyMeasurementPanel() {
  const [bodyPart, setBodyPart] = useState("chest");
  const [fromUnit, setFromUnit] = useState("in");
  const [toUnit, setToUnit] = useState("cm");
  const [value, setValue] = useState("34");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convertBodyMeasurement(value, fromUnit, toUnit), [value, fromUnit, toUnit]);

  const copyResult = useCallback(async () => {
    const text = `${value} ${fromUnit} = ${result} ${toUnit}`;
    const ok = await safeCopyText(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1200); }
  }, [value, result, fromUnit, toUnit]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {BODY_PARTS.map((bp) => (
          <button
            key={bp.id}
            type="button"
            onClick={() => setBodyPart(bp.id)}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
              bodyPart === bp.id
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
            }`}
          >
            <bp.icon className="h-3.5 w-3.5" />
            {bp.label}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">From</label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 font-mono text-lg outline-none transition-colors focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="h-12 w-28 appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm outline-none transition-colors focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            >
              <option value="in">in</option>
              <option value="cm">cm</option>
              <option value="ftin">ft+in</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-center pt-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)]">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">To</label>
          <div className="flex gap-2">
            <input
              readOnly
              value={result}
              placeholder="—"
              className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--muted)] px-4 font-mono text-lg outline-none"
            />
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="h-12 w-28 appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm outline-none transition-colors focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            >
              <option value="in">in</option>
              <option value="cm">cm</option>
              <option value="ftin">ft+in</option>
            </select>
          </div>
        </div>
      </div>
      {result && (
        <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{bodyPart} measurement</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">
              {value} {fromUnit} <span className="text-[var(--muted-foreground)]">=</span> {result} {toUnit}
            </p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}

function SizeConversionPanel({ gender, sub, table }) {
  const systems = table?.systems || [];
  const [fromSys, setFromSys] = useState(systems[0] || "");
  const [toSys, setToSys] = useState(systems[1] || systems[0] || "");
  const [selectedSize, setSelectedSize] = useState("");
  const [copied, setCopied] = useState(false);

  const sizes = useMemo(() => {
    if (!table || !fromSys) return [];
    return table.rows.map((r) => r[fromSys]).filter(Boolean);
  }, [table, fromSys]);

  const matchedRow = useMemo(() => {
    if (!table || !selectedSize) return null;
    return findRow(table, fromSys, selectedSize);
  }, [table, fromSys, selectedSize]);

  const result = matchedRow ? matchedRow[toSys] || "—" : "—";

  const bodyKeys = useMemo(() => {
    if (!matchedRow) return [];
    return Object.keys(matchedRow).filter((k) => !systems.includes(k));
  }, [matchedRow, systems]);

  const copyResult = useCallback(async () => {
    const fromVal = `${selectedSize} ${fromSys}`;
    const toVal = `${result} ${toSys}`;
    const extras = bodyKeys.map((k) => `${k}: ${matchedRow[k]}`).join(", ");
    const text = `${sub}: ${fromVal} = ${toVal}${extras ? ` (${extras})` : ""}`;
    const ok = await safeCopyText(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1200); }
  }, [selectedSize, fromSys, result, toSys, bodyKeys, matchedRow, sub]);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr]">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">From system</label>
          <div className="flex gap-2">
            <select
              value={fromSys}
              onChange={(e) => { setFromSys(e.target.value); setSelectedSize(""); }}
              className="h-12 flex-1 appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm outline-none transition-colors focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
            >
              {systems.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-center pt-6">
          <button
            type="button"
            onClick={() => { setFromSys(toSys); setToSys(fromSys); setSelectedSize(""); }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted-foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">To system</label>
          <select
            value={toSys}
            onChange={(e) => setToSys(e.target.value)}
            className="h-12 w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm outline-none transition-colors focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
          >
            {systems.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Your size ({fromSys})</label>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSelectedSize(s)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                selectedSize === s
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
                  : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {matchedRow && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Converted size</p>
              <p className="mt-2 text-3xl font-semibold leading-snug text-[var(--foreground)]">
                {selectedSize} <span className="text-base font-normal text-[var(--muted-foreground)]">{fromSys}</span>
                {" "}
                <span className="text-xl text-[var(--muted-foreground)]">→</span>{" "}
                {result} <span className="text-[var(--primary)]">{toSys}</span>
              </p>
              {bodyKeys.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--muted-foreground)]">
                  {bodyKeys.map((k) => (
                    <span key={k} className="font-medium">
                      {k.charAt(0).toUpperCase() + k.slice(1)}: {matchedRow[k]}
                      {k === "chest" || k === "bust" || k === "waist" || k === "hip" || k === "inseam" || k === "sleeve" || k === "neck" ? " in" : ""}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={copyResult}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              {systems.map((s) => (
                <th key={s} className="whitespace-nowrap px-4 py-3 font-semibold text-[var(--muted-foreground)]">{s}</th>
              ))}
              {table && Object.keys(table.rows[0] || {}).filter((k) => !systems.includes(k)).map((k) => (
                <th key={k} className="whitespace-nowrap px-4 py-3 font-semibold text-[var(--muted-foreground)]">
                  {k.charAt(0).toUpperCase() + k.slice(1)} (in)
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table?.rows.map((row, i) => (
              <tr
                key={i}
                className={`border-b border-[var(--border)] transition-colors ${
                  matchedRow === row ? "bg-[var(--primary)]/5" : "hover:bg-[var(--muted)]"
                }`}
              >
                {systems.map((s) => (
                  <td key={s} className={`whitespace-nowrap px-4 py-2.5 font-medium ${
                    matchedRow === row && (s === fromSys || s === toSys) ? "text-[var(--primary)]" : "text-[var(--foreground)]"
                  }`}>
                    {row[s] || "—"}
                  </td>
                ))}
                {Object.keys(row).filter((k) => !systems.includes(k)).map((k) => (
                  <td key={k} className="whitespace-nowrap px-4 py-2.5 text-[var(--muted-foreground)]">{row[k]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN
   ============================================================ */

export default function ToolHome() {
  const [category, setCategory] = useState("body");
  const [womensSub, setWomensSub] = useState("tops");
  const [mensSub, setMensSub] = useState("shirts");
  const [kidsSub, setKidsSub] = useState("tops");

  const activeSub = category === "womens" ? womensSub : category === "mens" ? mensSub : kidsSub;
  const setActiveSub = category === "womens" ? setWomensSub : category === "mens" ? setMensSub : setKidsSub;
  const subs = SUBS_MAP[category] || [];
  const table = TABLE_MAP[category]?.[activeSub] || null;

  const catColor = CATEGORIES.find((c) => c.id === category)?.color || "text-teal-600";
  const CatIcon = CATEGORIES.find((c) => c.id === category)?.icon || Ruler;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Ruler className="h-4 w-4" />
            Fashion &amp; Body
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Clothing / Body Measurement Conversions</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Convert clothing sizes between US, UK, EU, and international standards for women, men, and kids. 
            Also convert body measurements between inches, centimeters, and feet+inches.
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>

        {category !== "body" && subs.length > 0 && (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--foreground)]">Clothing type</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                {table?.rows.length || 0} sizes
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {subs.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSub(s.id)}
                  className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all ${
                    activeSub === s.id
                      ? "bg-[var(--primary)] text-white shadow-sm"
                      : "border border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="mb-3 flex items-center gap-2.5">
            <div className={`rounded-lg p-1.5 ${catColor.replace("text", "bg")}/10`}>
              <CatIcon className={`h-4 w-4 ${catColor}`} />
            </div>
            <span className="text-sm font-semibold text-[var(--foreground)]">
              {category === "body" ? "Body Measurements" : `${CATEGORIES.find((c) => c.id === category)?.label} · ${subs.find((s) => s.id === activeSub)?.label}`}
            </span>
          </div>
          {category === "body" ? (
            <BodyMeasurementPanel />
          ) : (
            <SizeConversionPanel gender={category} sub={subs.find((s) => s.id === activeSub)?.label || ""} table={table} />
          )}
        </section>
      </div>
    </main>
  );
}
