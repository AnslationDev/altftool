import React from 'react';
import { useHabits } from '../../context/HabitContext';

export const HabitItem = ({ habit }) => {
    const { removeHabit } = useHabits();

    const getFrequencyText = () => {
        if (habit.frequency === 'daily') {
            return 'Daily';
        } else {
            return 'Weekly';
        }
    };

    const getMonthlyCost = () => {
        if (habit.frequency === 'daily') {
            return habit.cost * 30;
        } else {
            return habit.cost * 4;
        }
    };

    return (
        <div className="glass-card p-4 rounded-xl flex justify-between items-center hover:bg-white/10">
            <div>
                <h3 className="font-bold text-lg">{habit.name}</h3>
                <p className="text-gray-400 text-sm">
                    {getFrequencyText()} • ₹{habit.cost} per use
                </p>
                <p className="text-neon-cyan text-sm mt-1">
                    Monthly: ₹{getMonthlyCost().toLocaleString()}
                </p>
            </div>
            <button
                onClick={() => removeHabit(habit.id)}
                className="btn-delete"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <polyline points="19 7 12 14 5 7"></polyline>
                    <line x1="12" y1="14" x2="12" y2="21"></line>
                </svg>
            </button>
        </div>
    );
};