"use client";
import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Hand, Star, SkipForward, RotateCcw, Shuffle,
  Sparkles, ThumbsUp, ThumbsDown, Users, PartyPopper,
  Beer, Heart, Globe, Briefcase, GraduationCap,
} from "lucide-react";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const CATEGORIES = [
  { id: "party", label: "Party", icon: PartyPopper, color: "text-pink-500" },
  { id: "travel", label: "Travel", icon: Globe, color: "text-blue-500" },
  { id: "school", label: "School", icon: GraduationCap, color: "text-amber-500" },
  { id: "work", label: "Work", icon: Briefcase, color: "text-purple-500" },
  { id: "relationships", label: "Relationships", icon: Heart, color: "text-rose-500" },
  { id: "drinking", label: "Drinking", icon: Beer, color: "text-emerald-500" },
  { id: "childhood", label: "Childhood", icon: Users, color: "text-cyan-500" },
  { id: "embarrassing", label: "Embarrassing", icon: ThumbsDown, color: "text-red-500" },
];

const DIFFICULTIES = ["easy", "medium", "hard"];

const PROMPTS = {
  party: {
    easy: [
      "Never have I ever danced on a table.",
      "Never have I ever sung karaoke in public.",
      "Never have I ever been to a club.",
      "Never have I ever done a keg stand.",
      "Never have I ever taken a shot of something I didn't like.",
      "Never have I ever played beer pong.",
      "Never have I ever been to a house party.",
      "Never have I ever worn a costume to a party.",
      "Never have I ever stayed at a party until sunrise.",
      "Never have I ever brought a stranger to a party.",
    ],
    medium: [
      "Never have I ever hooked up with someone at a party.",
      "Never have I ever crashed a party I wasn't invited to.",
      "Never have I ever been carried home from a party.",
      "Never have I ever made out with multiple people in one night.",
      "Never have I ever started a party chant.",
      "Never have I ever been the last one at a party.",
      "Never have I ever thrown up at a party.",
      "Never have I ever passed out at a party.",
      "Never have I ever snuck into a party.",
      "Never have I ever been kicked out of a party.",
    ],
    hard: [
      "Never have I ever done drugs at a party.",
      "Never have I ever had a threesome at a party.",
      "Never have I ever hooked up in a bathroom at a party.",
      "Never have I ever been arrested at a party.",
      "Never have I ever started a fight at a party.",
      "Never have I ever had sex in a public place at a party.",
      "Never have I ever been caught doing something inappropriate at a party.",
      "Never have I ever had to be driven home by a stranger from a party.",
      "Never have I ever blacked out and don't remember what I did at a party.",
      "Never have I ever done something at a party that made the news.",
    ],
  },
  travel: {
    easy: [
      "Never have I ever traveled to another country.",
      "Never have I ever been on a plane.",
      "Never have I ever stayed in a hotel.",
      "Never have I ever been to a beach.",
      "Never have I ever gotten lost while traveling.",
      "Never have I ever tried street food abroad.",
      "Never have I ever taken a road trip.",
      "Never have I ever been camping.",
      "Never have I ever visited a famous landmark.",
      "Never have I ever taken a selfie at an airport.",
    ],
    medium: [
      "Never have I ever missed a flight.",
      "Never have I ever had my luggage lost.",
      "Never have I ever traveled alone.",
      "Never have I ever been pickpocketed while traveling.",
      "Never have I ever lied about where I've traveled.",
      "Never have I ever traveled for a romantic getaway.",
      "Never have I ever been on a cruise.",
      "Never have I ever had a travel romance.",
      "Never have I ever gotten sick from food while traveling.",
      "Never have I ever gotten into an argument while traveling.",
    ],
    hard: [
      "Never have I ever overstayed a visa.",
      "Never have I ever done something illegal in a foreign country.",
      "Never have I ever had to go to a hospital while abroad.",
      "Never have I ever had a one-night stand while traveling.",
      "Never have I ever lied to customs.",
      "Never have I ever lost my passport abroad.",
      "Never have I ever been detained at an airport.",
      "Never have I ever smuggled something across a border.",
      "Never have I ever had to be bailed out while traveling.",
      "Never have I ever had a travel experience that put my life in danger.",
    ],
  },
  school: {
    easy: [
      "Never have I ever cheated on a test.",
      "Never have I ever fallen asleep in class.",
      "Never have I ever copied someone's homework.",
      "Never have I ever been late to class.",
      "Never have I ever skipped class.",
      "Never have I ever forgotten an assignment.",
      "Never have I ever been sent to the principal's office.",
      "Never have I ever passed a note in class.",
      "Never have I ever gotten detention.",
      "Never have I ever had a crush on a teacher.",
    ],
    medium: [
      "Never have I ever cheated on exams.",
      "Never have I ever been suspended from school.",
      "Never have I ever had a fight at school.",
      "Never have I ever vandalized school property.",
      "Never have I ever been caught cheating.",
      "Never have I ever started a rumor at school.",
      "Never have I ever been bullied or bullied someone.",
      "Never have I ever snuck out of school.",
      "Never have I ever been caught doing something inappropriate at school.",
      "Never have I ever had a relationship with a teacher.",
    ],
    hard: [
      "Never have I ever been expelled.",
      "Never have I ever gotten someone else expelled.",
      "Never have I ever set something on fire at school.",
      "Never have I ever been arrested at school.",
      "Never have I ever had sex at school.",
      "Never have I ever sold drugs at school.",
      "Never have I ever physically assaulted someone at school.",
      "Never have I ever been involved in a gang at school.",
      "Never have I ever broken into the school at night.",
      "Never have I ever been caught with something illegal at school.",
    ],
  },
  work: {
    easy: [
      "Never have I ever fallen asleep at work.",
      "Never have I ever taken a long lunch.",
      "Never have I ever called in sick when I wasn't.",
      "Never have I ever used the printer for personal use.",
      "Never have I ever taken office supplies home.",
      "Never have I ever browsed social media during work.",
      "Never have I ever been late to a meeting.",
      "Never have I ever had a work crush.",
      "Never have I ever vented about a coworker.",
      "Never have I ever worn pajamas to a virtual meeting.",
    ],
    medium: [
      "Never have I ever had a workplace romance.",
      "Never have I ever lied on my resume.",
      "Never have I ever stolen credit for someone's work.",
      "Never have I ever been drunk at work.",
      "Never have I ever had a confrontation with a boss.",
      "Never have I ever cried at work.",
      "Never have I ever quit a job without notice.",
      "Never have I ever been fired.",
      "Never have I ever had sex at work.",
      "Never have I ever made a work mistake that cost money.",
    ],
    hard: [
      "Never have I ever sabotaged a coworker.",
      "Never have I ever embezzled money from work.",
      "Never have I ever had an affair with a married coworker.",
      "Never have I ever been arrested at work.",
      "Never have I ever stolen from my employer.",
      "Never have I ever had a physical fight at work.",
      "Never have I ever been involved in illegal activity at work.",
      "Never have I ever falsified documents at work.",
      "Never have I ever had to go to HR because of something I did.",
      "Never have I ever been investigated for misconduct at work.",
    ],
  },
  relationships: {
    easy: [
      "Never have I ever had a crush on a friend's ex.",
      "Never have I ever checked my partner's phone.",
      "Never have I ever been on a blind date.",
      "Never have I ever used a dating app.",
      "Never have I ever been stood up on a date.",
      "Never have I ever had a long-distance relationship.",
      "Never have I ever had a relationship that lasted more than a year.",
      "Never have I ever broken up with someone over text.",
      "Never have I ever dated someone from work.",
      "Never have I ever said 'I love you' first.",
    ],
    medium: [
      "Never have I ever cheated on a partner.",
      "Never have I ever been cheated on.",
      "Never have I ever stayed in a relationship I knew was toxic.",
      "Never have I ever lied to a partner about where I was.",
      "Never have I ever had a rebound relationship.",
      "Never have I ever gotten back together with an ex.",
      "Never have I ever had a friends-with-benefits situation.",
      "Never have I ever been in love with two people at once.",
      "Never have I ever faked an orgasm.",
      "Never have I ever snooped through a partner's things.",
    ],
    hard: [
      "Never have I ever had a physical fight with a partner.",
      "Never have I ever been in an abusive relationship.",
      "Never have I ever cheated on a partner multiple times.",
      "Never have I ever been the other person in an affair.",
      "Never have I ever lied about being in love.",
      "Never have I ever manipulated a partner emotionally.",
      "Never have I ever had a threesome in a relationship.",
      "Never have I ever stayed with someone for their money.",
      "Never have I ever gaslit a partner.",
      "Never have I ever physically hurt a partner.",
    ],
  },
  drinking: {
    easy: [
      "Never have I ever had a hangover.",
      "Never have I ever drunk alcohol before age 21.",
      "Never have I ever mixed different types of alcohol.",
      "Never have I ever had a drink that I regretted.",
      "Never have I ever done a beer bong.",
      "Never have I ever played a drinking game.",
      "Never have I ever had a fake ID.",
      "Never have I ever been tipsy.",
      "Never have I ever had a favorite cocktail.",
      "Never have I ever bought a round for everyone.",
    ],
    medium: [
      "Never have I ever blacked out from drinking.",
      "Never have I ever thrown up from drinking.",
      "Never have I ever driven under the influence.",
      "Never have I ever had a one-night stand while drunk.",
      "Never have I ever been so drunk I couldn't walk.",
      "Never have I ever gotten into a fight while drunk.",
      "Never have I ever drank alone.",
      "Never have I ever hidden alcohol from someone.",
      "Never have I ever had to be carried home because of drinking.",
      "Never have I ever called an ex while drunk.",
    ],
    hard: [
      "Never have I ever had alcohol poisoning.",
      "Never have I Ever gotten a DUI.",
      "Never have I ever been to rehab.",
      "Never have I ever done drugs and alcohol together and regretted it.",
      "Never have I ever had sex with someone I didn't remember.",
      "Never have I ever had to go to the ER from drinking.",
      "Never have I ever lost a job because of drinking.",
      "Never have I ever destroyed property while drunk.",
      "Never have I ever had a drinking problem.",
      "Never have I ever woken up somewhere I didn't know how I got there.",
    ],
  },
  childhood: {
    easy: [
      "Never have I ever had a imaginary friend.",
      "Never have I ever believed in Santa Claus.",
      "Never have I ever had a favorite stuffed animal.",
      "Never have I ever made a fort with blankets.",
      "Never have I ever had a childhood pet.",
      "Never have I ever won a school award.",
      "Never have I ever learned to ride a bike.",
      "Never have I ever had a favorite cartoon.",
      "Never have I ever been to a birthday party.",
      "Never have I ever built a sandcastle.",
    ],
    medium: [
      "Never have I ever run away from home as a kid.",
      "Never have I ever gotten lost as a child.",
      "Never have I ever broken a bone as a kid.",
      "Never have I ever been bullied as a child.",
      "Never have I ever bullied someone as a kid.",
      "Never have I ever stolen something as a child.",
      "Never have I ever been afraid of the dark.",
      "Never have I ever had a childhood rival.",
      "Never have I ever had a secret club with friends.",
      "Never have I ever snuck out of the house as a teen.",
    ],
    hard: [
      "Never have I ever been physically disciplined as a child.",
      "Never have I ever witnessed domestic violence as a kid.",
      "Never have I ever been abused as a child.",
      "Never have I ever had to grow up too fast.",
      "Never have I ever been neglected as a child.",
      "Never have I ever had a traumatic childhood experience.",
      "Never have I ever been taken away from my parents.",
      "Never have I ever had a childhood friend die.",
      "Never have I ever experienced homelessness as a child.",
      "Never have I ever had to protect a sibling from harm as a kid.",
    ],
  },
  embarrassing: {
    easy: [
      "Never have I ever tripped in public.",
      "Never have I ever called someone the wrong name.",
      "Never have I ever worn mismatched socks in public.",
      "Never have I ever gotten food stuck in my teeth.",
      "Never have I ever waved at someone who wasn't waving at me.",
      "Never have I ever had a wardrobe malfunction.",
      "Never have I ever sneezed loudly in a quiet place.",
      "Never have I ever had spinach in my teeth.",
      "Never have I ever laughed at an inappropriate moment.",
      "Never have I ever sent a text to the wrong person.",
    ],
    medium: [
      "Never have I ever fallen in public.",
      "Never have I ever had my fly down in public.",
      "Never have I ever walked into a glass door.",
      "Never have I ever had someone walk in on me in the bathroom.",
      "Never have I ever said something and immediately regretted it.",
      "Never have I ever had a embarrassing photo of me go viral.",
      "Never have I ever been caught picking my nose.",
      "Never have I ever accidentally liked an ex's old photo.",
      "Never have I ever had a loud conversation about someone who was behind me.",
      "Never have I ever sent a sext to the wrong person.",
    ],
    hard: [
      "Never have I ever been caught having sex.",
      "Never have I ever had a public indecency incident.",
      "Never have I ever been recorded doing something embarrassing.",
      "Never have I ever had a video of me leaked.",
      "Never have I ever been caught doing something illegal by a family member.",
      "Never have I ever had a wardrobe malfunction that exposed everything.",
      "Never have I ever been caught in a lie on a large scale.",
      "Never have I ever had an embarrassing medical incident in public.",
      "Never have I ever been caught cheating and publicly shamed.",
      "Never have I ever had a secret exposed in front of everyone I know.",
    ],
  },
};

export default function ToolHome() {
  const [category, setCategory] = useState("party");
  const [difficulty, setDifficulty] = useState("medium");
  const [current, setCurrent] = useState(null);
  const [usedPrompts, setUsedPrompts] = useState(new Set());
  const [favorites, setFavorites] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [randomMode, setRandomMode] = useState(false);
  const [showResult, setShowResult] = useState(null);

  const prompts = useMemo(() => {
    return PROMPTS[category]?.[difficulty] || PROMPTS.party.easy;
  }, [category, difficulty]);

  const availablePrompts = useMemo(() => {
    const all = [...prompts];
    if (randomMode) {
      const allCategories = Object.values(PROMPTS).flatMap((d) => d[difficulty] || []);
      return allCategories.filter((p) => !usedPrompts.has(p));
    }
    return all.filter((p) => !usedPrompts.has(p));
  }, [prompts, usedPrompts, randomMode, difficulty]);

  const pick = useCallback(() => {
    if (isAnimating) return;
    if (availablePrompts.length === 0) {
      setCurrent({ id: generateId(), text: "You've seen all prompts! Reset to continue." });
      return;
    }
    setIsAnimating(true);

    let count = 0;
    const maxSteps = 8 + Math.floor(Math.random() * 6);
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * availablePrompts.length);
      setCurrent({ id: generateId(), text: availablePrompts[randomIdx] });
      count++;
      if (count >= maxSteps) {
        clearInterval(interval);
        const chosen = availablePrompts[Math.floor(Math.random() * availablePrompts.length)];
        setCurrent({ id: generateId(), text: chosen });
        setUsedPrompts((prev) => new Set(prev).add(chosen));
        setIsAnimating(false);
        setShowResult(Date.now());
      }
    }, 70 + count * 5);
  }, [availablePrompts, isAnimating]);

  const skip = useCallback(() => {
    pick();
  }, [pick]);

  const toggleFavorite = useCallback(() => {
    if (!current) return;
    setFavorites((prev) => {
      const exists = prev.find((f) => f.text === current.text);
      if (exists) return prev.filter((f) => f.text !== current.text);
      return [...prev, { ...current, category, difficulty }];
    });
  }, [current, category, difficulty]);

  const reset = useCallback(() => {
    setUsedPrompts(new Set());
    setCurrent(null);
    setShowResult(null);
  }, []);

  const isFavorited = current && favorites.some((f) => f.text === current.text);
  const currentCat = CATEGORIES.find((c) => c.id === category);

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-(--foreground)">Never Have I Ever</h1>
          <p className="text-(--muted-foreground) mt-1">Hundreds of prompts for the ultimate party game</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-(--card) border border-(--border) p-5 space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCategory(c.id); setCurrent(null); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1 ${
                      category === c.id
                        ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                        : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
                    }`}
                  >
                    <c.icon size="12" className={c.color} />
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border transition ${
                      difficulty === d
                        ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                        : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="min-h-[180px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isAnimating ? (
                    <motion.div
                      key={`anim-${showResult}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="text-center"
                    >
                      <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-(--primary)/10 flex items-center justify-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                          <Sparkles size="36" className="text-(--primary)" />
                        </motion.div>
                      </div>
                      <p className="text-lg font-bold text-(--foreground) animate-pulse">
                        {current?.text || "Thinking..."}
                      </p>
                    </motion.div>
                  ) : current ? (
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      className="text-center w-full"
                    >
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase mb-3 bg-(--primary)/10 text-(--primary)">
                        {currentCat && <currentCat.icon size="12" className={currentCat.color} />}
                        <span>{currentCat?.label} • {difficulty}</span>
                      </div>
                      <p className="text-xl font-semibold text-(--foreground) mb-6 leading-relaxed px-4">
                        {current.text}
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setShowResult("drank")}
                          className="px-6 py-3 rounded-xl bg-(--primary) text-(--primary-foreground) font-bold hover:opacity-90 transition flex items-center gap-2 shadow-lg shadow-(--primary)/20"
                        >
                          <ThumbsUp size="18" /> I Have
                        </button>
                        <button
                          onClick={() => setShowResult("didnt")}
                          className="px-6 py-3 rounded-xl bg-(--muted) text-(--foreground) font-bold hover:bg-(--border) transition flex items-center gap-2"
                        >
                          <ThumbsDown size="18" /> Never Have
                        </button>
                      </div>
                      <div className="flex justify-center gap-2 mt-3">
                        <button onClick={toggleFavorite} className="p-2 rounded-lg hover:bg-(--muted) transition">
                          <Star size="16" className={isFavorited ? "fill-amber-400 text-amber-400" : "text-(--muted-foreground)"} />
                        </button>
                        <button onClick={skip} className="px-3 py-2 rounded-lg bg-(--muted) text-(--muted-foreground) hover:text-(--foreground) text-xs font-medium transition flex items-center gap-1">
                          <SkipForward size="14" /> Skip
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-(--muted-foreground)">
                      <Hand size="48" className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Press Pick to start!</p>
                      <p className="text-xs mt-1">{availablePrompts.length} prompts available</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={pick}
                disabled={isAnimating}
                className="w-full py-3.5 rounded-xl bg-(--primary) text-(--primary-foreground) font-bold hover:opacity-90 disabled:opacity-40 transition shadow-lg shadow-(--primary)/20 text-lg"
              >
                {isAnimating ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Sparkles size="20" />
                    </motion.span>
                    Picking...
                  </span>
                ) : (
                  "Pick a Prompt"
                )}
              </button>

              <label className="flex items-center gap-2 text-sm text-(--muted-foreground) cursor-pointer">
                <input
                  type="checkbox"
                  checked={randomMode}
                  onChange={(e) => setRandomMode(e.target.checked)}
                  className="w-4 h-4 rounded border-(--border) text-(--primary) focus:ring-(--primary)"
                />
                <Shuffle size="14" /> Random mode (all categories)
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-(--card) border border-(--border) p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground) flex items-center gap-1">
                  <Star size="12" /> Favorites
                </h4>
                <span className="text-[10px] text-(--muted-foreground) bg-(--muted) px-2 py-0.5 rounded-full">{favorites.length}</span>
              </div>
              {favorites.length === 0 ? (
                <p className="text-xs text-(--muted-foreground) text-center py-6">No favorites yet</p>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                  {favorites.map((f, i) => (
                    <div key={i} className="px-2.5 py-1.5 rounded-lg bg-(--muted)">
                      <p className="text-xs text-(--foreground) truncate">{f.text}</p>
                      <p className="text-[10px] text-(--muted-foreground) mt-0.5 capitalize">{f.category} • {f.difficulty}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-(--card) border border-(--border) p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">Used Prompts</h4>
                <span className="text-[10px] text-(--muted-foreground) bg-(--muted) px-2 py-0.5 rounded-full">{usedPrompts.size}</span>
              </div>
              <p className="text-xs text-(--muted-foreground) mb-3">{availablePrompts.length} prompts remaining</p>
              <button onClick={reset} className="w-full py-2 rounded-lg bg-(--muted) text-(--muted-foreground) hover:text-(--foreground) text-xs font-medium transition flex items-center justify-center gap-1.5">
                <RotateCcw size="12" /> Reset All Prompts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
