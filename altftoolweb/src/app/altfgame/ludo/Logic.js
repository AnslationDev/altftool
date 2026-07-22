// Logic.js - Fixed and Optimized Version
export const PLAYER_COLORS = {
    0: '#ef4444', // Red
    1: '#22c55e', // Green
    2: '#eab308', // Yellow
    3: '#3b82f6'  // Blue
};

export const SAFE_SPOTS = [0, 8, 13, 21, 26, 34, 39, 47];

// 15x15 GRID MAPPING (52 Steps)
export const MAIN_PATH_GRID = [
    [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], // 0-4
    [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0], // 5-10
    [7, 0], // 11
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], // 12-17
    [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6], // 18-23
    [14, 7], // 24
    [14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8], // 25-30
    [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14], // 31-36
    [7, 14], // 37
    [6, 14], [6, 13], [6, 12], [6, 11], [6, 10], [6, 9], // 38-43
    [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8], // 44-49
    [0, 7], // 50
    [0, 6] // 51
];

// Home paths - Each player has 7 home positions (0-6 in home, 6 is center)
export const HOME_PATHS = {
    0: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7]], // Red home path
    1: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7]], // Green home path
    2: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7], [7, 7]], // Yellow home path
    3: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8], [7, 7]] // Blue home path
};

// Constants for token states
export const TOKEN_STATES = {
    YARD: -1,
    FINISHED: 106,
    HOME_START: 100
};

// Home entry points (where they enter their colored home path)
export const HOME_ENTRY_POINTS = {
    0: 51,
    1: 51,
    2: 51,
    3: 51
};

// Starting positions on main path for each player (after leaving yard)
// All players start at relative position 0
export const START_POSITIONS = {
    0: 0,
    1: 0,
    2: 0,
    3: 0
};

export const YARD_SPOTS = {
    0: [[2, 2], [2, 3], [3, 2], [3, 3]],
    1: [[11, 2], [11, 3], [12, 2], [12, 3]],
    2: [[11, 11], [11, 12], [12, 11], [12, 12]],
    3: [[2, 11], [2, 12], [3, 11], [3, 12]]
};

// Initial Phase is now SETUP, waiting for user to choose player count
export const INITIAL_STATE = {
    players: [
        { id: 0, color: 'RED', tokens: [-1, -1, -1, -1], active: true, isAI: false, name: 'You', rank: null },
        { id: 1, color: 'GREEN', tokens: [-1, -1, -1, -1], active: true, isAI: true, name: 'CPU 1', rank: null },
        { id: 2, color: 'YELLOW', tokens: [-1, -1, -1, -1], active: true, isAI: true, name: 'CPU 2', rank: null },
        { id: 3, color: 'BLUE', tokens: [-1, -1, -1, -1], active: true, isAI: true, name: 'CPU 3', rank: null }
    ],
    turn: 0,
    dice: 0,
    phase: 'SETUP',
    highlightedTokens: [],
    winners: []
};

export const startGame = (playerCount) => {
    const players = [
        { id: 0, color: 'RED', tokens: [-1, -1, -1, -1], active: true, isAI: false, name: 'You', rank: null },
        { id: 1, color: 'GREEN', tokens: [-1, -1, -1, -1], active: true, isAI: true, name: 'CPU 1', rank: null },
        { id: 2, color: 'YELLOW', tokens: [-1, -1, -1, -1], active: true, isAI: true, name: 'CPU 2', rank: null },
        { id: 3, color: 'BLUE', tokens: [-1, -1, -1, -1], active: true, isAI: true, name: 'CPU 3', rank: null }
    ];

    // Configure based on count
    if (playerCount === 2) {
        players[1].active = false;
        players[3].active = false;
        players[2].name = 'CPU';
    } else if (playerCount === 3) {
        players[3].active = false;
    }

    return {
        ...INITIAL_STATE,
        players,
        phase: 'ROLL',
        dice: 0,
        turn: 0,
        highlightedTokens: [],
        winners: []
    };
};

// --- OPTIMIZED LOGIC HELPERS ---

export const rollDice = () => {
    return Math.floor(Math.random() * 6) + 1;
};

export const getTokenCoords = (playerId, tokenState) => {
    if (tokenState === TOKEN_STATES.YARD) return null;

    // Home path positions (100-106)
    if (tokenState >= TOKEN_STATES.HOME_START && tokenState <= TOKEN_STATES.FINISHED) {
        const homeIdx = tokenState - TOKEN_STATES.HOME_START;
        if (HOME_PATHS[playerId] && HOME_PATHS[playerId][homeIdx]) {
            return HOME_PATHS[playerId][homeIdx];
        }
        // Fallback to center for position 106
        if (tokenState === TOKEN_STATES.FINISHED) return [7, 7];
        return null;
    }

    // Main path positions (0-50, 51 is entry threshold)
    // Convert relative position to absolute grid index
    // Red (0) offset = 0
    // Green (1) offset = 13
    // Yellow (2) offset = 26
    // Blue (3) offset = 39

    // Safety check for main path
    if (tokenState > 51) return null; // Should be handled by home path logic

    const offset = playerId * 13;
    const commonIndex = (tokenState + offset) % 52;
    return MAIN_PATH_GRID[commonIndex];
};

export const getValidMoves = (playerId, tokens, dice) => {
    const validMoves = [];
    const homeEntryPoint = 51; // Standardized relative entry point

    for (let idx = 0; idx < tokens.length; idx++) {
        const pos = tokens[idx];

        // Already finished
        if (pos === TOKEN_STATES.FINISHED) continue;

        // Token in yard
        if (pos === TOKEN_STATES.YARD) {
            if (dice === 6) {
                validMoves.push(idx);
            }
            continue;
        }

        // Token on main path or entering home
        if (pos < homeEntryPoint) {
            const nextPos = pos + dice;

            // Entering home?
            // > 50 means we are entering home territory
            if (nextPos >= homeEntryPoint) {
                const stepsToEntry = homeEntryPoint - pos;
                const stepsInHome = dice - stepsToEntry; // 0-indexed steps in home path

                // stepsInHome:
                // If dice exactly reaches 51, stepsInHome = 0 (Entry/First square of home path)
                // If dice reaches 57 (Finish), stepsInHome = 6

                if (stepsInHome <= 6) {
                    validMoves.push(idx);
                }
            } else {
                // Still on main path
                validMoves.push(idx);
            }
        }
        // Token already in home path (100+)
        else if (pos >= TOKEN_STATES.HOME_START && pos < TOKEN_STATES.FINISHED) {
            const homePos = pos - TOKEN_STATES.HOME_START;
            const nextHomePos = homePos + dice;

            // Can move if not overshooting 6 (Finish)
            if (nextHomePos <= 6) {
                validMoves.push(idx);
            }
        }
    }

    return validMoves;
};

export const getTokenCommonIndex = (playerId, tokenPos) => {
    if (tokenPos === TOKEN_STATES.YARD || tokenPos >= TOKEN_STATES.HOME_START) {
        return null;
    }
    const offset = playerId * 13;
    return (tokenPos + offset) % 52;
};

export const checkCapture = (players, currentPlayerId, targetPos, movingTokenIdx) => {
    // Cannot capture in home, yard, or safe spots
    if (targetPos === TOKEN_STATES.YARD || targetPos >= TOKEN_STATES.HOME_START) {
        return null;
    }

    const currentPlayer = players[currentPlayerId];
    // Calculate Absolute Grid Index for current player's target position
    const targetCommonIndex = getTokenCommonIndex(currentPlayerId, targetPos);

    if (targetCommonIndex === null) return null;

    // Cannot capture on safe spots
    // SAFE_SPOTS are absolute grid indices
    if (SAFE_SPOTS.includes(targetCommonIndex)) return null;

    // Check for same-player stacking (block - no capture)
    for (let tIdx = 0; tIdx < currentPlayer.tokens.length; tIdx++) {
        if (tIdx === movingTokenIdx) continue;
        const samePlayerPos = currentPlayer.tokens[tIdx];
        if (samePlayerPos === TOKEN_STATES.YARD || samePlayerPos >= TOKEN_STATES.HOME_START) continue;

        const samePlayerCommonIndex = getTokenCommonIndex(currentPlayerId, samePlayerPos);
        if (samePlayerCommonIndex === targetCommonIndex) {
            return null; // Same player token already here - block
        }
    }

    // Check opponents
    for (let player of players) {
        if (player.id === currentPlayerId || !player.active) continue;

        let opponentTokensOnCell = [];
        for (let tIdx = 0; tIdx < player.tokens.length; tIdx++) {
            const oppPos = player.tokens[tIdx];
            if (oppPos === TOKEN_STATES.YARD || oppPos >= TOKEN_STATES.HOME_START) continue;

            const oppCommonIndex = getTokenCommonIndex(player.id, oppPos);
            if (oppCommonIndex === targetCommonIndex) {
                opponentTokensOnCell.push(tIdx);
            }
        }

        if (opponentTokensOnCell.length > 1) return null; // Stack Safe (opponent block)

        if (opponentTokensOnCell.length === 1) {
            return {
                captured: true,
                playerId: player.id,
                tokenIdx: opponentTokensOnCell[0]
            };
        }
    }

    return null;
};

export const checkWin = (playerTokens) => {
    return playerTokens.every(t => t === TOKEN_STATES.FINISHED);
};

export const isGameOver = (players) => {
    let activeCount = 0;
    for (let player of players) {
        if (player.active && player.rank === null) {
            activeCount++;
            if (activeCount > 1) return false;
        }
    }
    return true;
};

export const calculateNextPosition = (playerId, currentPos, dice) => {
    if (currentPos === TOKEN_STATES.YARD) {
        // Start Position is always 0 relative
        return dice === 6 ? 0 : null;
    }

    // Home Path Logic
    if (currentPos >= TOKEN_STATES.HOME_START && currentPos < TOKEN_STATES.FINISHED) {
        const homePos = currentPos - TOKEN_STATES.HOME_START;
        const nextHomePos = homePos + dice;
        if (nextHomePos <= 6) {
            return TOKEN_STATES.HOME_START + nextHomePos;
        }
        return null;
    }

    // Main Path & Home Entry Logic
    if (currentPos <= 50) { // 50 is the last square before home
        const nextPos = currentPos + dice;
        const homeEntryPoint = 51;

        if (nextPos >= homeEntryPoint) {
            const stepsInHome = nextPos - homeEntryPoint;

            // stepsInHome 0 = First square of home path
            // stepsInHome 6 = FINISHED

            if (stepsInHome <= 6) {
                return TOKEN_STATES.HOME_START + stepsInHome;
            }
            return null; // Overshot home
        }

        return nextPos;
    }

    return null;
};

export const getBestMove = (playerId, tokens, dice, allPlayers) => {
    const validIndices = getValidMoves(playerId, tokens, dice);
    if (validIndices.length === 0) return null;
    if (validIndices.length === 1) return validIndices[0];

    const homeEntryPoint = HOME_ENTRY_POINTS[playerId];
    let bestScore = -Infinity;
    let bestMove = validIndices[0];

    for (const idx of validIndices) {
        const currentPos = tokens[idx];
        const nextPos = calculateNextPosition(playerId, currentPos, dice);

        if (nextPos === null) continue;

        let score = 0;

        // Priority 1: Finish the token (highest priority)
        if (nextPos === TOKEN_STATES.FINISHED) {
            score += 300;
        }
        // Priority 2: Enter home path
        else if (nextPos >= TOKEN_STATES.HOME_START && nextPos < TOKEN_STATES.FINISHED) {
            score += 100 + (nextPos - TOKEN_STATES.HOME_START) * 20;
        }
        // Priority 3: Capture opponent
        else if (nextPos <= 51) {
            const capture = checkCapture(allPlayers, playerId, nextPos, idx);
            if (capture) score += 80;
        }

        // Priority 4: Move token from yard
        if (currentPos === TOKEN_STATES.YARD) {
            score += 50;
        }

        // Priority 5: Safe spot preference
        if (nextPos <= 51) {
            const commonIndex = getTokenCommonIndex(playerId, nextPos);
            if (commonIndex !== null && SAFE_SPOTS.includes(commonIndex)) {
                score += 30;
            }
        }

        // Priority 6: Advance token position
        if (nextPos <= 51) {
            score += Math.min(nextPos * 0.5, 25); // Cap advancement bonus
        } else if (nextPos >= TOKEN_STATES.HOME_START) {
            const homeProgress = (nextPos - TOKEN_STATES.HOME_START) / 6;
            score += homeProgress * 50;
        }

        // Priority 7: Avoid sending single tokens to dangerous spots
        if (nextPos <= 51 && currentPos !== TOKEN_STATES.YARD) {
            const commonIndex = getTokenCommonIndex(playerId, nextPos);
            if (commonIndex !== null && !SAFE_SPOTS.includes(commonIndex)) {
                // Check if this would be a single token in dangerous spot
                let tokenCountOnCell = 0;
                for (let tIdx = 0; tIdx < tokens.length; tIdx++) {
                    if (tIdx === idx) continue;
                    const otherPos = tokens[tIdx];
                    if (otherPos === TOKEN_STATES.YARD || otherPos >= TOKEN_STATES.HOME_START) continue;
                    const otherCommonIndex = getTokenCommonIndex(playerId, otherPos);
                    if (otherCommonIndex === commonIndex) {
                        tokenCountOnCell++;
                    }
                }
                if (tokenCountOnCell === 0) {
                    score -= 15; // Penalty for being vulnerable
                }
            }
        }

        // Tie-breaker: prefer moving ahead
        if (score > bestScore || (score === bestScore && nextPos > calculateNextPosition(playerId, tokens[bestMove], dice))) {
            bestScore = score;
            bestMove = idx;
        }
    }

    return bestMove;
};

// Helper function to get move information for UI
export const getMoveInfo = (playerId, tokenIdx, tokens, dice) => {
    const currentPos = tokens[tokenIdx];
    const nextPos = calculateNextPosition(playerId, currentPos, dice);

    if (nextPos === null) return null;

    return {
        playerId,
        tokenIdx,
        currentPos,
        nextPos,
        isFromYard: currentPos === TOKEN_STATES.YARD,
        isToHome: nextPos >= TOKEN_STATES.HOME_START,
        isFinish: nextPos === TOKEN_STATES.FINISHED
    };
};

// Helper to check if move is valid
export const isValidMove = (playerId, tokens, tokenIdx, dice) => {
    const validMoves = getValidMoves(playerId, tokens, dice);
    return validMoves.includes(tokenIdx);
};
