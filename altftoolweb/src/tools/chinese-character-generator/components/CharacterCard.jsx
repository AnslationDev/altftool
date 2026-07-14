"use client";

import { forwardRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Copy,
  Download,
  Heart,
  Share2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { downloadCardPng, downloadCharacterSvg } from "../utils/download";

const GLYPH_FONT = '"Noto Serif SC","Songti SC","STSong",serif';

const CharacterCard = forwardRef(function CharacterCard(
  { item, favorite, onToggleFavorite, onSelect },
  ref
) {
  const [busy, setBusy] = useState(null); // "png" | "svg" | null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.char);
      toast.success(`Copied “${item.char}”`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const handlePng = async () => {
    if (!ref || !ref.current) return;
    setBusy("png");
    try {
      await downloadCardPng(ref.current, `character-${item.char}-${item.unicode}.png`);
      toast.success("PNG downloaded");
    } catch {
      toast.error("PNG export failed");
    } finally {
      setBusy(null);
    }
  };

  const handleSvg = () => {
    try {
      downloadCharacterSvg(item);
      toast.success("SVG downloaded");
    } catch {
      toast.error("SVG export failed");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "Chinese Character",
      text: `${item.char} (${item.pinyin}) — ${item.meaning} [${item.unicode}]`,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or failed; fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(shareData.text);
      toast.success("Character details copied");
    } catch {
      toast.error("Share not supported");
    }
  };

  const iconBtn =
    "inline-flex items-center justify-center rounded-lg border border-(--border) bg-(--background) text-(--muted-foreground) hover:text-(--foreground) hover:bg-(--muted) transition active:scale-95 h-9 w-9";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-(--border) bg-(--card) shadow-sm"
    >
      <button
        type="button"
        onClick={() => onSelect && onSelect(item)}
        className="flex flex-col items-center px-5 pb-4 pt-6 text-center"
        aria-label={`Show details for ${item.char}`}
      >
        <div
          ref={ref}
          className="flex h-40 w-full items-center justify-center rounded-xl bg-gradient-to-br from-(--primary)/10 to-(--muted) text-(--primary)"
        >
          <span
            style={{ fontFamily: GLYPH_FONT }}
            className="text-7xl leading-none"
          >
            {item.char}
          </span>
        </div>
        <div className="mt-4 text-2xl font-semibold text-(--foreground)">
          {item.pinyin}
        </div>
        <div className="text-sm text-(--muted-foreground)">{item.meaning}</div>
        <div className="mt-3 grid w-full grid-cols-2 gap-2 text-xs text-(--muted-foreground)">
          <div className="rounded-lg bg-(--muted) px-2 py-1.5">
            <span className="block font-medium text-(--foreground)">Strokes</span>
            {item.strokes}
          </div>
          <div className="rounded-lg bg-(--muted) px-2 py-1.5">
            <span className="block font-medium text-(--foreground)">Unicode</span>
            {item.unicode}
          </div>
        </div>
        <div className="mt-2 w-full rounded-lg bg-(--muted) px-2 py-1.5 text-xs text-(--muted-foreground)">
          <span className="font-medium text-(--foreground)">Category</span> ·{" "}
          {item.category}
        </div>
        {item.similar && item.similar.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {item.similar.map((s) => (
              <span
                key={s}
                style={{ fontFamily: GLYPH_FONT }}
                className="rounded-md bg-(--primary)/10 px-2 py-0.5 text-base text-(--primary)"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        {item.variant && (
          <div className="mt-2 text-xs text-(--muted-foreground)">
            {item.variant.script}:{" "}
            <span style={{ fontFamily: GLYPH_FONT }} className="text-base text-(--foreground)">
              {item.variant.char}
            </span>{" "}
            {item.variant.unicode}
          </div>
        )}
      </button>

      <div className="flex items-center justify-between gap-2 border-t border-(--border) px-3 py-3">
        <button
          type="button"
          onClick={() => onToggleFavorite && onToggleFavorite(item)}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition active:scale-95 ${
            favorite
              ? "bg-(--primary)/10 text-(--primary)"
              : "border border-(--border) bg-(--background) text-(--muted-foreground) hover:text-(--foreground)"
          }`}
          aria-pressed={favorite}
          aria-label="Toggle favorite"
        >
          <Heart size={16} className={favorite ? "fill-current" : ""} />
          {favorite ? "Saved" : "Save"}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className={iconBtn}
            aria-label="Copy character"
            title="Copy character"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            onClick={handlePng}
            disabled={busy !== null}
            className={iconBtn}
            aria-label="Download PNG"
            title="Download PNG"
          >
            {busy === "png" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          </button>
          <button
            type="button"
            onClick={handleSvg}
            disabled={busy !== null}
            className={iconBtn}
            aria-label="Download SVG"
            title="Download SVG"
          >
            {busy === "svg" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} className="opacity-60" />}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className={iconBtn}
            aria-label="Share"
            title="Share"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
});

export default CharacterCard;
