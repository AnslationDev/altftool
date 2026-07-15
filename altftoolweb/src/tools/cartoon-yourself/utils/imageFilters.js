export function buildFilterString(adjustments, styleFilter) {
  let filter = styleFilter || "";

  filter += ` brightness(${adjustments.brightness}%)`;
  filter += ` contrast(${adjustments.contrast}%)`;
  filter += ` saturate(${adjustments.saturation}%)`;

  if (adjustments.sharpness > 0) {
    filter += ` contrast(${100 + adjustments.sharpness}%)`;
  }

  if (adjustments.smoothness > 0) {
    filter += ` blur(${adjustments.smoothness * 0.1}px)`;
  }

  return filter;
}

export function drawToCanvas(canvas, image, adjustments, styleFilter) {
  if (!canvas || !image) return;

  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;

  ctx.clearRect(0, 0, width, height);

  const filterString = buildFilterString(adjustments, styleFilter);

  ctx.save();
  ctx.filter = filterString;

  const scale = Math.min(width / image.width, height / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  const dx = (width - dw) / 2;
  const dy = (height - dh) / 2;

  ctx.drawImage(image, dx, dy, dw, dh);
  ctx.restore();
}

export function downloadCanvas(canvas, format, quality, filename) {
  if (!canvas) return;

  const mime = format === "png" ? "image/png" : format === "jpeg" ? "image/jpeg" : "image/webp";
  const dataUrl = format === "png" ? canvas.toDataURL(mime) : canvas.toDataURL(mime, quality);

  const link = document.createElement("a");
  link.download = filename || `cartoon.${format === "jpeg" ? "jpg" : format}`;
  link.href = dataUrl;
  link.click();
}

export function copyCanvasToClipboard(canvas) {
  if (!canvas) return Promise.resolve(false);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(false);
        return;
      }

      try {
        navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]).then(() => resolve(true)).catch(() => resolve(false));
      } catch {
        resolve(false);
      }
    }, "image/png");
  });
}
