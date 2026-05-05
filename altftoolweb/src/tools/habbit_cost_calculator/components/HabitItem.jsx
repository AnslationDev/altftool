import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Coffee, Utensils, ShoppingBag, Car, Film, Music, Heart, Repeat, Calendar } from 'lucide-react';
import { formatCurrency, calculateMonthlyCost } from '../context/HabitContext';
import Card from './ui/Card';

const iconMap = {
  Coffee,
  Utensils,
  ShoppingBag,
  Car,
  Film,
  Music,
  Heart,
};

export const HabitItem = ({ habit, onDelete, index }) => {
  const IconComponent = iconMap[habit.name.split(' ')[0]] || Coffee;
  const monthlyCost = calculateMonthlyCost(habit.cost, habit.frequency);
  const yearlyCost = monthlyCost * 12;
  const fiveYearCost = yearlyCost * 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
    >
      <Card className="group relative overflow-hidden z-0" variant="glass" hover>

        {/* Hover glow effect (ALWAYS BELOW) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-0 left-0 w-1 h-full z-0 bg-gradient-to-b from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Content (ALWAYS ABOVE) */}
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">

            {/* Left side */}
            <div className="flex items-start gap-4">

              <div className="p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-all duration-300">
                <IconComponent className="w-5 h-5 text-(--muted-foreground) group-hover:text-(--primary) transition-colors duration-300" />
              </div>

              <div>
                {/* ✅ FIXED H3 */}
                <h3 className="font-semibold text-[var(--foreground)]">
                  {habit.name}
                </h3>

                <div className="flex items-center gap-3 mt-1">
                  <span className="text-lg font-bold text-(--primary)">
                    ₹{habit.cost.toFixed(0)}
                  </span>

                  <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                    {habit.frequency === 'daily' ? (
                      <>
                        <Calendar className="w-3 h-3" />
                        per day
                      </>
                    ) : (
                      <>
                        <Repeat className="w-3 h-3" />
                        per week
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="hidden sm:block text-right">
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Monthly</p>
                  <p className="font-semibold text-(--primary)">
                    {formatCurrency(monthlyCost)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Yearly</p>
                  <p className="font-semibold text-(--primary)">
                    {formatCurrency(yearlyCost)}
                  </p>
                </div>
                <div className="hidden md:block">
                  <p className="text-xs text-[var(--muted-foreground)]">5 Years</p>
                  <p className="font-semibold text-(--primary)">
                    {formatCurrency(fiveYearCost)}
                  </p>
                </div>
              </div>
            </div>

            {/* Delete button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(habit.id)}
              className="p-2 rounded-lg hover:bg-(--primary)/10 transition-all duration-200 opacity-0 group-hover:opacity-100 md:opacity-100 text-(--muted-foreground) hover:text-(--primary)"
              aria-label="Delete habit"
            >
              <Trash2 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default HabitItem;
