"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Beer, SkipForward, RotateCcw, Star, Users,
  Sparkles, Dices, Heart, Skull, Timer, Swords,
  GlassWater, Wine,
} from "lucide-react";

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const CATEGORIES = [
  { id: "classic", label: "Classic Games", icon: Dices, color: "text-amber-500" },
  { id: "card", label: "Card Games", icon: Swords, color: "text-emerald-500" },
  { id: "challenge", label: "Challenges", icon: Skull, color: "text-red-500" },
  { id: "social", label: "Social", icon: Users, color: "text-blue-500" },
  { id: "couples", label: "Couples", icon: Heart, color: "text-rose-500" },
  { id: "penalty", label: "Penalties", icon: Timer, color: "text-purple-500" },
];

const GAMES = {
  classic: [
    { name: "Beer Pong", desc: "Classic ping pong ball tossing into cups of beer.", players: "2+", duration: "15-30 min" },
    { name: "Flip Cup", desc: "Teams race to flip cups by flicking the rim.", players: "4+", duration: "10-20 min" },
    { name: "Kings Cup", desc: "Draw cards and follow the rules around the king's cup.", players: "3+", duration: "30-60 min" },
    { name: "Never Have I Ever", desc: "Take a drink if you've done what the statement says.", players: "2+", duration: "15-30 min" },
    { name: "Truth or Dare (Drinking)", desc: "Choose truth or dare — dare usually involves drinking.", players: "2+", duration: "20-40 min" },
    { name: "Quarters", desc: "Bounce a quarter into a shot glass.", players: "2+", duration: "15-30 min" },
    { name: "Power Hour", desc: "Take a shot of beer every minute for an hour.", players: "1+", duration: "60 min" },
    { name: "Century Club", desc: "Take a shot of beer every minute for 100 minutes.", players: "1+", duration: "100 min" },
  ],
  card: [
    { name: "Ride the Bus", desc: "A card game where you earn and lose drinks based on guesses.", players: "2+", duration: "20-40 min" },
    { name: "Egyptian Ratscrew", desc: "Slap the pile when matching cards appear.", players: "2+", duration: "15-30 min" },
    { name: "Asshole", desc: "A hierarchy-based card game with drinking penalties.", players: "4+", duration: "30-60 min" },
    { name: "Bullshit", desc: "Call out liars and make them drink.", players: "3+", duration: "20-40 min" },
    { name: "Presidents and Assholes", desc: "Rank-based card game where losers drink.", players: "4+", duration: "30-60 min" },
    { name: "Drinking Poker", desc: "Poker with drinking penalties for losing hands.", players: "3+", duration: "45-90 min" },
    { name: "Three Man", desc: "Dice and card game centered around the 'three man'.", players: "3+", duration: "20-40 min" },
    { name: "Baseball", desc: "A card drinking game based on baseball innings.", players: "3+", duration: "30-60 min" },
  ],
  challenge: [
    { name: "Shotgun a Beer", desc: "Poke a hole in the bottom of a can and chug.", players: "1+", duration: "30 sec" },
    { name: "Beer Bong Challenge", desc: "Chug a beer through a funnel as fast as possible.", players: "1+", duration: "1 min" },
    { name: "Yard Game", desc: "Drink from a yard glass without stopping.", players: "1+", duration: "1-2 min" },
    { name: "Beer Pong Trick Shot", desc: "Land a trick shot in beer pong from a distance.", players: "2+", duration: "5-10 min" },
    { name: "Speed Round", desc: "Everyone does a shot within 10 seconds.", players: "2+", duration: "30 sec" },
    { name: "Beer Mile", desc: "Run a mile, drinking a beer every quarter mile.", players: "2+", duration: "10-20 min" },
    { name: "Waterfall Challenge", desc: "Start drinking and can't stop until person to your right stops.", players: "3+", duration: "2-5 min" },
    { name: "Chugging Contest", desc: "See who can chug their drink the fastest.", players: "2+", duration: "1-2 min" },
  ],
  social: [
    { name: "Categories", desc: "Name something in a category — last one to answer drinks.", players: "3+", duration: "10-20 min" },
    { name: "Most Likely To", desc: "Point to who is most likely to do something — they drink.", players: "3+", duration: "15-30 min" },
    { name: "I Never", desc: "Everyone puts up 3 fingers. If you've done it, put one down. Last with fingers up drinks.", players: "3+", duration: "15-30 min" },
    { name: "Fuck You", desc: "A pyramid drinking game with cups and a ping pong ball.", players: "4+", duration: "30-60 min" },
    { name: "Cheers Governor", desc: "Go around the circle saying 'Cheers Governor' — mess up and drink.", players: "3+", duration: "10-20 min" },
    { name: "The Name Game", desc: "Say a name — next person says a name starting with last letter.", players: "3+", duration: "10-20 min" },
    { name: "Rhyme Time", desc: "Say a word — next person rhymes it. Can't rhyme? Drink.", players: "3+", duration: "10-20 min" },
    { name: "Questions Only", desc: "Only speak in questions. Answer a statement? Drink.", players: "3+", duration: "10-20 min" },
  ],
  couples: [
    { name: "Body Shots", desc: "Take a shot off your partner's body.", players: "2", duration: "5 min" },
    { name: "Seven Minutes in Heaven", desc: "Spend 7 minutes in a closet together.", players: "2", duration: "7 min" },
    { name: "Strip Drinking Game", desc: "Lose a hand of cards? Remove an item of clothing and drink.", players: "2+", duration: "20-40 min" },
    { name: "Drinking Twister", desc: "Twister but every time you fall, you drink.", players: "2+", duration: "15-30 min" },
    { name: "Sexual Truth or Dare", desc: "Truth or dare with a sexual twist.", players: "2+", duration: "20-40 min" },
    { name: "Intimate Questions", desc: "Ask intimate questions — if they won't answer, they drink.", players: "2", duration: "15-30 min" },
    { name: "Body Shots Competition", desc: "Who can take the most body shots?", players: "2+", duration: "10-20 min" },
    { name: "Drinking and Truth", desc: "Each drink must be followed by answering a truth question.", players: "2", duration: "15-30 min" },
  ],
  penalty: [
    { name: "Finish Your Drink", desc: "Chug the rest of whatever you're drinking.", players: "1", duration: "30 sec" },
    { name: "Take a Shot", desc: "Take a full shot of your chosen spirit.", players: "1", duration: "10 sec" },
    { name: "Make a Rule", desc: "Create a new rule everyone must follow until the next penalty.", players: "1", duration: "varies" },
    { name: "Drink and Share", desc: "Take a drink and share an embarrassing story.", players: "1", duration: "2 min" },
    { name: "Three Sips", desc: "Take three consecutive sips of your drink.", players: "1", duration: "30 sec" },
    { name: "Give Two Drinks", desc: "Choose two people to take a drink.", players: "1", duration: "30 sec" },
    { name: "Waterfall Start", desc: "Start a waterfall — everyone drinks until you stop.", players: "1", duration: "varies" },
    { name: "Double Shot", desc: "Take two shots back to back.", players: "1", duration: "20 sec" },
  ],
};

const CHALLENGES = [
  "Do a shot!",
  "Finish your drink!",
  "Take 3 sips!",
  "Give a drink to someone!",
  "Start a waterfall!",
  "Make a new rule!",
  "Swap drinks with someone!",
  "Do a body shot!",
  "Chug for 5 seconds!",
  "Take a shot with your non-dominant hand!",
  "Drink without using your hands!",
  "Take a shot and sing!",
  "Do a keg stand!",
  "Take a drink for every letter in your name!",
  "Drink to the person on your left!",
  "Drink to the person on your right!",
  "Take a shot while standing on one foot!",
  "Do a bellringer!",
  "Take a social sip!",
  "Finish someone else's drink!",
];

export default function ToolHome() {
  const [category, setCategory] = useState("classic");
  const [currentGame, setCurrentGame] = useState(null);
  const [currentChallenge, setCurrentChallenge] = useState(null);
  // Which category the *currently shown* game actually came from — tracked
  // separately from the live `category`/`penaltyMode` toggles so the badge
  // above the result never shows a category the game wasn't drawn from
  // (penalty mode draws from GAMES.penalty regardless of the selected tab).
  const [resultCategoryId, setResultCategoryId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [penaltyMode, setPenaltyMode] = useState(false);
  const [showGame, setShowGame] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [skipped, setSkipped] = useState(0);
  const [announcement, setAnnouncement] = useState("");

  const games = GAMES[category] || GAMES.classic;

  const pickGame = useCallback(() => {
    // Penalty mode draws from the penalty set instead of whichever category
    // tab is selected — a quick single consequence rather than a full game.
    const pool = penaltyMode ? GAMES.penalty : games;
    const pickedCategoryId = penaltyMode ? "penalty" : category;
    if (isAnimating || pool.length === 0) return;
    setIsAnimating(true);

    const maxSteps = 10 + Math.floor(Math.random() * 8);
    let count = 0;

    const tick = () => {
      const randomGame = pool[Math.floor(Math.random() * pool.length)];
      setCurrentGame(randomGame);
      count += 1;
      if (count >= maxSteps) {
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        setCurrentGame(chosen);
        setResultCategoryId(pickedCategoryId);
        setIsAnimating(false);
        const challenge = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
        setCurrentChallenge(challenge);
        setAnnouncement(`${chosen.name} picked. Challenge: ${challenge}`);
        setHistory((prev) => [
          { id: generateId(), game: chosen.name, challenge, date: new Date().toLocaleString() },
          ...prev.slice(0, 49),
        ]);
        setShowGame(true);
        return;
      }
      // Each successive tick waits a little longer than the last, so the
      // spin visibly decelerates instead of flashing at a fixed rate.
      window.setTimeout(tick, 60 + count * 5);
    };

    window.setTimeout(tick, 60);
  }, [games, isAnimating, penaltyMode, category]);

  const skip = useCallback(() => {
    setSkipped((prev) => prev + 1);
    pickGame();
  }, [pickGame]);

  const toggleFavorite = useCallback(() => {
    if (!currentGame) return;
    setFavorites((prev) => {
      const exists = prev.find((f) => f.name === currentGame.name);
      if (exists) return prev.filter((f) => f.name !== currentGame.name);
      return [...prev, { ...currentGame }];
    });
  }, [currentGame]);

  const reset = useCallback(() => {
    if (
      !window.confirm(
        "Reset the picker? This clears the current game, challenge and the full pick history, and cannot be undone.",
      )
    ) {
      return;
    }
    setCurrentGame(null);
    setCurrentChallenge(null);
    setResultCategoryId(null);
    setHistory([]);
    setSkipped(0);
    setAnnouncement("");
  }, []);

  const isFavorited = currentGame && favorites.some((f) => f.name === currentGame.name);
  // The category being browsed in the tabs/grid below — independent of
  // resultCat, which is whichever category the displayed pick came from.
  const currentCat = CATEGORIES.find((c) => c.id === category);
  const resultCat = CATEGORIES.find((c) => c.id === resultCategoryId) || currentCat;

  return (
    <div className="min-h-screen bg-(--background)">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-(--foreground)">Drinking Game Picker</h1>
          <p className="text-(--muted-foreground) mt-1">Never run out of drinking games — random picks with challenges and penalties</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl bg-(--card) border border-(--border) p-5 space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    disabled={isAnimating}
                    onClick={() => {
                      setCategory(c.id);
                      setCurrentGame(null);
                      setCurrentChallenge(null);
                      setResultCategoryId(null);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition flex items-center gap-1 disabled:cursor-not-allowed disabled:opacity-40 ${
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

              <div className="min-h-[220px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isAnimating ? (
                    <motion.div
                      key="animating"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="text-center"
                    >
                      <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-(--primary)/10 flex items-center justify-center">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                          <Sparkles size="40" className="text-(--primary)" />
                        </motion.div>
                      </div>
                      <p className="text-lg font-bold text-(--foreground) animate-pulse">Spinning the wheel...</p>
                    </motion.div>
                  ) : currentGame ? (
                    <motion.div
                      key={currentGame.name}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -30 }}
                      className="text-center w-full"
                    >
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase mb-3 bg-(--primary)/10 text-(--primary)">
                        {resultCat && <resultCat.icon size="12" className={resultCat.color} />}
                        <span>{resultCat?.label}</span>
                      </div>
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-(--foreground) mb-2">{currentGame.name}</p>
                        <p className="text-sm text-(--muted-foreground) max-w-md mx-auto">{currentGame.desc}</p>
                        <div className="flex justify-center gap-3 mt-2">
                          <span className="text-xs text-(--muted-foreground) bg-(--muted) px-2 py-0.5 rounded-full">
                            Players: {currentGame.players}
                          </span>
                          <span className="text-xs text-(--muted-foreground) bg-(--muted) px-2 py-0.5 rounded-full">
                            {currentGame.duration}
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-(--border) pt-4 mt-4">
                        <p className="text-sm font-semibold text-(--foreground) mb-1">Challenge:</p>
                        <p className="text-lg font-bold text-(--primary)">{currentChallenge}</p>
                      </div>
                      <div className="flex justify-center gap-2 mt-4">
                        <button
                          onClick={toggleFavorite}
                          aria-label={isFavorited ? `Remove ${currentGame.name} from favorites` : `Add ${currentGame.name} to favorites`}
                          aria-pressed={Boolean(isFavorited)}
                          className="p-2 rounded-lg hover:bg-(--muted) transition"
                        >
                          <Star size="16" className={isFavorited ? "fill-amber-400 text-amber-400" : "text-(--muted-foreground)"} />
                        </button>
                        <button onClick={skip} className="px-4 py-2 rounded-lg bg-(--muted) text-(--foreground) text-sm font-medium hover:bg-(--border) transition flex items-center gap-1.5">
                          <SkipForward size="16" /> Skip
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-(--muted-foreground)">
                      <Beer size="48" className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Pick a game to get started!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="text-center text-xs text-(--muted-foreground)">Skipped: {skipped}</p>
              <span className="sr-only" role="status" aria-live="polite">
                {announcement}
              </span>

              <button
                onClick={pickGame}
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
                  "Pick a Game"
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-(--card) border border-(--border) p-5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground) mb-3">Controls</h4>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-(--muted-foreground) cursor-pointer">
                  <input
                    type="checkbox"
                    checked={penaltyMode}
                    onChange={(e) => setPenaltyMode(e.target.checked)}
                    className="w-4 h-4 rounded border-(--border) text-(--primary) focus:ring-(--primary)"
                  />
                  <Timer size="14" /> Penalty mode (single penalty instead of a full game)
                </label>
              </div>
            </div>

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
                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                  {favorites.map((f, i) => (
                    <div key={i} className="px-2.5 py-1.5 rounded-lg bg-(--muted)">
                      <p className="text-xs font-medium text-(--foreground)">{f.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-(--card) border border-(--border) p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">History</h4>
                <span className="text-[10px] text-(--muted-foreground) bg-(--muted) px-2 py-0.5 rounded-full">{history.length}</span>
              </div>
              {history.length === 0 ? (
                <p className="text-xs text-(--muted-foreground) text-center py-6">No history yet</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  {history.slice(0, 15).map((h) => (
                    <div key={h.id} className="px-2.5 py-1.5 rounded-lg bg-(--muted)">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-xs font-medium text-(--foreground) truncate">{h.game}</p>
                        <p className="shrink-0 text-[9px] text-(--muted-foreground)">{h.date}</p>
                      </div>
                      <p className="text-[10px] text-(--muted-foreground) truncate">{h.challenge}</p>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={reset} className="mt-3 w-full py-2 rounded-lg bg-(--muted) text-(--muted-foreground) hover:text-(--foreground) text-xs font-medium transition flex items-center justify-center gap-1.5">
                <RotateCcw size="12" /> Reset
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-(--card) border border-(--border) p-5">
          <h3 className="text-sm font-semibold text-(--foreground) mb-3">All {currentCat?.label} Games</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {games.map((game) => (
              <div
                key={game.name}
                className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition border ${
                  currentGame?.name === game.name
                    ? "bg-(--primary)/10 text-(--primary) border-(--primary)"
                    : "bg-(--muted) text-(--foreground) border-(--border) hover:border-(--primary)"
                }`}
                onClick={() => {
                  setCurrentGame(game);
                  setResultCategoryId(category);
                  setCurrentChallenge(CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]);
                }}
              >
                <p className="font-medium">{game.name}</p>
                <p className="text-[10px] text-(--muted-foreground) mt-0.5">{game.players} • {game.duration}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
