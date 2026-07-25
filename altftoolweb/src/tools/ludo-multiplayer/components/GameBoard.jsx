"use client";

import { memo, useCallback, useMemo, useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PLAYERS, SAFE_POSITIONS, TOTAL_CELLS, BOARD_SIZE, HOME_STRETCH_SIZE } from "../engine/constants";
import { MAIN_ROUTE, HOME_SPAWNS, getMainRouteCoord, getHomeLaneCoord, getHomeSpawnCoord, getRouteState, getRouteTileKey } from "../engine/routeLayout";

const BOARD_THEME_COLORS = {
  classic: { board: "#F8FAFC", cells: "#E2E8F0", border: "#CBD5E1", homeAccent: "#EF4444" },
  modern: { board: "#F0FDFA", cells: "#CCFBF1", border: "#14B8A6", homeAccent: "#3B82F6" },
  neon: { board: "#0B1220", cells: "#1E293B", border: "#22D3EE", homeAccent: "#22D3EE" },
  dark: { board: "#070D18", cells: "#101827", border: "#334155", homeAccent: "#F59E0B" },
  minimal: { board: "#FFFFFF", cells: "#F1F5F9", border: "#E2E8F0", homeAccent: "#64748B" },
};

const BOARD_VIEW_SIZE = 15;
const HOME_SIZE = 5.0;
const TILE_RADIUS = 0.08;

const HOME_AREAS = [
  { x: 0.5, y: 0.5, w: HOME_SIZE, h: HOME_SIZE, color: "#EF4444", name: "Red" },
  { x: 9.5, y: 0.5, w: HOME_SIZE, h: HOME_SIZE, color: "#3B82F6", name: "Blue" },
  { x: 0.5, y: 9.5, w: HOME_SIZE, h: HOME_SIZE, color: "#22C55E", name: "Green" },
  { x: 9.5, y: 9.5, w: HOME_SIZE, h: HOME_SIZE, color: "#F59E0B", name: "Yellow" },
];

function getCellCoord(index) {
  if (index >= 100) {
    const playerId = Math.floor((index - 100) / 10);
    const laneIndex = index - 100 - playerId * 10 - 1; // 0 to 5
    const coord = getHomeLaneCoord(playerId, laneIndex);
    return { x: coord.x, y: coord.y };
  }
  const coord = getMainRouteCoord(index);
  return { x: coord.x, y: coord.y };
}

function getHomeCoord(playerId, homeIndex) {
  const coord = getHomeLaneCoord(playerId, homeIndex);
  return { x: coord.x, y: coord.y };
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
      className="relative mx-auto w-full max-w-[900px] aspect-square overflow-hidden rounded-[28px] border border-(--border) shadow-2xl"
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
        viewBox={`0 0 ${BOARD_VIEW_SIZE} ${BOARD_VIEW_SIZE}`}
        className="relative h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="tokenShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0.08" stdDeviation="0.08" floodColor="#000" floodOpacity="0.3" />
          </filter>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Board Background & Outlines */}
        <rect x="0" y="0" width={BOARD_VIEW_SIZE} height={BOARD_VIEW_SIZE} fill={theme.board} rx="0" />
        <rect x="0.05" y="0.05" width={BOARD_VIEW_SIZE - 0.1} height={BOARD_VIEW_SIZE - 0.1} fill="none" stroke={theme.border} strokeWidth="0.1" rx="0.1" />

        {/* Home Areas (corner containers) */}
        {HOME_AREAS.map((area, i) => (
          <g key={`home-${i}`}>
            <rect
              x={area.x}
              y={area.y}
              width={area.w}
              height={area.h}
              fill={`${area.color}12`}
              rx="0.3"
              stroke={area.color}
              strokeWidth="0.12"
            />
            <text
              x={area.x + area.w / 2}
              y={area.y + area.h / 2 + 0.15}
              textAnchor="middle"
              fill={area.color}
              fontSize="0.5"
              fontWeight="800"
              letterSpacing="0.05em"
              opacity="0.85"
            >
              {area.name.toUpperCase()}
            </text>
          </g>
        ))}

        {/* Movement Track Cells */}
        {MAIN_ROUTE.map((coord, index) => {
          const safe = SAFE_POSITIONS.includes(index);
          const startPlayer = index === 0 ? 0 : index === 13 ? 1 : index === 39 ? 2 : index === 26 ? 3 : -1;
          const isStart = startPlayer !== -1;

          let tileFill = theme.cells;
          let tileStroke = theme.border;
          let tileStrokeWidth = "0.04";

          if (isStart) {
            tileFill = `${PLAYERS[startPlayer].color}33`;
            tileStroke = PLAYERS[startPlayer].color;
            tileStrokeWidth = "0.08";
          } else if (safe) {
            tileFill = "#F59E0B20";
            tileStroke = "#F59E0B";
            tileStrokeWidth = "0.06";
          }

          return (
            <motion.g
              key={`cell-${index}`}
              whileHover={{ scale: 1.03, filter: "brightness(1.02)" }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
            >
              <rect
                x={coord.x}
                y={coord.y}
                width="1"
                height="1"
                fill={tileFill}
                stroke={tileStroke}
                strokeWidth={tileStrokeWidth}
                rx={TILE_RADIUS}
              />
              {(safe || isStart) && (
                <text
                  x={coord.x + 0.5}
                  y={coord.y + 0.65}
                  textAnchor="middle"
                  fill={isStart ? PLAYERS[startPlayer].color : "#F59E0B"}
                  fontSize="0.45"
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                  opacity="0.8"
                >
                  ★
                </text>
              )}
            </motion.g>
          );
        })}

        {/* Home Stretch Lanes */}
        {Array.from({ length: 4 }).map((_, playerId) =>
          Array.from({ length: 5 }).map((_, laneIndex) => {
            const coord = getHomeLaneCoord(playerId, laneIndex);
            const playerColor = PLAYERS[playerId].color;
            return (
              <motion.g
                key={`homeStretch-${playerId}-${laneIndex}`}
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 220, damping: 18 }}
              >
                <rect
                  x={coord.x}
                  y={coord.y}
                  width="1"
                  height="1"
                  fill={playerColor}
                  stroke="#FFFFFF"
                  strokeWidth="0.04"
                  rx={TILE_RADIUS}
                />
              </motion.g>
            );
          })
        )}

        {/* Path Previews */}
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
            cx = coord.x + 0.5;
            cy = coord.y + 0.5;
          } else {
            return null;
          }
          return (
            <motion.circle
              key={`preview-${i}`}
              cx={cx}
              cy={cy}
              r={i === selectedPath.length - 1 ? 0.28 : 0.16}
              fill="none"
              stroke={PLAYERS[currentId].color}
              strokeWidth={i === selectedPath.length - 1 ? 0.08 : 0.04}
              strokeDasharray="0.1 0.08"
              opacity={0.8}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0.4, 1, 0.4], scale: 1 }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.03 }}
              style={{ filter: "url(#glow)" }}
            />
          );
        })}

        {/* Destination Previews */}
        {destination && (
          <motion.circle
            cx={destination.x + (destination.type === "center" ? 0 : 0.5)}
            cy={destination.y + (destination.type === "center" ? 0 : 0.5)}
            r={destination.type === "center" ? 0.48 : 0.38}
            fill="none"
            stroke={destination.type === "kill" ? "#EF4444" : PLAYERS[currentId].color}
            strokeWidth="0.08"
            strokeDasharray="0.15 0.1"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ filter: "url(#glow)" }}
          />
        )}

        {/* Home Spawn Points (circles) */}
        {HOME_SPAWNS.flatMap((positions, pIdx) =>
          positions.map((pos, tIdx) => (
            <circle
              key={`home-${pIdx}-${tIdx}`}
              cx={pos.x}
              cy={pos.y}
              r="0.32"
              fill="none"
              stroke={PLAYERS[pIdx].color}
              strokeWidth="0.06"
              opacity="0.45"
            />
          ))
        )}

        {/* Victory Center Area */}
        <g>
          {/* Red (Left) - Player 0 */}
          <polygon points="6,6 7.5,7.5 6,9" fill={PLAYERS[0].color} opacity="0.95" />
          {/* Blue (Top) - Player 1 */}
          <polygon points="6,6 7.5,7.5 9,6" fill={PLAYERS[1].color} opacity="0.95" />
          {/* Green (Bottom) - Player 2 */}
          <polygon points="6,9 7.5,7.5 9,9" fill={PLAYERS[2].color} opacity="0.95" />
          {/* Yellow (Right) - Player 3 */}
          <polygon points="9,6 7.5,7.5 9,9" fill={PLAYERS[3].color} opacity="0.95" />

          {/* Center Victory Star/Circle */}
          <circle cx="7.5" cy="7.5" r="0.6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.04" />
          <circle cx="7.5" cy="7.5" r="0.4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.02" />
          <text
            x="7.5"
            y="7.65"
            textAnchor="middle"
            fill="#F59E0B"
            fontSize="0.45"
            fontWeight="bold"
            style={{ pointerEvents: "none" }}
          >
            ★
          </text>
        </g>

        {/* Pawns Rendering */}
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
                cx = coord.x + 0.5;
                cy = coord.y + 0.5;
              } else {
                const hp = getHomeSpawnCoord(player.id, idx);
                cx = hp.x;
                cy = hp.y;
              }
            } else if (token.position === -1) {
              const hp = getHomeSpawnCoord(player.id, idx);
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
                whileHover={movable ? { scale: 1.15 } : {}}
                whileTap={movable ? { scale: 0.95 } : {}}
              >
                <motion.circle
                  cx={cx}
                  cy={cy}
                  r="0.32"
                  fill={player.color}
                  stroke="#FFFFFF"
                  strokeWidth="0.06"
                  filter="url(#tokenShadow)"
                  initial={{ cx, cy }}
                  animate={isAnimating ? {} : { cx, cy }}
                  transition={isAnimating ? undefined : { duration: moveDuration, ease: "easeInOut" }}
                />
                {movable && !isAnimating && (
                  <motion.circle
                    cx={cx}
                    cy={cy}
                    r="0.42"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="0.04"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0.3, 0.8, 0.3], scale: 1 }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    style={{ filter: "url(#glow)" }}
                  />
                )}
                {isCurrent && !movable && !isAnimating && (
                  <circle cx={cx} cy={cy} r="0.42" fill="none" stroke={player.color} strokeWidth="0.03" opacity="0.4" />
                )}
                <text
                  x={cx}
                  y={cy + 0.08}
                  textAnchor="middle"
                  fill="white"
                  fontSize="0.22"
                  fontWeight="bold"
                  style={{ pointerEvents: "none" }}
                >
                  {idx + 1}
                </text>
              </motion.g>
            );
          })
        )}

        {/* Highlights */}
        {highlights.map((pos, i) => (
          <motion.circle
            key={`hl-${i}`}
            cx={pos.x + 0.5}
            cy={pos.y + 0.5}
            r="0.38"
            fill="none"
            stroke={PLAYERS[currentId].color}
            strokeWidth="0.06"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: [0.3, 0.8, 0.3], scale: 1 }}
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
