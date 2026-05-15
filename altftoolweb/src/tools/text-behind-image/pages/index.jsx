"use client";

import { useState } from "react";
import { Download, ImagePlus, Type } from "lucide-react";

export default function ToolHome() {
  const [image, setImage] = useState("");
  const [text, setText] = useState("BOLD");
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(120);
  const [opacity, setOpacity] = useState(82);

  const handleImage = (file) => {
    if (!file) return;
    setImage(URL.createObjectURL(file));
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ImagePlus className="h-4 w-4" />
            Poster composer
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Text Behind Image</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Create bold editorial image compositions with adjustable text, color, scale, and overlay intensity.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] px-4 py-5 text-sm font-semibold hover:bg-[var(--muted)]">
              <ImagePlus className="h-5 w-5" />
              Upload image
              <input type="file" accept="image/*" className="hidden" onChange={(event) => handleImage(event.target.files?.[0])} />
            </label>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Text</span>
              <input value={text} onChange={(event) => setText(event.target.value)} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-lg font-semibold outline-none focus:border-[var(--primary)]" />
            </label>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold">Text color</span>
                <input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="mt-2 h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-1" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Opacity</span>
                <input type="number" min="10" max="100" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--primary)]" />
              </label>
            </div>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Text size</span>
              <input type="range" min="48" max="240" value={size} onChange={(event) => setSize(Number(event.target.value))} className="mt-3 w-full" />
            </label>
            <button type="button" onClick={() => window.print()} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white">
              <Download className="h-4 w-4" />
              Print / Save
            </button>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="relative flex aspect-[16/10] min-h-[420px] items-center justify-center overflow-hidden rounded-lg bg-slate-950">
              {image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
                </>
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#3b82f6,transparent_32%),linear-gradient(135deg,#111827,#0f766e)]" />
              )}
              <div className="absolute inset-0 bg-black/25" />
              <Type className="absolute left-5 top-5 h-5 w-5 text-white/70" />
              <h2
                className="relative max-w-[92%] break-words text-center font-black uppercase leading-none tracking-normal"
                style={{ color, fontSize: `${size}px`, opacity: opacity / 100, textShadow: "0 12px 40px rgba(0,0,0,.42)" }}
              >
                {text}
              </h2>
              {image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-multiply" />
                </>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
