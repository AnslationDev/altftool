import {
  JPEG_QUALITY,
  MAX_OUTPUT_HEIGHT,
  MAX_OUTPUT_WIDTH,
} from "./aspectRatio";
export async function getCroppedImg(
  imageSrc,
  croppedAreaPixels,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  filters = { brightness: 1, contrast: 1, saturation: 1, grayscale: 0 },
) {
  const image = new Image();
  image.src = imageSrc;

  await image.decode();

  let { width, height } = croppedAreaPixels;

  if (width > MAX_OUTPUT_WIDTH || height > MAX_OUTPUT_HEIGHT) {
    const ratio = Math.min(
      MAX_OUTPUT_WIDTH / width,
      MAX_OUTPUT_HEIGHT / height,
    );
    width = width * ratio;
    height = height * ratio;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.filter = `
  brightness(${filters.brightness})
  contrast(${filters.contrast})
  saturate(${filters.saturation})
  grayscale(${filters.grayscale}) `;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    -width / 2,
    -height / 2,
    width,
    height,
  );
  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(URL.createObjectURL(blob));
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}
