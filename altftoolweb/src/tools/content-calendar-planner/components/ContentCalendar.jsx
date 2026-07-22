"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar, Plus, Trash2, Search, FileText, Youtube, Instagram, Linkedin,
  Twitter, Mail, TrendingUp, DollarSign, Target, Layers, BarChart2,
  ArrowUpRight, Info, CheckSquare, Square, CheckCircle2, ChevronLeft, ChevronRight,
  AlertCircle, Sparkles, Filter, X as CloseIcon
} from "lucide-react";
import { PLATFORMS, STATUSES, DEFAULT_POSTS, fmt, fmtCurrency, getRelativeDate } from "../data/data";

// Premium dynamic count up hook for beautiful stats
function useCountUp(target) {
  const [val, setVal] = useState(target);
  const ref = useRef(null);
  const prev = useRef(target);

  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (Math.abs(target - from) < 0.01) {
      setVal(target);
      return;
    }
    const t0 = performance.now();
    const run = (now) => {
      const p = Math.min(1, (now - t0) / 500);
      const e = 1 - Math.pow(1 - p, 3); // Cubic ease-out
      setVal(from + (target - from) * e);
      if (p < 1) ref.current = requestAnimationFrame(run);
    };
    ref.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(ref.current);
  }, [target]);

  return val;
}

// Helper for dynamic font scaling based on value length
const getFontSizeClass = (valueString, isPill = false) => {
  const len = String(valueString).length;
  if (isPill) {
    if (len <= 4) return "text-xl sm:text-2xl";
    if (len <= 7) return "text-lg sm:text-xl";
    return "text-base";
  } else {
    if (len <= 6) return "text-3xl xl:text-4xl";
    if (len <= 9) return "text-2xl xl:text-3xl";
    if (len <= 12) return "text-xl xl:text-2xl";
    return "text-lg xl:text-xl";
  }
};

export default function ContentCalendar() {
  const [posts, setPosts] = useState([]);
  const formRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDayFilter, setSelectedDayFilter] = useState(null); // YYYY-MM-DD

  // Date & Calendar State
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-11

  const [submitSuccessType, setSubmitSuccessType] = useState(null); // 'added' | 'updated' | null

  // Form State
  const [formId, setFormId] = useState(null); // null = new, otherwise editing ID
  const [formTitle, setFormTitle] = useState("");
  const [formPlatform, setFormPlatform] = useState("youtube");
  const [formType, setFormType] = useState("Video");
  const [formDate, setFormDate] = useState(getRelativeDate(0));
  const [formStatus, setFormStatus] = useState("draft");
  const [formBudget, setFormBudget] = useState("");
  const [formReach, setFormReach] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formTasks, setFormTasks] = useState([]);

  const [newTaskInput, setNewTaskInput] = useState("");

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("altf_content_posts");
      if (stored) {
        setPosts(JSON.parse(stored));
      } else {
        setPosts(DEFAULT_POSTS);
      }
    } catch (e) {
      console.error("Could not load posts", e);
      setPosts(DEFAULT_POSTS);
    }
  }, []);

  // Save to localStorage
  const savePosts = (updated) => {
    try {
      localStorage.setItem("altf_content_posts", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save posts", e);
    }
  };

  // Prepopulate form tasks when platform changes (only for new posts)
  useEffect(() => {
    if (!formId) {
      const template = PLATFORMS[formPlatform]?.defaultTasks || [];
      setFormTasks(template.map((t, idx) => ({ id: `new-task-${idx}-${Date.now()}`, text: t, completed: false })));
      // Set default content type based on platform
      if (formPlatform === "youtube") setFormType("Video");
      else if (formPlatform === "blog") setFormType("Article");
      else if (formPlatform === "instagram") setFormType("Carousel");
      else if (formPlatform === "linkedin") setFormType("Post");
      else if (formPlatform === "x") setFormType("Thread");
      else if (formPlatform === "newsletter") setFormType("Email");
    }
  }, [formPlatform, formId]);

  // Calculations
  const stats = useMemo(() => {
    let totalBudget = 0;
    let totalReach = 0;
    let totalProgress = 0;
    let taskCount = 0;
    let completedTaskCount = 0;

    posts.forEach(p => {
      totalBudget += p.budget === "" ? 0 : +p.budget;
      totalReach += p.targetReach === "" ? 0 : +p.targetReach;

      const pTasks = p.tasks || [];
      if (pTasks.length > 0) {
        const completed = pTasks.filter(t => t.completed).length;
        completedTaskCount += completed;
        taskCount += pTasks.length;
        totalProgress += (completed / pTasks.length) * 100;
      }
    });

    const averageProgress = posts.length > 0 ? totalProgress / posts.length : 0;
    const taskCompletionRate = taskCount > 0 ? (completedTaskCount / taskCount) * 100 : 0;

    // Platform distribution
    const platformCounts = {};
    posts.forEach(p => {
      platformCounts[p.platform] = (platformCounts[p.platform] || 0) + 1;
    });

    // Status distribution
    const statusCounts = { draft: 0, scheduled: 0, published: 0 };
    posts.forEach(p => {
      if (statusCounts[p.status] !== undefined) {
        statusCounts[p.status]++;
      }
    });

    // Find highest priority item
    let highestPriority = null;
    let maxMetric = -1;
    posts.forEach(p => {
      const metric = (p.budget === "" ? 0 : +p.budget) * 2 + (p.targetReach === "" ? 0 : +p.targetReach) / 10;
      if (metric > maxMetric) {
        maxMetric = metric;
        highestPriority = p;
      }
    });

    return {
      totalBudget,
      totalReach,
      averageProgress,
      taskCompletionRate,
      platformCounts,
      statusCounts,
      highestPriority
    };
  }, [posts]);

  // CountUp animated values
  const animBudget = useCountUp(stats.totalBudget);
  const animReach = useCountUp(stats.totalReach);
  const animProgress = useCountUp(stats.averageProgress);

  // Filtered posts for list
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.notes || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = filterPlatform === "all" || p.platform === filterPlatform;
      const matchesStatus = filterStatus === "all" || p.status === filterStatus;
      const matchesDay = !selectedDayFilter || p.publishDate === selectedDayFilter;

      return matchesSearch && matchesPlatform && matchesStatus && matchesDay;
    });
  }, [posts, searchQuery, filterPlatform, filterStatus, selectedDayFilter]);

  // Calendar rendering helpers
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

    const days = [];

    // Add prefix days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDay = prevMonthTotalDays - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(prevDay).padStart(2, "0")}`;
      days.push({ day: prevDay, isCurrentMonth: false, dateString: dateStr });
    }

    // Add current month days
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({ day: i, isCurrentMonth: true, dateString: dateStr });
    }

    // Add suffix days from next month to make complete 5 or 6 weeks dynamically (35 or 42 cells)
    const currentCellsCount = days.length;
    const totalCellsNeeded = currentCellsCount <= 35 ? 35 : 42;
    const extraCells = totalCellsNeeded - currentCellsCount;
    for (let i = 1; i <= extraCells; i++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({ day: i, isCurrentMonth: false, dateString: dateStr });
    }

    return days;
  }, [currentYear, currentMonth]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Form handlers
  const handleSavePost = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const newPost = {
      id: formId || `post-${Date.now()}`,
      title: formTitle.trim(),
      platform: formPlatform,
      type: formType.trim() || "Post",
      publishDate: formDate,
      status: formStatus,
      budget: formBudget === "" ? "" : +formBudget,
      targetReach: formReach === "" ? "" : +formReach,
      tasks: formTasks,
      notes: formNotes.trim()
    };

    let updated;
    if (formId) {
      updated = posts.map(p => p.id === formId ? newPost : p);
    } else {
      updated = [...posts, newPost];
    }

    setPosts(updated);
    savePosts(updated);

    // Set green success feedback state for 2 seconds
    const successType = formId ? "updated" : "added";
    setSubmitSuccessType(successType);
    setTimeout(() => {
      setSubmitSuccessType(null);
    }, 2000);

    handleResetForm();
  };

  const handleDeletePost = (id) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    savePosts(updated);
    if (formId === id) {
      handleResetForm();
    }
  };

  const handleEditPost = (post) => {
    setFormId(post.id);
    setFormTitle(post.title);
    setFormPlatform(post.platform);
    setFormType(post.type);
    setFormDate(post.publishDate);
    setFormStatus(post.status);
    setFormBudget(post.budget);
    setFormReach(post.targetReach);
    setFormNotes(post.notes || "");
    setFormTasks(post.tasks || []);
    setNewTaskInput("");

    // Smoothly scroll back to the creator form card for editing
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleResetForm = () => {
    setFormId(null);
    setFormTitle("");
    setFormPlatform("youtube");
    setFormType("Video");
    setFormDate(getRelativeDate(0));
    setFormStatus("draft");
    setFormBudget("");
    setFormReach("");
    setFormNotes("");
    setFormTasks([]);
    setNewTaskInput("");
  };

  // Task inline interactions
  const handleToggleSubtask = (postId, taskId) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        const nextTasks = p.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
        return { ...p, tasks: nextTasks };
      }
      return p;
    });
    setPosts(updated);
    savePosts(updated);

    // Also update form if currently editing this post
    if (formId === postId) {
      setFormTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
    }
  };

  // Subtask management inside form
  const handleFormToggleTask = (taskId) => {
    setFormTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const handleAddFormTask = () => {
    if (!newTaskInput.trim()) return;
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newTaskInput.trim(),
      completed: false
    };
    setFormTasks(prev => [...prev, newTask]);
    setNewTaskInput("");
  };

  const handleRemoveFormTask = (taskId) => {
    setFormTasks(prev => prev.filter(t => t.id !== taskId));
  };

  // Get matching lucide icon component for platform
  const getPlatformIcon = (platformId, extraClass = "") => {
    const platform = PLATFORMS[platformId];
    if (!platform) return <Sparkles className={extraClass} />;

    switch (platform.icon) {
      case "FileText": return <FileText className={`${platform.color} ${extraClass}`} />;
      case "Youtube": return <Youtube className={`${platform.color} ${extraClass}`} />;
      case "Instagram": return <Instagram className={`${platform.color} ${extraClass}`} />;
      case "Linkedin": return <Linkedin className={`${platform.color} ${extraClass}`} />;
      case "Twitter": return <Twitter className={`${platform.color} ${extraClass}`} />;
      case "Mail": return <Mail className={`${platform.color} ${extraClass}`} />;
      default: return <Sparkles className={`${platform.color} ${extraClass}`} />;
    }
  };

  return (
    <div className="space-y-4">

      {/* 1. STANDALONE MAJESTIC ANALYTICS BANNER */}
      <div className="w-full bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 relative overflow-hidden scale-enter">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Calendar size={180} className="text-blue-500" />
        </div>
        <div className="relative z-10 space-y-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">
              <Sparkles size={12} />
              Marketing Hub
            </div>
            <h3 className="text-3xl font-extrabold text-[var(--primary)] tracking-tight">Content Output Dashboard</h3>
            <p className="text-sm text-[var(--muted-foreground)] max-w-xl">
              Real-time calculations of your creative content inventory, target audiences, budget health, and pipeline execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* Column 1: Stack of Pills */}
            <div className="flex flex-col gap-3 justify-center h-full">
              {/* Total Posts Pill */}
              <div className="bg-[var(--background)] px-5 py-3 rounded-full border border-[var(--card-border)] shadow-2xs hover:border-blue-500/35 transition duration-300 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Total Posts</span>
                <span className={`${getFontSizeClass(posts.length, true)} font-black text-[var(--foreground)] font-mono leading-none truncate`}>
                  {posts.length}
                </span>
              </div>

              {/* Avg Progress Pill */}
              <div className="bg-[var(--background)] px-5 py-3 rounded-full border border-[var(--card-border)] shadow-2xs hover:border-blue-500/35 transition duration-300 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Avg Progress</span>
                <span className={`${getFontSizeClass(Math.round(animProgress) + "%", true)} font-black text-blue-500 font-mono leading-none truncate`}>
                  {Math.round(animProgress)}%
                </span>
              </div>
            </div>

            {/* Column 2: Total Cost Card */}
            <div className="bg-[var(--background)] p-5 rounded-xl border border-[var(--card-border)] shadow-2xs hover:border-blue-500/35 transition duration-300 flex flex-col justify-between gap-2 min-w-0">
              <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider block">Total Cost</span>
              <span className={`${getFontSizeClass(fmtCurrency(Math.round(animBudget)), false)} font-black text-emerald-500 font-mono block leading-none truncate`}>
                {fmtCurrency(Math.round(animBudget))}
              </span>
            </div>

            {/* Column 3: Total Reach Card */}
            <div className="bg-[var(--background)] p-5 rounded-xl border border-[var(--card-border)] shadow-2xs hover:border-blue-500/35 transition duration-300 flex flex-col justify-between gap-2 min-w-0">
              <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider block">Total Reach</span>
              <span className={`${getFontSizeClass(fmt(Math.round(animReach)), false)} font-black text-sky-500 font-mono block leading-none truncate`}>
                {fmt(Math.round(animReach))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECONDARY METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Card 1: Channel Content Mix */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 hover:border-blue-500/40 transition duration-300">
          <div className="flex justify-between items-center mb-4 border-b border-[var(--card-border)]/50 pb-2">
            <h4 className="text-sm font-bold uppercase text-[var(--primary)] tracking-wider">Channel Mix</h4>
            <BarChart2 size={18} className="text-blue-500" />
          </div>

          {posts.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-sm text-[var(--muted-foreground)]">
              No active content scheduled.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.keys(PLATFORMS).map(platformId => {
                const count = stats.platformCounts[platformId] || 0;
                const pct = posts.length > 0 ? (count / posts.length) * 100 : 0;
                const platform = PLATFORMS[platformId];

                return (
                  <div key={platformId} className="space-y-1.5">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="flex items-center gap-1.5 text-[var(--foreground)]">
                        {getPlatformIcon(platformId, "w-4 h-4")}
                        {platform.name}
                      </span>
                      <span className="text-[var(--muted-foreground)] font-mono text-xs">{count} posts ({Math.round(pct)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--background)] rounded-full overflow-hidden border border-[var(--card-border)]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: platformId === 'youtube' ? '#f43f5e' :
                                           platformId === 'blog' ? '#3b82f6' :
                                           platformId === 'instagram' ? '#ec4899' :
                                           platformId === 'linkedin' ? '#0284c7' :
                                           platformId === 'x' ? '#64748b' : '#f59e0b'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Card 2: Implementation Subtask Tracker */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 hover:border-indigo-500/40 transition duration-300 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-[var(--card-border)]/50 pb-2">
              <h4 className="text-sm font-bold uppercase text-[var(--primary)] tracking-wider">Subtask Progress</h4>
              <CheckCircle2 size={18} className="text-blue-400" />
            </div>

            <div className="text-center py-5">
              <span className="text-4xl font-extrabold text-[var(--foreground)] font-mono">
                {Math.round(stats.taskCompletionRate)}%
              </span>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Overall checklists accomplishment rate across all platforms
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-4 pt-3 border-t border-[var(--card-border)]">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)] font-medium">Drafts</span>
              <span className="font-bold text-amber-500">{stats.statusCounts.draft} posts</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)] font-medium">Scheduled</span>
              <span className="font-bold text-blue-500">{stats.statusCounts.scheduled} posts</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)] font-medium">Published</span>
              <span className="font-bold text-emerald-500">{stats.statusCounts.published} posts</span>
            </div>
          </div>
        </div>

        {/* Card 3: Majestic Featured Post */}
        <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 hover:border-blue-500/40 transition duration-300 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-1 -right-1 w-20 h-20 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />

          <div>
            <div className="flex justify-between items-center mb-4 border-b border-[var(--card-border)]/50 pb-2">
              <h4 className="text-sm font-bold uppercase text-[var(--primary)] tracking-wider">Featured Campaign</h4>
              <ArrowUpRight size={18} className="text-blue-400" />
            </div>

            {stats.highestPriority ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${PLATFORMS[stats.highestPriority.platform]?.badgeClass}`}>
                    {PLATFORMS[stats.highestPriority.platform]?.name}
                  </span>
                  <span className="text-xs font-mono text-[var(--muted-foreground)]">
                    {stats.highestPriority.type}
                  </span>
                </div>
                <h5 className="text-lg font-bold text-[var(--foreground)] line-clamp-2 leading-tight">
                  {stats.highestPriority.title}
                </h5>
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 italic">
                  "{stats.highestPriority.notes || 'No notes added.'}"
                </p>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-sm text-[var(--muted-foreground)]">
                Add content to feature priority.
              </div>
            )}
          </div>

          {stats.highestPriority && (
            <div className="mt-4 pt-3 border-t border-[var(--card-border)] flex justify-between items-center">
              <span className="text-xs text-[var(--muted-foreground)] uppercase">Max Reach Target</span>
              <span className="text-base font-bold text-sky-500 font-mono">
                {fmt(stats.highestPriority.targetReach)} readers
              </span>
            </div>
          )}
        </div>

      </div>

      {/* 3. INTERACTIVE MONTHLY CALENDAR GRID */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Calendar size={18} />
            </div>
            <div>
              <h4 className="font-bold text-[var(--primary)] text-lg">Interactive Content Scheduler</h4>
              <p className="text-xs text-[var(--muted-foreground)]">Click a day to filter posts or set release schedules</p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-3">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--secondary-hover)] transition cursor-pointer text-sm font-semibold flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-sm text-[var(--foreground)] min-w-[130px] text-center font-mono">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--secondary-hover)] transition cursor-pointer text-sm font-semibold flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="grid grid-cols-7 gap-1.5 rounded-xl overflow-hidden mt-2">
          {/* Weekday headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="text-center py-2.5 text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-widest bg-[var(--card)]/30 rounded-lg border border-[var(--card-border)]/40">
              {day}
            </div>
          ))}

          {/* Days */}
          {calendarDays.map((cell, idx) => {
            const hasPosts = posts.filter(p => p.publishDate === cell.dateString);
            const isSelected = selectedDayFilter === cell.dateString;
            const isToday = cell.dateString === getRelativeDate(0);

            return (
              <div
                key={idx}
                onClick={() => {
                  if (selectedDayFilter === cell.dateString) {
                    setSelectedDayFilter(null);
                  } else {
                    setSelectedDayFilter(cell.dateString);
                    setFormDate(cell.dateString);
                  }
                }}
                className={`min-h-[76px] p-2 flex flex-col justify-between transition-all duration-300 cursor-pointer rounded-xl border relative ${
                  cell.isCurrentMonth
                    ? "bg-[var(--card)]/40 border-[var(--card-border)] text-[var(--foreground)] hover:border-blue-500/40 hover:bg-blue-500/[0.02] hover:-translate-y-[1px] hover:shadow-xs"
                    : "bg-[var(--card)]/10 border-[var(--card-border)]/30 text-[var(--muted-foreground)]/40 hover:border-blue-500/20"
                } ${
                  isSelected
                    ? "bg-gradient-to-br from-blue-500/10 via-sky-500/5 to-transparent border-blue-500/70 shadow-xs shadow-blue-500/10 -translate-y-[1px]"
                    : ""
                }`}
              >
                {/* Luminous line under active filter cell */}
                {isSelected && (
                  <div className="absolute top-0 left-3 right-3 h-[2px] bg-gradient-to-r from-blue-500 to-sky-500 rounded-full" />
                )}

                <div className="flex justify-between items-center w-full">
                  <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-md ${
                    isToday
                      ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white font-extrabold shadow-xs shadow-blue-500/20"
                      : isSelected
                        ? "text-blue-500 bg-blue-500/10"
                        : "text-[var(--muted-foreground)] bg-[var(--background)]/70 border border-[var(--card-border)]/50"
                  }`}>
                    {cell.day}
                  </span>

                  {hasPosts.length > 0 && (
                    <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono">
                      {hasPosts.length}
                    </span>
                  )}
                </div>

                {/* Dynamic Micro-badge icon list for scheduled content */}
                <div className="flex flex-wrap gap-1 mt-2.5 overflow-hidden max-h-[38px] w-full">
                  {hasPosts.slice(0, 3).map((p, pIdx) => {
                    const platform = PLATFORMS[p.platform];
                    return (
                      <div
                        key={pIdx}
                        title={`${platform?.name || p.platform}: ${p.title}`}
                        className="p-1 rounded-md bg-[var(--card)]/90 border border-[var(--card-border)]/60 shadow-3xs flex items-center justify-center hover:scale-108 hover:border-blue-500/30 transition duration-200"
                      >
                        {getPlatformIcon(p.platform, "w-3 h-3")}
                      </div>
                    );
                  })}
                  {hasPosts.length > 3 && (
                    <div className="h-5 px-1 rounded-md bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                      <span className="text-[9px] font-black text-blue-400 font-mono">
                        +{hasPosts.length - 3}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {selectedDayFilter && (
          <div className="mt-4 flex items-center justify-between bg-blue-500/5 border border-blue-500/20 px-4 py-2.5 rounded-xl scale-enter">
            <span className="text-xs text-[var(--foreground)] font-medium flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-500 shrink-0" />
              <span>Filtering posts scheduled for: <strong className="font-mono text-blue-400">{selectedDayFilter}</strong></span>
            </span>
            <button
              onClick={() => setSelectedDayFilter(null)}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <CloseIcon size={12} /> Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* 4. SCHEDULE CONTENT FORM CARD (FULL-WIDTH) */}
      <div
        ref={formRef}
        className={`bg-[var(--card)] border rounded-xl p-5 space-y-5 transition-all duration-300 ${
          formId
            ? "border-blue-500/50 shadow-md shadow-blue-500/5 ring-1 ring-blue-500/20"
            : "border-[var(--card-border)] shadow-xs hover:border-blue-500/25"
        }`}
      >
        <div className="flex justify-between items-center border-b border-[var(--card-border)] pb-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500 animate-pulse-soft shrink-0" />
              <h4 className="font-extrabold text-[var(--primary)] text-base tracking-tight flex items-center gap-2 flex-wrap">
                <span>{formId ? "Modify Campaign Details" : "Create New Campaign"}</span>
                {formId && (
                  <span className="text-[9px] uppercase font-extrabold tracking-widest text-blue-500 bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 rounded-md animate-pulse">
                    Edit Mode
                  </span>
                )}
              </h4>
            </div>
            <div className="h-0.5 w-12 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full mt-1.5" />
          </div>
          {formId && (
            <button
              onClick={handleResetForm}
              className="text-xs text-blue-500 hover:text-blue-400 font-bold px-3 py-1.5 rounded-full bg-blue-500/10 transition cursor-pointer"
            >
              + New Post
            </button>
          )}
        </div>

        <form onSubmit={handleSavePost} className="space-y-4">

          {/* Post Title */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-bold text-blue-500/80 uppercase tracking-widest block">Post Title *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500/60">
                <FileText size={15} />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. 5 CSS Grid Tips You Must Know"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--input-border)] text-sm text-[var(--foreground)] font-semibold pl-10 pr-3.5 py-2.5 rounded-lg focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/70 transition-all placeholder-[var(--input-placeholder)]"
              />
            </div>
          </div>

          {/* Platform & Type split */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-blue-500/80 uppercase tracking-widest block">Channel *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  {getPlatformIcon(formPlatform, "w-4 h-4 shrink-0")}
                </div>
                <select
                  value={formPlatform}
                  onChange={(e) => setFormPlatform(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--input-border)] text-sm text-[var(--foreground)] pl-10 pr-3.5 py-2.5 rounded-lg focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/70 transition-all cursor-pointer font-bold"
                >
                  <option value="youtube">YouTube Video</option>
                  <option value="blog">Blog Article</option>
                  <option value="instagram">Instagram Post</option>
                  <option value="linkedin">LinkedIn Post</option>
                  <option value="x">Twitter/X Post</option>
                  <option value="newsletter">Email Newsletter</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-blue-500/80 uppercase tracking-widest block">Asset Type</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500/60">
                  <Sparkles size={15} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Video, PDF, Thread"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--input-border)] text-sm text-[var(--foreground)] pl-10 pr-3.5 py-2.5 rounded-lg focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/70 transition-all placeholder-[var(--input-placeholder)] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Publish Date & Status split */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-blue-500/80 uppercase tracking-widest block">Release Date *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500/60">
                  <Calendar size={15} />
                </div>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--input-border)] text-sm text-[var(--foreground)] pl-10 pr-3.5 py-2.5 rounded-lg focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/70 transition-all font-mono cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-blue-500/80 uppercase tracking-widest block">Status</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500/60">
                  <TrendingUp size={15} />
                </div>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--input-border)] text-sm text-[var(--foreground)] pl-10 pr-3.5 py-2.5 rounded-lg focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/70 transition-all cursor-pointer font-bold"
                >
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* CLEARABLE NUMERIC INPUTS: Budget & Audience Reach */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-blue-500/80 uppercase tracking-widest flex items-center gap-1">
                Budget (USD)
                <Info size={10} className="opacity-45" title="Cost of producing this content. Leave blank to clear." />
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-500/70">
                  <DollarSign size={15} />
                </div>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={formBudget}
                  onChange={(e) => setFormBudget(e.target.value === "" ? "" : +e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--input-border)] text-sm text-[var(--foreground)] pl-10 pr-3.5 py-2.5 rounded-lg focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/70 transition-all font-mono placeholder-[var(--input-placeholder)]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] sm:text-xs font-bold text-blue-500/80 uppercase tracking-widest flex items-center gap-1">
                Target Reach
                <Info size={10} className="opacity-45" title="Expected readers / views. Leave blank to clear." />
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-500/60">
                  <Target size={15} />
                </div>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={formReach}
                  onChange={(e) => setFormReach(e.target.value === "" ? "" : +e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--input-border)] text-sm text-[var(--foreground)] pl-10 pr-3.5 py-2.5 rounded-lg focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/70 transition-all font-mono placeholder-[var(--input-placeholder)]"
                />
              </div>
            </div>
          </div>

          {/* Campaign Notes */}
          <div className="space-y-1">
            <label className="text-[10px] sm:text-xs font-bold text-blue-500/80 uppercase tracking-widest block">Strategic Notes</label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none text-blue-500/60">
                <Sparkles size={15} />
              </div>
              <textarea
                placeholder="Target keywords, content briefs, references..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                className="w-full bg-[var(--background)] border border-[var(--input-border)] text-sm text-[var(--foreground)] pl-10 pr-3.5 py-2.5 rounded-lg focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/70 transition-all placeholder-[var(--input-placeholder)] resize-none"
              />
            </div>
          </div>

          {/* SUBTASKS PIPELINE CHECKLIST */}
          <div className="space-y-3.5 bg-[var(--background)] p-4 rounded-xl border border-[var(--card-border)]/85 hover:border-blue-500/20 transition-all duration-300">
            <div className="flex justify-between items-center border-b border-[var(--card-border)]/55 pb-2">
              <label className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider block">Campaign Subtasks</label>
              <span className="text-xs text-blue-500 font-mono font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">
                {formTasks.filter(t => t.completed).length}/{formTasks.length} Completed
              </span>
            </div>

            {/* Subtask list */}
            {formTasks.length === 0 ? (
              <div className="text-xs text-[var(--muted-foreground)] py-3 text-center italic">
                No subtasks added yet. Type below to plan implementation.
              </div>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {formTasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between gap-3 group bg-[var(--card)]/40 hover:bg-[var(--card)] p-2.5 rounded-lg border border-transparent hover:border-[var(--card-border)]/65 hover:translate-x-0.5 transition duration-200">
                    <div
                      onClick={() => handleFormToggleTask(task.id)}
                      className="flex items-center gap-2.5 cursor-pointer select-none truncate flex-1"
                    >
                      {task.completed ? (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 scale-100 transition-transform duration-200" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[var(--card-border)] hover:border-blue-500 hover:scale-105 transition shrink-0" />
                      )}
                      <span className={`text-xs truncate ${task.completed ? "line-through text-[var(--muted-foreground)] opacity-55" : "text-[var(--foreground)] font-semibold"}`}>
                        {task.text}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFormRemoveTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-400 p-0.5 transition cursor-pointer shrink-0"
                      title="Delete task"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add custom subtask input */}
            <div className="flex gap-2 pt-1 border-t border-[var(--card-border)]/55">
              <input
                type="text"
                placeholder="Add custom task..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFormTask();
                  }
                }}
                className="flex-1 bg-[var(--card)] border border-[var(--input-border)] text-sm text-[var(--foreground)] px-3.5 py-2 rounded-lg focus:outline-hidden focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/70 transition-all placeholder-[var(--input-placeholder)]"
              />
              <button
                type="button"
                onClick={handleAddFormTask}
                className="px-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center shrink-0 cursor-pointer shadow-xs active:scale-95 animate-pulse-soft"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2.5">
            <button
              type="submit"
              className={`flex-1 text-white text-sm font-extrabold py-3 px-4 rounded-xl active:scale-95 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 ${
                submitSuccessType
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/15"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/15"
              }`}
            >
              {submitSuccessType === "added" ? (
                <>
                  <CheckCircle2 size={16} className="animate-bounce" /> Added to Calendar!
                </>
              ) : submitSuccessType === "updated" ? (
                <>
                  <CheckCircle2 size={16} className="animate-bounce" /> Updated Successfully!
                </>
              ) : formId ? (
                "Update Campaign Details"
              ) : (
                "Publish to Calendar"
              )}
            </button>

            {formId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="bg-[var(--background)] border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--secondary-hover)] text-sm font-bold py-3 px-5 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>

        </form>
      </div>

      {/* 5. FILTERS CARD (FULL-WIDTH) */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4">

        {/* Platform filter dots */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterPlatform("all")}
            className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer border ${
              filterPlatform === "all"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-[var(--background)] text-[var(--foreground)] border-[var(--card-border)] hover:border-blue-500/40"
            }`}
          >
            All Platforms
          </button>

          {Object.keys(PLATFORMS).map(platformId => {
            const active = filterPlatform === platformId;
            const platform = PLATFORMS[platformId];
            return (
              <button
                key={platformId}
                onClick={() => setFilterPlatform(platformId)}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
                  active
                    ? "bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]"
                    : "bg-[var(--background)] text-[var(--foreground)] border-[var(--card-border)] hover:border-blue-500/40"
                }`}
              >
                {getPlatformIcon(platformId, "w-3.5 h-3.5")}
                {platform.name}
              </button>
            );
          })}
        </div>

        {/* Status & Search Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Select */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full appearance-none bg-[var(--background)] text-xs text-[var(--foreground)] px-3 py-2 pr-8 rounded-full border border-[var(--card-border)] focus:outline-hidden focus:border-blue-500 cursor-pointer font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Drafts</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>
            <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none opacity-50">
              <Filter size={12} />
            </div>
          </div>

          {/* Title Search */}
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[var(--background)] text-xs text-[var(--foreground)] pl-8 pr-3 py-2 rounded-full border border-[var(--card-border)] focus:outline-hidden focus:border-blue-500 w-full sm:w-48 placeholder-[var(--input-placeholder)]"
            />
            <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none opacity-40">
              <Search size={12} />
            </div>
          </div>
        </div>

      </div>

      {/* 6. PIPELINE & CARDS LIST WRAPPER CARD (FULL-WIDTH WITH SCROLL LIMITING TO 4 CARDS) */}
      <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-5 space-y-4">

        <div className="flex items-center gap-2 border-b border-[var(--card-border)]/50 pb-3">
          <Layers size={16} className="text-blue-500" />
          <h4 className="font-bold text-[var(--primary)] text-base">Active Campaigns Pipeline</h4>
          <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full ml-auto">
            {filteredPosts.length} Campaigns
          </span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="bg-[var(--background)]/35 border border-[var(--card-border)] rounded-xl p-10 text-center space-y-3">
            <AlertCircle className="mx-auto text-[var(--muted-foreground)]" size={32} />
            <h5 className="font-bold text-[var(--foreground)] text-base">No Campaigns Found</h5>
            <p className="text-xs text-[var(--muted-foreground)] max-w-xs mx-auto">
              No content fits the current calendar filter combinations. Change your dashboard filters or schedule a new post using the form.
            </p>
            {(filterPlatform !== "all" || filterStatus !== "all" || searchQuery || selectedDayFilter) && (
              <button
                onClick={() => {
                  setFilterPlatform("all");
                  setFilterStatus("all");
                  setSearchQuery("");
                  setSelectedDayFilter(null);
                }}
                className="mt-1 text-xs text-blue-500 hover:text-blue-400 font-bold cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="max-h-[640px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
              {filteredPosts.map(post => {
                const platform = PLATFORMS[post.platform];
                const statusInfo = STATUSES[post.status];

                // Calculate item progress
                const completedCount = (post.tasks || []).filter(t => t.completed).length;
                const totalCount = (post.tasks || []).length;
                const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                const isCurrentlyEditing = formId === post.id;

                return (
                  <div
                    key={post.id}
                    className={`bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-4.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-blue-500/5 ${
                      isCurrentlyEditing
                        ? "border-blue-500 shadow-md ring-1 ring-blue-500/20"
                        : "hover:border-blue-500/40"
                    }`}
                  >
                    <div>
                      {/* Top platform row */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 ${platform?.badgeClass}`}>
                            {getPlatformIcon(post.platform, "w-3.5 h-3.5")}
                            {platform?.name || post.platform}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--muted-foreground)] bg-[var(--background)] border border-[var(--card-border)]/60 px-2 py-0.5 rounded">
                            {post.type}
                          </span>
                        </div>

                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${statusInfo?.badgeClass}`}>
                          {statusInfo?.name || post.status}
                        </span>
                      </div>

                      {/* Title */}
                      <h4
                        onClick={() => handleEditPost(post)}
                        className="font-bold text-base text-[var(--primary)] mb-2.5 hover:opacity-80 transition cursor-pointer line-clamp-2"
                      >
                        {post.title}
                      </h4>

                      {/* Notes / Subtext */}
                      {post.notes && (
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-3 mb-3 bg-[var(--background)]/40 px-3 py-2.5 rounded-lg border border-[var(--card-border)]/45 italic flex items-start gap-1.5">
                          <span className="text-blue-500/60 font-serif text-lg leading-none shrink-0">“</span>
                          <span className="flex-1">{post.notes}</span>
                          <span className="text-blue-500/60 font-serif text-lg leading-none shrink-0">”</span>
                        </p>
                      )}
                    </div>

                    {/* Bottom progress & values */}
                    <div className="space-y-3.5 pt-3 border-t border-[var(--card-border)]/65">

                      {/* Subtasks Progress Slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[var(--muted-foreground)] font-bold">Pipeline Checklist</span>
                          <span className="font-mono text-[var(--foreground)] font-bold">
                            {completedCount}/{totalCount} ({Math.round(progressPct)}%)
                          </span>
                        </div>

                        <div className="h-1.5 w-full bg-[var(--background)] rounded-full overflow-hidden border border-[var(--card-border)]/50 relative">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        {/* Collapsed checklist previews */}
                        {totalCount > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-0.5 text-xs">
                            {post.tasks.slice(0, 4).map(t => (
                              <div
                                key={t.id}
                                onClick={() => handleToggleSubtask(post.id, t.id)}
                                className="flex items-center gap-1.5 cursor-pointer truncate group hover:text-blue-500 transition-all duration-150"
                              >
                                {t.completed ? (
                                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 scale-100 transition-transform duration-200" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-[var(--card-border)] group-hover:border-blue-400 shrink-0 transition" />
                                )}
                                <span className={`truncate ${t.completed ? "line-through opacity-45" : "text-[var(--muted-foreground)] font-medium"}`}>
                                  {t.text}
                                </span>
                              </div>
                            ))}
                            {totalCount > 4 && (
                              <div className="text-xs text-blue-500 font-bold font-mono mt-0.5">
                                +{totalCount - 4} more steps
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* High-Fidelity Stats Pills */}
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="flex items-center gap-2 bg-[var(--background)]/75 px-3 py-2 rounded-xl border border-[var(--card-border)]/45">
                          <Target size={14} className="text-blue-500 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] uppercase font-sans font-extrabold tracking-wider text-[var(--muted-foreground)]/80 leading-none mb-0.5">Reach</span>
                            <strong className="text-[var(--foreground)] text-xs font-bold font-mono truncate">{fmt(post.targetReach)}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-[var(--background)]/75 px-3 py-2 rounded-xl border border-[var(--card-border)]/45 justify-end">
                          <div className="flex flex-col min-w-0 items-end">
                            <span className="text-[9px] uppercase font-sans font-extrabold tracking-wider text-[var(--muted-foreground)]/80 leading-none mb-0.5">Cost</span>
                            <strong className="text-emerald-500 text-xs font-bold font-mono truncate">{fmtCurrency(post.budget)}</strong>
                          </div>
                          <DollarSign size={14} className="text-emerald-500 shrink-0" />
                        </div>
                      </div>

                      {/* Card actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-[var(--card-border)]/45">
                        <span className="text-xs text-[var(--muted-foreground)] font-medium flex items-center gap-1.5">
                          <Calendar size={13} className="text-blue-500 shrink-0" />
                          <span>Release: <strong className="font-mono text-[var(--foreground)] font-bold">{post.publishDate}</strong></span>
                        </span>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="text-[11px] font-extrabold text-blue-500 hover:text-white px-3.5 py-1.5 rounded-full bg-blue-500/10 hover:bg-blue-500 transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1"
                          >
                            Edit Campaign
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-[11px] font-extrabold text-rose-500 hover:text-white px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500 transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Embed scrollbar styles locally to avoid editing files outside of the tool folder */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--card-border);
          border-radius: 999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--primary);
        }
      `}} />
    </div>
  );
}
