"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { ArrowLeft, Download, RotateCcw, Save, Upload, Copy, Maximize2, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Navbar } from "../site/Navbar";
import { Disclaimer } from "../site/Disclaimer";
import { useEditor } from "../../lib/editor-store";
import { toast } from "sonner";

const DUPLICATE_KEY_BY_SLUG = {
  whatsapp: "messages",
  "instagram-dm": "messages",
  messenger: "messages",
  telegram: "messages",
  snapchat: "messages",
  "facebook-post": "comments",
  youtube: "comments",
  "search-results": "searchResults",
};

function EditorLayout({ title, slug, sidebar, preview }) {
  const previewRef = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const reset = useEditor((s) => s.reset);
  const setMany = useEditor((s) => s.setMany);
  const duplicateKey = DUPLICATE_KEY_BY_SLUG[slug];
  const handleExport = async () => {
    if (!previewRef.current) return;
    try {
      const dataUrl = await toPng(previewRef.current, { pixelRatio: 3, cacheBust: true, backgroundColor: void 0 });
      const link = document.createElement("a");
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-mockly.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Exported high-res PNG");
    } catch {
      toast.error("Export failed. Try again.");
    }
  };
  const handleSave = () => {
    try {
      localStorage.setItem(`mockly:${title}`, JSON.stringify(useEditor.getState()));
      toast.success("Draft saved locally");
    } catch {
      toast.error("Could not save");
    }
  };
  const handleLoad = () => {
    try {
      const raw = localStorage.getItem(`mockly:${title}`);
      if (!raw) {
        toast.error("No saved draft found");
        return;
      }
      setMany(JSON.parse(raw));
      toast.success("Draft loaded");
    } catch {
      toast.error("Could not load draft");
    }
  };
  const handleDuplicate = () => {
    if (!duplicateKey) return;
    const s = useEditor.getState();
    const list = s[duplicateKey] ?? [];
    setMany({ [duplicateKey]: [...list, ...list.map((item) => ({ ...item, id: Math.random().toString(36).slice(2) }))] });
    toast.success("Duplicated");
  };
  return <div className="min-h-screen bg-hero animate-gradient">
      <Navbar />
      <div className="mx-auto max-w-[1600px] px-4 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="rounded-xl"><Link href="/prank-socialmedia/templates"><ArrowLeft className="mr-1 h-4 w-4" />Templates</Link></Button>
            <div>
              <p className="text-xs text-muted-foreground">Editor</p>
              <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur"><Sparkles className="h-3 w-3 text-primary" />Live preview</span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)_260px]">
          <aside className="glass max-h-[calc(100vh-200px)] overflow-y-auto rounded-2xl p-4 lg:sticky lg:top-24">
            <h2 className="mb-3 text-sm font-semibold">Content</h2>
            <div className="space-y-4">{sidebar}</div>
            <div className="mt-6"><Disclaimer /></div>
          </aside>

          <main className={`relative ${fullscreen ? "fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-6 backdrop-blur" : ""}`}>
            <div ref={previewRef} className="mx-auto flex justify-center py-4">
              {preview}
            </div>
            {fullscreen && <Button onClick={() => setFullscreen(false)} className="absolute right-6 top-6 rounded-xl" variant="outline">Close</Button>}
          </main>

          <aside className="glass h-fit rounded-2xl p-3 lg:sticky lg:top-24">
            <h2 className="mb-3 px-1 text-sm font-semibold">Actions</h2>
            <div className="grid gap-2">
              <Button onClick={handleExport} className="justify-start rounded-xl bg-gradient-primary text-primary-foreground shadow-glow"><Download className="mr-2 h-4 w-4" />Export PNG</Button>
              <Button onClick={handleSave} variant="outline" className="justify-start rounded-xl"><Save className="mr-2 h-4 w-4" />Save draft</Button>
              <Button onClick={handleLoad} variant="outline" className="justify-start rounded-xl"><Upload className="mr-2 h-4 w-4" />Load draft</Button>
              <Button onClick={handleDuplicate} disabled={!duplicateKey} variant="outline" className="justify-start rounded-xl"><Copy className="mr-2 h-4 w-4" />Duplicate</Button>
              <Button onClick={() => setFullscreen((v) => !v)} variant="outline" className="justify-start rounded-xl"><Maximize2 className="mr-2 h-4 w-4" />Fullscreen</Button>
              <Button onClick={() => {
    reset();
    toast.success("Reset");
  }} variant="ghost" className="justify-start rounded-xl text-destructive hover:text-destructive"><RotateCcw className="mr-2 h-4 w-4" />Reset</Button>
            </div>
          </aside>
        </div>
      </div>
    </div>;
}
export {
  EditorLayout
};
