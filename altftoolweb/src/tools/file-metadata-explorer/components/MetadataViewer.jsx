import { motion } from "framer-motion";
import {
  FileText, Image, Music, Video, FileArchive, FileSpreadsheet,
  Hash, Clock, Ruler, Type, Layers, Globe, Lock, Eye, Monitor,
} from "lucide-react";

const typeIcons = {
  Image: { icon: Image, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
  Audio: { icon: Music, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
  Video: { icon: Video, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  Text: { icon: FileText, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  PDF: { icon: FileText, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
  Document: { icon: FileSpreadsheet, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
};

export default function MetadataViewer({ fileData }) {
  if (!fileData) return null;
  const { file, meta } = fileData;
  const typeInfo = typeIcons[meta.type] || { icon: FileText, color: "text-(--muted-foreground)", bg: "bg-(--muted)" };
  const TypeIcon = typeInfo.icon;

  const categories = [
    {
      title: "File Info",
      icon: FileText,
      items: [
        { label: "Name", value: meta.fileName, icon: Type },
        { label: "Extension", value: meta.extension || "—", icon: FileText },
        { label: "Size", value: meta.sizeFormatted || "—", icon: Hash },
        { label: "MIME Type", value: meta.mimeType || "—", icon: Globe },
        { label: "Modified", value: meta.lastModified ? new Date(meta.lastModified).toLocaleString() : "—", icon: Clock },
        { label: "File Hash", value: meta.hash || "—", icon: Lock },
      ],
    },
    ...(meta.width || meta.height ? [{
      title: "Dimensions",
      icon: Ruler,
      items: [
        { label: "Width", value: `${meta.width}px`, icon: Ruler },
        { label: "Height", value: `${meta.height}px`, icon: Ruler },
        { label: "Aspect Ratio", value: meta.aspectRatio || "—", icon: Monitor },
        { label: "Orientation", value: meta.orientation || "—", icon: Eye },
        { label: "Megapixels", value: meta.megapixels || "—", icon: Image },
      ],
    }] : []),
    ...(meta.duration ? [{
      title: "Media",
      icon: Video,
      items: [
        { label: "Duration", value: meta.duration, icon: Clock },
        { label: "Bitrate", value: meta.bitrate || "—", icon: Hash },
        { label: "Frame Rate", value: meta.frameRate || "—", icon: Layers },
        { label: "Sample Rate", value: meta.sampleRate || "—", icon: Music },
        { label: "Channels", value: meta.channels || "—", icon: Music },
      ],
    }] : []),
    ...(meta.charCount != null ? [{
      title: "Text Analysis",
      icon: Type,
      items: [
        { label: "Characters", value: meta.charCount?.toLocaleString(), icon: Type },
        { label: "Words", value: meta.wordCount?.toLocaleString(), icon: Hash },
        { label: "Lines", value: meta.lineCount?.toLocaleString(), icon: Layers },
        { label: "Reading Time", value: meta.estimatedReadingTime || "—", icon: Clock },
        { label: "Language", value: meta.language || "—", icon: Globe },
        { label: "Encoding", value: meta.encoding || "—", icon: Lock },
      ],
    }] : []),
    ...(meta.pageCount || meta.author ? [{
      title: "Document",
      icon: FileSpreadsheet,
      items: [
        { label: "Pages", value: meta.pageCount || "—", icon: Layers },
        { label: "Author", value: meta.author || "—", icon: FileText },
        { label: "Format", value: meta.format || "—", icon: FileArchive },
        { label: "PDF Version", value: meta.pdfVersion || "—", icon: FileText },
      ],
    }] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 p-4 rounded-xl bg-(--muted) border border-(--border)">
        <div className={`w-10 h-10 rounded-xl ${typeInfo.bg} flex items-center justify-center`}>
          <TypeIcon size="20" className={typeInfo.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-(--foreground) truncate">{meta.fileName}</p>
          <p className="text-xs text-(--muted-foreground">{meta.type} • {meta.sizeFormatted}</p>
        </div>
      </div>

      {categories.map((cat) => (
        <div key={cat.title} className="rounded-xl border border-(--border) overflow-hidden">
          <div className="px-3 py-2 bg-(--muted) border-b border-(--border) flex items-center gap-1.5">
            <cat.icon size="14" className="text-(--muted-foreground)" />
            <span className="text-xs font-semibold text-(--foreground)">{cat.title}</span>
          </div>
          <div className="divide-y divide-(--border)">
            {cat.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between px-3 py-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <item.icon size="12" className="text-(--muted-foreground)" />
                  <span className="text-(--muted-foreground)">{item.label}</span>
                </div>
                <span className="font-medium text-(--foreground) text-right max-w-[60%] truncate">
                  {String(item.value ?? "—")}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
