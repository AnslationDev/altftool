// scanner.jsx - Clean Visual Working Memory Test with proper logic
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Brain, Zap, Target, Timer, Trophy, RotateCcw, Play, Share2,
  TrendingUp, Lightbulb, Eye, CheckCircle,
  AlertCircle, ChevronRight, Copy, Twitter, Facebook, Star,
  Sparkles, Crown, Medal, Flame
} from 'lucide-react';

// Difficulty configuration
const LEVELS = {
  beginner: {
    name: 'Beginner',
    emoji: '🌱',
    items: [2, 3, 3, 4, 4],
    displayTime: 3000,
    gridSize: 3,
    colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
    shapes: ['circle', 'square', 'triangle', 'star'],
    description: '2-4 items, 3×3 grid, 3 seconds'
  },
  easy: {
    name: 'Easy',
    emoji: '🟢',
    items: [3, 4, 4, 5, 5],
    displayTime: 2000,
    gridSize: 4,
    colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    shapes: ['circle', 'square', 'triangle', 'star', 'diamond'],
    description: '3-5 items, 4×4 grid, 2 seconds'
  },
  medium: {
    name: 'Medium',
    emoji: '🟡',
    items: [4, 5, 6, 6, 7],
    displayTime: 1500,
    gridSize: 4,
    colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'],
    shapes: ['circle', 'square', 'triangle', 'star', 'diamond', 'hexagon', 'cross'],
    description: '4-7 items, 4×4 grid, 1.5 seconds'
  },
  hard: {
    name: 'Hard',
    emoji: '🔴',
    items: [5, 6, 7, 8, 9],
    displayTime: 1000,
    gridSize: 5,
    colors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#06b6d4', '#84cc16'],
    shapes: ['circle', 'square', 'triangle', 'star', 'diamond', 'hexagon', 'cross', 'heart', 'moon'],
    description: '5-9 items, 5×5 grid, 1 second'
  }
};

// Shape component
const ShapeRenderer = ({ shape, color, size = 40 }) => {
  switch (shape) {
    case 'circle':
      return <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color, border: '2px solid rgba(255,255,255,0.3)' }} />;
    case 'square':
      return <div style={{ width: size, height: size, backgroundColor: color, borderRadius: '6px', border: '2px solid rgba(255,255,255,0.3)' }} />;
    case 'triangle':
      return (
        <div style={{
          width: 0, height: 0,
          borderLeft: `${size/2}px solid transparent`,
          borderRight: `${size/2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
        }} />
      );
    case 'star':
      return <span style={{ fontSize: size * 1.1, color, lineHeight: 1 }}>★</span>;
    case 'diamond':
      return (
        <div style={{
          width: size * 0.7, height: size * 0.7,
          backgroundColor: color,
          transform: 'rotate(45deg)',
          borderRadius: '4px',
          border: '2px solid rgba(255,255,255,0.3)',
          margin: size * 0.15
        }} />
      );
    case 'hexagon':
      return <span style={{ fontSize: size * 1.2, color }}>⬡</span>;
    case 'cross':
      return <span style={{ fontSize: size * 1.1, color }}>✚</span>;
    case 'heart':
      return <span style={{ fontSize: size, color }}>♥</span>;
    case 'moon':
      return <span style={{ fontSize: size * 1.1, color }}>☾</span>;
    default:
      return <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: color }} />;
  }
};

// Generate random positions
const generatePositions = (count, gridSize) => {
  const positions = [];
  const used = new Set();
  
  while (positions.length < count) {
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * gridSize);
    const key = `${row}-${col}`;
    
    if (!used.has(key)) {
      used.add(key);
      positions.push({ row, col });
    }
  }
  
  return positions;
};

export default function VisualWorkingMemory() {
  const [gamePhase, setGamePhase] = useState('intro');
  const [difficulty, setDifficulty] = useState('medium');
  const [currentRound, setCurrentRound] = useState(0);
  const totalRounds = 5;
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  
  // Round data
  const [memoryItems, setMemoryItems] = useState([]);
  const [gridSize, setGridSize] = useState(4);
  const [selectedCells, setSelectedCells] = useState([]);
  const [recallSubmitted, setRecallSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  
  // Timer
  const [memorizeTimeLeft, setMemorizeTimeLeft] = useState(0);
  const [countdownValue, setCountdownValue] = useState(3);
  
  // Stats
  const [roundResults, setRoundResults] = useState([]);
  const [memorySpan, setMemorySpan] = useState(0);
  const [shareStats, setShareStats] = useState(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // Cell size based on grid
  const getCellSize = (size) => {
    if (size <= 3) return 'w-20 h-20 md:w-24 md:h-24';
    if (size <= 4) return 'w-16 h-16 md:w-20 md:h-20';
    return 'w-14 h-14 md:w-16 md:h-16';
  };

  const getShapeSize = (size) => {
    if (size <= 3) return 50;
    if (size <= 4) return 40;
    return 30;
  };

  // Initialize a new round
  const initRound = useCallback((roundIndex) => {
    const config = LEVELS[difficulty];
    const itemCount = config.items[roundIndex];
    const size = config.gridSize;
    
    const shuffledColors = [...config.colors].sort(() => Math.random() - 0.5);
    const shuffledShapes = [...config.shapes].sort(() => Math.random() - 0.5);
    const positions = generatePositions(itemCount, size);
    
    const items = positions.map((pos, i) => ({
      id: i,
      row: pos.row,
      col: pos.col,
      color: shuffledColors[i % shuffledColors.length],
      shape: shuffledShapes[i % shuffledShapes.length]
    }));
    
    setMemoryItems(items);
    setGridSize(size);
    setSelectedCells([]);
    setRecallSubmitted(false);
    setIsCorrect(null);
    setMemorizeTimeLeft(config.displayTime / 1000);
  }, [difficulty]);

  // Countdown before starting
  const startCountdown = () => {
    setGamePhase('countdown');
    let count = 3;
    setCountdownValue(count);
    
    countdownRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(countdownRef.current);
        startMemorize();
      } else {
        setCountdownValue(count);
      }
    }, 1000);
  };

  // Memorize phase
  const startMemorize = () => {
    setGamePhase('memorize');
    initRound(currentRound);
    
    const displayTime = LEVELS[difficulty].displayTime;
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setMemorizeTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current);
          setGamePhase('recall');
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);
  };

  // Cell click handler
  const handleCellClick = (row, col) => {
    if (recallSubmitted) return;
    
    const cellKey = `${row}-${col}`;
    setSelectedCells(prev => {
      if (prev.includes(cellKey)) {
        return prev.filter(c => c !== cellKey);
      } else {
        return [...prev, cellKey];
      }
    });
  };

  // Submit answer
  const submitRecall = () => {
    if (recallSubmitted) return;
    setRecallSubmitted(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    const correctCells = memoryItems.map(item => `${item.row}-${item.col}`);
    const correctSelections = selectedCells.filter(cell => correctCells.includes(cell));
    const incorrectSelections = selectedCells.filter(cell => !correctCells.includes(cell));
    const missedCells = correctCells.filter(cell => !selectedCells.includes(cell));
    
    const accuracy = correctCells.length > 0 ? correctSelections.length / correctCells.length : 0;
    const perfectRound = missedCells.length === 0 && incorrectSelections.length === 0;
    
    setIsCorrect(perfectRound);
    
    // Score calculation
    const roundScore = Math.round(accuracy * 100);
    setScore(prev => prev + roundScore);
    
    // Streak
    if (perfectRound) {
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
    } else {
      setStreak(0);
    }
    
    // Save round result
    setRoundResults(prev => [...prev, {
      round: currentRound + 1,
      itemsCount: memoryItems.length,
      correct: perfectRound,
      accuracy: Math.round(accuracy * 100),
      score: roundScore
    }]);
  };

  // Next round or finish
  const nextRound = () => {
    if (currentRound + 1 >= totalRounds) {
      finishGame();
    } else {
      setCurrentRound(prev => prev + 1);
      startMemorize();
    }
  };

  // Finish game
  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGamePhase('results');
    
    // Calculate memory span
    const maxCorrect = roundResults.reduce((max, r) => 
      r.correct ? Math.max(max, r.itemsCount) : max, 0
    );
    setMemorySpan(maxCorrect || roundResults[roundResults.length - 1]?.itemsCount || 0);
    
    // Update best score
    setScore(prev => {
      if (prev > bestScore) setBestScore(prev);
      return prev;
    });
    
    setHasPlayed(true);
    setGamesPlayed(prev => prev + 1);
  };

  // Generate share stats
  const generateShareStats = () => {
    const maxScore = totalRounds * 100;
    const percentage = Math.round((score / maxScore) * 100);
    
    let category;
    if (percentage >= 90) category = 'Genius';
    else if (percentage >= 70) category = 'Excellent';
    else if (percentage >= 50) category = 'Good';
    else category = 'Keep Practicing';
    
    setShareStats({
      score,
      maxScore,
      percentage,
      category,
      memorySpan,
      correctRounds: roundResults.filter(r => r.correct).length,
      totalRounds,
      difficulty: LEVELS[difficulty].name,
      bestStreak
    });
    
    setGamePhase('shared');
  };

  // Share functions
  const shareToTwitter = () => {
    const text = `🧠 Memory Test: ${score}/${totalRounds * 100} points! Span: ${memorySpan} items. Can you beat me?`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  // Reset game
  const resetGame = () => {
    setGamePhase('intro');
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setMemoryItems([]);
    setGridSize(4);
    setSelectedCells([]);
    setRecallSubmitted(false);
    setIsCorrect(null);
    setMemorizeTimeLeft(0);
    setRoundResults([]);
    setMemorySpan(0);
    setShareStats(null);
    
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-(--background) p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-(--primary)" />
            <h1 className="heading text-center">Visual Working Memory Test</h1>
          </div>
          <p className="description">Test your memory — How many items can you remember?</p>
          
          {gamePhase === 'intro' && (
            <div className="mt-6 flex justify-center gap-2 flex-wrap">
              {Object.entries(LEVELS).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm capitalize transition-all ${
                    difficulty === key
                      ? 'bg-(--primary) text-white shadow-lg'
                      : 'bg-(--muted) text-(--muted-foreground) hover:bg-(--border)'
                  }`}
                >
                  {config.emoji} {config.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-(--card) border border-(--border) rounded-3xl shadow-xl overflow-hidden">
          
          {/* Intro */}
          {gamePhase === 'intro' && (
            <div className="p-8 md:p-12">
              <div className="text-center max-w-3xl mx-auto">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-(--primary) rounded-full flex items-center justify-center mx-auto mb-6">
                    <Eye className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-(--foreground) mb-4">
                    How Good Is Your Working Memory?
                  </h2>
                  <p className="text-lg text-(--muted-foreground) mb-6">
                    Working memory holds info temporarily. Average person: <strong className="text-(--primary)">4-7 items</strong>.
                  </p>
                  
                  <div className="bg-(--muted) border border-(--border) rounded-xl p-6 mb-8">
                    <h3 className="font-semibold text-(--foreground) mb-3">How it works:</h3>
                    <div className="space-y-2 text-left text-(--muted-foreground)">
                      <p>👀 <strong>Memorize</strong> — Shapes appear briefly</p>
                      <p>🧠 <strong>Recall</strong> — Click where they were</p>
                      <p>📈 <strong>5 Rounds</strong> — Increasing difficulty</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setGamePhase('instructions')}
                    className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3 shadow-lg"
                  >
                    <Play className="w-6 h-6" /> Start Memory Test
                  </button>

                  {hasPlayed && (
                    <button onClick={startCountdown} className="mt-4 btn-secondary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3 ml-4">
                      <RotateCcw className="w-6 h-6" /> Play Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {gamePhase === 'instructions' && (
            <div className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-(--foreground) mb-8 text-center">How to Play</h2>
                
                <div className="space-y-6 mb-8">
                  {[
                    { step: 1, title: 'Memorize', desc: `Shapes appear for ${LEVELS[difficulty].displayTime / 1000}s on a ${LEVELS[difficulty].gridSize}×${LEVELS[difficulty].gridSize} grid.`, icon: '👁️' },
                    { step: 2, title: 'Recall', desc: 'Click cells where shapes were. No time limit — be accurate!', icon: '🧠' },
                    { step: 3, title: 'Score', desc: `${totalRounds} rounds, harder each time. Perfect rounds earn 100 points!`, icon: '🎯' }
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4 items-start">
                      <div className="w-12 h-12 bg-(--primary) rounded-xl flex items-center justify-center shrink-0 mt-1">
                        <span className="text-white font-bold text-lg">{item.step}</span>
                      </div>
                      <div className="bg-(--muted) border border-(--border) rounded-xl p-5 flex-1">
                        <span className="text-2xl mr-2">{item.icon}</span>
                        <h3 className="font-semibold text-(--foreground) text-lg inline">{item.title}</h3>
                        <p className="text-(--muted-foreground) mt-2">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-(--primary)/10 border border-(--primary)/30 rounded-xl p-4 mb-8">
                  <p className="text-sm text-(--muted-foreground) text-center">
                    <strong>{LEVELS[difficulty].name} Mode:</strong> {LEVELS[difficulty].description}
                  </p>
                </div>

                <button onClick={startCountdown} className="btn-primary w-full px-8 py-5 rounded-xl text-xl font-bold flex items-center justify-center gap-3 shadow-lg">
                  <Play className="w-6 h-6" /> Start Test
                </button>
              </div>
            </div>
          )}

          {/* Countdown */}
          {gamePhase === 'countdown' && (
            <div className="p-8 md:p-12 flex items-center justify-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <div className="text-8xl font-black text-(--primary) animate-bounce mb-8">{countdownValue}</div>
                <p className="text-2xl text-(--muted-foreground)">Get ready...</p>
              </div>
            </div>
          )}

          {/* Memorize Phase */}
          {gamePhase === 'memorize' && (
            <div className="p-6 md:p-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-(--primary) text-white px-4 py-2 rounded-lg font-semibold text-sm">
                    Round {currentRound + 1}/{totalRounds}
                  </div>
                  <div className="text-(--muted-foreground) text-sm">
                    Score: <strong className="text-(--foreground)">{score}</strong>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-mono text-lg font-bold ${
                  memorizeTimeLeft <= 1 ? 'bg-red-500 text-white animate-pulse' : 
                  memorizeTimeLeft <= 2 ? 'bg-yellow-500 text-black' : 
                  'bg-(--primary) text-white'
                }`}>
                  ⏱ {memorizeTimeLeft.toFixed(1)}s
                </div>
              </div>

              {/* Grid */}
              <div className="flex justify-center">
                <div className="p-6 md:p-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl">
                  <div 
                    className="grid gap-2 md:gap-3"
                    style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                  >
                    {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                      const row = Math.floor(index / gridSize);
                      const col = index % gridSize;
                      const item = memoryItems.find(i => i.row === row && i.col === col);
                      
                      return (
                        <div
                          key={index}
                          className={`${getCellSize(gridSize)} rounded-lg flex items-center justify-center`}
                          style={{
                            backgroundColor: item ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                            border: item ? '2px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)'
                          }}
                        >
                          {item && <ShapeRenderer shape={item.shape} color={item.color} size={getShapeSize(gridSize)} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 max-w-md mx-auto bg-(--muted) rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-(--primary) to-purple-500 rounded-full transition-all duration-100"
                  style={{ width: `${(memorizeTimeLeft / (LEVELS[difficulty].displayTime / 1000)) * 100}%` }}
                ></div>
              </div>

              <p className="text-center mt-4 text-(--muted-foreground) text-sm">Memorize positions!</p>
            </div>
          )}

          {/* Recall Phase */}
          {gamePhase === 'recall' && (
            <div className="p-6 md:p-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-(--primary) text-white px-4 py-2 rounded-lg font-semibold text-sm">
                    Round {currentRound + 1}/{totalRounds}
                  </div>
                  <div className="text-(--muted-foreground) text-sm">
                    Streak: {streak > 0 && '🔥'}{streak}
                  </div>
                </div>
                <div className="text-(--foreground) font-semibold">
                  Selected: {selectedCells.length}
                </div>
              </div>

              {/* Recall Grid */}
              <div className="flex justify-center mb-6">
                <div className="p-6 md:p-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl">
                  <div 
                    className="grid gap-2 md:gap-3"
                    style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
                  >
                    {Array.from({ length: gridSize * gridSize }).map((_, index) => {
                      const row = Math.floor(index / gridSize);
                      const col = index % gridSize;
                      const cellKey = `${row}-${col}`;
                      const isSelected = selectedCells.includes(cellKey);
                      const actualItem = memoryItems.find(i => i.row === row && i.col === col);
                      
                      // Determine cell style based on state
                      let bgColor = 'rgba(255,255,255,0.03)';
                      let borderColor = 'rgba(255,255,255,0.1)';
                      
                      if (recallSubmitted) {
                        if (actualItem && isSelected) {
                          bgColor = 'rgba(16,185,129,0.3)';
                          borderColor = '#10b981';
                        } else if (isSelected && !actualItem) {
                          bgColor = 'rgba(239,68,68,0.3)';
                          borderColor = '#ef4444';
                        } else if (!isSelected && actualItem) {
                          bgColor = 'rgba(245,158,11,0.2)';
                          borderColor = '#f59e0b';
                        }
                      } else if (isSelected) {
                        bgColor = 'rgba(59,130,246,0.3)';
                        borderColor = '#3b82f6';
                      }
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleCellClick(row, col)}
                          disabled={recallSubmitted}
                          className={`${getCellSize(gridSize)} rounded-lg flex items-center justify-center transition-all ${
                            !recallSubmitted ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                          }`}
                          style={{
                            backgroundColor: bgColor,
                            border: `2px solid ${borderColor}`
                          }}
                        >
                          {recallSubmitted && actualItem && (
                            <ShapeRenderer shape={actualItem.shape} color={actualItem.color} size={getShapeSize(gridSize)} />
                          )}
                          {!recallSubmitted && isSelected && (
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="text-center">
                {!recallSubmitted ? (
                  <>
                    <button
                      onClick={submitRecall}
                      disabled={selectedCells.length === 0}
                      className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3 shadow-lg disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5" /> Submit Answer
                    </button>
                    <p className="text-sm text-(--muted-foreground) mt-2">Click where shapes were</p>
                  </>
                ) : (
                  <>
                    {isCorrect ? (
                      <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4 mb-4 inline-flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-green-600" />
                        <span className="text-green-800 font-semibold">Perfect!</span>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-4 text-sm">
                        <span className="text-green-600 font-bold">Green</span> = Correct |{' '}
                        <span className="text-red-600 font-bold">Red</span> = Wrong |{' '}
                        <span className="text-orange-500 font-bold">Orange</span> = Missed
                      </div>
                    )}
                    <button
                      onClick={nextRound}
                      className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3 shadow-lg"
                    >
                      {currentRound + 1 >= totalRounds ? (
                        <><Trophy className="w-5 h-5" /> See Results</>
                      ) : (
                        <><ChevronRight className="w-5 h-5" /> Next Round</>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {gamePhase === 'results' && (
            <div className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-(--foreground) mb-2">Test Complete!</h2>
                
                {/* Score */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-36 h-36">
                    <svg className="transform -rotate-90" viewBox="0 0 144 144">
                      <circle cx="72" cy="72" r="64" fill="none" stroke="currentColor" strokeWidth="8" className="text-(--muted)" />
                      <circle cx="72" cy="72" r="64" fill="none" stroke="currentColor" strokeWidth="8" 
                        className="text-(--primary)"
                        strokeDasharray={`${(score / (totalRounds * 100)) * 402} 402`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div>
                        <div className="text-4xl font-black text-(--foreground)">{score}</div>
                        <div className="text-sm text-(--muted-foreground)">/ {totalRounds * 100}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: 'Memory Span', value: `${memorySpan} items`, icon: '🧠' },
                    { label: 'Best Streak', value: `${bestStreak}🔥`, icon: '🔥' },
                    { label: 'Correct Rounds', value: `${roundResults.filter(r => r.correct).length}/${totalRounds}`, icon: '🎯' },
                    { label: 'Difficulty', value: LEVELS[difficulty].name, icon: '📊' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-(--muted) rounded-xl p-4 text-center">
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className="text-xs text-(--muted-foreground)">{stat.label}</div>
                      <div className="text-xl font-bold text-(--foreground)">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Round details */}
                <div className="bg-(--muted) border border-(--border) rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-(--foreground) mb-4">Round Details</h3>
                  {roundResults.map((r, i) => (
                    <div key={i} className="flex justify-between items-center bg-(--card) rounded-lg px-4 py-2 mb-2">
                      <span>Round {r.round}</span>
                      <span className="text-sm text-(--muted-foreground)">{r.itemsCount} items</span>
                      <span className={r.correct ? 'text-green-600' : 'text-red-600'}>
                        {r.correct ? '✓' : '✗'} {r.accuracy}%
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={generateShareStats} className="btn-primary w-full px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-3 shadow-lg mb-4">
                  <Share2 className="w-5 h-5" /> Share Results
                </button>
                <button onClick={resetGame} className="btn-secondary w-full px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-3">
                  <RotateCcw className="w-5 h-5" /> Try Again
                </button>
              </div>
            </div>
          )}

          {/* Shared */}
          {gamePhase === 'shared' && shareStats && (
            <div className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-(--foreground) mb-8">Your Results</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: 'Score', value: `${shareStats.score}/${shareStats.maxScore}` },
                    { label: 'Percentage', value: `${shareStats.percentage}%` },
                    { label: 'Memory Span', value: `${shareStats.memorySpan} items` },
                    { label: 'Correct', value: `${shareStats.correctRounds}/${shareStats.totalRounds}` },
                    { label: 'Best Streak', value: shareStats.bestStreak },
                    { label: 'Difficulty', value: shareStats.difficulty }
                  ].map((stat, i) => (
                    <div key={i} className="bg-(--muted) rounded-xl p-4">
                      <div className="text-sm text-(--muted-foreground)">{stat.label}</div>
                      <div className="text-xl font-bold text-(--foreground)">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button onClick={shareToTwitter} className="w-full bg-black hover:bg-gray-800 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3">
                    <Twitter className="w-5 h-5" /> Share on X
                  </button>
                  <button onClick={shareToFacebook} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3">
                    <Facebook className="w-5 h-5" /> Share on Facebook
                  </button>
                  <button onClick={copyLink} className="btn-secondary w-full px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3">
                    <Copy className="w-5 h-5" /> Copy Link
                  </button>
                  <button onClick={resetGame} className="btn-secondary w-full px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 mt-4">
                    <RotateCcw className="w-5 h-5" /> Play Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-(--muted-foreground)">
          Based on Visual Working Memory paradigm in cognitive psychology
        </div>
      </div>
    </div>
  );
}