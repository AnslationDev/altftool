// scanner.jsx - Stroop Effect Test - Cognitive Interference Experiment
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Brain, Zap, Timer, Trophy, RotateCcw, Play, Share2,
  TrendingUp, Target, AlertCircle, CheckCircle, X,
  BarChart3, Copy, Twitter, Facebook, Eye, Lightbulb,
  ChevronRight, Info
} from 'lucide-react';

// Stroop test configuration
const COLORS = [
  { name: 'Red', hex: '#ef4444', textColor: 'text-red-500' },
  { name: 'Blue', hex: '#3b82f6', textColor: 'text-blue-500' },
  { name: 'Green', hex: '#10b981', textColor: 'text-green-500' },
  { name: 'Yellow', hex: '#eab308', textColor: 'text-yellow-500' },
  { name: 'Purple', hex: '#8b5cf6', textColor: 'text-purple-500' },
  { name: 'Orange', hex: '#f97316', textColor: 'text-orange-500' },
];

const TOTAL_TRIALS = 30;
const WORDS = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'];

// Generate trials: some congruent (word matches color), some incongruent (word doesn't match)
const generateTrials = (count) => {
  const trials = [];
  const congruentCount = Math.floor(count * 0.3); // 30% congruent
  const incongruentCount = count - congruentCount;

  // Generate congruent trials
  for (let i = 0; i < congruentCount; i++) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    trials.push({
      id: i,
      word: color.name.toUpperCase(),
      color: color,
      type: 'congruent',
    });
  }

  // Generate incongruent trials
  for (let i = congruentCount; i < count; i++) {
    const wordColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    let displayColor;
    do {
      displayColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    } while (displayColor.name === wordColor.name);
    
    trials.push({
      id: i,
      word: wordColor.name.toUpperCase(),
      color: displayColor,
      type: 'incongruent',
    });
  }

  // Shuffle trials
  return trials.sort(() => Math.random() - 0.5);
};

export default function StroopEffect() {
  const [gamePhase, setGamePhase] = useState('intro');
  // intro, instructions, countdown, playing, results, shared
  
  const [trials, setTrials] = useState([]);
  const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [responses, setResponses] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [trialStartTime, setTrialStartTime] = useState(null);
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const [countdownValue, setCountdownValue] = useState(3);
  
  // Feedback
  const [feedback, setFeedback] = useState(null); // { correct, color }
  const [lastReactionTime, setLastReactionTime] = useState(null);
  
  // Stats
  const [averageReactionTime, setAverageReactionTime] = useState(0);
  const [congruentAvg, setCongruentAvg] = useState(0);
  const [incongruentAvg, setIncongruentAvg] = useState(0);
  const [stroopEffect, setStroopEffect] = useState(0);
  const [shareStats, setShareStats] = useState(null);
  const [bestScore, setBestScore] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const colorButtonsRef = useRef(null);
  const handleColorClickRef = useRef(null);

  // Global stats
  const [globalStats] = useState({
    total: 12456,
    avgReaction: 850,
    avgStroopEffect: 120,
    accuracyRate: 94
  });

  // Start countdown
  const startCountdown = () => {
    setGamePhase('countdown');
    let count = 3;
    setCountdownValue(count);
    
    countdownRef.current = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(countdownRef.current);
        startGame();
      } else {
        setCountdownValue(count);
      }
    }, 800);
  };

  // Start game
  const startGame = () => {
    const generatedTrials = generateTrials(TOTAL_TRIALS);
    setTrials(generatedTrials);
    setCurrentTrialIndex(0);
    setScore(0);
    setResponses([]);
    setFeedback(null);
    setLastReactionTime(null);
    setAverageReactionTime(0);
    setCongruentAvg(0);
    setIncongruentAvg(0);
    setStroopEffect(0);
    setTimeLeft(5);
    setStartTime(Date.now());
    setTrialStartTime(Date.now());
    setGamePhase('playing');
    
    startTrialTimer();
  };

  // Start trial timer
  const startTrialTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(5);
    setTrialStartTime(Date.now());
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);
  };

  // Handle timeout
  const handleTimeout = () => {
    const reactionTime = 5000;
    handleResponse(null, reactionTime, true);
  };

  // Handle color button click
  const handleColorClick = (selectedColor) => {
    if (!trialStartTime || feedback) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    const reactionTime = Date.now() - trialStartTime;
    setLastReactionTime(reactionTime);
    
    const currentTrial = trials[currentTrialIndex];
    const correct = selectedColor.name === currentTrial.color.name;
    
    handleResponse(selectedColor, reactionTime, false, correct);
  };

  useEffect(() => {
    handleColorClickRef.current = handleColorClick;
  });

  // Process response
  const handleResponse = (selectedColor, reactionTime, timeout, correct = false) => {
    const currentTrial = trials[currentTrialIndex];
    
    // Set feedback
    setFeedback({
      correct: !timeout && correct,
      timeout,
      correctColor: currentTrial.color.name,
      selectedColor: selectedColor?.name || 'None',
      reactionTime: Math.round(reactionTime)
    });
    
    // Record response
    const response = {
      trialId: currentTrial.id,
      type: currentTrial.type,
      word: currentTrial.word,
      color: currentTrial.color.name,
      selected: selectedColor?.name || 'None',
      correct: !timeout && correct,
      timeout,
      reactionTime: Math.round(reactionTime),
    };
    
    setResponses(prev => [...prev, response]);
    
    if (!timeout && correct) {
      setScore(prev => prev + 1);
    }
    
    // Move to next trial after delay
    setTimeout(() => {
      setFeedback(null);
      
      if (currentTrialIndex + 1 >= TOTAL_TRIALS) {
        finishGame();
      } else {
        setCurrentTrialIndex(prev => prev + 1);
        startTrialTimer();
      }
    }, 800);
  };

  // Finish game
  const finishGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGamePhase('results');
    setHasPlayed(true);
    
    const allResponses = [...responses];
    
    // Calculate stats
    const correctResponses = allResponses.filter(r => r.correct);
    const congruentResponses = allResponses.filter(r => r.type === 'congruent' && r.correct);
    const incongruentResponses = allResponses.filter(r => r.type === 'incongruent' && r.correct);
    
    const avgRT = correctResponses.length > 0
      ? Math.round(correctResponses.reduce((sum, r) => sum + r.reactionTime, 0) / correctResponses.length)
      : 0;
    
    const congAvg = congruentResponses.length > 0
      ? Math.round(congruentResponses.reduce((sum, r) => sum + r.reactionTime, 0) / congruentResponses.length)
      : 0;
    
    const incongAvg = incongruentResponses.length > 0
      ? Math.round(incongruentResponses.reduce((sum, r) => sum + r.reactionTime, 0) / incongruentResponses.length)
      : 0;
    
    setAverageReactionTime(avgRT);
    setCongruentAvg(congAvg);
    setIncongruentAvg(incongAvg);
    setStroopEffect(incongAvg - congAvg);
    
    if (score > bestScore) setBestScore(score);
  };

  // Generate share stats
  const generateShareStats = () => {
    const accuracy = Math.round((score / TOTAL_TRIALS) * 100);
    
    let category;
    if (accuracy >= 95) category = 'Exceptional Control';
    else if (accuracy >= 85) category = 'Strong Focus';
    else if (accuracy >= 70) category = 'Good Concentration';
    else category = 'Keep Practicing';
    
    setShareStats({
      score,
      totalTrials: TOTAL_TRIALS,
      accuracy,
      category,
      averageReactionTime,
      stroopEffect,
      congruentAvg,
      incongruentAvg
    });
    
    setGamePhase('shared');
  };

  // Share functions
  const shareToTwitter = () => {
    const text = `🧠 Stroop Test: ${score}/${TOTAL_TRIALS} correct (${Math.round((score/TOTAL_TRIALS)*100)}%)\n⚡ Avg reaction: ${averageReactionTime}ms\n🔄 Stroop Effect: ${stroopEffect}ms\n\nTest your cognitive control:`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const copyStats = () => {
    const text = `Stroop Effect Test Results:\n• Score: ${score}/${TOTAL_TRIALS}\n• Reaction Time: ${averageReactionTime}ms\n• Stroop Effect: ${stroopEffect}ms\n• Congruent: ${congruentAvg}ms\n• Incongruent: ${incongruentAvg}ms`;
    navigator.clipboard.writeText(text);
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Stroop Effect Test',
        text: `🧠 I scored ${score}/${TOTAL_TRIALS} with ${averageReactionTime}ms reaction time! Test yourself:`,
        url: window.location.href
      }).catch(() => {});
    } else {
      copyStats();
    }
  };

  // Reset
  const resetGame = () => {
    setGamePhase('intro');
    setTrials([]);
    setCurrentTrialIndex(0);
    setScore(0);
    setResponses([]);
    setFeedback(null);
    setLastReactionTime(null);
    setTimeLeft(0);
    setAverageReactionTime(0);
    setCongruentAvg(0);
    setIncongruentAvg(0);
    setStroopEffect(0);
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

  // Keyboard shortcuts
  useEffect(() => {
    if (gamePhase !== 'playing' || feedback) return;

    const handleKeyPress = (e) => {
      const keyMap = {
        '1': COLORS[0],
        '2': COLORS[1],
        '3': COLORS[2],
        '4': COLORS[3],
        '5': COLORS[4],
        '6': COLORS[5],
      };
      
      const color = keyMap[e.key];
      if (color) handleColorClickRef.current?.(color);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gamePhase, feedback]);

  return (
    <div className="min-h-screen bg-(--background) p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="w-12 h-12 text-(--primary)" />
            <h1 className="heading text-center">Stroop Effect Test</h1>
          </div>
          <p className="description">Name the COLOR, not the word — Test your cognitive control</p>
        </div>

        {/* Main Card */}
        <div className="bg-(--card) border border-(--border) rounded-3xl shadow-xl overflow-hidden">
          
          {/* Intro Phase */}
          {gamePhase === 'intro' && (
            <div className="p-8 md:p-12">
              <div className="text-center max-w-2xl mx-auto">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-(--primary) rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-(--foreground) mb-4">
                    Can Your Brain Handle the Conflict?
                  </h2>
                  <p className="text-lg text-(--muted-foreground) mb-6">
                    The Stroop Effect reveals how your brain processes conflicting information. 
                    When the word says &quot;RED&quot; but is colored <span className="text-blue-500 font-bold">BLUE</span>,
                    your brain slows down — this is <strong className="text-(--primary)">cognitive interference</strong>.
                  </p>
                  
                  {/* Demo */}
                  <div className="bg-(--muted) border border-(--border) rounded-xl p-6 mb-6">
                    <p className="text-sm text-(--muted-foreground) mb-3">Try it now — Say the COLOR, not the word:</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                      <span className="text-3xl font-black text-red-500">BLUE</span>
                      <span className="text-3xl font-black text-green-500">RED</span>
                      <span className="text-3xl font-black text-blue-500">GREEN</span>
                    </div>
                    <p className="text-xs text-(--muted-foreground) mt-3">Harder than it looks, right?</p>
                  </div>
                  
                  <button
                    onClick={() => setGamePhase('instructions')}
                    className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3 shadow-lg"
                  >
                    <Play className="w-6 h-6" />
                    Start the Experiment
                  </button>

                  {hasPlayed && (
                    <button onClick={startCountdown} className="mt-4 btn-secondary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3 sm:ml-4">
                      <RotateCcw className="w-6 h-6" /> Play Again
                    </button>
                  )}
                </div>

                {/* Global Stats */}
                <div className="tool-card-grid bg-(--muted) rounded-xl p-4">
                  {[
                    { label: 'Tested', value: globalStats.total.toLocaleString() },
                    { label: 'Avg Reaction', value: `${globalStats.avgReaction}ms` },
                    { label: 'Stroop Effect', value: `${globalStats.avgStroopEffect}ms` },
                    { label: 'Accuracy', value: `${globalStats.accuracyRate}%` }
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <div className="text-lg font-bold text-(--primary)">{stat.value}</div>
                      <div className="text-xs text-(--muted-foreground)">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {gamePhase === 'instructions' && (
            <div className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-(--foreground) mb-8 text-center">Instructions</h2>
                
                <div className="space-y-6 mb-8">
                  {[
                    { step: 1, title: 'Name the COLOR', desc: 'You\'ll see color words. Click the button matching the INK COLOR, not the word itself.', icon: '🎨' },
                    { step: 2, title: 'Ignore the Word', desc: 'The word "RED" might be colored blue. Click BLUE — ignore what the word says!', icon: '🚫' },
                    { step: 3, title: 'Be Fast & Accurate', desc: `${TOTAL_TRIALS} trials. You have 5 seconds each. Wrong answers and timeouts count against you.`, icon: '⚡' }
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

                {/* Keyboard hint */}
                <div className="bg-(--muted) border border-(--border) rounded-xl p-4 mb-8">
                  <p className="text-sm text-(--muted-foreground) text-center">
                    💡 <strong>Pro Tip:</strong> Use keyboard keys <strong>1-6</strong> for faster responses!
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
                <div className="text-8xl font-black text-(--primary) animate-bounce mb-8">
                  {countdownValue}
                </div>
                <p className="text-2xl text-(--muted-foreground)">Name the COLOR, not the word...</p>
              </div>
            </div>
          )}

          {/* Playing */}
          {gamePhase === 'playing' && trials.length > 0 && currentTrialIndex < trials.length && (
            <div className="p-6 md:p-10">
              {/* HUD */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="bg-(--primary) text-white px-4 py-2 rounded-lg font-semibold text-sm">
                    {currentTrialIndex + 1} / {TOTAL_TRIALS}
                  </div>
                  <div className="text-(--muted-foreground) text-sm">
                    Score: <strong className="text-(--foreground)">{score}</strong>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-lg font-mono text-lg font-bold ${
                  timeLeft <= 1 ? 'bg-red-500 text-white animate-pulse' : 
                  timeLeft <= 2 ? 'bg-yellow-500 text-black' : 
                  'bg-(--primary) text-white'
                }`}>
                  {timeLeft.toFixed(1)}s
                </div>
              </div>

              {/* Current Word Display */}
              <div className="text-center mb-10 py-12">
                <div 
                  className="text-7xl md:text-9xl font-black tracking-wider select-none transition-all duration-200"
                  style={{ color: trials[currentTrialIndex].color.hex }}
                >
                  {trials[currentTrialIndex].word}
                </div>
                <p className="text-(--muted-foreground) text-sm mt-4">
                  Click the INK COLOR button below
                </p>
              </div>

              {/* Color Buttons */}
              <div className="tool-compact-grid" ref={colorButtonsRef}>
                {COLORS.map((color, index) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorClick(color)}
                    className="py-4 md:py-5 px-3 rounded-xl font-bold text-sm md:text-base transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2 border-white/20"
                    style={{ backgroundColor: color.hex, color: '#fff' }}
                  >
                    <span className="hidden md:inline">{index + 1}. </span>
                    {color.name}
                  </button>
                ))}
              </div>

              {/* Feedback overlay */}
              {feedback && (
                <div className={`mt-6 p-4 rounded-xl text-center animate-fade-in ${
                  feedback.correct ? 'bg-green-50 border-2 border-green-400' : 
                  feedback.timeout ? 'bg-yellow-50 border-2 border-yellow-400' : 
                  'bg-red-50 border-2 border-red-400'
                }`}>
                  {feedback.correct ? (
                    <div className="flex items-center justify-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Correct! {feedback.reactionTime}ms</span>
                    </div>
                  ) : feedback.timeout ? (
                    <div className="flex items-center justify-center gap-2 text-yellow-800">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-semibold">Time&apos;s up! Correct was: {feedback.correctColor}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-red-800">
                      <X className="w-5 h-5" />
                      <span className="font-semibold">
                        Wrong! You chose {feedback.selectedColor}, correct was {feedback.correctColor}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Progress bar */}
              <div className="mt-8 bg-(--muted) rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-(--primary) rounded-full transition-all duration-300"
                  style={{ width: `${((currentTrialIndex + 1) / TOTAL_TRIALS) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Results */}
          {gamePhase === 'results' && (
            <div className="p-8 md:p-12">
              <div className="max-w-2xl mx-auto text-center">
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-(--foreground) mb-2">Test Complete!</h2>
                <p className="text-(--muted-foreground) mb-8">Here&apos;s your cognitive performance</p>
                
                {/* Score Circle */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-40 h-40">
                    <svg className="transform -rotate-90" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="72" fill="none" stroke="currentColor" strokeWidth="8" className="text-(--muted)" />
                      <circle 
                        cx="80" cy="80" r="72" fill="none" 
                        stroke="currentColor" strokeWidth="8" 
                        className="text-(--primary)"
                        strokeDasharray={`${(score / TOTAL_TRIALS) * 452} 452`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-black text-(--foreground)">{score}</div>
                        <div className="text-sm text-(--muted-foreground)">/ {TOTAL_TRIALS}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="tool-card-grid mb-8">
                  {[
                    { label: 'Accuracy', value: `${Math.round((score/TOTAL_TRIALS)*100)}%`, icon: '🎯' },
                    { label: 'Avg Reaction', value: `${averageReactionTime}ms`, icon: '⚡' },
                    { label: 'Congruent RT', value: `${congruentAvg}ms`, icon: '🟢' },
                    { label: 'Incongruent RT', value: `${incongruentAvg}ms`, icon: '🔴' },
                    { label: 'Stroop Effect', value: `${stroopEffect}ms`, icon: '🔄' },
                    { label: 'Best Score', value: bestScore, icon: '🏆' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-(--muted) rounded-xl p-4 text-center">
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className="text-xs text-(--muted-foreground)">{stat.label}</div>
                      <div className="text-xl font-bold text-(--foreground)">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Stroop Effect Explanation */}
                <div className="bg-(--muted) border border-(--border) rounded-xl p-6 mb-8 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-(--foreground)">What This Means</h3>
                  </div>
                  <div className="space-y-2 text-sm text-(--muted-foreground)">
                    <p>• <strong>Congruent ({congruentAvg}ms):</strong> Word and color match — easier to process</p>
                    <p>• <strong>Incongruent ({incongruentAvg}ms):</strong> Word and color conflict — brain slows down</p>
                    <p>• <strong>Stroop Effect ({stroopEffect}ms):</strong> The delay caused by conflicting information</p>
                    <p className="text-xs mt-2">A larger Stroop Effect indicates stronger automatic word reading interfering with color naming.</p>
                  </div>
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
                <h2 className="text-3xl font-bold text-(--foreground) mb-2">Your Stroop Test Results</h2>
                <p className="text-(--muted-foreground) mb-8">{shareStats.category}</p>
                
                <div className="bg-gradient-to-br from-(--card) to-(--muted) border border-(--border) rounded-2xl p-8 mb-8">
                  <div className="text-5xl font-black text-(--primary) mb-2">{shareStats.accuracy}%</div>
                  <p className="text-(--muted-foreground)">Accuracy</p>
                  <div className="tool-compact-grid mt-6">
                    <div className="bg-(--card) rounded-lg p-3">
                      <div className="text-lg font-bold text-(--foreground)">{shareStats.averageReactionTime}ms</div>
                      <div className="text-xs text-(--muted-foreground)">Avg RT</div>
                    </div>
                    <div className="bg-(--card) rounded-lg p-3">
                      <div className="text-lg font-bold text-(--foreground)">{shareStats.congruentAvg}ms</div>
                      <div className="text-xs text-(--muted-foreground)">Congruent</div>
                    </div>
                    <div className="bg-(--card) rounded-lg p-3">
                      <div className="text-lg font-bold text-(--foreground)">{shareStats.stroopEffect}ms</div>
                      <div className="text-xs text-(--muted-foreground)">Stroop Effect</div>
                    </div>
                  </div>
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
                  <button onClick={copyStats} className="btn-secondary w-full px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3">
                    <Copy className="w-5 h-5" /> Copy Results
                  </button>
                  <button onClick={resetGame} className="btn-secondary w-full px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 mt-4">
                    <RotateCcw className="w-5 h-5" /> Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-(--muted-foreground)">
          Based on the Stroop Effect (1935) by John Ridley Stroop — Classic Cognitive Psychology
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
