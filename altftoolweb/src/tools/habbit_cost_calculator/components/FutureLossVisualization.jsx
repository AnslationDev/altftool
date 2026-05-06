import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import puter from '@heyputer/puter.js';
import { useHabits } from '../context/HabitContext';
import { calculateMonthlyCost } from '../context/HabitContext';
import Card from './ui/Card';

const CountUpValue = ({ value, duration = 2 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  React.useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration * 60);
    let current = start;

    const interval = setInterval(() => {
      current += increment;
      if (current >= end) {
        setDisplayValue(Math.round(end));
        clearInterval(interval);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [value, duration]);

  return displayValue.toLocaleString('en-IN');
};

const formatIndianCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const FutureLossVisualization = ({ habits }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('1year');
  const [interestRate, setInterestRate] = useState(12);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const periods = {
    '1year': { years: 1, label: '1 Year', icon: '📅' },
    '5years': { years: 5, label: '5 Years', icon: '📊' },
    '10years': { years: 10, label: '10 Years', icon: '📈' },
    lifetime: { years: 50, label: 'Lifetime', icon: '⏳' },
  };

  const calculateProjection = (years) => {
    const totalMonthly = habits.reduce((sum, habit) => {
      return sum + calculateMonthlyCost(habit.cost, habit.frequency);
    }, 0);

    const totalWasted = totalMonthly * 12 * years;
    const investmentRate = interestRate / 100; // Use dynamic interest rate

    let futureValue = 0;
    for (let i = 0; i < years; i++) {
      futureValue = (futureValue + totalMonthly * 12) * (1 + investmentRate);
    }

    const totalHours = habits.reduce((sum, habit) => {
      const dailyHours = habit.timeSpentPerDay || 0;
      return sum + dailyHours * 365 * years;
    }, 0);

    return {
      wasted: Math.round(totalWasted),
      invested: Math.round(futureValue),
      hours: Math.round(totalHours),
      days: Math.round(totalHours / 24),
      months: Math.round(totalHours / (24 * 30)),
    };
  };

  const period = periods[selectedPeriod];
  const projection = calculateProjection(period.years);
  const investedAmount = projection.invested;

  useEffect(() => {
    if (investedAmount === 0) return;

    // Debounce to prevent multiple API calls while sliding
    const timerId = setTimeout(async () => {
      setIsGenerating(true);
      try {
        const prompt = `What is one highly specific, realistic thing I could buy or achieve in India with exactly ₹${investedAmount.toLocaleString('en-IN')} saved over ${period.label}? Return ONLY a valid JSON object with keys: 'title' (short name max 5 words), 'description' (short context max 10 words), and 'icon' (1 emoji). No markdown code blocks.`;

        const response = await puter.ai.chat(prompt);

        const text = typeof response === 'object' ? (response.text || response.message?.content) : response;
        const textStr = String(text);
        const match = textStr.match(/\{[\s\S]*\}/);
        const parsed = match ? JSON.parse(match[0]) : JSON.parse(textStr);

        if (parsed && parsed.title) {
          setAiSuggestion(parsed);
        }
      } catch (err) {
        console.error("Failed to fetch suggestion via puter.js", err);
      } finally {
        setIsGenerating(false);
      }
    }, 1500); // 1.5 second debounce

    return () => clearTimeout(timerId);
  }, [investedAmount, period.label]);

  if (habits.length === 0) {
    return null;
  }

  return (
    <Card variant="glass" className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-linear-to-br from-(--primary) to-(--primary-dark) border border-(--primary)/20">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h1a1 1 0 001-1v-6a1 1 0 00-1-1h-1z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-(--foreground)">Future Loss Visualization</h3>
            <p className="text-sm text-(--muted-foreground)">See what your habits cost in the long term</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {Object.entries(periods).map(([key, data]) => (
            <motion.button
              key={key}
              onClick={() => setSelectedPeriod(key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${selectedPeriod === key
                ? 'bg-blue-600 text-white'
                : 'bg-(--muted) text-(--muted-foreground) hover:bg-(--muted)/80 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
            >
              {data.icon} {data.label}
            </motion.button>
          ))}
        </div>

        {/* Comparison Cards */}
        <motion.div
          key={selectedPeriod}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          {/* Wasted Card */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">💸 Wasted</span>
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-blue-600 dark:text-blue-400"
              >
                ₹<CountUpValue value={projection.wasted} />
              </motion.div>
              <p className="text-xs text-gray-500 mt-2">Money wasted in {period.label.toLowerCase()}</p>
            </div>
          </div>

          {/* Invested Card */}
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">📈 Invested Value</span>
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-blue-600 dark:text-blue-400"
              >
                ₹<CountUpValue value={projection.invested} />
              </motion.div>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-500/20">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 font-medium">Interest Rate</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{interestRate}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={interestRate}
                onChange={(e) => setInterestRate(parseInt(e.target.value))}
                className="w-full h-1.5 bg-blue-500 rounded-lg cursor-pointer accent-blue-600 dark:accent-blue-400"
              />
            </div>
          </div>
        </motion.div>

        {/* Time Lost Stats */}
        {projection.hours > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/30"
          >
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3">⏱️ Time Lost</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  <CountUpValue value={projection.hours} />
                </div>
                <p className="text-xs text-gray-500">Hours</p>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  <CountUpValue value={projection.days} />
                </div>
                <p className="text-xs text-gray-500">Days</p>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  <CountUpValue value={projection.months} />
                </div>
                <p className="text-xs text-gray-500">Months</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Difference Highlight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 rounded-xl bg-linear-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20"
        >
          <p className="text-sm text-gray-600 dark:text-gray-300">
            <span className="font-semibold text-gray-800">Difference:</span> {formatIndianCurrency(projection.invested - projection.wasted)} gap between what you&apos;d waste vs. what you could have
          </p>
        </motion.div>

        {/* AI Suggestion */}
        <div className="relative mt-6 min-h-[100px]">
          <AnimatePresence mode="wait">
            {isGenerating && (
              <motion.div
                key="loading-suggestion"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-(--card)/50 backdrop-blur-xs z-10 rounded-xl"
              >
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                  <div className="w-5 h-5 border-2 border-blue-600/30 dark:border-blue-400/30 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                  <p className="text-sm font-medium animate-pulse">Calculating possibilities...</p>
                </div>
              </motion.div>
            )}

            {aiSuggestion && !isGenerating && (
              <motion.div
                key="suggestion"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-5 rounded-xl bg-linear-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
              >
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  ✨ What could this buy you?
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{aiSuggestion.icon}</span>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">{aiSuggestion.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{aiSuggestion.description}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Card>
  );
};

export default FutureLossVisualization;
