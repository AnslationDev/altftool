"use client";

import { useState } from "react";
import Header from "../components/Header";
import UploadBox from "../components/UploadBox";
import StyleSelector from "../components/StyleSelector";
import Controls from "../components/Controls";
import ComparisonView from "../components/ComparisonView";
import ExportOptions from "../components/ExportOptions";
import Features from "../components/Features";
import { useImageProcessing } from "../hooks/useImageProcessing";

export default function CartoonYourself() {
  const {
    file,
    previewUrl,
    error,
    canvasRef,
    selectedStyle,
    setSelectedStyle,
    adjustments,
    updateAdjustment,
    resetAdjustments,
    handleFile,
    handleDrop,
    handleDragOver,
    removeImage,
  } = useImageProcessing();

  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(0.9);

  return (
    <div className="px-4 py-6">
      <Header />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-(--card) border border-(--border) rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
              <h3 className="text-lg font-semibold text-(--foreground) mb-4">Upload Image</h3>
              <UploadBox
                previewUrl={previewUrl}
                error={error}
                onFile={handleFile}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onRemove={removeImage}
              />
            </div>

            <StyleSelector selectedStyle={selectedStyle} onSelect={setSelectedStyle} />

            <Controls
              adjustments={adjustments}
              onUpdate={updateAdjustment}
              onReset={resetAdjustments}
            />
          </div>

          <div className="space-y-6">
            <ComparisonView previewUrl={previewUrl} canvasRef={canvasRef} />

            <ExportOptions
              canvasRef={canvasRef}
              format={format}
              setFormat={setFormat}
              quality={quality}
              setQuality={setQuality}
              previewUrl={previewUrl}
            />
          </div>
        </div>
      </div>

      <Features />
    </div>
  );
}
