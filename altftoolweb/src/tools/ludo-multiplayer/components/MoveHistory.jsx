import { useMemo, useRef } from "react";
import { ScrollText, Clock } from "lucide-react";

const PLAYER_COLORS = ["#EF4444", "#3B82F6", "#22C55E", "#F59E0B"];
const PLAYER_NAMES = ["Red", "Blue", "Green", "Yellow"];

const ACTION_META = {
  move: { icon: "→", label: "moved" },
  kill: { icon: "⚡", label: "captured" },
  enter: { icon: "↑", label: "entered board" },
  finish: { icon: "🏁", label: "reached home" },
};

function formatTime(ts) {
  if (!ts) return "";
  const date = new Date(ts);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function MoveHistory({ moves, players }) {
  const baseTimeRef = useRef(Date.now());

  const hasMoves = moves && moves.length > 0;

  const enrichedMoves = useMemo(() => {
    if (!hasMoves) return [];
    const baseTime = baseTimeRef.current;
    return moves.slice(-50).reverse().map((m, i) => {
      const player = players?.[m.player];
      const targetPlayer = m.killTarget ? players?.[m.killTarget?.playerId] : null;
      let message = "";
      const timestamp = m.timestamp || baseTime - (moves.length - i) * 1000;

      switch (m.action) {
        case "enter":
          message = `${player?.name || `Player ${m.player + 1}`} brought Pawn ${m.token + 1} onto the board`;
          break;
        case "move":
          message = `${player?.name || `Player ${m.player + 1}`} moved Pawn ${m.token + 1}`;
          break;
        case "kill": {
          const targetName = targetPlayer?.name || `Player ${m.killTarget?.playerId + 1}`;
          const targetToken = (m.killTarget?.tokenIndex ?? 0) + 1;
          message = `${player?.name || `Player ${m.player + 1}`} captured ${targetName}'s Pawn ${targetToken} with Pawn ${m.token + 1}!`;
          break;
        }
        case "finish":
          message = `${player?.name || `Player ${m.player + 1}`} brought Pawn ${m.token + 1} home! 🏁`;
          break;
        default:
          message = `${player?.name || `Player ${m.player + 1}`} moved Pawn ${m.token + 1}.`;
      }

      return { ...m, message, timestamp, playerColor: PLAYER_COLORS[m.player] };
    });
  }, [moves, players, hasMoves]);

  if (!hasMoves) {
    return (
      <div className="p-6 text-center text-xs text-(--muted-foreground)">
        <ScrollText size="20" className="mx-auto mb-1.5 opacity-30" />
        No moves yet — roll to begin
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
      {enrichedMoves.map((m, i) => {
        const meta = ACTION_META[m.action] || ACTION_META.move;
        const playerColor = players?.[m.player]?.color || PLAYER_COLORS[m.player] || PLAYER_COLORS[0];
        const diceValue = m.dice;

        return (
          <div
            key={m.turn * 100 + i}
            className="flex flex-col gap-0.5 px-3 py-2 text-xs rounded-lg bg-(--muted) hover:bg-(--muted)/70 transition border-l-4"
            style={{ borderLeftColor: playerColor }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white/40 flex-shrink-0"
                style={{ background: playerColor }}
              />
              <span className="font-bold text-(--foreground) flex-1 truncate">{m.message}</span>
              <span className="text-(--primary) font-semibold flex items-center gap-1">
                🎲 {diceValue}
              </span>
              <span className="text-[10px] text-(--muted-foreground) flex items-center gap-0.5">
                <Clock size="10" /> {formatTime(m.timestamp)}
              </span>
            </div>
            <div className="flex items-center gap-2 ml-5 text-[10px] text-(--muted-foreground)">
              <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-(--card) border border-(--border)">
                <span style={{ color: playerColor }}>{meta.icon}</span>
                {meta.label}
              </span>
              <span>Turn {m.turn + 1}</span>
              {m.action === "kill" && (
                <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">Capture!</span>
              )}
              {m.action === "finish" && (
                <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 font-medium">Home!</span>
              )}
              {m.action === "enter" && (
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">Entered</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}