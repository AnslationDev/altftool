import { memo } from "react";
import { motion } from "framer-motion";
import { Bot, Crown, Circle, Activity } from "lucide-react";
import ProgressBar from "./ProgressBar";

function PlayerPanel({ players, currentPlayer, thinkingAI, game }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
      {players.map((player) => {
        const isActive = player.id === currentPlayer && !game.gameOver;
        const finished = player.tokens.filter((t) => t.isFinished).length;
        const activeTokens = player.tokens.filter((t) => t.position >= 0 && !t.isFinished).length;
        const homeTokens = player.tokens.filter((t) => t.position === -1).length;

        return (
          <motion.div
            key={player.id}
            layout
            animate={{
              borderColor: isActive ? player.color : "var(--border)",
              boxShadow: isActive
                ? `0 0 0 2px ${player.color}, 0 8px 32px -12px ${player.color}`
                : "0 0 0 0 transparent",
              scale: isActive ? 1.01 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className={`p-3 rounded-2xl border bg-(--card) relative overflow-hidden ${
              isActive ? "ring-2" : ""
            }`}
            style={{
              ringColor: isActive ? player.color : "transparent",
              opacity: isActive ? 1 : 0.7,
            }}
          >
            {isActive && (
              <>
                <motion.div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  animate={{ background: [player.color, "transparent", player.color] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: player.color }}
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <Circle size="10" className="text-white" />
                </motion.div>
              </>
            )}

            <div className="flex items-center gap-2.5 mb-2.5 relative">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md relative"
                style={{ background: `${player.color}22`, border: `2px solid ${player.color}` }}
              >
                <span className="text-sm font-extrabold" style={{ color: player.color }}>
                  {player.name[0]}
                </span>
                {isActive && (
                  <motion.div
                    className="absolute -inset-0.5 rounded-xl"
                    style={{ border: `2px solid ${player.color}` }}
                    animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-(--foreground) truncate">{player.name}</span>
                  {player.isAI && <Bot size="12" className="text-(--muted-foreground)" />}
                  {player.finished === 4 && <Crown size="13" className="text-amber-400" />}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isActive && thinkingAI ? (
                    <>
                      <Activity size="10" className="text-(--primary)" />
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="text-[10px] font-medium text-(--primary)"
                      >
                        Thinking…
                      </motion.span>
                    </>
                  ) : isActive ? (
                    <>
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{ color: player.color }}
                      >
                        🎲
                      </motion.span>
                      <motion.span
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-[10px] font-semibold"
                        style={{ color: player.color }}
                      >
                        Your Turn
                      </motion.span>
                    </>
                  ) : (
                    <span className="text-[10px] text-(--muted-foreground) flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-(--muted-foreground)" />
                      Waiting
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-2.5">
              {player.tokens.map((token, idx) => (
                <motion.div
                  key={idx}
                  layout
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold transition ${
                    token.isFinished
                      ? "text-white"
                      : token.position >= 0
                      ? "text-white"
                      : "bg-(--muted) text-(--muted-foreground)"
                  }`}
                  style={
                    token.isFinished || token.position >= 0
                      ? { background: player.color, boxShadow: `0 2px 8px -2px ${player.color}` }
                      : {}
                  }
                  title={token.isFinished ? "Finished" : token.position >= 0 ? "On board" : "In yard"}
                  whileHover={{ scale: 1.1 }}
                >
                  {token.isFinished ? "✓" : token.position >= 0 ? idx + 1 : "○"}
                </motion.div>
              ))}
            </div>

            <ProgressBar value={finished} max={4} color={player.color} height={5} />
            <div className="flex justify-between mt-1.5 text-[10px] text-(--muted-foreground)">
              <span>{finished}/4 home</span>
              <span>{activeTokens} out</span>
              <span>{homeTokens} yard</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default memo(PlayerPanel);