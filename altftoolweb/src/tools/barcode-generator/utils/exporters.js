import { jsPDF } from "jspdf";

export function downloadDataUrl(dataUrl, filename) {
  const link = Object.assign(document.createElement("a"), { href: dataUrl, download: filename });
  link.click();
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, filename);
  URL.revokeObjectURL(url);
}

export function exportPng(canvas, filename) {
  downloadDataUrl(canvas.toDataURL("image/png"), filename);
}

export function serializeSvg(svgNode) {
  return new XMLSerializer().serializeToString(svgNode);
}

export function exportSvg(svgNode, filename) {
  downloadBlob(new Blob([serializeSvg(svgNode)], { type: "image/svg+xml;charset=utf-8" }), filename);
}

export function exportPdf(canvas, filename) {
  const { width, height } = canvas;
  const pdf = new jsPDF({
    orientation: width >= height ? "landscape" : "portrait",
    unit: "px",
    format: [width, height],
  });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, width, height);
  pdf.save(filename);
}

export async function copyCanvasImage(canvas) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not read the canvas");
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

// ---------------------------------------------------------------------------
// EPS — true vector export built from the JsBarcode SVG (bars are <rect>s).
// EPS's origin is bottom-left, so y coordinates are flipped.
// ---------------------------------------------------------------------------

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  const int = parseInt(full, 16);
  if (Number.isNaN(int)) return [0, 0, 0];
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}

function psColor(hex) {
  return hexToRgb(hex || "#000000")
    .map((channel) => channel.toFixed(3))
    .join(" ");
}

export function svgToEps(svgNode) {
  const svg = svgNode.cloneNode(true);
  const width = Math.ceil(parseFloat(svg.getAttribute("width")) || 0);
  const height = Math.ceil(parseFloat(svg.getAttribute("height")) || 0);

  const lines = [
    "%!PS-Adobe-3.0 EPSF-3.0",
    `%%BoundingBox: 0 0 ${width} ${height}`,
    "%%Creator: AltFTool Barcode Generator",
    "%%EndComments",
  ];

  const background = svg.querySelector("rect");
  if (background) {
    lines.push(
      `${psColor(background.getAttribute("style")?.match(/fill:\s*([^;]+)/)?.[1] || background.getAttribute("fill") || "#ffffff")} setrgbcolor`,
      `0 0 ${width} ${height} rectfill`,
    );
  }

  // Bar rects live inside <g> groups; group transform carries the x/y offset.
  svg.querySelectorAll("g").forEach((group) => {
    const transform = group.getAttribute("transform") || "";
    const translate = transform.match(/translate\(\s*([\d.-]+)[ ,]+([\d.-]+)\s*\)/);
    const offsetX = translate ? parseFloat(translate[1]) : 0;
    const offsetY = translate ? parseFloat(translate[2]) : 0;
    const fill = group.getAttribute("fill") || "#000000";

    group.querySelectorAll("rect").forEach((rect) => {
      const x = offsetX + (parseFloat(rect.getAttribute("x")) || 0);
      const y = offsetY + (parseFloat(rect.getAttribute("y")) || 0);
      const rectWidth = parseFloat(rect.getAttribute("width")) || 0;
      const rectHeight = parseFloat(rect.getAttribute("height")) || 0;
      const epsY = height - y - rectHeight;
      lines.push(
        `${psColor(rect.getAttribute("fill") || fill)} setrgbcolor`,
        `${x.toFixed(2)} ${epsY.toFixed(2)} ${rectWidth.toFixed(2)} ${rectHeight.toFixed(2)} rectfill`,
      );
    });

    group.querySelectorAll("text").forEach((textNode) => {
      const x = offsetX + (parseFloat(textNode.getAttribute("x")) || 0);
      const y = offsetY + (parseFloat(textNode.getAttribute("y")) || 0);
      const fontSize = parseFloat(textNode.getAttribute("style")?.match(/font-size:\s*([\d.]+)/)?.[1] || textNode.getAttribute("font-size")) || 12;
      const anchor = textNode.getAttribute("text-anchor") || "start";
      const content = (textNode.textContent || "").replace(/([()\\])/g, "\\$1");
      if (!content) return;
      lines.push(
        `${psColor(textNode.getAttribute("fill") || fill)} setrgbcolor`,
        `/Helvetica findfont ${fontSize.toFixed(1)} scalefont setfont`,
      );
      if (anchor === "middle") {
        lines.push(
          `(${content}) stringwidth pop 2 div ${x.toFixed(2)} exch sub ${(height - y).toFixed(2)} moveto`,
        );
      } else {
        lines.push(`${x.toFixed(2)} ${(height - y).toFixed(2)} moveto`);
      }
      lines.push(`(${content}) show`);
    });
  });

  lines.push("showpage", "%%EOF");
  return lines.join("\n");
}

export function exportEps(svgNode, filename) {
  downloadBlob(new Blob([svgToEps(svgNode)], { type: "application/postscript" }), filename);
}
