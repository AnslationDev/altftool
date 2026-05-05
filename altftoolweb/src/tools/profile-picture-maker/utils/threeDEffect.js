export const apply3DEffect = (canvas, img) => {
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // base image
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  // shadow
  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // light
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "rgba(255,255,255,0.3)");
  gradient.addColorStop(1, "rgba(0,0,0,0.3)");

  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "source-over";
};