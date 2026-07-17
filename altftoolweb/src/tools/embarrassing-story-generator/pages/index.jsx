"use client";

import React, { useState, useCallback } from "react";
import { Unplug, RefreshCw, Copy, Heart, Laugh, Skull } from "lucide-react";

const THEMES = [
  { id: "school", label: "School", icon: "🎓" },
  { id: "work", label: "Work", icon: "💼" },
  { id: "dating", label: "Dating", icon: "💕" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧" },
  { id: "social", label: "Social", icon: "👥" },
  { id: "random", label: "Random", icon: "🎲" },
];

const STORIES = {
  school: [
    "I once raised my hand to answer a question, stood up, and completely blanked — then accidentally called the teacher 'Mom' in front of the whole class.",
    "During a presentation, I tripped over the power cord and unplugged the projector, then fell into the front row of desks.",
    "I got caught passing a note that said 'this class is so boring' — and it was to the teacher's daughter.",
    "I wore my shirt inside out all day and only noticed when someone asked about the tag.",
    "I confidently answered a question wrong and the teacher played my wrong answer on repeat for the rest of the year.",
  ],
  work: [
    "I sent a 'reply all' email meant for my friend complaining about the meeting — to the entire company.",
    "I waved at someone who was waving at the person behind me, then tried to play it off by checking my watch.",
    "During a video call, I forgot my camera was on and picked my nose — then saw 12 people staring at me in the thumbnail.",
    "I introduced myself to the CEO using the wrong company name at the annual retreat.",
    "I accidentally printed 500 copies of my 'confidential' resignation draft to the shared printer.",
  ],
  dating: [
    "On a first date, I got food stuck in my teeth and didn't notice until they took a photo of us together.",
    "I told a joke, no one laughed, so I laughed alone — then laughed harder at my own loneliness.",
    "I confused their name with my ex's name mid-conversation and tried to recover by saying 'you remind me of someone'.",
    "I spilled my drink on their lap and offered them my napkin — which also had ketchup on it.",
    "I farted loudly during an awkward silence, then said 'that was the building' and pointed at the ceiling.",
  ],
  family: [
    "At Thanksgiving, I sat at the 'kids table' as a joke and no one let me move for three hours.",
    "I called my grandma by the dog's name and she almost didn't notice.",
    "I walked in on my parents dancing to '90s music and now I can't unsee it.",
    "I told my niece a 'scary' story that made her laugh so hard she snorted milk out her nose.",
    "I tried to be helpful and washed the 'dry clean only' sofa cushion — it shrank to half size.",
  ],
  social: [
    "I waved at a stranger through a window thinking it was my friend, then they waved back politely.",
    "I told a story about my 'crazy ex' only to realize they were standing right behind me.",
    "I posted a 'going live' status by accident and 40 people joined before I could stop it.",
    "I liked a photo from 2017 on someone's profile and they got a notification for it.",
    "I tried to take a sneaky photo and the flash was on — everyone saw.",
  ],
  random: [
    "I once tried to be smooth and 'accidentally' bumped into someone, but missed and fell into a plant.",
    "I sang along to a song in public, got the lyrics completely wrong, and a stranger corrected me loudly.",
    "I tried to quietly exit a room but the door was a window and I walked straight into it.",
    "I told a waiter my order was 'to die for' and he asked if I needed medical help.",
    "I high-fived a person who was reaching for a handshake.",
  ],
};

export default function ToolHome() {
  const [theme, setTheme] = useState("random");
  const [story, setStory] = useState("");
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const generate = useCallback(() => {
    const list = STORIES[theme] || STORIES.random;
    setStory(list[Math.floor(Math.random() * list.length)]);
  }, [theme]);

  const copyStory = async () => {
    try {
      await navigator.clipboard.writeText(story);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const toggleFavorite = () => {
    if (!story) return;
    if (favorites.includes(story)) setFavorites((prev) => prev.filter((f) => f !== story));
    else setFavorites((prev) => [story, ...prev].slice(0, 20));
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <Unplug className="h-4 w-4" /> Cringe Collection
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Embarrassing Story Generator</h1>
          <p className="mt-2 text-(--muted-foreground)">Generate cringe-worthy stories that are painfully relatable</p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="mb-6 flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button key={t.id} onClick={() => setTheme(t.id)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${theme === t.id ? "bg-(--primary) text-white shadow-md" : "border border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"}`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          <button onClick={generate} className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-(--primary) px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
            <Laugh className="h-5 w-5" /> Generate Story
          </button>
        </div>

        {story && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 border-(--border) bg-(--card) p-6 shadow-lg" style={{ borderColor: "var(--primary)" }}>
            <div className="mb-4 flex items-start justify-between">
              <span className="rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--muted-foreground)">{THEMES.find((t) => t.id === theme)?.label}</span>
              <div className="flex gap-2">
                <button onClick={toggleFavorite} className={`rounded-lg p-2 transition-all ${favorites.includes(story) ? "text-pink-500" : "text-(--muted-foreground) hover:bg-(--muted)"}`}><Heart className="h-4 w-4" /></button>
                <button onClick={generate} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><RefreshCw className="h-4 w-4" /></button>
                <button onClick={copyStory} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><Copy className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="text-lg font-medium leading-relaxed text-(--foreground)">{story}</p>
            {copied && <p className="mt-2 text-sm text-(--primary)">Copied to clipboard!</p>}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-(--muted-foreground)">Favorite Stories ({favorites.length})</h3>
            <div className="space-y-2">
              {favorites.map((f, i) => (
                <div key={i} className="flex items-start justify-between rounded-xl bg-(--muted) p-3">
                  <p className="text-sm text-(--foreground)">{f.slice(0, 80)}...</p>
                  <button onClick={() => setFavorites((prev) => prev.filter((_, j) => j !== i))} className="ml-2 text-xs text-(--muted-foreground) hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
