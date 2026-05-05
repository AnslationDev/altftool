import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useHabits, formatCurrency } from '../context/HabitContext';
import Card from './ui/Card';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-(--card) backdrop-blur-xl rounded-xl p-4 shadow-xl">
        <p className="text-sm font-semibold mb-1 text-(--foreground)">{label}</p>
        <p className="text-sm text-blue-400">
          <span className="font-semibold">{formatCurrency(payload[0].value)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const CostChart = () => {
  const { habits, monthlyTotal, yearlyTotal } = useHabits();

  const chartData = [
    {
      name: 'Monthly',
      amount: monthlyTotal,
      fill: 'url(#monthlyGradient)',
    },
    {
      name: 'Yearly',
      amount: yearlyTotal,
      fill: 'url(#yearlyGradient)',
    },
  ];

  if (habits.length === 0) {
    return (
      <Card variant="glass" className="h-[300px] flex items-center justify-center">
        <div className="text-center text-(--muted-foreground)">
          <p>Add habits to see your cost analysis</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card variant="glass" className="relative overflow-hidden">
        {/* Decorative gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-(--foreground)">Cost Analysis</h2>
              <p className="text-sm text-(--muted-foreground)">Monthly vs Yearly comparison</p>
            </div>
          </div>

          <div className="h-[250px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                barCategoryGap="30%"
              >
                <defs>
                  <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="yearlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                />
                <Bar
                  dataKey="amount"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1000}
                  animationBegin={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6">
            <div className="text-center p-3 rounded-xl bg-(--muted)">
              <p className="text-xs mb-1 text-(--muted-foreground)">Cost per day</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(monthlyTotal / 30)}
              </p>
            </div>
            <div className="text-center p-3 rounded-xl bg-(--muted)">
              <p className="text-xs mb-1 text-(--muted-foreground)">Cost per week</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency((monthlyTotal / 30) * 7)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CostChart;
