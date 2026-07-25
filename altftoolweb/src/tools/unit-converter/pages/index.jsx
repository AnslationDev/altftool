"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ArrowLeftRight,
  Clock,
  Copy,
  FileDown,
  History,
  ChevronDown,
  Scale,
  Ruler,
  Weight,
  Thermometer,
  TrendingUp,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

// import FAQSection from "./components/FAQs";

import {
  getHistory,
  pushHistory,
  clearHistory,
  removeHistoryItem,
} from "../lib/storage";

import {
  LengthUnits,
  WeightUnits,
  TempUnits,
  LengthFactors,
  WeightFactors,
} from "../lib/constants";
import Features from "../components/Features";

/*-----------------------------------
    Temperature Conversion
------------------------------------*/
const convertTemperature = (value, fromUnit, toUnit) => {
  let celsius = value;

  if (fromUnit === "F") celsius = ((value - 32) * 5) / 9;
  else if (fromUnit === "K") celsius = value - 273.15;

  if (toUnit === "C") return celsius;
  if (toUnit === "F") return (celsius * 9) / 5 + 32;
  if (toUnit === "K") return celsius + 273.15;

  return celsius;
};

/*-----------------------------------
    UNIT LABELS
------------------------------------*/
const unitSymbols = {
  length: {
    m: "m",
    km: "km",
    cm: "cm",
    mm: "mm",
    in: "in",
    ft: "ft",
    yd: "yd",
    mi: "mi",
  },
  weight: { kg: "kg", g: "g", mg: "mg", lb: "lb", oz: "oz", t: "t" },
  temperature: { C: "°C", F: "°F", K: "K" },
};

const getUnitSymbol = (cat, unit) => unitSymbols[cat]?.[unit] || unit || "";

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const categoryUnits = {
  length: LengthUnits,
  weight: WeightUnits,
  temperature: TempUnits,
};

const categoryIcons = {
  length: Ruler,
  weight: Weight,
  temperature: Thermometer,
};

/*-----------------------------------
    MAIN COMPONENT
------------------------------------*/
export default function UnitConverter() {
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState("");
  const [recentConversions, setRecent] = useState([]);
  const [history, setHistoryState] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [copied, setCopied] = useState(false);

  const CategoryIcon = categoryIcons[category];

  /*-----------------------------------
      LOAD HISTORY
  ------------------------------------*/
  useEffect(() => {
    setHistoryState(getHistory());
  }, []);

  /*-----------------------------------
      UPDATE UNITS WHEN CATEGORY CHANGES
  ------------------------------------*/
  useEffect(() => {
    const units = categoryUnits[category];
    if (units.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFromUnit(units[0].value);
      setToUnit(units[1]?.value || units[0].value);
    }
    setInputValue("");
    setResult("");
  }, [category]);

  /*-----------------------------------
      LIVE CONVERSION
  ------------------------------------*/
  useEffect(() => {
    if (!inputValue || !fromUnit || !toUnit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult("");
      return;
    }

    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      setResult("Invalid");
      return;
    }

    try {
      let val;

      if (category === "temperature") {
        val = convertTemperature(num, fromUnit, toUnit);
      } else {
        const factors = category === "length" ? LengthFactors : WeightFactors;
        const base = num * factors[fromUnit];
        val = base / factors[toUnit];
      }

      setResult(val.toFixed(6).replace(/\.?0+$/, ""));
    } catch {
      setResult("Error");
    }
  }, [inputValue, fromUnit, toUnit, category]);

  /*-----------------------------------
      SWAP UNITS
  ------------------------------------*/
  const handleSwap = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);

    if (result && !isNaN(parseFloat(result))) {
      setInputValue(result);
    }
  };

  /*-----------------------------------
      SAVE CONVERSION
  ------------------------------------*/
  const handleConvert = useCallback(() => {
    if (!inputValue || !result || result === "Invalid" || result === "Error")
      return;

    setIsConverting(true);

    const ts = Date.now();
    const rec = {
      id: ts,
      category,
      fromValue: parseFloat(inputValue),
      fromUnit,
      toUnit,
      result,
      ts,
    };

    pushHistory(rec);
    setHistoryState(getHistory());
    setRecent((prev) => [rec, ...prev].slice(0, 5));

    setTimeout(() => setIsConverting(false), 400);
  }, [category, inputValue, fromUnit, toUnit, result]);

  /*-----------------------------------
      CLEAR HISTORY
  ------------------------------------*/
  const handleClearHistory = () => {
    clearHistory();
    setHistoryState([]);
    setRecent([]);
  };

  const handleDeleteHistoryItem = (id) => {
    removeHistoryItem(id);
    setHistoryState(getHistory());
  };

  /*-----------------------------------
      UNITS FOR CURRENT CATEGORY
  ------------------------------------*/
  const units = categoryUnits[category];

  const conversionText = useMemo(
    () =>
      [
        "Unit Converter Result",
        `Category: ${category}`,
        `From: ${inputValue || "0"} ${getUnitSymbol(category, fromUnit)}`,
        `To: ${result || "0"} ${getUnitSymbol(category, toUnit)}`,
        `Generated: ${new Date().toLocaleString()}`,
      ].join("\n"),
    [category, fromUnit, inputValue, result, toUnit]
  );

  const historyReport = useMemo(
    () =>
      [
        "Unit Converter History",
        `Total saved conversions: ${history.length}`,
        "",
        ...[...history].reverse().map(
          (item, index) =>
            `${index + 1}. ${item.fromValue} ${getUnitSymbol(item.category, item.fromUnit)} -> ${item.result} ${getUnitSymbol(item.category, item.toUnit)} (${item.category}, ${new Date(item.ts).toLocaleString()})`
        ),
      ].join("\n"),
    [history]
  );

  const canUseResult = inputValue && result && result !== "Invalid" && result !== "Error";

  const copyConversion = async () => {
    if (!canUseResult) return;
    const success = await safeCopyText(conversionText);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  /*-----------------------------------
      MODERN NATIVE SELECT STYLE
  ------------------------------------*/
  const selectClass =
    "w-full bg-(--background) border border-(--border) text-(--foreground) px-4 py-3 rounded-lg appearance-none focus:outline-none focus:border-(--primary) focus:ring-2 cursor-pointer focus:ring-(--primary)/25 relative";

  /*-----------------------------------
      COMPONENT UI
  ------------------------------------*/
  return (
    <div className="min-h-screen bg-(--muted) text-(--foreground) transition-all">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        {/* HEADER */}
        <header className="mb-12">
          <div className="p-6 flex items-center justify-center gap-4">
            {/* ICON BOX */}
            <div className="p-3 rounded-xl bg-(--primary) h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center shrink-0">
              <Scale className="w-8 h-8 text-white" />
            </div>

            {/* TITLE + SUBTEXT */}
            <div className="flex flex-col justify-center h-16 sm:h-20">
              <h1 className="text-3xl sm:text-6xl font-bold text-(--primary) font-primary leading-none">
                Unit Converter
              </h1>
              <p className="description">
                Precision conversion at your fingertips
              </p>
            </div>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="xl:col-span-2 space-y-6">
            {/* CATEGORY BUTTONS */}
            <div className="bg-(--card) border border-(--border) rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-3 gap-3">
                {["length", "weight", "temperature"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-3 px-2 min-h-[44px] rounded-lg text-xs sm:text-lg sm:font-medium border border-(--border) cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${category === cat
                        ? "bg-(--primary) text-white"
                        : "bg-(--muted) text-(--foreground)"
                      }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* CONVERSION PANEL */}
            <div className="bg-(--card) border border-(--border) rounded-xl shadow-sm">
              <div className="p-6 border-b border-(--border) flex items-center gap-3">
                <div className="p-2 bg-(--primary) rounded-lg">
                  <CategoryIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold">Conversion Panel</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* INPUT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
                  {/* FROM VALUE */}
                  <div className="lg:col-span-2">
                    <label htmlFor="uc-from-value" className="text-sm font-medium">From Value</label>
                    <input
                      id="uc-from-value"
                      type="number"
                      className="w-full cursor-pointer bg-(--background) border border-(--border) rounded-lg px-4 py-3 text-lg outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                  </div>

                  {/* FROM UNIT SELECT */}
                  <div className="w-full">
                    <label htmlFor="uc-from-unit" className="text-sm font-medium">Unit</label>

                    <div className="relative">
                      <select
                        id="uc-from-unit"
                        value={fromUnit}
                        onChange={(e) => setFromUnit(e.target.value)}
                        className={selectClass}
                      >
                        {units.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-(--muted-foreground)">
                        <ChevronDown />
                      </span>
                    </div>
                  </div>

                  {/* SWAP BUTTON */}
                  <div className="flex justify-center lg:justify-end ">
                    <button
                    title="Swap Units"
                      aria-label="Swap units"
                      onClick={handleSwap}
                      className="h-12 w-12 bg-(--primary) hover:opacity-90 text-white rounded-full flex items-center justify-center cursor-pointer transition-transform active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
                    >
                      <ArrowLeftRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* TO VALUE */}
                  <div className="lg:col-span-2">
                    <label htmlFor="uc-to-value" className="text-sm font-medium">To Value</label>
                    <input
                      id="uc-to-value"
                      readOnly
                      value={result}
                      className="w-full bg-(--background) border border-(--border) rounded-lg px-4 py-3 text-lg outline-none focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25"
                    />
                  </div>

                  {/* TO UNIT SELECT */}
                  <div className="w-full">
                    <label htmlFor="uc-to-unit" className="text-sm font-medium ">Unit</label>
                    <div className="relative">
                      <select
                        id="uc-to-unit"
                        value={toUnit}
                        onChange={(e) => setToUnit(e.target.value)}
                        className={selectClass}
                      >
                        {units.map((u) => (
                          <option key={u.value} value={u.value}>
                            {u.label}
                          </option>
                        ))}
                      </select>

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-(--muted-foreground)">
                        <ChevronDown />
                      </span>
                    </div>
                  </div>
                </div>

                {/* RESULT PANEL */}
                <div className="p-4 rounded-xl bg-(--primary)/10 ring-1 ring-(--border)">
                  <div className="font-medium text-(--muted-foreground)">
                    Conversion Result
                  </div>
                  <div className="text-xl font-bold text-(--foreground)">
                    {inputValue || "0"} {getUnitSymbol(category, fromUnit)} →{" "}
                    {result || "0"} {getUnitSymbol(category, toUnit)}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={handleConvert}
                      disabled={!canUseResult || isConverting}
                      className="px-4 py-2 min-h-[44px] rounded-lg bg-(--primary) text-white hover:opacity-90 cursor-pointer transition-transform active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isConverting ? "Saving..." : "Save to History"}
                    </button>
                    <button
                      type="button"
                      onClick={copyConversion}
                      disabled={!canUseResult}
                      className="btn-secondary min-h-10 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied" : "Copy result"}
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadTextFile("unit-conversion-result.txt", conversionText)}
                      disabled={!canUseResult}
                      className="btn-secondary min-h-10 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FileDown className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                </div>

                {/* CLEAR BUTTON */}
                <button
                  onClick={() => {
                    setInputValue("");
                    setResult("");
                  }}
                  className="px-4 py-2 min-h-[44px] rounded-lg border border-(--border) bg-(--background) hover:bg-(--muted) cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* RECENT */}
            <div className="bg-(--card) border border-(--border) rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5" />
                Recent Conversions
              </h3>

              {recentConversions.length === 0 ? (
                <p className="text-(--muted-foreground)">
                  No recent conversions
                </p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto no-scrollbar pr-3">
                  {recentConversions.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg bg-(--muted)">
                      <span className="font-semibold">
                        {c.fromValue} {getUnitSymbol(c.category, c.fromUnit)}
                      </span>
                      <span className="text-(--muted-foreground)"> → </span>
                      <span className="font-semibold text-(--primary)">
                        {c.result} {getUnitSymbol(c.category, c.toUnit)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE — HISTORY */}
          <div className="space-y-6">
            {/* HISTORY */}
            <div className="bg-(--card) border border-(--border) rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <History className="w-5 h-5" /> History
                </span>
                <span className="text-sm text-(--muted-foreground)">
                  {history.length}
                </span>
              </h3>

              {history.length === 0 ? (
                <p className="mt-4 text-(--muted-foreground)">No history yet</p>
              ) : (
                <div>
                  <div className="max-h-100 overflow-y-auto no-scrollbar pr-3 space-y-3 mt-4">
                    {[...history].reverse().map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg bg-(--muted) border border-(--border) relative group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="px-2 py-1 text-xs rounded bg-(--primary)/10 text-(--primary) uppercase">
                            {item.category}
                          </span>

                          <div className="flex items-center gap-3">
                            <span className="text-xs text-(--muted-foreground)">
                              {new Date(item.ts).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            <button
                              onClick={() => handleDeleteHistoryItem(item.id)}
                              aria-label="Delete history entry"
                              className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition motion-reduce:transition-none text-(--danger) cursor-pointer p-2 -m-2 rounded focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 md:focus-visible:opacity-100"
                            >
                              ×
                            </button>
                          </div>
                        </div>

                        <div className="text-sm">
                          <div className="font-semibold text-(--foreground)">
                            {item.fromValue}{" "}
                            {getUnitSymbol(item.category, item.fromUnit)}
                          </div>
                          <div className="flex gap-2">
                            <span className="text-(--muted-foreground)">→</span>
                            <span className="font-semibold text-(--primary)">
                              {item.result}{" "}
                              {getUnitSymbol(item.category, item.toUnit)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => downloadTextFile("unit-converter-history.txt", historyReport)}
                      className="btn-secondary min-h-10 px-3 py-2 text-sm"
                    >
                      <FileDown className="h-4 w-4" />
                      Export History
                    </button>
                    <button
                      onClick={handleClearHistory}
                      className="px-4 py-2 min-h-[44px] rounded-lg bg-(--danger) text-white hover:opacity-90 w-full cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--danger)/35"
                    >
                      Clear All History
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-(--card) border border-(--border) rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-(--muted-foreground)" />{" "}
                Statistics
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-(--muted-foreground)">
                    Total Conversions
                  </span>
                  <span className="font-semibold">{history.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--muted-foreground)">Recent</span>
                  <span className="font-semibold">
                    {recentConversions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features*/}
        <Features />
      </div>
    </div>
  );
}
