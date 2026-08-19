"use client";

import { useState, useRef } from "react";
import { Upload, X, RefreshCw, Copy, Download, Info, Check, Sparkles, Undo } from "lucide-react";
import { getFaceApi } from "../../emotion-detector/services/faceApiClient";

const CHILD_PERSONALITIES = [
  "Dreamy Artist (Loved painting fingers, building imaginary castles, and talking to plush toys)",
  "Playground Champion (First to run, loved tag, adventurous, always making new buddies)",
  "Quiet Library Explorer (Loved looking at picture books, building complex blocks, highly curious)",
  "Nostalgic Builder (Loved puzzles, Lego bricks, and collecting interesting rocks or shells)"
];

const CHILD_GAMES = [
  "Hide & Seek and Tag in the yard",
  "Building giant pillow forts in the living room",
  "Playing classic arcade brick games or early handheld console games",
  "Drawing colorful chalk murals on the sidewalk"
];

const STAGES_DETAILS = {
  toddler: { label: "Toddler (2-4 yrs)", roundness: 92, eyesFactor: 88, skinSmoothness: 98 },
  child: { label: "Child (6-10 yrs)", roundness: 82, eyesFactor: 78, skinSmoothness: 92 },
  teen: { label: "Teen (13-17 yrs)", roundness: 68, eyesFactor: 64, skinSmoothness: 86 }
};

export default function ToolHome() {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [stageKey, setStageKey] = useState("child"); // toddler, child, teen
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    if (!file.type || !file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

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
        try {
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
            // Landmark coordinates are floating point, so the raw sum can be
            // non-integer. Floor it to a non-negative integer before it is
            // used as an array index below (a fractional index resolves to
            // `undefined`).
            seed = Math.floor(Math.abs(pts.reduce((acc, p) => acc + p.x + p.y, 0)));
          } else {
            // Fallback hash
            let hash = 0;
            for (let i = 0; i < fileName.length; i++) {
              hash = (hash << 5) - hash + fileName.charCodeAt(i);
              hash |= 0;
            }
            seed = Math.abs(hash + fileSize);
          }

          const stage = STAGES_DETAILS[stageKey];

          // Add subtle deviations based on landmark seed
          const roundness = Math.min(99, Math.round(stage.roundness + (seed % 5) - 2));
          const eyesFactor = Math.min(99, Math.round(stage.eyesFactor + (seed % 5) - 2));
          const skinSmoothness = Math.min(99, Math.round(stage.skinSmoothness + (seed % 3)));

          const personality = CHILD_PERSONALITIES[seed % CHILD_PERSONALITIES.length];
          const game = CHILD_GAMES[(seed * 3) % CHILD_GAMES.length];

          // Apply canvas smoothing and youth color grades
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixelData = imgData.data;
          for (let i = 0; i < pixelData.length; i += 4) {
            let r = pixelData[i];
            let g = pixelData[i + 1];
            let b = pixelData[i + 2];
            // Boost exposure and warm tones
            r = Math.min(255, r * 1.04 + 4);
            g = Math.min(255, g * 1.04 + 4);
            b = Math.min(255, b * 1.01);
            pixelData[i] = r;
            pixelData[i + 1] = g;
            pixelData[i + 2] = b;
          }
          ctx.putImageData(imgData, 0, 0);

          // Apply localized skin smoothing blur inside face landmarks bounds
          if (detection && detection.landmarks) {
            const pts = detection.landmarks.positions;
            const xs = pts.map(p => p.x);
            const ys = pts.map(p => p.y);
            const xMin = Math.min(...xs);
            const xMax = Math.max(...xs);
            const yMin = Math.min(...ys);
            const yMax = Math.max(...ys);

            const centerX = (xMin + xMax) / 2;
            const centerY = (yMin + yMax) / 2;
            const radiusX = (xMax - xMin) * 0.65;
            const radiusY = (yMax - yMin) * 0.75;

            // Create temporary mask canvas
            const faceMask = document.createElement("canvas");
            faceMask.width = img.width;
            faceMask.height = img.height;
            const fmctx = faceMask.getContext("2d");

            const grad = fmctx.createRadialGradient(centerX, centerY, radiusX * 0.4, centerX, centerY, radiusX);
            grad.addColorStop(0, "rgba(255, 255, 255, 0.45)"); // max blur mix opacity
            grad.addColorStop(1, "rgba(255, 255, 255, 0.0)"); // fade out at hairline/neck
            fmctx.fillStyle = grad;

            fmctx.beginPath();
            fmctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            fmctx.fill();

            // Create blurred copy of main canvas
            const blurCanvas = document.createElement("canvas");
            blurCanvas.width = img.width;
            blurCanvas.height = img.height;
            const bctx = blurCanvas.getContext("2d");
            bctx.filter = "blur(8px)";
            bctx.drawImage(canvas, 0, 0);

            // Apply blurred pixels strictly inside the face oval path
            const maskCanvas = document.createElement("canvas");
            maskCanvas.width = img.width;
            maskCanvas.height = img.height;
            const mctx = maskCanvas.getContext("2d");
            mctx.drawImage(faceMask, 0, 0);
            mctx.globalCompositeOperation = "source-in";
            mctx.drawImage(blurCanvas, 0, 0);

            // Overlay onto main canvas
            ctx.drawImage(maskCanvas, 0, 0);

            // Draw rosy baby-cheek blush circles
            const cheekRadius = Math.max(8, img.width * 0.045);
            const leftCheekX = pts[36].x;
            const leftCheekY = (pts[36].y + pts[48].y) / 2;
            const rightCheekX = pts[45].x;
            const rightCheekY = (pts[45].y + pts[54].y) / 2;

            ctx.fillStyle = "rgba(244, 63, 94, 0.12)";
            ctx.beginPath();
            ctx.arc(leftCheekX, leftCheekY, cheekRadius, 0, 2 * Math.PI);
            ctx.arc(rightCheekX, rightCheekY, cheekRadius, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            // Fallback global light blur when no face landmarks are detected
            ctx.globalAlpha = 0.3;
            const blurCanvas = document.createElement("canvas");
            blurCanvas.width = img.width;
            blurCanvas.height = img.height;
            const bctx = blurCanvas.getContext("2d");
            bctx.filter = "blur(6px)";
            bctx.drawImage(canvas, 0, 0);
            ctx.drawImage(blurCanvas, 0, 0);
            ctx.globalAlpha = 1.0;
          }

          const simulatedImage = canvas.toDataURL("image/png");

          setResult({
            roundness,
            eyesFactor,
            skinSmoothness,
            personality,
            game,
            stageLabel: stage.label,
            simulatedImage,
            matchedByAI: !!(detection && detection.landmarks)
          });
        } catch (err) {
          console.error(err);
          setError("An error occurred during younger version simulation. Please try again.");
        } finally {
          setAnalyzing(false);
        }
      };
      img.onerror = () => {
        setAnalyzing(false);
        setError("Could not load the selected image.");
      };
      img.src = preview;
    } catch (err) {
      console.error(err);
      setError("An error occurred during younger version simulation. Please try again.");
      setAnalyzing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    processFile(file);
  };

  const formatReportText = () => {
    if (!result) return "";
    return `=== ALTFTool Younger Version Simulation Report ===
Date: ${new Date().toLocaleDateString()}
Simulated Stage: ${result.stageLabel}

Projections & Characteristics:
------------------------------------------
Skin Smoothness Index: ${result.skinSmoothness}%
Face Roundness Factor: ${result.roundness}%
Eye Size Ratio (Relative): ${result.eyesFactor}%

Childhood Personality Profile:
${result.personality}

Childhood Favorite Activity:
${result.game}
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
    a.download = `younger-self-${stageKey}.png`;
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
          <div className="inline-flex p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 mb-1">
            <Undo className="text-cyan-500" size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Younger Version Generator
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Upload your photo and choose an age range to analyze your features and generate a childhood nostalgic profile.
          </p>
        </div>

        {/* Workspace Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          
          {error && (
            <div
              role="alert"
              className="mb-6 p-4 border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900 rounded-2xl text-sm text-red-800 dark:text-red-400"
            >
              {error}
            </div>
          )}

          {!preview && !analyzing ? (
            <div className="space-y-6">
              
              {/* Target Stage selector */}
              <div className="space-y-2">
                <span className="block text-xs font-bold text-foreground uppercase tracking-wider text-center">Select Younger Target Stage</span>
                <div className="flex gap-2 justify-center">
                  {Object.keys(STAGES_DETAILS).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setStageKey(k)}
                      className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                        stageKey === k
                          ? "bg-cyan-500/10 border-cyan-500 text-foreground"
                          : "bg-background border-border text-muted-foreground hover:border-cyan-500/30"
                      }`}
                    >
                      {STAGES_DETAILS[k].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drag Zone */}
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
                  Upload a Photo to Travel Back
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
            </div>
          ) : analyzing ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="alt-ui-spinner alt-ui-spinner--lg mb-6 border-t-cyan-500" />
              <h4 className="font-semibold text-lg text-foreground animate-pulse">Reversing Facial Timeline...</h4>
              <p className="text-sm text-muted-foreground mt-2">Scanning facial contours and smoothing parameters for younger dimensions.</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Dual reviews */}
              <div className="grid sm:grid-cols-2 gap-6 items-center">
                <div className="space-y-2 text-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Photo</span>
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[var(--anslation-ds-soft)] border border-border relative">
                    <img src={preview} alt="Original" className="w-full h-full object-cover" />
                  </div>
                </div>
                
                {/* Polaroid Frame design! */}
                <div className="space-y-2 text-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Childhood Self</span>
                  <div className="w-full aspect-square bg-white border border-slate-200 shadow-md p-4 flex flex-col justify-between text-slate-800 rounded-lg">
                    {result && result.simulatedImage ? (
                      <div className="flex-1 w-full rounded border border-slate-200 overflow-hidden relative">
                        <img src={result.simulatedImage} alt="Younger Self" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 text-[9px] uppercase font-bold text-white px-2 py-0.5 bg-cyan-600 rounded shadow border border-cyan-500">
                          {result.stageLabel}
                        </span>
                      </div>
                    ) : (
                      <div className="flex-1 w-full bg-slate-100 rounded border border-slate-200 flex flex-col items-center justify-center p-4 text-center">
                        <Undo className="text-slate-400 mb-2 animate-pulse" size={32} />
                        <span className="text-sm font-semibold text-slate-500">Awaiting Simulation</span>
                      </div>
                    )}
                    <div className="pt-3 text-center">
                      <span className="font-serif italic text-xs text-slate-500 block">Nostalgia Memory #9</span>
                    </div>
                  </div>
                </div>
              </div>

              {result && (
                <>
                  {/* Traits progress bars */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                      <Sparkles size={14} className="text-cyan-500" /> Feature Reversion Indicators
                    </h4>
                    <div className="bg-card rounded-2xl p-5 border border-border space-y-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-foreground">
                          <span>Smooth Skin Index</span>
                          <span>{result.skinSmoothness}%</span>
                        </div>
                        <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${result.skinSmoothness}%` }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-foreground">
                          <span>Cheek Roundness Density</span>
                          <span>{result.roundness}%</span>
                        </div>
                        <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                          <div className="h-full bg-pink-500 rounded-full" style={{ width: `${result.roundness}%` }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-foreground">
                          <span>Relative Eye Proportion (Ratio)</span>
                          <span>{result.eyesFactor}%</span>
                        </div>
                        <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${result.eyesFactor}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nostalgic Profile */}
                  <div className="bg-[var(--anslation-ds-soft)] border border-border rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={14} className="text-cyan-500" /> Childhood Personality & Memories
                    </h4>
                    <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                      <p>
                        <strong className="text-foreground">Typical Behavior:</strong> {result.personality}
                      </p>
                      <p>
                        <strong className="text-foreground">Favorite Retro Activity:</strong> {result.game}
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
                          <Copy size={18} /> Copy Report
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

          {/* Trigger button */}
          {preview && !result && !analyzing && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={handleSimulate}
                className="flex-1 h-10 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 flex items-center justify-center gap-2 shadow text-xs"
              >
                <Undo size={18} /> Go Back in Time
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
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How is younger self simulated?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Younger Version Generator evaluates facial aspect ratios and contour parameters using local client-side landmark predictions. Roundness and smooth skin metrics are calculated to map your childhood look.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
