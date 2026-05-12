"use client";

import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from "react";
import axios from "axios";

import UploadBox from "./UploadBox";
import ActionButtons from "./ActionButtons";
import Controls from "./Controls";
import CropLayout from "./CropLayout";
import FrameEffects from "./FrameEffects";
import TextOverlay from "./TextOverlay";
import ExportOptions from "./ExportOptions";
import EngagementPanel from "./EngagementPanel";
import PresetManager from "./PresetManager";

import { apply3DEffect } from "../utils/threeDEffect";


export default function MainComponent() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [bgRemovedUrl, setBgRemovedUrl] = useState(null);

  const [size, setSize] = useState(256);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [blur, setBlur] = useState(0);

  const [style, setStyle] = useState("round");
  const [bgType, setBgType] = useState("transparent");
  const [bgColor, setBgColor] = useState("#ffffff");

  const [bgImage, setBgImage] = useState(null);
  const [bgSource, setBgSource] = useState("color");
  const [bgBlur, setBgBlur] = useState(false);

  const [faceFocus, setFaceFocus] = useState(false);
  const [skinSmooth, setSkinSmooth] = useState(false);
  const [eyeSharpen, setEyeSharpen] = useState(false);
  const [avatarMode, setAvatarMode] = useState("none");

  const canvasRef = useRef(null);
  const imageRef = useRef(new Image());
  const bgImgRef = useRef(new Image());
  const drawToCanvasRef = useRef(() => {});
  const colorRef = useRef();

  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [padding, setPadding] = useState(0);
  const [radius, setRadius] = useState(100);
  const [aspect, setAspect] = useState(1);

  const [frameType, setFrameType] = useState("none");
  const [borderWidth, setBorderWidth] = useState(10);
  const [shadow, setShadow] = useState(false);
  const [glow, setGlow] = useState(false);

  const [text, setText] = useState("");
  const [subText, setSubText] = useState("");
  const [textSize, setTextSize] = useState(20);
  const [textColor, setTextColor] = useState("#ffffff");

  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState(0.9);

  const [presets, setPresets] = useState([]);
const [history, setHistory] = useState([]);

  /* ---------------- Main Image Load ---------------- */
  useEffect(() => {
    const src = bgRemovedUrl || previewUrl;
    if (!src) return;

    const img = imageRef.current;
    img.crossOrigin = "anonymous";

    img.onload = () => requestAnimationFrame(() => drawToCanvasRef.current());
    img.src = src;
  }, [previewUrl, bgRemovedUrl]);

  /* ---------------- Background Image Load ---------------- */
  useEffect(() => {
    if (!bgImage) return;

    const img = bgImgRef.current;
    img.crossOrigin = "anonymous";
    img.src = bgImage;

    img.onload = () => drawToCanvasRef.current();
  }, [bgImage]);
/* ---------------- Optimized Draw Trigger ---------------- */
  useEffect(() => {
    const t = setTimeout(() => drawToCanvasRef.current(), 30);
    return () => clearTimeout(t);
  }, [
    zoom,
    brightness,
    contrast,
    saturation,
    blur,
    size,
    style,
    bgType,
    bgColor,
    faceFocus,
    skinSmooth,
    eyeSharpen,
    bgImage,
    bgSource,
    bgBlur,
    avatarMode,
    offsetX,
    offsetY,
    padding,
    radius,
    aspect,
    frameType,
    borderWidth,
    shadow,
    glow,
    text,
    subText,
    textSize,
    textColor,
  ]);
// HISTORY TRACKER
useEffect(() => {
  const state = {
    zoom,
    brightness,
    contrast,
    saturation,
    bgColor,
    frameType,
    borderWidth,
    text,
    textColor,
  };

  const updateHistory = setTimeout(() => setHistory((prev) => {
    const updated = [state, ...prev];
    return updated.slice(0, 5);
  }), 0);

  return () => clearTimeout(updateHistory);
}, [zoom, brightness, contrast, saturation, bgColor, borderWidth, frameType, text, textColor]);

  /* ---------------- Canvas Draw ---------------- */
  useLayoutEffect(() => {
    drawToCanvasRef.current = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = imageRef.current;
    const bgImg = bgImgRef.current;
    const dSize = size;

    canvas.width = dSize;
    if (aspect === 1) {
      canvas.height = dSize;
    } else if (aspect === 4 / 5) {
      canvas.height = dSize * (5 / 4);
    } else if (aspect === 9 / 16) {
      canvas.height = dSize * (16 / 9);
    }

    /* ---------- Background --------- */
    if (
      (bgSource === "preset" || bgSource === "custom") &&
      bgImage &&
      bgImg.complete
    ) {
      ctx.save();

      if (bgBlur) ctx.filter = "blur(10px)";

      const scale = Math.max(dSize / bgImg.width, dSize / bgImg.height);
      const bw = bgImg.width * scale;
      const bh = bgImg.height * scale;
      const bx = (dSize - bw) / 2;
      const by = (dSize - bh) / 2;

      ctx.drawImage(bgImg, bx, by, bw, bh);
      ctx.restore();
    } else {
      if (bgType === "transparent") ctx.clearRect(0, 0, dSize, dSize);
      else {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, dSize, dSize);
      }
    }

    if (!img.width || !img.height) return;

    /* ---------- Image ---------- */
    const finalZoom = faceFocus ? zoom * 1.2 : zoom;

    

    const cW = canvas.width - padding * 2;
    const cH = canvas.height - padding * 2;

    const scale = Math.min(cW / img.width, cH / img.height) * finalZoom;

    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (canvas.width - dw) / 2 + offsetX;
    const dy = (canvas.height - dh) / 2 + offsetY;

    ctx.save();

    let filter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
      blur(${blur}px)
    `;
    

    
    if (avatarMode === "cartoon") {
      filter += " contrast(140%) saturate(140%)";
    }

    if (avatarMode === "sketch") {
      filter += " grayscale(100%) contrast(160%)";
    }

    if (avatarMode === "anime") {
      filter += " saturate(170%) contrast(120%) brightness(110%)";
    }

    if (avatarMode === "3d") {
      filter += " contrast(130%) brightness(105%)";
    }

    ctx.filter = filter; //  IMPORTANT FIX
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();

    /* ---------- Round Crop ---------- */
    const r = (radius / 100) * (Math.min(cW, cH) / 2);
    const temp = document.createElement("canvas");
    temp.width = canvas.width;
    temp.height = canvas.height;
    const tctx = temp.getContext("2d");
    tctx.beginPath();
    tctx.moveTo(r, 0);
    tctx.lineTo(cW - r, 0);
    tctx.quadraticCurveTo(cW, 0, cW, r);
    tctx.lineTo(cW, cH - r);
    tctx.quadraticCurveTo(cW, cH, cW - r, cH);
    tctx.lineTo(r, cH);
    tctx.quadraticCurveTo(0, cH, 0, cH - r);
    tctx.lineTo(0, r);
    tctx.quadraticCurveTo(0, 0, r, 0);
    tctx.closePath();
    tctx.clip();
    tctx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, cW, cH);
    ctx.drawImage(temp, 0, 0);

    /* ---------- FRAME EFFECTS  ---------- */

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radiusBase = Math.min(cW, cH) / 2 - borderWidth / 2;

    ctx.save();

    // Shadow
    if (shadow) {
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;
    }

    // Glow
    if (glow) {
      ctx.shadowColor = "rgba(255, 0, 200, 0.8)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Instagram Ring
    if (frameType === "instagram") {
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height,
      );
      gradient.addColorStop(0, "#feda75");
      gradient.addColorStop(0.3, "#fa7e1e");
      gradient.addColorStop(0.6, "#d62976");
      gradient.addColorStop(1, "#962fbf");

      ctx.strokeStyle = gradient;
      ctx.lineWidth = borderWidth;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radiusBase, 0, Math.PI * 2);
      ctx.stroke();
    }

    // LinkedIn
    if (frameType === "linkedin") {
      // ── Full green circle ──
      ctx.strokeStyle = "#00a86b";
      ctx.lineWidth = borderWidth;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(centerX, centerY, radiusBase, 0, Math.PI * 2);
      ctx.stroke();

      // ── Curved text at BOTTOM arc ──
      const text = "#OPENTOWORK";
      const fontSize = Math.max(10, Math.round(borderWidth * 1.1));
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const textStartAngle = (220 * Math.PI) / 180;
      const textEndAngle = (320 * Math.PI) / 180;
      const totalAngle = textEndAngle - textStartAngle;

      const chars = text.split("");
      const anglePerChar = totalAngle / (chars.length + 1);

      const textRadius = radiusBase;

      chars.forEach((char, i) => {
        const angle = textStartAngle + (i + 1) * anglePerChar;
        const x = centerX + textRadius * Math.cos(angle);
        const y = centerY + textRadius * Math.sin(angle);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI / 2); // tangent rotation
        ctx.fillText(char, 0, 0);
        ctx.restore();
      });
    }
    // ---------- TEXT OVERLAY ----------}
    if (text) {
      ctx.save();

      ctx.fillStyle = textColor;
      ctx.textAlign = "center";

      ctx.font = `bold ${textSize}px Arial`;
      ctx.fillText(text, canvas.width / 2, canvas.height - 40);

      if (subText) {
        ctx.font = `${textSize - 6}px Arial`;
        ctx.fillText(subText, canvas.width / 2, canvas.height - 20);
      }
      ctx.restore();

      
    }

    
    };
  });
  /* ---------------- Avatar Mode ---------------- */
  function handleAvatarMode(mode) {
    if (!previewUrl && !bgRemovedUrl) return;

    setAvatarMode(mode);

    // only special case for real 3D
    if (mode === "3d") {
      setTimeout(() => {
        const canvas = canvasRef.current;
        const img = imageRef.current;
        if (canvas && img) apply3DEffect(canvas, img);
      }, 50);
    }
  }
  // apply Preset
  const applyPreset = (preset) => {
  // 👉 OLD PRESETS (string)
  if (typeof preset === "string") {
    if (preset === "studio") {
      setBrightness(110);
      setContrast(120);
      setSaturation(110);
    }

    if (preset === "natural") {
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
    }

    if (preset === "night") {
      setBrightness(80);
      setContrast(130);
      setSaturation(90);
    }

    return; 
  }
// NEW SAVED PRESETS (object)
  setZoom(preset.zoom);
  setBrightness(preset.brightness);
  setContrast(preset.contrast);
  setSaturation(preset.saturation);
  setBgColor(preset.bgColor);
  setFrameType(preset.frameType);
  setBorderWidth(preset.borderWidth);
  setText(preset.text);
  setTextColor(preset.textColor);
};
  // ✅ GET CURRENT SETTINGs
const getCurrentState = useCallback(() => ({
  zoom,
  brightness,
  contrast,
  saturation,
  bgColor,
  frameType,
  borderWidth,
  text,
  textColor,
}), [borderWidth, bgColor, brightness, contrast, frameType, saturation, text, textColor, zoom]);

const savePreset = useCallback((preset) => {
  const state = preset || getCurrentState();

  setPresets((prev) => {
    const updated = [state, ...prev];
    return updated.slice(0, 10); // max 10 presets
  });
}, [getCurrentState]);


  /* ---------------- Upload ---------------- */
  function handleFile(e) {
    const f = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (!f) return;

    setFile(f);
    setBgRemovedUrl(null);
    setPreviewUrl(URL.createObjectURL(f));
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  /* ---------------- Remove BG ---------------- */
  async function removeBackground() {
    if (!file) return;

    setProcessing(true);

    try {
      const form = new FormData();
      form.append("image_file", file);

      const res = await axios.post(
        "/api/tools/remove-bg",
        form,
        {
          responseType: "blob",
        },
      );

      setBgRemovedUrl(URL.createObjectURL(res.data));
    } catch (err) {
      console.log(err);
    }

    setProcessing(false);
  }

  /* ---------------- Download ---------------- */
  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let mime = "image/png";

    if (format === "jpg") mime = "image/jpeg";
    if (format === "webp") mime = "image/webp";

    const dataUrl =
      format === "png"
        ? canvas.toDataURL(mime)
        : canvas.toDataURL(mime, quality);

    const link = document.createElement("a");
    link.download = `avatar.${format}`;
    link.href = dataUrl;
    link.click();
  }
 

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="flex flex-col items-center gap-6">
          <UploadBox
            handleDrop={handleDrop}
            handleDragOver={handleDragOver}
            previewUrl={previewUrl}
            bgRemovedUrl={bgRemovedUrl}
            handleFile={handleFile}
            canvasRef={canvasRef}
          />
          <ActionButtons
            handleFile={handleFile}
            removeBackground={removeBackground}
            clearAll={() => {
              setFile(null);
              setPreviewUrl(null);
              setBgRemovedUrl(null);
            }}
            processing={processing}
            file={file}
          />
          <CropLayout
            setOffsetX={setOffsetX}
            setOffsetY={setOffsetY}
            padding={padding}
            setPadding={setPadding}
            radius={radius}
            setRadius={setRadius}
            setAspect={setAspect}
            setZoom={setZoom}
          />
          
          <FrameEffects
            frameType={frameType}
            setFrameType={setFrameType}
            borderWidth={borderWidth}
            setBorderWidth={setBorderWidth}
            shadow={shadow}
            setShadow={setShadow}
            glow={glow}
            setGlow={setGlow}
          />
          <TextOverlay
            text={text}
            setText={setText}
            subText={subText}
            setSubText={setSubText}
            textSize={textSize}
            setTextSize={setTextSize}
            textColor={textColor}
            setTextColor={setTextColor}
          />

          
          <ExportOptions
            format={format}
            setFormat={setFormat}
            quality={quality}
            setQuality={setQuality}
            handleDownload={handleDownload}
          />
          <EngagementPanel
  canvasRef={canvasRef}
  savePreset={savePreset}
  // handleWhatsAppShare={handleWhatsAppShare}
/>
        </div>

        <Controls
          size={size}
          setSize={setSize}
          zoom={zoom}
          setZoom={setZoom}
          brightness={brightness}
          setBrightness={setBrightness}
          contrast={contrast}
          setContrast={setContrast}
          saturation={saturation}
          setSaturation={setSaturation}
          style={style}
          setStyle={setStyle}
          bgType={bgType}
          setBgType={setBgType}
          bgColor={bgColor}
          setBgColor={setBgColor}
          downloadPNG={handleDownload}
          colorRef={colorRef}
          faceFocus={faceFocus}
          setFaceFocus={setFaceFocus}
          skinSmooth={skinSmooth}
          setSkinSmooth={setSkinSmooth}
          eyeSharpen={eyeSharpen}
          setEyeSharpen={setEyeSharpen}
          setBgImage={setBgImage}
          setBgSource={setBgSource}
          bgBlur={bgBlur}
          setBgBlur={setBgBlur}
          removeBackground={removeBackground}
          applyPreset={applyPreset}
          handleAvatarMode={handleAvatarMode}
          avatarMode={avatarMode}
        />
        <PresetManager
  presets={presets}
  setPresets={setPresets}
  savePreset={savePreset}
  applyPreset={applyPreset}
/>

{/* <HistoryPanel
  history={history}
  setHistory={setHistory}
  applyPreset={applyPreset}
/> */}
      </div>
    </div>
  );
}
