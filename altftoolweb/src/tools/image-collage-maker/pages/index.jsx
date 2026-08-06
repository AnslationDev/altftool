"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Download, 
  Trash2, 
  Grid, 
  LayoutGrid, 
  Columns3, 
  Rows3, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Eye, 
  X, 
  Sliders,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function ToolHome() {
  const [images, setImages] = useState([]);
  const [spacing, setSpacing] = useState(10);
  const [layout, setLayout] = useState("grid");
  const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Single intake point shared by the file picker and the drop zone, so the
  // image/* check below is the only place either path is validated.
  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    files.forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            setImages(prev => [...prev, {
              src: event.target.result,
              width: img.width,
              height: img.height,
              id: Date.now() + Math.random()
            }]);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleImageUpload = (e) => {
    addFiles(e.target.files);
  };

  // The page copy says photos are "dropped in", so the workspace has to accept
  // a drop. preventDefault is required on dragover as well as drop — without it
  // the browser navigates away to the dropped file and the collage is lost.
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    // Ignore the dragleave fired when the cursor crosses onto a child element.
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // The input is multiple + accept="image/*", so take the whole list.
    addFiles(e.dataTransfer?.files);
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const loadSingleImage = (imgData) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ img, id: imgData.id });
      img.onerror = () => resolve(null);
      img.src = imgData.src;
    });
  };

  const createCollage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const collageWidth = 1200;
    const collageHeight = 1200;

    canvas.width = collageWidth;
    canvas.height = collageHeight;

    // Fill canvas background
    ctx.fillStyle = "var(--surface-soft, #EEF3F6)";
    ctx.fillRect(0, 0, collageWidth, collageHeight);

    if (images.length === 0) return;

    // Load all images asynchronously first to prevent canvas draw race conditions
    const loadedImages = await Promise.all(images.map(loadSingleImage));
    const validImages = loadedImages.filter(Boolean);

    let cols, rows;
    switch (layout) {
      case "grid":
        cols = Math.ceil(Math.sqrt(validImages.length));
        rows = Math.ceil(validImages.length / cols);
        break;
      case "2x2":
        cols = 2;
        rows = 2;
        break;
      case "horizontal":
        cols = validImages.length;
        rows = 1;
        break;
      case "vertical":
        cols = 1;
        rows = validImages.length;
        break;
      default:
        cols = Math.ceil(Math.sqrt(validImages.length));
        rows = Math.ceil(validImages.length / cols);
    }

    const cellWidth = (collageWidth - spacing * (cols + 1)) / cols;
    const cellHeight = (collageHeight - spacing * (rows + 1)) / rows;

    validImages.slice(0, cols * rows).forEach((loaded, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = spacing + col * (cellWidth + spacing);
      const y = spacing + row * (cellHeight + spacing);

      const img = loaded.img;
      const scale = Math.max(cellWidth / img.width, cellHeight / img.height);
      const sw = img.width * scale;
      const sh = img.height * scale;
      const offsetX = (cellWidth - sw) / 2;
      const offsetY = (cellHeight - sh) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, cellWidth, cellHeight);
      ctx.clip();
      ctx.drawImage(img, x + offsetX, y + offsetY, sw, sh);
      ctx.restore();
    });
  };

  const downloadCollage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `collage-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  };

  useEffect(() => {
    createCollage();
  }, [images, spacing, layout]);

  const galleryItems = [
    {
      id: 1,
      title: "Nature Grid",
      layout: "Grid Layout",
      image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format&fit=crop&q=80",
      description: "4 photos in a perfect landscape grid arrangement."
    },
    {
      id: 2,
      title: "Travel Memories",
      layout: "2x2 Layout",
      image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80",
      description: "Classic 2x2 vacation memories collage layout."
    },
    {
      id: 3,
      title: "Food Journey",
      layout: "Horizontal",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80",
      description: "Delicious culinary stories arranged horizontally."
    }
  ];

  const features = [
    {
      title: "Multiple Layouts",
      description: "Choose from Grid, 2x2, Horizontal, and Vertical layout styles to express your stories.",
      icon: <Grid className="w-5 h-5 text-primary" />
    },
    {
      title: "Instant Preview",
      description: "Tweak spacing sliders and layouts and watch the canvas update in real-time.",
      icon: <Sparkles className="w-5 h-5 text-purple-500" />
    },
    {
      title: "High Resolution",
      description: "Generates collage canvases at high resolution (1200x1200px) ideal for social prints.",
      icon: <Zap className="w-5 h-5 text-amber-500" />
    },
    {
      title: "100% Private",
      description: "Your photos never touch any server. Everything is processed locally in browser memory.",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Grid className="h-5 w-5 text-primary group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Image Collage Maker
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Creators
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Combine your photos into beautiful custom grid arrangements. Adjust spacing, select layout styles, and export high-resolution collages locally.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Custom Padding", "Responsive Canvas", "No Account"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Hidden Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          multiple 
          accept="image/*"
          onChange={handleImageUpload} 
          className="hidden" 
        />

        {/* Workspace Layout */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          onDragEnter={handleDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          
          {/* Sidebar Editor */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
              
              {/* Layout selection */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider block">Layout Style</h3>
                <div className="grid grid-cols-4 gap-1.5 bg-surface-soft p-1 rounded-xl">
                  {[
                    { value: "grid", icon: <Grid size={14} /> },
                    { value: "2x2", icon: <LayoutGrid size={14} /> },
                    { value: "horizontal", icon: <Columns3 size={14} /> },
                    { value: "vertical", icon: <Rows3 size={14} /> }
                  ].map((lay) => (
                    <button
                      key={lay.value}
                      onClick={() => setLayout(lay.value)}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
                        layout === lay.value 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "text-muted-foreground hover:bg-card hover:text-foreground"
                      }`}
                    >
                      {lay.icon}
                      <span className="text-[9px] mt-1 font-semibold">{lay.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Spacing Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-foreground uppercase tracking-wider">
                  <span>Image Spacing</span>
                  <span>{spacing}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sliders size={14} className="text-muted" />
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={spacing}
                    onChange={(e) => setSpacing(Number(e.target.value))}
                    className="w-full accent-primary bg-surface-soft h-1 rounded-lg border-none outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Photos List */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider block">Images ({images.length})</h3>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-bold text-primary hover:brightness-110 flex items-center gap-0.5 cursor-pointer"
                  >
                    Add Photos
                  </button>
                </div>

                {images.length === 0 ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed hover:border-primary rounded-xl p-6 text-center cursor-pointer hover:bg-surface-soft/40 transition-colors ${isDragging ? "border-primary" : "border-border"}`}
                  >
                    <Upload className="h-5 w-5 text-muted mx-auto mb-2" />
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">Select Photos</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto pr-1">
                    {images.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                        <img src={img.src} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150 cursor-pointer"
                        >
                          <Trash2 size={14} className="text-rose-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Canvas Preview Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
              
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Eye size={14} className="text-primary" />
                  Collage Canvas Preview
                </h2>
                
                {images.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={downloadCollage}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-foreground bg-primary rounded-lg px-3 py-1.5 hover:brightness-110 transition cursor-pointer"
                    >
                      <Download size={10} /> Download Collage
                    </button>
                    <button
                      onClick={() => setImages([])}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-background border border-border rounded-lg px-3 py-1.5 hover:border-rose-500 hover:bg-rose-500/5 transition cursor-pointer"
                    >
                      <Trash2 size={10} /> Clear Canvas
                    </button>
                  </div>
                )}
              </div>

              {/* Responsive Canvas Container */}
              <div className={`flex items-center justify-center p-4 bg-surface-soft rounded-2xl border max-w-full overflow-hidden transition-colors ${isDragging ? "border-primary" : "border-border"}`}>
                {images.length === 0 ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center text-center p-12 cursor-pointer max-w-sm mx-auto space-y-3"
                  >
                    <div className="p-3 bg-card border border-border rounded-full text-muted shadow-sm">
                      <Upload size={24} className="text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">No photos loaded yet</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold">Upload multiple pictures to create your custom design collage layout.</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-[450px] aspect-square shadow-md border border-border/80 rounded-xl overflow-hidden bg-card">
                    <canvas ref={canvasRef} className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Gallery Examples */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">Collage Gallery</h2>
            <p className="text-xs text-muted-foreground font-semibold">Get inspired by these creative collage examples</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedGalleryItem(item)}
                className="group border border-border bg-surface-soft/40 hover:bg-surface-soft rounded-xl p-4 cursor-pointer transition-all duration-300 space-y-3"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  <span className="absolute top-2 left-2 inline-flex rounded bg-black/60 backdrop-blur-sm px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
                    {item.layout}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">{item.title}</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Callouts */}
        <section className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-lg font-bold text-foreground uppercase tracking-wider">Powerful Features</h2>
            <p className="text-xs text-muted-foreground font-semibold">Everything you need to compile amazing visual grid collections</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {features.map((feat, index) => (
              <div key={index} className="bg-surface-soft border border-border/60 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-card border border-border/80 text-primary">
                  {feat.icon}
                </div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">{feat.title}</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">{feat.description}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Modal Dialog */}
      {selectedGalleryItem && (
        <div 
          onClick={() => setSelectedGalleryItem(null)}
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative bg-card border border-border rounded-2xl max-w-xl w-full shadow-2xl p-6 space-y-4"
          >
            <button
              onClick={() => setSelectedGalleryItem(null)}
              className="absolute top-4 right-4 text-muted hover:text-foreground transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border">
              <img src={selectedGalleryItem.image} alt={selectedGalleryItem.title} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1">
              <span className="inline-flex rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary">
                {selectedGalleryItem.layout}
              </span>
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mt-1">{selectedGalleryItem.title}</h3>
              <p className="text-xs text-muted-foreground font-semibold leading-relaxed">{selectedGalleryItem.description}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
