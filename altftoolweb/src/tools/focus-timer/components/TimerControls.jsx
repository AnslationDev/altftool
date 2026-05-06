import { Play, Pause, RotateCcw, Lock, Unlock } from "lucide-react";

export default function TimerControls({
  isRunning, lockMode,
  onStart, onPause, onReset, onToggleLock,
}) {
  return (
    <div>
      {/* START / PAUSE / RESET */}
      <div className="flex gap-3 justify-center sm:mt-2 mt-3">
        <button
          onClick={onStart}
          disabled={isRunning}
          className={`flex items-center gap-2 sm:px-7 sm:py-3 px-5 py-2 rounded-xl font-primary font-bold text-sm border-none transition-all duration-150
            ${isRunning
              ? "bg-(--muted) text-(--muted-foreground) cursor-not-allowed"
              : "bg-(--primary) text-white cursor-pointer hover:opacity-90"
            }`}
        >
          <Play size={15} />
          <span className="hidden sm:inline-flex">Start</span>
        </button>

        <button
          onClick={onPause}
          disabled={!isRunning || lockMode}
          className={`flex items-center gap-2 sm:px-7 sm:py-3 px-5 py-2 rounded-xl font-primary font-bold text-sm border border-(--border) transition-all duration-150
            ${!isRunning || lockMode
              ? "bg-(--muted) text-(--muted-foreground) cursor-not-allowed"
              : "bg-(--background) text-(--foreground) cursor-pointer hover:border-(--primary)"
            }`}
        >
          <Pause size={15} />
          <span className="hidden sm:inline-flex">Pause</span>
        </button>

        <button
          onClick={onReset}
          disabled={lockMode}
          className={`flex items-center gap-2 sm:px-7 sm:py-3 px-5 py-2 rounded-xl font-primary font-bold text-sm bg-(--background) text-(--foreground) border border-(--border) transition-all duration-150
            ${lockMode
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-(--primary)"
            }`}
        >
          <RotateCcw size={15} />
          <span className="hidden sm:inline-flex">Reset</span>
        </button>
      </div>

      {/* LOCK BUTTON — sirf running ho tab */}
      {isRunning && (
        <div className="flex justify-center mt-3">
          <button
            onClick={onToggleLock}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-primary font-bold text-sm border transition-all duration-150
              ${lockMode
                ? "bg-red-500 text-white border-red-500 cursor-pointer hover:opacity-90"
                : "bg-(--background) text-(--foreground) border-(--border) cursor-pointer hover:border-red-400 hover:text-red-400"
              }`}
          >
            {lockMode ? <div className="flex flex-row gap-2"><Unlock size={15} /> <span className="hidden sm:inline-flex">Locked</span> </div>
            : <div className="flex flex-row gap-2"><Lock size={15} /> <span className="hidden sm:inline-flex">Lock</span></div>}
          </button>
        </div>
      )}

      {/* LOCK BANNER */}
{lockMode && (
  <div className="
    flex flex-col sm:flex-row 
    sm:items-center 
    gap-2 sm:gap-3 
    bg-red-50 border border-red-200 
    rounded-xl px-4 py-3 mt-3 justify-between
  ">
    
  
  {/* Icon + Heading */}
  <div className="flex items-center gap-2">
    <Lock size={16} className="text-red-500 shrink-0" />
    <p className="text-sm font-bold font-primary text-red-500">
      Lock Mode Active
    </p>
  </div>


 {/* Subtext */}
  <p className="text-xs font-secondary text-red-400">
    Stay focused! Don&apos;t exit.
  </p>

    {/* Button */}
    <button
      onClick={onToggleLock}
      className="
        self-center sm:self-auto
        text-xs font-primary font-bold text-red-400 
        border border-red-200 
        px-3 py-1.5 rounded-lg 
        cursor-pointer bg-transparent 
        hover:bg-red-100 transition-all
      "
    >
      Unlock
    </button>
  </div>
)}
    </div>
  );
}
