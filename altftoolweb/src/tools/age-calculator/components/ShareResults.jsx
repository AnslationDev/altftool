"use client";

import { useState } from "react";
import {
  Share2,
  FileDown,
  Link2,
  Copy,
  Check,
  Printer,
  MessageCircle,
  Facebook,
  Linkedin,
  Twitter,
} from "lucide-react";
import { SectionCard } from "./ui";

const btn =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-(--border) bg-(--card) px-2 py-2.5 text-xs font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)";

export default function ShareResults({ summary = "" }) {
  const [copied, setCopied] = useState("");

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const text = summary || "Check out my exact age on ALTFTool!";

  const copy = async (what, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(what);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const socials = [
    { label: "WhatsApp", icon: MessageCircle, tone: "#25D366", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}` },
    { label: "Facebook", icon: Facebook, tone: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { label: "LinkedIn", icon: Linkedin, tone: "#0A66C2", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
    { label: "X (Twitter)", icon: Twitter, tone: "var(--foreground)", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}` },
  ];

  return (
    <SectionCard title="Share Your Results" icon={Share2}>
      <div className="grid grid-cols-2 gap-2.5 @2xl:grid-cols-4">
        <button type="button" className={btn} onClick={() => window.print()}>
          <FileDown className="h-4 w-4 shrink-0" /> Download PDF
        </button>
        <button type="button" className={btn} onClick={() => window.print()}>
          <Printer className="h-4 w-4 shrink-0" /> Print
        </button>
        <button type="button" className={btn} onClick={() => copy("link", shareUrl)}>
          {copied === "link" ? <Check className="h-4 w-4 shrink-0 text-(--primary)" /> : <Link2 className="h-4 w-4 shrink-0" />} Copy Link
        </button>
        <button type="button" className={btn} onClick={() => copy("result", text)}>
          {copied === "result" ? <Check className="h-4 w-4 shrink-0 text-(--primary)" /> : <Copy className="h-4 w-4 shrink-0" />} Copy Result
        </button>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5 @2xl:grid-cols-4">
        {socials.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={btn}>
            <s.icon className="h-4 w-4 shrink-0" style={{ color: s.tone }} /> {s.label}
          </a>
        ))}
      </div>
    </SectionCard>
  );
}
