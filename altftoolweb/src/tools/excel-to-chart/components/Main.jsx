"use client";

import React, { useState, useRef, useMemo } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  BarChart3,
  Settings2,
  RefreshCw,
  Table,
  Image,
  FileCode,
  Check,
  Play,
  Grid3X3,
  X,
  TrendingUp,
  PieChart as PieIcon,
  Activity,
  Sliders,
  Calendar,
  Layers,
} from "lucide-react";
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import SafeResponsiveContainer from "@/components/charts/SafeResponsiveContainer";

const SUPPORTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

// Premium Harmonious Color Palettes
const PALETTES = {
  "teal-cyan": {
    name: "Teal & Cyan (Corporate)",
    colors: ["#14B8A6", "#06B6D4", "#6366F1", "#F59E0B", "#EF4444", "#10B981"],
  },
  sunset: {
    name: "Sunset Gradient",
    colors: ["#F59E0B", "#F97316", "#EF4444", "#EC4899", "#8B5CF6", "#3B82F6"],
  },
  emerald: {
    name: "Emerald Forest",
    colors: ["#10B981", "#059669", "#34D399", "#A7F3D0", "#047857", "#065F46"],
  },
  royal: {
    name: "Royal Purple",
    colors: ["#8B5CF6", "#D946EF", "#A78BFA", "#F472B6", "#7C3AED", "#C084FC"],
  },
};

// Helper: Excel Serial Date to ISO Date String
const formatExcelDate = (val, headerName = "") => {
  const normalizedHeader = String(headerName).toLowerCase();
  const isDateHeader = normalizedHeader.includes("date") || normalizedHeader.includes("month") || normalizedHeader.includes("year") || normalizedHeader.includes("time") || normalizedHeader.includes("day");
  
  if (typeof val === "number" && val > 30000 && val < 60000 && isDateHeader) {
    try {
      const utc_days = Math.floor(val - 25569);
      const utc_value = utc_days * 86400;
      const date = new Date(utc_value * 1000);
      return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    } catch (_) {
      return val;
    }
  }
  return val;
};

export default function MainComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [sheets, setSheets] = useState([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [parsedData, setParsedData] = useState(null);
  const [headers, setHeaders] = useState([]);

  // Chart settings
  const [xAxisCol, setXAxisCol] = useState("");
  const [yAxisCols, setYAxisCols] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [colorPalette, setColorPalette] = useState("teal-cyan");
  const [chartTitle, setChartTitle] = useState("Corporate Data Analysis");
  const [chartSubtitle, setChartSubtitle] = useState("Interactive spreadsheet visualizer");
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [curveSmooth, setCurveSmooth] = useState(true);
  const [stacked, setStacked] = useState(false);

  const fileInputRef = useRef(null);
  const chartContainerRef = useRef(null);

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    const filename = file.name;
    const extension = filename.slice(filename.lastIndexOf(".")).toLowerCase();

    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      setError(`Unsupported file format: ${filename}. Please upload .xlsx, .xls or .csv.`);
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (extension === ".csv") {
        const Papa = await import("papaparse");
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target.result;
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
              if (results.data && results.data.length > 0) {
                const sheetHeaders = Object.keys(results.data[0]);
                const cleanedData = results.data.map((row) => {
                  const newRow = {};
                  sheetHeaders.forEach((h) => {
                    let val = row[h];
                    if (typeof val === "string") {
                      val = val.trim();
                    }
                    newRow[h] = formatExcelDate(val, h);
                  });
                  return newRow;
                });
                setSheets([{ name: "CSV Data", data: cleanedData }]);
                setCurrentSheetIndex(0);
                setParsedData(cleanedData);
                setHeaders(sheetHeaders);
                guessMapping(sheetHeaders, cleanedData);
                setSuccessMsg(`Loaded CSV: ${filename}`);
              } else {
                setError("Empty CSV file.");
              }
              setLoading(false);
            },
            error: (err) => {
              setError(`CSV Parse Error: ${err.message}`);
              setLoading(false);
            },
          });
        };
        reader.readAsText(file);
      } else {
        const XLSX = await import("xlsx");
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            if (!workbook.SheetNames.length) {
              setError("No sheets found in Excel file.");
              setLoading(false);
              return;
            }

            const parsedSheets = workbook.SheetNames.map((sheetName) => {
              const sheet = workbook.Sheets[sheetName];
              const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
              return { name: sheetName, data: json };
            });

            const activeSheet = parsedSheets[0];
            if (!activeSheet.data || !activeSheet.data.length) {
              setError(`No records found in sheet: "${activeSheet.name}"`);
              setSheets(parsedSheets);
              setLoading(false);
              return;
            }

            const sheetHeaders = Object.keys(activeSheet.data[0]);
            // Format spreadsheet cells
            const formattedData = activeSheet.data.map((row) => {
              const newRow = {};
              sheetHeaders.forEach((h) => {
                newRow[h] = formatExcelDate(row[h], h);
              });
              return newRow;
            });

            setSheets(parsedSheets);
            setCurrentSheetIndex(0);
            setParsedData(formattedData);
            setHeaders(sheetHeaders);
            guessMapping(sheetHeaders, formattedData);
            setSuccessMsg(`Loaded Workbook: ${filename}`);
          } catch (err) {
            setError(`Excel Parse Error: ${err.message}`);
          }
          setLoading(false);
        };
        reader.readAsArrayBuffer(file);
      }
    } catch (err) {
      setError(`Failed to read file: ${err.message}`);
      setLoading(false);
    }
  };

  const handleSheetChange = (idx) => {
    setCurrentSheetIndex(idx);
    const selectedSheet = sheets[idx];
    if (selectedSheet && selectedSheet.data && selectedSheet.data.length) {
      const newHeaders = Object.keys(selectedSheet.data[0]);
      const formattedData = selectedSheet.data.map((row) => {
        const newRow = {};
        newHeaders.forEach((h) => {
          newRow[h] = formatExcelDate(row[h], h);
        });
        return newRow;
      });
      setParsedData(formattedData);
      setHeaders(newHeaders);
      guessMapping(newHeaders, formattedData);
    } else {
      setParsedData(null);
      setHeaders([]);
    }
  };

  const guessMapping = (allHeaders, rows) => {
    if (!allHeaders.length || !rows.length) return;

    const numericCols = [];
    const textCols = [];

    allHeaders.forEach((h) => {
      let numericCount = 0;
      let nonNumericCount = 0;
      rows.slice(0, 5).forEach((row) => {
        const val = row[h];
        if (val === "" || val === null || val === undefined) return;
        const cleanedStr = String(val).replace(/[^0-9.-]+/g, "");
        const num = Number(cleanedStr);
        if (!isNaN(num) && cleanedStr !== "") {
          numericCount++;
        } else {
          nonNumericCount++;
        }
      });

      if (numericCount > nonNumericCount) {
        numericCols.push(h);
      } else {
        textCols.push(h);
      }
    });

    const xGuess = textCols.length ? textCols[0] : allHeaders[0];
    setXAxisCol(xGuess);

    const yGuesses = numericCols.filter((c) => c !== xGuess);
    if (yGuesses.length) {
      setYAxisCols(yGuesses.slice(0, 4));
    } else {
      const fallbackY = allHeaders.filter((c) => c !== xGuess);
      setYAxisCols(fallbackY.slice(0, 1));
    }
  };

  const handleYAxisToggle = (col) => {
    if (yAxisCols.includes(col)) {
      setYAxisCols(yAxisCols.filter((c) => c !== col));
    } else {
      setYAxisCols([...yAxisCols, col]);
    }
  };

  const getPaletteColors = () => {
    return PALETTES[colorPalette]?.colors || PALETTES["teal-cyan"].colors;
  };

  const getSeriesColor = (seriesName, index) => {
    const colors = getPaletteColors();
    return colors[index % colors.length];
  };

  // Safe client-side clean conversion to number or null
  const chartData = useMemo(() => {
    if (!parsedData) return [];
    return parsedData.map((row) => {
      const newRow = { ...row };
      yAxisCols.forEach((yCol) => {
        if (row[yCol] !== undefined && row[yCol] !== null && row[yCol] !== "") {
          // Strip commas, currencies, spaces
          const cleanedVal = String(row[yCol]).replace(/[^0-9.-]+/g, "");
          const num = Number(cleanedVal);
          newRow[yCol] = isNaN(num) ? null : num;
        } else {
          newRow[yCol] = null;
        }
      });
      return newRow;
    });
  }, [parsedData, yAxisCols]);

  const downloadPNG = async () => {
    const htmlToImage = await import("html-to-image");
    if (chartContainerRef.current) {
      const isDark = document.documentElement.classList.contains("dark");
      const bgColor = isDark ? "#0B1329" : "#F8FAFC"; // Slate canvas background matching theme
      htmlToImage
        .toPng(chartContainerRef.current, {
          backgroundColor: bgColor,
          style: {
            padding: "24px",
          },
        })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.download = `${chartTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "chart"}.png`;
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          setError(`PNG export failed: ${err.message}`);
        });
    }
  };

  const downloadSVG = () => {
    if (chartContainerRef.current) {
      const svgEl = chartContainerRef.current.querySelector("svg");
      if (!svgEl) {
        setError("Could not extract vector SVG elements.");
        return;
      }
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgEl);
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      source = '<?xml version="1.0" encoding="utf-8"?>\n' + source;
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
      const link = document.createElement("a");
      link.download = `${chartTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "chart"}.svg`;
      link.href = url;
      link.click();
    }
  };

  const copyJSON = () => {
    if (!parsedData) return;
    try {
      const dataStr = JSON.stringify(parsedData, null, 2);
      navigator.clipboard.writeText(dataStr);
      setSuccessMsg("Copied parsed JSON array to clipboard!");
    } catch (_) {
      setError("Clipboard copy failed.");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      {/* Dynamic Intro */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
          Excel to Chart Converter
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Upload spreadsheets or CSV files to dynamically map columns, visualize numeric trends, and export executive-ready charts.
        </p>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-600 hover:text-red-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-600 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main interactive block */}
      {!parsedData ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-16 md:p-24 text-center cursor-pointer transition-all duration-300 bg-gradient-to-br from-(--surface) to-(--surface-soft) shadow-sm hover:shadow-lg hover:scale-[1.005] ${
            dragActive
              ? "border-teal-500 bg-teal-500/10"
              : "border-teal-500/30 hover:border-teal-500/60"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-6 animate-pulse">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-(--foreground)">Drag & drop spreadsheet data here</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
            Supports corporate workbooks (.xlsx, .xls) and standard text exports (.csv) up to 10MB
          </p>
          <button className="mt-6 inline-flex items-center justify-center px-8 py-3 border border-transparent rounded-lg text-sm font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md hover:shadow-lg transition-all cursor-pointer">
            Browse Files
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          {/* Horizontal Chart Configuration Banner */}
          <div className="w-full bg-(--surface) rounded-xl border border-(--border) p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-(--border) pb-4">
              <h3 className="font-bold text-(--foreground) flex items-center gap-2">
                <Settings2 className="h-4.5 w-4.5 text-teal-500" /> Chart Configuration
              </h3>
              <button
                onClick={() => {
                  setParsedData(null);
                  setSheets([]);
                  setYAxisCols([]);
                  setSuccessMsg("");
                }}
                className="text-xs text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer transition-colors"
              >
                Clear Data
              </button>
            </div>

            {/* Cleaned headers list filtering out empty spreadsheet artifacts */}
            {(() => {
              const visibleHeaders = headers.filter(h => h && !String(h).startsWith("__EMPTY"));
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Col 1: Chart Type (3/12 cols) */}
                  <div className="lg:col-span-3 space-y-3">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="h-3 w-3 text-teal-500" /> Chart Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "bar", name: "Bar", icon: BarChart3 },
                        { id: "line", name: "Line", icon: TrendingUp },
                        { id: "area", name: "Area", icon: Layers },
                        { id: "pie", name: "Pie", icon: PieIcon },
                        { id: "radar", name: "Radar", icon: Activity },
                        { id: "scatter", name: "Scatter", icon: Grid3X3 },
                      ].map((t) => {
                        const Icon = t.icon;
                        return (
                          <button
                            key={t.id}
                            onClick={() => setChartType(t.id)}
                            className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                              chartType === t.id
                                ? "bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 font-bold"
                                : "bg-(--page) border-(--border) text-(--foreground) hover:border-teal-500/30"
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0 text-teal-500" />
                            <span>{t.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Col 2: Worksheet & X-Axis Mapping (3/12 cols) */}
                  <div className="lg:col-span-3 space-y-4">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-teal-500" /> Axis Source
                    </label>
                    
                    {sheets.length > 1 && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Worksheet</span>
                        <select
                          value={currentSheetIndex}
                          onChange={(e) => handleSheetChange(Number(e.target.value))}
                          className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2.5 outline-none focus:border-teal-500 cursor-pointer"
                        >
                          {sheets.map((sheet, idx) => (
                            <option key={sheet.name} value={idx}>
                              {sheet.name} ({sheet.data.length} rows)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">X-Axis Column</span>
                      <select
                        value={xAxisCol}
                        onChange={(e) => setXAxisCol(e.target.value)}
                        className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2.5 outline-none focus:border-teal-500 cursor-pointer"
                      >
                        {visibleHeaders.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Col 3: Y-Axis Target Columns (3/12 cols) */}
                  <div className="lg:col-span-3 space-y-3">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="h-3 w-3 text-teal-500" /> Value Series (Y-Axis)
                    </label>
                    <div className="max-h-[140px] overflow-y-auto border border-(--border) rounded-lg p-2 bg-(--page) space-y-1.5 shadow-inner">
                      {visibleHeaders.map((h) => (
                        <label
                          key={h}
                          className="flex items-center gap-2 text-xs text-(--foreground) cursor-pointer hover:bg-(--surface-soft) p-1.5 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={yAxisCols.includes(h)}
                            onChange={() => handleYAxisToggle(h)}
                            disabled={xAxisCol === h}
                            className="rounded border-(--border) text-teal-600 focus:ring-teal-500 h-3.5 w-3.5 cursor-pointer"
                          />
                          <span className="truncate">{h}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Col 4: Heading, Theme & Toggles (3/12 cols) */}
                  <div className="lg:col-span-3 space-y-4">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="h-3 w-3 text-teal-500" /> Options
                    </label>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Title</span>
                        <input
                          type="text"
                          value={chartTitle}
                          onChange={(e) => setChartTitle(e.target.value)}
                          className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2.5 outline-none focus:border-teal-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Palette</span>
                        <select
                          value={colorPalette}
                          onChange={(e) => setColorPalette(e.target.value)}
                          className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2.5 outline-none focus:border-teal-500 cursor-pointer"
                        >
                          {Object.keys(PALETTES).map((pk) => (
                            <option key={pk} value={pk}>
                              {PALETTES[pk].name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-(--border) text-xs text-slate-700 dark:text-slate-300">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={showGrid}
                          onChange={(e) => setShowGrid(e.target.checked)}
                          className="rounded border-(--border) text-teal-600 focus:ring-teal-500 h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>Grid</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-semibold">
                        <input
                          type="checkbox"
                          checked={showLegend}
                          onChange={(e) => setShowLegend(e.target.checked)}
                          className="rounded border-(--border) text-teal-600 focus:ring-teal-500 h-3.5 w-3.5 cursor-pointer"
                        />
                        <span>Legend</span>
                      </label>
                      {chartType === "line" && (
                        <label className="flex items-center gap-2 cursor-pointer col-span-2 font-semibold">
                          <input
                            type="checkbox"
                            checked={curveSmooth}
                            onChange={(e) => setCurveSmooth(e.target.checked)}
                            className="rounded border-(--border) text-teal-600 focus:ring-teal-500 h-3.5 w-3.5 cursor-pointer"
                          />
                          <span>Smooth Curves</span>
                        </label>
                      )}
                      {(chartType === "bar" || chartType === "area") && yAxisCols.length > 1 && (
                        <label className="flex items-center gap-2 cursor-pointer col-span-2 font-semibold">
                          <input
                            type="checkbox"
                            checked={stacked}
                            onChange={(e) => setStacked(e.target.checked)}
                            className="rounded border-(--border) text-teal-600 focus:ring-teal-500 h-3.5 w-3.5 cursor-pointer"
                          />
                          <span>Stack Values</span>
                        </label>
                      )}
                    </div>
                  </div>

                </div>
              );
            })()}
          </div>

          {/* Corporate Data Analysis / Live Chart Preview Section */}
          <div className="bg-(--surface) rounded-xl border border-(--border) p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-(--border) pb-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-(--foreground)">{chartTitle}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{chartSubtitle}</p>
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button
                  onClick={downloadPNG}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-(--border) hover:border-teal-500 rounded-lg text-xs font-semibold text-(--foreground) transition-colors bg-(--page) cursor-pointer"
                >
                  <Image className="h-3.5 w-3.5 text-teal-500" alt="" /> PNG
                </button>
                <button
                  onClick={downloadSVG}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-(--border) hover:border-teal-500 rounded-lg text-xs font-semibold text-(--foreground) transition-colors bg-(--page) cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 text-teal-500" /> SVG
                </button>
                <button
                  onClick={copyJSON}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-(--border) hover:border-teal-500 rounded-lg text-xs font-semibold text-(--foreground) transition-colors bg-(--page) cursor-pointer"
                >
                  <FileCode className="h-3.5 w-3.5 text-teal-500" /> JSON Data
                </button>
              </div>
            </div>

            <div ref={chartContainerRef} className="h-96 w-full rounded-lg bg-(--canvas) p-4 flex items-center justify-center border border-(--border) shadow-inner">
              {yAxisCols.length === 0 ? (
                <div className="text-center text-slate-400 text-sm flex flex-col items-center">
                  <Grid3X3 className="h-8 w-8 text-teal-500/40 mb-2 animate-bounce" />
                  <span>Please select one or more series in the settings above.</span>
                </div>
              ) : chartType === "pie" ? (
                <SafeResponsiveContainer minHeight={300} width="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      dataKey={yAxisCols[0]}
                      nameKey={xAxisCol}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getSeriesColor(entry[xAxisCol], index)}
                        />
                      ))}
                    </Pie>
                    {showLegend && <Legend verticalAlign="bottom" height={36} />}
                    <RechartsTooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)" }} />
                  </PieChart>
                </SafeResponsiveContainer>
              ) : chartType === "radar" ? (
                <SafeResponsiveContainer minHeight={320} width="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey={xAxisCol} stroke="var(--muted-foreground)" fontSize={11} />
                    <PolarRadiusAxis stroke="var(--muted-foreground)" fontSize={11} />
                    {yAxisCols.map((yCol, idx) => (
                      <Radar
                        key={yCol}
                        name={yCol}
                        dataKey={yCol}
                        stroke={getSeriesColor(yCol, idx)}
                        fill={getSeriesColor(yCol, idx)}
                        fillOpacity={0.3}
                      />
                    ))}
                    {showLegend && <Legend verticalAlign="bottom" height={36} />}
                    <RechartsTooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)" }} />
                  </RadarChart>
                </SafeResponsiveContainer>
              ) : (
                <SafeResponsiveContainer minHeight={320} width="100%">
                  <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />}
                    <XAxis dataKey={xAxisCol} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                    <RechartsTooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--foreground)" }} />
                    {showLegend && <Legend verticalAlign="bottom" height={36} />}
                    {yAxisCols.map((yCol, idx) => {
                      const color = getSeriesColor(yCol, idx);
                      if (chartType === "line") {
                        return (
                          <Line
                            key={yCol}
                            type={curveSmooth ? "monotone" : "linear"}
                            dataKey={yCol}
                            stroke={color}
                            strokeWidth={2.5}
                            activeDot={{ r: 6 }}
                            connectNulls={true}
                          />
                        );
                      } else if (chartType === "area") {
                        return (
                          <Area
                            key={yCol}
                            type={curveSmooth ? "monotone" : "linear"}
                            dataKey={yCol}
                            fill={color}
                            stroke={color}
                            stackId={stacked ? "1" : undefined}
                            fillOpacity={0.3}
                            connectNulls={true}
                          />
                        );
                      } else if (chartType === "scatter") {
                        return (
                          <Line
                            key={yCol}
                            type="linear"
                            dataKey={yCol}
                            stroke={color}
                            strokeWidth={0}
                            dot={{ r: 6, fill: color }}
                          />
                        );
                      } else {
                        return (
                          <Bar
                            key={yCol}
                            dataKey={yCol}
                            fill={color}
                            stackId={stacked ? "1" : undefined}
                            radius={[4, 4, 0, 0]}
                          />
                        );
                      }
                    })}
                  </ComposedChart>
                </SafeResponsiveContainer>
              )}
            </div>
          </div>

          {/* Parsed Worksheet Preview Section */}
          <div className="bg-(--surface) rounded-xl border border-(--border) p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-(--border) pb-4 mb-4">
              <Table className="h-5 w-5 text-teal-500" />
              <h3 className="font-bold text-(--foreground)">Parsed Worksheet Preview</h3>
            </div>
            <div className="overflow-x-auto max-h-[380px] border border-(--border) rounded-lg shadow-inner">
              <table className="w-full text-left text-xs">
                <thead className="bg-(--surface-soft) text-slate-700 dark:text-slate-300 uppercase font-bold sticky top-0 border-b border-(--border)">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="px-4 py-3 border-r border-(--border)">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border)">
                  {parsedData.slice(0, 15).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-(--surface-soft) transition-colors bg-(--surface)">
                      {headers.map((h, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5 border-r border-(--border) text-(--foreground) truncate max-w-[200px]">
                          {row[h] !== undefined && row[h] !== null ? String(row[h]) : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedData.length > 15 && (
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-right">
                Showing first 15 of {parsedData.length} records.
              </p>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
