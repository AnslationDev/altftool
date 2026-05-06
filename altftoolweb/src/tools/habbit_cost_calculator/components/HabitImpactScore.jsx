import React from 'react';
import { motion } from 'framer-motion';
import { useHabits } from '../context/HabitContext';
import Card from './ui/Card';

const ImpactCircle = ({ score, size = 200 }) => {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    return 'var(--primary)';
  };

  const getLabel = () => {
    if (score === 0) return 'Not Rated';
    if (score <= 25) return 'Low Impact';
    if (score <= 50) return 'Moderate Impact';
    if (score <= 75) return 'Serious Impact';
    return 'Life Draining';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgb(209 213 219)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>

        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            <div className="text-5xl font-bold text-(--primary)">
              {score}
            </div>
            <div className="text-xs text-(--primary) font-medium">/ 100</div>
          </motion.div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold text-(--primary)">
          {getLabel()}
        </p>
        <p className="text-xs text-(--primary) mt-2">
          This score reflects money + time + lifestyle damage.
        </p>
      </div>
    </div>
  );
};

export const HabitImpactScore = ({ habit }) => {
  const { calculateImpactScore } = useHabits();
  const score = calculateImpactScore(habit);

  if (score === 0) {
    return (
      <Card variant="glass" className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500">
            Add impact assessment details to see your Habit Impact Score
          </p>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 border border-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-(--foreground)">Habit Impact Score</h3>
            <p className="text-sm text-(--muted-foreground)">Comprehensive lifestyle impact</p>
          </div>
        </div>

        <div className="flex justify-center py-6">
          <ImpactCircle score={score} size={220} />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-gray-500 font-medium">0–25</p>
            <p className="text-sm font-semibold text-(--primary)">Low Impact</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-gray-500 font-medium">26–50</p>
            <p className="text-sm font-semibold text-(--primary)">Moderate</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-gray-500 font-medium">51–75</p>
            <p className="text-sm font-semibold text-(--primary)">Serious</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <p className="text-xs text-gray-500 font-medium">76–100</p>
            <p className="text-sm font-semibold text-(--primary)">Life Draining</p>
          </div>
        </div>
      </motion.div>
    </Card>
  );
};

export default HabitImpactScore;
