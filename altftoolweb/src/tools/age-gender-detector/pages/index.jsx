"use client";

import { useState, useRef, useEffect } from "react";
import UploadArea from "../components/UploadArea";
import ImagePreview from "../components/ImagePreview";
import ResultPanel from "../components/ResultPanel";
import HowItWorks from "../components/HowItWorks";
import useImageAnalysis from "../hooks/useImageAnalysis";
import WebcamDetector from "../components/WebcamDetector";

import { getFaceDescriptor, compareFaces } from "../services/faceSimilarity";

export default function ToolHome() {
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState("upload");
  const [uploadMode, setUploadMode] = useState("single");
  const [cameraDenied, setCameraDenied] = useState(false);

  const [similarity, setSimilarity] = useState(null);

  const startCameraRef = useRef(null);

  const { analyzing, result, error, analyzeImage, reset, setResult } = useImageAnalysis();

  async function checkSimilarity(img1, img2) {
    const desc1 = await getFaceDescriptor(img1);
    const desc2 = await getFaceDescriptor(img2);

    if (!desc1 || !desc2) {
      console.error("Face not detected in one of the images");
      return;
    }

    const result = compareFaces(desc1, desc2);
    setSimilarity(result);
  }

  // ✅ FIX: Always trigger camera when switching to camera mode
  useEffect(() => {
    if (mode === "camera" && startCameraRef.current) {
      startCameraRef.current();
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-10">
          <h1 className="heading mb-4">Age & Gender Detector</h1>
          <p className="description">
            Upload a photo or use your webcam and our AI will analyze facial
            features to estimate age and gender instantly.
          </p>
        </div>

        {/* Mode Switch */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => { setMode("upload"); setPreview(null); reset(); }}
            className={`px-6 py-3 rounded-xl cursor-pointer font-medium ${mode === "upload" ? "bg-(--primary) text-white" : "bg-(--card) border border-(--border)"
              }`}
          >
            From Device
          </button>

          <button
            onClick={() => { setMode("camera"); setPreview(null); reset(); setCameraDenied(false); }}
            className={`px-6 py-3 rounded-xl cursor-pointer font-medium ${mode === "camera" ? "bg-(--primary) text-white" : "bg-(--card) border border-(--border)"
              }`}
          >
            Use Camera
          </button>
        </div>

        {/* Tool Card */}
        <div className="bg-(--card) rounded-3xl shadow-2xl overflow-hidden">
          {mode === "upload" ? (
            !preview ? (
              <>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => setUploadMode("single")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition ${uploadMode === "single"
                        ? "bg-(--primary) text-white shadow"
                        : "bg-(--card) text-(--muted-foreground) border border-(--border) hover:bg-(--muted-background)"
                      }`}
                  >
                    Single Image
                  </button>

                  <button
                    onClick={() => setUploadMode("compare")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition ${uploadMode === "compare"
                        ? "bg-(--primary) text-white shadow"
                        : "bg-(--card) text-(--muted-foreground) border border-(--border) hover:bg-(--muted-background)"
                      }`}
                  >
                    Compare Two Faces
                  </button>
                </div>

                <UploadArea
                  mode={uploadMode}
                  setPreview={setPreview}
                  analyzeImage={analyzeImage}
                  setResult={setResult}
                />
              </>
            ) : (
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="grid lg:grid-cols-2 gap-8">
                  <ImagePreview
                    mode={uploadMode}
                    preview={preview}
                    onReset={() => { setPreview(null); reset(); }}
                  />
                  <ResultPanel
                    analyzing={analyzing}
                    result={result}
                    error={error}
                    onReset={() => { setPreview(null); reset(); }}
                  />
                </div>
              </div>
            )
          ) : (
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="grid lg:grid-cols-2 gap-8">
                <WebcamDetector
                  onResult={(data) => {
                    setResult(data);
                    setCameraDenied(false); // ✅ FIX: reset if working
                  }}
                  onCameraDenied={() => setCameraDenied(true)}
                  setStartCamera={(fn) => { startCameraRef.current = fn; }}
                />

                <ResultPanel
                  analyzing={false}
                  result={result}
                  error={error}
                  onReset={() => { setMode("upload"); setPreview(null); reset(); }}
                />
              </div>

              {cameraDenied && (
                <div className="mt-4 p-4 bg-(--card) border border-(--border) rounded-xl text-sm text-(--muted-foreground)">
                  <p><strong>Camera access is blocked. Please enable camera from your browser settings.</strong></p>
                  <ol className="list-decimal ml-6 mt-2">
                    <li>Click the lock icon in the browser&apos;s address bar.</li>
                    <li>Allow camera access.</li>
                    <li>Refresh this page.</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        <HowItWorks />
      </div>
    </div>
  );
}
