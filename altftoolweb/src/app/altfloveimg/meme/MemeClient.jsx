"use client";

import { useEffect, useState } from "react";
import ToolShell, { ToolLayout } from "../components/shared/ToolShell";
import Dropzone from "../components/shared/Dropzone";
import PreviewFrame from "../components/shared/PreviewFrame";
import { RangeField, TextField, SelectField, ToggleRow } from "../components/shared/Controls";
import { ErrorBanner } from "../components/shared/States";
import { useImage } from "../lib/useImage";
import { drawMeme } from "../lib/imageProcessing";
import { downloadBlob, suffixName } from "../lib/utils";

const FONTS = [
  { value: "Impact, Geist, sans-serif", label: "Impact (classic)" },
  { value: "Arial, Helvetica, sans-serif", label: "Arial" },
  { value: "Geist, sans-serif", label: "Geist" },
  { value: "Comic Sans MS, cursive", label: "Comic Sans" },
  { value: "Georgia, serif", label: "Georgia" },
];

export default function MemeClient() {
  const { image, error, setError, load, reset } = useImage();
  const [topText, setTopText] = useState("TOP TEXT");
  const [bottomText, setBottomText] = useState("BOTTOM TEXT");
  const [fontSize, setFontSize] = useState(9);
  const [color, setColor] = useState("#ffffff");
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [font, setFont] = useState(FONTS[0].value);
  const [uppercase, setUppercase] = useState(true);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!image) return;
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const { blob } = await drawMeme(image.img, {
          topText, bottomText, fontSize, color, strokeColor, strokeWidth,
          fontFamily: font, uppercase, type: "image/png",
        });
        if (cancelled) return;
        setResult((prev) => {
          if (prev?.url) URL.revokeObjectURL(prev.url);
          return { blob, url: URL.createObjectURL(blob) };
        });
      } catch (e) { setError(e.message); }
      finally { if (!cancelled) setBusy(false); }
    }, 180);
    return () => { cancelled = true; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, topText, bottomText, fontSize, color, strokeColor, strokeWidth, font, uppercase]);

  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result]);

  const download = () => result && downloadBlob(result.blob, suffixName(image.file.name, "meme", "png"));
  const handleReset = () => { setResult(null); reset(); };

  const sidebar = (
    <div className="flex flex-col gap-4">
      <TextField label="Top text" value={topText} onChange={setTopText} placeholder="Top caption…" />
      <TextField label="Bottom text" value={bottomText} onChange={setBottomText} placeholder="Bottom caption…" />
      <SelectField label="Font" value={font} onChange={setFont} options={FONTS} />
      <RangeField label="Font size" value={fontSize} min={4} max={18} unit="%" onChange={setFontSize} />
      <RangeField label="Outline" value={strokeWidth} min={0} max={8} onChange={setStrokeWidth} />
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Text</span>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border" style={{ borderColor: "var(--ali-border)" }} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Outline</span>
          <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="h-10 w-full cursor-pointer rounded-lg border" style={{ borderColor: "var(--ali-border)" }} />
        </label>
      </div>
      <ToggleRow label="Uppercase" checked={uppercase} onChange={setUppercase} />
    </div>
  );

  return (
    <ToolShell slug="meme">
      {!image ? (
        <>
          <ErrorBanner message={error} onDismiss={() => setError("")} />
          <Dropzone onFiles={(f) => load(f[0])} slug="meme" title="Drop an image to make a meme" />
        </>
      ) : (
        <ToolLayout sidebar={sidebar}>
          <div className="flex flex-col gap-4">
            <ErrorBanner message={error} onDismiss={() => setError("")} />
            <PreviewFrame title="Meme preview" onReset={handleReset} onDownload={download} busy={busy || !result} downloadLabel="Export meme">
              <img src={result?.url || image.url} alt="meme preview" className="max-h-[460px] max-w-full" />
            </PreviewFrame>
          </div>
        </ToolLayout>
      )}
    </ToolShell>
  );
}
