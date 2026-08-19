"use client";

import { useState, useCallback, useRef } from "react";
import { Images, Upload, BarChart3, Palette, Shapes, Type, Eye, FileDown, Activity, Maximize2, RefreshCw } from "lucide-react";
import UploadZone from "../components/UploadZone";
import ResultsPanel from "../components/ResultsPanel";
import ColorAnalysis from "../components/ColorAnalysis";
import ShapeAnalysis from "../components/ShapeAnalysis";
import TypographyAnalysis from "../components/TypographyAnalysis";
import Visualization from "../components/Visualization";
import ImageQuality from "../components/ImageQuality";
import Stats from "../components/Stats";
import ReportGenerator from "../components/ReportGenerator";
import Features from "../components/Features";
import { loadImage, getImageData, computeAllSimilarity, transparencyAnalysis, sharpnessScore, noiseEstimate } from "../utils/imageAnalysis";
import { extractDominantColors, compareColorPalettes, getDesignStyle } from "../utils/colorAnalysis";
import { analyzeGeometry, compareShapes, analyzeTypography, compareTypography } from "../utils/shapeAnalysis";
import toast from "react-hot-toast";

const TABS = [
  { id: "upload", label: "Upload", icon: Upload },
  { id: "results", label: "Results", icon: BarChart3 },
  { id: "color", label: "Color", icon: Palette },
  { id: "shape", label: "Shape", icon: Shapes },
  { id: "typography", label: "Typography", icon: Type },
  { id: "visualize", label: "Visualize", icon: Eye },
  { id: "quality", label: "Quality", icon: Activity },
  { id: "report", label: "Report", icon: FileDown },
];

export default function LogoSsimilarityCheckerPro() {
  const [logoA, setLogoA] = useState(null);
  const [logoB, setLogoB] = useState(null);
  const [imgA, setImgA] = useState(null);
  const [imgB, setImgB] = useState(null);
  const [urlA, setUrlA] = useState(null);
  const [urlB, setUrlB] = useState(null);
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [results, setResults] = useState(null);
  const [paletteA, setPaletteA] = useState(null);
  const [paletteB, setPaletteB] = useState(null);
  const [colorComparison, setColorComparison] = useState(null);
  const [geoA, setGeoA] = useState(null);
  const [geoB, setGeoB] = useState(null);
  const [shapeComparison, setShapeComparison] = useState(null);
  const [typoA, setTypoA] = useState(null);
  const [typoB, setTypoB] = useState(null);
  const [typoComparison, setTypoComparison] = useState(null);
  const [statsA, setStatsA] = useState(null);
  const [statsB, setStatsB] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const reportRef = useRef(null);

  const analyzeImage = async (file, side) => {
    try {
      const { img, url } = await loadImage(file);
      const data = getImageData(img, 256);

      const transparency = transparencyAnalysis(data);
      const sharpness = sharpnessScore(data);
      const noise = noiseEstimate(data);
      const geo = analyzeGeometry(data);
      const typo = analyzeTypography(data);
      const palette = extractDominantColors(data, 5);
      const style = getDesignStyle(palette);

      const fileSize = file.size ? (file.size / 1024).toFixed(1) + " KB" : "N/A";

      const fileStats = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: (img.naturalWidth / img.naturalHeight).toFixed(2),
        transparency,
        sharpness,
        noise,
        fileSize,
      };

      if (side === "A") {
        setImgA(img); setUrlA(url); setDataA(data); setPaletteA(palette); setGeoA(geo); setTypoA(typo); setStatsA(fileStats);
        setLogoA(file);
        setResults(null);
      } else {
        setImgB(img); setUrlB(url); setDataB(data); setPaletteB(palette); setGeoB(geo); setTypoB(typo); setStatsB(fileStats);
        setLogoB(file);
        setResults(null);
      }

      return { img, data, geo, typo, palette, style, fileStats };
    } catch (err) {
      toast.error(`Failed to analyze: ${err.message}`);
      return null;
    }
  };

  const handleUploadA = useCallback(async (file) => {
    if (!file) {
      setUrlA((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
      setLogoA(null); setImgA(null); setDataA(null); setPaletteA(null); setGeoA(null); setTypoA(null); setStatsA(null); setResults(null); return;
    }
    await analyzeImage(file, "A");
  }, []);

  const handleUploadB = useCallback(async (file) => {
    if (!file) {
      setUrlB((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
      setLogoB(null); setImgB(null); setDataB(null); setPaletteB(null); setGeoB(null); setTypoB(null); setStatsB(null); setResults(null); return;
    }
    await analyzeImage(file, "B");
  }, []);

  const handleSwap = useCallback(async () => {
    const tmpFile = logoA, tmpImg = imgA, tmpUrl = urlA, tmpData = dataA, tmpPalette = paletteA, tmpGeo = geoA, tmpTypo = typoA, tmpStats = statsA;
    setLogoA(logoB); setImgA(imgB); setUrlA(urlB); setDataA(dataB); setPaletteA(paletteB); setGeoA(geoB); setTypoA(typoB); setStatsA(statsB);
    setLogoB(tmpFile); setImgB(tmpImg); setUrlB(tmpUrl); setDataB(tmpData); setPaletteB(tmpPalette); setGeoB(tmpGeo); setTypoB(tmpTypo); setStatsB(tmpStats);
    setResults(null); setColorComparison(null); setShapeComparison(null); setTypoComparison(null);
  }, [logoA, logoB, imgA, imgB, urlA, urlB, dataA, dataB, paletteA, paletteB, geoA, geoB, typoA, typoB, statsA, statsB]);

  const handleReset = useCallback(() => {
    setUrlA((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setUrlB((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setLogoA(null); setLogoB(null); setImgA(null); setImgB(null); setDataA(null); setDataB(null);
    setResults(null); setPaletteA(null); setPaletteB(null); setColorComparison(null);
    setGeoA(null); setGeoB(null); setShapeComparison(null);
    setTypoA(null); setTypoB(null); setTypoComparison(null);
    setStatsA(null); setStatsB(null); setProcessingTime(null);
    setActiveTab("upload");
  }, []);

  const handleCompare = useCallback(async () => {
    if (!imgA || !imgB || !dataA || !dataB) { toast.error("Upload both logos first"); return; }
    setProcessing(true);
    const start = performance.now();
    try {
      const res = computeAllSimilarity(imgA, imgB, dataA, dataB);
      const palCmp = compareColorPalettes(paletteA || [], paletteB || []);
      const shapeCmp = compareShapes(geoA || { coverage: 0, edgeDensity: 0, roundness: 0, aspectRatio: 1 }, geoB || { coverage: 0, edgeDensity: 0, roundness: 0, aspectRatio: 1 });
      const typoCmp = compareTypography(typoA || { textDetected: false, textPresence: 0, boldness: 0, estimatedFontStyle: "N/A", alignment: "N/A" }, typoB || { textDetected: false, textPresence: 0, boldness: 0, estimatedFontStyle: "N/A", alignment: "N/A" });
      const styleA = getDesignStyle(paletteA || []);
      const styleB = getDesignStyle(paletteB || []);

      res.styleA = styleA;
      res.styleB = styleB;

      setResults(res);
      setColorComparison(palCmp);
      setShapeComparison(shapeCmp);
      setTypoComparison(typoCmp);
      setProcessingTime(Math.round(performance.now() - start));
      setActiveTab("results");
      toast.success(`Analysis complete: ${res.overall}% similarity`);
    } catch (err) {
      toast.error(`Analysis failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  }, [imgA, imgB, dataA, dataB, paletteA, paletteB, geoA, geoB, typoA, typoB]);

  const hasBoth = !!imgA && !!imgB;
  const hasResults = !!results;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Images className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-3 text-2xl font-bold text-[--foreground] sm:text-3xl">Logo Similarity Checker</h1>
        <p className="mt-1 text-sm text-[--muted]">Compare two logos using algorithm-powered visual analysis</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const disabled = tab.id !== "upload" && !hasResults && (tab.id === "results" || tab.id === "report");
          return (
            <button key={tab.id} onClick={() => !disabled && setActiveTab(tab.id)} disabled={disabled}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${activeTab === tab.id ? "bg-primary text-white shadow-sm" : disabled ? "cursor-not-allowed text-[--muted] opacity-40" : "text-[--muted] hover:bg-[--surface-soft] hover:text-[--foreground]"}`}>
              <Icon className="h-4 w-4" /><span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
        <div className="h-6 w-px bg-[--border]" />
        <button onClick={handleCompare} disabled={!hasBoth || processing}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50">
          {processing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
          {processing ? "Analyzing..." : "Compare Logos"}
        </button>
      </div>

      <div className="mx-auto max-w-6xl">
        {activeTab === "upload" && (
          <div className="space-y-6">
            <UploadZone logoA={logoA} logoB={logoB} onUploadA={handleUploadA} onUploadB={handleUploadB} onSwap={handleSwap} onReset={handleReset} />
            {!hasBoth && !hasResults && <Features />}
          </div>
        )}
        {activeTab === "results" && <ResultsPanel results={results} />}
        {activeTab === "color" && <ColorAnalysis paletteA={paletteA} paletteB={paletteB} colorComparison={colorComparison} />}
        {activeTab === "shape" && <ShapeAnalysis geoA={geoA} geoB={geoB} shapeComparison={shapeComparison} />}
        {activeTab === "typography" && <TypographyAnalysis typoA={typoA} typoB={typoB} typoComparison={typoComparison} />}
        {activeTab === "visualize" && <Visualization imgA={imgA} imgB={imgB} results={results} />}
        {activeTab === "quality" && <ImageQuality statsA={statsA} statsB={statsB} />}
        {activeTab === "report" && (
          <div className="rounded-xl border border-[--border] bg-[--surface] p-4 sm:p-6">
            <div ref={reportRef} className="bg-[--surface]">
              <Stats statsA={statsA} statsB={statsB} processingTime={processingTime} />
            </div>
            <div className="mt-4"><ReportGenerator results={results} paletteA={paletteA} paletteB={paletteB} geoA={geoA} geoB={geoB} targetRef={reportRef} /></div>
          </div>
        )}
      </div>
    </div>
  );
}
