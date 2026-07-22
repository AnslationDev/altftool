"use client";

import {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import {
  Activity,
  ArrowLeft,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Keyboard,
  Layers,
  RefreshCw,
  Target,
  Timer,
  TrendingUp,
  Trophy,
} from "lucide-react";

const LESSONS = [
  { id: "b1", title: "Home Row — Left Hand", difficulty: "Beginner", keys: ["a","s","d","f"], text: "asdf asdf fdsa fdsa sad sad fad fad dad dad add add" },
  { id: "b2", title: "Home Row — Right Hand", difficulty: "Beginner", keys: ["j","k","l",";"], text: "jkl; jkl; ;lkj ;lkj jak jak lak lak ;ad ;ad" },
  { id: "b3", title: "Home Row — Full", difficulty: "Beginner", keys: ["a","s","d","f","j","k","l",";"], text: "asdf jkl; fdsa ;lkj asdf jkl; fdsa ;lkj fall dad sad jak half flask" },
  { id: "b4", title: "Top Row — Left Hand", difficulty: "Beginner", keys: ["q","w","e","r","t"], text: "qwert qwert trewq trewq wet wet rate rate tart tart deer deer" },
  { id: "b5", title: "Top Row — Right Hand", difficulty: "Beginner", keys: ["y","u","i","o","p"], text: "yuiop yuiop poiyu poiyu you you our our tip tip pop pop up up" },
  { id: "b6", title: "Top Row — Full", difficulty: "Beginner", keys: ["q","w","e","r","t","y","u","i","o","p"], text: "qwert yuiop poiuy trewq qwert yuiop type writer quick brown fox jumper" },
  { id: "b7", title: "Bottom Row — Left Hand", difficulty: "Beginner", keys: ["z","x","c","v","b"], text: "zxcvb zxcvb bvcxz bvcxz cab cab vat vat zebra zebra box box" },
  { id: "b8", title: "Bottom Row — Right Hand", difficulty: "Beginner", keys: ["n","m",",",".","/"], text: "nm,./ nm,./ /.,mn /.,mn man man new new can can the the run run" },
  { id: "b9", title: "Bottom Row — Full", difficulty: "Beginner", keys: ["z","x","c","v","b","n","m",",",".","/"], text: "zxcvbnm,./ /.,mnbvcxz zxcvbnm,./ crazy zebra mix box van can the man" },
  { id: "i1", title: "All Letters — Mixed", difficulty: "Intermediate", keys: "abcdefghijklmnopqrstuvwxyz".split(""), text: "the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs how vexingly quick daft zebras jump" },
  { id: "i2", title: "Shift Key Practice", difficulty: "Intermediate", keys: ["Shift"], text: "The Quick Brown Fox Jumps Over The Lazy Dog Pack My Box With Five Dozen Liquor Jugs How Vexingly Quick Daft Zebras Jump Sly Sam Slithers Silently" },
  { id: "i3", title: "Mixed Case & Punctuation", difficulty: "Intermediate", keys: "abcdefghijklmnopqrstuvwxyz,.'!?".split(""), text: "Hello! How are you? I'm doing great, thanks. What's new? Let's practice typing every day. It's fun! Don't you agree? Yes, I do. Great!" },
  { id: "i4", title: "Common Words — Part 1", difficulty: "Intermediate", keys: "abcdefghijklmnopqrstuvwxyz".split(""), text: "the and for are but not you all can had her was one our out has have been some them then when what which their this that from they will would could should" },
  { id: "i5", title: "Common Words — Part 2", difficulty: "Intermediate", keys: "abcdefghijklmnopqrstuvwxyz".split(""), text: "about after again because before between during everyone everything first great house inside large learn little might money morning never people place right school" },
  { id: "a1", title: "Numbers Row", difficulty: "Advanced", keys: "1234567890".split(""), text: "1234 5678 9012 3456 7890 1122 3344 5566 7788 9900 123 456 789 098 765 432 101 202 303 404 505" },
  { id: "a2", title: "Symbols Practice", difficulty: "Advanced", keys: "!@#$%^&*()".split(""), text: "!! @@ ## $$ %% ^^ && ** (()) !! @@ ## $$ %% ^^ && ** (()) !@ #$ %^ &* () !@ #$ %^ &* ()" },
  { id: "a3", title: "Numbers & Symbols", difficulty: "Advanced", keys: "1234567890!@#$%^&*()".split(""), text: "Pass123! #1Best @2024 $50% off (80s) Hits! Email: test@mail.com Price: $19.99 Rank #1 Score: 98% Call (555) 123-4567" },
  { id: "a4", title: "Advanced Paragraphs", difficulty: "Advanced", keys: "abcdefghijklmnopqrstuvwxyz,.!?".split(""), text: "Typing is a fundamental skill in the digital age. With regular practice, anyone can achieve impressive speeds while maintaining high accuracy. The key is to focus on proper finger placement, maintain a steady rhythm, and gradually increase difficulty. Remember that consistency matters more than intensity. Short daily sessions yield better results than long weekly marathons. Set goals, track your progress, and celebrate small victories along the way." },
  { id: "a5", title: "Technical Text", difficulty: "Advanced", keys: "abcdefghijklmnopqrstuvwxyz,.()/".split(""), text: "const App = () => { const [data, setData] = useState(null); useEffect(() => { fetchData().then(setData); }, []); return <div>{data}</div>; }; export default App; function(x, y) { return x * y + z; }" },
  { id: "a6", title: "Speed Builder", difficulty: "Advanced", keys: "abcdefghijklmnopqrstuvwxyz,.!?".split(""), text: "the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs how vexingly quick daft zebras jump the five boxing wizards jump quickly sphinx of black quartz judge my vow two driven jocks help fax my big quiz" },
];

const KEYBOARD_ROWS = [
  ["q","w","e","r","t","y","u","i","o","p","[","]","\\"],
  ["a","s","d","f","g","h","j","k","l",";","'"],
  ["z","x","c","v","b","n","m",",",".","/"],
];

const FINGER_MAP = {
  q:"left-pinky",a:"left-pinky",z:"left-pinky",
  w:"left-ring",s:"left-ring",x:"left-ring",
  e:"left-middle",d:"left-middle",c:"left-middle",
  r:"left-index",t:"left-index",f:"left-index",g:"left-index",v:"left-index",b:"left-index",
  y:"right-index",h:"right-index",u:"right-index",j:"right-index",n:"right-index",m:"right-index",
  i:"right-middle",k:"right-middle",",":"right-middle",
  o:"right-ring",l:"right-ring",".":"right-ring",
  p:"right-pinky",";":"right-pinky","/":"right-pinky","[":"right-pinky","]":"right-pinky","\\":"right-pinky","'":"right-pinky",
};

const FINGER_COLORS = {
  "left-pinky": "#EF4444",
  "left-ring": "#F97316",
  "left-middle": "#EAB308",
  "left-index": "#22C55E",
  "right-index": "#3B82F6",
  "right-middle": "#8B5CF6",
  "right-ring": "#EC4899",
  "right-pinky": "#06B6D4",
};

const FINGER_LABELS = {
  "left-pinky": "Pinky",
  "left-ring": "Ring",
  "left-middle": "Mid",
  "left-index": "Index",
  "right-index": "Index",
  "right-middle": "Mid",
  "right-ring": "Ring",
  "right-pinky": "Pinky",
};

const STORAGE_KEY = "typing-tutor-progress";

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lessons: {}, history: [], totalTime: 0, totalChars: 0 };
    return JSON.parse(raw);
  } catch {
    return { lessons: {}, history: [], totalTime: 0, totalChars: 0 };
  }
}

function saveProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function TopBar({ lesson, wpm, accuracy, timeElapsed, onBack }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--primary)]">
          <Trophy className="h-4 w-4" />
          {wpm} WPM
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--foreground)]">
          <Target className="h-4 w-4 text-[var(--primary)]" />
          {accuracy}%
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--muted-foreground)]">
          <Timer className="h-4 w-4" />
          {timeElapsed}s
        </span>
      </div>
    </div>
  );
}

function KeyboardVisual({ targetKeys, lastKey }) {
  const targetSet = useMemo(
    () => new Set(targetKeys.map((k) => k.toLowerCase())),
    [targetKeys],
  );

  return (
    <div className="w-full max-w-3xl mx-auto mb-6 select-none">
      <div className="flex flex-col items-center gap-1">
        {KEYBOARD_ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1">
            {row.map((key) => {
              const isActive = targetSet.has(key);
              const finger = isActive ? FINGER_MAP[key] : null;
              const color = finger ? FINGER_COLORS[finger] : null;
              const justPressed = lastKey === key;
              return (
                <div
                  key={key}
                  className={`relative flex items-center justify-center rounded-md text-xs font-bold transition-all duration-75
                    ${key.length > 1 ? "px-3" : "w-9 sm:w-11"} h-11
                    ${justPressed ? "scale-95 ring-2 ring-[var(--primary)]" : ""}
                    ${isActive ? "text-white shadow-sm" : "bg-[var(--surface-soft)] text-[var(--muted-foreground)] border border-[var(--border)]"}
                  `}
                  style={isActive ? { backgroundColor: color, borderColor: color } : {}}
                  title={isActive && finger ? `${key.toUpperCase()} — ${FINGER_LABELS[finger]} finger` : key.toUpperCase()}
                  aria-label={`Key ${key.toUpperCase()}${isActive ? ` — ${FINGER_LABELS[finger]} finger` : ""}`}
                >
                  {key}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function LessonSelector({ lessons, progress, onSelect, difficultyFilter, setDifficultyFilter }) {
  const [expanded, setExpanded] = useState("Beginner");

  const filtered = lessons.filter(
    (l) => difficultyFilter === "All" || l.difficulty === difficultyFilter,
  );

  const grouped = filtered.reduce((acc, l) => {
    if (!acc[l.difficulty]) acc[l.difficulty] = [];
    acc[l.difficulty].push(l);
    return acc;
  }, {});

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex flex-wrap gap-2 mb-6">
        {["All","Beginner","Intermediate","Advanced"].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDifficultyFilter(d)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              difficultyFilter === d
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {Object.entries(grouped).map(([diff, ls]) => (
          <div key={diff} className="border border-[var(--border)] rounded-xl bg-[var(--card)] overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(expanded === diff ? null : diff)}
              className="flex items-center justify-between w-full px-5 py-3 text-left font-bold text-[var(--foreground)] cursor-pointer hover:bg-[var(--surface-soft)] transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                {diff === "Beginner" ? <BookOpen className="h-4 w-4 text-green-500" /> : diff === "Intermediate" ? <Layers className="h-4 w-4 text-yellow-500" /> : <Award className="h-4 w-4 text-red-500" />}
                {diff}
                <span className="text-xs font-normal text-[var(--muted-foreground)]">({ls.length} lessons)</span>
              </span>
              {expanded === diff ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            {expanded === diff && (
              <div className="divide-y divide-[var(--border)]">
                {ls.map((l) => {
                  const p = progress.lessons[l.id];
                  const completed = p?.completed;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => onSelect(l)}
                      className="flex items-center gap-3 w-full px-5 py-3 text-left text-sm hover:bg-[var(--surface-soft)] transition-colors cursor-pointer group"
                    >
                      <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${completed ? "bg-[var(--primary)] border-[var(--primary)]" : "border-[var(--border)] group-hover:border-[var(--primary)]"}`}>
                        {completed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                      </span>
                      <span className={`flex-1 ${completed ? "text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>
                        {l.title}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {p ? `${p.bestWpm || 0} WPM` : "—"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressCharts({ progress }) {
  const history = progress.history || [];

  const recentHistory = history.slice(-20);

  const totalLessons = Object.values(progress.lessons || {}).filter(
    (l) => l.completed,
  ).length;
  const totalSessions = history.length;

  const avgWpm =
    totalSessions > 0
      ? Math.round(
          history.reduce((s, h) => s + (h.wpm || 0), 0) / totalSessions,
        )
      : 0;
  const avgAccuracy =
    totalSessions > 0
      ? Math.round(
          history.reduce((s, h) => s + (h.accuracy || 0), 0) / totalSessions,
        )
      : 0;

  if (totalSessions === 0) {
    return (
      <div className="text-center py-16 text-[var(--muted-foreground)]">
        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-40" />
        <p className="font-semibold">No progress yet</p>
        <p className="text-sm mt-1">Complete a lesson to see your stats.</p>
      </div>
    );
  }

  const maxWpm = Math.max(...recentHistory.map((h) => h.wpm || 0), 1);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Lessons Done", value: totalLessons, icon: BookOpen, color: "text-[var(--primary)]" },
          { label: "Sessions", value: totalSessions, icon: Activity, color: "text-blue-500" },
          { label: "Avg WPM", value: avgWpm, icon: TrendingUp, color: "text-green-500" },
          { label: "Avg Accuracy", value: `${avgAccuracy}%`, icon: Target, color: "text-yellow-500" },
        ].map((s) => (
          <div key={s.label} className="border border-[var(--border)] rounded-xl bg-[var(--card)] p-4 text-center">
            <s.icon className={`h-5 w-5 mx-auto mb-1.5 ${s.color}`} />
            <p className="text-2xl font-black text-[var(--foreground)]">{s.value}</p>
            <p className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[var(--primary)]" />
          WPM Trend
        </h3>
        <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] p-4">
          <div className="flex items-end gap-1.5 h-32">
            {recentHistory.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <span className="text-[10px] font-bold text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity">
                  {h.wpm}
                </span>
                <div
                  className="w-full rounded-t-sm transition-all duration-200"
                  style={{
                    height: `${(h.wpm / maxWpm) * 100}%`,
                    backgroundColor: h.accuracy >= 90 ? "var(--primary)" : h.accuracy >= 75 ? "#EAB308" : "#EF4444",
                    minHeight: "4px",
                  }}
                  title={`${h.wpm} WPM — ${h.accuracy}%`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-[var(--muted-foreground)]">
            <span>Recent</span>
            <span>Older</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
          <Target className="h-4 w-4 text-[var(--primary)]" />
          Accuracy Trend
        </h3>
        <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] p-4">
          <div className="flex items-end gap-1.5 h-24">
            {recentHistory.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <span className="text-[10px] font-bold text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity">
                  {h.accuracy}%
                </span>
                <div
                  className="w-full rounded-t-sm"
                  style={{
                    height: `${h.accuracy}%`,
                    backgroundColor: h.accuracy >= 90 ? "var(--primary)" : h.accuracy >= 75 ? "#EAB308" : "#EF4444",
                    minHeight: "4px",
                  }}
                  title={`${h.accuracy}%`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabBar({ active, onChange }) {
  const tabs = [
    { id: "lessons", label: "Lessons", icon: BookOpen },
    { id: "progress", label: "Progress", icon: BarChart3 },
  ];
  return (
    <div className="flex gap-1 mb-6 bg-[var(--surface-soft)] p-1 rounded-xl w-fit mx-auto">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
            active === t.id
              ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          <t.icon className="h-4 w-4" />
          {t.label}
        </button>
      ))}
    </div>
  );
}

function HomeScreen({ lessons, progress, onStartLesson, difficultyFilter, setDifficultyFilter }) {
  return (
    <LessonSelector
      lessons={lessons}
      progress={progress}
      onSelect={onStartLesson}
      difficultyFilter={difficultyFilter}
      setDifficultyFilter={setDifficultyFilter}
    />
  );
}

function LessonScreen({ lesson, progress, onComplete, onBack }) {
  const [typed, setTyped] = useState("");
  const [errors, setErrors] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [lastKey, setLastKey] = useState(null);
  const [wpmHistory, setWpmHistory] = useState([]);

  const inputRef = useRef(null);
  const startTimeRef = useRef(null);

  const TEXT = lesson.text;

  const correctChars = useMemo(
    () => typed.split("").filter((c, i) => c === TEXT[i]).length,
    [typed, TEXT],
  );

  const wpm = useMemo(() => {
    const minutes = timeElapsed / 60 || 1 / 60;
    return Math.round((correctChars / 5) / minutes);
  }, [correctChars, timeElapsed]);

  const accuracy = useMemo(
    () => (totalKeystrokes > 0 ? Math.round((correctChars / totalKeystrokes) * 100) : 100),
    [correctChars, totalKeystrokes],
  );

  useEffect(() => {
    if (running) {
      const interval = setInterval(() => {
        setTimeElapsed((p) => p + 1);
        setWpmHistory((prev) => [
          ...prev,
          {
            wpm: Math.round(
              (typed.split("").filter((c, i) => c === TEXT[i]).length / 5) /
                ((timeElapsed + 1) / 60 || 1 / 60),
            ),
            accuracy:
              totalKeystrokes > 0
                ? Math.round(
                    (typed.split("").filter((c, i) => c === TEXT[i]).length /
                      totalKeystrokes) *
                      100,
                  )
                : 100,
          },
        ]);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [running]);

  const handleKeyDown = useCallback(
    (e) => {
      if (completed || typed.length >= TEXT.length) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        if (typed.length > 0) {
          const removedChar = typed[typed.length - 1];
          const expectedChar = TEXT[typed.length - 1];
          setTyped((p) => p.slice(0, -1));
          if (removedChar !== expectedChar) {
            setErrors((p) => Math.max(p - 1, 0));
          }
          setTotalKeystrokes((p) => Math.max(p - 1, 0));
        }
        return;
      }

      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key.length === 1 || e.key === "Shift") {
        e.preventDefault();
        if (e.key === "Shift") {
          setLastKey("Shift");
          setTimeout(() => setLastKey(null), 150);
          return;
        }

        if (!startTimeRef.current) {
          startTimeRef.current = Date.now();
        }

        setLastKey(e.key.toLowerCase());
        setTimeout(() => setLastKey(null), 150);

        const index = typed.length;
        if (index < TEXT.length) {
          const isCorrect = e.key === TEXT[index];
          if (!isCorrect) {
            setErrors((p) => p + 1);
          }
          setTyped((p) => p + e.key);
          setTotalKeystrokes((p) => p + 1);
          setRunning(true);
        }

        if (typed.length + 1 >= TEXT.length) {
          setCompleted(true);
          setRunning(false);
        }
      }
    },
    [typed, TEXT, completed],
  );

  useEffect(() => {
    if (completed) {
      const p = progress.lessons[lesson.id] || {};
      const bestWpm = Math.max(p.bestWpm || 0, wpm);
      const bestAccuracy = Math.max(p.bestAccuracy || 0, accuracy);
      const attempts = (p.attempts || 0) + 1;

      const updatedProgress = {
        ...progress,
        lessons: {
          ...progress.lessons,
          [lesson.id]: {
            completed: true,
            bestWpm,
            bestAccuracy,
            attempts,
            lastWpm: wpm,
            lastAccuracy: accuracy,
          },
        },
        history: [
          ...(progress.history || []),
          {
            date: Date.now(),
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            wpm,
            accuracy,
            errors,
            totalChars: TEXT.length,
          },
        ],
        totalTime: (progress.totalTime || 0) + timeElapsed,
        totalChars: (progress.totalChars || 0) + typed.length,
      };
      saveProgress(updatedProgress);
      onComplete(updatedProgress, { wpm, accuracy, errors });
    }
  }, [completed]);

  const resetLesson = useCallback(() => {
    setTyped("");
    setErrors(0);
    setTotalKeystrokes(0);
    setTimeElapsed(0);
    setRunning(false);
    setCompleted(false);
    setLastKey(null);
    setWpmHistory([]);
    startTimeRef.current = null;
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <TopBar lesson={lesson} wpm={wpm} accuracy={accuracy} timeElapsed={timeElapsed} onBack={onBack} />

      <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] p-4 sm:p-6 mb-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[var(--foreground)]">{lesson.title}</h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Keys: {lesson.keys.join(", ")}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            lesson.difficulty === "Beginner" ? "bg-green-500/10 text-green-600" :
            lesson.difficulty === "Intermediate" ? "bg-yellow-500/10 text-yellow-600" :
            "bg-red-500/10 text-red-600"
          }`}>
            {lesson.difficulty}
          </span>
        </div>

        <KeyboardVisual targetKeys={lesson.keys} lastKey={lastKey} />

        <div
          ref={inputRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 sm:p-6 text-base sm:text-lg leading-relaxed font-mono select-none min-h-[100px] outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] cursor-text transition-all"
          aria-label="Typing area"
          role="textbox"
          aria-multiline="false"
        >
          {TEXT.split("").map((char, i) => {
            let cls = "text-[var(--muted-foreground)]";
            if (i < typed.length) {
              cls =
                typed[i] === char
                  ? "text-[var(--primary)]"
                  : "text-red-500 font-bold bg-red-500/10 rounded";
            }
            if (i === typed.length && !completed) {
              cls += " bg-[var(--primary)]/20 text-[var(--foreground)] rounded-sm animate-pulse";
            }
            if (i === typed.length && completed) {
              cls += " bg-green-500/20 text-green-500 rounded-sm";
            }
            return (
              <span key={i} className={cls}>
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </div>

        <div className="mt-4">
          <div className="w-full h-2 bg-[var(--surface-soft)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((typed.length / TEXT.length) * 100, 100)}%`,
                backgroundColor:
                  accuracy >= 90 ? "var(--primary)" : accuracy >= 75 ? "#EAB308" : "#EF4444",
              }}
            />
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-1 text-right">
            {typed.length} / {TEXT.length} characters
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            type="button"
            onClick={resetLesson}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] text-sm font-semibold hover:bg-[var(--surface-soft)] transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] p-3 sm:p-4 text-center">
          <p className="text-[10px] font-bold uppercase text-[var(--muted-foreground)] tracking-wider">WPM</p>
          <p className="text-2xl sm:text-3xl font-black text-[var(--primary)]">{wpm}</p>
        </div>
        <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] p-3 sm:p-4 text-center">
          <p className="text-[10px] font-bold uppercase text-[var(--muted-foreground)] tracking-wider">Accuracy</p>
          <p className={`text-2xl sm:text-3xl font-black ${accuracy >= 90 ? "text-green-500" : accuracy >= 75 ? "text-yellow-500" : "text-red-500"}`}>
            {accuracy}%
          </p>
        </div>
        <div className="border border-[var(--border)] rounded-xl bg-[var(--card)] p-3 sm:p-4 text-center">
          <p className="text-[10px] font-bold uppercase text-[var(--muted-foreground)] tracking-wider">Errors</p>
          <p className="text-2xl sm:text-3xl font-black text-red-500">{errors}</p>
        </div>
      </div>

      {completed && (
        <div className="mt-6 border border-[var(--primary)]/30 bg-[var(--primary)]/5 rounded-xl p-6 text-center">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-[var(--primary)]" />
          <h3 className="text-xl font-black text-[var(--foreground)]">Lesson Complete!</h3>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {wpm} WPM — {accuracy}% accuracy — {errors} errors
          </p>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            <button
              type="button"
              onClick={() => { resetLesson(); }}
              className="px-6 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Practice Again
            </button>
            <button
              type="button"
              onClick={() => {
                onBack();
              }}
              className="px-6 py-2.5 rounded-lg border border-[var(--border)] text-[var(--foreground)] text-sm font-bold hover:bg-[var(--surface-soft)] transition-colors cursor-pointer"
            >
              Back to Lessons
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ToolHome() {
  const [progress, setProgress] = useState(loadProgress);
  const [activeTab, setActiveTab] = useState("lessons");
  const [activeLesson, setActiveLesson] = useState(null);
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const handleStartLesson = useCallback((lesson) => {
    setActiveLesson(lesson);
  }, []);

  const handleBack = useCallback(() => {
    setActiveLesson(null);
  }, []);

  const handleComplete = useCallback((updatedProgress) => {
    setProgress(updatedProgress);
  }, []);

  if (activeLesson) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
        <div className="mx-auto max-w-4xl">
          <LessonScreen
            lesson={activeLesson}
            progress={progress}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)]">
      <div className="mx-auto max-w-5xl">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-bold text-[var(--primary)] mb-4">
            <Keyboard className="h-3.5 w-3.5" />
            Typing Tutor
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--foreground)]">
            Master Touch Typing
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-xl mx-auto">
            Structured lessons from home row to advanced. Build muscle memory, track your speed, and improve accuracy.
          </p>
        </header>

        <TabBar active={activeTab} onChange={setActiveTab} />

        {activeTab === "lessons" && (
          <HomeScreen
            lessons={LESSONS}
            progress={progress}
            onStartLesson={handleStartLesson}
            difficultyFilter={difficultyFilter}
            setDifficultyFilter={setDifficultyFilter}
          />
        )}

        {activeTab === "progress" && (
          <ProgressCharts progress={progress} />
        )}
      </div>
    </main>
  );
}
