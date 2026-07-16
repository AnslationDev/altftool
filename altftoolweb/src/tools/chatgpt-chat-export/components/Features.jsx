"use client";

import {
  Upload,
  FileJson,
  Eye,
  Search,
  Download,
  Palette,
  BarChart3,
  Shield,
  MessageSquare,
  Code,
  FileText,
  Table2,
  Image,
  Link2,
  Clock,
  Bookmark,
  Trash2,
  Merge,
  Split,
  PenLine,
  Star,
  Settings2,
  Printer,
  Share2,
  Clipboard,
  History,
  Zap,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Multi-Format Upload",
    description: "Upload JSON, Markdown, TXT, HTML, CSV or paste chat content directly.",
  },
  {
    icon: FileJson,
    title: "Smart Parsing",
    description: "Automatically extracts title, messages, code blocks, tables, and more.",
  },
  {
    icon: Eye,
    title: "Chat Viewer",
    description: "Display conversations in a beautiful ChatGPT-like interface with avatars.",
  },
  {
    icon: Search,
    title: "Instant Search",
    description: "Search messages, filter by role, code, questions, or answers.",
  },
  {
    icon: Download,
    title: "Multiple Export Formats",
    description: "Export as PDF, DOCX, Markdown, HTML, TXT, JSON, CSV.",
  },
  {
    icon: Palette,
    title: "Custom Themes",
    description: "Classic ChatGPT, Minimal, Dark, Light, Notion, GitHub, Terminal, Modern.",
  },
  {
    icon: Code,
    title: "Syntax Highlighting",
    description: "Beautiful code blocks with syntax highlighting for 25+ languages.",
  },
  {
    icon: BarChart3,
    title: "Detailed Statistics",
    description: "View message counts, word counts, reading time, and more.",
  },
  {
    icon: Settings2,
    title: "Full Customization",
    description: "Font size, font family, line height, avatar visibility, and page breaks.",
  },
  {
    icon: Printer,
    title: "Print & Share",
    description: "Print conversations or share them directly from the browser.",
  },
  {
    icon: Clipboard,
    title: "Copy to Clipboard",
    description: "Quickly copy entire conversations with a single click.",
  },
  {
    icon: History,
    title: "Local Storage",
    description: "Recent files, history, favorites, and settings are saved locally.",
  },
  {
    icon: Table2,
    title: "Table Support",
    description: "Preserve and render tables from your ChatGPT conversations.",
  },
  {
    icon: Image,
    title: "Image Support",
    description: "Display images embedded in conversations.",
  },
  {
    icon: Link2,
    title: "Link Preservation",
    description: "Keep all links intact in your exported documents.",
  },
  {
    icon: Zap,
    title: "Fast & Lightweight",
    description: "Everything runs in your browser — no server uploads needed.",
  },
  {
    icon: Shield,
    title: "100% Private",
    description: "Your conversations never leave your device. Zero data collection.",
  },
  {
    icon: Sparkles,
    title: "Premium Quality",
    description: "Production-ready exports with professional formatting.",
  },
];

export default function Features() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-[--foreground]">
            Everything you need to export ChatGPT conversations
          </h2>
          <p className="mt-2 text-[--muted]">
            A complete toolkit for viewing, searching, and exporting your AI conversations
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group rounded-xl border border-[--border] bg-[--surface] p-4 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-[--foreground]">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[--muted]">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
