import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import puter from '@heyputer/puter.js';
import Card from './ui/Card';
import Button from './ui/Button';

const breakStrategies = {
  Coffee: [
    { emoji: '☕', text: 'Switch to tea', icon: 'Tea' },
    { emoji: '🚶', text: 'Morning walk instead', icon: 'Walk' },
    { emoji: '💧', text: 'Drink water first', icon: 'Water' },
    { emoji: '🧋', text: 'Try decaf alternative', icon: 'Decaf' },
    { emoji: '📔', text: 'Log your cravings', icon: 'Journal' },
  ],
  Food: [
    { emoji: '🍎', text: 'Eat fruit first', icon: 'Fruit' },
    { emoji: '🥗', text: 'Meal prep healthy options', icon: 'Prep' },
    { emoji: '💧', text: 'Drink water before eating', icon: 'Water' },
    { emoji: '🍌', text: 'Healthy snack swaps', icon: 'Snack' },
    { emoji: '⏱️', text: 'Intermittent fasting', icon: 'Fasting' },
  ],
  Shopping: [
    { emoji: '📱', text: 'Delete shopping apps', icon: 'Delete' },
    { emoji: '💰', text: 'Budget tracking app', icon: 'Budget' },
    { emoji: '🛑', text: '24-hour rule before buying', icon: 'Wait' },
    { emoji: '📝', text: 'Make shopping list only', icon: 'List' },
    { emoji: '🎨', text: 'DIY / creative hobby', icon: 'DIY' },
  ],
  Transport: [
    { emoji: '🚴', text: 'Cycle to work', icon: 'Cycle' },
    { emoji: '🚶', text: 'Walk for short trips', icon: 'Walk' },
    { emoji: '🚌', text: 'Use public transport', icon: 'Transit' },
    { emoji: '🤝', text: 'Carpool with friends', icon: 'Carpool' },
    { emoji: '📍', text: 'Plan efficient routes', icon: 'Route' },
  ],
  Entertainment: [
    { emoji: '📚', text: 'Read a book', icon: 'Read' },
    { emoji: '🎮', text: 'Free gaming alternatives', icon: 'Game' },
    { emoji: '🧘', text: 'Meditation or yoga', icon: 'Meditate' },
    { emoji: '🎵', text: 'Listen to podcasts', icon: 'Podcast' },
    { emoji: '🏃', text: 'Outdoor activity', icon: 'Outdoor' },
  ],
  Subscriptions: [
    { emoji: '📋', text: 'Audit all subscriptions', icon: 'Audit' },
    { emoji: '🗑️', text: 'Cancel unused ones', icon: 'Cancel' },
    { emoji: '🤝', text: 'Share family plan', icon: 'Share' },
    { emoji: '📚', text: 'Use free library services', icon: 'Library' },
    { emoji: '💡', text: 'Find open-source alternatives', icon: 'Open' },
  ],
  Health: [
    { emoji: '🏋️', text: 'Free exercise at home', icon: 'Exercise' },
    { emoji: '🥗', text: 'Whole foods diet', icon: 'Diet' },
    { emoji: '😴', text: 'Better sleep routine', icon: 'Sleep' },
    { emoji: '🧘', text: 'Stress management', icon: 'Stress' },
    { emoji: '🚫', text: 'Quit destructive habits', icon: 'Quit' },
  ],
};

const motivationQuotes = [
  "You don't need more willpower, you need better systems.",
  "Small changes lead to big results over time.",
  "Your future self will thank you for this decision.",
  "Every moment is a fresh opportunity to change your habits.",
  "Progress over perfection.",
  "Change your environment to change your habits.",
  "The only failure is not trying.",
  "Build identity-based habits, not motivation-based.",
  "What gets tracked gets improved.",
  "You are capable of more than you believe.",
];

const StrategyCard = ({ strategy, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ scale: 1.05, y: -2 }}
    className="p-4 rounded-xl bg-linear-to-r from-blue-500/10 to-blue-700/10 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800/30 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer"
  >
    <div className="text-3xl mb-2">{strategy.emoji}</div>
    <p className="text-sm font-bold text-gray-950 dark:text-white">
      {strategy.text}
    </p>
  </motion.div>
);

export const BreakThisHabit = ({ habits }) => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dynamicStrategies, setDynamicStrategies] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationQuotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const activeCategory = selectedCategory || 'Coffee';

  useEffect(() => {
    let isMounted = true;
    
    const fetchStrategies = async () => {
      setIsGenerating(true);
      try {
        const prompt = `Provide exactly 5 actionable and unique strategies to break a bad habit related to: "${activeCategory}". Return ONLY a valid JSON array of objects. Each object must have: 'emoji' (1 relevant emoji), 'text' (short strategy text max 5 words), and 'icon' (short 1-word string). Do not include markdown code blocks or any other text.`;
        
        const response = await puter.ai.chat(prompt);
        // Puter AI response might have different formats depending on the model, handle raw text
        const rawText = typeof response === 'object' ? (response.text || response.message?.content) : response;
        const textStr = String(rawText);
        
        // Extract JSON array using regex if it's wrapped in markdown
        const jsonMatch = textStr.match(/\[[\s\S]*\]/);
        let parsed = null;
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = JSON.parse(textStr);
        }
        
        if (isMounted && Array.isArray(parsed) && parsed.length > 0) {
          // Take only the first 5
          setDynamicStrategies(parsed.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to generate dynamic strategies via puter.js", err);
        if (isMounted) setDynamicStrategies(null); // Use fallback
      } finally {
        if (isMounted) setIsGenerating(false);
      }
    };

    fetchStrategies();
    
    return () => { isMounted = false; };
  }, [activeCategory]);

  if (habits.length === 0) {
    return null;
  }

  const categories = [...new Set(habits.map((h) => {
    const iconLabel = Object.values(breakStrategies).flat().find((s) => h.name?.includes(s.text));
    if (iconLabel) return iconLabel.icon;
    
    // Fallback to category name logic
    const categoryName = h.name?.split(' ')[0] || '';
    return Object.keys(breakStrategies).find((key) =>
      categoryName.toLowerCase().includes(key.toLowerCase())
    ) || 'Entertainment';
  }))];

  const strategies = dynamicStrategies || breakStrategies[activeCategory] || breakStrategies.Coffee;

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
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 000-2H6V3a1 1 0 01-1-1zm0 4a1 1 0 011 1v1h1a1 1 0 100-2H6V7a1 1 0 01-1-1zm6-2a1 1 0 000 2h1V5a1 1 0 10-1 0zm0 4a1 1 0 000 2h1V9a1 1 0 10-1 0zM7 9a1 1 0 011-1h1a1 1 0 100-2H8a1 1 0 00-1 1v1zm6-4a1 1 0 01-1 1v1a1 1 0 102 0V6a1 1 0 01-1-1zM7 13a1 1 0 011-1h1a1 1 0 100-2H8a1 1 0 00-1 1v1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-(--foreground)">Break This Habit</h3>
            <p className="text-sm text-(--muted-foreground)">Actionable strategies to quit</p>
          </div>
        </div>

        {/* Motivation Quote */}
        <motion.div
          key={currentQuote}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="mb-6 p-4 rounded-xl bg-linear-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30"
        >
          <p className="text-base font-bold italic text-gray-950 dark:text-white leading-relaxed">
            &quot;{motivationQuotes[currentQuote]}&quot;
          </p>
          <div className="flex gap-1 mt-3">
            {motivationQuotes.map((_, i) => (
              <motion.div
                key={i}
                className="h-1 rounded-full text-gray-700 dark:text-gray-300"
                animate={{
                  backgroundColor: i === currentQuote ? '#3b82f6' : '#d1d5db',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Category Selector */}
        <div className="mb-6">
          <p className="text-xs font-black text-gray-800 dark:text-gray-100 uppercase tracking-wide mb-3">
            Habit Type
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.keys(breakStrategies).map((category) => (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  activeCategory === category
                    ? 'bg-(--primary) text-white'
                    : 'bg-(--muted) text-(--muted-foreground) hover:bg-(--muted)/80'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Strategies Grid */}
        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-(--card)/50 backdrop-blur-xs z-10 rounded-xl"
              >
                <div className="flex flex-col items-center gap-3 text-(--primary)">
                  <div className="w-8 h-8 border-4 border-(--primary)/30 border-t-(--primary) rounded-full animate-spin"></div>
                  <p className="text-sm font-medium animate-pulse">Generating AI strategies...</p>
                </div>
              </motion.div>
            ) : null}
            
            <motion.div
              key={activeCategory + (dynamicStrategies ? '-dynamic' : '-static')}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 relative"
            >
              {strategies.map((strategy, index) => (
                <StrategyCard key={strategy.text + index} strategy={strategy} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => {
              const selectedStrategy =
                strategies[Math.floor(Math.random() * strategies.length)];
              alert(`💪 Start with: ${selectedStrategy.text}\n\nTake action today!`);
            }}
          >
            🚀 Try Today - Pick Random Strategy
          </Button>
        </motion.div>
      </motion.div>
    </Card>
  );
};

export default BreakThisHabit;
