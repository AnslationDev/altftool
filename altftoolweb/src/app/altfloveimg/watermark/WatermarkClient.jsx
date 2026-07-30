"use client";

import { useEffect, useRef, useState } from "react";
import { Type, ImageIcon, Upload } from "lucide-react";
import ToolShell, { ToolLayout, Panel } from "../components/shared/ToolShell";
import Dropzone from "../components/shared/Dropzone";
import PreviewFrame from "../components/shared/PreviewFrame";
import { RangeField, TextField, ToggleRow, SelectField } from "../components/shared/Controls";
import { ErrorBanner } from "../components/shared/States";
import { useImage } from "../lib/useImage";
import { watermarkText, watermarkImage, loadImage, MIME } from "../lib/imageProcessing";
import { downloadBlob, suffixName } from "../lib/utils";

const GRID = [
  ["top-left", "top-center", "top-right"],
  ["center-left", "center", "center-right"],
  ["bottom-left", "bottom-center", "bottom-right"],
];
// map grid positions to imageProcessing.js anchor keys
const ANCHOR = {
  "top-left": "top-left", "top-center": "top-center", "top-right": "top-right",
  "center-left": "center-left", "center": "center", "center-right": "center-right",
  "bottom-left": "bottom-left", "bottom-center": "bottom-center", "bottom-right": "bottom-right",
};

export default function WatermarkClient() {
  const { image, error, setError, load, reset } = useImage();
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("ALTF Love IMG");
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(8);
  const [opacity, setOpacity] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState("bottom-right");
  const [tile, setTile] = useState(false);
  const [format, setFormat] = useState("png");
  const [markImg, setMarkImg] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const markUrl = useRef(null);

  useEffect(() => {
    if (image) setFormat(image.file.type === "image/jpeg" ? "jpg" : "png");
  }, [image]);

  const loadMark = async (file) => {
    try {
      const { img, url } = await loadImage(file);
      if (markUrl.current) URL.revokeObjectURL(markUrl.current);
      markUrl.current = url;
      setMarkImg(img);
    } catch (e) { setError("Couldn't load watermark image."); }
  };

  useEffect(() => {
    if (!image) return;
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const type = MIME[format];
        let out;
        if (mode === "text") {
          out = await watermarkText(image.img, {
            text, color, fontSize: size, opacity: opacity / 100,
            rotation, position: ANCHOR[position] || "bottom-right", tile, type,
          });
        } else {
          if (!markImg) { setBusy(false); return; }
          out = await watermarkImage(image.img, markImg, {
            scale: size * 3, opacity: opacity / 100, rotation,
            position: ANCHOR[position] || "bottom-right", type,
          });
        }
        if (cancelled) return;
        setResult((prev) => {
          if (prev?.url) URL.revokeObjectURL(prev.url);
          return { blob: out.blob, url: URL.createObjectURL(out.blob) };
        });
      } catch (e) { setError(e.message); }
      finally { if (!cancelled) setBusy(false); }
    }, 200);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, mode, text, color, size, opacity, rotation, position, tile, format, markImg]);

  useEffect(() => () => {
    if (markUrl.current) URL.revokeObjectURL(markUrl.current);
  }, []);
  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result]);

  const download = () => result && downloadBlob(result.blob, suffixName(image.file.name, "watermarked", format === "jpg" ? "jpg" : format));
  const handleReset = () => { setResult(null); reset(); };

  const sidebar = (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setMode("text")} data-active={mode === "text"} className="ali-chip justify-center !rounded-xl py-2.5"><Type size={16} /> Text</button>
        <button onClick={() => setMode("image")} data-active={mode === "image"} className="ali-chip justify-center !rounded-xl py-2.5"><ImageIcon size={16} /> Image</button>
      </div>

      {mode === "text" ? (
        <>
          <TextField label="Watermark text" value={text} onChange={setText} placeholder="Your text…" />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Color</span>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border" style={{ borderColor: "var(--ali-border)" }} />
          </label>
          <ToggleRow label="Tile across image" checked={tile} onChange={setTile} />
        </>
      ) : (
        <label className="ali-btn ali-btn-ghost cursor-pointer">
          <Upload size={15} /> {markImg ? "Change watermark" : "Upload watermark"}
          <input type="file" accept="image/png,image/webp,image/jpeg" className="hidden" onChange={(e) => e.target.files[0] && loadMark(e.target.files[0])} />
        </label>
      )}

      <RangeField label="Size" value={size} min={2} max={30} unit="%" onChange={setSize} />
      <RangeField label="Opacity" value={opacity} min={5} max={100} unit="%" onChange={setOpacity} />
      <RangeField label="Rotation" value={rotation} min={-90} max={90} unit="°" onChange={setRotation} />

      {!tile && (
        <div>
          <span className="mb-1.5 block text-sm font-medium">Position</span>
          <div className="grid grid-cols-3 gap-1.5">
            {GRID.flat().map((pos) => (
              <button key={pos} onClick={() => setPosition(pos)} data-active={position === pos}
                className="ali-chip h-9 justify-center !rounded-lg p-0" aria-label={pos}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: position === pos ? "var(--ali-teal)" : "var(--ali-border)" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <SelectField label="Output format" value={format} onChange={setFormat}
        options={[{ value: "png", label: "PNG" }, { value: "jpg", label: "JPG" }, { value: "webp", label: "WEBP" }]} />
    </div>
  );

  return (
    <ToolShell slug="watermark">
      {!image ? (
        <>
          <ErrorBanner message={error} onDismiss={() => setError("")} />
          <Dropzone onFiles={(f) => load(f[0])} slug="watermark" title="Drop an image to watermark" />
        </>
      ) : (
        <ToolLayout sidebar={sidebar}>
          <div className="flex flex-col gap-4">
            <ErrorBanner message={error} onDismiss={() => setError("")} />
            <PreviewFrame title="Live preview" onReset={handleReset} onDownload={download} busy={busy || !result}>
              {mode === "image" && !markImg ? (
                <div className="text-center text-sm" style={{ color: "var(--ali-muted)" }}>
                  Upload a watermark image to begin.
                  <img src={image.url} alt="" className="mt-4 max-h-[360px] max-w-full opacity-60" />
                </div>
              ) : (
                <img src={result?.url || image.url} alt="preview" className="max-h-[460px] max-w-full" />
              )}
            </PreviewFrame>
          </div>
        </ToolLayout>
      )}
    </ToolShell>
  );
}
