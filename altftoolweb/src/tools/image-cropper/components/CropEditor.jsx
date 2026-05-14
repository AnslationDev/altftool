import React from "react";
import Cropper from "react-easy-crop";
import { ASPECT_RATIOS } from "../utils/aspectRatio";
import {
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaMobileAlt,
} from "react-icons/fa";
import {
  RotateCw,
  RotateCcw,
  Undo2,
  FlipHorizontal,
  FlipVertical,
} from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

const CropEditor = ({
  imageSrc,
  crop,
  zoom,
  aspect,
  setCrop,
  setAspect,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onAspectChange,
  onCropImage,
  onReset,
  isProcessing,
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
  filters,
  setFilters,
  handleUndo,
  handleResetAll,
  history = [],
}) => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h2 className="text-xl sm: text-2xl font-bold">Adjust Your Crop</h2>
      {/* undo buttton */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
        <button
          onClick={handleUndo}
          disabled={!history || history.length === 0}
          className={` flex-1 sm:flex-none px-3 py-2 rounded-md border border-(--border) text-xs sm:text-sm transition-colors flex items-center  justify-center gap-2 $ {
      !history || history.length === 0
        ? "opacity-50  bg-(--primary)  text-white border-(--primary)"
        : " bg-(--primary) text-white  border-(--primary) hover:opacity-90"
    }`}
        >
          <Undo2 className="w-4 h-4 " />
          Undo
        </button>

        {/* Reset Button */}
        <button
          onClick={handleResetAll}
          className="flex-1 sm:flex-none px-3 py-2 rounded-md text-xs sm:text-sm bg-(--primary) text-white border border-(--primary) hover:opacity-90 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 " />
          Reset
        </button>

        {/*  New Image button */}
        <button
          onClick={onReset}
          className="flex-1 sm:flex-none px-3 py-2 bg-(--primary) text-xs sm:text-sm text-white border border-(--border) rounded-md transition-colors cursor-pointer hover:opacity-90 flex items-center justify-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          New Image
        </button>
      </div>
    </div>

    <div
      className="relative w-full h-80 sm:h-96 md:h-125 bg-(--card) rounded-xl overflow-hidden"
      style={{
        transform: `
    scaleX(${flip.horizontal ? -1 : 1})
    scaleY(${flip.vertical ? -1 : 1})
  `,
      }}
    >
    
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(30px) brightness(0.9)",
          transform: "scale(1.2)",
        }}
      />
      <div
        className="relative z-10 w-full h-full"
        style={{
          "--brightness": filters.brightness,
          "--contrast": filters.contrast,
          "--saturation": filters.saturation,
          "--grayscale": filters.grayscale,
        }}
      >
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          history={history}
          handleUndo={handleUndo}
          handleResetAll={handleResetAll}
          onCropChange={setCrop}
          onZoomChange={onZoomChange}
          onCropComplete={onCropComplete}
          rotation={rotation}
          cropShape="rect"
          showGrid={false}
          classes={{
            containerClassName: "cropper-container",
            mediaClassName: "cropper-media",
            cropAreaClassName: "cropper-crop-area",
          }}
        />
        {/* Advance Grid : */}
        {showGrid && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Rule of Thirds Lines */}
            {showThirds && (
              <>
                <div className="absolute top-0 bottom-0 left-[33.333%] w-px bg-white/70"></div>
                <div className="absolute top-0 bottom-0 left-[66.666%] w-px bg-white/70"></div>

                <div className="absolute left-0 right-0 top-[33.333%] h-px bg-white/70"></div>
                <div className="absolute left-0 right-0 top-[66.666%] h-px bg-white/70"></div>
              </>
            )}

            {/* Center Crosshair */}
            {showCrosshair && (
              <>
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-(--primary)"></div>
                <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-(--primary)"></div>
              </>
            )}
          </div>
        )}
      </div>
    </div>

    <div className="space-y-4">
      <div className="mb-4">
        <label className="block text-lg font-medium text-(--muted-foreground) mb-2">
          Social Presets
        </label>

        <div className="flex flex-wrap gap-2">
          {/* Instagram */}
          <button
            onClick={() => onAspectChange(1)}
            className="px-3 py-1.5  text-xs sm:text-sm font-semibold border border-(--border) rounded-lg flex items-center gap-2 bg-(--card) hover:text-(--primary) shadow-sm hover:shadow-md transition-all"
          >
            <FaInstagram size={16} className="text-pink-500" />
            <span className="text-md">Instagram</span>
          </button>

          {/* Smartphone */}
          <button
            onClick={() => onAspectChange(9 / 16)}
            className="px-3 py-1.5 text-xs sm:text-sm font-semibold border border-(--border) rounded-lg flex items-center gap-2 bg-(--card) hover:text-(--primary) shadow-sm hover:shadow-md transition-all"
          >
            <FaMobileAlt size={16} className="text-slate-600" />
            <span className="text-md">SmartPhone </span>
          </button>

          {/* YouTube */}
          <button
            onClick={() => onAspectChange(16 / 9)}
            className="px-3 py-1.5 text-xs sm:text-sm font-semibold border border-(--border) rounded-lg flex items-center gap-2 bg-(--card) hover:text-(--primary) shadow-sm hover:shadow-md transition-all"
          >
            <FaYoutube size={16} className="text-red-500" />
            <span className="text-md">YouTube</span>
          </button>

          {/* LinkedIn */}
          <button
            onClick={() => onAspectChange(4 / 1)}
            className="px-3 py-1.5 text-xs sm:text-sm font-semibold border border-(--border) rounded-lg flex items-center gap-2 bg-(--card) hover:text-(--primary) shadow-sm hover:shadow-md transition-all"
          >
            <FaLinkedin size={16} className="text-blue-600" />
            <span className="text-md">LinkedIn</span>
          </button>
        </div>
      </div>

      {/* Preset Preview Cards  */}
     <div className="mt-6">
  <label className="block text-lg font-medium text-(--muted-foreground) mb-3">
    Preview Presets
  </label>

  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {[
      { name: "Instagram", aspect: 1 },
      { name: "Story", aspect: 9 / 16 },
      { name: "YouTube", aspect: 16 / 9 },
      { name: "LinkedIn", aspect: 4 / 1 },
    ].map((item) => (
      
      // WRAPPER 
      <div
        key={item.name}
        onClick={() => onAspectChange(item.aspect)}
        className="flex flex-col items-center cursor-pointer group"
      >
        {/*  CARD */}
        <div className="w-full h-32 sm:h-36 md:h-40 rounded-xl overflow-hidden border border-(--border) bg-(--card) group-hover:scale-105 transition-all duration-200">
          
          {imageSrc && (
            <ManagedImage
              src={imageSrc}
              alt={item.name}
              className="w-full h-full object-cover"
              style={{
                transform: `
                  rotate(${rotation}deg)
                  scaleX(${flip.horizontal ? -1 : 1})
                  scaleY(${flip.vertical ? -1 : 1})
                `,
              }}
            />
          )}
        </div>

        {/*  TEXT BELOW CARD */}
        <p className="mt-2 text-sm text-(--muted-foreground)">
          {item.name}
        </p>
      </div>
    ))}
  </div>
</div>

      <div>
        {/* Smart Crop Suggestions  */}
        <div className="mt-3 flex flex-wrap">
          <label className=" text-lg font-medium text-(--muted-foreground) mb-2">
            Smart Crop : 
          </label>
          {/* butttons  */}
          {(() => {
            const btnClass =
              "px-2 py-0.5 text-xs sm:text-sm font-semibold border border-(--border) rounded-md cursor-pointer flex items-center gap-2 hover:text-(--primary) shadow-md hover:bg-(--card)";

            const transformBtnClass =
              "px-3 py-1 text-xs sm:text-sm font-semibold border border-(--border) rounded-md cursor-pointer flex items-center gap-2 hover:text-(--primary) shadow-md hover:bg-(--card)";

            return (
              <div className="flex flex-wrap text-xs sm:text-sm gap-2 mb-2">
                {/* Smart Crop buttons using map */}
                {[
                  { label: "Center", value: { x: 0, y: 0 } },
                  { label: "Top", value: { x: 0, y: -50 } },
                  { label: "Bottom", value: { x: 0, y: 50 } },
                  { label: "Left", value: { x: -50, y: 0 } },
                  { label: "Right", value: { x: 50, y: 0 } },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => setCrop(item.value)}
                    className={btnClass}
                  >
                    {item.label}
                  </button>
                ))}

                {/* Transform Label */}
                <label className=" text-lg font-medium text-(--muted-foreground) mt-1 mb-1">
                  Transform :
                </label>

                {/*  Rotate */}
                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className={transformBtnClass}
                >
                  <RotateCw size={16} />
                  Rotate
                </button>

                {/* Flip Horizontal */}
                <button
                  onClick={() =>
                    setFlip((prev) => ({
                      ...prev,
                      horizontal: !prev.horizontal,
                    }))
                  }
                  className={transformBtnClass}
                >
                  <FlipHorizontal size={16} />
                  Flip
                </button>

                {/* Flip  Vertical */}
                <button
                  onClick={() =>
                    setFlip((prev) => ({ ...prev, vertical: !prev.vertical }))
                  }
                  className={transformBtnClass}
                >
                  <FlipVertical size={16} />
                  Flip
                </button>
              </div>
            );
          })()}
        </div>

        {/* Advance grid */}
        <div className="mt-1">
          <label className="block text-lg font-medium text-(--muted-foreground) mb-2">
            Advanced Grid
          </label>

          {(() => {
            //  Common button style for all 3 grid buttons
            const gridButtonClass =
              "min-w-[140px] sm:min-w-[160px] px-4 py-2.5 rounded-xl border border-(--border) text-sm font-semibold transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md active:scale-95";

            return (
              <div className="flex flex-wrap gap-3 ">
                {/* Grid ON / OFF */}
                <button
                  onClick={() => setShowGrid((prev) => !prev)}
                  className={`${gridButtonClass} ${
                    showGrid
                      ? "bg-(--primary) text-white border-(--primary) text-xs sm:text-sm"
                      : "bg-(--card) text-(--foreground) hover:bg-(--muted) "
                  }`}
                >
                  {showGrid ? "Grid ON" : "Grid OFF"}
                </button>

                {/* Rule of Thirds */}
                <button
                  onClick={() => setShowThirds((prev) => !prev)}
                  disabled={!showGrid}
                  className={`${gridButtonClass} ${
                    showThirds
                      ? "bg-(--primary) text-white border-(--primary) text-xs sm:text-sm"
                      : "bg-(--card) text-(--foreground) hover:bg-(--muted)"
                  } ${!showGrid ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Rule of Thirds
                </button>

                {/* Center Crosshair */}
                <button
                  onClick={() => setShowCrosshair((prev) => !prev)}
                  disabled={!showGrid}
                  className={`${gridButtonClass} ${
                    showCrosshair
                      ? "bg-(--primary) text-white border-(--primary) text-xs sm:text-sm"
                      : "bg-(--card) text-(--foreground) hover:bg-(--muted)"
                  } ${!showGrid ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Center Crosshair
                </button>
              </div>
            );
          })()}
        </div>

        <label className="block text-lg font-medium text-(--muted-foreground)  mt-3 mb-2">
          Aspect Ratio
        </label>

        <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
          {ASPECT_RATIOS.map((ratio) => (
            <button
              key={ratio.name}
              onClick={() => onAspectChange(ratio.value)}
              className={`px-3 py-1.5 text-md  font-semiobold border border-(--border) rounded-lg cursor-pointer flex items-center gap-2 
      transition-all duration-150 ${
        aspect === ratio.value
          ? "bg-(--primary) text-white shadow-md scale-95"
          : "bg-(--card) text-(--foreground) shadow-sm hover:shadow-md hover:bg-(--muted) active:scale-95"
      }`}
              title={ratio.label}
            >
              {ratio.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Size + Resolution Info */}
      <div className="mt-5 ">
        <label className="block text-lg font-medium text-(--muted-foreground) mb-2">
          Live Info
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 ">
          {/* Resolution */}
          <div className="bg-(--card) border border-(--border) rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-(--muted-foreground) uppercase tracking-wide">
              Resolution
            </p>
            <p className="text-base font-semibold text-(--foreground)">
              {liveInfo.width} × {liveInfo.height}px
            </p>
          </div>

          {/* File Size */}
          <div className="bg-(--card) border border-(--border) rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-(--muted-foreground) uppercase tracking-wide">
              File Size
            </p>
            <p className="text-base font-semibold text-(--foreground)">
              ~ {liveInfo.fileSize}
            </p>
          </div>

          {/* Aspect Ratio */}
          <div className="bg-(--card) border border-(--border) rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-(--muted-foreground) uppercase tracking-wide">
              Aspect Ratio
            </p>
            <p className="text-base font-semibold text-(--foreground)">
              {liveInfo.aspectRatio}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <label className="block text:md  sm:text-sm font-medium text-(--muted-foreground) mb-1">
            Zoom
          </label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer accent-(--primary)"
          />
        </div>
        <button
          type="button"
          data-testid="image-cropper-crop-button"
          onClick={onCropImage}
          disabled={isProcessing}
          className={`px-6 py-3 text-sm  font-medium rounded-md transition-colors cursor-pointer ${
            isProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-(--primary) text-white"
          } w-full sm:w-auto`}
        >
          {isProcessing ? (
            <span className="flex  items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            "Crop & Optimize Image"
          )}
        </button>
      </div>

      <div className="mt-5">
        <label className="block text-lg font-medium text-(--muted-foreground) mb-2">
          Filters
        </label>

        <div className="space-y-3">
          {/* Brightness */}
          <div>
            <div className="flex justify-between text-sm text-(--muted-foreground)">
              <span>Brightness</span>
              <span>{filters.brightness.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={filters.brightness}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  brightness: parseFloat(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer accent-(--primary)"
            />
          </div>

          {/* Contrast */}
          <div>
            <div className="flex justify-between text-sm text-(--muted-foreground)">
              <span>Contrast</span>
              <span>{filters.contrast.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={filters.contrast}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  contrast: parseFloat(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer accent-(--primary)"
            />
          </div>

          {/* Saturation */}
          <div>
            <div className="flex justify-between text-sm text-(--muted-foreground)">
              <span>Saturation</span>
              <span>{filters.saturation.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={filters.saturation}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  saturation: parseFloat(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer accent-(--primary)"
            />
          </div>

          {/* Grayscale */}
          <div>
            <div className="flex justify-between text-sm text-(--muted-foreground)">
              <span>Grayscale</span>
              <span>{filters.grayscale.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.grayscale}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  grayscale: parseFloat(e.target.value),
                }))
              }
              className="w-full h-2 bg-gray-500 rounded-lg appearance-none cursor-pointer accent-(--primary)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default CropEditor;
