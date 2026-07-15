export function getPrintSheetLayout(template, sheetOption, paperSize) {
  const cols = sheetOption?.cols || template.printLayout?.cols || 2;
  const rows = sheetOption?.rows || template.printLayout?.rows || 2;
  const spacing = template.printLayout?.spacing || 5;

  const photoW = template.width;
  const photoH = template.height;

  const totalW = cols * photoW + (cols - 1) * spacing;
  const totalH = rows * photoH + (rows - 1) * spacing;

  const startX = Math.max(0, (paperSize.width - totalW) / 2);
  const startY = Math.max(0, (paperSize.height - totalH) / 2);

  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({
        x: startX + c * (photoW + spacing),
        y: startY + r * (photoH + spacing),
        w: photoW,
        h: photoH,
      });
    }
  }

  return positions;
}

export function renderPrintSheet(canvas, template, sheetOption, paperSize, imageData) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const positions = getPrintSheetLayout(template, sheetOption, paperSize);

  for (const pos of positions) {
    ctx.drawImage(imageData, pos.x, pos.y, pos.w, pos.h);
  }
}

export function validateTemplateDimensions(template, imageWidth, imageHeight) {
  const minWidth = template.width * 0.5;
  const minHeight = template.height * 0.5;
  const warnings = [];

  if (imageWidth < minWidth || imageHeight < minHeight) {
    warnings.push(`Image is too small for ${template.name}. Minimum ${Math.round(minWidth)}×${Math.round(minHeight)}px required.`);
  }

  return {
    valid: warnings.length === 0,
    warnings,
    requiredWidth: Math.round(template.width),
    requiredHeight: Math.round(template.height),
  };
}
