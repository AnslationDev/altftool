import React from "react";
import { useImageCropper } from "../hooks/useImageCropper";
import UploadArea from "./UploadArea";
import CropEditor from "./CropEditor";
import CropResult from "./CropResult";

function formatBytes(bytes) {
  if (!bytes) return "--";
  const units = ["B", "KB", "MB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

const ImageCropper = () => {
  const {
    imageSrc,
    crop,
    zoom,
    aspect,
    croppedImage,
    isProcessing,
    fileInputRef,
    setCrop,
    setZoom,
    setAspect,
    setCroppedImage,
    onCropComplete,
    onFileChange,
    reset,
    handleCropImage,
    downloadCroppedImage,
    rotation,
    setRotation,
    flip,
    setFlip,
    showGrid,
    setShowGrid,
    showThirds,
    setShowThirds,
    showCrosshair,
    setShowCrosshair,
    liveInfo,
    quality,
    setQuality,
    beforeSize,
    afterSize,
    compressImage,
    handleQualityChange,
    filters,
    setFilters,
    handleUndo,
    handleResetAll,
    history,
    downloadFormat,
    setDownloadFormat,
    downloadSize,
    setDownloadSize,
  } = useImageCropper();
  const outputSummary = croppedImage
    ? [
        "Cropped image ready",
        `Dimensions: ${liveInfo.width || 0} x ${liveInfo.height || 0}`,
        `Format: ${downloadFormat.toUpperCase()}`,
        `Size option: ${downloadSize}`,
        `Before: ${formatBytes(beforeSize)}`,
        `After: ${formatBytes(afterSize)}`,
      ].join("\n")
    : imageSrc
      ? [
          "Image loaded. Adjust the crop and export.",
          `Crop: ${liveInfo.width || 0} x ${liveInfo.height || 0}`,
          `Estimated size: ${liveInfo.fileSize}`,
          `Aspect: ${liveInfo.aspectRatio}`,
        ].join("\n")
      : "Upload an image to crop and optimize.";

  return (
    <div className="bg-(--card) item-center text-(--foreground) py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {!imageSrc && !croppedImage && (
          <UploadArea onFileChange={onFileChange} fileInputRef={fileInputRef} />
        )}

        {imageSrc && !croppedImage && (
          <CropEditor
            imageSrc={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            setCrop={setCrop}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onAspectChange={setAspect}
            onCropImage={handleCropImage}
            onReset={reset}
            isProcessing={isProcessing}
            rotation={rotation}
            setRotation={setRotation}
            flip={flip}
            setFlip={setFlip}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            showThirds={showThirds}
            setShowThirds={setShowThirds}
            showCrosshair={showCrosshair}
            setShowCrosshair={setShowCrosshair}
            liveInfo={liveInfo}
            filters={filters}
            setFilters={setFilters}
            handleUndo={handleUndo}
            handleResetAll={handleResetAll}
            history={history}
            downloadFormat={downloadFormat}
            setDownloadFormat={setDownloadFormat}
            downloadSize={downloadSize}
            setDownloadSize={setDownloadSize}
            quality={quality}
            setQuality={setQuality}
          />
        )}

        {croppedImage && (
          <CropResult
            croppedImage={croppedImage}
            onDownload={downloadCroppedImage}
            onRecrop={() => setCroppedImage(null)}
            onReset={reset}
            originalImage={imageSrc}
            quality={quality}
            beforeSize={beforeSize}
            afterSize={afterSize}
            compressImage={compressImage}
            handleQualityChange={handleQualityChange}
            downloadFormat={downloadFormat}
            setDownloadFormat={setDownloadFormat}
            downloadSize={downloadSize}
            setDownloadSize={setDownloadSize}
          />
        )}

        <section className="mt-6 rounded-xl border border-(--border) bg-(--background) p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-(--foreground)">Output Summary</h2>
            <span className="rounded-lg border border-(--border) bg-(--card) px-2.5 py-1 text-xs font-semibold text-(--muted-foreground)">
              Local crop
            </span>
          </div>
          <pre
            data-testid="tool-output"
            className="min-h-[112px] whitespace-pre-wrap rounded-lg border border-(--border) bg-(--card) p-3 text-sm leading-6 text-(--foreground)"
          >
            {isProcessing ? "Cropping image..." : outputSummary}
          </pre>
        </section>
      </div>
    </div>
  );
};

export default ImageCropper;
