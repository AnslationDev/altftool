"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Monitor, Globe, Terminal, Code2, PenTool, Image, Table,
  Keyboard, ArrowLeft, ChevronLeft, ChevronRight,
  RotateCcw, CheckCircle2, XCircle, BookOpen, Zap,
  BarChart3, Lightbulb, FlipHorizontal,
  Trophy, LayoutGrid
} from "lucide-react";

const STORAGE_KEY = "altft_keyboard_shortcut_trainer";

const PLATFORMS = [
  {
    id: "windows", name: "Windows", icon: Monitor, color: "text-blue-500",
    shortcuts: {
      easy: [
        { keys: { ctrl: true, key: "c" }, description: "Copy selected item", display: "Ctrl + C" },
        { keys: { ctrl: true, key: "v" }, description: "Paste from clipboard", display: "Ctrl + V" },
        { keys: { ctrl: true, key: "x" }, description: "Cut selected item", display: "Ctrl + X" },
        { keys: { ctrl: true, key: "z" }, description: "Undo last action", display: "Ctrl + Z" },
        { keys: { ctrl: true, key: "a" }, description: "Select all", display: "Ctrl + A" },
        { keys: { ctrl: true, key: "s" }, description: "Save current file", display: "Ctrl + S" },
      ],
      medium: [
        { keys: { alt: true, key: "Tab" }, description: "Switch between open windows", display: "Alt + Tab" },
        { keys: { alt: true, key: "F4" }, description: "Close active window", display: "Alt + F4" },
        { keys: { ctrl: true, shift: true, key: "Escape" }, description: "Open Task Manager", display: "Ctrl + Shift + Esc" },
        { keys: { ctrl: true, shift: true, key: "n" }, description: "Create new folder", display: "Ctrl + Shift + N" },
        { keys: { key: "F2" }, description: "Rename selected item", display: "F2" },
        { keys: { key: "F5" }, description: "Refresh active window", display: "F5" },
      ],
      hard: [
        { keys: { ctrl: true, shift: true, key: "s" }, description: "Open Save As dialog", display: "Ctrl + Shift + S" },
        { keys: { ctrl: true, shift: true, key: "z" }, description: "Redo last undone action", display: "Ctrl + Shift + Z" },
        { keys: { ctrl: true, shift: true, key: "Escape" }, description: "Open Task Manager", display: "Ctrl + Shift + Esc" },
        { keys: { alt: true, key: "Enter" }, description: "Open properties of selected item", display: "Alt + Enter" },
        { keys: { ctrl: true, key: "Backspace" }, description: "Delete previous word", display: "Ctrl + Backspace" },
      ],
    },
  },
  {
    id: "macos", name: "macOS", icon: Monitor, color: "text-gray-400",
    shortcuts: {
      easy: [
        { keys: { meta: true, key: "c" }, description: "Copy selected item", display: "Cmd + C" },
        { keys: { meta: true, key: "v" }, description: "Paste from clipboard", display: "Cmd + V" },
        { keys: { meta: true, key: "x" }, description: "Cut selected item", display: "Cmd + X" },
        { keys: { meta: true, key: "z" }, description: "Undo last action", display: "Cmd + Z" },
        { keys: { meta: true, key: "a" }, description: "Select all", display: "Cmd + A" },
        { keys: { meta: true, key: "s" }, description: "Save current file", display: "Cmd + S" },
      ],
      medium: [
        { keys: { meta: true, key: " " }, description: "Open Spotlight Search", display: "Cmd + Space" },
        { keys: { meta: true, alt: true, key: "Escape" }, description: "Open Force Quit dialog", display: "Cmd + Option + Esc" },
        { keys: { meta: true, key: "h" }, description: "Hide current app", display: "Cmd + H" },
        { keys: { meta: true, key: "m" }, description: "Minimize current window", display: "Cmd + M" },
        { keys: { meta: true, key: "q" }, description: "Quit current app", display: "Cmd + Q" },
        { keys: { meta: true, key: "w" }, description: "Close current window", display: "Cmd + W" },
      ],
      hard: [
        { keys: { meta: true, alt: true, key: "h" }, description: "Hide all other apps", display: "Cmd + Option + H" },
        { keys: { meta: true, alt: true, key: "d" }, description: "Toggle Dock visibility", display: "Cmd + Option + D" },
        { keys: { meta: true, shift: true, key: "n" }, description: "Create new folder in Finder", display: "Cmd + Shift + N" },
        { keys: { meta: true, shift: true, key: "g" }, description: "Go to folder in Finder", display: "Cmd + Shift + G" },
        { keys: { meta: true, ctrl: true, key: " " }, description: "Open Emoji picker", display: "Cmd + Ctrl + Space" },
      ],
    },
  },
  {
    id: "linux", name: "Linux", icon: Terminal, color: "text-orange-500",
    shortcuts: {
      easy: [
        { keys: { ctrl: true, key: "c" }, description: "Copy selected text", display: "Ctrl + C" },
        { keys: { ctrl: true, key: "v" }, description: "Paste from clipboard", display: "Ctrl + V" },
        { keys: { ctrl: true, key: "x" }, description: "Cut selected text", display: "Ctrl + X" },
        { keys: { ctrl: true, key: "z" }, description: "Undo last action", display: "Ctrl + Z" },
        { keys: { ctrl: true, key: "a" }, description: "Select all", display: "Ctrl + A" },
        { keys: { ctrl: true, key: "s" }, description: "Save current file", display: "Ctrl + S" },
        { keys: { ctrl: true, alt: true, key: "t" }, description: "Open terminal", display: "Ctrl + Alt + T" },
      ],
      medium: [
        { keys: { alt: true, key: "Tab" }, description: "Switch between windows", display: "Alt + Tab" },
        { keys: { alt: true, key: "F2" }, description: "Open Run Command dialog", display: "Alt + F2" },
        { keys: { alt: true, key: "F4" }, description: "Close current window", display: "Alt + F4" },
        { keys: { ctrl: true, alt: true, key: "Delete" }, description: "Open system logout/shutdown", display: "Ctrl + Alt + Del" },
      ],
      hard: [
        { keys: { ctrl: true, alt: true, key: "F1" }, description: "Switch to first TTY terminal", display: "Ctrl + Alt + F1" },
        { keys: { ctrl: true, shift: true, key: "Escape" }, description: "Open System Monitor", display: "Ctrl + Shift + Esc" },
        { keys: { ctrl: true, key: "h" }, description: "Toggle hidden files in file manager", display: "Ctrl + H" },
        { keys: { ctrl: true, shift: true, key: "n" }, description: "Create a new folder", display: "Ctrl + Shift + N" },
      ],
    },
  },
  {
    id: "vscode", name: "VS Code", icon: Code2, color: "text-blue-400",
    shortcuts: {
      easy: [
        { keys: { ctrl: true, key: "p" }, description: "Quick Open file", display: "Ctrl + P" },
        { keys: { ctrl: true, shift: true, key: "p" }, description: "Open Command Palette", display: "Ctrl + Shift + P" },
        { keys: { ctrl: true, key: "`" }, description: "Toggle integrated terminal", display: "Ctrl + `" },
        { keys: { ctrl: true, key: "/" }, description: "Toggle line comment", display: "Ctrl + /" },
        { keys: { ctrl: true, key: "f" }, description: "Find in file", display: "Ctrl + F" },
        { keys: { ctrl: true, key: "d" }, description: "Select next occurrence", display: "Ctrl + D" },
      ],
      medium: [
        { keys: { ctrl: true, key: "b" }, description: "Toggle sidebar visibility", display: "Ctrl + B" },
        { keys: { ctrl: true, shift: true, key: "k" }, description: "Delete current line", display: "Ctrl + Shift + K" },
        { keys: { alt: true, key: "ArrowUp" }, description: "Move line up", display: "Alt + Up" },
        { keys: { alt: true, key: "ArrowDown" }, description: "Move line down", display: "Alt + Down" },
        { keys: { key: "F12" }, description: "Go to definition", display: "F12" },
        { keys: { ctrl: true, key: " " }, description: "Trigger suggestion", display: "Ctrl + Space" },
      ],
      hard: [
        { keys: { ctrl: true, shift: true, key: "o" }, description: "Go to symbol in file", display: "Ctrl + Shift + O" },
        { keys: { shift: true, alt: true, key: "f" }, description: "Format document", display: "Shift + Alt + F" },
        { keys: { ctrl: true, key: "k" }, description: "Open keybindings editor (Ctrl+K Ctrl+S)", display: "Ctrl + K" },
        { keys: { ctrl: true, shift: true, key: "l" }, description: "Select all occurrences of current selection", display: "Ctrl + Shift + L" },
        { keys: { ctrl: true, alt: true, key: "ArrowUp" }, description: "Add cursor above", display: "Ctrl + Alt + Up" },
      ],
    },
  },
  {
    id: "chrome", name: "Chrome", icon: Globe, color: "text-yellow-500",
    shortcuts: {
      easy: [
        { keys: { ctrl: true, key: "t" }, description: "Open new tab", display: "Ctrl + T" },
        { keys: { ctrl: true, key: "w" }, description: "Close current tab", display: "Ctrl + W" },
        { keys: { ctrl: true, shift: true, key: "t" }, description: "Reopen last closed tab", display: "Ctrl + Shift + T" },
        { keys: { ctrl: true, key: "Tab" }, description: "Switch to next tab", display: "Ctrl + Tab" },
        { keys: { ctrl: true, shift: true, key: "Tab" }, description: "Switch to previous tab", display: "Ctrl + Shift + Tab" },
        { keys: { ctrl: true, key: "l" }, description: "Focus address bar", display: "Ctrl + L" },
        { keys: { ctrl: true, key: "f" }, description: "Find on page", display: "Ctrl + F" },
      ],
      medium: [
        { keys: { ctrl: true, shift: true, key: "n" }, description: "Open incognito window", display: "Ctrl + Shift + N" },
        { keys: { ctrl: true, key: "h" }, description: "Open history page", display: "Ctrl + H" },
        { keys: { ctrl: true, key: "j" }, description: "Open downloads page", display: "Ctrl + J" },
        { keys: { ctrl: true, key: "d" }, description: "Bookmark current page", display: "Ctrl + D" },
        { keys: { ctrl: true, key: "r" }, description: "Reload current page", display: "Ctrl + R" },
      ],
      hard: [
        { keys: { key: "F12" }, description: "Open Developer Tools", display: "F12" },
        { keys: { ctrl: true, shift: true, key: "j" }, description: "Open Console in DevTools", display: "Ctrl + Shift + J" },
        { keys: { ctrl: true, shift: true, key: "c" }, description: "Open Inspect Element tool", display: "Ctrl + Shift + C" },
        { keys: { ctrl: true, shift: true, key: "r" }, description: "Hard reload bypassing cache", display: "Ctrl + Shift + R" },
        { keys: { ctrl: true, key: "u" }, description: "View page source", display: "Ctrl + U" },
      ],
    },
  },
  {
    id: "figma", name: "Figma", icon: PenTool, color: "text-purple-500",
    shortcuts: {
      easy: [
        { keys: { key: "v" }, description: "Select Move tool", display: "V" },
        { keys: { key: "f" }, description: "Select Frame tool", display: "F" },
        { keys: { key: "t" }, description: "Select Text tool", display: "T" },
        { keys: { key: "r" }, description: "Select Rectangle tool", display: "R" },
        { keys: { key: "o" }, description: "Select Ellipse tool", display: "O" },
        { keys: { ctrl: true, key: "d" }, description: "Duplicate selected element", display: "Ctrl + D" },
        { keys: { ctrl: true, key: "g" }, description: "Group selected elements", display: "Ctrl + G" },
      ],
      medium: [
        { keys: { ctrl: true, shift: true, key: "g" }, description: "Ungroup elements", display: "Ctrl + Shift + G" },
        { keys: { ctrl: true, alt: true, key: "g" }, description: "Add auto layout to selection", display: "Ctrl + Alt + G" },
        { keys: { ctrl: true, key: "b" }, description: "Toggle bold text", display: "Ctrl + B" },
        { keys: { ctrl: true, shift: true, key: "h" }, description: "Toggle layer visibility", display: "Ctrl + Shift + H" },
        { keys: { ctrl: true, alt: true, key: "k" }, description: "Create component from selection", display: "Ctrl + Alt + K" },
      ],
      hard: [
        { keys: { ctrl: true, key: "r" }, description: "Rename selected layer", display: "Ctrl + R" },
        { keys: { ctrl: true, key: "p" }, description: "Toggle pixel preview", display: "Ctrl + P" },
        { keys: { ctrl: true, shift: true, key: "?" }, description: "Show keyboard shortcuts overlay", display: "Ctrl + Shift + ?" },
        { keys: { alt: true, key: "ArrowUp" }, description: "Nudge selected element by 10px", display: "Alt + Up" },
      ],
    },
  },
  {
    id: "photoshop", name: "Photoshop", icon: Image, color: "text-blue-700",
    shortcuts: {
      easy: [
        { keys: { ctrl: true, key: "n" }, description: "Create new document", display: "Ctrl + N" },
        { keys: { ctrl: true, key: "o" }, description: "Open existing document", display: "Ctrl + O" },
        { keys: { ctrl: true, key: "s" }, description: "Save document", display: "Ctrl + S" },
        { keys: { ctrl: true, key: "z" }, description: "Undo last action", display: "Ctrl + Z" },
        { keys: { ctrl: true, key: "d" }, description: "Deselect active selection", display: "Ctrl + D" },
        { keys: { ctrl: true, key: "i" }, description: "Invert colors of layer", display: "Ctrl + I" },
        { keys: { key: "b" }, description: "Select Brush tool", display: "B" },
      ],
      medium: [
        { keys: { ctrl: true, key: "t" }, description: "Free transform selection/layer", display: "Ctrl + T" },
        { keys: { ctrl: true, key: "j" }, description: "Duplicate current layer", display: "Ctrl + J" },
        { keys: { ctrl: true, key: "e" }, description: "Merge selected layers", display: "Ctrl + E" },
        { keys: { ctrl: true, key: "u" }, description: "Open Hue/Saturation adjustment", display: "Ctrl + U" },
        { keys: { ctrl: true, key: "l" }, description: "Open Levels adjustment", display: "Ctrl + L" },
        { keys: { ctrl: true, shift: true, key: "n" }, description: "Create new layer", display: "Ctrl + Shift + N" },
      ],
      hard: [
        { keys: { ctrl: true, shift: true, key: "u" }, description: "Desaturate layer", display: "Ctrl + Shift + U" },
        { keys: { ctrl: true, shift: true, key: "i" }, description: "Invert active selection", display: "Ctrl + Shift + I" },
        { keys: { ctrl: true, alt: true, shift: true, key: "e" }, description: "Stamp visible layers into new layer", display: "Ctrl + Alt + Shift + E" },
        { keys: { key: "Tab" }, description: "Toggle all panel visibility", display: "Tab" },
        { keys: { key: "F" }, description: "Cycle through screen modes", display: "F" },
      ],
    },
  },
  {
    id: "excel", name: "Excel", icon: Table, color: "text-green-600",
    shortcuts: {
      easy: [
        { keys: { ctrl: true, key: "c" }, description: "Copy selected cells", display: "Ctrl + C" },
        { keys: { ctrl: true, key: "v" }, description: "Paste from clipboard", display: "Ctrl + V" },
        { keys: { ctrl: true, key: "z" }, description: "Undo last action", display: "Ctrl + Z" },
        { keys: { ctrl: true, key: "s" }, description: "Save workbook", display: "Ctrl + S" },
        { keys: { ctrl: true, key: "b" }, description: "Toggle bold formatting", display: "Ctrl + B" },
        { keys: { ctrl: true, key: "a" }, description: "Select entire worksheet", display: "Ctrl + A" },
        { keys: { ctrl: true, key: "n" }, description: "Create new workbook", display: "Ctrl + N" },
      ],
      medium: [
        { keys: { ctrl: true, key: "f" }, description: "Open Find dialog", display: "Ctrl + F" },
        { keys: { ctrl: true, key: "h" }, description: "Open Replace dialog", display: "Ctrl + H" },
        { keys: { ctrl: true, shift: true, key: "l" }, description: "Toggle auto-filter on selection", display: "Ctrl + Shift + L" },
        { keys: { alt: true, key: "=" }, description: "AutoSum selected cells", display: "Alt + =" },
        { keys: { ctrl: true, key: "d" }, description: "Fill down from cell above", display: "Ctrl + D" },
        { keys: { key: "F4" }, description: "Repeat last action", display: "F4" },
      ],
      hard: [
        { keys: { ctrl: true, key: "`" }, description: "Toggle formula view in cells", display: "Ctrl + `" },
        { keys: { ctrl: true, key: ";" }, description: "Insert current date", display: "Ctrl + ;" },
        { keys: { ctrl: true, shift: true, key: ";" }, description: "Insert current time", display: "Ctrl + Shift + ;" },
        { keys: { ctrl: true, key: "1" }, description: "Open Format Cells dialog", display: "Ctrl + 1" },
        { keys: { ctrl: true, shift: true, key: "~" }, description: "Apply General number format", display: "Ctrl + Shift + ~" },
      ],
    },
  },
];

function getNormalizedKey(event) {
  let key = event.key;
  if (key && key.length === 1 && /[a-zA-Z]/.test(key)) {
    return key.toLowerCase();
  }
  return key;
}

function keysMatch(event, expected) {
  const normKey = getNormalizedKey(event);
  if (normKey !== expected.key) return false;
  if (event.ctrlKey !== !!expected.ctrl) return false;
  if (event.altKey !== !!expected.alt) return false;
  if (event.shiftKey !== !!expected.shift) return false;
  if (event.metaKey !== !!expected.meta) return false;
  return true;
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {}
}

function CategoryCard({ platform, progress, onSelect, index }) {
  const Icon = platform.icon;
  const platformProgress = progress[platform.id];
  const totalShortcuts =
    (platform.shortcuts.easy?.length || 0) +
    (platform.shortcuts.medium?.length || 0) +
    (platform.shortcuts.hard?.length || 0);
  const completedCount = platformProgress
    ? (platformProgress.easy?.completed?.length || 0) +
      (platformProgress.medium?.completed?.length || 0) +
      (platformProgress.hard?.completed?.length || 0)
    : 0;
  const pct = totalShortcuts > 0 ? Math.round((completedCount / totalShortcuts) * 100) : 0;

  return (
    <button
      onClick={() => onSelect(platform.id)}
      className="group flex flex-col items-center gap-3 p-5 bg-(--card) border border-(--border) rounded-xl
        hover:shadow-md hover:border-(--primary)/30 transition-all duration-150 cursor-pointer text-center
        focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40"
      aria-label={`${platform.name}: ${completedCount} of ${totalShortcuts} shortcuts mastered`}
    >
      <div className={`p-3 rounded-lg bg-(--primary)/10 ${platform.color} transition-colors`}>
        <Icon size={28} strokeWidth={1.75} />
      </div>
      <div className="w-full">
        <span className="block font-semibold text-sm text-(--foreground)">{platform.name}</span>
        <span className="block text-xs text-(--muted-foreground) mt-1">
          {completedCount}/{totalShortcuts} mastered
        </span>
        <div className="mt-2 w-full h-1.5 bg-(--border) rounded-full overflow-hidden">
          <div
            className="h-full bg-(--primary) rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </button>
  );
}

function DifficultyPill({ level, active, onClick, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150
        border cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40
        ${active
          ? "bg-(--primary) text-white border-(--primary) shadow-sm"
          : "bg-(--card) text-(--foreground) border-(--border) hover:border-(--primary)/40"
        }`}
      aria-pressed={active}
    >
      {level}
      <span className="ml-1.5 text-xs opacity-70">({count})</span>
    </button>
  );
}

function PressedKeysDisplay({ keysPressed }) {
  const modifiers = [];
  if (keysPressed.ctrl) modifiers.push("Ctrl");
  if (keysPressed.alt) modifiers.push("Alt");
  if (keysPressed.shift) modifiers.push("Shift");
  if (keysPressed.meta) modifiers.push("Cmd");

  const keyLabel = keysPressed.key
    ? ({ " ": "Space", Tab: "Tab", Escape: "Esc", ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→" }[keysPressed.key] || keysPressed.key.toUpperCase())
    : null;

  const allParts = [...modifiers, ...(keyLabel ? [keyLabel] : [])];

  if (allParts.length === 0) {
    return (
      <span className="text-(--muted-foreground) text-sm italic">
        Press the shortcut keys...
      </span>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap" aria-live="polite">
      {allParts.map((part, i) => (
        <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-md bg-(--primary)/10 border border-(--primary)/20 text-(--primary) font-mono text-sm font-bold">
          {part}
        </span>
      ))}
    </div>
  );
}

function FeedbackOverlay({ type }) {
  if (!type) return null;
  const isCorrect = type === "correct";
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-50 flex items-center justify-center transition-opacity duration-200`}
      style={{ animation: "feedbackFlash 0.6s ease-out" }}
    >
      <div
        className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg backdrop-blur-sm ${
          isCorrect ? "bg-green-500/15 text-green-600 dark:text-green-400" : "bg-red-500/15 text-red-600 dark:text-red-400"
        }`}
      >
        {isCorrect ? <CheckCircle2 size={28} /> : <XCircle size={28} />}
        <span className="text-lg font-bold">{isCorrect ? "Correct!" : "Wrong"}</span>
      </div>
      <style jsx>{`
        @keyframes feedbackFlash {
          0% { opacity: 0; transform: scale(0.8); }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
}

function PracticeMode({
  shortcuts,
  difficulty,
  platformId,
  onComplete,
  onBack,
  progress,
  onProgressUpdate,
  platformName,
}) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, incorrect: 0, streak: 0, bestStreak: 0 });
  const [feedback, setFeedback] = useState(null);
  const [pressedKeys, setPressedKeys] = useState({ ctrl: false, alt: false, shift: false, meta: false, key: null });
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const handlerRef = useRef(null);

  const currentShortcut = shortcuts[index];
  const isLast = index >= shortcuts.length - 1;

  const handleKeyDown = useCallback((event) => {
    if (sessionComplete) return;
    const modKeys = ["Control", "Shift", "Alt", "Meta"];
    if (modKeys.includes(event.key)) {
      setPressedKeys(prev => ({
        ...prev,
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey,
      }));
      return;
    }
    event.preventDefault();
    const normKey = getNormalizedKey(event);
    setPressedKeys({
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
      meta: event.metaKey,
      key: normKey,
    });
    setHasStarted(true);

    if (feedback) return;

    const expected = currentShortcut.keys;
    if (keysMatch(event, expected)) {
      setFeedback("correct");
      setScore(prev => ({
        ...prev,
        correct: prev.correct + 1,
        streak: prev.streak + 1,
        bestStreak: Math.max(prev.bestStreak, prev.streak + 1),
      }));
    } else {
      setFeedback("incorrect");
      setScore(prev => ({
        ...prev,
        incorrect: prev.incorrect + 1,
        streak: 0,
      }));
    }
  }, [index, currentShortcut, feedback, sessionComplete]);

  const handleKeyUp = useCallback((event) => {
    if (sessionComplete) return;
    const modKeys = ["Control", "Shift", "Alt", "Meta"];
    if (modKeys.includes(event.key)) {
      setPressedKeys(prev => ({
        ...prev,
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey,
      }));
    } else {
      setPressedKeys({ ctrl: event.ctrlKey, alt: event.altKey, shift: event.shiftKey, meta: event.metaKey, key: null });
    }
  }, [sessionComplete]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (!feedback) return;
    if (onProgressUpdate) {
      onProgressUpdate(platformId, difficulty, index, feedback === "correct");
    }
    const tid = setTimeout(() => {
      setFeedback(null);
      if (isLast) {
        setSessionComplete(true);
      } else {
        setIndex(prev => prev + 1);
        setPressedKeys({ ctrl: false, alt: false, shift: false, meta: false, key: null });
        setHasStarted(false);
      }
    }, 800);
    return () => clearTimeout(tid);
  }, [feedback, isLast, platformId, difficulty, index, onProgressUpdate]);

  if (sessionComplete) {
    const totalAttempted = score.correct + score.incorrect;
    const accuracy = totalAttempted > 0 ? Math.round((score.correct / totalAttempted) * 100) : 0;
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div className="p-4 rounded-full bg-(--primary)/10">
          <Trophy size={40} className="text-(--primary)" />
        </div>
        <h3 className="text-xl font-bold text-(--foreground)">Session Complete!</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-md">
          <div className="p-4 bg-(--card) border border-(--border) rounded-xl">
            <div className="text-2xl font-bold text-(--foreground)">{score.correct}</div>
            <div className="text-xs text-(--muted-foreground)">Correct</div>
          </div>
          <div className="p-4 bg-(--card) border border-(--border) rounded-xl">
            <div className="text-2xl font-bold text-(--muted-foreground)">{score.incorrect}</div>
            <div className="text-xs text-(--muted-foreground)">Incorrect</div>
          </div>
          <div className="p-4 bg-(--card) border border-(--border) rounded-xl">
            <div className="text-2xl font-bold text-(--primary)">{accuracy}%</div>
            <div className="text-xs text-(--muted-foreground)">Accuracy</div>
          </div>
          <div className="p-4 bg-(--card) border border-(--border) rounded-xl">
            <div className="text-2xl font-bold text-yellow-500">{score.bestStreak}</div>
            <div className="text-xs text-(--muted-foreground)">Best Streak</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIndex(0);
              setScore({ correct: 0, incorrect: 0, streak: 0, bestStreak: 0 });
              setFeedback(null);
              setPressedKeys({ ctrl: false, alt: false, shift: false, meta: false, key: null });
              setHasStarted(false);
              setSessionComplete(false);
            }}
            className="px-5 py-2.5 bg-(--primary) text-white rounded-lg font-semibold text-sm
              hover:bg-(--primary)/90 transition-colors cursor-pointer
              focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40"
          >
            <RotateCcw size={16} className="inline mr-1.5 align-middle" />
            Practice Again
          </button>
          <button
            onClick={onBack}
            className="px-5 py-2.5 bg-(--card) text-(--foreground) border border-(--border) rounded-lg font-semibold text-sm
              hover:bg-(--surface-soft) transition-colors cursor-pointer
              focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40"
          >
            <ArrowLeft size={16} className="inline mr-1.5 align-middle" />
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors
            cursor-pointer bg-transparent border-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40 rounded"
          aria-label="Back to category selection"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-3 text-xs text-(--muted-foreground)">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-green-500" />
            {score.correct}
          </span>
          <span className="flex items-center gap-1">
            <XCircle size={14} className="text-red-500" />
            {score.incorrect}
          </span>
          <span className="flex items-center gap-1">
            <Zap size={14} className="text-yellow-500" />
            {score.streak}
          </span>
        </div>
      </div>

      <div className="w-full bg-(--border) rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-(--primary) rounded-full transition-all duration-300"
          style={{ width: `${((index + (feedback ? 1 : 0)) / shortcuts.length) * 100}%` }}
        />
      </div>
      <div className="text-center text-xs text-(--muted-foreground)">
        {index + 1} of {shortcuts.length} &middot; {platformName} &middot; {difficulty}
      </div>

      <div className="bg-(--card) border border-(--border) rounded-xl p-6 sm:p-8 text-center">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-(--muted-foreground)">
          Press the shortcut for
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-(--foreground) mb-8">
          {currentShortcut.description}
        </h3>

        <div className="min-h-[56px] flex items-center justify-center mb-4">
          <PressedKeysDisplay keysPressed={pressedKeys} />
        </div>

        <div className={`text-xs transition-opacity ${feedback ? "opacity-100" : "opacity-0"}`}>
          {feedback === "correct" && (
            <span className="text-green-600 dark:text-green-400 font-semibold">
              Correct! The shortcut is <span className="font-mono">{currentShortcut.display}</span>
            </span>
          )}
          {feedback === "incorrect" && (
            <span className="text-red-600 dark:text-red-400 font-semibold">
              Wrong. The correct shortcut is <span className="font-mono">{currentShortcut.display}</span>
            </span>
          )}
        </div>
      </div>

      <div className="text-center text-xs text-(--muted-foreground)">
        Press the correct key combination on your keyboard to answer.
      </div>
    </div>
  );
}

function StudyMode({
  shortcuts,
  difficulty,
  onBack,
  platformName,
}) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const current = shortcuts[index];
  const isFirst = index === 0;
  const isLast = index >= shortcuts.length - 1;

  const handleNext = useCallback(() => {
    if (!isLast) {
      setIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [isLast]);

  const handlePrev = useCallback(() => {
    if (!isFirst) {
      setIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [isFirst]);

  useEffect(() => {
    function onKey(e) {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === " " || e.key === "Enter" || e.key === "f") {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNext, handlePrev]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors
            cursor-pointer bg-transparent border-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40 rounded"
          aria-label="Back to category selection"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <span className="text-xs text-(--muted-foreground)">
          {platformName} &middot; {difficulty} &middot; Card {index + 1} of {shortcuts.length}
        </span>
      </div>

      <div
        className="relative bg-(--card) border border-(--border) rounded-xl p-6 sm:p-10 min-h-[220px] flex flex-col items-center justify-center cursor-pointer select-none"
        onClick={() => setIsFlipped(prev => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setIsFlipped(prev => !prev); } }}
        aria-label={isFlipped ? "Shortcut definition" : "Shortcut description. Click to reveal."}
      >
        {!isFlipped ? (
          <div className="text-center animate-in fade-in duration-200">
            <Lightbulb size={24} className="mx-auto mb-4 text-(--primary)" />
            <p className="text-lg sm:text-xl font-bold text-(--foreground) mb-3">
              {current.description}
            </p>
            <span className="text-sm text-(--muted-foreground)">Click or press Space to reveal</span>
          </div>
        ) : (
          <div className="text-center animate-in fade-in duration-200">
            <FlipHorizontal size={24} className="mx-auto mb-4 text-(--primary)" />
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-(--primary)/10 border border-(--primary)/20">
              <Keyboard size={18} className="text-(--primary)" />
              <span className="text-xl sm:text-2xl font-bold font-mono text-(--primary)">
                {current.display}
              </span>
            </div>
            <p className="mt-4 text-sm text-(--muted-foreground)">
              {current.description}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          disabled={isFirst}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
            bg-(--card) border border-(--border) text-(--foreground)
            hover:bg-(--surface-soft) transition-colors disabled:opacity-40 disabled:cursor-not-allowed
            cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40"
          aria-label="Previous card"
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        <button
          onClick={() => setIsFlipped(prev => !prev)}
          className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold
            bg-(--primary) text-white hover:bg-(--primary)/90 transition-colors
            cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40"
          aria-label={isFlipped ? "Show description" : "Show shortcut"}
        >
          <FlipHorizontal size={16} />
          {isFlipped ? "Show Description" : "Show Shortcut"}
        </button>

        <button
          onClick={handleNext}
          disabled={isLast}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold
            bg-(--card) border border-(--border) text-(--foreground)
            hover:bg-(--surface-soft) transition-colors disabled:opacity-40 disabled:cursor-not-allowed
            cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40"
          aria-label="Next card"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="text-center text-xs text-(--muted-foreground)">
        Use arrow keys to navigate &middot; Space or Enter to flip
      </div>
    </div>
  );
}

function PlatformStats({ platform, progress, onBack }) {
  const p = progress[platform.id] || {};
  const entries = [];
  for (const diff of ["easy", "medium", "hard"]) {
    const data = p[diff];
    if (data) {
      entries.push({
        difficulty: diff.charAt(0).toUpperCase() + diff.slice(1),
        completed: data.completed?.length || 0,
        correct: data.correct || 0,
        incorrect: data.incorrect || 0,
        total: platform.shortcuts[diff]?.length || 0,
      });
    }
  }
  const totalCompleted = entries.reduce((sum, e) => sum + e.completed, 0);
  const totalShortcuts = entries.reduce((sum, e) => sum + e.total, 0);
  const totalCorrect = entries.reduce((sum, e) => sum + e.correct, 0);
  const totalAttempted = entries.reduce((sum, e) => sum + e.correct + e.incorrect, 0);
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors
            cursor-pointer bg-transparent border-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40 rounded"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h3 className="text-lg font-bold text-(--foreground)">{platform.name} Progress</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-(--card) border border-(--border) rounded-xl text-center">
          <div className="text-2xl font-bold text-(--foreground)">{totalCompleted}/{totalShortcuts}</div>
          <div className="text-xs text-(--muted-foreground) mt-1">Mastered</div>
        </div>
        <div className="p-4 bg-(--card) border border-(--border) rounded-xl text-center">
          <div className="text-2xl font-bold text-green-500">{totalCorrect}</div>
          <div className="text-xs text-(--muted-foreground) mt-1">Correct</div>
        </div>
        <div className="p-4 bg-(--card) border border-(--border) rounded-xl text-center">
          <div className="text-2xl font-bold text-(--muted-foreground)">{totalAttempted - totalCorrect}</div>
          <div className="text-xs text-(--muted-foreground) mt-1">Incorrect</div>
        </div>
        <div className="p-4 bg-(--card) border border-(--border) rounded-xl text-center">
          <div className="text-2xl font-bold text-(--primary)">{overallAccuracy}%</div>
          <div className="text-xs text-(--muted-foreground) mt-1">Accuracy</div>
        </div>
      </div>

      {entries.length === 0 && (
        <div className="text-center py-8 text-(--muted-foreground) text-sm">
          No practice sessions yet. Start practicing to see your stats!
        </div>
      )}
    </div>
  );
}

export default function KeyboardShortcutTrainerApp() {
  const [progress, setProgress] = useState({});
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [mode, setMode] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleSelectCategory = useCallback((platformId) => {
    setSelectedPlatform(platformId);
    setDifficulty(null);
    setMode(null);
    setShowStats(false);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedPlatform(null);
    setDifficulty(null);
    setMode(null);
    setShowStats(false);
  }, []);

  const handleProgressUpdate = useCallback((platformId, diff, shortcutIndex, isCorrect) => {
    setProgress(prev => {
      const next = { ...prev };
      if (!next[platformId]) next[platformId] = {};
      if (!next[platformId][diff]) next[platformId][diff] = { completed: [], correct: 0, incorrect: 0 };
      const pd = next[platformId][diff];
      if (isCorrect) {
        if (!pd.completed.includes(shortcutIndex)) {
          pd.completed = [...pd.completed, shortcutIndex];
        }
        pd.correct = (pd.correct || 0) + 1;
      } else {
        pd.incorrect = (pd.incorrect || 0) + 1;
      }
      return next;
    });
  }, []);

  const handleSelectDifficulty = useCallback((diff) => {
    setDifficulty(diff);
    setMode(null);
    setShowStats(false);
  }, []);

  const getShortcutsForDifficulty = useCallback((platformId, diff) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return [];
    return platform.shortcuts[diff] || [];
  }, []);

  const platform = selectedPlatform ? PLATFORMS.find(p => p.id === selectedPlatform) : null;
  const currentShortcuts = difficulty && platform ? getShortcutsForDifficulty(platform.id, difficulty) : [];
  const easyCount = platform ? (platform.shortcuts.easy?.length || 0) : 0;
  const mediumCount = platform ? (platform.shortcuts.medium?.length || 0) : 0;
  const hardCount = platform ? (platform.shortcuts.hard?.length || 0) : 0;

  if (!selectedPlatform) {
    return (
      <div className="max-w-5xl mx-auto px-3 py-6 sm:py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-(--primary)/10 mb-4">
            <Keyboard size={32} className="text-(--primary)" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-(--foreground) mb-2">
            Keyboard Shortcut Trainer
          </h1>
          <p className="text-sm text-(--muted-foreground) max-w-lg mx-auto">
            Master essential keyboard shortcuts across platforms and apps through interactive practice and flashcards.
          </p>
        </div>

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-(--foreground) flex items-center gap-2">
            <LayoutGrid size={18} />
            Choose a Platform
          </h2>
          <span className="text-xs text-(--muted-foreground)">
            {Object.keys(progress).length > 0
              ? `${Object.values(progress).reduce((sum, p) => {
                  const p2 = p;
                  return sum + (p2.easy?.completed?.length || 0) + (p2.medium?.completed?.length || 0) + (p2.hard?.completed?.length || 0);
                }, 0)} shortcuts mastered`
              : "No progress yet"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {PLATFORMS.map((p, i) => (
            <CategoryCard
              key={p.id}
              platform={p}
              progress={progress}
              onSelect={handleSelectCategory}
              index={i}
            />
          ))}
        </div>
      </div>
    );
  }

  if (selectedPlatform && !difficulty) {
    return (
      <div className="max-w-3xl mx-auto px-3 py-6 sm:py-10">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors
              cursor-pointer bg-transparent border-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40 rounded"
          >
            <ArrowLeft size={16} />
            All Platforms
          </button>
        </div>

        <div className="text-center mb-8">
          <div className={`inline-flex p-3 rounded-xl bg-(--primary)/10 mb-3`}>
            {platform && <platform.icon size={28} className={platform.color} />}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-(--foreground) mb-2">
            {platform?.name} Shortcuts
          </h1>
          <p className="text-sm text-(--muted-foreground)">
            {easyCount + mediumCount + hardCount} shortcuts &middot; Select a difficulty level to begin
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
          <DifficultyPill level="Easy" active={false} onClick={() => handleSelectDifficulty("easy")} count={easyCount} />
          <DifficultyPill level="Medium" active={false} onClick={() => handleSelectDifficulty("medium")} count={mediumCount} />
          <DifficultyPill level="Hard" active={false} onClick={() => handleSelectDifficulty("hard")} count={hardCount} />
        </div>

        <div className="mt-6">
          <button
            onClick={() => { setShowStats(true); setDifficulty(null); }}
            className="w-full py-3 px-4 bg-(--card) border border-(--border) rounded-xl text-sm text-(--foreground) font-semibold
              hover:bg-(--surface-soft) transition-colors cursor-pointer text-center
              focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40"
          >
            <BarChart3 size={16} className="inline mr-2 align-middle" />
            View Progress &amp; Stats for {platform?.name}
          </button>
        </div>

        {showStats && platform && (
          <div className="mt-4">
            <PlatformStats platform={platform} progress={progress} onBack={() => setShowStats(false)} />
          </div>
        )}
      </div>
    );
  }

  if (difficulty && currentShortcuts.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-3 py-6 sm:py-10 text-center">
        <div className="p-8 bg-(--card) border border-(--border) rounded-xl">
          <p className="text-(--foreground) font-semibold mb-2">No shortcuts available</p>
          <p className="text-sm text-(--muted-foreground) mb-4">
            There are no shortcuts for {difficulty} difficulty in {platform?.name}.
          </p>
          <button
            onClick={handleBack}
            className="px-5 py-2.5 bg-(--primary) text-white rounded-lg font-semibold text-sm
              hover:bg-(--primary)/90 transition-colors cursor-pointer
              focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40"
          >
            Choose Another Platform
          </button>
        </div>
      </div>
    );
  }

  if (difficulty && !mode) {
    return (
      <div className="max-w-3xl mx-auto px-3 py-6 sm:py-10">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => { setDifficulty(null); setMode(null); }}
            className="flex items-center gap-1.5 text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors
              cursor-pointer bg-transparent border-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40 rounded"
          >
            <ArrowLeft size={16} />
            {platform?.name}
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-(--foreground) mb-2">
            {difficulty} &mdash; {currentShortcuts.length} Shortcuts
          </h1>
          <p className="text-sm text-(--muted-foreground)">
            {platform?.name} &middot; Choose your learning mode
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
          <button
            onClick={() => setMode("practice")}
            className="flex flex-col items-center gap-3 p-8 bg-(--card) border border-(--border) rounded-xl
              hover:shadow-md hover:border-(--primary)/30 transition-all duration-150 cursor-pointer text-center
              focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40"
          >
            <div className="p-3 rounded-lg bg-(--primary)/10">
              <Zap size={28} className="text-(--primary)" />
            </div>
            <div>
              <span className="block font-bold text-(--foreground)">Practice Mode</span>
              <span className="block text-xs text-(--muted-foreground) mt-1">
                Press the correct key combo for each shortcut
              </span>
            </div>
          </button>

          <button
            onClick={() => setMode("study")}
            className="flex flex-col items-center gap-3 p-8 bg-(--card) border border-(--border) rounded-xl
              hover:shadow-md hover:border-(--primary)/30 transition-all duration-150 cursor-pointer text-center
              focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/40"
          >
            <div className="p-3 rounded-lg bg-(--primary)/10">
              <BookOpen size={28} className="text-(--primary)" />
            </div>
            <div>
              <span className="block font-bold text-(--foreground)">Study Mode</span>
              <span className="block text-xs text-(--muted-foreground) mt-1">
                Flip through flashcards to memorize shortcuts
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === "practice") {
    return (
      <div className="max-w-xl mx-auto px-3 py-6 sm:py-10">
        <PracticeMode
          shortcuts={currentShortcuts}
          difficulty={difficulty}
          platformId={platform?.id}
          onComplete={() => { }}
          onBack={handleBack}
          progress={progress}
          onProgressUpdate={handleProgressUpdate}
          platformName={platform?.name || ""}
        />
      </div>
    );
  }

  if (mode === "study") {
    return (
      <div className="max-w-xl mx-auto px-3 py-6 sm:py-10">
        <StudyMode
          shortcuts={currentShortcuts}
          difficulty={difficulty}
          onBack={handleBack}
          platformName={platform?.name || ""}
        />
      </div>
    );
  }

  return null;
}
