"use client";

import { useAuth } from "../providers/AuthProvider";
import ToolLogo from "./ToolLogo";

const BADGE_STYLES = {
  FREE: "bg-emerald-100 text-emerald-700",
  "FREE + PAID": "bg-amber-100 text-amber-800",
};

/**
 * Directory card matching the toools.design layout: a big soft logo tile on
 * top, bold name, short description, and a pricing pill anchored bottom-right.
 * The whole card is the link — gated behind sign-in/sign-up via requireAuth.
 */
export default function ToolCard({ tool }) {
  const { requireAuth } = useAuth();
  const hue = tool.hue || ["#8b5cf6", "#22d3ee"];

  const handleClick = (event) => {
    event.preventDefault();
    requireAuth(() => window.open(tool.url, "_blank", "noopener,noreferrer"));
  };

  return (
    <a
      href={tool.url}
      onClick={handleClick}
      aria-label={`Open ${tool.name} — ${tool.tagline}`}
      className="fat-card group flex h-full flex-col rounded-3xl p-3 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
    >
      <div
        className="fat-tile relative flex h-40 items-center justify-center overflow-hidden rounded-2xl sm:h-44"
        style={{ "--fat-tile-a": `${hue[0]}1a`, "--fat-tile-b": `${hue[1]}0f` }}
      >
        <span className="flex items-center justify-center rounded-2xl bg-white p-3 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5 transition-transform duration-500 group-hover:scale-110">
          <ToolLogo name={tool.name} domain={tool.domain} hue={hue} size={56} />
        </span>
      </div>

      <div className="flex flex-1 flex-col px-2.5 pb-2 pt-4">
        <h3 className="text-lg font-extrabold tracking-tight text-slate-900">{tool.name}</h3>
        <p className="mt-1.5 line-clamp-3 flex-1 text-[15px] leading-relaxed text-slate-500">
          {tool.tagline}
        </p>
        <div className="mt-5 flex justify-end">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
              BADGE_STYLES[tool.pricing] || BADGE_STYLES.FREE
            }`}
          >
            {tool.pricing}
          </span>
        </div>
      </div>
    </a>
  );
}
