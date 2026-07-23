"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import HeaderIntro from "../components/HeaderIntro";
import PreviewCard from "../components/PreviewCard";
import BuilderCard from "../components/BuilderCard";
import BulkCard from "../components/BulkCard";
import HistoryCard from "../components/HistoryCard";
import FeatureStrip from "../components/FeatureStrip";
import { SIZE_PRESETS, getFormat } from "../utils/barcodeFormats";
import {
  copyCanvasImage,
  exportEps,
  exportPdf,
  exportPng,
  exportSvg,
} from "../utils/exporters";
import { deleteFromHistory, getHistory, saveToHistory } from "../utils/historyStore";
import { downloadSampleCsv, generateBulkZip, parseCsv } from "../utils/bulk";

const IDLE_BULK = { state: "idle", results: [], succeeded: 0, error: "" };

export default function BarcodeGeneratorPage() {
  const [data, setData] = useState("A123B456C789");
  const [format, setFormat] = useState("CODE128");
  const [sizeKey, setSizeKey] = useState("medium");
  const [lineColor, setLineColor] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [margin, setMargin] = useState(10);
  const [showText, setShowText] = useState(true);
  const [showCode, setShowCode] = useState(true);
  const [quietZone, setQuietZone] = useState(false);
  const [exportFormat, setExportFormat] = useState("PNG");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [history, setHistory] = useState(() => getHistory());
  const [bulk, setBulk] = useState(IDLE_BULK);

  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const qrContainerRef = useRef(null);
  const previewRef = useRef(null);

  const formatInfo = getFormat(format);
  const isQr = format === "QR";
  const preset = SIZE_PRESETS[sizeKey];
  const effectiveMargin = margin + (quietZone ? 20 : 0);

  const qrProps = useMemo(
    () => ({
      value: data.trim() || " ",
      size: preset.qrSize,
      fgColor: lineColor,
      bgColor: background,
      marginSize: Math.max(0, Math.round(effectiveMargin / 10)),
      level: "M",
    }),
    [data, preset.qrSize, lineColor, background, effectiveMargin],
  );

  // Live render — barcode formats draw into both the visible canvas and a
  // hidden SVG twin (the vector source for SVG/EPS export). QR renders itself.
  useEffect(() => {
    if (isQr) return undefined;
    const timer = window.setTimeout(() => {
      if (!canvasRef.current || !svgRef.current) return;
      if (!data.trim()) {
        setError("");
        return;
      }
      try {
        let valid = true;
        const options = {
          format,
          width: preset.barWidth,
          height: preset.height,
          fontSize: preset.fontSize,
          displayValue: showText,
          background,
          lineColor,
          margin: effectiveMargin,
          valid: (ok) => {
            valid = ok;
          },
        };
        JsBarcode(canvasRef.current, data, options);
        JsBarcode(svgRef.current, data, options);
        setError(valid ? "" : `"${data}" is not valid ${formatInfo.label} data`);
      } catch (renderError) {
        setError(renderError?.message?.split("\n")[0] || `Couldn't render ${formatInfo.label}`);
      }
    }, 120);
    return () => window.clearTimeout(timer);
  }, [data, format, isQr, preset, showText, background, lineColor, effectiveMargin, formatInfo.label]);

  const getCanvas = () =>
    isQr ? qrContainerRef.current?.querySelector("canvas") : canvasRef.current;
  const getSvgNode = () => (isQr ? document.querySelector("[data-qr-svg] svg") : svgRef.current);

  const handleFormatChange = (value) => {
    setFormat(value);
    if (value === "QR") {
      setError("");
      if (exportFormat === "EPS") setExportFormat("PNG");
    }
  };

  const flash = (setter) => {
    setter(true);
    window.setTimeout(() => setter(false), 1800);
  };

  const handleDownload = () => {
    const stamp = Date.now();
    const canvas = getCanvas();
    if (!canvas) return;
    if (exportFormat === "PNG") exportPng(canvas, `barcode-${format}-${stamp}.png`);
    else if (exportFormat === "PDF") exportPdf(canvas, `barcode-${format}-${stamp}.pdf`);
    else if (exportFormat === "SVG") {
      const svgNode = getSvgNode();
      if (svgNode) exportSvg(svgNode, `barcode-${format}-${stamp}.svg`);
    } else if (exportFormat === "EPS" && svgRef.current) {
      exportEps(svgRef.current, `barcode-${format}-${stamp}.eps`);
    }
  };

  const handleCopy = async () => {
    const canvas = getCanvas();
    if (!canvas) return;
    try {
      await copyCanvasImage(canvas);
      flash(setCopied);
    } catch {
      window.alert("Copying images to the clipboard isn't supported in this browser.");
    }
  };

  const saveCurrentToHistory = () => {
    const canvas = getCanvas();
    if (!canvas) return false;
    setHistory(
      saveToHistory({
        data,
        format,
        thumb: canvas.toDataURL("image/png"),
        options: { sizeKey, lineColor, background, margin, showText, showCode, quietZone },
      }),
    );
    return true;
  };

  const handleSaveHistory = () => {
    if (saveCurrentToHistory()) flash(setSaved);
  };

  const handleGenerate = () => {
    if (error || !data.trim()) {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return;
    }
    if (saveCurrentToHistory()) {
      flash(setGenerated);
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handleLoadHistory = (entry) => {
    setData(entry.data);
    setFormat(entry.format);
    const options = entry.options || {};
    if (options.sizeKey) setSizeKey(options.sizeKey);
    if (options.lineColor) setLineColor(options.lineColor);
    if (options.background) setBackground(options.background);
    if (typeof options.margin === "number") setMargin(options.margin);
    if (typeof options.showText === "boolean") setShowText(options.showText);
    if (typeof options.showCode === "boolean") setShowCode(options.showCode);
    if (typeof options.quietZone === "boolean") setQuietZone(options.quietZone);
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleBulkFile = async (file) => {
    setBulk({ ...IDLE_BULK, state: "working" });
    try {
      const rows = parseCsv(await file.text(), format);
      if (!rows.length) {
        setBulk({ ...IDLE_BULK, state: "error", error: `No data rows found in "${file.name}".` });
        return;
      }
      const { results, succeeded, blob } = await generateBulkZip(rows, {
        barWidth: preset.barWidth,
        height: preset.height,
        fontSize: preset.fontSize,
        showText,
        background,
        lineColor,
        margin: effectiveMargin,
      });
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = Object.assign(document.createElement("a"), { href: url, download: "barcodes.zip" });
        link.click();
        URL.revokeObjectURL(url);
      }
      setBulk({ state: "done", results, succeeded, error: "" });
    } catch (bulkError) {
      setBulk({ ...IDLE_BULK, state: "error", error: bulkError.message || "Bulk generation failed." });
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="grid items-start gap-5 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-5">
            <HeaderIntro />
          </div>
          <div ref={previewRef} className="min-w-0 scroll-mt-6 xl:col-span-7">
            <PreviewCard
              canvasRef={canvasRef}
              svgRef={svgRef}
              qrContainerRef={qrContainerRef}
              isQr={isQr}
              qrProps={qrProps}
              data={data}
              showCode={showCode}
              error={error}
              exportFormat={exportFormat}
              onExportFormatChange={setExportFormat}
              onDownload={handleDownload}
              onCopy={handleCopy}
              copied={copied}
              onSaveHistory={handleSaveHistory}
              saved={saved}
            />
          </div>
        </div>

        <div className="grid items-start gap-5 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-5">
            <BuilderCard
              data={data}
              onDataChange={setData}
              format={format}
              onFormatChange={handleFormatChange}
              formatInfo={formatInfo}
              sizeKey={sizeKey}
              onSizeChange={setSizeKey}
              lineColor={lineColor}
              onLineColorChange={setLineColor}
              background={background}
              onBackgroundChange={setBackground}
              margin={margin}
              onMarginChange={setMargin}
              showText={showText}
              onShowTextChange={setShowText}
              showCode={showCode}
              onShowCodeChange={setShowCode}
              quietZone={quietZone}
              onQuietZoneChange={setQuietZone}
              onLoadExample={() => setData(formatInfo.example)}
              onGenerate={handleGenerate}
              generated={generated}
            />
          </div>
          <div className="min-w-0 space-y-5 xl:col-span-7">
            <BulkCard
              onBulkFile={handleBulkFile}
              bulk={bulk}
              onClearBulk={() => setBulk(IDLE_BULK)}
              onDownloadSample={downloadSampleCsv}
            />
            <HistoryCard
              history={history}
              onLoad={handleLoadHistory}
              onDelete={(id) => setHistory(deleteFromHistory(id))}
            />
          </div>
        </div>

        <FeatureStrip />
      </div>
    </main>
  );
}
