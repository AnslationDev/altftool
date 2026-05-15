// scanner.jsx - Fixed with proper ball passing
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Eye, EyeOff, Play, RotateCcw, Info, CheckCircle, AlertCircle, 
  Share2, Trophy, Timer, Brain, Volume2, VolumeX,
  Twitter, Facebook, Copy
} from 'lucide-react';

export default function InattentionalBlindness() {
  const [gamePhase, setGamePhase] = useState('intro');
  const [difficulty, setDifficulty] = useState('normal');
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  const [showGorilla, setShowGorilla] = useState(false);
  const [gorillaPosition, setGorillaPosition] = useState('center');
  const [gorillaStep, setGorillaStep] = useState(0);
  const [score, setScore] = useState({ white: 0, black: 0 });
  const [userAnswer, setUserAnswer] = useState(null);
  const [gorillaSeen, setGorillaSeen] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  
  // Game state - using refs to avoid stale closures
  const [players, setPlayers] = useState([]);
  const [balls, setBalls] = useState([]);
  const [passLines, setPassLines] = useState([]);
  
  const [attentionScore, setAttentionScore] = useState(0);
  const [shareStats, setShareStats] = useState(null);
  const [actualPassCount, setActualPassCount] = useState(0);
  
  const gameAreaRef = useRef(null);
  const timerRef = useRef(null);
  const animationRef = useRef(null);
  const gorillaTimerRef = useRef(null);
  const passIntervalRef = useRef(null);
  
  // Use refs to keep latest values accessible in intervals
  const playersRef = useRef([]);
  const ballsRef = useRef([]);
  const scoreRef = useRef({ white: 0, black: 0 });

  // Keep refs in sync with state
  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { ballsRef.current = balls; }, [balls]);
  useEffect(() => { scoreRef.current = score; }, [score]);

  // Initialize players
  const initializePlayers = useCallback(() => {
    const whiteTeam = [
      { id: 1, team: 'white', x: 20, y: 30, dx: 0.3, dy: 0.4 },
      { id: 2, team: 'white', x: 50, y: 60, dx: -0.4, dy: -0.2 },
      { id: 3, team: 'white', x: 35, y: 20, dx: 0.2, dy: -0.3 },
    ];
    
    const blackTeam = [
      { id: 4, team: 'black', x: 65, y: 40, dx: -0.3, dy: 0.2 },
      { id: 5, team: 'black', x: 80, y: 65, dx: 0.2, dy: -0.4 },
      { id: 6, team: 'black', x: 50, y: 30, dx: -0.2, dy: 0.3 },
    ];
    
    const allPlayers = [...whiteTeam, ...blackTeam];
    setPlayers(allPlayers);
    
    // Each team gets a ball, starting with player 1 (white) and player 4 (black)
    setBalls([
      { id: 'white-ball', team: 'white', withPlayerId: 1, flying: false, progress: 1, fromPlayerId: null, toPlayerId: null },
      { id: 'black-ball', team: 'black', withPlayerId: 4, flying: false, progress: 1, fromPlayerId: null, toPlayerId: null },
    ]);
  }, []);

  // Animation loop - move players and balls
  const animateGame = useCallback(function animateLoop() {
    // Move players
    setPlayers(prev => {
      if (prev.length === 0) return prev;
      return prev.map(player => {
        let newX = player.x + player.dx;
        let newY = player.y + player.dy;
        let newDx = player.dx;
        let newDy = player.dy;

        if (newX <= 5) { newDx = Math.abs(newDx); newX = 5; }
        if (newX >= 95) { newDx = -Math.abs(newDx); newX = 95; }
        if (newY <= 5) { newDy = Math.abs(newDy); newY = 5; }
        if (newY >= 85) { newDy = -Math.abs(newDy); newY = 85; }

        // Random direction changes
        if (Math.random() < 0.01) {
          newDx += (Math.random() - 0.5) * 0.4;
          newDy += (Math.random() - 0.5) * 0.4;
        }

        // Speed limit
        const speed = Math.sqrt(newDx * newDx + newDy * newDy);
        if (speed > 0.7) {
          newDx = (newDx / speed) * 0.7;
          newDy = (newDy / speed) * 0.7;
        }

        return { ...player, x: newX, y: newY, dx: newDx, dy: newDy };
      });
    });

    // Move flying balls
    setBalls(prev => {
      return prev.map(ball => {
        if (!ball.flying) {
          // Ball follows its holder
          const currentPlayers = playersRef.current;
          const holder = currentPlayers.find(p => p.id === ball.withPlayerId);
          if (holder) {
            return { ...ball, x: holder.x, y: holder.y };
          }
          return ball;
        }
        
        // Ball in flight
        const newProgress = ball.progress + 0.05;
        
        if (newProgress >= 1) {
          // Arrived at target
          const updatedScore = { ...scoreRef.current };
          if (ball.team === 'white') {
            updatedScore.white += 1;
          } else {
            updatedScore.black += 1;
          }
          setScore(updatedScore);
          if (ball.team === 'white') {
            setActualPassCount(prev => prev + 1);
          }
          
          return {
            ...ball,
            flying: false,
            progress: 1,
            withPlayerId: ball.toPlayerId,
            fromPlayerId: null,
            toPlayerId: null
          };
        }
        
        // Move along arc
        const currentPlayers = playersRef.current;
        const from = currentPlayers.find(p => p.id === ball.fromPlayerId);
        const to = currentPlayers.find(p => p.id === ball.toPlayerId);
        
        if (!from || !to) return { ...ball, flying: false, progress: 1, withPlayerId: ball.toPlayerId };
        
        const t = newProgress;
        const cx = from.x + (to.x - from.x) * t;
        const cy = from.y + (to.y - from.y) * t - Math.sin(t * Math.PI) * 25;
        
        return { ...ball, x: cx, y: cy, progress: newProgress };
      });
    });

    animationRef.current = requestAnimationFrame(animateLoop);
  }, []);

  // Trigger a pass - uses refs to get latest state
  const triggerPass = useCallback((team) => {
    const currentPlayers = playersRef.current;
    const currentBalls = ballsRef.current;
    
    // Find team's ball
    const teamBall = currentBalls.find(b => b.team === team);
    if (!teamBall || teamBall.flying) return;
    
    // Find teammates
    const teammates = currentPlayers.filter(p => p.team === team && p.id !== teamBall.withPlayerId);
    if (teammates.length === 0) return;
    
    // Pick receiver - prefer furthest
    const passer = currentPlayers.find(p => p.id === teamBall.withPlayerId);
    if (!passer) return;
    
    let receiver;
    if (Math.random() < 0.7) {
      receiver = teammates.reduce((farthest, curr) => {
        const dCurr = Math.hypot(curr.x - passer.x, curr.y - passer.y);
        const dFar = Math.hypot(farthest.x - passer.x, farthest.y - passer.y);
        return dCurr > dFar ? curr : farthest;
      });
    } else {
      receiver = teammates[Math.floor(Math.random() * teammates.length)];
    }
    
    if (!receiver) return;
    
    // Add pass line
    const lineId = Date.now() + Math.random();
    setPassLines(prev => [...prev, { id: lineId, team, from: passer.id, to: receiver.id }]);
    
    // Remove pass line after delay
    setTimeout(() => {
      setPassLines(prev => prev.filter(l => l.id !== lineId));
    }, 500);
    
    // Launch ball
    setBalls(prev => prev.map(b => {
      if (b.id === teamBall.id) {
        return {
          ...b,
          flying: true,
          fromPlayerId: passer.id,
          toPlayerId: receiver.id,
          progress: 0
        };
      }
      return b;
    }));
  }, []);

  const handlePassCountSubmit = (count) => {
    setUserAnswer(count);
  };

  const startCountdown = () => {
    setGamePhase('countdown');
    let count = 3;
    setCountdownValue(count);
    
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        actualStartGame();
      } else {
        setCountdownValue(count);
      }
    }, 1000);
  };

  const actualStartGame = () => {
    setGamePhase('playing');
    setScore({ white: 0, black: 0 });
    setShowGorilla(false);
    setGorillaSeen(null);
    setUserAnswer(null);
    setActualPassCount(0);
    setPassLines([]);
    setGorillaStep(0);
    
    const times = { easy: 45, normal: 30, hard: 20 };
    setTimeLeft(times[difficulty]);
    
    initializePlayers();
    
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animateGame);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Gorilla appearance
    const gorillaConfig = {
      easy: { delay: 8000, duration: 10000 },
      normal: { delay: Math.floor(Math.random() * 6000) + 10000, duration: 5000 },
      hard: { delay: Math.floor(Math.random() * 8000) + 6000, duration: 3000 }
    };

    const config = gorillaConfig[difficulty];
    
    if (gorillaTimerRef.current) clearTimeout(gorillaTimerRef.current);
    gorillaTimerRef.current = setTimeout(() => {
      setShowGorilla(true);
      setGorillaPosition(['left', 'right'][Math.floor(Math.random() * 2)]);
      
      let step = 0;
      const gorillaWalk = setInterval(() => {
        setGorillaStep(prev => {
          const next = prev + 1;
          if (next >= 20) {
            clearInterval(gorillaWalk);
            return 20;
          }
          return next;
        });
      }, 250);
      
      setTimeout(() => {
        setShowGorilla(false);
        clearInterval(gorillaWalk);
        setGorillaStep(0);
      }, config.duration);
    }, config.delay);

    // Schedule passes - BOTH teams pass regularly
    const passFrequency = { easy: 2000, normal: 1500, hard: 1000 };
    if (passIntervalRef.current) clearInterval(passIntervalRef.current);
    
    // White team passes
    const whiteInterval = setInterval(() => {
      triggerPass('white');
    }, passFrequency[difficulty]);
    
    // Black team passes (slightly offset timing)
    const blackInterval = setInterval(() => {
      triggerPass('black');
    }, passFrequency[difficulty] + 300);

    // Store both intervals for cleanup
    passIntervalRef.current = { white: whiteInterval, black: blackInterval };
  };

  const endGame = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (gorillaTimerRef.current) clearTimeout(gorillaTimerRef.current);
    if (passIntervalRef.current) {
      clearInterval(passIntervalRef.current.white);
      clearInterval(passIntervalRef.current.black);
    }
    
    setGamePhase('results');
    setHasPlayed(true);
    setPassLines([]);
    
    const attentionScoreVal = Math.min(100, Math.round(30 + (timeLeft * 1.2) + Math.random() * 25));
    setAttentionScore(attentionScoreVal);
  };

  const handleResponse = (sawGorilla) => {
    setGorillaSeen(sawGorilla);
    setTimeout(() => setGamePhase('reveal'), 1500);
  };

  const generateShareStats = () => {
    const passDifference = Math.abs((userAnswer || 0) - actualPassCount);
    const accuracy = passDifference <= 2 ? 'Excellent' : passDifference <= 4 ? 'Good' : 'Needs Work';
    
    setShareStats({ accuracy, passDifference, gorillaSeen, difficulty, timeLeft, attentionScore, actualPassCount });
    setGamePhase('shared');
  };

  const shareToTwitter = () => {
    const text = gorillaSeen 
      ? `🦍 I spotted the gorilla! My count: ${userAnswer} (actual: ${actualPassCount}). Can you?`
      : `😱 I missed the gorilla! Counted ${userAnswer} passes. Test yourself!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Inattentional Blindness Test',
        text: gorillaSeen ? `🦍 I spotted the gorilla!` : `😱 I missed the gorilla!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      copyLink();
    }
  };

  const resetGame = () => {
    setGamePhase('intro');
    setScore({ white: 0, black: 0 });
    setShowGorilla(false);
    setGorillaSeen(null);
    setUserAnswer(null);
    setTimeLeft(30);
    setPlayers([]);
    setBalls([]);
    setPassLines([]);
    setAttentionScore(0);
    setShareStats(null);
    setActualPassCount(0);
    setGorillaStep(0);
    
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (gorillaTimerRef.current) clearTimeout(gorillaTimerRef.current);
    if (passIntervalRef.current) {
      clearInterval(passIntervalRef.current.white);
      clearInterval(passIntervalRef.current.black);
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (gorillaTimerRef.current) clearTimeout(gorillaTimerRef.current);
      if (passIntervalRef.current) {
        clearInterval(passIntervalRef.current.white);
        clearInterval(passIntervalRef.current.black);
      }
    };
  }, []);

  const globalStats = { total: 15234, gorillaSeen: 4127, percentSeen: 27.1 };

  return (
    <div className="min-h-screen bg-(--background) p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-(--primary)" />
            <h1 className="heading text-center">Inattentional Blindness</h1>
          </div>
          <p className="description">The Viral "Gorilla Experiment" — Test Your Awareness</p>
          
          {gamePhase === 'intro' && (
            <div className="mt-6 flex justify-center gap-2 flex-wrap">
              {[
                { level: 'easy', emoji: '🟢', label: 'Easy' },
                { level: 'normal', emoji: '🟡', label: 'Normal' },
                { level: 'hard', emoji: '🔴', label: 'Hard' }
              ].map(({ level, emoji, label }) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-5 py-2 rounded-full font-semibold capitalize transition-all ${
                    difficulty === level
                      ? 'bg-(--primary) text-white shadow-lg'
                      : 'bg-(--muted) text-(--muted-foreground) hover:bg-(--border)'
                  }`}
                >
                  {emoji} {label}
                </button>
              ))}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`ml-2 p-2 rounded-full transition-colors ${
                  soundEnabled ? 'bg-green-500 text-white' : 'bg-(--muted) text-(--muted-foreground)'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>

        <div className="bg-(--card) border border-(--border) rounded-3xl shadow-xl overflow-hidden">
          
          {gamePhase === 'intro' && (
            <div className="p-8 md:p-12">
              <div className="text-center max-w-3xl mx-auto">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-(--primary) rounded-full flex items-center justify-center mx-auto mb-6">
                    <EyeOff className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-(--foreground) mb-4">Are You Blind to the Obvious?</h2>
                  <p className="text-lg text-(--muted-foreground) mb-6">
                    In 1999, psychologists discovered: when focused, <strong className="text-(--primary)">50% of people miss a gorilla</strong> walking through.
                  </p>
                  <div className="bg-(--muted) border border-(--border) rounded-xl p-6 mb-8">
                    <h3 className="font-semibold text-(--foreground) mb-3">Your Mission:</h3>
                    <p className="text-(--muted-foreground)">
                      Count how many times <strong className="bg-white text-black px-2 py-1 rounded border border-gray-300">WHITE team</strong> passes the ball.
                    </p>
                  </div>
                  <button onClick={() => setGamePhase('instructions')} className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3 shadow-lg">
                    <Play className="w-6 h-6" /> Start the Experiment
                  </button>
                  {hasPlayed && (
                    <button onClick={startCountdown} className="mt-4 btn-secondary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3">
                      <RotateCcw className="w-6 h-6" /> Play Again
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 bg-(--muted) rounded-xl p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-(--primary)">{globalStats.total.toLocaleString()}</div>
                    <div className="text-sm text-(--muted-foreground)">Tested</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-(--foreground)">{globalStats.gorillaSeen.toLocaleString()}</div>
                    <div className="text-sm text-(--muted-foreground)">Saw Gorilla</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-(--primary)">{globalStats.percentSeen}%</div>
                    <div className="text-sm text-(--muted-foreground)">Noticed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {gamePhase === 'instructions' && (
            <div className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-(--foreground) mb-8 text-center">Instructions</h2>
                <div className="space-y-6 mb-8">
                  {[
                    { step: 1, title: 'Focus on White Team', desc: 'Count ONLY passes between WHITE shirt players.', icon: '👀' },
                    { step: 2, title: 'Ignore Black Team', desc: 'Black team also passes — ignore completely.', icon: '🚫' },
                    { step: 3, title: 'Keep Mental Count', desc: `${difficulty === 'easy' ? 45 : difficulty === 'normal' ? 30 : 20} second video. No writing!`, icon: '🧠' }
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
                <button onClick={startCountdown} className="btn-primary w-full px-8 py-5 rounded-xl text-xl font-bold flex items-center justify-center gap-3 shadow-lg">
                  <Play className="w-6 h-6" /> I'm Ready — Start!
                </button>
              </div>
            </div>
          )}

          {gamePhase === 'countdown' && (
            <div className="p-8 md:p-12 flex items-center justify-center" style={{ minHeight: '400px' }}>
              <div className="text-center">
                <div className="text-8xl font-black text-(--primary) animate-bounce mb-8">{countdownValue}</div>
                <p className="text-2xl text-(--muted-foreground)">Get ready...</p>
              </div>
            </div>
          )}

          {gamePhase === 'playing' && (
            <div className="p-6">
              <div className="flex justify-center items-center mb-4">
                <div className={`px-6 py-2 rounded-lg font-mono text-xl font-bold ${
                  timeLeft <= 5 ? 'bg-red-500 text-white animate-pulse' : 
                  timeLeft <= 10 ? 'bg-yellow-500 text-black' : 
                  'bg-(--primary) text-white'
                }`}>
                  ⏱ {timeLeft}s
                </div>
              </div>

              <div 
                ref={gameAreaRef}
                className="relative bg-gradient-to-br from-amber-900/30 via-orange-950/40 to-amber-900/30 rounded-xl overflow-hidden shadow-2xl"
                style={{ height: '500px' }}
              >
                {/* Court floor */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.08) 39px, rgba(255,255,255,0.08) 40px)'
                }}></div>

                {/* Court markings */}
                <div className="absolute inset-0">
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/40"></div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40"></div>
                  <div className="absolute top-1/2 left-1/2 w-28 h-28 border-2 border-white/40 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-1/2 w-12 h-12 border border-white/25 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>

                {/* Pass lines */}
                <svg className="absolute inset-0 pointer-events-none z-10">
                  {passLines.map(line => {
                    const from = players.find(p => p.id === line.from);
                    const to = players.find(p => p.id === line.to);
                    if (!from || !to) return null;
                    return (
                      <line
                        key={line.id}
                        x1={`${from.x}%`} y1={`${from.y}%`}
                        x2={`${to.x}%`} y2={`${to.y}%`}
                        stroke={line.team === 'white' ? '#fb923c' : '#6b7280'}
                        strokeWidth="2.5"
                        strokeDasharray="8,4"
                        opacity="0.8"
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>

                {/* Players */}
                {players.map((player) => {
                  // Check if this player has the ball
                  const hasBall = balls.some(b => !b.flying && b.withPlayerId === player.id && b.team === player.team);
                  
                  return (
                    <div
                      key={player.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 z-20"
                      style={{ left: `${player.x}%`, top: `${player.y}%` }}
                    >
                      {/* Shadow */}
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-black/30 rounded-full blur-sm"></div>
                      
                      {/* Body */}
                      <div className={`w-10 h-14 rounded-lg flex items-center justify-center shadow-md border-2 relative ${
                        player.team === 'white' 
                          ? 'bg-white text-gray-900 border-gray-300' 
                          : 'bg-gray-950 text-white border-gray-700'
                      }`}>
                        <span className="font-bold text-sm">{player.id}</span>
                      </div>
                      
                      {/* Head */}
                      <div className={`w-7 h-7 rounded-full absolute -top-4 left-1/2 transform -translate-x-1/2 border-2 ${
                        player.team === 'white' 
                          ? 'bg-amber-200 border-gray-300' 
                          : 'bg-amber-700 border-gray-600'
                      }`}>
                        <div className="flex justify-center gap-1 mt-1.5">
                          <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Ball indicator if holding */}
                      {hasBall && (
                        <div className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full shadow ${
                          player.team === 'white' ? 'bg-orange-400' : 'bg-gray-500'
                        }`}></div>
                      )}
                    </div>
                  );
                })}

                {/* Flying balls */}
                {balls.filter(b => b.flying).map(ball => (
                  <div
                    key={ball.id}
                    className="absolute z-30"
                    style={{
                      left: `${ball.x}%`,
                      top: `${ball.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className={`w-4 h-4 rounded-full shadow-lg border-2 ${
                      ball.team === 'white' 
                        ? 'bg-orange-400 border-orange-500' 
                        : 'bg-gray-500 border-gray-600'
                    }`}>
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-0.5 bg-black/20 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Gorilla */}
                {showGorilla && (
                  <div 
                    className="absolute z-40 transition-all duration-300"
                    style={{
                      bottom: '25%',
                      left: gorillaPosition === 'left' ? `${gorillaStep * 4.5}%` : `${90 - gorillaStep * 4.5}%`,
                    }}
                  >
                    <span className={`${
                      difficulty === 'hard' ? 'text-4xl opacity-50' : 
                      difficulty === 'normal' ? 'text-6xl' : 'text-7xl'
                    } filter drop-shadow-xl block`}>🦍</span>
                    <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap shadow-lg">
                      GORILLA
                    </div>
                  </div>
                )}

                {/* Bottom reminder */}
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg z-10">
                  Count ONLY ⚪ White team passes
                </div>
              </div>
            </div>
          )}

          {gamePhase === 'results' && (
            <div className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-(--foreground) mb-6">Quick — Before You Forget!</h2>
                <div className="bg-(--muted) border-2 border-(--border) rounded-xl p-8 mb-8">
                  <h3 className="text-xl font-semibold mb-6 text-(--foreground)">How many passes did WHITE team make?</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[10, 11, 12, 13, 14, 15, 16, 17].map(count => (
                      <button key={count} onClick={() => handlePassCountSubmit(count)}
                        className={`py-5 px-4 rounded-xl font-bold text-xl transition-all ${
                          userAnswer === count ? 'bg-(--primary) text-white shadow-xl scale-105' : 'bg-(--card) border-2 border-(--border) text-(--foreground) hover:border-(--primary)'
                        }`}>
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
                {userAnswer && (
                  <div style={{ animation: 'fadeIn 0.5s ease-in' }}>
                    <h3 className="text-2xl font-bold text-(--foreground) mb-4">Did you see anything unusual?</h3>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <button onClick={() => handleResponse(true)} className={`p-6 rounded-xl border-2 transition-all ${gorillaSeen === true ? 'bg-green-50 border-green-500 shadow-lg' : 'bg-(--card) border-(--border) hover:border-green-400'}`}>
                        <span className="text-5xl mb-3 block">🦍</span>
                        <span className="font-semibold text-(--foreground)">Yes! Gorilla!</span>
                      </button>
                      <button onClick={() => handleResponse(false)} className={`p-6 rounded-xl border-2 transition-all ${gorillaSeen === false ? 'bg-red-50 border-red-500 shadow-lg' : 'bg-(--card) border-(--border) hover:border-red-400'}`}>
                        <span className="text-5xl mb-3 block">🤔</span>
                        <span className="font-semibold text-(--foreground)">What gorilla?</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {gamePhase === 'reveal' && (
            <div className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto text-center">
                <div className={`mb-8 p-6 rounded-xl ${gorillaSeen ? 'bg-green-50 border-2 border-green-400' : 'bg-red-50 border-2 border-red-400'}`}>
                  {gorillaSeen ? (
                    <><Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" /><h2 className="text-2xl font-bold text-green-800">You're in the 27%!</h2></>
                  ) : (
                    <><AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" /><h2 className="text-2xl font-bold text-red-800">You Missed the Gorilla!</h2></>
                  )}
                </div>
                <div className="bg-(--muted) border border-(--border) rounded-xl p-8 mb-8">
                  <h3 className="text-xl font-bold text-(--foreground) mb-4">🦍 A Gorilla Walked Through!</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800"><strong>Actual white passes:</strong> {actualPassCount}<br/><strong>Your count:</strong> {userAnswer}</p>
                  </div>
                </div>
                <button onClick={generateShareStats} className="btn-primary w-full px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-3 shadow-lg">
                  <Share2 className="w-5 h-5" /> See Results & Share
                </button>
                <button onClick={resetGame} className="btn-secondary w-full px-8 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-3 mt-4">
                  <RotateCcw className="w-5 h-5" /> Try Again
                </button>
              </div>
            </div>
          )}

          {gamePhase === 'shared' && shareStats && (
            <div className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl font-bold text-(--foreground) mb-8">Your Results</h2>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { label: 'Your Count', value: userAnswer },
                    { label: 'Actual Passes', value: shareStats.actualPassCount },
                    { label: 'Accuracy', value: shareStats.accuracy },
                    { label: 'Gorilla Seen', value: shareStats.gorillaSeen ? 'Yes ✅' : 'No ❌' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-(--muted) rounded-xl p-4">
                      <div className="text-sm text-(--muted-foreground)">{stat.label}</div>
                      <div className="text-2xl font-bold text-(--foreground)">{stat.value}</div>
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
                  <button onClick={nativeShare} className="w-full bg-(--primary) text-white px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3">
                    <Share2 className="w-5 h-5" /> Share via Apps
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
          Based on the "Invisible Gorilla" experiment by Chabris & Simons (1999)
        </div>
      </div>
      <style jsx>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}