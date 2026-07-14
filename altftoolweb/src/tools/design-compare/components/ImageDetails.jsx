import { formatBytes } from "../utils/imageUtils";

export default function ImageDetails({ imageA, imageB }) {
  const rows = [
    ["Resolution", imageA && imageB ? `${imageA.width}x${imageA.height} / ${imageB.width}x${imageB.height}` : "Waiting for both images"],
    ["Image size", imageA && imageB ? `${formatBytes(imageA.size)} / ${formatBytes(imageB.size)}` : "Upload two designs"],
    ["File type", imageA && imageB ? `${imageA.type} / ${imageB.type}` : "PNG, JPG, WebP, GIF"],
    ["Dimensions match", imageA && imageB ? (imageA.width === imageB.width && imageA.height === imageB.height ? "Yes" : "No") : "Pending"],
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
          <p className="mt-2 text-sm font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}
