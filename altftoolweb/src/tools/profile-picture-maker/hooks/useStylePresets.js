"use client";

export default function useStylePresets({
  setBrightness,
  setContrast,
  setSaturation,
  setBgType,
  setBgColor,
  setZoom,
  removeBackground,
bgRemovedUrl,
}) {
  const applyLinkedIn = async () => {
     await removeBackground();
     setBrightness(105);
    setContrast(110);
    setSaturation(100);
    setBgType("solid");
    setBgColor("#ffffff");
    setZoom(1);
  };

  const applyGamer = async () => {
     await removeBackground();
    setBrightness(110);
    setContrast(130);
    setSaturation(140);
    setBgType("solid");
    setBgColor("#0f172a"); // dark bg
    setZoom(1.1);
  };

  const applyInfluencer = async () => {
     await removeBackground();
    setBrightness(115);
    setContrast(105);
    setSaturation(120);
    setBgType("solid");
    setBgColor("#fef3c7"); // warm bg
    setZoom(1);
  };

  const applyCorporate = async() => {
     await removeBackground();
    setBrightness(100);
    setContrast(115);
    setSaturation(95);
    setBgType("solid");
    setBgColor("#e5e7eb"); // light gray
    setZoom(1);
  };

  const applyGradient = async() => {
     await removeBackground();
    setBrightness(110);
    setContrast(120);
    setSaturation(130);
    setBgType("solid");
    setBgColor("#7c3aed"); // purple tone
    setZoom(1.05);
  };

  const applyGlitch = async () => {
    await removeBackground();
    setBrightness(120);
    setContrast(140);
    setSaturation(150);
    setBgType("solid");
    setBgColor("#000000");
    setZoom(1.1);
  };

  return {
    applyLinkedIn,
    applyGamer,
    applyInfluencer,
    applyCorporate,
    applyGradient,
    applyGlitch,
  };
}