/* Small shared helpers for ALTF Love IMG (client-side). */

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export function percentChange(before, after) {
  if (!before) return 0;
  return Math.round(((before - after) / before) * 100);
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function downloadZip(items, zipName = "altf-images.zip") {
  // items: [{ blob, filename }]
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  items.forEach(({ blob, filename }) => zip.file(filename, blob));
  const content = await zip.generateAsync({ type: "blob" });
  downloadBlob(content, zipName);
}

export function changeExtension(name, ext) {
  const base = name.replace(/\.[^/.]+$/, "");
  return `${base}.${ext}`;
}

export function suffixName(name, suffix, ext) {
  const base = name.replace(/\.[^/.]+$/, "");
  const finalExt = ext || (name.match(/\.([^/.]+)$/)?.[1] ?? "png");
  return `${base}-${suffix}.${finalExt}`;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function isImageFile(file) {
  return file && file.type && file.type.startsWith("image/");
}
