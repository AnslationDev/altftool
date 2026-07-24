// src/tools/ambiguous-figure-viewer/entry.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Award,
  Brain,
  CheckCircle2,
  Compass,
  Eye,
  Filter,
  Flame,
  Heart,
  Layers,
  RotateCcw,
  Search,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";

import {
  AchievementsSection,
  AmbientBackground,
  HeroFeaturedCard,
  IllusionCard,
  IllusionViewer,
  ScientificEducation,
  UserProgressDashboard,
} from "./components.jsx";
import { ACHIEVEMENTS, ILLUSIONS, soundFx } from "./utils.js";
import "./styles.css";

export default function AmbiguousFigureViewer() {
  const [selectedIllusion, setSelectedIllusion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Persistent user state
  const [solvedIds, setSolvedIds] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("afv_solved_ids");
        return saved ? JSON.parse(saved) : ["duck-rabbit", "rubin-vase"];
      } catch (_) {}
    }
    return ["duck-rabbit", "rubin-vase"];
  });

  const [favoriteIds, setFavoriteIds] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("afv_favorite_ids");
        return saved ? JSON.parse(saved) : ["necker-cube"];
      } catch (_) {}
    }
    return ["necker-cube"];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("afv_solved_ids", JSON.stringify(solvedIds));
      } catch (_) {}
    }
  }, [solvedIds]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("afv_favorite_ids", JSON.stringify(favoriteIds));
      } catch (_) {}
    }
  }, [favoriteIds]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
    if (next) soundFx.playClick();
  };

  const toggleSolved = (id) => {
    setSolvedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      if (!exists) {
        soundFx.playUnlock();
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch (_) {}
      }
      return next;
    });
  };

  const toggleFavorite = (id) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Categories list
  const categories = useMemo(() => {
    const list = ["All", "People", "Animals", "Objects", "Motion", "Perspective", "Negative Space", "Impossible Shapes", "Gestalt", "Hidden Images", "Colors"];
    return list;
  }, []);

  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
  const statuses = ["All", "Solved", "Unsolved", "Favorites"];

  // Filtered Illusions list
  const filteredIllusions = useMemo(() => {
    return ILLUSIONS.filter((illusion) => {
      // Search
      const matchesSearch =
        searchQuery.trim() === "" ||
        illusion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        illusion.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        illusion.difficulty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        illusion.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category
      const matchesCategory =
        selectedCategory === "All" || illusion.category === selectedCategory;

      // Difficulty
      const matchesDifficulty =
        selectedDifficulty === "All" || illusion.difficulty === selectedDifficulty;

      // Status
      const isSolved = solvedIds.includes(illusion.id);
      const isFav = favoriteIds.includes(illusion.id);
      const matchesStatus =
        selectedStatus === "All" ||
        (selectedStatus === "Solved" && isSolved) ||
        (selectedStatus === "Unsolved" && !isSolved) ||
        (selectedStatus === "Favorites" && isFav);

      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty, selectedStatus, solvedIds, favoriteIds]);

  // Derived user statistics
  const userStats = useMemo(() => {
    const solvedCount = solvedIds.length;
    const totalCount = ILLUSIONS.length;
    const streak = Math.min(solvedCount, 7); // Active streak days simulation
    const brainScore = solvedCount * 45 + favoriteIds.length * 15;
    const xp = solvedCount * 120 + 50;

    // Calculate top category from solved
    const categoryCounts = {};
    solvedIds.forEach((id) => {
      const item = ILLUSIONS.find((i) => i.id === id);
      if (item) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      }
    });

    let favoriteCategory = "Gestalt";
    let maxC = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxC) {
        maxC = count;
        favoriteCategory = cat;
      }
    });

    return { solvedCount, totalCount, streak, brainScore, xp, favoriteCategory };
  }, [solvedIds, favoriteIds]);

  // Achievements list status
  const achievements = useMemo(() => {
    return ACHIEVEMENTS.map((ach) => {
      let unlocked = false;
      if (ach.id === "first_illusion") unlocked = solvedIds.length >= 1;
      if (ach.id === "ten_solved") unlocked = solvedIds.length >= 10;
      if (ach.id === "twenty_five_solved") unlocked = solvedIds.length >= 25;
      if (ach.id === "fast_thinker") unlocked = solvedIds.length >= 3;
      if (ach.id === "perception_master") unlocked = userStats.brainScore >= 300;
      if (ach.id === "hidden_genius") {
        const advSolved = solvedIds.filter(
          (id) => ILLUSIONS.find((i) => i.id === id)?.difficulty === "Advanced"
        ).length;
        unlocked = advSolved >= 3;
      }
      return { ...ach, unlocked };
    });
  }, [solvedIds, userStats.brainScore]);

  // Featured Illusion for Hero
  const featuredIllusion = useMemo(() => {
    return ILLUSIONS.find((i) => i.id === "rubin-vase") || ILLUSIONS[0];
  }, []);

  return (
    <div className="ambiguous-figure-viewer relative min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#0f172a]">
      <AmbientBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 md:py-10 lg:gap-10">

        {/* --- Top Navigation / Header Bar --- */}
        <header className="flex items-center justify-between border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14b8a6] to-[#38bdf8] text-white shadow-md">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Perception Lab</h1>
              <p className="text-[11px] font-bold text-slate-400">Ambiguous Figure Viewer & Cognitive Tool</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition ${
                soundEnabled
                  ? "border-teal-200 bg-teal-50 text-[#14b8a6]"
                  : "border-slate-200 bg-white text-slate-400"
              }`}
              type="button"
              title={soundEnabled ? "Sound Effects Enabled" : "Sound Muted"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* --- HERO SECTION --- */}
        <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6 md:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-[#14b8a6]">
                <Sparkles className="h-4 w-4 shrink-0" /> Perception Lab SaaS Redesign
              </div>

              <div className="space-y-3">
                <h1 className="tool-heading-accent text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  Ambiguous Figure Viewer
                </h1>
                <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600 lg:mx-0">
                  Train your brain by discovering hidden meanings inside famous optical illusions.
                  Observe how visual signals trigger competing neural interpretations without changing the image!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <a
                  href="#gallery"
                  onClick={() => soundFx.playClick()}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#14b8a6] via-[#0d9488] to-[#38bdf8] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:opacity-95 active:scale-95"
                >
                  <Compass className="h-4 w-4" /> Start Exploring
                </a>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedIllusion(featuredIllusion);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-sm font-extrabold text-slate-700 shadow-xs transition hover:border-[#14b8a6] hover:text-[#14b8a6]"
                  type="button"
                >
                  <Eye className="h-4 w-4 text-[#14b8a6]" /> Open Featured Figure
                </button>
              </div>
            </motion.div>

            {/* Right Featured Illusion Card */}
            <HeroFeaturedCard
              illusion={featuredIllusion}
              onOpenViewer={setSelectedIllusion}
            />
          </div>
        </section>

        {/* --- USER PROGRESS DASHBOARD & ACHIEVEMENTS --- */}
        <UserProgressDashboard
          solvedCount={userStats.solvedCount}
          totalCount={userStats.totalCount}
          streak={userStats.streak}
          brainScore={userStats.brainScore}
          xp={userStats.xp}
          favoriteCategory={userStats.favoriteCategory}
        />

        <AchievementsSection
          achievements={achievements}
          userProgress={userStats}
        />

        {/* --- SEARCH & FILTERS SECTION --- */}
        <section id="gallery" className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search optical illusions..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 stroke-none pl-10 pr-10 text-sm font-medium text-slate-900 placeholder-slate-400 transition focus:border-[#14b8a6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14b8a6]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span>Showing {filteredIllusions.length} of {ILLUSIONS.length} figures</span>
            </div>
          </div>

          {/* Filter Chips Bar */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="shrink-0 text-xs font-black text-slate-400">Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedCategory(cat);
                  }}
                  className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                    selectedCategory === cat
                      ? "chip-active"
                      : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-[#14b8a6] hover:text-[#14b8a6]"
                  }`}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Difficulty & Status Chips */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="shrink-0 text-xs font-black text-slate-400">Difficulty:</span>
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedDifficulty(diff);
                    }}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      selectedDifficulty === diff
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900"
                    }`}
                    type="button"
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="shrink-0 text-xs font-black text-slate-400">Status:</span>
                {statuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedStatus(st);
                    }}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      selectedStatus === st
                        ? "bg-[#38bdf8] text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900"
                    }`}
                    type="button"
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- POPULAR GALLERY GRID --- */}
        <main className="min-h-[400px]">
          {filteredIllusions.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredIllusions.map((illusion) => (
                  <IllusionCard
                    key={illusion.id}
                    illusion={illusion}
                    onClick={setSelectedIllusion}
                    isSolved={solvedIds.includes(illusion.id)}
                    isFavorite={favoriteIds.includes(illusion.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <Search className="h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-lg font-black text-slate-800">No optical illusions found</h3>
              <p className="mt-1 text-xs text-slate-400">Try adjusting your search query or category filters.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                  setSelectedStatus("All");
                }}
                className="mt-4 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                type="button"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>

        {/* --- SCIENTIFIC EDUCATION SECTION --- */}
        <section className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#14b8a6]">Neuroscience</span>
            <h2 className="text-2xl font-black text-slate-900">Why your brain flips the image</h2>
          </div>
          <ScientificEducation />
        </section>

        {/* --- FOOTER --- */}
        <footer className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 py-6 text-xs font-bold text-slate-400 sm:flex-row">
          <div className="flex flex-wrap gap-4">
            <span>Bistable Perception</span>
            <span>Gestalt Switching</span>
            <span>Neural Adaptation</span>
            <span>Top-Down Processing</span>
          </div>
          <div className="flex items-center gap-1">
            Perception Lab SaaS Redesign v2.0 <Sparkles className="h-3.5 w-3.5 text-[#14b8a6]" />
          </div>
        </footer>
      </div>

      {/* --- ILLUSION VIEWER MODAL --- */}
      <AnimatePresence>
        {selectedIllusion && (
          <IllusionViewer
            illusion={selectedIllusion}
            onClose={() => setSelectedIllusion(null)}
            isSolved={solvedIds.includes(selectedIllusion.id)}
            onToggleSolved={toggleSolved}
            isFavorite={favoriteIds.includes(selectedIllusion.id)}
            onToggleFavorite={toggleFavorite}
            onSelectIllusion={(illusion) => setSelectedIllusion(illusion)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
