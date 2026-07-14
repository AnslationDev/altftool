// Export & clipboard helpers for the avatar.
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";

// Serialize the live <svg> node to a standalone SVG data URL (fallback for copy).
export function svgNodeToDataUrl(svgNode) {
  const clone = svgNode.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const serialized = new XMLSerializer().serializeToString(clone);
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialized);
}

// Download the avatar node as a PNG file.
export async function downloadAvatarPng(node, fileName = "avatar.png") {
  const dataUrl = await toPng(node, {
    pixelRatio: 3,
    cacheBust: true,
    backgroundColor: null,
  });
  saveAs(dataUrl, fileName);
}

// Copy the avatar to the clipboard as a PNG blob, with graceful fallback.
// Returns { ok, method } so the caller can show the right toast.
export async function copyAvatar(node) {
  // Preferred: native image/png clipboard.
  if (typeof navigator !== "undefined" && navigator.clipboard && window.ClipboardItem) {
    try {
      const dataUrl = await toPng(node, { pixelRatio: 3, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      return { ok: true, method: "png" };
    } catch (err) {
      // fall through to SVG fallback
    }
  }
  // Fallback: copy an SVG data URL string.
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      const dataUrl = svgNodeToDataUrl(node);
      await navigator.clipboard.writeText(dataUrl);
      return { ok: true, method: "svg" };
    } catch (err) {
      return { ok: false, method: "none" };
    }
  }
  return { ok: false, method: "none" };
}

// True if the browser can receive a pasted image (used to show a hint).
export function canCopyImage() {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.clipboard &&
    typeof window !== "undefined" &&
    !!window.ClipboardItem
  );
}
