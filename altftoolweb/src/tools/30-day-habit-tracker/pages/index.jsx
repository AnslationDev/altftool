"use client";

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Trash2,
  Sparkles,
  TrendingUp,
  Download,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Edit3,
  Award,
  Flame,
  RotateCcw,
  BookOpen,
  Droplet,
  Activity,
  Smile,
  Laptop,
  Check,
  ChevronRight,
  Save,
  X
} from 'lucide-react';
import Description from '../components/Description';

const TEMPLATES = [
  {
    name: "5 AM Club",
    category: "Routine",
    description: "Wake up at 5:00 AM every single morning to plan, exercise, and win the day.",
    reward: "A premium coffee maker / gourmet coffee beans",
    icon: <Laptop className="w-5 h-5 text-blue-500" />
  },
  {
    name: "Daily Reading",
    category: "Learning",
    description: "Read 15 pages of non-fiction, self-help, or educational books.",
    reward: "Purchase 3 new books from my wishlist",
    icon: <BookOpen className="w-5 h-5 text-green-500" />
  },
  {
    name: "Drink 3L Water",
    category: "Health",
    description: "Keep hydrated throughout the day by drinking at least 3 liters of fresh water.",
    reward: "Sleek smart hydration water bottle",
    icon: <Droplet className="w-5 h-5 text-sky-500" />
  },
  {
    name: "Gratitude Journal",
    category: "Mind",
    description: "Jot down 3 positive things, events, or people you are truly grateful for today.",
    reward: "Go on a weekend getaway or premium dining experience",
    icon: <Smile className="w-5 h-5 text-amber-500" />
  },
  {
    name: "Daily Coding Practice",
    category: "Learning",
    description: "Solve 1 algorithms problem or code a side-project feature for 45 minutes.",
    reward: "A new mechanical keyboard or tech gadget",
    icon: <Laptop className="w-5 h-5 text-purple-500" />
  }
];

export default function ToolHome() {
  const [habits, setHabits] = useState([]);
  const [selectedHabitId, setSelectedHabitId] = useState(null);

  // Custom Habit Form State
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitDesc, setNewHabitDesc] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('Health');
  const [newHabitReward, setNewHabitReward] = useState('');
  const [newHabitStartDate, setNewHabitStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Day Inspector State
  const [inspectingDayIndex, setInspectingDayIndex] = useState(null);
  const [inspectingNote, setInspectingNote] = useState('');
  const [inspectingStatus, setInspectingStatus] = useState('pending');

  // Load from local storage
  useEffect(() => {
    const savedHabits = localStorage.getItem('30day_habits');
    if (savedHabits) {
      try {
        const parsed = JSON.parse(savedHabits);
        setHabits(parsed);
        if (parsed.length > 0) {
          setSelectedHabitId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to load habits", e);
      }
    } else {
      // Seed with one default template so the page isn't blank
      const defaultHabit = createHabitFromTemplate(TEMPLATES[1]);
      setHabits([defaultHabit]);
      setSelectedHabitId(defaultHabit.id);
      localStorage.setItem('30day_habits', JSON.stringify([defaultHabit]));
    }
  }, []);

  // Save to local storage helper
  const saveHabitsToStorage = (updatedHabits) => {
    setHabits(updatedHabits);
    localStorage.setItem('30day_habits', JSON.stringify(updatedHabits));
  };

  const getTodayDayIndex = (startDateStr) => {
    if (!startDateStr) return 0;
    const start = new Date(startDateStr);
    const today = new Date();
    start.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const createHabitFromTemplate = (tpl) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const initialDays = Array.from({ length: 30 }, (_, i) => ({
      dayNumber: i + 1,
      status: 'pending',
      note: '',
      timestamp: null
    }));

    return {
      id: 'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: tpl.name,
      category: tpl.category,
      description: tpl.description,
      reward: tpl.reward,
      startDate: todayStr,
      days: initialDays
    };
  };

  const handleAddTemplate = (tpl) => {
    const newH = createHabitFromTemplate(tpl);
    const updated = [newH, ...habits];
    saveHabitsToStorage(updated);
    setSelectedHabitId(newH.id);
  };

  const handleCreateCustomHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const initialDays = Array.from({ length: 30 }, (_, i) => ({
      dayNumber: i + 1,
      status: 'pending',
      note: '',
      timestamp: null
    }));

    const newH = {
      id: 'habit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: newHabitName,
      category: newHabitCategory,
      description: newHabitDesc,
      reward: newHabitReward || 'A self-care relaxation day',
      startDate: newHabitStartDate,
      days: initialDays
    };

    const updated = [newH, ...habits];
    saveHabitsToStorage(updated);
    setSelectedHabitId(newH.id);

    // Reset Form
    setNewHabitName('');
    setNewHabitDesc('');
    setNewHabitReward('');
    setIsAddModalOpen(false);
  };

  const handleDeleteHabit = (id) => {
    if (!window.confirm("Are you sure you want to delete this habit and reset all progress?")) {
      return;
    }
    const updated = habits.filter(h => h.id !== id);
    saveHabitsToStorage(updated);
    if (updated.length > 0) {
      setSelectedHabitId(updated[0].id);
    } else {
      setSelectedHabitId(null);
    }
  };

  const handleResetHabit = (id) => {
    if (!window.confirm("Are you sure you want to reset all 30 days of this habit back to pending?")) {
      return;
    }
    const updated = habits.map(h => {
      if (h.id === id) {
        return {
          ...h,
          days: h.days.map(d => ({ ...d, status: 'pending', note: '', timestamp: null }))
        };
      }
      return h;
    });
    saveHabitsToStorage(updated);
  };

  const activeHabit = habits.find(h => h.id === selectedHabitId) || null;

  // Streak & Statistics Calculations
  const getStats = (habit) => {
    if (!habit) return { completed: 0, skipped: 0, pending: 30, rate: 0, currentStreak: 0, bestStreak: 0 };

    let completed = 0;
    let skipped = 0;
    let pending = 0;

    habit.days.forEach(d => {
      if (d.status === 'completed') completed++;
      else if (d.status === 'skipped') skipped++;
      else pending++;
    });

    const rate = Math.round((completed / 30) * 100);

    // Streaks algorithms
    let maxStreak = 0;
    let tempStreak = 0;
    const todayIdx = getTodayDayIndex(habit.startDate);

    // 1. Best Streak: Max consecutive completed days without any breaks or skips
    for (let i = 0; i < habit.days.length; i++) {
      if (habit.days[i].status === 'completed') {
        tempStreak++;
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
      } else {
        tempStreak = 0; // Any skipped or pending day resets the streak
      }
    }

    // 2. Current Streak: Consecutive completed days counting backward from the latest completed day
    let currentStreak = 0;
    let latestCompletedIdx = -1;
    for (let i = 29; i >= 0; i--) {
      if (habit.days[i].status === 'completed') {
        latestCompletedIdx = i;
        break;
      }
    }

    if (latestCompletedIdx !== -1) {
      // If the latest completed day is today, yesterday, or in the future (manual markings)
      if (latestCompletedIdx >= todayIdx - 1) {
        for (let i = latestCompletedIdx; i >= 0; i--) {
          if (habit.days[i].status === 'completed') {
            currentStreak++;
          } else {
            break; // Broken by pending or skipped
          }
        }
      }
    }

    return { completed, skipped, pending, rate, currentStreak, bestStreak: maxStreak };
  };

  const stats = getStats(activeHabit);

  // Quick state update for a day
  const updateDayStatusDirect = (dayIndex, nextStatus) => {
    if (!activeHabit) return;
    const updated = habits.map(h => {
      if (h.id === activeHabit.id) {
        const newDays = [...h.days];
        newDays[dayIndex] = {
          ...newDays[dayIndex],
          status: nextStatus,
          timestamp: new Date().toISOString()
        };
        return { ...h, days: newDays };
      }
      return h;
    });
    saveHabitsToStorage(updated);
  };

  // Batch mark a specific day completed for all habits
  const markDayDoneForAllHabits = (dayIndex) => {
    if (habits.length === 0) return;
    if (!window.confirm(`Are you sure you want to mark Day ${dayIndex + 1} as completed for ALL habits?`)) {
      return;
    }
    const updated = habits.map(h => {
      const newDays = [...h.days];
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        status: 'completed',
        timestamp: new Date().toISOString()
      };
      return { ...h, days: newDays };
    });
    saveHabitsToStorage(updated);
  };

  // Day Inspector Modal actions
  const openDayInspector = (index) => {
    if (!activeHabit) return;
    const day = activeHabit.days[index];
    setInspectingDayIndex(index);
    setInspectingNote(day.note || '');
    setInspectingStatus(day.status);
    setIsDayModalOpen(true);
  };

  const handleSaveDayDetails = () => {
    if (!activeHabit || inspectingDayIndex === null) return;
    const updated = habits.map(h => {
      if (h.id === activeHabit.id) {
        const newDays = [...h.days];
        newDays[inspectingDayIndex] = {
          ...newDays[inspectingDayIndex],
          status: inspectingStatus,
          note: inspectingNote,
          timestamp: new Date().toISOString()
        };
        return { ...h, days: newDays };
      }
      return h;
    });
    saveHabitsToStorage(updated);
    setIsDayModalOpen(false);
  };

  // Download Comprehensive Progress Report
  const downloadReport = () => {
    if (!activeHabit) return;

    const endD = new Date(activeHabit.startDate);
    endD.setDate(endD.getDate() + 29);
    const endStr = endD.toISOString().split('T')[0];

    let report = `================================================
30-DAY HABIT PROGRESS JOURNAL
Generated on: ${new Date().toLocaleString()}
================================================

HABIT DETAILS:
------------------------------------------------
- Habit Name:   ${activeHabit.name}
- Category:     ${activeHabit.category}
- Description:  ${activeHabit.description || "N/A"}
- Start Date:   ${activeHabit.startDate}
- End Date:     ${endStr}
- Target Reward: ${activeHabit.reward}

METRICS SUMMARY:
------------------------------------------------
- Total Completed: ${stats.completed} / 30 Days
- Total Skipped:   ${stats.skipped} / 30 Days
- Completion Rate: ${stats.rate}%
- Current Streak:  ${stats.currentStreak} Days
- Longest Streak:  ${stats.bestStreak} Days
- Habit Strength:  ${stats.rate >= 90 ? '🔥 Legendary' : stats.rate >= 75 ? '⭐ Strong' : stats.rate >= 50 ? '📈 Developing' : '🌱 Just Starting'}

DAILY DETAILED LOG:
------------------------------------------------\n`;

    activeHabit.days.forEach(d => {
      const statusIcon = d.status === 'completed' ? '[X] Completed' : d.status === 'skipped' ? '[-] Skipped' : '[ ] Pending';
      report += `Day ${d.dayNumber.toString().padStart(2, ' ')}: ${statusIcon.padEnd(14, ' ')} | Note: ${d.note || "No comments written"}\n`;
    });

    report += `\n================================================
"Do not break the chain!" - Powered by 30-Day Habit Tracker
================================================`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Habit_Report_${activeHabit.name.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Inline dynamic SVG sparkline to show completion trend
  const renderTrendLine = () => {
    if (!activeHabit) return null;
    let accumulated = 0;
    const points = activeHabit.days.map((d, i) => {
      if (d.status === 'completed') accumulated++;
      const x = (i / 29) * 100; // normalized 0-100 x-axis
      const y = 50 - (accumulated / 30) * 40; // normalized 10-50 y-axis (inverted for screen coords)
      return `${x},${y}`;
    });

    return (
      <svg viewBox="0 0 100 55" className="w-full h-24 overflow-visible">
        <defs>
          <linearGradient id="gradientTrend" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        <line x1="0" y1="50" x2="100" y2="50" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="0" y1="30" x2="100" y2="30" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1="0" y1="10" x2="100" y2="10" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,2" />

        {/* Area fill */}
        <path
          d={`M 0,50 L ${points.map(p => p.split(',').join(' ')).join(' L ')} L 100,50 Z`}
          fill="url(#gradientTrend)"
          className="transition-all duration-500 ease-in-out"
        />
        {/* Line */}
        <polyline
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points.join(' ')}
          className="transition-all duration-500 ease-in-out"
        />
        {/* Start / End dots */}
        <circle cx="0" cy="50" r="2.5" fill="var(--primary)" />
        <circle cx="100" cy={50 - (accumulated / 30) * 40} r="2.5" fill="#06b6d4" />
      </svg>
    );
  };

  // Compact dynamic SVG sparkline for small cards
  const renderTrendLineCompact = () => {
    if (!activeHabit) return null;
    let accumulated = 0;
    const points = activeHabit.days.map((d, i) => {
      if (d.status === 'completed') accumulated++;
      const x = (i / 29) * 100; // normalized 0-100 x-axis
      const y = 26 - (accumulated / 30) * 22; // normalized 4-26 y-axis (inverted for screen coords)
      return `${x},${y}`;
    });

    return (
      <svg viewBox="0 0 100 28" className="w-full h-12 overflow-visible">
        <defs>
          <linearGradient id="gradientTrendCompact" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        {/* Background micro gridlines */}
        <line x1="0" y1="6" x2="100" y2="6" stroke="var(--border)" strokeWidth="0.25" strokeDasharray="1,2" opacity="0.4" />
        <line x1="0" y1="16" x2="100" y2="16" stroke="var(--border)" strokeWidth="0.25" strokeDasharray="1,2" opacity="0.4" />

        {/* Area fill */}
        <path
          d={`M 0,26 L ${points.map(p => p.split(',').join(' ')).join(' L ')} L 100,26 Z`}
          fill="url(#gradientTrendCompact)"
          className="transition-all duration-500 ease-in-out"
        />
        {/* Line */}
        <polyline
          fill="none"
          stroke="var(--primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points.join(' ')}
          className="transition-all duration-500 ease-in-out"
        />
        {/* End dot glow pulse */}
        <circle cx="100" cy={26 - (accumulated / 30) * 22} r="3" fill="#06b6d4" opacity="0.4" className="animate-pulse" />
        <circle cx="100" cy={26 - (accumulated / 30) * 22} r="1.5" fill="#06b6d4" />
      </svg>
    );
  };

  const todayIndex = activeHabit ? getTodayDayIndex(activeHabit.startDate) : 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <CalendarDays className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">30-Day Habit Tracker</h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Productivity</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Form life-changing habits, maintain consistency, and claim your rewards over 30 days.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Habit Tracking", "Streak Counter", "Progress Report"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CalendarDays className="h-3 w-3 text-primary" />{item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* QUICK PRESETS SECTION (Full Width Card at the absolute top) */}
        <div className="w-full rounded-3xl p-6 border bg-[var(--card)] border-[var(--border)] shadow-md mb-8 transition-all hover:shadow-lg duration-300">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
            <h3 className="text-md font-black uppercase tracking-wider text-[var(--primary)] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--primary)]" /> Quick Presets
            </h3>
            <span className="text-xs text-[var(--muted-foreground)] font-bold">
              Bootstrap a new 30-day journey instantly
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
            {TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                onClick={() => handleAddTemplate(tpl)}
                className="flex flex-col justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] active:scale-98 text-left transition-all group relative overflow-hidden flex-shrink-0 w-52 snap-start"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="p-2 rounded-xl transition-all"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                    }}
                  >
                    {tpl.icon}
                  </div>
                  <p className="text-xs font-black text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">{tpl.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-[var(--muted-foreground)] font-bold tracking-wider uppercase">{tpl.category}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed italic">{tpl.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-[var(--border)] text-[9px] text-[var(--muted-foreground)] font-bold flex items-center gap-1">
                  <Award className="w-3 h-3 text-amber-500" /> {tpl.reward.slice(0, 18)}...
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* HABITS LIBRARY SECTION (Full Width Card below Presets) */}
        <div className="w-full rounded-3xl p-6 border bg-[var(--card)] border-[var(--border)] shadow-md mb-8 transition-all hover:shadow-lg duration-300">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[var(--primary)]" />
              <h3 className="text-md font-black uppercase tracking-wider text-[var(--primary)]">
                Active Habits Library
              </h3>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] active:scale-95 transition-all text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Custom Habit
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-12 text-[var(--muted-foreground)] bg-[var(--background)] rounded-2xl border border-dashed border-[var(--border)]">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-40 text-[var(--secondary)] animate-bounce" />
              <p className="text-sm font-bold">No active habits in your library.</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Select a quick preset above or create a custom one to begin your transformation!</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
              {habits.map((h) => {
                const hStats = getStats(h);
                const isSelected = h.id === selectedHabitId;
                return (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHabitId(h.id)}
                    className={`relative p-5 rounded-2xl cursor-pointer border transition-all duration-300 flex flex-col justify-between group overflow-hidden flex-shrink-0 w-[280px] snap-start ${
                      isSelected
                        ? 'bg-[var(--background)] shadow-sm'
                        : 'bg-[var(--muted)] hover:bg-[var(--background)]'
                    }`}
                    style={{
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      borderWidth: isSelected ? '2px' : '1px'
                    }}
                  >
                    {/* Glowing highlight indicator for selected item */}
                    {isSelected && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--primary)]"></div>
                    )}

                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--primary)]">
                          {h.category}
                        </span>
                        <h4 className="text-md font-black text-[var(--foreground)] truncate mt-0.5 group-hover:text-[var(--primary)] transition-colors">
                          {h.name}
                        </h4>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHabit(h.id);
                        }}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-500 hover:bg-opacity-10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                        title="Delete Habit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2 mt-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-[var(--muted-foreground)]">
                        <span>Completion Rate</span>
                        <span className="text-[var(--foreground)]">{hStats.rate}%</span>
                      </div>
                      <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[var(--primary)] h-full rounded-full transition-all duration-1000"
                          style={{ width: `${hStats.rate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-[var(--border)] border-dashed">
                      <div className="flex gap-2">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]">
                          {hStats.completed}d done
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] flex items-center gap-0.5">
                          <Flame className="w-2.5 h-2.5 text-[var(--primary)]" /> {hStats.currentStreak}d streak
                        </span>
                      </div>

                      {isSelected ? (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Selected
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-wider text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors">
                          Select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTIVE WORKSPACE (Side-by-Side Layout) */}
        {activeHabit ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">

            {/* COLUMN 1: Active Habit Meta Details, Rewards & Today Check-in */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl p-6 sm:p-8 border bg-[var(--card)] border-[var(--border)] shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-[var(--primary)] text-white">
                      {activeHabit.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] font-bold">
                      Start Date: {activeHabit.startDate}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-black text-[var(--primary)] tracking-tight">{activeHabit.name}</h2>
                    <p className="text-sm text-[var(--muted-foreground)] font-medium mt-2 leading-relaxed">
                      {activeHabit.description || "Track your daily dedication towards this habit for 30 consecutive days."}
                    </p>
                  </div>

                  {/* Motivator reward panel */}
                  <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center gap-3">
                    <Award className="w-8 h-8 text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-[var(--foreground)] tracking-wider">30-Day Completion Reward:</p>
                      <p className="text-xs font-bold text-[var(--muted-foreground)] italic leading-snug mt-0.5">&quot;{activeHabit.reward || "A well-deserved self-care day"}&quot;</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4">


                  {/* Actions Row */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={downloadReport}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--border)] flex items-center gap-1.5 active:scale-95 transition-all"
                      title="Download Text Report"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Report
                    </button>
                    <button
                      onClick={() => handleResetHabit(activeHabit.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--muted)] border border-[var(--border)] text-red-500 hover:bg-red-500 hover:bg-opacity-10 flex items-center gap-1.5 active:scale-95 transition-all"
                      title="Reset Progress"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset Grid
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Selected Habit 30-Day Interactive Progress Grid */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl p-6 sm:p-8 border bg-[var(--card)] border-[var(--border)] shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-[var(--border)]">
                    <div>
                      <h3 className="text-md font-black uppercase tracking-wider text-[var(--primary)]">
                        30-Day Progress Grid
                      </h3>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5 font-medium">
                        Click on any block to mark its status and record reflection notes.
                      </p>
                    </div>

                    {/* Status legend indicators */}
                    <div className="flex gap-3 text-[10px] font-bold text-[var(--muted-foreground)] flex-wrap">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Done</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Skipped</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[var(--muted)] border border-[var(--border)]"></span> Pending</span>
                    </div>
                  </div>

                  {/* Grid cells */}
                  <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3">
                    {activeHabit.days.map((day, idx) => {
                      const isToday = idx === todayIndex;

                      let bgStyle = 'bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)]';
                      let statusIcon = null;

                      if (day.status === 'completed') {
                        bgStyle = 'bg-emerald-500 border-transparent text-white font-black shadow-sm';
                        statusIcon = <CheckCircle2 className="w-3.5 h-3.5 absolute top-1 right-1" />;
                      } else if (day.status === 'skipped') {
                        bgStyle = 'bg-orange-500 border-transparent text-white font-black shadow-sm';
                        statusIcon = <AlertCircle className="w-3.5 h-3.5 absolute top-1 right-1" />;
                      } else if (isToday) {
                        bgStyle = 'bg-[var(--background)] border-[var(--primary)] border-2 text-[var(--primary)] font-black animate-pulse-soft';
                      }

                      return (
                        <div
                          key={day.dayNumber}
                          onClick={() => openDayInspector(idx)}
                          className={`relative rounded-2xl h-16 flex flex-col items-center justify-center cursor-pointer border hover:-translate-y-1 hover:shadow-sm active:scale-95 transition-all ${bgStyle}`}
                        >
                          {statusIcon}
                          <span className="text-xs font-black">D{day.dayNumber}</span>
                          {day.note && (
                            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white opacity-80" title="Has daily reflection notes"></span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="text-[10px] text-[var(--muted-foreground)] font-bold italic text-right mt-6">
                  &quot;Consistency is what transforms average into excellence.&quot;
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="rounded-3xl p-12 border bg-[var(--card)] border-[var(--border)] text-center shadow-md mb-8">
            <CalendarDays className="w-16 h-16 mx-auto mb-4 text-[var(--secondary)] opacity-50" />
            <h3 className="text-xl font-black text-[var(--foreground)]">No Active Habit Selected</h3>
            <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-md mx-auto">
              Get started by selecting an existing habit from your library above, choosing a quick template, or creating a customized one.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-6 px-6 py-3 rounded-2xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" /> Create Custom Habit
            </button>
          </div>
        )}

        {/* UNIFIED HABITS PROGRESS MATRIX (Full Width Card) */}
        {habits.length > 0 && (
          <div className="w-full rounded-3xl p-6 border bg-[var(--card)] border-[var(--border)] shadow-md mb-8 transition-all hover:shadow-lg duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-2 border-b border-[var(--border)]">
              <div>
                <h3 className="text-md font-black uppercase tracking-wider text-[var(--primary)] flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[var(--primary)]" /> Unified Progress Matrix
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5 font-medium">
                  Track all habit trajectories. Click column headers D1–D30 to mark a specific day done for all active habits!
                </p>
              </div>

              {/* Status legend indicators */}
              <div className="flex gap-3 text-[10px] font-bold text-[var(--muted-foreground)]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Done</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Skipped</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[var(--muted)] border border-[var(--border)]"></span> Pending</span>
              </div>
            </div>

            {/* Scrolling matrix container to preserve layout and support mobile screens cleanly */}
            <div className="overflow-x-auto pb-4 pt-1">
              <div className="min-w-[1100px] space-y-2">

                {/* Header row with interactive D1-D30 buttons */}
                <div className="flex items-center">
                  {/* Left spacer column for habit name */}
                  <div className="w-44 flex-shrink-0 text-xs font-black uppercase tracking-wider text-[var(--muted-foreground)] pl-2">
                    Active Habits
                  </div>

                  {/* Grid for headers */}
                  <div
                    className="flex-1 gap-1.5"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}
                  >
                    {Array.from({ length: 30 }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => markDayDoneForAllHabits(idx)}
                        className="py-1 rounded-lg text-[10px] font-black text-[var(--muted-foreground)] hover:text-white hover:bg-[var(--primary)] border border-transparent hover:border-[var(--primary)] active:scale-90 transition-all text-center group relative cursor-pointer"
                        title={`Click to mark Day ${idx + 1} Done for all habits`}
                      >
                        D{idx + 1}
                        {/* Hover Tooltip */}
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 px-2 py-1 text-[8px] bg-[var(--foreground)] text-[var(--background)] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-md">
                          Mark all Done
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Habits matrix rows */}
                <div className="space-y-1.5">
                  {habits.map((habit) => {
                    const isSelected = habit.id === selectedHabitId;
                    return (
                      <div
                        key={habit.id}
                        className={`flex items-center py-2.5 px-2 rounded-xl transition-all border ${
                          isSelected
                            ? 'bg-[var(--background)] border-[var(--primary)] border-opacity-40'
                            : 'bg-[var(--muted)] border-transparent hover:bg-[var(--background)]'
                        }`}
                        onClick={() => setSelectedHabitId(habit.id)}
                      >
                        {/* Left column: Name & category */}
                        <div className="w-40 flex-shrink-0 min-w-0 pr-4 cursor-pointer">
                          <p className="text-xs font-black text-[var(--foreground)] truncate" title={habit.name}>
                            {habit.name}
                          </p>
                          <p className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-wider mt-0.5">
                            {habit.category}
                          </p>
                        </div>

                        {/* Right column: 30 progress dots */}
                        <div
                          className="flex-1 gap-1.5 items-center"
                          style={{ display: 'grid', gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}
                        >
                          {habit.days.map((day, idx) => {
                            let dotStyle = 'bg-[var(--muted)] border border-[var(--border)]';
                            let statusText = 'Pending';

                            if (day.status === 'completed') {
                              dotStyle = 'bg-emerald-500 border-transparent shadow-sm scale-110';
                              statusText = 'Completed';
                            } else if (day.status === 'skipped') {
                              dotStyle = 'bg-orange-500 border-transparent shadow-sm scale-110';
                              statusText = 'Skipped';
                            }

                            return (
                              <div
                                key={day.dayNumber}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedHabitId(habit.id);
                                  openDayInspector(idx);
                                }}
                                className={`h-6 rounded-md cursor-pointer transition-all hover:scale-125 flex items-center justify-center relative group ${dotStyle}`}
                              >
                                {day.note && (
                                  <span className="w-1 h-1 rounded-full bg-white opacity-85"></span>
                                )}
                                {/* Cell Tooltip */}
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 px-2 py-1 text-[8px] bg-[var(--foreground)] text-[var(--background)] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-md">
                                  D{idx + 1}: {statusText} {day.note ? '• Has Note' : ''}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Tabler-Style Premium Progress & Performance Analytics Dashboard */}
        {activeHabit && (
          <div className="space-y-6 mt-8">
            {/* Section Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-md font-black uppercase tracking-wider text-[var(--primary)] flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[var(--primary)]" /> HABIT PERFORMANCE DASHBOARD
                </h3>
                <p className="text-[11px] text-[var(--muted-foreground)] font-bold mt-0.5">
                  Real-time metrics, consistency trends, and reward targets.
                </p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase text-[var(--primary)] border animate-pulse-soft"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--primary) 20%, transparent)'
                }}
              >
                Live Data
              </span>
            </div>

            {/* ROW 1: Showcase Banner + Core Stats (8 cols Banner, 4 cols Stacked Column) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Showcase Banner (8 cols) */}
              <div className="lg:col-span-8 rounded-3xl p-6 sm:p-8 border bg-[var(--card)] border-[var(--border)] shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
                {/* Subtle visual SVG graphic on the right */}
                <div className="absolute right-4 bottom-4 w-36 h-36 opacity-[0.08] pointer-events-none transform group-hover:scale-110 transition-transform duration-500 text-[var(--primary)]">
                  <svg viewBox="0 0 100 100" className="w-full h-full" fill="currentColor">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4,4" />
                    <path d="M30 50 L45 65 L70 35" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="75" cy="25" r="4" className="animate-pulse" />
                    <circle cx="20" cy="70" r="3" />
                  </svg>
                </div>

                <div>
                  <span
                    className="text-[9px] font-black uppercase text-[var(--primary)] tracking-widest px-2.5 py-1 rounded-full border inline-block mb-3"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--primary) 10%, transparent)'
                    }}
                  >
                    Active Journey
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight">
                    Keep up the momentum!
                  </h4>
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] font-bold mt-2 max-w-md leading-relaxed">
                    You are tracking <span className="text-[var(--foreground)]">{activeHabit.name}</span>. Every completed check-in solidifies your positive habits. Show up again tomorrow!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-[var(--border)] border-dashed">
                  <div>
                    <p className="text-[9px] font-black uppercase text-[var(--muted-foreground)] tracking-widest">Completed</p>
                    <p className="text-lg font-black text-[var(--foreground)] mt-0.5">{stats.completed} <span className="text-[10px] text-[var(--muted-foreground)]">/ 30 Days</span></p>
                    <div className="w-full bg-[var(--muted)] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[var(--primary)] h-full rounded-full transition-all duration-1000" style={{ width: `${stats.rate}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-[var(--muted-foreground)] tracking-widest">Progress left</p>
                    <p className="text-lg font-black text-[var(--foreground)] mt-0.5">
                      {30 - stats.completed} <span className="text-[10px] text-[var(--muted-foreground)]">Days Left</span>
                    </p>
                    <div className="w-full bg-[var(--muted)] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div className="bg-[var(--primary)] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, 100 - stats.rate)}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stacked Analytics Column (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-6 justify-between">

                {/* Circular Arc Percentage Meter Card (Compact side-by-side) */}
                <div className="rounded-3xl p-5 border bg-[var(--card)] border-[var(--border)] shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-between gap-4 flex-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-widest">Completion Rate</p>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] whitespace-nowrap font-bold">
                        {stats.rate >= 75 ? 'On Track' : stats.rate >= 40 ? 'Consistent' : 'Needs Focus'}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-[var(--foreground)] mt-1.5">{stats.rate}%</p>
                    <p className="text-[9px] text-[var(--muted-foreground)] font-bold mt-0.5">Ratio of completed tasks</p>
                  </div>

                  <div className="w-20 h-20 relative flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <path
                        className="text-[var(--muted)]"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[var(--primary)] transition-all duration-1000 ease-out"
                        strokeWidth="4"
                        strokeDasharray={`${stats.rate}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-xs font-black text-[var(--foreground)]">{stats.completed}d</span>
                      <p className="text-[6px] font-bold text-[var(--muted-foreground)] uppercase tracking-widest">done</p>
                    </div>
                  </div>
                </div>

                {/* Progress Trajectory sparkline Card (Compact side-by-side) */}
                <div className="rounded-3xl p-5 border bg-[var(--card)] border-[var(--border)] shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-between gap-4 flex-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 justify-between">
                      <p className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-widest">Trajectory</p>
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]">Sparkline</span>
                    </div>
                    <p className="text-2xl font-black text-[var(--foreground)] mt-1.5">{stats.completed} <span className="text-xs font-bold text-[var(--muted-foreground)]">Days</span></p>
                    <p className="text-[9px] text-[var(--muted-foreground)] font-bold mt-0.5">Cumulative progress path</p>
                  </div>

                  <div className="w-24 h-12 overflow-hidden flex items-end relative flex-shrink-0">
                    {renderTrendLineCompact()}
                  </div>
                </div>

              </div>

            </div>

            {/* ROW 2: Streaks & Consistency Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Current Streak progress bar */}
              <div className="rounded-3xl p-6 border bg-[var(--card)] border-[var(--border)] shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-widest">Current Streak</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5 text-[var(--primary)] animate-pulse" /> Streak
                    </span>
                  </div>
                  <p className="text-3xl font-black text-[var(--foreground)] mt-2">{stats.currentStreak} <span className="text-xs text-[var(--muted-foreground)] font-bold">Days</span></p>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[var(--muted-foreground)] mb-1">
                    <span>Streak vs Target</span>
                    <span className="text-[var(--primary)]">{Math.round((stats.currentStreak / 30) * 100)}% of Goal</span>
                  </div>
                  <div className="w-full bg-[var(--muted)] h-2 rounded-full overflow-hidden">
                    <div className="bg-[var(--primary)] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (stats.currentStreak / 30) * 100)}%` }}></div>
                  </div>
                  <p className="text-[9px] text-[var(--muted-foreground)] font-bold mt-2">
                    {stats.currentStreak > 0 ? 'Streak active! Stay strong.' : 'Check in today to start a streak.'}
                  </p>
                </div>
              </div>

              {/* Best Streak progress bar */}
              <div className="rounded-3xl p-6 border bg-[var(--card)] border-[var(--border)] shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-widest">Longest Streak</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] flex items-center gap-1">
                      <Award className="w-2.5 h-2.5 text-[var(--primary)]" /> Record
                    </span>
                  </div>
                  <p className="text-3xl font-black text-[var(--foreground)] mt-2">{stats.bestStreak} <span className="text-xs text-[var(--muted-foreground)] font-bold">Days</span></p>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[var(--muted-foreground)] mb-1">
                    <span>Record Level</span>
                    <span className="text-[var(--primary)]">{stats.rate >= 90 ? 'Legendary' : stats.rate >= 70 ? 'Master' : stats.rate >= 40 ? 'Strong' : 'Growing'}</span>
                  </div>
                  <div className="w-full bg-[var(--muted)] h-2 rounded-full overflow-hidden">
                    <div className="bg-[var(--primary)] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (stats.bestStreak / 30) * 100)}%` }}></div>
                  </div>
                  <p className="text-[9px] text-[var(--muted-foreground)] font-bold mt-2">
                    Your historical consecutive check-in high.
                  </p>
                </div>
              </div>

              {/* Consistency Grade indicator */}
              <div className="rounded-3xl p-6 border bg-[var(--card)] border-[var(--border)] shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase text-[var(--muted-foreground)] tracking-widest">Consistency Grade</p>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]">
                      {stats.rate >= 75 ? 'Excellent' : 'Needs Focus'}
                    </span>
                  </div>
                  <p className="text-3xl font-black text-[var(--foreground)] mt-2">
                    {stats.rate >= 90 ? 'A+ Perfect' : stats.rate >= 75 ? 'A Solid' : stats.rate >= 50 ? 'B Moderate' : 'C Unstable'}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex justify-between items-center text-[10px] font-bold text-[var(--muted-foreground)] mb-1">
                    <span>Consistency Score</span>
                    <span className="text-[var(--primary)]">{stats.rate} / 100</span>
                  </div>
                  <div className="w-full bg-[var(--muted)] h-2 rounded-full overflow-hidden">
                    <div className="bg-[var(--primary)] h-full rounded-full transition-all duration-1000" style={{ width: `${stats.rate}%` }}></div>
                  </div>
                  <p className="text-[9px] text-[var(--muted-foreground)] font-bold mt-2">
                    Calculated checking ratio out of 30.
                  </p>
                </div>
              </div>
            </div>

            {/* ROW 3: Mini Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Mini card 1: Logged */}
              <div className="rounded-2xl p-4 border bg-[var(--card)] border-[var(--border)] flex items-center gap-4 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-[var(--foreground)]">{stats.completed + stats.skipped} Logged</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] font-bold">Successfully logged days</p>
                </div>
              </div>

              {/* Mini card 2: Skipped */}
              <div className="rounded-2xl p-4 border bg-[var(--card)] border-[var(--border)] flex items-center gap-4 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)] flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-[var(--foreground)]">{stats.skipped} Skipped</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] font-bold">Skipped habit check-ins</p>
                </div>
              </div>

              {/* Mini card 3: Remaining */}
              <div className="rounded-2xl p-4 border bg-[var(--card)] border-[var(--border)] flex items-center gap-4 hover:shadow-md transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-[var(--foreground)]">{30 - (stats.completed + stats.skipped)} Pending</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] font-bold">Days left in 30-day run</p>
                </div>
              </div>

              {/* Mini card 4: Reward */}
              <div className="rounded-2xl p-4 border bg-[var(--card)] border-[var(--border)] flex items-center gap-4 hover:shadow-md transition-all duration-300 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs font-black text-[var(--foreground)] line-clamp-2 leading-tight break-words"
                    title={activeHabit.reward || "Reward Target"}
                  >
                    {activeHabit.reward || "Reward Target"}
                  </p>
                  <p className="text-[10px] text-[var(--muted-foreground)] font-bold truncate">Claimable upon finish</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* MODAL 1: Create Custom Habit */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
            <div className="w-full max-w-lg rounded-3xl p-6 sm:p-8 border bg-[var(--card)] border-[var(--border)] shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <h3 className="text-lg font-black text-[var(--primary)] flex items-center gap-2">
                  <PlusCircleIcon className="w-5 h-5 text-[var(--primary)]" /> Create Custom 30-Day Habit
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomHabit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider">Habit Name</label>
                  <input
                    type="text"
                    required
                    value={newHabitName}
                    onChange={(e) => setNewHabitName(e.target.value)}
                    placeholder="e.g., Cold Showers, Limit Screen Time"
                    className="w-full px-4 py-3 rounded-xl border bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider">Category</label>
                    <select
                      value={newHabitCategory}
                      onChange={(e) => setNewHabitCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="Health">Health</option>
                      <option value="Mind">Mind</option>
                      <option value="Learning">Learning</option>
                      <option value="Routine">Routine</option>
                      <option value="Productivity">Productivity</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider">Start Date</label>
                    <input
                      type="date"
                      required
                      value={newHabitStartDate}
                      onChange={(e) => setNewHabitStartDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider">Description</label>
                  <textarea
                    value={newHabitDesc}
                    onChange={(e) => setNewHabitDesc(e.target.value)}
                    placeholder="Write a clear, actionable instruction for yourself..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Milestone Reward
                  </label>
                  <input
                    type="text"
                    value={newHabitReward}
                    onChange={(e) => setNewHabitReward(e.target.value)}
                    placeholder="e.g., Buying my favorite sneakers, Weekend spa"
                    className="w-full px-4 py-3 rounded-xl border bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <p className="text-[10px] text-[var(--muted-foreground)] font-bold">
                    Treating yourself upon successful completion dramatically increases success rates!
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-xl font-bold bg-[var(--primary)] text-white shadow-md hover:shadow-lg active:scale-95 transition-all"
                  >
                    Start 30-Day Challenge
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3.5 rounded-xl font-bold border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: Day Progress & Notes Inspector */}
        {isDayModalOpen && inspectingDayIndex !== null && activeHabit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
            <div className="w-full max-w-md rounded-3xl p-6 sm:p-8 border bg-[var(--card)] border-[var(--border)] shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div>
                  <h3 className="text-lg font-black text-[var(--primary)]">
                    Day {inspectingDayIndex + 1} Inspector
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5">
                    {activeHabit.name}
                  </p>
                </div>
                <button
                  onClick={() => setIsDayModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status Toggle buttons */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider">Day Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setInspectingStatus('completed')}
                      className={`py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                        inspectingStatus === 'completed'
                          ? 'bg-emerald-500 text-white shadow-sm font-black'
                          : 'bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      Completed
                    </button>
                    <button
                      onClick={() => setInspectingStatus('skipped')}
                      className={`py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                        inspectingStatus === 'skipped'
                          ? 'bg-orange-500 text-white shadow-sm font-black'
                          : 'bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      Skipped
                    </button>
                    <button
                      onClick={() => setInspectingStatus('pending')}
                      className={`py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                        inspectingStatus === 'pending'
                          ? 'bg-[var(--foreground)] text-[var(--background)] shadow-sm font-black'
                          : 'bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      Unmarked
                    </button>
                  </div>
                </div>

                {/* Progress reflection note input */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-[var(--foreground)] tracking-wider flex items-center gap-1">
                    <Edit3 className="w-3.5 h-3.5 text-[var(--primary)]" /> Daily Reflections Note
                  </label>
                  <textarea
                    value={inspectingNote}
                    onChange={(e) => setInspectingNote(e.target.value)}
                    placeholder="e.g., Felt super energetic! Woke up without snoozing. Completed at 5:30 AM."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none text-sm"
                  />
                  <p className="text-[10px] text-[var(--muted-foreground)] font-bold">
                    Reflecting on small wins or challenges helps build deeper habits.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveDayDetails}
                    className="flex-[2] py-3.5 rounded-xl font-bold bg-[var(--primary)] text-white shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-4 h-4" /> Save Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDayModalOpen(false)}
                    className="flex-1 py-3.5 rounded-xl font-bold border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)] transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Informational guide */}
        <div className="mt-16">
          <Description />
        </div>
      </div>
    </div>
  );
}

// Simple Helper component
function PlusCircleIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
