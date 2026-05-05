import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Sparkles } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import HabitItem from './HabitItem';

export const HabitList = () => {

  const { habits, deleteHabit } = useHabits();

  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-blue-600/5 rounded-2xl" />
        <div className="relative backdrop-blur-xl rounded-2xl p-12 text-center bg-(--muted)">
          <div className="inline-flex p-4 rounded-2xl mb-6 bg-(--muted)">
            <Inbox className="w-8 h-8 text-(--muted-foreground)" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-(--foreground)">
            No habits tracked yet
          </h3>
          <p className="max-w-md mx-auto text-(--muted-foreground)">
            Start by adding your first habit above. Discover how small daily expenses
            add up to significant amounts over time.
          </p>
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-(--primary)">
            <Sparkles className="w-4 h-4" />
            <span>Add your first habit to get started</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-(--foreground)">
          <span>Your Habits</span>
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-2 py-0.5 text-xs font-semibold bg-[var(--primary)]/20 text-(--primary) rounded-full"
          >
            {habits.length}
          </motion.span>
        </h2>
      </div>

      <motion.div layout className="space-y-3">
        <AnimatePresence mode="popLayout">
          {habits.map((habit, index) => (
            <HabitItem
              key={habit.id}
              habit={habit}
              index={index}
              onDelete={deleteHabit}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default HabitList;
