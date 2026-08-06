import Link from "next/link";
import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import { Stamp } from "./Shell";

/*
 * Where a character sheet goes next.
 *
 * Persona deliberately stops at the specification, which leaves an obvious
 * question — "so where do I paste this?" — that the rest of AltFTool already
 * answers. The prompt studio and the Seedream library are the two places on
 * this site where a locked line is immediately useful, so they are linked from
 * every surface that hands you one rather than left to be discovered.
 */

const DESTINATIONS = [
  {
    href: "/imgprompt",
    icon: Wand2,
    title: "AI Prompt Studio",
    blurb:
      "Build the rest of the prompt around your locked line — styles, lighting, camera language — without losing the descriptor block.",
  },
  {
    href: "/prompts/seedream-5-pro",
    icon: Sparkles,
    title: "Seedream prompt library",
    blurb:
      "Worked Seedream prompts to borrow structure from. Keep the locked line intact and swap everything after it.",
  },
];

export default function PromptBridge({ className = "" }) {
  return (
    <div className={className}>
      <Stamp className="mb-3">Where to paste it</Stamp>
      <div className="grid gap-4 sm:grid-cols-2">
        {DESTINATIONS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className="psn-sheet group flex flex-col gap-2 rounded-xl p-5 transition hover:border-[var(--psn-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex items-center gap-2">
              <item.icon
                className="h-4 w-4"
                style={{ color: "var(--psn-accent)" }}
                aria-hidden="true"
              />
              <span className="font-semibold text-foreground">{item.title}</span>
              <ArrowRight
                className="ml-auto h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {item.blurb}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
