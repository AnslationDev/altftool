"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, FileImage, Ruler, Printer } from "lucide-react";
import { Button, Select } from "@altftool/ui";
import { PRINT_SHEET_OPTIONS, PAPER_SIZES } from "../constants/defaults";

export default function PrintSheetGenerator({
  template,
  resultImage,
  sheetOption = "4",
  onSheetChange = () => {},
  paperSize = { id: "a4", label: "A4" },
  onPaperSizeChange = () => {},
  onGenerate = () => {},
}) {
  const handleSheetSelect = (id) => {
    onSheetChange(id);
  };

  const handlePaperSelect = (id) => {
    const size = PAPER_SIZES.find((p) => p.id === id);
    if (size) onPaperSizeChange(size);
  };

  const selectedOpt = PRINT_SHEET_OPTIONS.find((o) => o.id === sheetOption) || PRINT_SHEET_OPTIONS[0];
  const selectedPaper = paperSize || PAPER_SIZES[0];

  const positions = useMemo(() => {
    if (!template) return [];
    const spacing = 5;
    const cols = Math.min(selectedOpt.cols, Math.floor((selectedPaper.width + spacing) / (template.width + spacing)));
    const rows = Math.ceil(selectedOpt.rows > 0 ? selectedOpt.rows : selectedOpt.cols);
    const actualCount = cols * rows;
    const totalW = cols * template.width + (cols - 1) * spacing;
    const totalH = rows * template.height + (rows - 1) * spacing;
    const startX = Math.max(0, (selectedPaper.width - totalW) / 2);
    const startY = Math.max(0, (selectedPaper.height - totalH) / 2);
    const pos = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        pos.push({
          x: startX + c * (template.width + spacing),
          y: startY + r * (template.height + spacing),
          w: template.width,
          h: template.height,
        });
      }
    }
    return pos;
  }, [template, selectedOpt, selectedPaper]);

  const previewScale = useMemo(() => {
    const maxW = 280;
    const maxH = 380;
    const scaleW = maxW / selectedPaper.width;
    const scaleH = maxH / selectedPaper.height;
    return Math.min(scaleW, scaleH, 1);
  }, [selectedPaper]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex flex-col gap-2">
          <label className="text-xs font-semibold text-(--muted-foreground)">Photos Per Sheet</label>
          <div className="grid grid-cols-5 gap-2">
            {PRINT_SHEET_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSheetSelect(opt.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 text-xs font-semibold transition-all duration-150
                  ${sheetOption === opt.id
                    ? "border-(--primary) bg-(--primary-soft)/10 text-(--primary)"
                    : "border-(--border) bg-(--card) text-(--muted-foreground) hover:border-(--border-strong)"}`}
                aria-pressed={sheetOption === opt.id}
              >
                <Grid3X3 size={14} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <label className="text-xs font-semibold text-(--muted-foreground)">Paper Size</label>
          <div className="grid grid-cols-3 gap-2">
            {PAPER_SIZES.map((size) => (
              <button
                key={size.id}
                onClick={() => handlePaperSelect(size.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 text-xs font-semibold transition-all duration-150
                  ${selectedPaper.id === size.id
                    ? "border-(--primary) bg-(--primary-soft)/10 text-(--primary)"
                    : "border-(--border) bg-(--card) text-(--muted-foreground) hover:border-(--border-strong)"}`}
                aria-pressed={selectedPaper.id === size.id}
              >
                <Ruler size={14} />
                {size.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-(--border) bg-(--card) p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-(--foreground)">Layout Preview</span>
          <span className="text-[10px] text-(--muted-foreground)">
            {selectedPaper.label} · {selectedOpt.label}
          </span>
        </div>

        <div
          className="relative mx-auto bg-white rounded-lg border border-(--border)"
          style={{
            width: selectedPaper.width * previewScale,
            height: selectedPaper.height * previewScale,
          }}
        >
          <AnimatePresence>
            {positions.map((pos, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.15 }}
                className="absolute border border-dashed border-(--primary)/40 rounded-sm overflow-hidden bg-(--muted)/30"
                style={{
                  left: pos.x * previewScale,
                  top: pos.y * previewScale,
                  width: pos.w * previewScale,
                  height: pos.h * previewScale,
                }}
              >
                {resultImage && (
                  <img
                    src={resultImage}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ opacity: 0.7 }}
                  />
                )}
                {!resultImage && (
                  <div className="flex items-center justify-center w-full h-full">
                    <FileImage size={12} className="text-(--muted-foreground)" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="absolute bottom-1 right-1 bg-(--foreground)/80 text-(--page) text-[8px] px-1 py-0.5 rounded font-mono">
            {selectedPaper.width}×{selectedPaper.height}
          </div>
        </div>
      </div>

      <Button onClick={onGenerate} className="w-full" disabled={!resultImage || !template}>
        <Printer size={16} />
        Generate Print Sheet
      </Button>
    </div>
  );
}
