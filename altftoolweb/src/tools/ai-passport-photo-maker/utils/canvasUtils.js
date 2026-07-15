import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

export function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d') };
}

export function canvasToBlob(canvas, format = 'png', quality = 0.9) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      format === 'jpeg' ? 'image/jpeg' : 'image/png',
      quality
    );
  });
}

export function canvasToDataURL(canvas, format = 'png', quality = 0.9) {
  return canvas.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png', quality);
}

export async function downloadCanvas(canvas, filename, format = 'png', quality = 0.9) {
  const blob = await canvasToBlob(canvas, format, quality);
  saveAs(blob, filename);
}

export async function mergeCanvasToPDF(canvases, format = 'png') {
  const pdf = new jsPDF();
  let first = true;

  for (const canvas of canvases) {
    if (!first) pdf.addPage();
    first = false;

    const dataUrl = canvasToDataURL(canvas, format);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const w = canvas.width * ratio;
    const h = canvas.height * ratio;
    const x = (pageWidth - w) / 2;
    const y = (pageHeight - h) / 2;

    pdf.addImage(dataUrl, format.toUpperCase(), x, y, w, h);
  }

  return pdf;
}

export function resizeCanvas(canvas, maxWidth, maxHeight) {
  const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
  if (ratio >= 1) return canvas;

  const newWidth = Math.round(canvas.width * ratio);
  const newHeight = Math.round(canvas.height * ratio);
  const { canvas: resized, ctx } = createCanvas(newWidth, newHeight);

  ctx.drawImage(canvas, 0, 0, newWidth, newHeight);
  return resized;
}
