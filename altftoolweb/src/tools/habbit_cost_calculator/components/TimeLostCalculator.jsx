import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import puter from '@heyputer/puter.js';
import { useHabits } from '../context/HabitContext';
import { calculateMonthlyCost } from '../context/HabitContext';
import Card from './ui/Card';

const StatCard = ({ label, value, unit, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ translateY: -4 }}
    className={`p-4 rounded-xl border transition-all ${color}`}
  >
    <div className="flex items-center gap-3 mb-2">
      <span className="text-2xl">{icon}</span>
      <p className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">{label}</p>
    </div>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay + 0.3 }}
      className="flex items-baseline gap-2"
    >
      <div className="text-3xl font-black text-gray-950 dark:text-white">{value}</div>
      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{unit}</span>
    </motion.div>
  </motion.div>
);

const CountUpValue = ({ end, duration = 1.5 }) => {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    let current = start;

    const interval = setInterval(() => {
      current += increment;
      if (current >= end) {
        setValue(end);
        clearInterval(interval);
      } else {
        setValue(Math.round(current));
      }
    }, 16);

    return () => clearInterval(interval);
  }, [end, duration]);

  return value.toLocaleString('en-IN');
};

export const TimeLostCalculator = ({ habits }) => {
  const [dynamicAchievements, setDynamicAchievements] = useState(null);
  const [dynamicAlternatives, setDynamicAlternatives] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const calculations = useMemo(() => {
    if (habits.length === 0) {
      return null;
    }

    let totalDailyHours = 0;
    let habitCount = 0;

    habits.forEach((habit) => {
      const dailyHours = habit.timeSpentPerDay || 0;
      if (dailyHours > 0) {
        totalDailyHours += dailyHours;
        habitCount += 1;
      }
    });

    if (totalDailyHours === 0) {
      return null;
    }

    // Calculations
    const hoursPerMonth = totalDailyHours * 30;
    const hoursPerYear = totalDailyHours * 365;
    const daysPerYear = hoursPerYear / 24;
    const monthsPerYear = hoursPerYear / (24 * 30);
    const monthsPer10Years = (hoursPerYear * 10) / (24 * 30);

    // Waking hours per day = 16 hours
    const wakingHoursPerDay = 16;
    const percentagePerDay = ((totalDailyHours / wakingHoursPerDay) * 100).toFixed(1);
    const percentagePerYear = ((hoursPerYear / (wakingHoursPerDay * 365)) * 100).toFixed(1);
    const percentagePer10Years = ((hoursPerYear * 10) / (wakingHoursPerDay * 365 * 10) * 100).toFixed(1);

    // What could be achieved - learning & skill targets
    const achievements = dynamicAchievements || [
      { skill: 'Learn Python Programming', hoursRequired: 100, icon: '🐍' },
      { skill: 'Master a Language Fluently', hoursRequired: 1000, icon: '🌍' },
      { skill: 'Complete a University Degree', hoursRequired: 2000, icon: '🎓' },
      { skill: 'Become Expert in Skill', hoursRequired: 10000, icon: '⭐' },
      { skill: 'Build 10 Side Projects', hoursRequired: 500, icon: '🚀' },
      { skill: 'Read 50 Books', hoursRequired: 250, icon: '📚' },
      { skill: 'Learn UI/UX Design', hoursRequired: 300, icon: '🎨' },
      { skill: 'Complete Fitness Goals', hoursRequired: 400, icon: '💪' },
    ];

    const achievableSkills = achievements
      .map((item) => ({
        ...item,
        yearsToComplete: (item.hoursRequired / hoursPerYear).toFixed(1),
        timesCompleted: Math.floor(hoursPerYear / item.hoursRequired),
      }))
      .filter((item) => item.yearsToComplete < 10);

    return {
      totalDailyHours,
      hoursPerMonth: Math.round(hoursPerMonth),
      hoursPerYear: Math.round(hoursPerYear),
      daysPerYear: Math.round(daysPerYear),
      monthsPerYear: monthsPerYear.toFixed(1),
      monthsPer10Years: monthsPer10Years.toFixed(1),
      percentagePerDay,
      percentagePerYear,
      percentagePer10Years,
      habitCount,
      achievableSkills,
    };
  }, [habits, dynamicAchievements]);

  const hoursPerYear = calculations ? calculations.hoursPerYear : 0;

  useEffect(() => {
    if (hoursPerYear === 0) return;
    
    let isMounted = true;
    
    const fetchDynamicData = async () => {
      setIsGenerating(true);
      try {
        const habitNames = habits.map(h => h.name).join(', ') || 'bad habits';
        const prompt1 = `Generate exactly 6 realistic and exciting skills someone could learn with ${hoursPerYear} hours per year. Make them productive alternatives to: "${habitNames}". Return ONLY a valid JSON array of objects with keys: 'skill' (short title), 'hoursRequired' (realistic number between 50 and ${Math.max(500, hoursPerYear)}), 'icon' (1 emoji). No markdown code blocks.`;
        
        const prompt2 = `Generate exactly 5 specific, productive alternative uses of time to replace these habits: "${habitNames}". Return ONLY a valid JSON array of objects with keys: 'title' (short name), 'description' (short impactful description max 10 words), 'icon' (1 emoji). No markdown code blocks.`;
        
        const res1 = await puter.ai.chat(prompt1);
        const res2 = await puter.ai.chat(prompt2);
        
        const parsePuterResponse = (res) => {
           const text = typeof res === 'object' ? (res.text || res.message?.content) : res;
           const textStr = String(text);
           const match = textStr.match(/\[[\s\S]*\]/);
           return match ? JSON.parse(match[0]) : JSON.parse(textStr);
        };
        
        const parsedAchievements = parsePuterResponse(res1);
        const parsedAlternatives = parsePuterResponse(res2);
        
        if (isMounted) {
          if (Array.isArray(parsedAchievements) && parsedAchievements.length > 0) {
             setDynamicAchievements(parsedAchievements.slice(0, 6));
          }
          if (Array.isArray(parsedAlternatives) && parsedAlternatives.length > 0) {
             setDynamicAlternatives(parsedAlternatives.slice(0, 5));
          }
        }
      } catch (err) {
        console.error("Failed to generate dynamic time uses via puter.js", err);
      } finally {
        if (isMounted) setIsGenerating(false);
      }
    };
    
    fetchDynamicData();
    
    return () => { isMounted = false; };
  }, [hoursPerYear, habits]);

  if (!calculations) {
    return (
      <Card variant="glass" className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500">
            Add time spent per day to your habits to see the Time Lost Calculator
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 border border-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00-.293.707l-2.414 2.414a1 1 0 101.414 1.414L9 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-950 dark:text-white">Time Lost Calculator</h3>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
              {calculations.habitCount} habit{calculations.habitCount !== 1 ? 's' : ''} tracked
            </p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <StatCard
            label="Hours per Month"
            value={<CountUpValue end={calculations.hoursPerMonth} />}
            unit="hrs"
            icon="📅"
            color="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30"
            delay={0.1}
          />
          <StatCard
            label="Hours per Year"
            value={<CountUpValue end={calculations.hoursPerYear} />}
            unit="hrs"
            icon="📊"
            color="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30"
            delay={0.15}
          />
          <StatCard
            label="Days Lost per Year"
            value={<CountUpValue end={calculations.daysPerYear} />}
            unit="days"
            icon="📈"
            color="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30"
            delay={0.2}
          />
          <StatCard
            label="Months in 10 Years"
            value={<CountUpValue end={parseInt(calculations.monthsPer10Years)} />}
            unit="months"
            icon="⏳"
            color="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30"
            delay={0.25}
          />
        </div>

        {/* Percentage Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30"
        >
          <p className="text-xs font-black text-blue-800 dark:text-blue-200 uppercase tracking-wide mb-3">
            📊 Percentage of Waking Life
          </p>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Per Day</span>
                <span className="text-sm font-black text-blue-700 dark:text-blue-300">{calculations.percentagePerDay}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculations.percentagePerDay}%` }}
                  transition={{ delay: 0.4, duration: 1 }}
                  className="h-full bg-linear-to-r from-blue-400 to-blue-600 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Per Year</span>
                <span className="text-sm font-black text-blue-700 dark:text-blue-300">{calculations.percentagePerYear}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculations.percentagePerYear}%` }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="h-full bg-linear-to-r from-blue-400 to-blue-600 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100">Per 10 Years</span>
                <span className="text-sm font-black text-blue-700 dark:text-blue-300">{calculations.percentagePer10Years}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculations.percentagePer10Years}%` }}
                  transition={{ delay: 0.6, duration: 1 }}
                  className="h-full bg-linear-to-r from-blue-400 to-blue-600 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500"
        >
          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
            <span className="font-bold text-blue-700 dark:text-blue-300">💡 Insight:</span> In the next 10 years, you&apos;ll lose approximately{' '}
            <span className="font-black text-blue-800 dark:text-blue-200">{calculations.monthsPer10Years} months</span> to these habits alone. That&apos;s{' '}
            <span className="font-black text-blue-800 dark:text-blue-200">{calculations.percentagePer10Years}%</span> of your waking life!
          </p>
        </motion.div>

        {/* What Could You Achieve Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="mb-6">
            <h4 className="text-lg font-bold text-(--foreground) mb-2 flex items-center gap-2">
              🎯 What Could You Achieve?
            </h4>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
              With {calculations.hoursPerYear} hours per year, you could accomplish:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative min-h-[150px]">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading-achievements"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-(--card)/50 backdrop-blur-xs z-10 rounded-xl"
                >
                  <div className="flex flex-col items-center gap-2 text-(--primary)">
                    <div className="w-6 h-6 border-4 border-(--primary)/30 border-t-(--primary) rounded-full animate-spin"></div>
                    <p className="text-xs font-medium animate-pulse">Calculating AI possibilities...</p>
                  </div>
                </motion.div>
              ) : null}
              
              <motion.div 
                key={dynamicAchievements ? 'dynamic' : 'static'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                {calculations.achievableSkills.slice(0, 6).map((achievement, index) => (
                  <motion.div
                    key={achievement.skill + index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.85 + index * 0.05 }}
                    className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-950 dark:text-white flex items-center gap-2">
                          <span className="text-lg">{achievement.icon}</span>
                          {achievement.skill}
                        </p>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">
                          {achievement.hoursRequired} hours required
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-blue-800 dark:text-blue-200">
                          {achievement.yearsToComplete} yrs
                        </p>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">to complete</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Alternative Productive Uses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="mb-6">
            <h4 className="text-lg font-bold text-(--foreground) mb-2 flex items-center gap-2">
              💼 Alternative Productive Uses
            </h4>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
              Instead of wasting {calculations.totalDailyHours} hours daily, you could:
            </p>
          </div>

          <div className="space-y-2 relative min-h-[250px]">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading-alternatives"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-(--card)/50 backdrop-blur-xs z-10 rounded-xl"
                >
                  <div className="flex flex-col items-center gap-2 text-(--primary)">
                    <div className="w-6 h-6 border-4 border-(--primary)/30 border-t-(--primary) rounded-full animate-spin"></div>
                    <p className="text-xs font-medium animate-pulse">Generating AI alternatives...</p>
                  </div>
                </motion.div>
              ) : null}

              <motion.div 
                key={dynamicAlternatives ? 'dynamic' : 'static'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {(dynamicAlternatives || [
                  { icon: '📖', title: 'Read & Learn', description: `Read ~${Math.round(calculations.hoursPerYear / 5)} books per year (5 hrs each)` },
                  { icon: '💪', title: 'Build Health & Fitness', description: 'Gym, yoga, running, meditation - transform your body and mind' },
                  { icon: '🚀', title: 'Build a Side Project', description: `Create something that could earn you ₹${Math.round(calculations.hoursPerYear * 500).toLocaleString('en-IN')}/year as passive income` },
                  { icon: '👨‍👩‍👧‍👦', title: 'Quality Time with Family', description: 'Build meaningful relationships instead of scrolling' },
                  { icon: '🎯', title: 'Personal Development', description: 'Therapy, journaling, meditation, self-reflection' }
                ]).map((alt, index) => (
                  <motion.div
                    key={alt.title + index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.05 + index * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30"
                  >
                    <span className="text-lg">{alt.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-950 dark:text-white">{alt.title}</p>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{alt.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Investment Potential */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10 border border-blue-200 dark:border-blue-800/30">
            <p className="text-sm font-black text-blue-800 dark:text-blue-100 mb-3 flex items-center gap-2">
              💰 Financial Opportunity
            </p>
            <p className="text-xs font-bold text-blue-900 dark:text-blue-50 leading-relaxed">
              If you invested your {calculations.hoursPerYear} annual hours at even ₹250/hour (freelance rate), you&apos;d earn <span className="font-black">₹{Math.round(calculations.hoursPerYear * 250).toLocaleString('en-IN')}</span> per year, or <span className="font-bold">₹{Math.round(calculations.hoursPerYear * 250 * 10).toLocaleString('en-IN')}</span> in 10 years!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </Card>
  );
};

export default TimeLostCalculator;
