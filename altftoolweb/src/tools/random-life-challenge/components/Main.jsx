"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Trophy,
  Dumbbell,
  Compass,
  Heart,
  BookOpen,
  Activity,
  Award,
  Play,
  RotateCcw,
  CheckCircle,
  Clock,
  Zap,
  Trash2,
  Calendar,
  Smile,
  RefreshCw,
} from "lucide-react";

// Challenge database
const CHALLENGES = [
  // Health & Fitness
  { id: 1, text: "Do 25 push-ups or 40 squats right now.", cat: "fitness", diff: "easy", xp: 10, timeLimit: 0 },
  { id: 2, text: "Hold a solid plank position for 90 seconds.", cat: "fitness", diff: "easy", xp: 15, timeLimit: 90 },
  { id: 3, text: "Drink a full large glass of warm water and skip all sugary beverages today.", cat: "fitness", diff: "medium", xp: 20, timeLimit: 0 },
  { id: 4, text: "Take a cold shower for at least 2 minutes.", cat: "fitness", diff: "hard", xp: 40, timeLimit: 120 },
  { id: 5, text: "Complete a brisk 20-minute power walk outside.", cat: "fitness", diff: "medium", xp: 25, timeLimit: 0 },

  // Mindfulness & Mental Health
  { id: 6, text: "Sit in silent meditation for 5 minutes focusing on your breath.", cat: "mind", diff: "easy", xp: 15, timeLimit: 300 },
  { id: 7, text: "Write down 3 specific things you are grateful for today and why.", cat: "mind", diff: "easy", xp: 10, timeLimit: 0 },
  { id: 8, text: "Unplug from all social media and news apps for the next 4 hours.", cat: "mind", diff: "hard", xp: 35, timeLimit: 0 },
  { id: 9, text: "Declutter and wipe down your main work desk space completely.", cat: "mind", diff: "easy", xp: 15, timeLimit: 0 },

  // Learning & Creativity
  { id: 10, text: "Doodle or sketch a quick drawing of a fictional creature.", cat: "creative", diff: "easy", xp: 10, timeLimit: 0 },
  { id: 11, text: "Read exactly 10 pages of a physical book or educational article.", cat: "creative", diff: "medium", xp: 20, timeLimit: 0 },
  { id: 12, text: "Learn 5 new useful vocabulary words in a foreign language.", cat: "creative", diff: "medium", xp: 20, timeLimit: 0 },
  { id: 13, text: "Write a short 4-line poem about the weather outside.", cat: "creative", diff: "easy", xp: 15, timeLimit: 0 },

  // Social & Kindness
  { id: 14, text: "Send a sincere appreciation text to a friend you haven't spoken to in a month.", cat: "social", diff: "easy", xp: 15, timeLimit: 0 },
  { id: 15, text: "Give a genuine, specific compliment to a colleague or stranger today.", cat: "social", diff: "easy", xp: 10, timeLimit: 0 },
  { id: 16, text: "Call a family member just to check in and chat for 10 minutes.", cat: "social", diff: "medium", xp: 25, timeLimit: 600 },
  
  // Comfort Zone / Adventure
  { id: 17, text: "Eat or drink something you've never tried before today.", cat: "adventure", diff: "medium", xp: 25, timeLimit: 0 },
  { id: 18, text: "Rearrange the layout of at least 3 furniture pieces in your room.", cat: "adventure", diff: "medium", xp: 30, timeLimit: 0 },
  { id: 19, text: "Spend 15 minutes planning your next dream travel itinerary in detail.", cat: "adventure", diff: "easy", xp: 15, timeLimit: 0 },
];

const categoryInfo = {
  all: { label: "All Categories", icon: Activity, color: "text-slate-500" },
  fitness: { label: "Health & Fitness", icon: Dumbbell, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  mind: { label: "Mindfulness", icon: Heart, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  creative: { label: "Learning & Art", icon: BookOpen, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  social: { label: "Kindness & Social", icon: Smile, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  adventure: { label: "Adventure", icon: Compass, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20" },
};

const achievementsConfig = [
  { id: "initiate", name: "Initiator", desc: "Complete your first challenge", xpRequired: 1, icon: "🎯" },
  { id: "adventurer", name: "Adventurer", desc: "Reach 100 total XP", xpRequired: 100, icon: "⚔️" },
  { id: "habitMaster", name: "Habit Master", desc: "Reach 300 total XP", xpRequired: 300, icon: "👑" },
  { id: "streakSeeker", name: "Streak Seeker", desc: "Achieve a 3-day completion streak", streakRequired: 3, icon: "🔥" },
  { id: "comfortBreaker", name: "Comfort Breaker", desc: "Complete 3 Adventure challenges", catRequired: { cat: "adventure", count: 3 }, icon: "🏔️" },
];

// Local calendar-day key (YYYY-MM-DD) in the user's own timezone, so a
// completion just before midnight and one just after still count as
// different days.
const getDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const daysBetweenKeys = (fromKey, toKey) => {
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T00:00:00`);
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
};

export default function MainComponent() {
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedDiff, setSelectedDiff] = useState("all"); // all, easy, medium, hard
  
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const catRef = useRef(null);
  const diffRef = useRef(null);

  // Rolling state
  const [rolling, setRolling] = useState(false);
  const [rolledChallenge, setRolledChallenge] = useState(null);
  
  // Active tracking
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedList, setCompletedList] = useState([]);
  
  // User stats
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [lastCompletedDate, setLastCompletedDate] = useState(null);

  // Countdown timer states — keyed by challenge id so each active
  // challenge tracks its own { timeLeft, active, completed } independently.
  const [timers, setTimers] = useState({});
  const timerRefs = useRef({});

  // Load state on mount and register click-outside
  useEffect(() => {
    const savedXp = localStorage.getItem("altft_life_xp");
    const savedStreak = localStorage.getItem("altft_life_streak");
    const savedActive = localStorage.getItem("altft_life_active");
    const savedCompleted = localStorage.getItem("altft_life_completed");
    const savedCatCounts = localStorage.getItem("altft_life_cat_counts");
    const savedLastCompletedDate = localStorage.getItem("altft_life_last_completed_date");

    if (savedXp) setXp(parseInt(savedXp));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedActive) setActiveChallenges(JSON.parse(savedActive));
    if (savedCompleted) setCompletedList(JSON.parse(savedCompleted));
    if (savedCatCounts) setCategoryCounts(JSON.parse(savedCatCounts));
    if (savedLastCompletedDate) setLastCompletedDate(savedLastCompletedDate);

    const handleClick = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) {
        setIsCatOpen(false);
      }
      if (diffRef.current && !diffRef.current.contains(e.target)) {
        setIsDiffOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Save states helper. nextLastCompletedDate is optional: omit it to leave
  // the stored value untouched, or pass null to clear it (reset).
  const saveUserData = (nextXp, nextStreak, nextActive, nextCompleted, nextCatCounts, nextLastCompletedDate) => {
    localStorage.setItem("altft_life_xp", nextXp);
    localStorage.setItem("altft_life_streak", nextStreak);
    localStorage.setItem("altft_life_active", JSON.stringify(nextActive));
    localStorage.setItem("altft_life_completed", JSON.stringify(nextCompleted));
    localStorage.setItem("altft_life_cat_counts", JSON.stringify(nextCatCounts));
    if (nextLastCompletedDate !== undefined) {
      if (nextLastCompletedDate === null) {
        localStorage.removeItem("altft_life_last_completed_date");
      } else {
        localStorage.setItem("altft_life_last_completed_date", nextLastCompletedDate);
      }
    }
  };

  const handleRollChallenge = () => {
    setRolling(true);
    setRolledChallenge(null);

    // Filter available challenges based on inputs
    const filtered = CHALLENGES.filter((c) => {
      const catMatch = selectedCat === "all" || c.cat === selectedCat;
      const diffMatch = selectedDiff === "all" || c.diff === selectedDiff;
      // Do not roll active challenges
      const notActive = !activeChallenges.some((active) => active.id === c.id);
      return catMatch && diffMatch && notActive;
    });

    if (filtered.length === 0) {
      alert("All challenges in this category have been added. Try selecting different options!");
      setRolling(false);
      return;
    }

    // Spin animation emulation
    let counter = 0;
    const interval = setInterval(() => {
      const tempItem = filtered[Math.floor(Math.random() * filtered.length)];
      setRolledChallenge(tempItem);
      counter++;
      if (counter > 8) {
        clearInterval(interval);
        setRolling(false);
      }
    }, 150);
  };

  const handleAcceptChallenge = () => {
    if (!rolledChallenge) return;
    
    // Add to active challenges
    const nextActive = [
      ...activeChallenges,
      { ...rolledChallenge, acceptedAt: new Date().toISOString() }
    ];
    setActiveChallenges(nextActive);
    setRolledChallenge(null);

    saveUserData(xp, streak, nextActive, completedList, categoryCounts);
  };

  const clearChallengeTimer = (challengeId) => {
    if (timerRefs.current[challengeId]) {
      clearInterval(timerRefs.current[challengeId]);
      delete timerRefs.current[challengeId];
    }
    setTimers((prev) => {
      if (!(challengeId in prev)) return prev;
      const next = { ...prev };
      delete next[challengeId];
      return next;
    });
  };

  const handleCompleteChallenge = (challenge) => {
    // Remove from active
    const nextActive = activeChallenges.filter((item) => item.id !== challenge.id);

    // Add to completed logs
    const nextCompleted = [
      ...completedList,
      { ...challenge, completedAt: new Date().toISOString() }
    ];
    setCompletedList(nextCompleted);

    // Update XP
    const nextXp = xp + challenge.xp;

    // Real day-based streak: same calendar day keeps the streak as-is,
    // the very next calendar day extends it, any bigger gap resets it to 1.
    const todayKey = getDateKey(new Date());
    let nextStreak = 1;
    if (lastCompletedDate === todayKey) {
      nextStreak = streak > 0 ? streak : 1;
    } else if (lastCompletedDate) {
      const gapDays = daysBetweenKeys(lastCompletedDate, todayKey);
      nextStreak = gapDays === 1 ? streak + 1 : 1;
    }

    // Update category counts
    const nextCatCounts = {
      ...categoryCounts,
      [challenge.cat]: (categoryCounts[challenge.cat] || 0) + 1
    };
    setCategoryCounts(nextCatCounts);

    // Save and clear this challenge's own timer
    clearChallengeTimer(challenge.id);
    setActiveChallenges(nextActive);
    setXp(nextXp);
    setStreak(nextStreak);
    setLastCompletedDate(todayKey);
    saveUserData(nextXp, nextStreak, nextActive, nextCompleted, nextCatCounts, todayKey);
  };

  const handleCancelChallenge = (challengeId) => {
    const nextActive = activeChallenges.filter((item) => item.id !== challengeId);
    setActiveChallenges(nextActive);
    clearChallengeTimer(challengeId);
    saveUserData(xp, streak, nextActive, completedList, categoryCounts);
  };

  const handleResetProgress = () => {
    if (confirm("Are you sure you want to reset all your score, streak, and achievements progress? This cannot be undone.")) {
      Object.values(timerRefs.current).forEach((intervalId) => clearInterval(intervalId));
      timerRefs.current = {};
      setTimers({});
      setXp(0);
      setStreak(0);
      setActiveChallenges([]);
      setCompletedList([]);
      setCategoryCounts({});
      setLastCompletedDate(null);
      saveUserData(0, 0, [], [], {}, null);
    }
  };

  // Clear any still-running per-challenge timers when the component unmounts
  useEffect(() => {
    return () => {
      Object.values(timerRefs.current).forEach((intervalId) => clearInterval(intervalId));
    };
  }, []);

  const handleStartTimer = (challengeId, seconds) => {
    if (timerRefs.current[challengeId]) {
      clearInterval(timerRefs.current[challengeId]);
    }
    setTimers((prev) => ({
      ...prev,
      [challengeId]: { timeLeft: seconds, active: true, completed: false },
    }));
    timerRefs.current[challengeId] = setInterval(() => {
      setTimers((prev) => {
        const current = prev[challengeId];
        if (!current) return prev;
        const nextTimeLeft = current.timeLeft - 1;
        if (nextTimeLeft <= 0) {
          clearInterval(timerRefs.current[challengeId]);
          delete timerRefs.current[challengeId];
          return { ...prev, [challengeId]: { timeLeft: 0, active: false, completed: true } };
        }
        return { ...prev, [challengeId]: { ...current, timeLeft: nextTimeLeft } };
      });
    }, 1000);
  };

  const handleStopTimer = (challengeId) => {
    if (timerRefs.current[challengeId]) {
      clearInterval(timerRefs.current[challengeId]);
      delete timerRefs.current[challengeId];
    }
    setTimers((prev) => ({
      ...prev,
      [challengeId]: { ...prev[challengeId], active: false },
    }));
  };

  // Achievement unlock logic
  const checkAchievementUnlocked = (badge) => {
    if (badge.xpRequired && xp >= badge.xpRequired) return true;
    if (badge.streakRequired && streak >= badge.streakRequired) return true;
    if (badge.catRequired) {
      const count = categoryCounts[badge.catRequired.cat] || 0;
      if (count >= badge.catRequired.count) return true;
    }
    // Specially unlock the first completed task
    if (badge.id === "initiate" && completedList.length >= 1) return true;
    return false;
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-(--page)">
      
      {/* Title Header */}
      <div className="mb-8 text-center border-b border-(--border) pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-400 mb-2">
          <Activity className="h-8 w-8 text-teal-500 shrink-0" /> Random Life Challenge
        </h1>
        <p className="mt-2 text-md text-slate-600 dark:text-slate-300">
          Step out of your comfort zone. Roll a random challenge, track completions, and earn XP milestones.
        </p>
      </div>

      {/* Stats Dashboard Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Lifetime XP */}
        <div className="bg-(--surface) border border-(--border) p-4 rounded-xl shadow-sm text-center">
          <Zap className="h-6 w-6 text-teal-500 mx-auto mb-1" />
          <div className="text-2xl font-black text-(--foreground)">{xp}</div>
          <div className="text-xs font-bold text-slate-500">Lifetime XP</div>
        </div>

        {/* Current Streak */}
        <div className="bg-(--surface) border border-(--border) p-4 rounded-xl shadow-sm text-center">
          <Trophy className="h-6 w-6 text-amber-500 mx-auto mb-1 animate-pulse" />
          <div className="text-2xl font-black text-(--foreground)">{streak}</div>
          <div className="text-xs font-bold text-slate-500">Streak Count</div>
        </div>

        {/* Completed Challenges */}
        <div className="bg-(--surface) border border-(--border) p-4 rounded-xl shadow-sm text-center">
          <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
          <div className="text-2xl font-black text-(--foreground)">{completedList.length}</div>
          <div className="text-xs font-bold text-slate-500">Completed</div>
        </div>

        {/* Level indicator */}
        <div className="bg-(--surface) border border-(--border) p-4 rounded-xl shadow-sm text-center">
          <Award className="h-6 w-6 text-purple-500 mx-auto mb-1" />
          <div className="text-2xl font-black text-(--foreground)">
            {Math.floor(xp / 100) + 1}
          </div>
          <div className="text-xs font-bold text-slate-500">Current Level</div>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Roll/Spinner & Filters (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-(--surface) border border-(--border) p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-(--foreground) flex items-center gap-1.5 text-xs uppercase tracking-wider border-b border-(--border) pb-3">
              <Sparkles className="h-4.5 w-4.5 text-teal-500" /> Spin the Challenge Selector
            </h3>

            {/* Filter selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Dropdown */}
              <div className="relative" ref={catRef}>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Category</label>
                <button
                  type="button"
                  onClick={() => setIsCatOpen(!isCatOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-(--border) bg-(--page) text-xs font-semibold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2">
                    {(() => {
                      const Info = categoryInfo[selectedCat] || categoryInfo.all;
                      const IconComp = Info.icon;
                      return (
                        <>
                          <IconComp className="h-3.5 w-3.5 text-teal-500" />
                          <span>{Info.label}</span>
                        </>
                      );
                    })()}
                  </span>
                  <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isCatOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isCatOpen && (
                  <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-(--surface) border border-(--border) rounded-lg shadow-lg z-30 py-1 animate-in fade-in zoom-in-95 duration-150">
                    {Object.entries(categoryInfo).map(([key, info]) => {
                      const IconComp = info.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedCat(key);
                            setIsCatOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs transition hover:bg-teal-500/10 flex items-center gap-2 ${
                            selectedCat === key ? "bg-teal-500/5 font-bold text-teal-500" : "text-(--foreground)"
                          }`}
                        >
                          <IconComp className="h-3.5 w-3.5" />
                          {info.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Difficulty Dropdown */}
              <div className="relative" ref={diffRef}>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">Difficulty</label>
                <button
                  type="button"
                  onClick={() => setIsDiffOpen(!isDiffOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-(--border) bg-(--page) text-xs font-semibold text-(--foreground) focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5 text-teal-500" />
                    <span>
                      {selectedDiff === "all" && "All Difficulty Levels"}
                      {selectedDiff === "easy" && "Easy (10-15 XP)"}
                      {selectedDiff === "medium" && "Medium (20-30 XP)"}
                      {selectedDiff === "hard" && "Hard (35-50 XP)"}
                    </span>
                  </span>
                  <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDiffOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDiffOpen && (
                  <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-(--surface) border border-(--border) rounded-lg shadow-lg z-30 py-1 animate-in fade-in zoom-in-95 duration-150">
                    {[
                      { key: "all", label: "All Difficulty Levels" },
                      { key: "easy", label: "Easy (10-15 XP)" },
                      { key: "medium", label: "Medium (20-30 XP)" },
                      { key: "hard", label: "Hard (35-50 XP)" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setSelectedDiff(item.key);
                          setIsDiffOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition hover:bg-teal-500/10 flex items-center gap-2 ${
                          selectedDiff === item.key ? "bg-teal-500/5 font-bold text-teal-500" : "text-(--foreground)"
                        }`}
                      >
                        <Trophy className="h-3.5 w-3.5" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleRollChallenge}
              disabled={rolling}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5 active:scale-98"
            >
              {rolling ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 animate-pulse" />}
              {rolling ? "Rolling Wheel..." : "Spin / Roll Challenge"}
            </button>

            {/* Rolled Challenge Card Display */}
            {rolledChallenge && (
              <div className="mt-4 border-2 border-teal-500/40 bg-teal-500/5 rounded-xl p-5 text-center space-y-4 animate-fade-in">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-600 border border-teal-500/20">
                  {rolledChallenge.cat} • {rolledChallenge.diff}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-(--foreground) leading-relaxed">
                  "{rolledChallenge.text}"
                </h3>
                <div className="flex justify-center items-center gap-4 text-xs font-bold text-slate-500">
                  <span>Award: <span className="text-teal-600">+{rolledChallenge.xp} XP</span></span>
                  {rolledChallenge.timeLimit > 0 && (
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {rolledChallenge.timeLimit}s timer</span>
                  )}
                </div>
                
                <button
                  onClick={handleAcceptChallenge}
                  className="px-8 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
                >
                  Accept Challenge
                </button>
              </div>
            )}
          </div>

          {/* Active accepted challenges list */}
          <div className="bg-(--surface) border border-(--border) p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-(--foreground) flex items-center gap-1.5 text-xs uppercase tracking-wider border-b border-(--border) pb-3">
              <Calendar className="h-4.5 w-4.5 text-teal-500" /> Active accepted challenges
            </h3>

            {activeChallenges.length > 0 ? (
              <div className="space-y-4">
                {activeChallenges.map((item) => {
                  const Info = categoryInfo[item.cat] || categoryInfo.all;
                  const IconComp = Info.icon;
                  const timerState = timers[item.id];
                  return (
                    <div
                      key={item.id}
                      className="bg-(--page) border border-(--border) rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border ${Info.color}`}>
                            <IconComp className="h-3 w-3" /> {Info.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">{item.diff}</span>
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-(--foreground)">{item.text}</p>
                        
                        {/* Built-in timer view — state is keyed by this challenge's id */}
                        {item.timeLimit > 0 && (
                          <div className="flex items-center gap-2 pt-1.5">
                            {timerState?.active ? (
                              <button
                                onClick={() => handleStopTimer(item.id)}
                                className="px-2 py-1 bg-amber-500 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Stop ({timerState.timeLeft}s)
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartTimer(item.id, item.timeLimit)}
                                className="px-2.5 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded text-[10px] font-bold cursor-pointer inline-flex items-center gap-1"
                              >
                                <Play className="h-3 w-3" /> Start {item.timeLimit}s Timer
                              </button>
                            )}
                            {timerState?.completed && (
                              <span className="text-[10px] text-emerald-500 font-bold">Timer Complete!</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleCancelChallenge(item.id)}
                          className="flex-1 md:flex-none p-1.5 border border-red-500/20 hover:border-red-500/50 rounded text-red-500 hover:bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mx-auto" />
                        </button>
                        <button
                          onClick={() => handleCompleteChallenge(item)}
                          className="flex-2 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="h-3.5 w-3.5" /> Complete (+{item.xp} XP)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No active challenges. Roll a challenge above and accept it to start tracking!</p>
            )}
          </div>
        </div>

        {/* Achievements list (Right column) */}
        <div className="space-y-6">
          
          <div className="bg-(--surface) border border-(--border) p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-(--border) pb-3">
              <h3 className="font-bold text-(--foreground) flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Award className="h-4.5 w-4.5 text-teal-500" /> Unlock Achievements
              </h3>
              <button
                onClick={handleResetProgress}
                className="text-[10px] font-bold text-red-500 hover:underline"
              >
                Reset
              </button>
            </div>

            <div className="space-y-3">
              {achievementsConfig.map((item) => {
                const unlocked = checkAchievementUnlocked(item);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      unlocked
                        ? "bg-teal-500/5 border-teal-500/30 text-(--foreground)"
                        : "opacity-40 border-(--border) text-slate-500"
                    }`}
                  >
                    <span className="text-2xl select-none">{item.icon}</span>
                    <div>
                      <h4 className="text-xs font-bold">{item.name}</h4>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                    </div>
                    {unlocked && (
                      <span className="ml-auto text-[10px] bg-teal-500/10 text-teal-600 px-1.5 py-0.5 rounded font-black uppercase tracking-wide">Unlocked</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
