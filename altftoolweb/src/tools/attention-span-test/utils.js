// src/tools/attention-span-test/utils.js

export const TARGET_MODES = {
  LETTERS: {
    id: "letters",
    label: "Letters",
    desc: "Press SPACE for all letters EXCEPT 'X'",
    targetCondition: (stimulus) => stimulus !== "X",
    generatePool: () => "ABCDEFGHIJKLMNOPQRSTUVWYZ".split(""),
    targetStimulus: "X",
  },
  NUMBERS: {
    id: "numbers",
    label: "Numbers",
    desc: "Press SPACE only for ODD numbers (1, 3, 5, 7, 9)",
    targetCondition: (stimulus) => parseInt(stimulus, 10) % 2 !== 0,
    generatePool: () => ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    targetStimulus: "Odd Numbers",
  },
  SYMBOLS: {
    id: "symbols",
    label: "Symbols",
    desc: "Press SPACE only when '★' (Star) appears",
    targetCondition: (stimulus) => stimulus === "★",
    generatePool: () => ["◆", "▲", "●", "■", "★", "✚", "✦", "⬟"],
    targetStimulus: "★ Star",
  },
  MIXED: {
    id: "mixed",
    label: "Mixed",
    desc: "Press SPACE for VOWELS (A, E, I, O, U)",
    targetCondition: (stimulus) => ["A", "E", "I", "O", "U"].includes(stimulus),
    generatePool: () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    targetStimulus: "Vowels",
  },
};

export const DIFFICULTY_PRESETS = {
  easy: { label: "Easy", displayTime: 400, intervalMs: 1400 },
  medium: { label: "Medium", displayTime: 300, intervalMs: 1100 },
  hard: { label: "Hard", displayTime: 220, intervalMs: 850 },
  expert: { label: "Expert", displayTime: 160, intervalMs: 650 },
};

/**
 * Generate CPT Trials Array
 */
export function generateCPTTrials({ durationSec, difficultyKey, targetModeKey }) {
  const diff = DIFFICULTY_PRESETS[difficultyKey] || DIFFICULTY_PRESETS.medium;
  const mode = TARGET_MODES[targetModeKey.toUpperCase()] || TARGET_MODES.LETTERS;
  const numTrials = Math.floor((durationSec * 1000) / diff.intervalMs);

  const pool = mode.generatePool();
  const trials = [];

  for (let i = 0; i < numTrials; i++) {
    // 25% target probability
    const isTarget = Math.random() < 0.25;
    let stimulus;

    if (targetModeKey === "letters") {
      stimulus = isTarget ? "X" : pool[Math.floor(Math.random() * pool.length)];
    } else if (targetModeKey === "numbers") {
      const odd = ["1", "3", "5", "7", "9"];
      const even = ["2", "4", "6", "8", "0"];
      stimulus = isTarget
        ? odd[Math.floor(Math.random() * odd.length)]
        : even[Math.floor(Math.random() * even.length)];
    } else if (targetModeKey === "symbols") {
      stimulus = isTarget ? "★" : pool.filter((s) => s !== "★")[Math.floor(Math.random() * (pool.length - 1))];
    } else {
      const vowels = ["A", "E", "I", "O", "U"];
      const consonants = pool.filter((c) => !vowels.includes(c));
      stimulus = isTarget
        ? vowels[Math.floor(Math.random() * vowels.length)]
        : consonants[Math.floor(Math.random() * consonants.length)];
    }

    trials.push({
      id: i,
      stimulus,
      isTarget,
      displayTime: diff.displayTime,
      intervalMs: diff.intervalMs,
    });
  }

  return trials;
}

/**
 * Calculate CPT Results & AI Cognitive Insights
 */
export function calculateCPTResults({ trials, responses, totalTimeSec }) {
  let hits = 0; // Correctly identified targets
  let correctRejections = 0; // Correctly ignored non-targets
  let falseAlarms = 0; // Commission error (pressed when shouldn't)
  let misses = 0; // Omission error (missed target)
  const reactionTimes = [];

  const timelineData = [];
  const heatmapData = [];

  trials.forEach((trial, idx) => {
    const resp = responses[idx];
    const userPressed = resp && resp.pressed;
    const rt = resp ? resp.rt : null;

    let status = "correct"; // 'correct', 'slow', 'missed', 'false_alarm'

    if (trial.isTarget) {
      if (userPressed) {
        hits++;
        if (rt) reactionTimes.push(rt);
        status = rt > 550 ? "slow" : "correct";
      } else {
        misses++;
        status = "missed";
      }
    } else {
      if (userPressed) {
        falseAlarms++;
        if (rt) reactionTimes.push(rt);
        status = "false_alarm";
      } else {
        correctRejections++;
        status = "correct";
      }
    }

    timelineData.push({
      trial: idx + 1,
      rt: rt || 0,
      status,
      stimulus: trial.stimulus,
      isTarget: trial.isTarget,
    });

    heatmapData.push({
      id: idx,
      status,
      rt,
    });
  });

  const totalTrials = trials.length;
  const avgRt = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  const totalTargetTrials = trials.filter((t) => t.isTarget).length;
  const accuracyPct = totalTargetTrials > 0
    ? Math.min(100, Math.round(((hits + correctRejections) / totalTrials) * 100))
    : 100;

  // Impulsivity Index (0-100 scale based on commission false alarms)
  const nonTargetTrials = totalTrials - totalTargetTrials;
  const impulsivityScore = nonTargetTrials > 0
    ? Math.min(100, Math.round((falseAlarms / nonTargetTrials) * 100))
    : 0;

  // Overall Focus Score (0-100 algorithm)
  const rtPenalty = avgRt > 400 ? Math.min(30, (avgRt - 400) / 10) : 0;
  const focusScore = Math.max(
    10,
    Math.min(100, Math.round(accuracyPct * 0.6 + (100 - impulsivityScore) * 0.3 - rtPenalty * 0.1))
  );

  // Generate AI Insight Text based on fatigue trends
  let aiInsightText = "";
  if (timelineData.length > 10) {
    const half = Math.floor(timelineData.length / 2);
    const firstHalfRt = timelineData.slice(0, half).filter((d) => d.rt > 0);
    const secondHalfRt = timelineData.slice(half).filter((d) => d.rt > 0);

    const avgFirst = firstHalfRt.length > 0 ? firstHalfRt.reduce((a, b) => a + b.rt, 0) / firstHalfRt.length : 0;
    const avgSecond = secondHalfRt.length > 0 ? secondHalfRt.reduce((a, b) => a + b.rt, 0) / secondHalfRt.length : 0;

    if (avgSecond - avgFirst > 40) {
      aiInsightText = `Your attention remained exceptionally stable during the first half of the assessment. Reaction time gradually increased by ${Math.round(avgSecond - avgFirst)}ms in the second half, suggesting mild cognitive fatigue as duration extended.`;
    } else if (accuracyPct > 90 && impulsivityScore < 10) {
      aiInsightText = `Outstanding sustained attention! You maintained consistent neural response speed and high inhibitory control across all ${totalTrials} trials with zero significant fatigue lapses.`;
    } else if (impulsivityScore > 25) {
      aiInsightText = `Strong reaction speeds observed, but elevated commission errors indicate a pattern of impulsive responding. Practicing brief pauses before spacebar actuation will optimize your cognitive score.`;
    } else {
      aiInsightText = `Balanced attention profile. Response speed averaged ${avgRt}ms with consistent vigilance throughout the session.`;
    }
  } else {
    aiInsightText = `Session completed with an overall Focus Score of ${focusScore}/100. Retake longer durations for deeper neural fatigue tracking.`;
  }

  return {
    focusScore,
    avgRt,
    accuracyPct,
    impulsivityScore,
    hits,
    misses,
    falseAlarms,
    correctRejections,
    totalTrials,
    totalTargetTrials,
    timelineData,
    heatmapData,
    aiInsightText,
  };
}
