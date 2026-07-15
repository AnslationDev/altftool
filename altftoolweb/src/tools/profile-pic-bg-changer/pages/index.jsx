"use client";

import { useState, useCallback, useEffect } from "react";
import Header from "../components/Header";
import UploadBox from "../components/UploadBox";
import ImagePreview from "../components/ImagePreview";
import ResultPreview from "../components/ResultPreview";
import BackgroundSelector from "../components/BackgroundSelector";
import { useAlert } from "@/shared/ui/AlertProvider";

let backgroundRemovalModulePromise;

async function removeImageBackground(file) {
  backgroundRemovalModulePromise ||= import("@imgly/background-removal");
  const { removeBackground } = await backgroundRemovalModulePromise;
  return removeBackground(file);
}

export default function ToolHome() {
  const [originalImage, setOriginalImage] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [removedBgImage, setRemovedBgImage] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBg, setSelectedBg] = useState(null);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const { showAlert } = useAlert();

  const BACKGROUND_PRESETS = [
    { name: "White", type: "color", value: "#FFFFFF" },
    { name: "Light Gray", type: "color", value: "#F1F5F9" },
    { name: "Teal", type: "color", value: "#14B8A6" },
    { name: "Blue", type: "color", value: "#3B82F6" },
    { name: "Navy", type: "color", value: "#1E293B" },
    { name: "Charcoal", type: "color", value: "#334155" },
    { name: "Warm Beige", type: "color", value: "#FDF2E9" },
    { name: "Soft Pink", type: "color", value: "#FDF2F8" },
    { name: "Lavender", type: "color", value: "#F3E8FF" },
    { name: "Mint", type: "color", value: "#ECFDF5" },
    { name: "Sunset Gradient", type: "gradient", value: "linear-gradient(135deg, #FF6B6B, #FFE66D)" },
    { name: "Ocean Gradient", type: "gradient", value: "linear-gradient(135deg, #2193B0, #6DD5ED)" },
    { name: "Forest Gradient", type: "gradient", value: "linear-gradient(135deg, #11998E, #38EF7D)" },
    { name: "Midnight Gradient", type: "gradient", value: "linear-gradient(135deg, #0F2027, #203A43, #2C5364)" },
    { name: "Aurora Gradient", type: "gradient", value: "linear-gradient(135deg, #667EEA, #764BA2)" },
    { name: "Warm Glow", type: "gradient", value: "linear-gradient(135deg, #F2994A, #F2C94C)" },
    { name: "Office Blur", type: "image", value: "/backgrounds/office.png" },
    { name: "Beach", type: "image", value: "/backgrounds/beach.png" },
    { name: "Studio", type: "image", value: "/backgrounds/studio.png" },
    { name: "City", type: "image", value: "/backgrounds/office.png" },
    { name: "Nature Blur", type: "image", value: "/backgrounds/beach.png" },
    { name: "Bokeh", type: "image", value: "/backgrounds/blur.png" },
  ];

  useEffect(() => {
    return () => {
      if (originalImage) URL.revokeObjectURL(originalImage);
      if (removedBgImage) URL.revokeObjectURL(removedBgImage);
      if (finalImage) URL.revokeObjectURL(finalImage);
    };
  }, []);

  const processImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 15 * 1024 * 1024) {
      showAlert("File is too large! Max 15 MB.", "error");
      return;
    }

    if (originalImage) URL.revokeObjectURL(originalImage);
    if (removedBgImage) URL.revokeObjectURL(removedBgImage);
    if (finalImage) URL.revokeObjectURL(finalImage);

    setFinalImage(null);
    setSelectedBg(null);
    setRemovedBgImage(null);
    setIsLoading(true);
    setOriginalFile(file);

    const originalUrl = URL.createObjectURL(file);
    setOriginalImage(originalUrl);

    try {
      const resultBlob = await removeImageBackground(file);
      const resultUrl = URL.createObjectURL(resultBlob);
      setRemovedBgImage(resultUrl);
      setFinalImage(resultUrl);
    } catch (err) {
      console.error(err);
      showAlert("Background removal failed. Try a different image.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const applyBackground = useCallback(async (bgValue, fgUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = fgUrl;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;

        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;

        if (bgValue.startsWith("linear-gradient")) {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = size;
          tempCanvas.height = size;
          const tempCtx = tempCanvas.getContext("2d");
          const grad = tempCtx.createLinearGradient(0, 0, size, size);
          const colors = bgValue.match(/#[A-Fa-f0-9]{6}/g);
          if (colors && colors.length >= 2) {
            colors.forEach((c, i) => {
              grad.addColorStop(i / (colors.length - 1), c);
            });
            tempCtx.fillStyle = grad;
          } else {
            tempCtx.fillStyle = "#FFFFFF";
          }
          tempCtx.fillRect(0, 0, size, size);
          ctx.drawImage(tempCanvas, 0, 0);
        } else if (bgValue.startsWith("#")) {
          ctx.fillStyle = bgValue;
          ctx.fillRect(0, 0, size, size);
        } else {
          const bg = new Image();
          bg.crossOrigin = "anonymous";
          bg.src = bgValue;
          bg.onload = () => {
            ctx.drawImage(bg, 0, 0, size, size);
            ctx.save();
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
            ctx.restore();
            canvas.toBlob((blob) => resolve(URL.createObjectURL(blob)));
          };
          bg.onerror = () => {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, size, size);
            ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
            canvas.toBlob((blob) => resolve(URL.createObjectURL(blob)));
          };
          return;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
        ctx.restore();

        canvas.toBlob((blob) => resolve(URL.createObjectURL(blob)));
      };
    });
  }, []);

  useEffect(() => {
    if (!removedBgImage) return;
    let cancelled = false;

    const compose = async () => {
      if (selectedBg) {
        const next = await applyBackground(selectedBg, removedBgImage);
        if (!cancelled) setFinalImage(next);
      } else {
        setFinalImage(removedBgImage);
      }
    };

    compose();
    return () => { cancelled = true; };
  }, [removedBgImage, selectedBg, applyBackground]);

  const handleBgSelect = (bg) => {
    setSelectedBg(bg);
  };

  const handleReset = () => {
    if (originalImage) URL.revokeObjectURL(originalImage);
    if (removedBgImage) URL.revokeObjectURL(removedBgImage);
    if (finalImage) URL.revokeObjectURL(finalImage);
    setOriginalImage(null);
    setOriginalFile(null);
    setRemovedBgImage(null);
    setFinalImage(null);
    setSelectedBg(null);
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        <Header />

        <div className="mt-6">
          <UploadBox processImage={processImage} isLoading={isLoading} />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          {originalImage && (
            <ImagePreview image={originalImage} label="Original" />
          )}
          {finalImage && (
            <ResultPreview
              image={finalImage}
              onReset={handleReset}
              aspectRatio={aspectRatio}
            />
          )}
        </div>

        {removedBgImage && (
          <BackgroundSelector
            presets={BACKGROUND_PRESETS}
            onSelect={handleBgSelect}
            selected={selectedBg}
            onUploadCustom={(file) => {
              const url = URL.createObjectURL(file);
              handleBgSelect(url);
            }}
          />
        )}
      </div>
    </main>
  );
}
