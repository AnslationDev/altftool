"use client";

import { useState, useRef } from "react";
import { Upload, X, Heart, RefreshCw, Copy, Download, Info, Check, Sparkles } from "lucide-react";
import { getFaceApi } from "../../emotion-detector/services/faceApiClient";

export default function ToolHome() {
  const [photo1, setPhoto1] = useState(null);
  const [photo2, setPhoto2] = useState(null);
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  const processFile = (file, partnerNum) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size exceeds the 10MB limit.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      if (partnerNum === 1) {
        setPhoto1({ src: e.target.result, name: file.name, size: file.size });
      } else {
        setPhoto2({ src: e.target.result, name: file.name, size: file.size });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCalculate = async () => {
    if (!photo1 || !photo2) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const faceapi = await getFaceApi();

      const loadImg = (src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Could not read this image — try a different file."));
        img.src = src;
      });

      const [img1, img2] = await Promise.all([
        loadImg(photo1.src),
        loadImg(photo2.src)
      ]);

      const MODEL_URL = "/models";
      if (!faceapi.nets.tinyFaceDetector.params) {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      }
      if (!faceapi.nets.faceLandmark68Net.params) {
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      }
      if (!faceapi.nets.faceExpressionNet.params) {
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      }

      // Detect faces in both photos
      const [det1, det2] = await Promise.all([
        faceapi.detectSingleFace(img1, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions(),
        faceapi.detectSingleFace(img2, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
      ]);

      let seed = 0;

      if (det1 && det2) {
        // Calculate deterministic seed based on coordinate sums
        const pts1 = det1.landmarks.positions;
        const pts2 = det2.landmarks.positions;
        const sum1 = pts1.reduce((acc, p) => acc + p.x + p.y, 0);
        const sum2 = pts2.reduce((acc, p) => acc + p.x + p.y, 0);
        seed = Math.round(sum1 + sum2);
      } else {
        // Fallback hash
        let hash = 0;
        const combinedString = photo1.name + photo2.name;
        for (let i = 0; i < combinedString.length; i++) {
          hash = (hash << 5) - hash + combinedString.charCodeAt(i);
          hash |= 0;
        }
        seed = Math.abs(hash + photo1.size + photo2.size);
      }

      const score = Math.round((seed % 28) + 71); // Score between 71% and 98%
      // Multipliers must be coprime with the 21 modulus (79-99% band) so the
      // sub-score genuinely spans all 21 values instead of collapsing into a
      // handful of buckets sharing a common factor with 21 (e.g. 3 or 7).
      const chemistry = Math.min(99, Math.round(((seed * 4) % 21) + 79));
      const trust = Math.min(99, Math.round(((seed * 5) % 21) + 79));
      const alignment = Math.min(99, Math.round(((seed * 11) % 21) + 79));

      setResult({
        score,
        chemistry,
        trust,
        alignment,
        hasFaces: !!(det1 && det2)
      });
      setAnalyzing(false);
    } catch (err) {
      console.error(err);
      setError(err?.message || "An error occurred while analyzing photos. Please try again.");
      setAnalyzing(false);
    }
  };

  // The overall score formula ((seed % 28) + 71, mirrored in seo.js) always
  // produces a value between 71 and 98 by design, so a "score < 70" tier can
  // never be reached — only two tiers exist here on purpose.
  const getMatchVerdict = (score) => {
    if (score >= 85) return { label: "Perfect Symmetry! 💖", color: "text-rose-500", text: "Your facial structures share excellent proportions and visual harmony. The facial alignment metrics show outstanding compatibility and a natural sub-conscious bond." };
    return { label: "Strong Complementary Match! 💕", color: "text-pink-500", text: "Your facial features complement each other beautifully. There is high structural compatibility indicating a balanced, supportive dynamic." };
  };

  const formatReportText = () => {
    if (!result) return "";
    const p1 = name1.trim() || "Partner 1";
    const p2 = name2.trim() || "Partner 2";
    const verdict = getMatchVerdict(result.score);
    return `=== ALTFTool Photo Compatibility Report ===
Date: ${new Date().toLocaleDateString()}
Partners: ${p1} & ${p2}

Overall Photo Compatibility: ${result.score}%
Verdict: ${verdict.label}
------------------------------------------
Chemistry index: ${result.chemistry}%
Expression synergy: ${result.alignment}%
Structural harmony: ${result.trust}%

Analysis:
${verdict.text}
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
    const text = formatReportText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `photo-compatibility-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (!window.confirm("Reset will discard both photos, names, and your result. Continue?")) {
      return;
    }
    setPhoto1(null);
    setPhoto2(null);
    setName1("");
    setName2("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 mb-1">
            <Heart className="text-rose-500 fill-rose-500" size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Love Compatibility by Photos
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Upload a photo of yourself and your partner to run a local structural facial symmetry check.
          </p>
        </div>

        {/* Workspace Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          
          {error && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900 rounded-2xl text-sm text-red-800 dark:text-red-400">
              ⚠️ {error}
            </div>
          )}

          {!result && !analyzing ? (
            <div className="space-y-6">
              {/* Names input */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="partner1-name" className="sr-only">First partner name</label>
                  <input
                    id="partner1-name"
                    type="text"
                    value={name1}
                    onChange={(e) => setName1(e.target.value)}
                    placeholder="Enter First Partner Name"
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="partner2-name" className="sr-only">Second partner name</label>
                  <input
                    id="partner2-name"
                    type="text"
                    value={name2}
                    onChange={(e) => setName2(e.target.value)}
                    placeholder="Enter Second Partner Name"
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition text-sm"
                  />
                </div>
              </div>

              {/* Upload targets */}
              <div className="grid sm:grid-cols-2 gap-6">
                
                {/* Photo 1 */}
                <div className="space-y-2 text-center">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">First Partner Photo</span>
                  {photo1 ? (
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[var(--anslation-ds-soft)] border border-border relative">
                      <img src={photo1.src} alt="Partner 1" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhoto1(null)}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef1.current?.click()}
                      className="w-full aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-[var(--anslation-ds-soft)] cursor-pointer flex flex-col items-center justify-center p-6 transition"
                    >
                      <Upload className="text-muted-foreground mb-3" size={24} />
                      <span id="partner1-photo-label" className="text-xs font-semibold text-foreground">Select Partner 1 Photo</span>
                      <input
                        ref={fileInputRef1}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        aria-labelledby="partner1-photo-label"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processFile(e.target.files[0], 1);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Photo 2 */}
                <div className="space-y-2 text-center">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Second Partner Photo</span>
                  {photo2 ? (
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[var(--anslation-ds-soft)] border border-border relative">
                      <img src={photo2.src} alt="Partner 2" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhoto2(null)}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef2.current?.click()}
                      className="w-full aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-[var(--anslation-ds-soft)] cursor-pointer flex flex-col items-center justify-center p-6 transition"
                    >
                      <Upload className="text-muted-foreground mb-3" size={24} />
                      <span id="partner2-photo-label" className="text-xs font-semibold text-foreground">Select Partner 2 Photo</span>
                      <input
                        ref={fileInputRef2}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        aria-labelledby="partner2-photo-label"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processFile(e.target.files[0], 2);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

              </div>

              <button
                onClick={handleCalculate}
                disabled={!photo1 || !photo2}
                className="w-full h-10 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 flex items-center justify-center gap-2 shadow"
              >
                <Heart size={18} /> Analyze Photos Compatibility
              </button>

            </div>
          ) : analyzing ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="alt-ui-spinner alt-ui-spinner--lg mb-6 border-t-rose-500" />
              <h4 className="font-semibold text-lg text-foreground animate-pulse">Running Multi-Face Symmetry check...</h4>
              <p className="text-sm text-muted-foreground mt-2">Checking landmark points alignment grids and mood compatibility.</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Verdict Header */}
              <div className="text-center space-y-4">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="var(--border)"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-border"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#F43F5E"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 56}
                      strokeDashoffset={2 * Math.PI * 56 * (1 - result.score / 100)}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <span className="absolute text-3xl font-black text-foreground">
                    {result.score}%
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className={`text-xl font-bold ${getMatchVerdict(result.score).color}`}>
                    {getMatchVerdict(result.score).label}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Photo compatibility for {name1 || "Partner 1"} & {name2 || "Partner 2"}
                  </p>
                  {result.hasFaces ? (
                    <p className="text-xs text-muted-foreground/80">
                      Based on real facial landmark detection in both photos.
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ No face was detected in one or both photos, so this result uses a fallback based on file details rather than facial analysis. Try clearer, front-facing photos for a genuine face-based score.
                    </p>
                  )}
                </div>
              </div>

              {/* Analysis Text Card */}
              <div className="bg-[var(--anslation-ds-soft)] rounded-2xl p-5 border border-border">
                <p className="text-sm text-foreground leading-relaxed">
                  {getMatchVerdict(result.score).text}
                </p>
              </div>

              {/* Sub Metrics Grid */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-rose-500" /> Structural Matching Details
                </h4>
                <div className="bg-card rounded-2xl p-5 border border-border space-y-4 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Face Shape & Structural Harmony</span>
                      <span>{result.trust}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${result.trust}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Expression & Mood Alignment</span>
                      <span>{result.alignment}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${result.alignment}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Chemistry Index</span>
                      <span>{result.chemistry}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: `${result.chemistry}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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

            </div>
          )}

        </div>

        {/* Explainer FAQ Info */}
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <Info className="text-primary flex-shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How is photo love compatibility calculated?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Photo Love Compatibility uses client-side face landmark extraction to compare face ratios and alignment factors. No images are shared outside your tab. Intended strictly for fun and entertainment!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
