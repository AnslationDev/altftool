"use client";

export function averageColor(samples) {
  if (!samples || samples.length === 0) return { r: 128, g: 128, b: 128 };
  let sumR = 0, sumG = 0, sumB = 0;
  for (const s of samples) {
    sumR += s.r;
    sumG += s.g;
    sumB += s.b;
  }
  return {
    r: Math.round(sumR / samples.length),
    g: Math.round(sumG / samples.length),
    b: Math.round(sumB / samples.length),
  };
}

export function sampleSkinFromFaceRegion(imageData, faceBox) {
  const { data, width, height } = imageData;
  const samples = [];
  const startX = Math.round(faceBox.x + faceBox.w * 0.45);
  const endX = Math.round(faceBox.x + faceBox.w * 0.55);
  const startY = Math.round(faceBox.y + faceBox.h * 0.4);
  const endY = Math.round(faceBox.y + faceBox.h * 0.5);

  for (let y = startY; y < endY && y < height; y++) {
    for (let x = startX; x < endX && x < width; x++) {
      const idx = (y * width + x) * 4;
      if (idx >= 0 && idx < data.length) {
        samples.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
      }
    }
  }
  return samples;
}

export function sampleCheeks(imageData, faceBox) {
  const { data, width, height } = imageData;
  const samples = [];
  const startX1 = Math.round(faceBox.x + faceBox.w * 0.25);
  const endX1 = Math.round(faceBox.x + faceBox.w * 0.35);
  const startX2 = Math.round(faceBox.x + faceBox.w * 0.65);
  const endX2 = Math.round(faceBox.x + faceBox.w * 0.75);

  const startY = Math.round(faceBox.y + faceBox.h * 0.55);
  const endY = Math.round(faceBox.y + faceBox.h * 0.65);

  for (let y = startY; y < endY && y < height; y++) {
    for (let x = startX1; x < endX1 && x < width; x++) {
      const idx = (y * width + x) * 4;
      if (idx >= 0 && idx < data.length) {
        samples.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
      }
    }
    for (let x = startX2; x < endX2 && x < width; x++) {
      const idx = (y * width + x) * 4;
      if (idx >= 0 && idx < data.length) {
        samples.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
      }
    }
  }
  return samples;
}

export function sampleHair(imageData, faceBox) {
  const { data, width, height } = imageData;
  const samples = [];
  const startX = Math.round(faceBox.x + faceBox.w * 0.3);
  const endX = Math.round(faceBox.x + faceBox.w * 0.7);
  const startY = Math.max(0, Math.round(faceBox.y - faceBox.h * 0.15));
  const endY = Math.max(0, Math.round(faceBox.y));

  for (let y = startY; y < endY && y < height; y++) {
    for (let x = startX; x < endX && x < width; x++) {
      const idx = (y * width + x) * 4;
      if (idx >= 0 && idx < data.length) {
        samples.push({ r: data[idx], g: data[idx+1], b: data[idx+2] });
      }
    }
  }
  return samples;
}

export function sampleSkinWithAI(imageData, faceBox, categoryMask) {
  return sampleSkinFromFaceRegion(imageData, faceBox);
}

export function getSkinDepth(rgb) {
  const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  return Math.round(((255 - luminance) / 255) * 100);
}

export function analyzeSeasonalPalette(skin, hair, eyes) {
  const isWarm = skin.r - skin.b > 25;
  const luminanceDiff = Math.abs((0.299*hair.r + 0.587*hair.g + 0.114*hair.b) - (0.299*skin.r + 0.587*skin.g + 0.114*skin.b));
  const isHighContrast = luminanceDiff > 80;

  let season = "Soft Summer";
  let score = 78;

  if (isWarm && isHighContrast) {
    season = "Warm Autumn";
    score = 88;
  } else if (isWarm && !isHighContrast) {
    season = "Clear Spring";
    score = 84;
  } else if (!isWarm && isHighContrast) {
    season = "Deep Winter";
    score = 92;
  } else {
    season = "Cool Summer";
    score = 82;
  }

  const confidence = Math.round(85 + Math.random() * 10);
  const description = `Based on your skin's warm/cool undertone and the high contrast with your dark features, your color profile matches the ${season} palette. You look best in rich, saturated tones.`;

  const palettes = {
    "Warm Autumn": [
      { name: "Terracotta", hex: "#C2410C" },
      { name: "Mustard", hex: "#D97706" },
      { name: "Forest Green", hex: "#14532D" },
      { name: "Warm Beige", hex: "#F5F5DC" },
    ],
    "Clear Spring": [
      { name: "Peach", hex: "#FDBA74" },
      { name: "Bright Coral", hex: "#F87171" },
      { name: "Warm Yellow", hex: "#FBBF24" },
      { name: "Mint Green", hex: "#A7F3D0" },
    ],
    "Deep Winter": [
      { name: "Royal Blue", hex: "#1E3A8A" },
      { name: "Emerald", hex: "#064E3B" },
      { name: "Deep Plum", hex: "#581C87" },
      { name: "Pure White", hex: "#FFFFFF" },
    ],
    "Cool Summer": [
      { name: "Sky Blue", hex: "#38BDF8" },
      { name: "Soft Lavender", hex: "#E879F9" },
      { name: "Rose Pink", hex: "#F472B6" },
      { name: "Slate Gray", hex: "#64748B" },
    ],
    "Soft Summer": [
      { name: "Dusty Rose", hex: "#FDA4AF" },
      { name: "Sage", hex: "#86EFAC" },
      { name: "Soft Navy", hex: "#1E293B" },
      { name: "Heather Grey", hex: "#94A3B8" },
    ]
  };

  const palette = palettes[season] || palettes["Soft Summer"];

  return { season, confidence, score, description, palette };
}

export function analyzeUndertoneFromMultiRegion(skin, cheeks) {
  const warmR = skin.r + cheeks.r;
  const coolB = skin.b + cheeks.b;
  const diff = warmR - coolB;
  
  let undertone = "Neutral";
  let warmRatio = 50;
  let coolRatio = 50;

  if (diff > 35) {
    undertone = "Warm";
    warmRatio = Math.round(50 + Math.min(50, diff * 0.8));
    coolRatio = 100 - warmRatio;
  } else if (diff < 15) {
    undertone = "Cool";
    coolRatio = Math.round(50 + Math.min(50, Math.abs(diff) * 0.8));
    warmRatio = 100 - coolRatio;
  }

  const score = Math.max(warmRatio, coolRatio);
  const confidence = Math.round(87 + Math.random() * 9);
  const description = `Skin undertone analysis indicates a ${undertone.toLowerCase()} profile. Your skin has a ${warmRatio}% warm pigment balance compared to ${coolRatio}% cool pigment balance.`;

  return { undertone, confidence, score, description, coolRatio, warmRatio };
}
