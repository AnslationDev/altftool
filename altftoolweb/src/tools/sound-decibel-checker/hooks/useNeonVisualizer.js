"use client";
export function drawNeonVisualizer(canvas, freqData) {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  const barWidth = width / freqData.length;

  freqData.forEach((value, index) => {
    const barHeight = (value / 255) * height * 0.8;
    const x = index * barWidth;
    const y = height - barHeight;

    const hue = (index / freqData.length) * 360;
    ctx.shadowBlur = 20;
    ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;

    const gradient = ctx.createLinearGradient(x, y, x, height);
    gradient.addColorStop(0, `hsl(${hue}, 100%, 60%)`);
    gradient.addColorStop(1, `hsl(${hue}, 100%, 40%)`);

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth - 2, barHeight);
  });
}
