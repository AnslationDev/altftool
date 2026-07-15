"use client";

import { useState, useRef } from "react";
import { Upload, X, RefreshCw, Copy, Download, Info, Check, Sparkles, Hourglass } from "lucide-react";
import { getFaceApi } from "../../emotion-detector/services/faceApiClient";

const FUTURE_HOBBIES = [
  "Bonsai Gardening (Deep patience, meticulous trimming, quiet outdoor hobby)",
  "Memoir Writing (Recording family legacies and sharing stories of youth)",
  "Bridge & Strategy Board Games (Keeping the mind sharp and social circle active)",
  "Impressionist Oil Painting (Expressing life wisdom through abstract strokes)",
  "Birdwatching & Nature Hiking (Appreciating simple morning serenity and wildlife)",
  "Restoring Vintage Items (Tinkering with classic mechanical clocks and furniture)"
];

const HEALTH_ADVICES = [
  "Prioritize joint mobility and light morning stretches to maintain maximum flexibility.",
  "Continue deep-reading and strategy puzzles to preserve high cognitive processing.",
  "Engage in cardiovascular active walks to support strong circulatory health.",
  "Maintain regular connections with family and neighborhood circles for emotional support."
];

export default function ToolHome() {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [targetAge, setTargetAge] = useState(65);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size exceeds the 10MB limit.");
      return;
    }

    setError("");
    setFileName(file.name);
    setFileSize(file.size);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSimulate = async () => {
    if (!preview) return;
    setAnalyzing(true);
    setResult(null);
    setError("");

    try {
      const faceapi = await getFaceApi();
      const img = new Image();
      img.onload = async () => {
        // Load face-api models
        const MODEL_URL = "/models";
        if (!faceapi.nets.tinyFaceDetector.params) {
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        }
        if (!faceapi.nets.faceLandmark68Net.params) {
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        }

        // Run inference
        const detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks();

        let seed = 0;
        if (detection && detection.landmarks) {
          const pts = detection.landmarks.positions;
          seed = pts.reduce((acc, p) => acc + p.x + p.y, 0);
        } else {
          // Fallback hash
          let hash = 0;
          for (let i = 0; i < fileName.length; i++) {
            hash = (hash << 5) - hash + fileName.charCodeAt(i);
            hash |= 0;
          }
          seed = Math.abs(hash + fileSize);
        }

        // Math projections based on target age
        const grayHair = Math.round(Math.min(100, Math.max(5, (targetAge - 30) * 1.8)));
        const elasticity = Math.round(Math.max(10, Math.min(95, 100 - (targetAge - 20) * 1.1)));
        const wisdom = Math.round(Math.min(100, (targetAge - 20) * 0.9 + 45));

        const hobbyIndex = Math.round(seed + targetAge) % FUTURE_HOBBIES.length;
        const adviceIndex = Math.round(seed * 3) % HEALTH_ADVICES.length;

        // Apply canvas desaturation
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixelData = imgData.data;
        const ageFactor = (targetAge - 30) / 60;
        const desat = 0.25 * ageFactor;
        for (let i = 0; i < pixelData.length; i += 4) {
          const r = pixelData[i];
          const g = pixelData[i + 1];
          const b = pixelData[i + 2];
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          pixelData[i] = r * (1 - desat) + gray * desat;
          pixelData[i + 1] = g * (1 - desat) + gray * desat;
          pixelData[i + 2] = b * (1 - desat) + gray * desat;
        }
        ctx.putImageData(imgData, 0, 0);

        // Compute Face Bounding Box to isolate procedural wrinkles
        let faceBox = { x: 0, y: 0, width: img.width, height: img.height };
        let pts = null;
        if (detection && detection.landmarks) {
          pts = detection.landmarks.positions;
          const xs = pts.map(p => p.x);
          const ys = pts.map(p => p.y);
          const xMin = Math.min(...xs);
          const xMax = Math.max(...xs);
          const yMin = Math.min(...ys);
          const yMax = Math.max(...ys);
          
          const padX = (xMax - xMin) * 0.15;
          const padY = (yMax - yMin) * 0.15;
          faceBox = {
            x: Math.max(0, xMin - padX),
            y: Math.max(0, yMin - padY),
            width: Math.min(img.width - xMin + padX, xMax - xMin + 2 * padX),
            height: Math.min(img.height - yMin + padY, yMax - yMin + 2 * padY)
          };
        }

        // Create procedural wrinkles texture canvas
        const textureCanvas = document.createElement("canvas");
        textureCanvas.width = img.width;
        textureCanvas.height = img.height;
        const tctx = textureCanvas.getContext("2d");
        tctx.strokeStyle = "rgba(70, 60, 50, 0.14)"; // soft crease lines
        tctx.lineWidth = Math.max(1, img.width / 450);

        // Draw overlapping fine skin crease lines inside face box
        const step = Math.max(6, img.width / 120);
        for (let x = faceBox.x; x < faceBox.x + faceBox.width; x += step) {
          for (let y = faceBox.y; y < faceBox.y + faceBox.height; y += step) {
            const rx = x + (Math.random() - 0.5) * step;
            const ry = y + (Math.random() - 0.5) * step;
            const angle = Math.random() * Math.PI * 2;
            const len = (Math.random() * 0.5 + 0.3) * step;

            tctx.beginPath();
            tctx.moveTo(rx, ry);
            tctx.quadraticCurveTo(
              rx + Math.cos(angle) * (len / 2) + (Math.random() - 0.5) * 2,
              ry + Math.sin(angle) * (len / 2) + (Math.random() - 0.5) * 2,
              rx + Math.cos(angle) * len,
              ry + Math.sin(angle) * len
            );
            tctx.stroke();
          }
        }

        // Apply a soft blur to the texture creases
        const tblurCanvas = document.createElement("canvas");
        tblurCanvas.width = img.width;
        tblurCanvas.height = img.height;
        const tbctx = tblurCanvas.getContext("2d");
        tbctx.filter = "blur(1px)";
        tbctx.drawImage(textureCanvas, 0, 0);

        // Blend the procedural creases on the main face canvas
        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(tblurCanvas, 0, 0);
        ctx.globalCompositeOperation = "source-over";

        // Draw structural landmarks creases
        ctx.strokeStyle = "rgba(90, 75, 65, 0.38)";
        ctx.lineWidth = Math.max(1.5, img.width / 320);

        if (pts) {
          const browY = Math.min(pts[17].y, pts[26].y);
          const foreheadHeight = img.height * 0.08;
          for (let line = 1; line <= 3; line++) {
            ctx.beginPath();
            ctx.moveTo(pts[17].x, browY - foreheadHeight * (line / 4));
            ctx.quadraticCurveTo(
              (pts[17].x + pts[26].x) / 2,
              browY - foreheadHeight * (line / 4) - 5,
              pts[26].x,
              browY - foreheadHeight * (line / 4)
            );
            ctx.stroke();
          }

          // Crow's feet (left eye outer)
          ctx.beginPath();
          ctx.moveTo(pts[36].x, pts[36].y);
          ctx.lineTo(pts[36].x - 12, pts[36].y - 4);
          ctx.moveTo(pts[36].x, pts[36].y);
          ctx.lineTo(pts[36].x - 15, pts[36].y);
          ctx.moveTo(pts[36].x, pts[36].y);
          ctx.lineTo(pts[36].x - 12, pts[36].y + 4);
          ctx.stroke();

          // Crow's feet (right eye outer)
          ctx.beginPath();
          ctx.moveTo(pts[45].x, pts[45].y);
          ctx.lineTo(pts[45].x + 12, pts[45].y - 4);
          ctx.moveTo(pts[45].x, pts[45].y);
          ctx.lineTo(pts[45].x + 15, pts[45].y);
          ctx.moveTo(pts[45].x, pts[45].y);
          ctx.lineTo(pts[45].x + 12, pts[45].y + 4);
          ctx.stroke();

          // Laugh lines
          ctx.beginPath();
          ctx.moveTo(pts[31].x, pts[31].y);
          ctx.quadraticCurveTo(pts[31].x - 8, (pts[31].y + pts[48].y) / 2, pts[48].x - 4, pts[48].y);
          ctx.moveTo(pts[35].x, pts[35].y);
          ctx.quadraticCurveTo(pts[35].x + 8, (pts[35].y + pts[54].y) / 2, pts[54].x + 4, pts[54].y);
          ctx.stroke();
        } else {
          // Fallback forehead wrinkles
          ctx.beginPath();
          ctx.arc(img.width / 2, img.height * 0.35, img.width / 5, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(img.width / 2, img.height * 0.30, img.width / 5, Math.PI * 1.1, Math.PI * 1.9);
          ctx.stroke();
        }

        const simulatedImage = canvas.toDataURL("image/png");

        setResult({
          grayHair,
          elasticity,
          wisdom,
          hobby: FUTURE_HOBBIES[hobbyIndex],
          advice: HEALTH_ADVICES[adviceIndex],
          simulatedImage,
          matchedByAI: !!(detection && detection.landmarks)
        });
        setAnalyzing(false);
      };
      img.src = preview;
    } catch (err) {
      console.error(err);
      setError("An error occurred during age progression simulation. Please try again.");
      setAnalyzing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const formatReportText = () => {
    if (!result) return "";
    return `=== ALTFTool Age Progression Simulation Report ===
Date: ${new Date().toLocaleDateString()}
Simulated Target Age: ${targetAge} years old

Projections & Characteristics:
------------------------------------------
Gray Hair Index: ${result.grayHair}%
Skin Elasticity Index: ${result.elasticity}%
Wisdom & Experience Quotient: ${result.wisdom}%

Predicted Future Interest:
${result.hobby}

Wellness & Projections Advice:
${result.advice}
==========================================`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownload = () => {
    if (!result || !result.simulatedImage) return;
    const a = document.createElement("a");
    a.href = result.simulatedImage;
    a.download = `age-progression-${targetAge}.png`;
    a.click();
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 mb-1">
            <Hourglass className="text-purple-500 animate-spin" style={{ animationDuration: "12s" }} size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Age Progression Generator
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Upload your photo and set the slider to see how your facial characteristics, hair structure, and health profiles project into the future.
          </p>
        </div>

        {/* Workspace Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          
          {error && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900 rounded-2xl text-sm text-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {!preview && !analyzing ? (
            <div
              className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary hover:bg-[var(--anslation-ds-soft)] transition duration-150 ease-in-out group"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-105 transition duration-150">
                <Upload className="text-primary" size={32} />
              </div>
              <h3 className="subheading font-semibold text-lg text-foreground mb-2">
                Upload a Photo to Age
              </h3>
              <p className="description text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Drag and drop your image here, or click to browse. Max size 10MB.
              </p>
              <button
                type="button"
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium cursor-pointer transition shadow-sm"
              >
                Select Photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    processFile(e.target.files[0]);
                  }
                }}
              />
            </div>
          ) : analyzing ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="alt-ui-spinner alt-ui-spinner--lg mb-6 border-t-purple-500" />
              <h4 className="font-semibold text-lg text-foreground animate-pulse">Running Age Progression Simulators...</h4>
              <p className="text-sm text-muted-foreground mt-2">Simulating age lines, gray hair densities, and facial muscle transitions.</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Slider & Dual previews */}
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>Target Age Projections</span>
                  <span className="text-purple-500">{targetAge} Years Old</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={targetAge}
                  onChange={(e) => setTargetAge(parseInt(e.target.value))}
                  className="w-full accent-primary bg-[var(--anslation-ds-soft)] h-2 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6 items-center">
                <div className="space-y-2 text-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Original Photo</span>
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[var(--anslation-ds-soft)] border border-border relative">
                    <img src={preview} alt="Original" className="w-full h-full object-cover" />
                  </div>
                </div>
                
                <div className="space-y-2 text-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Age {targetAge} Projection</span>
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-purple-500/5 border border-purple-500/20 flex flex-col items-center justify-center relative">
                    {result && result.simulatedImage ? (
                      <img src={result.simulatedImage} alt="Age Projection" className="w-full h-full object-cover" />
                    ) : (
                      <div className="p-6 text-center flex flex-col items-center justify-center">
                        <Hourglass className="text-purple-500 mb-3" size={40} />
                        <h4 className="text-2xl font-black text-foreground capitalize leading-tight">
                          Senior Self
                        </h4>
                        <span className="text-xs font-bold px-2.5 py-1 bg-purple-500/10 text-purple-600 rounded-full mt-2 uppercase tracking-wide">
                          Age {targetAge} Projections
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Projections breakdown */}
              {result && (
                <>
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                      <Sparkles size={14} className="text-purple-500" /> Progression Indicators
                    </h4>
                    <div className="bg-card rounded-2xl p-5 border border-border space-y-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-foreground">
                          <span>Gray Hair Index</span>
                          <span>{result.grayHair}%</span>
                        </div>
                        <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${result.grayHair}%` }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-foreground">
                          <span>Skin Elasticity Index</span>
                          <span>{result.elasticity}%</span>
                        </div>
                        <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                          <div className="h-full bg-pink-500 rounded-full" style={{ width: `${result.elasticity}%` }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-foreground">
                          <span>Wisdom & Life Experience</span>
                          <span>{result.wisdom}%</span>
                        </div>
                        <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${result.wisdom}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Extra details card */}
                  <div className="bg-[var(--anslation-ds-soft)] border border-border rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-purple-500" /> Wisdom & Health Projections
                    </h4>
                    <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                      <p>
                        <strong className="text-foreground">Future Interest:</strong> {result.hobby}
                      </p>
                      <p>
                        <strong className="text-foreground">Longevity Tip:</strong> {result.advice}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 shadow"
                    >
                      <Download size={18} /> Download
                    </button>

                    <button
                      onClick={handleCopy}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-border hover:bg-[var(--anslation-ds-soft)] text-foreground font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100"
                    >
                      {copied ? (
                        <>
                          <Check size={18} className="text-teal-500" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={18} /> Copy Projections
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleReset}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100"
                    >
                      <RefreshCw size={18} /> Reset
                    </button>
                  </div>
                </>
              )}

            </div>
          )}

          {/* Trigger button (visible when preview loaded but simulation not run yet) */}
          {preview && !result && !analyzing && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleSimulate}
                className="flex-1 h-10 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 flex items-center justify-center gap-2 shadow text-xs"
              >
                <Hourglass size={18} /> Simulate Age Progression
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 h-10 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 text-xs"
              >
                Reset
              </button>
            </div>
          )}

        </div>

        {/* Explain info */}
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <Info className="text-primary flex-shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How is age simulated?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Age Progression simulations utilize browser-side face-api landmark estimates to calculate coordinate aging displacements. Elasticity, gray hair, and cognitive wisdom indicators scale relative to the selected target age.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
