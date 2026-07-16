import { useState, useRef, useCallback, useEffect } from "react";

export default function Visualization({ imgA, imgB, analysisA, analysisB }) {
  const [mode, setMode] = useState("side-by-side");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const modes = [
    { id: "side-by-side", label: "Side by Side" },
    { id: "split", label: "Split View" },
    { id: "overlay", label: "Overlay" },
    { id: "pixel", label: "Pixel View" },
    { id: "heatmap", label: "Difference Heatmap" },
  ];

  useEffect(() => {
    if (!imgA || !imgB) return;
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const container = containerRef.current;
    const cw = container?.clientWidth || 800;
    const ch = container?.clientHeight || 500;
    cvs.width = cw; cvs.height = ch;

    ctx.clearRect(0, 0, cw, ch);
    const drawScaled = (img, x, y, w, h) => {
      if (mode === "pixel") {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, x, y, w, h);
        ctx.imageSmoothingEnabled = true;
      } else {
        ctx.drawImage(img, x, y, w, h);
      }
    };

    const aspectA = imgA.naturalWidth / imgA.naturalHeight;
    const aspectB = imgB.naturalWidth / imgB.naturalHeight;

    if (mode === "side-by-side") {
      const half = cw / 2 - 4;
      const hA = half / aspectA;
      const hB = half / aspectB;
      const maxH = Math.min(ch, hA, hB);
      const wA = maxH * aspectA;
      const wB = maxH * aspectB;
      drawScaled(imgA, half - wA, (ch - maxH) / 2, wA, maxH);
      drawScaled(imgB, half + 4, (ch - maxH) / 2, wB, maxH);
      ctx.strokeStyle = "rgba(20,184,166,0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(half, 0); ctx.lineTo(half, ch);
      ctx.stroke();
      ctx.fillStyle = "rgba(20,184,166,0.8)";
      ctx.font = "12px monospace";
      ctx.fillText("A", 4, 14);
      ctx.fillText("B", half + 8, 14);
    } else if (mode === "split") {
      const w = cw, h = ch;
      ctx.drawImage(imgA, 0, 0, w, h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(cw / 2, 0, cw / 2, ch);
      ctx.clip();
      ctx.drawImage(imgB, 0, 0, w, h);
      ctx.restore();
      ctx.strokeStyle = "#14B8A6";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cw / 2, 0); ctx.lineTo(cw / 2, ch);
      ctx.stroke();
    } else if (mode === "overlay") {
      ctx.drawImage(imgA, 0, 0, cw, ch);
      ctx.globalAlpha = 0.5;
      ctx.drawImage(imgB, 0, 0, cw, ch);
      ctx.globalAlpha = 1;
    } else if (mode === "pixel") {
      const s = zoom * 8;
      const cx = cw / 2, cy = ch / 2;
      ctx.drawImage(imgA, pan.x, pan.y, cw / zoom, ch / zoom, 0, 0, cw, ch);
    } else if (mode === "heatmap") {
      drawHeatmap(ctx, imgA, imgB, cw, ch);
    }
  }, [imgA, imgB, mode, zoom, pan]);

  const drawHeatmap = (ctx, a, b, w, h) => {
    const ca = document.createElement("canvas");
    ca.width = 128; ca.height = 128;
    const ctxa = ca.getContext("2d");
    ctxa.drawImage(a, 0, 0, 128, 128);
    const da = ctxa.getImageData(0, 0, 128, 128);

    const cb = document.createElement("canvas");
    cb.width = 128; cb.height = 128;
    const ctxb = cb.getContext("2d");
    ctxb.drawImage(b, 0, 0, 128, 128);
    const db = ctxb.getImageData(0, 0, 128, 128);

    const result = ctx.createImageData(w, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const sx = Math.floor((x / w) * 128);
        const sy = Math.floor((y / h) * 128);
        const si = (sy * 128 + sx) * 4;
        const ri = (y * w + x) * 4;
        const diff =
          Math.abs(da.data[si] - db.data[si]) +
          Math.abs(da.data[si + 1] - db.data[si + 1]) +
          Math.abs(da.data[si + 2] - db.data[si + 2]);
        const intensity = Math.min(1, diff / (255 * 3));
        result.data[ri] = Math.round(intensity * 255);
        result.data[ri + 1] = 0;
        result.data[ri + 2] = 0;
        result.data[ri + 3] = 255;
      }
    }
    ctx.putImageData(result, 0, 0);
  };

  const handleMouseDown = (e) => {
    if (mode !== "pixel") return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e) => {
    if (!dragging || mode !== "pixel") return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handleMouseUp = () => setDragging(false);
  const handleWheel = useCallback((e) => {
    if (mode !== "pixel") return;
    e.preventDefault();
    setZoom((z) => Math.max(1, Math.min(20, z - e.deltaY * 0.01)));
  }, [mode]);

  if (!imgA || !imgB) return null;

  return (
    <div className="ircp-card">
      <h3 className="ircp-card-title">Visual Comparison</h3>
      <div className="ircp-vis-controls">
        {modes.map((m) => (
          <button key={m.id} className={`ircp-btn-tab ${mode === m.id ? "ircp-btn-tab-active" : ""}`} onClick={() => setMode(m.id)}>
            {m.label}
          </button>
        ))}
        {mode === "pixel" && (
          <div className="ircp-zoom-controls">
            <button className="ircp-btn-sm" onClick={() => setZoom((z) => Math.max(1, z - 1))}>−</button>
            <span>{zoom}×</span>
            <button className="ircp-btn-sm" onClick={() => setZoom((z) => Math.min(20, z + 1))}>+</button>
          </div>
        )}
      </div>
      <div className="ircp-vis-canvas" ref={containerRef}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ cursor: mode === "pixel" ? "grab" : "default", width: "100%", height: "450px" }}
        />
      </div>
    </div>
  );
}
