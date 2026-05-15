/**
 * Procedural Noise & Image Processing Utilities
 */

/**
 * Generates a noise texture canvas
 */
export const generateNoiseCanvas = (width, height, settings) => {
  const { intensity, size, monochrome, type } = settings;
  const canvas = document.createElement("canvas");
  // We can use a smaller canvas and scale it up for performance if size > 1
  const scaledWidth = Math.ceil(width / size);
  const scaledHeight = Math.ceil(height / size);
  
  canvas.width = scaledWidth;
  canvas.height = scaledHeight;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(scaledWidth, scaledHeight);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    if (type === "rgb-split") {
      // Offset RGB for split effect
      data[i] = Math.random() * 255;     // R
      data[i + 1] = Math.random() * 255; // G
      data[i + 2] = Math.random() * 255; // B
    } else if (monochrome) {
      const noise = Math.random() * 255;
      data[i] = noise;     // R
      data[i + 1] = noise; // G
      data[i + 2] = noise; // B
    } else {
      // Subtle color noise
      const base = Math.random() * 255;
      data[i] = base + (Math.random() - 0.5) * 50;
      data[i + 1] = base + (Math.random() - 0.5) * 50;
      data[i + 2] = base + (Math.random() - 0.5) * 50;
    }
    
    // Alpha controlled by intensity (0-100)
    data[i + 3] = (intensity / 100) * 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
};

/**
 * Generates dust and scratches overlay
 */
export const generateDustAndScratches = (width, height, amount, density) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  
  if (amount <= 0) return canvas;

  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";

  // Dust particles
  const numDust = Math.floor(width * height * 0.00001 * amount);
  for (let i = 0; i < numDust; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = Math.random() * 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Scratches
  const numScratches = Math.floor(density * 5);
  for (let i = 0; i < numScratches; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const len = Math.random() * 100 * (amount / 50);
    const angle = Math.random() * Math.PI * 2;
    const x2 = x1 + Math.cos(angle) * len;
    const y2 = y1 + Math.sin(angle) * len;
    
    ctx.lineWidth = Math.random() * 0.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  return canvas;
};

/**
 * Applies CSS-like filters to canvas context
 */
export const applyFilters = (ctx, settings) => {
  const { brightness, contrast, saturation, blur, sharpness, warmth, vignette } = settings;
  
  // Basic CSS filters
  let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  if (blur > 0) filterString += ` blur(${blur}px)`;
  
  // Note: sharpness isn't a direct CSS filter, but we can simulate it with a convolution kernel if needed.
  // For simplicity here, we'll focus on the main ones.
  
  return filterString;
};

/**
 * Applies vignette effect
 */
export const drawVignette = (ctx, width, height, intensity) => {
  if (intensity <= 0) return;
  
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2))
  );
  
  const alpha = (intensity / 100) * 0.8;
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.6, "rgba(0,0,0,0)");
  gradient.addColorStop(1, `rgba(0,0,0,${alpha})`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

/**
 * Applies warmth/tint
 */
export const applyWarmth = (ctx, width, height, warmth) => {
  if (warmth === 0) return;
  
  // warm (>0) is orange/yellow, cold (<0) is blue
  const color = warmth > 0 ? `rgba(255, 150, 0, ${Math.abs(warmth) / 500})` : `rgba(0, 100, 255, ${Math.abs(warmth) / 500})`;
  
  ctx.fillStyle = color;
  ctx.globalCompositeOperation = "overlay";
  ctx.fillRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";
};
