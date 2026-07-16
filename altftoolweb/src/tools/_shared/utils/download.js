"use client";

export function downloadCanvas(canvas, filename = 'download.png', type = 'image/png') {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, type);
}

export function downloadBlob(blob, filename = 'download.png') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadDataURL(dataURL, filename = 'download.png') {
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;
  a.click();
}

export async function shareImage(blob, title = 'Check this out!') {
  if (!navigator.share) return false;
  try {
    const file = new File([blob], 'image.png', { type: blob.type });
    await navigator.share({ title, files: [file] });
    return true;
  } catch {
    return false;
  }
}
