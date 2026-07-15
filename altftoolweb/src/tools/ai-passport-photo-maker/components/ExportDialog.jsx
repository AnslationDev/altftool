"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal, Button } from "@altftool/ui";
import { FileImage, FileText, Archive, Download, Check, Loader2, File } from "lucide-react";
import { EXPORT_QUALITIES } from "../constants/defaults";

const formatOptions = [
  { id: "png", label: "PNG", icon: FileImage, desc: "Lossless, best quality" },
  { id: "jpeg", label: "JPG", icon: FileImage, desc: "Smaller file size" },
  { id: "pdf", label: "PDF", icon: FileText, desc: "Print-ready format" },
];

function OptionCard({ selected, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-150 text-left cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-(--primary)/40
        ${selected
          ? "border-(--primary) bg-(--primary-soft)/10"
          : "border-(--border) bg-(--card) hover:border-(--border-strong)"}`}
    >
      {children}
    </button>
  );
}

export default function ExportDialog({
  open = false,
  onClose = () => {},
  template,
  resultImage,
  exportFormat = "png",
  onFormatChange = () => {},
  exportQuality = "high",
  onQualityChange = () => {},
  onExport = () => {},
  exporting = false,
}) {
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    setExported(false);
    await onExport();
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const selectedQuality = EXPORT_QUALITIES.find((q) => q.id === exportQuality) || EXPORT_QUALITIES[1];

  const estimatedSize = useMemo(() => {
    if (!template) return "—";
    const pixels = template.width * template.height;
    const bytesPerPixel = exportFormat === "jpeg" ? 0.5 : exportFormat === "png" ? 1.2 : 1.5;
    const sizeBytes = pixels * bytesPerPixel * (selectedQuality.dpi / 72);
    if (sizeBytes > 1048576) return `${(sizeBytes / 1048576).toFixed(1)} MB`;
    if (sizeBytes > 1024) return `${(sizeBytes / 1024).toFixed(0)} KB`;
    return `${Math.round(sizeBytes)} B`;
  }, [template, exportFormat, selectedQuality]);

  return (
    <Modal open={open} onClose={onClose} aria-label="Export photo">
      <div className="p-6 max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-(--primary-soft)/20">
            <Download size={20} className="text-(--primary)" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-(--foreground)">Export Photo</h2>
            <p className="text-xs text-(--muted-foreground)">Choose format and quality settings</p>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {formatOptions.map((fmt) => (
                <OptionCard key={fmt.id} selected={exportFormat === fmt.id} onClick={() => onFormatChange(fmt.id)}>
                  <fmt.icon size={18} className={exportFormat === fmt.id ? "text-(--primary)" : "text-(--muted-foreground)"} />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-(--foreground)">{fmt.label}</span>
                    <span className="text-[10px] text-(--muted-foreground)">{fmt.desc}</span>
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">Quality</label>
            <div className="flex flex-col gap-2">
              {EXPORT_QUALITIES.map((qual) => (
                <OptionCard key={qual.id} selected={exportQuality === qual.id} onClick={() => onQualityChange(qual.id)}>
                  <div className={`w-2 h-2 rounded-full ${exportQuality === qual.id ? "bg-(--primary)" : "bg-(--border)"}`} />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-(--foreground)">{qual.label}</span>
                    <span className="text-[10px] text-(--muted-foreground)">{qual.dpi} DPI</span>
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>

          {template && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-(--muted)/30 border border-(--border)">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-(--foreground)">{template.name}</span>
                <span className="text-[10px] text-(--muted-foreground)">
                  {template.width}×{template.height}px · {selectedQuality.dpi} DPI
                </span>
              </div>
              <span className="text-xs font-semibold tabular-nums text-(--foreground)">{estimatedSize}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {exported ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Button className="w-full" variant="success" disabled>
                  <Check size={16} />
                  Exported Successfully
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="export"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Button
                  onClick={handleExport}
                  className="w-full"
                  disabled={!resultImage || !template || exporting}
                >
                  {exporting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Download
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
