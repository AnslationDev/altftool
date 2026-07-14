"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Edit3,
  Download,
  Settings,
  RefreshCw,
  Sliders,
  Sparkles,
  Info,
  Trash2,
  FileText,
  Image as ImageIcon,
  Upload,
} from "lucide-react";

const INK_COLORS = {
  blue: { name: "Royal Blue Ballpoint", color: "#1D4ED8" },
  darkBlue: { name: "Gel Blue Ink", color: "#1E3A8A" },
  black: { name: "Deep Black Ink", color: "#0F172A" },
  red: { name: "Teacher Red Gel", color: "#DC2626" },
  green: { name: "Creative Green Ink", color: "#047857" },
};

// 40 Realistic Handwriting fonts from Google Fonts
const FONTS = {
  caveat: { name: "Caveat", family: "'Caveat', cursive" },
  indie: { name: "Indie Flower", family: "'Indie Flower', cursive" },
  shadows: { name: "Shadows Into Light", family: "'Shadows Into Light', cursive" },
  architect: { name: "Architects Daughter", family: "'Architects Daughter', cursive" },
  reenie: { name: "Reenie Beanie", family: "'Reenie Beanie', cursive" },
  gochi: { name: "Gochi Hand", family: "'Gochi Hand', cursive" },
  patrick: { name: "Patrick Hand", family: "'Patrick Hand', cursive" },
  justme: { name: "Just Me Again", family: "'Just Me Again Down Here', cursive" },
  amatic: { name: "Amatic SC", family: "'Amatic SC', cursive" },
  covered: { name: "Covered Grace", family: "'Covered By Your Grace', cursive" },
  nothing: { name: "Nothing You Could", family: "'Nothing You Could Do', cursive" },
  coming: { name: "Coming Soon", family: "'Coming Soon', cursive" },
  gloria: { name: "Gloria Hallelujah", family: "'Gloria Hallelujah', cursive" },
  handlee: { name: "Handlee", family: "'Handlee', cursive" },
  kalam: { name: "Kalam", family: "'Kalam', cursive" },
  kristi: { name: "Kristi", family: "'Kristi', cursive" },
  mansalva: { name: "Mansalva", family: "'Mansalva', cursive" },
  marck: { name: "Marck Script", family: "'Marck Script', cursive" },
  meddon: { name: "Meddon", family: "'Meddon', cursive" },
  mrdafoe: { name: "Mr Dafoe", family: "'Mr Dafoe', cursive" },
  mrssaint: { name: "Mrs Saint Delafield", family: "'Mrs Saint Delafield', cursive" },
  nanum: { name: "Nanum Pen", family: "'Nanum Pen Script', cursive" },
  overrainbow: { name: "Over the Rainbow", family: "'Over the Rainbow', cursive" },
  pacifico: { name: "Pacifico", family: "'Pacifico', cursive" },
  pangolin: { name: "Pangolin", family: "'Pangolin', cursive" },
  marker: { name: "Permanent Marker", family: "'Permanent Marker', cursive" },
  rocksalt: { name: "Rock Salt", family: "'Rock Salt', cursive" },
  sacramento: { name: "Sacramento", family: "'Sacramento', cursive" },
  schoolbell: { name: "Schoolbell", family: "'Schoolbell', cursive" },
  sniglet: { name: "Sniglet", family: "'Sniglet', cursive" },
  sueellen: { name: "Sue Ellen Francisco", family: "'Sue Ellen Francisco', cursive" },
  sunshiney: { name: "Sunshiney", family: "'Sunshiney', cursive" },
  swanky: { name: "Swanky and Dufus", family: "'Swanky and Dufus', cursive" },
  walter: { name: "Walter Turncoat", family: "'Walter Turncoat', cursive" },
  homemade: { name: "Homemade Apple", family: "'Homemade Apple', cursive" },
  yellowtail: { name: "Yellowtail", family: "'Yellowtail', cursive" },
  vibes: { name: "Great Vibes", family: "'Great Vibes', cursive" },
  alex: { name: "Alex Brush", family: "'Alex Brush', cursive" },
  allura: { name: "Allura", family: "'Allura', cursive" },
  parisienne: { name: "Parisienne", family: "'Parisienne', cursive" },
};

const PAPER_STYLES = {
  notebook: { name: "Notebook Lined (School)" },
  grid: { name: "Blueprint Grid" },
  blank: { name: "Blank White" },
  parchment: { name: "Aged Parchment" },
};

export default function MainComponent() {
  const [inputText, setInputText] = useState(
    "Dear Student,\n\nThis is a sample of your new digital handwriting. You can type anything here to convert it into realistic handwritten notes.\n\nCustomize paper rulings, ink colors, and turn on Jitter mode to simulate natural human writing.\n\nBest regards,\nALTFTool team."
  );

  // Styling configurations
  const [fontStyle, setFontStyle] = useState("caveat");
  const [fontSize, setFontSize] = useState(24);
  const [inkColor, setInkColor] = useState("darkBlue");
  const [paperStyle, setPaperStyle] = useState("notebook");
  const [lineSpacing, setLineSpacing] = useState(32);
  const [letterSpacing, setLetterSpacing] = useState(0.5);
  const [jitter, setJitter] = useState(true);

  // Status and export previews
  const [outputDataUrl, setOutputDataUrl] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isGenerated) {
      generateHandwriting();
    }
  }, [inputText, fontStyle, fontSize, inkColor, paperStyle, lineSpacing, letterSpacing, jitter, isGenerated]);

  const handleGenerate = () => {
    setIsGenerated(true);
    setTimeout(() => {
      generateHandwriting();
    }, 100);
  };

  const generateHandwriting = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed A4 Aspect Ratio Dimensions (approx. 800 width x 1130 height)
    const width = 800;
    const height = 1130;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Paper Background
    if (paperStyle === "parchment") {
      ctx.fillStyle = "#FDF6E2";
      ctx.fillRect(0, 0, width, height);
      // Vintage borders
      ctx.strokeStyle = "#D97706";
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, width - 20, height - 20);
    } else {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw Paper Rulings / Grid Lines
    const leftMargin = 100;
    const topMargin = 120;

    if (paperStyle === "notebook") {
      // Draw notebook lines
      ctx.strokeStyle = "#BFDBFE"; // light blue lines
      ctx.lineWidth = 1;

      for (let y = topMargin; y < height; y += Number(lineSpacing)) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw red left margin divider
      ctx.strokeStyle = "#FCA5A5"; // light red
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(leftMargin, 0);
      ctx.lineTo(leftMargin, height);
      ctx.stroke();
    } else if (paperStyle === "grid") {
      // Draw Grid mesh
      ctx.strokeStyle = "#E2E8F0"; // slate-200
      ctx.lineWidth = 0.5;
      const gridSize = 25;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // 3. Set text ink styling
    ctx.fillStyle = INK_COLORS[inkColor].color;
    ctx.textBaseline = "bottom";

    // 4. Render text with realism parameters
    const lines = inputText.split("\n");
    let currentY = topMargin;
    const marginOffset = leftMargin + 20;
    const rightMargin = width - 40;

    lines.forEach((line) => {
      // Wrap long lines within margins
      const words = line.split(" ");
      let currentLineText = "";
      const linesToDraw = [];

      words.forEach((word) => {
        const testLine = currentLineText + (currentLineText ? " " : "") + word;
        ctx.font = `${fontSize}px ${FONTS[fontStyle].family}`;
        const metrics = ctx.measureText(testLine);
        if (marginOffset + metrics.width > rightMargin) {
          linesToDraw.push(currentLineText);
          currentLineText = word;
        } else {
          currentLineText = testLine;
        }
      });
      if (currentLineText) {
        linesToDraw.push(currentLineText);
      }

      // Draw each wrapped line
      linesToDraw.forEach((subLine) => {
        if (currentY + Number(lineSpacing) > height) return; // Prevent overflowing page

        ctx.save();
        let currentX = marginOffset;

        // Draw character-by-character to apply randomized hand-jitter variations
        for (let i = 0; i < subLine.length; i++) {
          const char = subLine[i];
          
          // Enhanced Realism Jitter calculations
          let scaleJitter = 1;
          let randomRotation = 0;
          let randomYOffset = 0;
          
          if (jitter) {
            // Font size micro deviations per letter (mimics pressure)
            scaleJitter = 1 + (Math.random() - 0.5) * 0.08;
            // Angle micro rotation deviations per letter
            randomRotation = (Math.random() - 0.5) * 0.06;
            // Baseline drift: wave-like handwriting wobble + random height jitter
            const waveOffset = Math.sin(i * 0.2) * 1.2;
            randomYOffset = (Math.random() - 0.5) * 1.5 + waveOffset;
          }

          ctx.font = `${fontSize * scaleJitter}px ${FONTS[fontStyle].family}`;
          const charWidth = ctx.measureText(char).width;

          ctx.save();
          if (jitter) {
            ctx.translate(currentX, currentY + randomYOffset);
            ctx.rotate(randomRotation);
            ctx.fillText(char, 0, 0);
          } else {
            ctx.fillText(char, currentX, currentY);
          }
          ctx.restore();

          currentX += charWidth + Number(letterSpacing);
        }

        ctx.restore();
        currentY += Number(lineSpacing);
      });
    });

    setOutputDataUrl(canvas.toDataURL("image/png"));
  };

  // File Text Extractor
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    const fileReader = new FileReader();

    if (file.name.endsWith(".txt")) {
      fileReader.onload = () => {
        setInputText(fileReader.result);
        setSuccess("Text file imported successfully!");
      };
      fileReader.readAsText(file);
    } else if (file.name.endsWith(".pdf")) {
      fileReader.onload = () => {
        const text = fileReader.result;
        // Search parentheses Tj streams in PDF binaries
        const regex = /\(([^)]+)\)\s*Tj/g;
        let match;
        const result = [];
        while ((match = regex.exec(text)) !== null) {
          result.push(match[1]);
        }
        if (result.length > 0) {
          const parsed = result.join(" ").replace(/\\(\d{3})/g, (m, octal) => String.fromCharCode(parseInt(octal, 8)));
          setInputText(parsed);
          setSuccess("PDF Text content imported successfully!");
        } else {
          // Binary plain printable ASCII fallback scanner
          const words = text.match(/[\x20-\x7E]{4,}/g) || [];
          const clean = words
            .filter((w) => !w.startsWith("%") && !w.includes("/") && !w.includes("obj") && !w.includes("endobj"))
            .join("\n");
          if (clean.length > 5) {
            setInputText(clean.slice(0, 1500));
            setSuccess("PDF elements imported!");
          } else {
            setError("Could not extract clean text from this PDF document. Please copy-paste it directly.");
          }
        }
      };
      fileReader.readAsText(file);
    } else if (file.type.startsWith("image/")) {
      // Image metadata or instructions fallback
      setError("Text OCR scanning from images is not supported directly in-browser. Please copy and paste the text from your image instead.");
    } else {
      // General text fallback
      fileReader.onload = () => {
        setInputText(fileReader.result.slice(0, 2000));
        setSuccess("File content imported!");
      };
      fileReader.readAsText(file);
    }
  };

  const downloadPNG = () => {
    if (!outputDataUrl) return;
    const link = document.createElement("a");
    link.href = outputDataUrl;
    link.download = `handwritten-note-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccess("Your handwritten PNG has been downloaded!");
    setTimeout(() => setSuccess(""), 4000);
  };

  const downloadPDF = async () => {
    if (!outputDataUrl) return;
    setIsCompiling(true);
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [800, 1130],
      });
      pdf.addImage(outputDataUrl, "PNG", 0, 0, 800, 1130);
      pdf.save(`handwritten-note-${Date.now()}.pdf`);
      setSuccess("Your handwritten document has been downloaded as PDF!");
    } catch (err) {
      setError(`PDF generation failed: ${err.message}`);
    } finally {
      setIsCompiling(false);
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  const handleClear = () => {
    setInputText("");
    setIsGenerated(false);
    setOutputDataUrl("");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      {/* Dynamic injection of 40 handwriting Google fonts in one stylesheet link */}
      <link
        href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Allura&family=Amatic+SC&family=Architects+Daughter&family=Caveat&family=Coming+Soon&family=Covered+By+Your+Grace&family=Gloria+Hallelujah&family=Gochi+Hand&family=Great+Vibes&family=Handlee&family=Homemade+Apple&family=Indie+Flower&family=Just+Me+Again+Down+Here&family=Kalam&family=Kristi&family=Mansalva&family=Marck+Script&family=Meddon&family=Mr+Dafoe&family=Mrs+Saint+Delafield&family=Nanum+Pen+Script&family=Nothing+You+Could+Do&family=Over+the+Rainbow&family=Pacifico&family=Pangolin&family=Parisienne&family=Patrick+Hand&family=Permanent+Marker&family=Reenie+Beanie&family=Rock+Salt&family=Sacramento&family=Schoolbell&family=Shadows+Into+Light&family=Sniglet&family=Sue+Ellen+Francisco&family=Sunshiney&family=Swanky+and+Dufus&family=Walter+Turncoat&family=Yellowtail&display=swap"
        rel="stylesheet"
      />

      {/* Title Header */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-2">
          <Edit3 className="h-8 w-8 text-teal-500 shrink-0" /> Text-to-Handwriting Converter
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Transform digital text messages, study notes, or assignments into realistic handwritten documents locally in your browser.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm flex items-center justify-between">
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-sm flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Input Document Card */}
      <div className="bg-(--surface) rounded-xl border border-(--border) p-5 shadow-sm space-y-4">
        
        {/* Action Bar */}
        <div className="flex items-center justify-between border-b border-(--border) pb-3">
          <h3 className="font-bold text-(--foreground) flex items-center gap-1.5">
            <Edit3 className="h-4.5 w-4.5 text-teal-500" /> Input Document
          </h3>
          
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-(--border) hover:border-teal-500 rounded text-xs font-semibold text-teal-600 dark:text-teal-400 transition-colors bg-(--page) cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" /> Import TXT/PDF
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-(--border) hover:border-red-500 rounded text-xs font-semibold text-red-500 transition-colors bg-(--page) cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear Content
            </button>
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type, copy-paste or upload a file to convert..."
          className="w-full h-[320px] bg-(--page) border border-(--border) text-(--foreground) text-sm rounded-lg p-4 outline-none focus:border-teal-500 font-mono resize-none shadow-inner"
        />
      </div>

      {/* Step 2 & 3: Show customization and generate button only after text is typed/uploaded */}
      {inputText.trim() !== "" && (
        <>
          {/* Step 2: Customization Options Panel */}
          <div className="mt-8 bg-(--surface) rounded-xl border border-(--border) p-6 space-y-6 shadow-sm">
            <h3 className="font-bold text-(--foreground) border-b border-(--border) pb-3 flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-teal-500" /> Customization Options
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
              
              {/* Col 1: Handwriting style & color (3/12 cols) */}
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Handwriting Font Preset (40 Styles)
                  </label>
                  <select
                    value={fontStyle}
                    onChange={(e) => setFontStyle(e.target.value)}
                    className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2.5 outline-none focus:border-teal-500 cursor-pointer max-h-40 overflow-y-auto"
                  >
                    {Object.keys(FONTS).map((k) => (
                      <option key={k} value={k}>
                        {FONTS[k].name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Ink Color Options
                  </label>
                  <select
                    value={inkColor}
                    onChange={(e) => setInkColor(e.target.value)}
                    className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2.5 outline-none focus:border-teal-500 cursor-pointer"
                  >
                    {Object.keys(INK_COLORS).map((k) => (
                      <option key={k} value={k}>
                        {INK_COLORS[k].name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Col 2: Paper Style & Size (3/12 cols) */}
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Paper Grid / Lines
                  </label>
                  <select
                    value={paperStyle}
                    onChange={(e) => setPaperStyle(e.target.value)}
                    className="w-full bg-(--page) border border-(--border) text-(--foreground) text-xs rounded-lg p-2.5 outline-none focus:border-teal-500 cursor-pointer"
                  >
                    {Object.keys(PAPER_STYLES).map((k) => (
                      <option key={k} value={k}>
                        {PAPER_STYLES[k].name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    <span>Font Size (px)</span>
                    <span>{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="40"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-600 mt-2"
                  />
                </div>
              </div>

              {/* Col 3: Line & Letter spacing (3/12 cols) */}
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    <span>Line Spacing</span>
                    <span>{lineSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    value={lineSpacing}
                    onChange={(e) => setLineSpacing(Number(e.target.value))}
                    className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-600 mt-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    <span>Letter Spacing</span>
                    <span>{letterSpacing}px</span>
                  </div>
                  <input
                    type="range"
                    min="-2"
                    max="8"
                    step="0.5"
                    value={letterSpacing}
                    onChange={(e) => setLetterSpacing(Number(e.target.value))}
                    className="w-full h-1 bg-(--border) rounded-lg appearance-none cursor-pointer accent-teal-600 mt-2"
                  />
                </div>
              </div>

              {/* Col 4: Jitter Switch & Information (3/12 cols) */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Natural Handwriting Jitter</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jitter}
                      onChange={(e) => setJitter(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-(--border) peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
                
                <div className="bg-(--page) rounded-lg border border-(--border) p-3 flex gap-2 items-start text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed">
                  <Info className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" />
                  <p>Realistic Jitter applies micro character rotation, baseline wave offsets, and dynamic size scaling to mimic organic human variations.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Step 3: Generate Action Section */}
          <div className="mt-8 bg-(--surface) rounded-xl border border-(--border) p-6 text-center shadow-sm flex flex-col items-center justify-center">
            <button
              onClick={handleGenerate}
              className="inline-flex items-center justify-center gap-2 px-12 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-md transition-all cursor-pointer active:scale-98"
            >
              <Edit3 className="h-4.5 w-4.5 animate-pulse" /> Generate Handwritten Sheet
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Click generate to compile your document into the handwritten styles.
            </p>
          </div>
        </>
      )}

      {/* Step 4: Result & Download Live Preview Section */}
      {isGenerated && (
        <div className="mt-8 bg-(--surface) rounded-xl border border-(--border) p-6 shadow-sm space-y-6 animate-fade-in">
          <h3 className="font-bold text-(--foreground) border-b border-(--border) pb-3 flex items-center justify-center gap-2 text-center">
            <Sparkles className="h-4.5 w-4.5 text-teal-500" /> Compiled Handwriting Sheet Preview
          </h3>
          
          <div className="flex flex-col items-center justify-center">
            <div className="border border-(--border) rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800/80 p-6 max-w-full flex justify-center shadow-inner">
              <canvas
                ref={canvasRef}
                className="max-h-[500px] max-w-full object-contain border bg-white shadow-md"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-4 justify-center w-full max-w-md">
              <button
                onClick={downloadPNG}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer active:scale-98"
              >
                <ImageIcon className="h-4 w-4" /> Download Image (PNG)
              </button>
              <button
                onClick={downloadPDF}
                disabled={isCompiling}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <FileText className="h-4 w-4" /> {isCompiling ? "Compiling PDF..." : "Download PDF Document"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
