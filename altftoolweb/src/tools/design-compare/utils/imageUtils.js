import { ACCEPTED_IMAGE_TYPES } from "../constants/compareModes";

export function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

export function validateImage(file) {
  if (!file) return "Choose an image file.";
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Upload PNG, JPG, WebP, or GIF images.";
  return "";
}

export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const error = validateImage(file);
    if (error) {
      reject(new Error(error));
      return;
    }

    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({
        file,
        url,
        name: file.name,
        type: file.type.replace("image/", "").toUpperCase(),
        size: file.size,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image could not be read."));
    };

    image.src = url;
  });
}
