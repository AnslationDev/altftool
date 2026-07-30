"use client";

import { Maximize2, Sparkles, SquareArrowOutUpRight, ThumbsUp } from "lucide-react";
import CopyButton from "./CopyButton";

const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
];

function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatLikes(n = 0) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

export default function PromptCard({ prompt, onOpen }) {
  const {
    title,
    description,
    prompt: promptText,
    dateLabel,
    image,
    model,
    tags = [],
    author,
    likes = 0,
  } = prompt;

  const authorName = author?.name || "Anonymous";
  const initial = authorName.trim().charAt(0).toUpperCase() || "?";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-card) transition-all duration-200 hover:-translate-y-0.5 hover:border-(--color-primary)/60 hover:shadow-xl">
      {/* Cover */}
      <button
        type="button"
        onClick={(e) => onOpen(prompt, e.currentTarget)}
        aria-label={`Open prompt: ${title}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-(--color-muted)"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={`${title} — ${description}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {model ? (
          <span className="absolute left-2.5 top-2.5 inline-flex max-w-[70%] items-center gap-1 truncate rounded-lg bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
            <Sparkles size={11} className="shrink-0" />
            <span className="truncate">{model}</span>
          </span>
        ) : null}
      </button>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs text-(--color-muted-foreground)">{dateLabel}</span>

        <h3 className="mt-1 flex items-start gap-1.5">
          <button
            type="button"
            onClick={(e) => onOpen(prompt, e.currentTarget)}
            className="line-clamp-1 text-left text-[15px] font-bold text-(--color-card-foreground) transition-colors group-hover:text-(--color-primary)"
          >
            {title}
          </button>
          <SquareArrowOutUpRight
            size={13}
            className="mt-1 shrink-0 text-(--color-muted-foreground)"
            aria-hidden="true"
          />
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-(--color-muted-foreground)">
          {description}
        </p>

        {/* Prompt preview */}
        <div className="relative mt-3 rounded-xl border border-(--color-border) bg-(--color-muted)/40 p-3 pr-9">
          <p className="line-clamp-3 font-mono text-[12px] leading-relaxed text-(--color-foreground)/80">
            {promptText}
          </p>
          <button
            type="button"
            onClick={(e) => onOpen(prompt, e.currentTarget)}
            aria-label="Expand prompt"
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-md text-(--color-muted-foreground) transition-colors hover:bg-(--color-card) hover:text-(--color-primary)"
          >
            <Maximize2 size={13} />
          </button>
        </div>

        {/* Copy */}
        <div className="mt-3">
          <CopyButton text={promptText} />
        </div>

        {/* Tags */}
        {tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-(--color-muted) px-2 py-1 text-[11px] font-medium text-(--color-muted-foreground)"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-(--color-border) pt-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${avatarColor(
                authorName
              )}`}
            >
              {initial}
            </span>
            <span className="truncate text-xs text-(--color-muted-foreground)">
              {authorName}
            </span>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs text-(--color-muted-foreground)">
            <ThumbsUp size={13} />
            {formatLikes(likes)}
          </span>
        </div>
      </div>
    </article>
  );
}
