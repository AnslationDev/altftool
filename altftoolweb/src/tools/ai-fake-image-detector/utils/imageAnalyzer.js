"use client";

import { ANALYSIS_CHECKS, RISK_LEVELS } from "../constants/index.js";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

function stdDev(arr) {
  const avg = mean(arr);
  const squareDiffs = arr.map((v) => (v - avg) ** 2);
  return Math.sqrt(mean(squareDiffs));
}

function rgbToGrayscale(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function rgbToHsv(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return { h: h * 360, s, v };
}

function buildGrayscale(width, height, data) {
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    gray[i] = rgbToGrayscale(data[idx], data[idx + 1], data[idx + 2]);
  }
  return gray;
}

function downsampleForAnalysis(data, width, height, maxPixels) {
  const totalPixels = width * height;
  if (totalPixels <= maxPixels) return { data, width, height };
  const scale = Math.sqrt(maxPixels / totalPixels);
  const newW = Math.max(1, Math.round(width * scale));
  const newH = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = newW;
  canvas.height = newH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = width;
  tmpCanvas.height = height;
  const tmpCtx = tmpCanvas.getContext("2d");
  tmpCtx.putImageData(data, 0, 0);
  ctx.drawImage(tmpCanvas, 0, 0, newW, newH);
  return { data: ctx.getImageData(0, 0, newW, newH), width: newW, height: newH };
}

function analyzeNoise(imageData) {
  try {
    const { data, width, height } = downsampleForAnalysis(imageData.data, imageData.width, imageData.height, 400000);
    const gray = buildGrayscale(width, height, data);
    const diffs = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const center = gray[idx];
        const neighbors = [
          gray[idx - 1],
          gray[idx + 1],
          gray[idx - width],
          gray[idx + width],
        ];
        const neighborMean = mean(neighbors);
        diffs.push(Math.abs(center - neighborMean));
      }
    }
    const noiseStd = stdDev(diffs);
    const noiseMean = mean(diffs);
    const coefficientOfVariation = noiseMean > 0 ? noiseStd / noiseMean : 0;
    const blockCount = 8;
    const bw = Math.floor(width / blockCount);
    const bh = Math.floor(height / blockCount);
    const blockStds = [];
    for (let by = 0; by < blockCount; by++) {
      for (let bx = 0; bx < blockCount; bx++) {
        const blockDiffs = [];
        for (let y = by * bh + 1; y < (by + 1) * bh - 1 && y < height - 1; y++) {
          for (let x = bx * bw + 1; x < (bx + 1) * bw - 1 && x < width - 1; x++) {
            const idx = y * width + x;
            const center = gray[idx];
            const neighbors = [gray[idx - 1], gray[idx + 1], gray[idx - width], gray[idx + width]];
            blockDiffs.push(Math.abs(center - mean(neighbors)));
          }
        }
        if (blockDiffs.length > 0) blockStds.push(stdDev(blockDiffs));
      }
    }
    const blockVariance = blockStds.length > 1 ? stdDev(blockStds) : 0;
    const blockMean = blockStds.length > 0 ? mean(blockStds) : 0;
    const crossBlockCV = blockMean > 0 ? blockVariance / blockMean : 0;

    let score = 50;
    if (coefficientOfVariation > 0.8) score += 25;
    else if (coefficientOfVariation > 0.5) score += 15;
    else if (coefficientOfVariation > 0.3) score += 5;
    else score -= 10;

    if (crossBlockCV > 0.3) score += 15;
    else if (crossBlockCV > 0.15) score += 8;
    else score -= 5;

    if (noiseMean > 2 && noiseMean < 15) score += 10;
    else if (noiseMean < 1) score -= 15;

    score = clamp(score, 0, 100);
    const confidence = clamp(Math.round(50 + crossBlockCV * 100 + Math.min(noiseStd * 3, 30)), 30, 95);
    const details = [];
    details.push(`Noise level (σ): ${noiseStd.toFixed(2)}`);
    details.push(`Coefficient of variation: ${coefficientOfVariation.toFixed(3)}`);
    details.push(`Cross-block noise consistency CV: ${crossBlockCV.toFixed(3)}`);
    if (coefficientOfVariation < 0.3) details.push("Warning: Very uniform noise — typical of AI-generated images");
    if (crossBlockCV > 0.3) details.push("Note: Significant noise variation across regions — more consistent with real photos");

    return {
      score,
      confidence,
      description: score > 65
        ? "Noise patterns appear organic and consistent with camera sensor characteristics."
        : score > 40
          ? "Noise analysis is mixed — some indicators are consistent with both authentic and synthetic images."
          : "Noise patterns appear unusually uniform, which is a common characteristic of AI-generated images.",
      details,
    };
  } catch {
    return { score: 50, confidence: 20, description: "Noise analysis could not be completed.", details: ["Analysis error"] };
  }
}

function analyzeCompression(imageData, fileType) {
  try {
    const { data, width, height } = downsampleForAnalysis(imageData.data, imageData.width, imageData.height, 400000);
    const gray = buildGrayscale(width, height, data);
    let score = 50;
    const details = [];
    details.push(`File type: ${fileType}`);
    if (fileType === "image/jpeg") {
      const blockSize = 8;
      const blockBoundariesH = [];
      const blockBoundariesV = [];
      const sampleRows = Math.min(height, 200);
      const sampleCols = Math.min(width, 200);
      for (let y = blockSize; y < sampleRows; y += blockSize) {
        let sum = 0;
        let count = 0;
        for (let x = 1; x < sampleCols - 1; x++) {
          const idx = y * width + x;
          sum += Math.abs(gray[idx] - gray[idx - width]);
          count++;
        }
        if (count > 0) blockBoundariesH.push(sum / count);
      }
      for (let x = blockSize; x < sampleCols; x += blockSize) {
        let sum = 0;
        let count = 0;
        for (let y = 1; y < sampleRows - 1; y++) {
          const idx = y * width + x;
          sum += Math.abs(gray[idx] - gray[idx - 1]);
          count++;
        }
        if (count > 0) blockBoundariesV.push(sum / count);
      }
      const nonBlockBoundariesH = [];
      const nonBlockBoundariesV = [];
      for (let y = blockSize + 1; y < sampleRows && nonBlockBoundariesH.length < 50; y++) {
        let sum = 0;
        let count = 0;
        for (let x = 1; x < sampleCols - 1; x++) {
          const idx = y * width + x;
          sum += Math.abs(gray[idx] - gray[idx - width]);
          count++;
        }
        if (count > 0) nonBlockBoundariesH.push(sum / count);
      }
      for (let x = blockSize + 1; x < sampleCols && nonBlockBoundariesV.length < 50; x++) {
        let sum = 0;
        let count = 0;
        for (let y = 1; y < sampleRows - 1; y++) {
          const idx = y * width + x;
          sum += Math.abs(gray[idx] - gray[idx - 1]);
          count++;
        }
        if (count > 0) nonBlockBoundariesV.push(sum / count);
      }
      const blockAvgH = blockBoundariesH.length > 0 ? mean(blockBoundariesH) : 0;
      const nonBlockAvgH = nonBlockBoundariesH.length > 0 ? mean(nonBlockBoundariesH) : 0;
      const boundaryRatio = nonBlockAvgH > 0 ? blockAvgH / nonBlockAvgH : 1;
      details.push(`Block boundary ratio: ${boundaryRatio.toFixed(3)}`);
      if (boundaryRatio > 1.3) {
        score += 20;
        details.push("Detected JPEG block boundary patterns consistent with camera output");
      } else if (boundaryRatio > 1.1) {
        score += 10;
        details.push("Weak block boundary signals detected");
      } else {
        score -= 15;
        details.push("No significant JPEG block boundaries detected — may indicate non-standard compression");
      }
      const flatRegions = [];
      for (let y = 0; y < sampleRows; y += 4) {
        for (let x = 0; x < sampleCols - 8; x += 8) {
          const idx = y * width + x;
          let allSame = true;
          for (let dx = 0; dx < 8 && allSame; dx++) {
            if (Math.abs(gray[idx + dx] - gray[idx]) > 2) allSame = false;
          }
          if (allSame) flatRegions.push(1);
        }
      }
      const flatRatio = flatRegions.length / (sampleRows * sampleCols / 32);
      details.push(`Flat region ratio: ${(flatRatio * 100).toFixed(1)}%`);
    } else {
      details.push("Non-JPEG format — block artifact analysis skipped");
      score += 5;
    }
    score = clamp(score, 0, 100);
    const confidence = fileType === "image/jpeg" ? clamp(Math.round(55 + Math.abs(boundaryRatio - 1) * 30), 30, 90) : 35;
    return {
      score,
      confidence,
      description: score > 65
        ? "Compression artifacts are consistent with standard camera processing."
        : score > 40
          ? "Compression analysis is inconclusive."
          : "Compression patterns do not match typical camera output.",
      details,
    };
  } catch {
    return { score: 50, confidence: 20, description: "Compression analysis could not be completed.", details: ["Analysis error"] };
  }
}

function analyzeMetadata(file) {
  return new Promise((resolve) => {
    try {
      const details = [];
      details.push(`File name: ${file.name}`);
      details.push(`File size: ${(file.size / 1024).toFixed(1)} KB`);
      details.push(`MIME type: ${file.type}`);
      let score = 30;
      const hasJpegExtension = /\.(jpg|jpeg)$/i.test(file.name);
      const hasTiffExtension = /\.tiff?$/i.test(file.name);
      if (file.type === "image/jpeg" || file.type === "image/tiff") {
        score += 15;
        details.push("Format supports rich EXIF metadata");
      } else {
        details.push("Format has limited EXIF support");
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const buffer = reader.result;
          const view = new DataView(buffer);
          let exifFound = false;
          if (file.type === "image/jpeg") {
            let offset = 2;
            while (offset < view.byteLength - 1) {
              if (view.getUint8(offset) === 0xFF) {
                const marker = view.getUint8(offset + 1);
                if (marker === 0xE1) {
                  exifFound = true;
                  const segmentLength = view.getUint16(offset + 2);
                  const exifHeader = String.fromCharCode(
                    view.getUint8(offset + 4),
                    view.getUint8(offset + 5),
                    view.getUint8(offset + 6),
                    view.getUint8(offset + 7)
                  );
                  if (exifHeader.startsWith("Exif")) {
                    details.push("EXIF header found");
                  }
                  const readASCII = (start, len) => {
                    let s = "";
                    for (let i = 0; i < len; i++) {
                      const c = view.getUint8(start + i);
                      if (c === 0) break;
                      s += String.fromCharCode(c);
                    }
                    return s;
                  };
                  const searchAscii = (start, end, pattern) => {
                    for (let i = start; i < end - pattern.length; i++) {
                      let match = true;
                      for (let j = 0; j < pattern.length; j++) {
                        if (view.getUint8(i + j) !== pattern.charCodeAt(j)) { match = false; break; }
                      }
                      if (match) return i;
                    }
                    return -1;
                  };
                  const endOffset = offset + 2 + segmentLength;
                  const makePos = searchAscii(offset + 8, endOffset, "Canon\0");
                  const nikonPos = searchAscii(offset + 8, endOffset, "NIKON");
                  const sonyPos = searchAscii(offset + 8, endOffset, "SONY");
                  const applePos = searchAscii(offset + 8, endOffset, "Apple");
                  const samsungPos = searchAscii(offset + 8, endOffset, "SAMSUNG");
                  const cameraBrands = ["Canon", "Nikon", "Sony", "Apple", "Samsung", "Fujifilm", "Olympus", "Panasonic"];
                  let cameraDetected = false;
                  for (const brand of cameraBrands) {
                    const pos = searchAscii(offset + 8, endOffset, brand);
                    if (pos !== -1) {
                      details.push(`Camera manufacturer detected: ${brand}`);
                      cameraDetected = true;
                      score += 20;
                      break;
                    }
                  }
                  if (!cameraDetected) details.push("No known camera manufacturer found in metadata");
                  const softwarePatterns = ["Adobe", "GIMP", "Photoshop", "Lightroom"];
                  for (const sw of softwarePatterns) {
                    const pos = searchAscii(offset + 8, endOffset, sw);
                    if (pos !== -1) {
                      details.push(`Editing software detected: ${sw}`);
                      score -= 5;
                      break;
                    }
                  }
                  offset += 2 + segmentLength;
                } else if (marker === 0xDA) {
                  break;
                } else {
                  offset += 2 + view.getUint16(offset + 2);
                }
              } else {
                offset++;
              }
            }
          }
          if (file.type === "image/png") {
            offset = 0;
            if (view.getUint8(0) === 0x89 && view.getUint8(1) === 0x50) {
              details.push("Valid PNG signature");
              score += 5;
              let pos = 8;
              while (pos < view.byteLength - 12) {
                const chunkLen = view.getUint32(pos);
                const chunkType = String.fromCharCode(
                  view.getUint8(pos + 4),
                  view.getUint8(pos + 5),
                  view.getUint8(pos + 6),
                  view.getUint8(pos + 7)
                );
                if (chunkType === "tEXt" || chunkType === "iTXt") {
                  let text = "";
                  for (let i = pos + 8; i < pos + 8 + Math.min(chunkLen, 200); i++) {
                    const c = view.getUint8(i);
                    if (c === 0) { text += ": "; continue; }
                    text += String.fromCharCode(c);
                  }
                  details.push(`Text chunk: ${text.substring(0, 80)}`);
                  exifFound = true;
                }
                pos += 12 + chunkLen;
              }
            }
          }
          if (!exifFound) {
            details.push("No EXIF or metadata chunks detected");
          } else {
            score += 15;
          }
          if (file.size > 5000000) {
            details.push("Large file size — may contain rich metadata");
            score += 5;
          } else if (file.size < 50000) {
            details.push("Very small file — limited metadata expected");
            score -= 5;
          }
          score = clamp(score, 0, 100);
          const confidence = exifFound ? clamp(60 + details.length * 3, 30, 90) : 40;
          resolve({
            score,
            confidence,
            description: score > 65
              ? "Rich metadata found consistent with authentic camera output."
              : score > 40
                ? "Limited metadata detected — could be from either source."
                : "Minimal or no camera metadata found, which is common in AI-generated images.",
            details,
          });
        } catch {
          score = clamp(score, 0, 100);
          resolve({
            score: clamp(score, 0, 100),
            confidence: 30,
            description: "Metadata analysis partially completed.",
            details,
          });
        }
      };
      reader.onerror = () => {
        resolve({
          score: clamp(score, 0, 100),
          confidence: 20,
          description: "Could not read file for metadata analysis.",
          details: ["File read error"],
        });
      };
      reader.readAsArrayBuffer(file.slice(0, 512 * 1024));
    } catch {
      resolve({
        score: 50,
        confidence: 20,
        description: "Metadata analysis failed.",
        details: ["Analysis error"],
      });
    }
  });
}

function analyzeLighting(imageData) {
  try {
    const { data, width, height } = downsampleForAnalysis(imageData.data, imageData.width, imageData.height, 400000);
    const gray = buildGrayscale(width, height, data);
    const gridRows = 4;
    const gridCols = 4;
    const cellH = Math.floor(height / gridRows);
    const cellW = Math.floor(width / gridCols);
    const cellBrightness = [];
    for (let gy = 0; gy < gridRows; gy++) {
      for (let gx = 0; gx < gridCols; gx++) {
        const cellPixels = [];
        for (let y = gy * cellH; y < (gy + 1) * cellH && y < height; y++) {
          for (let x = gx * cellW; x < (gx + 1) * cellW && x < width; x++) {
            cellPixels.push(gray[y * width + x]);
          }
        }
        cellBrightness.push(cellPixels.length > 0 ? mean(cellPixels) : 0);
      }
    }
    const horizontalGradient = [];
    const verticalGradient = [];
    for (let gy = 0; gy < gridRows; gy++) {
      const rowBrightness = [];
      for (let gx = 0; gx < gridCols; gx++) {
        rowBrightness.push(cellBrightness[gy * gridCols + gx]);
      }
      horizontalGradient.push(rowBrightness[rowBrightness.length - 1] - rowBrightness[0]);
    }
    for (let gx = 0; gx < gridCols; gx++) {
      const colBrightness = [];
      for (let gy = 0; gy < gridRows; gy++) {
        colBrightness.push(cellBrightness[gy * gridCols + gx]);
      }
      verticalGradient.push(colBrightness[colBrightness.length - 1] - colBrightness[0]);
    }
    const overallStd = stdDev(cellBrightness);
    const overallMean = mean(cellBrightness);
    const dynamicRange = Math.max(...cellBrightness) - Math.min(...cellBrightness);
    const hGradStd = stdDev(horizontalGradient);
    const vGradStd = stdDev(verticalGradient);
    let score = 50;
    const details = [];
    details.push(`Dynamic range: ${dynamicRange.toFixed(1)}`);
    details.push(`Brightness std deviation: ${overallStd.toFixed(1)}`);
    details.push(`Horizontal gradient consistency (σ): ${hGradStd.toFixed(1)}`);
    details.push(`Vertical gradient consistency (σ): ${vGradStd.toFixed(1)}`);
    if (dynamicRange > 40 && dynamicRange < 200) {
      score += 15;
      details.push("Good dynamic range consistent with real lighting");
    } else if (dynamicRange < 15) {
      score -= 15;
      details.push("Very flat lighting — unusual for real photographs");
    } else if (dynamicRange > 200) {
      score -= 5;
      details.push("Extreme dynamic range — possible HDR or synthetic origin");
    }
    if (overallStd > 20 && overallStd < 80) {
      score += 15;
      details.push("Natural brightness variation across the image");
    } else if (overallStd < 8) {
      score -= 15;
      details.push("Suspiciously uniform brightness distribution");
    }
    if (hGradStd < 10 && vGradStd < 10) {
      score -= 10;
      details.push("Unusually consistent gradients — possible artificial lighting");
    } else if (hGradStd > 5 || vGradStd > 5) {
      score += 10;
      details.push("Natural gradient variation detected");
    }
    const cornerBrightness = [
      cellBrightness[0],
      cellBrightness[gridCols - 1],
      cellBrightness[(gridRows - 1) * gridCols],
      cellBrightness[(gridRows - 1) * gridCols + gridCols - 1],
    ];
    const cornerStd = stdDev(cornerBrightness);
    if (cornerStd > 10) {
      score += 10;
      details.push("Corner brightness variation suggests directional lighting");
    } else if (cornerStd < 3) {
      details.push("Uniform corner brightness — flat lighting scenario");
    }
    score = clamp(score, 0, 100);
    const confidence = clamp(Math.round(45 + overallStd * 0.5 + dynamicRange * 0.1), 30, 90);
    return {
      score,
      confidence,
      description: score > 65
        ? "Lighting patterns are consistent with natural photographic conditions."
        : score > 40
          ? "Lighting analysis is inconclusive."
          : "Lighting patterns appear physically implausible or artificially uniform.",
      details,
    };
  } catch {
    return { score: 50, confidence: 20, description: "Lighting analysis could not be completed.", details: ["Analysis error"] };
  }
}

function analyzeTexture(imageData) {
  try {
    const { data, width, height } = downsampleForAnalysis(imageData.data, imageData.width, imageData.height, 400000);
    const gray = buildGrayscale(width, height, data);
    const gradientMagnitudes = [];
    const blockSize = 16;
    const blockGradients = [];
    for (let by = 1; by < height - 1; by += blockSize) {
      for (let bx = 1; bx < width - 1; bx += blockSize) {
        let gx = 0;
        let gy = 0;
        let count = 0;
        for (let y = by; y < Math.min(by + blockSize, height - 1); y++) {
          for (let x = bx; x < Math.min(bx + blockSize, width - 1); x++) {
            const idx = y * width + x;
            const sobelX = -gray[idx - width - 1] + gray[idx - width + 1]
              - 2 * gray[idx - 1] + 2 * gray[idx + 1]
              - gray[idx + width - 1] + gray[idx + width + 1];
            const sobelY = -gray[idx - width - 1] - 2 * gray[idx - width] - gray[idx - width + 1]
              + gray[idx + width - 1] + 2 * gray[idx + width] + gray[idx + width + 1];
            const mag = Math.sqrt(sobelX * sobelX + sobelY * sobelY);
            gradientMagnitudes.push(mag);
            gx += sobelX;
            gy += sobelY;
            count++;
          }
        }
        if (count > 0) {
          blockGradients.push(Math.sqrt((gx / count) ** 2 + (gy / count) ** 2));
        }
      }
    }
    const globalGradMean = mean(gradientMagnitudes);
    const globalGradStd = stdDev(gradientMagnitudes);
    const blockGradStd = blockGradients.length > 1 ? stdDev(blockGradients) : 0;
    const blockGradMean = blockGradients.length > 0 ? mean(blockGradients) : 0;
    const blockGradCV = blockGradMean > 0 ? blockGradStd / blockGradMean : 0;
    let score = 50;
    const details = [];
    details.push(`Mean gradient magnitude: ${globalGradMean.toFixed(1)}`);
    details.push(`Gradient magnitude σ: ${globalGradStd.toFixed(1)}`);
    details.push(`Block gradient CV: ${blockGradCV.toFixed(3)}`);
    if (globalGradMean > 5 && globalGradMean < 40) {
      score += 15;
      details.push("Texture complexity consistent with real-world photography");
    } else if (globalGradMean < 2) {
      score -= 15;
      details.push("Very low texture — image may be overly smooth or AI-generated");
    } else if (globalGradMean > 60) {
      details.push("High texture complexity detected");
    }
    if (blockGradCV > 0.4) {
      score += 15;
      details.push("High texture variation across regions — natural pattern");
    } else if (blockGradCV < 0.15) {
      score -= 15;
      details.push("Suspiciously uniform texture across all regions");
    } else {
      score += 5;
    }
    const sortedGrads = [...gradientMagnitudes].sort((a, b) => a - b);
    const p5 = sortedGrads[Math.floor(sortedGrads.length * 0.05)] || 0;
    const p95 = sortedGrads[Math.floor(sortedGrads.length * 0.95)] || 0;
    const gradRange = p95 - p5;
    details.push(`Gradient range (p5-p95): ${gradRange.toFixed(1)}`);
    if (gradRange > 20) score += 10;
    else if (gradRange < 5) score -= 10;
    score = clamp(score, 0, 100);
    const confidence = clamp(Math.round(40 + blockGradCV * 50 + Math.min(globalGradMean * 0.5, 25)), 30, 90);
    return {
      score,
      confidence,
      description: score > 65
        ? "Texture patterns are consistent with authentic photography."
        : score > 40
          ? "Texture analysis is inconclusive."
          : "Texture patterns suggest possible AI generation or heavy processing.",
      details,
    };
  } catch {
    return { score: 50, confidence: 20, description: "Texture analysis could not be completed.", details: ["Analysis error"] };
  }
}

function analyzeEdges(imageData) {
  try {
    const { data, width, height } = downsampleForAnalysis(imageData.data, imageData.width, imageData.height, 400000);
    const gray = buildGrayscale(width, height, data);
    const blockSize = 16;
    const blockSharpness = [];
    for (let by = 1; by < height - 2; by += blockSize) {
      for (let bx = 1; bx < width - 2; bx += blockSize) {
        let edgeSum = 0;
        let edgeCount = 0;
        let maxEdge = 0;
        for (let y = by; y < Math.min(by + blockSize, height - 2); y++) {
          for (let x = bx; x < Math.min(bx + blockSize, width - 2); x++) {
            const idx = y * width + x;
            const gx = -gray[idx - width - 1] + gray[idx - width + 1]
              - 2 * gray[idx - 1] + 2 * gray[idx + 1]
              - gray[idx + width - 1] + gray[idx + width + 1];
            const gy = -gray[idx - width - 1] - 2 * gray[idx - width] - gray[idx - width + 1]
              + gray[idx + width - 1] + 2 * gray[idx + width] + gray[idx + width + 1];
            const mag = Math.sqrt(gx * gx + gy * gy);
            if (mag > 20) {
              edgeSum += mag;
              edgeCount++;
              maxEdge = Math.max(maxEdge, mag);
            }
          }
        }
        const avgEdge = edgeCount > 0 ? edgeSum / edgeCount : 0;
        blockSharpness.push({ avgEdge, maxEdge, edgeRatio: edgeCount / (blockSize * blockSize) });
      }
    }
    const avgEdges = blockSharpness.map((b) => b.avgEdge);
    const edgeRatios = blockSharpness.map((b) => b.edgeRatio);
    const sharpnessStd = stdDev(avgEdges);
    const sharpnessMean = mean(avgEdges);
    const ratioStd = stdDev(edgeRatios);
    const ratioMean = mean(edgeRatios);
    const sharpnessCV = sharpnessMean > 0 ? sharpnessStd / sharpnessMean : 0;
    let score = 50;
    const details = [];
    details.push(`Mean edge strength: ${sharpnessMean.toFixed(1)}`);
    details.push(`Sharpness σ: ${sharpnessStd.toFixed(1)}`);
    details.push(`Sharpness CV: ${sharpnessCV.toFixed(3)}`);
    details.push(`Edge density ratio: ${(ratioMean * 100).toFixed(1)}%`);
    if (sharpnessMean > 15 && sharpnessMean < 80) {
      score += 15;
      details.push("Edge strength consistent with real photography");
    } else if (sharpnessMean < 5) {
      score -= 15;
      details.push("Very weak edges — possibly oversmoothed or AI-generated");
    }
    if (sharpnessCV > 0.4) {
      score += 15;
      details.push("Natural variation in edge sharpness across regions");
    } else if (sharpnessCV < 0.2) {
      score -= 10;
      details.push("Unusually uniform edge sharpness — possible artificial origin");
    }
    if (ratioMean > 0.05 && ratioMean < 0.4) {
      score += 10;
      details.push("Edge density within normal photographic range");
    } else if (ratioMean < 0.02) {
      score -= 10;
      details.push("Very low edge density");
    }
    score = clamp(score, 0, 100);
    const confidence = clamp(Math.round(45 + sharpnessCV * 40 + Math.min(sharpnessMean * 0.3, 20)), 30, 90);
    return {
      score,
      confidence,
      description: score > 65
        ? "Edge characteristics are consistent with authentic photography."
        : score > 40
          ? "Edge analysis is inconclusive."
          : "Edge patterns show anomalies consistent with AI generation.",
      details,
    };
  } catch {
    return { score: 50, confidence: 20, description: "Edge analysis could not be completed.", details: ["Analysis error"] };
  }
}

function analyzeColors(imageData) {
  try {
    const { data, width, height } = downsampleForAnalysis(imageData.data, imageData.width, imageData.height, 400000);
    const bins = 32;
    const histR = new Float32Array(bins);
    const histG = new Float32Array(bins);
    const histB = new Float32Array(bins);
    const totalPixels = width * height;
    const rValues = [];
    const gValues = [];
    const bValues = [];
    for (let i = 0; i < totalPixels; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      rValues.push(r);
      gValues.push(g);
      bValues.push(b);
      histR[Math.min(Math.floor(r / (256 / bins)), bins - 1)]++;
      histG[Math.min(Math.floor(g / (256 / bins)), bins - 1)]++;
      histB[Math.min(Math.floor(b / (256 / bins)), bins - 1)]++;
    }
    for (let i = 0; i < bins; i++) {
      histR[i] /= totalPixels;
      histG[i] /= totalPixels;
      histB[i] /= totalPixels;
    }
    const rStd = stdDev(histR);
    const gStd = stdDev(histG);
    const bStd = stdDev(histB);
    const rSkew = mean(rValues);
    const gSkew = mean(gValues);
    const bSkew = mean(bValues);
    const rRange = stdDev(rValues);
    const gRange = stdDev(gValues);
    const bRange = stdDev(bValues);
    let score = 50;
    const details = [];
    details.push(`R channel σ: ${rRange.toFixed(1)}, histogram σ: ${rStd.toFixed(4)}`);
    details.push(`G channel σ: ${gRange.toFixed(1)}, histogram σ: ${gStd.toFixed(4)}`);
    details.push(`B channel σ: ${bRange.toFixed(1)}, histogram σ: ${bStd.toFixed(4)}`);
    const colorVariance = rRange + gRange + bRange;
    if (colorVariance > 50 && colorVariance < 150) {
      score += 15;
      details.push("Color variance consistent with natural scenes");
    } else if (colorVariance < 20) {
      score -= 15;
      details.push("Very low color variance — possibly monochrome or AI-generated");
    }
    const histVariance = stdDev([rStd, gStd, bStd]);
    if (histVariance < 0.01) {
      score += 10;
      details.push("Consistent histogram shapes across channels");
    }
    const maxHistPeak = Math.max(...histR, ...histG, ...histB);
    const emptyBins = [histR, histG, histB].flatMap((h) =>
      [...h].filter((v) => v < 0.001).length
    );
    details.push(`Peak histogram bin: ${(maxHistPeak * 100).toFixed(1)}%`);
    details.push(`Empty bins: ${emptyBins}`);
    if (maxHistPeak > 0.15) {
      score -= 5;
      details.push("Highly concentrated histogram — narrow color range");
    }
    const channelCorrelations = [];
    for (let i = 0; i < Math.min(rValues.length, 10000); i += 10) {
      channelCorrelations.push([rValues[i], gValues[i], bValues[i]]);
    }
    const rMean = mean(rValues);
    const gMean = mean(gValues);
    const bMean = mean(bValues);
    let rgCorr = 0;
    let rbCorr = 0;
    let gbCorr = 0;
    const rgSR = rValues.reduce((s, v) => s + (v - rMean) ** 2, 0);
    const rbSR = rValues.reduce((s, v) => s + (v - rMean) ** 2, 0);
    const gbSR = gValues.reduce((s, v) => s + (v - gMean) ** 2, 0);
    for (let i = 0; i < Math.min(totalPixels, 50000); i += 5) {
      rgCorr += (rValues[i] - rMean) * (gValues[i] - gMean);
      rbCorr += (rValues[i] - rMean) * (bValues[i] - bMean);
      gbCorr += (gValues[i] - gMean) * (bValues[i] - bMean);
    }
    const n = Math.min(totalPixels / 5, 10000);
    rgCorr = rgSR > 0 ? rgCorr / (Math.sqrt(rgSR * gValues.reduce((s, v) => s + (v - gMean) ** 2, 0))) : 0;
    details.push(`R-G correlation: ${rgCorr.toFixed(3)}`);
    if (Math.abs(rgCorr) > 0.95) {
      score -= 5;
      details.push("Suspiciously high channel correlation");
    }
    score = clamp(score, 0, 100);
    const confidence = clamp(Math.round(40 + colorVariance * 0.2 + Math.abs(rgCorr) * 10), 30, 85);
    return {
      score,
      confidence,
      description: score > 65
        ? "Color distribution is consistent with natural photography."
        : score > 40
          ? "Color analysis is inconclusive."
          : "Color distribution anomalies suggest possible AI generation.",
      details,
    };
  } catch {
    return { score: 50, confidence: 20, description: "Color analysis could not be completed.", details: ["Analysis error"] };
  }
}

function detectFaces(imageData) {
  try {
    const { data, width, height } = downsampleForAnalysis(imageData.data, imageData.width, imageData.height, 300000);
    const skinPixels = new Uint8Array(width * height);
    let skinCount = 0;
    for (let i = 0; i < width * height; i++) {
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const hsv = rgbToHsv(r, g, b);
      const isSkin = (
        (hsv.h >= 0 && hsv.h <= 50) &&
        (hsv.s >= 0.15 && hsv.s <= 0.75) &&
        (hsv.v >= 0.2 && hsv.v <= 0.95) &&
        (r > 80 && g > 30 && b > 15) &&
        (r > g && r > b) &&
        (Math.abs(r - g) > 15)
      );
      if (isSkin) {
        skinPixels[i] = 1;
        skinCount++;
      }
    }
    const skinRatio = skinCount / (width * height);
    const minFacePixels = 500;
    const visited = new Uint8Array(width * height);
    const faceRegions = [];
    const queue = [];
    for (let y = 2; y < height - 2; y += 3) {
      for (let x = 2; x < width - 2; x += 3) {
        const idx = y * width + x;
        if (skinPixels[idx] && !visited[idx]) {
          let regionSize = 0;
          let minX = x, maxX = x, minY = y, maxY = y;
          queue.length = 0;
          queue.push(idx);
          visited[idx] = 1;
          while (queue.length > 0) {
            const ci = queue.pop();
            const cx = ci % width;
            const cy = Math.floor(ci / width);
            regionSize++;
            minX = Math.min(minX, cx);
            maxX = Math.max(maxX, cx);
            minY = Math.min(minY, cy);
            maxY = Math.max(maxY, cy);
            if (regionSize > 5000) break;
            for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) {
              const nx = cx + dx;
              const ny = cy + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const ni = ny * width + nx;
                if (skinPixels[ni] && !visited[ni]) {
                  visited[ni] = 1;
                  queue.push(ni);
                }
              }
            }
          }
          const regionW = maxX - minX;
          const regionH = maxY - minY;
          const aspectRatio = regionH > 0 ? regionW / regionH : 0;
          if (regionSize >= minFacePixels && regionW > 15 && regionH > 20) {
            faceRegions.push({
              size: regionSize,
              width: regionW,
              height: regionH,
              aspectRatio,
              x: minX,
              y: minY,
            });
          }
        }
      }
    }
    const likelyFaces = faceRegions.filter(
      (r) => r.aspectRatio > 0.5 && r.aspectRatio < 2.0 && r.size > 1000
    );
    let score = 65;
    const details = [];
    details.push(`Skin-tone pixels: ${(skinRatio * 100).toFixed(1)}%`);
    details.push(`Skin regions detected: ${faceRegions.length}`);
    details.push(`Likely face regions: ${likelyFaces.length}`);
    if (faceRegions.length === 0) {
      details.push("No skin-tone regions detected");
      score = 70;
    } else if (likelyFaces.length === 1) {
      details.push("Single face region detected");
      score = 65;
    } else if (likelyFaces.length === 2) {
      details.push("Two face regions detected");
      score = 60;
    } else if (likelyFaces.length > 2) {
      details.push("Multiple face regions detected");
      score = 50;
    }
    for (const face of likelyFaces) {
      details.push(`  Region: ${face.width}x${face.height}px, aspect ratio: ${face.aspectRatio.toFixed(2)}`);
    }
    score = clamp(score, 0, 100);
    const confidence = faceRegions.length > 0 ? 55 : 35;
    return {
      score,
      confidence,
      description: score > 60
        ? "Face analysis did not find significant anomalies."
        : score > 40
          ? "Face analysis is inconclusive."
          : "Face detection found potential anomalies consistent with AI generation.",
      details,
      count: likelyFaces.length,
    };
  } catch {
    return { score: 60, confidence: 20, description: "Face detection could not be completed.", details: ["Analysis error"], count: 0 };
  }
}

function computeOverallScore(analyses) {
  let totalWeight = 0;
  let weightedSum = 0;
  for (const check of ANALYSIS_CHECKS) {
    const analysis = analyses[check.id];
    if (analysis && typeof analysis.score === "number") {
      const effectiveWeight = check.weight * (analysis.confidence / 100);
      weightedSum += analysis.score * effectiveWeight;
      totalWeight += effectiveWeight;
    }
  }
  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;
}

function getRiskLevel(score) {
  if (score <= 35) return "SAFE";
  if (score <= 55) return "SUSPICIOUS";
  if (score <= 75) return "RISKY";
  return "RISKY";
}

function generateSummary(score, riskLevelKey, confidence) {
  const riskLevel = RISK_LEVELS[riskLevelKey];
  if (score <= 25) {
    return "This image appears to be an authentic photograph. The analysis found characteristics consistent with genuine camera-captured imagery including natural noise patterns, proper compression artifacts, and plausible lighting.";
  }
  if (score <= 40) {
    return "This image likely originated from a real camera, though some minor indicators were inconclusive. The overall assessment suggests authenticity with moderate confidence.";
  }
  if (score <= 55) {
    return "The analysis could not definitively determine the origin of this image. Some indicators suggest authentic photography while others are consistent with AI generation. Consider the image context and source.";
  }
  if (score <= 70) {
    return "This image shows several characteristics commonly associated with AI-generated content. The noise patterns, texture consistency, or other technical markers suggest possible synthetic origin.";
  }
  return "This image exhibits strong indicators of being AI-generated or heavily manipulated. Multiple analysis checks flagged unusual patterns in noise, lighting, texture, or compression artifacts.";
}

function generateRecommendations(score, analyses) {
  const recs = [];
  if (score <= 30) {
    recs.push("The image appears authentic. No immediate concerns detected.");
    recs.push("For high-stakes verification, consider cross-referencing with the original source.");
  } else if (score <= 55) {
    recs.push("Results are inconclusive. Consider the context and source of the image.");
    recs.push("If authenticity is critical, use additional verification tools or manual inspection.");
    recs.push("Check for reverse image search matches to find the original source.");
  } else {
    recs.push("This image shows signs of AI generation or manipulation.");
    recs.push("Do not use this image for evidence or documentation without independent verification.");
    recs.push("Consider reverse image searching to find potential original sources.");
    recs.push("Be cautious when encountering this image in news, social media, or other communications.");
  }
  if (analyses.metadata && analyses.metadata.score < 40) {
    recs.push("Missing camera metadata is a strong indicator — verify the image source chain.");
  }
  if (analyses.lighting && analyses.lighting.score < 35) {
    recs.push("Lighting anomalies detected — this is a common artifact in AI-generated images.");
  }
  if (analyses.faces && analyses.faces.score < 40) {
    recs.push("Face analysis found anomalies — AI-generated faces often have subtle inconsistencies.");
  }
  return recs;
}

export class ImageAnalyzer {
  static async analyzeImage(file, imageElement) {
    const startTime = performance.now();

    let canvas;
    try {
      canvas = document.createElement("canvas");
      canvas.width = imageElement.naturalWidth || imageElement.width;
      canvas.height = imageElement.naturalHeight || imageElement.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(imageElement, 0, 0);
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } catch (err) {
      return {
        summary: {
          overallScore: 50,
          riskLevel: RISK_LEVELS.ERROR,
          confidence: 0,
          summary: "Unable to process image: " + (err.message || "Canvas access error"),
        },
        detailedAnalysis: {},
        technicalInfo: {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          dimensions: { width: 0, height: 0 },
          aspectRatio: "N/A",
          hasExif: false,
          exifSummary: "Image could not be loaded for analysis.",
        },
        recommendations: ["Try uploading the image in a different format."],
      };
    }

    const noise = analyzeNoise(imageData);
    const compression = analyzeCompression(imageData, file.type);
    const metadata = await analyzeMetadata(file);
    const lighting = analyzeLighting(imageData);
    const texture = analyzeTexture(imageData);
    const edges = analyzeEdges(imageData);
    const color = analyzeColors(imageData);
    const faces = detectFaces(imageData);

    const analyses = { noise, compression, metadata, lighting, texture, edges, color, faces };
    const overallScore = computeOverallScore(analyses);
    const riskLevelKey = getRiskLevel(overallScore);
    const riskLevel = RISK_LEVELS[riskLevelKey];

    const avgConfidence = Math.round(
      Object.values(analyses).reduce((sum, a) => sum + (a.confidence || 0), 0) / Object.values(analyses).length
    );

    const endTime = performance.now();
    const processingTimeMs = Math.round(endTime - startTime);

    const exifSummaryParts = [];
    if (metadata.details) {
      for (const d of metadata.details) {
        if (d.includes("Camera manufacturer") || d.includes("Editing software") || d.includes("EXIF header") || d.includes("Text chunk")) {
          exifSummaryParts.push(d);
        }
      }
    }

    return {
      summary: {
        overallScore,
        riskLevel,
        confidence: avgConfidence,
        summary: generateSummary(overallScore, riskLevelKey, avgConfidence),
      },
      detailedAnalysis: analyses,
      technicalInfo: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        dimensions: { width: canvas.width, height: canvas.height },
        aspectRatio: `${canvas.width}:${canvas.height}`,
        hasExif: exifSummaryParts.length > 0,
        exifSummary: exifSummaryParts.length > 0 ? exifSummaryParts.join("; ") : "No EXIF metadata detected.",
      },
      recommendations: generateRecommendations(overallScore, analyses),
    };
  }
}
