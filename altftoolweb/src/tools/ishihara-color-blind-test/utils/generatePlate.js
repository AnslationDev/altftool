/**
 * Generates a set of dots for an Ishihara plate.
 * Each dot has: x, y, radius, color
 */

export const generateDots = (width, height, targetNumber, colors, visionMode = "normal") => {
  const dots = [];
  const radius = Math.min(width, height) / 2.2;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Create a temporary canvas to draw the number and check pixel values
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  
  ctx.fillStyle = "black";
  ctx.font = `bold ${radius * 1.5}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(targetNumber, centerX, centerY);
  
  const imageData = ctx.getImageData(0, 0, width, height).data;
  
  const maxDots = 800;
  let attempts = 0;
  
  while (dots.length < maxDots && attempts < 5000) {
    attempts++;
    const r = Math.random() * radius;
    const theta = Math.random() * 2 * Math.PI;
    const x = centerX + r * Math.cos(theta);
    const y = centerY + r * Math.sin(theta);
    const dotRadius = Math.random() * (radius * 0.08) + (radius * 0.02);
    
    // Check for overlap
    let overlap = false;
    for (const dot of dots) {
      const dx = x - dot.x;
      const dy = y - dot.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < (dotRadius + dot.radius + 1)) {
        overlap = true;
        break;
      }
    }
    
    if (!overlap) {
      // Check if dot is inside the number
      const pixelIndex = (Math.floor(y) * width + Math.floor(x)) * 4;
      const isInsideNumber = imageData[pixelIndex + 3] > 128;
      
      const palette = isInsideNumber ? colors.foreground : colors.background;
      const color = palette[Math.floor(Math.random() * palette.length)];
      
      dots.push({ x, y, radius: dotRadius, color });
    }
  }
  
  return dots;
};
