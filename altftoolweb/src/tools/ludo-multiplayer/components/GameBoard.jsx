import { memo, useCallback, useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PLAYERS, SAFE_POSITIONS, TOTAL_CELLS, BOARD_SIZE, HOME_STRETCH_SIZE } from "../engine/constants";
import { MAIN_ROUTE, getMainRouteCoord, getHomeLaneCoord, getHomeSpawnCoord, getRouteState, getRouteTileKey } from "../engine/routeLayout";

const BOARD_THEME_COLORS = {
  classic: { board: "#F8FAFC", cells: "#E2E8F0", border: "#CBD5E1", homeAccent: "#EF4444" },
  modern: { board: "#F0FDFA", cells: "#CCFBF1", border: "#14B8A6", homeAccent: "#3B82F6" },
  neon: { board: "#0B1220", cells: "#1E293B", border: "#22D3EE", homeAccent: "#22D3EE" },
  dark: { board: "#070D18", cells: "#101827", border: "#334155", homeAccent: "#F59E0B" },
  minimal: { board: "#FFFFFF", cells: "#F1F5F9", border: "#E2E8F0", homeAccent: "#64748B" },
};

const HOME_AREAS = [
  { x: 0, y: 0, w: 6, h: 6, color: "#EF4444", name: "Red" },
  { x: 9, y: 0, w: 6, h: 6, color: "#3B82F6", name: "Blue" },
  { x: 0, y: 9, w: 6, h: 6, color: "#22C55E", name: "Green" },
  { x: 9, y: 9, w: 6, h: 6, color: "#F59E0B", name: "Yellow" },
];

const HOME_POSITIONS = [
  [
    { x: 1.5, y: 1.5 },
    { x: 4.5, y: 1.5 },
    { x: 1.5, y: 4.5 },
    { x: 4.5, y: 4.5 },
  ],
  [
    { x: 10.5, y: 1.5 },
    { x: 13.5, y: 1.5 },
    { x: 10.5, y: 4.5 },
    { x: 13.5, y: 4.5 },
  ],
  [
    { x: 1.5, y: 10.5 },
    { x: 4.5, y: 10.5 },
    { x: 1.5, y: 13.5 },
    { x: 4.5, y: 13.5 },
  ],
  [
    { x: 10.5, y: 10.5 },
    { x: 13.5, y: 10.5 },
    { x: 10.5, y: 13.5 },
    { x: 13.5, y: 13.5 },
  ],
];

function getCellCoord(index) {
  const coord = getMainRouteCoord(index);
  return { x: coord.x, y: coord.y };
}

function getHomeCoord(playerId, homeIndex) {
  const lane = getHomeLaneCoord(playerId, homeIndex);
  return { x: lane.x, y: lane.y };
}

function getPathCoordinates(playerId, token, diceValue) {
  if (token.position === -1) {
    if (diceValue !== 6) return [];
    return [{ type: "enter", pos: 0, step: 1 }];
  }

  const currentSteps = token.steps;
  const newSteps = currentSteps + diceValue;
  if (newSteps > 56) return [];
  if (newSteps === 56) return [{ type: "finish", pos: 99, step: newSteps }];

  const path = [];
  for (let step = currentSteps + 1; step <= newSteps; step += 1) {
    const state = getRouteState(playerId, step);
    if (state.type === "main") {
      path.push({ type: "main", pos: state.position, step });
    } else if (state.type === "home") {
      path.push({ type: "home", pos: state.position, step });
    }
  }
  return path;
}

function GameBoard({
  game,
  onTokenClick,
  moveDuration = 0.5,
  boardTheme = "classic",
  boardReady = false,
}) {
  const theme = BOARD_THEME_COLORS[boardTheme] || BOARD_THEME_COLORS.classic;
  const validMoves = useMemo(() => game.validMoves || [], [game.validMoves]);
  const isInteractive = !game.gameOver && game.phase === "move";
  const currentId = game.currentPlayer;

  const movableTokens = useMemo(() => {
    if (!isInteractive) return new Set();
    return new Set(validMoves.map((m) => m.tokenIndex));
  }, [isInteractive, validMoves]);

  const [selectedToken, setSelectedToken] = useState(null);
  const [animatingPath, setAnimatingPath] = useState(null);
  const animationRef = useRef(null);
  const tokenPositionsRef = useRef({});

  useEffect(() => {
    if (boardReady && !isInteractive && selectedToken) {
      setSelectedToken(null);
    }
  }, [boardReady, isInteractive, selectedToken]);

  const highlights = useMemo(() => {
    if (!isInteractive) return [];
    return validMoves
      .map((m) => {
        if (m.action === "enter") return getCellCoord(PLAYERS[currentId].start);
        if (m.action === "finish") return null;
        return getCellCoord(m.to);
      })
      .filter(Boolean);
  }, [isInteractive, validMoves, currentId]);

  const selectedPath = useMemo(() => {
    if (!selectedToken) return [];
    const { playerId, tokenIdx } = selectedToken;
    const token = game.players[playerId]?.tokens[tokenIdx];
    if (!token) return [];
    const move = validMoves.find((m) => m.tokenIndex === tokenIdx);
    if (!move) return [];
    return getPathCoordinates(playerId, token, game.diceValue);
  }, [selectedToken, validMoves, game.diceValue, game.players]);

  const destination = useMemo(() => {
    if (!selectedToken) return null;
    const move = validMoves.find((m) => m.tokenIndex === selectedToken.tokenIdx);
    if (!move) return null;
    if (move.action === "enter") return { ...getCellCoord(PLAYERS[selectedToken.playerId].start), type: "main" };
    if (move.action === "finish") return { x: 7.5, y: 7.5, type: "center" };
    return { ...getCellCoord(move.to), type: move.action === "kill" ? "kill" : "main" };
  }, [selectedToken, validMoves]);

  const startAnimation = useCallback(
    (playerId, tokenIdx, move) => {
      const token = game.players[playerId].tokens[tokenIdx];
      const path = getPathCoordinates(playerId, token, game.diceValue);
      if (path.length === 0) {
        onTokenClick(playerId, tokenIdx);
        return;
      }

      setAnimatingPath({ playerId, tokenIdx, path, move, currentStep: 0 });
      setSelectedToken(null);
    },
    [game, onTokenClick]
  );

  useEffect(() => {
    if (!animatingPath) return;

    const { path, currentStep } = animatingPath;
    if (currentStep >= path.length) {
      onTokenClick(animatingPath.playerId, animatingPath.tokenIdx);
      setAnimatingPath(null);
      return;
    }

    const stepDuration = Math.max(80, moveDuration * 1000 / Math.max(1, path.length));
    const timer = setTimeout(() => {
      setAnimatingPath((prev) => prev ? { ...prev, currentStep: prev.currentStep + 1 } : null);
    }, stepDuration);

    return () => clearTimeout(timer);
  }, [animatingPath, moveDuration, onTokenClick]);

  const animatingTokenKey = animatingPath ? `${animatingPath.playerId}-${animatingPath.tokenIdx}` : null;

  const handleTokenHover = useCallback((playerId, tokenIdx) => {
    if (isInteractive && playerId === currentId && movableTokens.has(tokenIdx)) {
      setSelectedToken({ playerId, tokenIdx });
    } else {
      setSelectedToken(null);
    }
  }, [isInteractive, currentId, movableTokens]);

  const handleTokenLeave = useCallback(() => {
    if (!animatingPath) setSelectedToken(null);
  }, [animatingPath]);

  const handleTokenClick = useCallback(
    (playerId, tokenIdx) => {
      if (animatingPath) return;
      const move = validMoves.find((m) => m.tokenIndex === tokenIdx);
      if (move && movableTokens.has(tokenIdx)) {
        startAnimation(playerId, tokenIdx, move);
      }
    },
    [validMoves, movableTokens, animatingPath, startAnimation]
  );

  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-(--border) shadow-2xl"
      style={{
        background: theme.board,
        boxShadow: "0 25px 60px -25px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,0,0,0.05)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.35) 0%, transparent 60%)",
        }}
      />
      <svg
        viewBox="0 0 15 15"
        className="relative w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      >
        <defs>
          <filter id="tokenShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0.15" stdDeviation="0.15" floodColor="#000" floodOpacity="0.4" />
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
          </marker>
        </defs>

        <rect x="0" y="0" width="15" height="15" fill={theme.board} rx="0.5" />

        {HOME_AREAS.map((area, i) => (
          <g key={`home-${i}`}>
            <rect
              x={area.x}
              y={area.y}
              width={area.w}
              height={area.h}
              fill={`${area.color}20`}
              rx="0.5"
              stroke={area.color}
              strokeWidth="0.12"
            />
            <rect
              x={area.x + 0.5}
              y={area.y + 0.5}
              width={area.w - 1}
              height={area.h - 1}
              fill="none"
              stroke={area.color}
              strokeWidth="0.06"
              rx="0.4"
              opacity="0.5"
            />
            <text
              x={area.x + area.w / 2}
              y={area.y + area.h / 2 + 0.3}
              textAnchor="middle"
              fill={area.color}
              fontSize="0.6"
              fontWeight="bold"
              opacity="0.6"
            >
              {area.name}
            </text>
          </g>
        ))}

        {MAIN_ROUTE.map((coord, index) => {
          const safe = SAFE_POSITIONS.includes(index);
          const isStart = [0, 13, 26, 39].includes(index);
          const startPlayer = [0, 13, 26, 39].indexOf(index);
          return (
            <g key={`cell-${index}`}>
              <rect
                x={coord.x}
                y={coord.y}
                width="1"
                height="1"
                fill={safe ? "#FBBF2433" : isStart ? `${PLAYERS[startPlayer].color}30` : theme.cells}
                stroke={safe ? "#F59E0B" : isStart ? PLAYERS[startPlayer].color : theme.border}
                strokeWidth={safe ? "0.06" : isStart ? "0.08" : "0.04"}
                rx="0.18"
              />
              {safe && (
                <circle
                  cx={coord.x + 0.5}
                  cy={coord.y + 0.5}
                  r="0.2"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="0.04"
                  opacity="0.7"
                />
              )}
              {isStart && (
                <circle
                  cx={coord.x + 0.5}
                  cy={coord.y + 0.5}
                  r="0.25"
                  fill={PLAYERS[startPlayer].color}
                  opacity="0.3"
                />
              )}
            </g>
          );
        })}

        {Array.from({ length: 4 }).map((_, playerId) =>
          Array.from({ length: HOME_STRETCH_SIZE }).map((_, laneIndex) => {
            const coord = getHomeLaneCoord(playerId, laneIndex);
            const playerColor = PLAYERS[playerId].color;
            return (
              <rect
                key={`homeStretch-${playerId}-${laneIndex}`}
                x={coord.x - 0.2}
                y={coord.y - 0.2}
                width="0.45"
                height="0.45"
                fill={`${playerColor}25`}
                stroke={playerColor}
                strokeWidth="0.05"
                rx="0.1"
              />
            );
          })
        )}

        {selectedPath.map((step, i) => {
          let cx, cy;
          if (step.type === "main") {
            const pos = getCellCoord(step.pos);
            cx = pos.x + 0.5;
            cy = pos.y + 0.5;
          } else if (step.type === "home") {
            const playerId = Math.floor((step.pos - 100) / 10);
            const homeIndex = step.pos - 100 - playerId * 10;
            const coord = getHomeCoord(playerId, homeIndex - 1);
            cx = coord.x;
            cy = coord.y;
          } else {
            return null;
          }
          return (
            <motion.circle
              key={`preview-${i}`}
              cx={cx}
              cy={cy}
              r={i === selectedPath.length - 1 ? 0.3 : 0.2}
              fill="none"
              stroke={PLAYERS[currentId].color}
              strokeWidth={i === selectedPath.length - 1 ? 0.12 : 0.06}
              strokeDasharray="0.15 0.1"
              opacity={0.8}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0.4, 1, 0.4], scale: 1 }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.03 }}
              style={{ filter: "url(#glow)" }}
            />
          );
        })}

        {destination && (
          <motion.circle
            cx={destination.x}
            cy={destination.y}
            r={destination.type === "center" ? 0.45 : 0.38}
            fill="none"
            stroke={destination.type === "kill" ? "#EF4444" : PLAYERS[currentId].color}
            strokeWidth="0.12"
            strokeDasharray="0.2 0.15"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ filter: "url(#glow)" }}
          />
        )}

        {HOME_POSITIONS.flatMap((positions, pIdx) =>
          positions.map((pos, tIdx) => (
            <circle
              key={`home-${pIdx}-${tIdx}`}
              cx={pos.x}
              cy={pos.y}
              r="0.35"
              fill="none"
              stroke={PLAYERS[pIdx].color}
              strokeWidth="0.07"
              opacity="0.4"
            />
          ))
        )}

        <circle cx="7.5" cy="7.5" r="0.8" fill="none" stroke={theme.border} strokeWidth="0.08" opacity="0.5" />
        <circle cx="7.5" cy="7.5" r="0.4" fill="none" stroke={theme.border} strokeWidth="0.06" />
        <text
          x="7.5"
          y="7.65"
          textAnchor="middle"
          fill={theme.border}
          fontSize="0.5"
          fontWeight="bold"
          opacity="0.4"
        >
          ★
        </text>

        {game.players.flatMap((player) =>
          player.tokens.map((token, idx) => {
            if (token.isFinished) return null;

            const isAnimating = animatingTokenKey === `${player.id}-${idx}`;
            let cx, cy;

            if (isAnimating && animatingPath) {
              const step = animatingPath.path[Math.min(animatingPath.currentStep, animatingPath.path.length - 1)];
              if (step.type === "main") {
                const pos = getCellCoord(step.pos);
                cx = pos.x + 0.5;
                cy = pos.y + 0.5;
              } else if (step.type === "home") {
                const playerId = Math.floor((step.pos - 100) / 10);
                const homeIndex = step.pos - 100 - playerId * 10;
                const coord = getHomeCoord(playerId, homeIndex - 1);
                cx = coord.x;
                cy = coord.y;
              } else {
                const hp = HOME_POSITIONS[player.id]?.[idx];
                cx = hp?.x ?? 0;
                cy = hp?.y ?? 0;
              }
            } else if (token.position === -1) {
              const hp = HOME_POSITIONS[player.id]?.[idx];
              if (!hp) return null;
              cx = hp.x;
              cy = hp.y;
            } else {
              const cp = getCellCoord(token.position);
              cx = cp.x + 0.5;
              cy = cp.y + 0.5;
            }

            const movable =
              isInteractive && player.id === currentId && movableTokens.has(idx) && !isAnimating;
            const isCurrent = player.id === currentId && !game.gameOver;

            return (
              <motion.g
                key={`token-${player.id}-${idx}`}
                initial={false}
                animate={{ x: 0, y: 0 }}
                style={{ cursor: movable ? "pointer" : "default" }}
                onMouseEnter={() => handleTokenHover(player.id, idx)}
                onMouseLeave={handleTokenLeave}
                onClick={() => movable && handleTokenClick(player.id, idx)}
                whileHover={movable ? { scale: 1.2 } : {}}
                whileTap={movable ? { scale: 0.9 } : {}}
              >
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r="0.32"
                  fill={player.color}
                  stroke="#FFFFFF"
                  strokeWidth="0.08"
                  filter="url(#tokenShadow)"
                  animate={isAnimating ? {} : { cx, cy }}
                  transition={isAnimating ? undefined : { duration: moveDuration, ease: "easeInOut" }}
                />
                {movable && !isAnimating && (
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r="0.44"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="0.06"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0.3, 1, 0.3], scale: 1 }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    style={{ filter: "url(#glow)" }}
                  />
                )}
                {isCurrent && !movable && !isAnimating && (
                  <circle cx={cx} cy={cy} r="0.44" fill="none" stroke={player.color} strokeWidth="0.04" opacity="0.5" />
                )}
                <text
                  x={cx}
                  y={cy + 0.1}
                  textAnchor="middle"
                  fill="white"
                  fontSize="0.24"
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >
                  {idx + 1}
                </text>
              </motion.g>
            );
          })
        )}

        {highlights.map((pos, i) => (
          <motion.circle
            key={`hl-${i}`}
            cx={pos.x + 0.5}
            cy={pos.y + 0.5}
            r="0.4"
            fill="none"
            stroke={PLAYERS[currentId].color}
            strokeWidth="0.08"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.3, 0.9, 0.3], scale: 1 }}
            transition={{ duration: 1.1, repeat: Infinity }}
            style={{ filter: "url(#glow)" }}
          />
        ))}
      </svg>

      {!isInteractive && game.phase === "roll" && !game.gameOver && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-(--card)/90 backdrop-blur text-[11px] font-medium text-(--muted-foreground) border border-(--border) shadow-lg"
        >
          {game.players[game.currentPlayer]?.name}&apos;s turn — Roll the dice
        </motion.div>
      )}

      {animatingPath && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-(--primary)/90 backdrop-blur text-(--primary-foreground) text-sm font-semibold shadow-xl"
        >
          Moving {game.players[animatingPath.playerId].name} Pawn {animatingPath.tokenIdx + 1}...
        </motion.div>
      )}
    </div>
  );
}

export default memo(GameBoard);