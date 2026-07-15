import { motion } from "framer-motion";
import {
  Files, Image, FileText, Music, Video, File as FilePdf,
  HardDrive, FileSpreadsheet,
} from "lucide-react";
import { formatBytes } from "../utils/helpers";

export default function StatisticsCards({ stats }) {
  const items = [
    { label: "Total Files", value: stats.total, icon: Files, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Images", value: stats.images, icon: Image, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { label: "Text", value: stats.text, icon: FileText, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Audio", value: stats.audio, icon: Music, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
    { label: "Video", value: stats.video, icon: Video, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "PDFs", value: stats.pdf, icon: FilePdf, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
    { label: "Docs", value: stats.docs, icon: FileSpreadsheet, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { label: "Total Size", value: formatBytes(stats.totalSize), icon: HardDrive, color: "text-cyan-500", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="p-3 rounded-xl bg-(--muted) border border-(--border)"
        >
          <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
            <item.icon size="16" className={item.color} />
          </div>
          <p className="text-lg font-bold text-(--foreground)">{item.value}</p>
          <p className="text-xs text-(--muted-foreground)">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
