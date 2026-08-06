export const MAX_SELFIE_FILE_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_SELFIE_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function getSelfieFileError(file) {
  if (!file) return "";

  if (!ACCEPTED_SELFIE_FILE_TYPES.includes(file.type)) {
    return "Unsupported format. Please use a PNG, JPG, or WebP image.";
  }

  if (file.size > MAX_SELFIE_FILE_BYTES) {
    return "Image size exceeds the 5MB limit.";
  }

  return "";
}
