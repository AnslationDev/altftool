import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Award } from 'lucide-react';
import { useHabits, formatCurrency } from '../context/HabitContext';
import Card from './ui/Card';

const SummaryCard = ({ title, amount, icon, gradient, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        variant="gradient"
        hover
        className="relative overflow-hidden group bg-(--background) shadow-sm"
      >
        {/* Gradient accent */}
        <div className={`absolute inset-0 bg-(--background) opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-(--muted-foreground)">{title}</span>
            <div className={`p-2 rounded-xl bg-gradient-to-br ${gradient} text-white/90`}>
              {icon}
            </div>
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
            className="flex items-baseline gap-1"
          >
            <span className="text-3xl md:text-4xl font-bold text-(--foreground) tracking-tight tabular-nums">
              {formatCurrency(amount)}
            </span>
          </motion.div>

          <div className="mt-3 flex items-center gap-2 text-xs text-(--muted-foreground)">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            <span>Calculated from your habits</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export const HabitSummary = () => {
  const { monthlyTotal, yearlyTotal, fiveYearTotal } = useHabits();

  const summaryData = [
    {
      title: 'Monthly Spending',
      amount: monthlyTotal,
      icon: <Calendar className="w-5 h-5" />,
      gradient: 'from-blue-500  to-blue-600',
    },
    {
      title: 'Yearly Spending',
      amount: yearlyTotal,
      icon: <TrendingUp className="w-5 h-5" />,
      gradient: 'from-blue-500  to-blue-600',
    },
    {
      title: '5-Year Spending',
      amount: fiveYearTotal,
      icon: <Award className="w-5 h-5" />,
      gradient: 'from-blue-500  to-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {summaryData.map((item, index) => (
        <SummaryCard
          key={item.title}
          title={item.title}
          amount={item.amount}
          icon={item.icon}
          gradient={item.gradient}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
};

export default HabitSummary;
