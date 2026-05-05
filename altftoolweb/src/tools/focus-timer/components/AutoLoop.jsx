import { Repeat } from "lucide-react";

export default function AutoLoop({ autoLoop, setAutoLoop }) {
  return (
    <div className="flex items-center justify-between bg-(--background) border border-(--border) rounded-xl px-4 py-3">
      <div className="flex items-center gap-2">
        <div>
          <p className="text-sm flex flex-row gap-2 font-bold font-primary text-(--foreground)">
            <span>
              <Repeat size={16} className={autoLoop ? "text-(--primary)" : "text-(--muted-foreground)"} />
            </span>
            Auto Session Loop
          </p>
          <p className="text-xs font-secondary text-(--muted-foreground)">
            Automatically start next session
          </p>
        </div>
      </div>

      {/* Toggle Switch */}
      <button
        onClick={() => setAutoLoop((prev) => !prev)}
        className={`relative sm:h-6 w-11 h-5 rounded-full border-none cursor-pointer transition-all duration-300
          ${autoLoop ? "bg-(--primary)" : "bg-(--muted)"}`}
      >
        <span
          className={`absolute top-0.5 sm:w-5 sm:h-5 h-4 w-4 bg-white rounded-full shadow transition-all duration-300
            ${autoLoop ? "left-5" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}