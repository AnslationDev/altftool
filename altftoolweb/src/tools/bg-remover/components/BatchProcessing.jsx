"use client";

import { useEffect, useState } from "react";
import JSZip from "jszip";
import {CircleCheck} from "lucide-react";

let backgroundRemovalModulePromise;

async function removeImageBackground(file) {
  backgroundRemovalModulePromise ||= import("@imgly/background-removal");
  const { removeBackground } = await backgroundRemovalModulePromise;
  return removeBackground(file);
}

export default function BatchProcessor({ files }) {
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!files || files.length === 0) return undefined;

    let cancelled = false;
    const tempResults = [];

    const processBatch = async () => {
      setIsProcessing(true);
      setResults([]);
      setProgress(0);

      for (let i = 0; i < files.length; i++) {
        if (cancelled) break;

        try {
          const blob = await removeImageBackground(files[i]);
          const url = URL.createObjectURL(blob);
          if (cancelled) {
            URL.revokeObjectURL(url);
            break;
          }

          tempResults.push(url);

          //update progress
          setProgress(Math.round(((i + 1) / files.length) * 100));
        } catch (err) {
          console.error("Error processing image:", err);
        }
      }

      if (!cancelled) {
        setResults(tempResults);
        setIsProcessing(false);
      }
    };

    processBatch();

    return () => {
      cancelled = true;
      tempResults.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  // ZIP download
  const handleDownloadZip = async () => {
    const zip = new JSZip();

    for (let i = 0; i < results.length; i++) {
      const res = await fetch(results[i]);
      const blob = await res.blob();
      zip.file(`image-${i + 1}.png`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "batch-images.zip";
    link.click();
  };

  return (
    <div className="mt-10 text-center">
      {/* ✅ Progress UI */}
      {isProcessing && (
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-(--primary) transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-medium">
            Processing... {progress}%
          </p>
        </div>
      )}

      {/* ✅ Done UI */}
      {!isProcessing && results.length > 0 && (
        <div>
          <p className="mb-4 font-semibold flex items-center justify-center gap-2">
            <CircleCheck size={16} />
            {results.length} images processed
          </p>

          <button
            onClick={handleDownloadZip}
            className="bg-(--primary) text-white px-6 py-3 rounded-xl font-semibold cursor-pointer"
          >
            Download All as ZIP
          </button>
        </div>
      )}
    </div>
  );
}
