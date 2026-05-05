import React from "react";
import { useImageCropper } from "../hooks/useImageCropper";
import UploadArea from "./UploadArea";
import CropEditor from "./CropEditor";
import CropResult from "./CropResult";

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
      </div>
    </div>
  );
};

export default ImageCropper;
