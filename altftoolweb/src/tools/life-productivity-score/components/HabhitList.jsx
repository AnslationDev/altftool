import React from 'react';
import { useHabits } from '../../context/HabitContext';
import HabitItem from './HabitItem';

export const HabitsList = () => {
    const { habits } = useHabits();

    if (habits.length === 0) {
        return (
            <div className="glass-card p-8 rounded-2xl text-center">
                <p className="text-gray-400 text-xl mb-2">No habits added yet</p>
                <p className="text-gray-500 text-sm">Start by adding your first habit!</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4 text-gradient">Your Habits</h2>
            <div className="space-y-3">
                {habits.map((habit) => (
                    <HabitItem key={habit.id} habit={habit} />
                ))}
            </div>
        </div>
    );
};