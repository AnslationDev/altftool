import jsQR from "jsqr";

// Display names for formats reported by BarcodeDetector / jsQR / Quagga.
const FORMAT_NAMES = {
  qr_code: "QR Code",
  ean_13: "EAN-13",
  ean_8: "EAN-8",
  upc_a: "UPC-A",
  upc_e: "UPC-E",
  code_128: "Code 128",
  code_39: "Code 39",
  code_93: "Code 93",
  codabar: "Codabar",
  itf: "ITF",
  i2of5: "ITF",
  "2of5": "Standard 2 of 5",
  code_32: "Code 32",
  data_matrix: "Data Matrix",
  aztec: "Aztec",
  pdf417: "PDF417",
};

export function formatDisplayName(rawFormat) {
  return FORMAT_NAMES[String(rawFormat || "").toLowerCase()] || String(rawFormat || "Barcode");
}

const MAX_DIMENSION = 1600;

// Draw any image source onto a fresh canvas, capped so huge photos stay fast.
export function imageToCanvas(img) {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round((img.naturalWidth || img.width) * scale);
  canvas.height = Math.round((img.naturalHeight || img.height) * scale);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function tryNativeDetector(canvas) {
  if (typeof window === "undefined" || !("BarcodeDetector" in window)) return null;
  try {
    const supported = await window.BarcodeDetector.getSupportedFormats();
    if (!supported?.length) return null;
    const detector = new window.BarcodeDetector({ formats: supported });
    const results = await detector.detect(canvas);
    if (results?.length) {
      return { value: results[0].rawValue, format: formatDisplayName(results[0].format) };
    }
  } catch {
    // native detector unavailable or failed — fall through to JS decoders
  }
  return null;
}

export function tryJsQr(canvas) {
  try {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
    });
    if (result?.data) return { value: result.data, format: "QR Code" };
  } catch {
    // ignore — next decoder gets its turn
  }
  return null;
}

// Quagga references `window` at module scope, so it must be imported lazily
// in the browser only.
export async function tryQuagga(dataUrl) {
  try {
    const Quagga = (await import("quagga")).default;
    return await new Promise((resolve) => {
      Quagga.decodeSingle(
        {
          src: dataUrl,
          numOfWorkers: 0,
          locate: true,
          inputStream: { size: MAX_DIMENSION },
          decoder: {
            readers: [
              "ean_reader",
              "ean_8_reader",
              "upc_reader",
              "upc_e_reader",
              "code_128_reader",
              "code_39_reader",
              "codabar_reader",
              "i2of5_reader",
            ],
          },
        },
        (result) => {
          if (result?.codeResult?.code) {
            resolve({
              value: result.codeResult.code,
              format: formatDisplayName(result.codeResult.format),
            });
          } else {
            resolve(null);
          }
        },
      );
    });
  } catch {
    return null;
  }
}

// Full pipeline for a still image: native detector → jsQR → Quagga.
export async function decodeCanvas(canvas) {
  return (
    (await tryNativeDetector(canvas)) ||
    tryJsQr(canvas) ||
    (await tryQuagga(canvas.toDataURL("image/png")))
  );
}

// Fast per-frame pass for the live camera loop (no Quagga — too slow to run
// every frame; the caller snapshots through decodeCanvas periodically).
export async function decodeFrameFast(canvas) {
  return (await tryNativeDetector(canvas)) || tryJsQr(canvas);
}

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this file as an image"));
    };
    img.src = url;
  });
}

// Small thumbnail for the Recent Scans table (kept tiny for localStorage).
export function makeThumbnail(canvas, maxSize = 96) {
  const scale = Math.min(1, maxSize / Math.max(canvas.width, canvas.height));
  const thumb = document.createElement("canvas");
  thumb.width = Math.max(1, Math.round(canvas.width * scale));
  thumb.height = Math.max(1, Math.round(canvas.height * scale));
  thumb.getContext("2d").drawImage(canvas, 0, 0, thumb.width, thumb.height);
  return thumb.toDataURL("image/jpeg", 0.7);
}
