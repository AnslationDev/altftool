"use client";

import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Sticker, Check, X } from "lucide-react";

const EditableCanvas = forwardRef(({ resultImage, brushSize = 20 }, ref) => {
  const canvasRef = useRef(null);

  const [tool, setTool] = useState("remove");
  const [isDrawing, setIsDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // ✅ Sticker states
  const [showStickerModal, setShowStickerModal] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState(null);

  // ✅ QUEUE + brush
  const [stickerQueue, setStickerQueue] = useState([]);
  const queueIndexRef = useRef(0);

  // ✅ spacing control
  const lastStampPos = useRef(null);

  // ✅ NEW: Disable background scroll when modal is open
  useEffect(() => {
    if (showStickerModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showStickerModal]);

  useImperativeHandle(ref, () => ({
    getCanvasImage: () => {
      return new Promise((resolve) => {
        if (!canvasRef.current) return resolve(null);
        canvasRef.current.toBlob((blob) => {
          resolve(URL.createObjectURL(blob));
        });
      });
    },
  }));

  useEffect(() => {
    if (!canvasRef.current || !resultImage) return;
    const ctx = canvasRef.current.getContext("2d");
    const img = new Image();
    img.src = resultImage;
    img.onload = () => {
      canvasRef.current.width = img.width;
      canvasRef.current.height = img.height;
      ctx.clearRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      setHistory([imgData]);
      setHistoryStep(0);
    };
  }, [resultImage]);

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom,
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    setLastPos(getCanvasPos(e));
    lastStampPos.current = null;
  };

  const stopDrawing = () => {
    if (
      isDrawing &&
      (tool === "remove" || tool === "smooth" || tool === "sticker")
    ) {
      saveHistory();
    }
    setIsDrawing(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getCanvasPos(e);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = brushSize;

    if (tool === "remove") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setLastPos(pos);
    }

    if (tool === "smooth") {
      const size = brushSize;
      const half = size / 2;

      const imageData = ctx.getImageData(
        pos.x - half,
        pos.y - half,
        size,
        size
      );

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = size;
      tempCanvas.height = size;
      const tctx = tempCanvas.getContext("2d");

      tctx.putImageData(imageData, 0, 0);
      tctx.filter = "blur(2px)";
      tctx.drawImage(tempCanvas, 0, 0);

      ctx.putImageData(
        tctx.getImageData(0, 0, size, size),
        pos.x - half,
        pos.y - half
      );

      setLastPos(pos);
    }

    if (tool === "sticker" && stickerQueue.length > 0) {
      const size = brushSize * 1.2;

      if (lastStampPos.current) {
        const dx = pos.x - lastStampPos.current.x;
        const dy = pos.y - lastStampPos.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < size * 0.8) return;
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.font = `${size}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const sticker =
        stickerQueue[queueIndexRef.current % stickerQueue.length];

      ctx.fillText(sticker, pos.x, pos.y);

      queueIndexRef.current += 1;
      lastStampPos.current = pos;
      setLastPos(pos);
    }
  };

  const saveHistory = () => {
    const ctx = canvasRef.current.getContext("2d");
    const imgData = ctx.getImageData(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(imgData);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep <= 0) return;
    const ctx = canvasRef.current.getContext("2d");
    const prevStep = historyStep - 1;
    ctx.putImageData(history[prevStep], 0, 0);
    setHistoryStep(prevStep);
  };

  const applySticker = () => {
    if (!selectedSticker) return;

    setStickerQueue([selectedSticker]);
    queueIndexRef.current = 0; // reset index
    
    setTool("sticker");
    setShowStickerModal(false);
    setSelectedSticker(null);
  };

  const canvasStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: "top left",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
  };

  const stickers = ["🔥", "⭐", "❤️", "🎉", "😎", "💼", "🚀", "🎨"];

  return (
    <div className="relative inline-block rounded-2xl bg-(--card) border border-(--border) p-6 text-center shadow-md">
      <div className="flex gap-2 mb-2 rounded-lg justify-center p-2 ">
        <button
          className={`px-3 py-1 border border-(--border) shadow-md bg-red-500 text-white rounded-lg text-sm ${
            tool === "remove" ? "bg-red-500 text-white" : ""
          }`}
          onClick={() => setTool("remove")}
        >
          🖌 Remove
        </button>

        <button
          className={`px-3 py-1 border-(--border) shadow-md rounded-lg text-sm ${
            tool === "smooth" ? "bg-purple-500 text-white" : ""
          }`}
          onClick={() => setTool("smooth")}
        >
          ✨ Smooth
        </button>

        <button className="px-3 py-1 border-(--border) shadow-md rounded-lg text-sm" onClick={handleUndo}>
          🔁 Undo
        </button>

        <button
          className={`px-3 py-1 border-(--border) shadow-md rounded-lg text-sm${
            tool === "zoom" ? "bg-(--primary) text-white" : ""
          }`}
          onClick={() => setTool("zoom")}
        >
          🔍 Zoom
        </button>

        <button
          onClick={() => setShowStickerModal(true)}
          className={`px-3 py-1 border-(--border) shadow-md rounded-lg flex items-center gap-1 text-sm ${
            tool === "sticker" ? "bg-yellow-400 text-black" : ""
          }`}
        >
          <Sticker size={16} /> Stickers
        </button>

        {tool === "zoom" && (
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
        )}
      </div>

      <div
        style={{
          overflow: "hidden",
          width: "100%",
          maxHeight: "500px",
          border: "1px solid #ccc",
          position: "relative",
        }}
      >
        <canvas
          ref={canvasRef}
          className="border-(--border) shadow-md "
          onMouseDown={
            tool === "remove" || tool === "smooth" || tool === "sticker"
              ? startDrawing
              : null
          }
          onMouseUp={
            tool === "remove" || tool === "smooth" || tool === "sticker"
              ? stopDrawing
              : null
          }
          onMouseLeave={
            tool === "remove" || tool === "smooth" || tool === "sticker"
              ? stopDrawing
              : null
          }
          onMouseMove={
            tool === "remove" || tool === "smooth" || tool === "sticker"
              ? draw
              : null
          }
          style={canvasStyle}
        />
      </div>

      {showStickerModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-(--background) rounded-xl p-6 shadow-lg w-[320px] text-center">
            <h3 className="font-semibold mb-4">Choose Sticker</h3>

            <div className="flex flex-wrap gap-3 justify-center mb-5">
              {stickers.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSticker(s)}
                  className={`text-2xl p-2 rounded-lg border-(--border) shadow-md ${
                    selectedSticker === s ? "bg-gray-200" : ""
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowStickerModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-md flex items-center gap-1"
              >
                <X size={16} /> Cancel
              </button>

              <button
                onClick={applySticker}
                className="px-4 py-2 bg-(--primary) text-white rounded-md flex items-center gap-2"
              >
                <Check size={16} /> Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

EditableCanvas.displayName = "EditableCanvas";

export default EditableCanvas;
