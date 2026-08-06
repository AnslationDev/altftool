"use client";

import React, { useState, useCallback } from "react";
import { MessageCircle, RefreshCw, Copy, Heart, Check } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const CONTEXTS = [
  { id: "work", label: "Work", icon: "💼" },
  { id: "social", label: "Social", icon: "👥" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧" },
  { id: "tech", label: "Tech", icon: "💻" },
  { id: "general", label: "General", icon: "💬" },
];

const RESPONSES = {
  work: [
    "Oh great, another meeting that could've been an email. Exciting.",
    "Wow, you need THAT done by when? How about never? Is never good for you?",
    "Sure, I love working weekends. It's my favorite hobby.",
    "Oh, you want it perfect AND fast AND cheap? Bold of you to assume.",
    "Let me just drop everything I was doing for your 'quick question'.",
    "Because obviously my time is less valuable than yours. Makes sense.",
    "Another 'urgent' request that was planned three weeks ago. Sure.",
    "Yes, let's add more to the sprint. We definitely have capacity.",
  ],
  social: [
    "Oh wow, you're telling me this story again? I forgot it the first time.",
    "Yes, please, tell me more about your cat. I live for this.",
    "How fascinating. I'll add it to my collection of things I didn't ask about.",
    "Oh, you're posting about your workout? Revolutionary content.",
    "Wow, you went to a restaurant? Nobody does that anymore. Amazing.",
    "Please, continue explaining the thing I already know. It's so helpful.",
    "Oh, you're late again? What a pleasant surprise. Said no one ever.",
    "Yes, let's make plans and then cancel last minute. My favorite.",
  ],
  family: [
    "Oh, you're giving me life advice now? How original.",
    "Sure, I'd love to hear about the good old days for the 500th time.",
    "Yes, because you definitely know what the youth are into. Obviously.",
    "Oh, you're critiquing my life choices again? How refreshing.",
    "Wow, another passive-aggressive comment. My day is complete.",
    "Let me just ignore that completely reasonable suggestion. As usual.",
    "Yes, I'll definitely take relationship advice from someone divorced twice.",
    "Oh, you're comparing me to my cousin again? How lovely.",
  ],
  tech: [
    "Have you tried turning it off and on again? Brilliant, never heard that one.",
    "Yes, let's add another dependency to fix the one we just added. Genius.",
    "Oh, the code 'just works on my machine'? Fascinating concept.",
    "Sure, let's push to production on a Friday. What could go wrong?",
    "Wow, you reinvented the wheel poorly. Impressive dedication.",
    "Yes, documentation is overrated. Who needs to understand code anyway?",
    "Let me just rewrite the whole thing because you don't like the color. Smart.",
    "Oh, you used tabs and I use spaces? This is war now.",
  ],
  general: [
    "Oh, you don't say? I had no idea. Shocking.",
    "Wow, that's exactly what I wanted to hear. Thanks, I guess.",
    "Sure, because that's not the most obvious thing ever. Brilliant.",
    "Yes, let's do the thing that everyone knows won't work. Great plan.",
    "Oh, you're explaining something simple like I'm five? Adorable.",
    "How insightful. I'll treasure this moment forever. Or not.",
    "Wow, you're so helpful. Said the person doing nothing.",
    "Yes, because clearly I have nothing better to do. Obviously.",
  ],
};

export default function ToolHome() {
  const [context, setContext] = useState("general");
  const [response, setResponse] = useState("");
  // Snapshot of which context actually produced `response`, so the badge
  // can't drift out of sync if the user switches tabs without regenerating.
  const [responseContext, setResponseContext] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const { copy, isCopied, announcement } = useCopyToClipboard();

  const generate = useCallback(() => {
    const list = RESPONSES[context] || RESPONSES.general;
    setResponse(list[Math.floor(Math.random() * list.length)]);
    setResponseContext(context);
  }, [context]);

  const copyResponse = () => copy("response", response, { label: "Sarcastic response" });

  const toggleFavorite = () => {
    if (!response) return;
    if (favorites.includes(response)) setFavorites((prev) => prev.filter((f) => f !== response));
    else setFavorites((prev) => [response, ...prev].slice(0, 20));
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <MessageCircle className="h-4 w-4" /> Passive Aggression
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Sarcasm Generator</h1>
          <p className="mt-2 text-(--muted-foreground)">Generate perfectly sarcastic responses for any awkward situation</p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="mb-6 flex flex-wrap gap-2">
            {CONTEXTS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setContext(c.id)}
                aria-pressed={context === c.id}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${context === c.id ? "bg-(--primary) text-white shadow-md" : "border border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"}`}
              >
                <span aria-hidden="true">{c.icon}</span> {c.label}
              </button>
            ))}
          </div>

          <button onClick={generate} className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-(--primary) px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
            <MessageCircle className="h-5 w-5" /> Generate Sarcasm
          </button>
        </div>

        {response && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 border-(--border) bg-(--card) p-6 shadow-lg" style={{ borderColor: "var(--primary)" }}>
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--muted-foreground)">{CONTEXTS.find((c) => c.id === responseContext)?.label}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={toggleFavorite}
                  aria-pressed={favorites.includes(response)}
                  aria-label={favorites.includes(response) ? "Remove from favorites" : "Add to favorites"}
                  className={`rounded-lg p-2 transition-all ${favorites.includes(response) ? "text-(--danger-text)" : "text-(--muted-foreground) hover:bg-(--muted)"}`}
                >
                  <Heart className="h-4 w-4" fill={favorites.includes(response) ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={generate}
                  aria-label="Generate another response"
                  className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={copyResponse}
                  aria-label="Copy response to clipboard"
                  className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"
                >
                  {isCopied("response") ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <p aria-live="polite" role="status" className="text-xl font-semibold leading-relaxed text-(--foreground) italic">
              "{response}"
            </p>
            {isCopied("response") && <p className="mt-2 text-sm text-(--primary)">Copied to clipboard!</p>}
            <span aria-live="polite" role="status" className="sr-only">
              {announcement}
            </span>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-(--muted-foreground)">Favorite Responses ({favorites.length})</h3>
            <div className="space-y-2">
              {favorites.map((f, i) => (
                <div key={i} className="flex items-start justify-between rounded-xl bg-(--muted) p-3">
                  <p className="text-sm text-(--foreground)">{f}</p>
                  <button
                    type="button"
                    onClick={() => setFavorites((prev) => prev.filter((_, j) => j !== i))}
                    aria-label="Remove this favorite"
                    className="ml-2 text-xs text-(--muted-foreground) hover:text-(--danger-text)"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
