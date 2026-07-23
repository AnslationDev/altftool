"use client";

import { getPrintSheetLayout } from './templateUtils';

export function calculatePhotoPositions(template, count, paperSize) {
  const spacing = template.printLayout?.spacing || 5;
  const photoW = template.width;
  const photoH = template.height;

  const cols = Math.min(count, Math.floor((paperSize.width + spacing) / (photoW + spacing)));
  const rows = Math.ceil(count / cols);

  const totalW = cols * photoW + (cols - 1) * spacing;
  const totalH = rows * photoH + (rows - 1) * spacing;

  const startX = Math.max(0, (paperSize.width - totalW) / 2);
  const startY = Math.max(0, (paperSize.height - totalH) / 2);

  const positions = [];
  let placed = 0;

  for (let r = 0; r < rows && placed < count; r++) {
    for (let c = 0; c < cols && placed < count; c++) {
      positions.push({
        x: startX + c * (photoW + spacing),
        y: startY + r * (photoH + spacing),
        w: photoW,
        h: photoH,
      });
      placed++;
    }
  }

  return positions;
}

export function generatePrintSheet(template, count, paperSize, imageCanvas) {
  const { canvas, ctx } = createCanvas(paperSize.width, paperSize.height);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const positions = calculatePhotoPositions(template, count, paperSize);

  for (const pos of positions) {
    ctx.drawImage(imageCanvas, pos.x, pos.y, pos.w, pos.h);
  }

  return canvas;
}

export function getExportFilename(template, format) {
  const date = new Date().toISOString().split('T')[0];
  const name = template.name.replace(/\s+/g, '_').toLowerCase();
  const ext = format === 'jpeg' ? 'jpg' : 'png';
  return `${name}_passport_${date}.${ext}`;
}

function createCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d') };
}
