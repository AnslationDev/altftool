import React from 'react';
import { useHabits } from '../../context/HabitContext';

export const HabitsSummary = () => {
    const { habits, totalMonthlyCost, totalYearlyCost, total5YearCost } = useHabits();

    return (
        <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gradient">Spending Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="summary-card bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400 text-sm mb-1">Monthly</p>
                    <p className="text-3xl font-bold text-neon-cyan">₹{totalMonthlyCost.toLocaleString()}</p>
                </div>
                <div className="summary-card bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400 text-sm mb-1">Yearly</p>
                    <p className="text-3xl font-bold text-neon-purple">₹{totalYearlyCost.toLocaleString()}</p>
                </div>
                <div className="summary-card bg-white/5 p-4 rounded-xl text-center">
                    <p className="text-gray-400 text-sm mb-1">5 Years</p>
                    <p className="text-3xl font-bold text-neon-pink">₹{total5YearCost.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};