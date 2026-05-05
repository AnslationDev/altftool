"use-client";
import React, { useState, useEffect, useCallback } from "react";
import {
  ScanText,
  Upload,
  Copy,
  Check,
  RotateCcw,
  Image,
  FileImage,
  Shield,
  Zap,
  AlertCircle,
} from "lucide-react";
import Header from "./Header";

// Tesseract Loader
const loadTesseract = () => {
  return new Promise((resolve, reject) => {
    if (window.Tesseract || window.tesseract) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js";
    script.onload = () => resolve();
    script.onerror = () => reject("Failed to load Tesseract.js");
    document.head.appendChild(script);
  });
};

// OCR Runner
const runOCR = async (file, onProgress) => {
  const TS = window.Tesseract || window.tesseract;
  if (!TS) throw new Error("Tesseract.js not loaded. Refresh page.");

  return await TS.recognize(file, "eng", {
    logger: (m) => {
      if (m.status.includes("recognizing") || m.status.includes("loading"))
        onProgress(Math.round(m.progress * 100));
    },
  });
};

export default function MainComponent() {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [ocrResult, setOcrResult] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState("");
  const [tesseractLoaded, setTesseractLoaded] = useState(false);
  const [loadingTesseract, setLoadingTesseract] = useState(true);

  // Load Tesseract
  useEffect(() => {
    const init = async () => {
      try {
        await loadTesseract();
        setTesseractLoaded(true);
      } catch {
        setError("Failed to load OCR engine. Please refresh page.");
      }
      setLoadingTesseract(false);
    };
    init();
  }, []);

  const doOCR = useCallback(async (file) => {
    setProcessing(true);
    setProgress(0);
    setError("");
    setOcrResult("");

    try {
      const { data } = await runOCR(file, setProgress);
      const formatted = `--- Confidence: ${data.confidence.toFixed(2)}% ---\n\n${data.text}`;
      setOcrResult(formatted);
    } catch {
      setError("Failed to extract text. Try another image.");
    }

    setProcessing(false);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match("image/jpeg") && !file.type.match("image/png")) {
      setError("Upload JPG or PNG only.");
      return;
    }

    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImageUrl(url);
    await doOCR(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImageUrl(url);
    await doOCR(file);
  };

  const handleCopy = () => {
    const text = ocrResult.replace(/--- Confidence:.*---\n\n/, "");
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleClear = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageFile(null);
    setImageUrl(null);
    setProgress(0);
    setOcrResult("");
    setError("");
  };

  return (
    <div className="space-y-6 p-7">
      <Header />
      {/* GRID */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* LEFT: Image Upload */}
        <div className="rounded-xl bg-(--card) border border-(--border) p-5">
          <h2 className="text-xl font-bold flex items-center gap-2 text-(--foreground)">
            <Image className="h-5 w-5 text-(--primary)" />
            Image Input
          </h2>
          <p className="text-sm text-(--muted-foreground)">
            Upload an image to extract text.
          </p>

          <div className="mt-4">
            {!imageUrl ? (
              <div
                className="border-2 border-dashed border-(--border) hover:border-(--primary) rounded-lg p-8 text-center cursor-pointer transition"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("file-upload").click()}
              >
                <Upload className="mx-auto h-12 w-12 text-(--muted-foreground)" />
                <p className="mt-4 font-medium text-(--foreground)">
                  Drag & drop an image
                </p>
                <p className="text-sm text-(--muted-foreground)">
                  JPG or PNG only
                </p>

                <button
                  disabled={!tesseractLoaded}
                  className="mt-4 px-4 py-2 rounded-md bg-(--primary) text-(--primary-foreground) cursor-pointer"
                >
                  {loadingTesseract ? "Loading OCR..." : "Select Image"}
                </button>

                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <img
                  src={imageUrl}
                  className="rounded-lg border border-(--border) max-h-64 mx-auto object-contain"
                />

                {processing && (
                  <div className="w-full">
                    <div className="w-full h-2 bg-(--muted) rounded-full">
                      <div
                        className="h-2 bg-(--primary) rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm text-(--muted-foreground)">
                      Processing {progress}%
                    </p>
                  </div>
                )}

                <button
                  onClick={handleClear}
                  className="w-full py-2 rounded-md border border-(--border) text-(--foreground) cursor-pointer"
                >
                  <RotateCcw className="inline h-4 w-4 mr-2" />
                  Clear
                </button>
              </div>
            )}

            {error && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded bg-red-500/10 text-red-500">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Extracted Text */}
        <div className="rounded-xl bg-(--card) border border-(--border) p-5">
          <h2 className="text-xl font-bold flex items-center gap-2 text-(--foreground)">
            <FileImage className="h-5 w-5 text-(--primary)" />
            Extracted Text
          </h2>

          <textarea
            disabled={processing}
            value={ocrResult.replace(/--- Confidence:.*---\n\n/, "")}
            onChange={(e) => setOcrResult(e.target.value)}
            placeholder={
              processing
                ? "Extracting text..."
                : "Extracted text will appear here"
            }
            className="mt-3 w-full min-h-64 p-3 rounded-md border border-(--border) bg-(--background) text-(--foreground)"
          />

          <button
            onClick={handleCopy}
            disabled={!ocrResult}
            className="w-full mt-3 py-2 rounded-md bg-(--primary) text-(--primary-foreground) cursor-pointer"
          >
            {copySuccess ? (
              <>
                <Check className="inline mr-2 h-4 w-4" /> Copied!
              </>
            ) : (
              <>
                <Copy className="inline mr-2 h-4 w-4" /> Copy Text
              </>
            )}
          </button>

          {ocrResult && (
            <p className="mt-3 text-sm text-(--muted-foreground)">
              Confidence: {ocrResult.match(/--- Confidence: ([\d.]+)%/)?.[1]}%
            </p>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="rounded-xl bg-(--card) border border-(--border) p-6">
        <h2 className="text-xl font-bold text-center sm:text-left">Features</h2>

        <div className="grid gap-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureItem
            icon={Shield}
            title="Privacy First"
            desc="All OCR happens locally in your browser."
          />
          <FeatureItem
            icon={Zap}
            title="Fast & Accurate"
            desc="Powered by Tesseract.js OCR engine."
          />
          <FeatureItem
            icon={Image}
            title="Wide Support"
            desc="Works with JPG & PNG images."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-full bg-(--primary)/10">
        <Icon className="h-5 w-5 text-(--primary)" />
      </div>
      <div>
        <h3 className="font-semibold text-(--foreground)">{title}</h3>
        <p className="text-sm text-(--muted-foreground)">{desc}</p>
      </div>
    </div>
  );
}
