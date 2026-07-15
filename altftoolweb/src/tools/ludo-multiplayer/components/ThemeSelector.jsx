import { BOARD_THEMES, DICE_THEMES } from "../constants/themes";

export default function ThemeSelector({ settings, onUpdate }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-(--foreground) mb-2">Board Theme</p>
        <div className="grid grid-cols-5 gap-1.5">
          {BOARD_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => onUpdate("boardTheme", t.id)}
              className={`p-2 rounded-lg border transition ${
                settings.boardTheme === t.id
                  ? "border-(--primary) ring-1 ring-(--primary)"
                  : "border-(--border) hover:border-(--border-strong)"
              }`}
            >
              <div
                className="w-full h-6 rounded border"
                style={{ background: t.board, borderColor: t.border }}
              />
              <p className="text-[10px] text-(--muted-foreground) mt-1 truncate">{t.name}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-(--foreground) mb-2">Dice Theme</p>
        <div className="grid grid-cols-3 gap-1.5">
          {DICE_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => onUpdate("diceTheme", t.id)}
              className={`p-2 rounded-lg border transition ${
                settings.diceTheme === t.id
                  ? "border-(--primary) ring-1 ring-(--primary)"
                  : "border-(--border) hover:border-(--border-strong)"
              }`}
            >
              <div
                className="w-8 h-8 mx-auto rounded-lg border flex items-center justify-center"
                style={{ background: t.bg, borderColor: t.bg }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: t.dot }} />
              </div>
              <p className="text-[10px] text-(--muted-foreground) mt-1">{t.name}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold text-(--foreground) mb-2">Animation Speed</p>
        <div className="flex gap-1.5">
          {["slow", "normal", "fast"].map((s) => (
            <button
              key={s}
              onClick={() => onUpdate("animationSpeed", s)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium border capitalize transition ${
                settings.animationSpeed === s
                  ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                  : "bg-(--card) text-(--muted-foreground) border-(--border)"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-(--foreground)">Sound Effects</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => onUpdate("soundEnabled", e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-(--muted) rounded-full peer peer-checked:bg-(--primary) after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
        </label>
      </div>
    </div>
  );
}
