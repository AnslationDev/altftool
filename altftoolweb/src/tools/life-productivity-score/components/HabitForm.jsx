import React, { useState } from 'react';
import { useHabits } from '../../context/HabitContext';

export const HabitsForm = () => {
    const { addHabit } = useHabits();
    const [habitName, setHabitName] = useState('');
    const [cost, setCost] = useState('');
    const [frequency, setFrequency] = useState('daily');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (habitName.trim() && cost) {
            addHabit({
                name: habitName,
                cost: parseFloat(cost),
                frequency,
            });
            setHabitName('');
            setCost('');
            setFrequency('daily');
        }
    };

    return (
        <div className="glass-card p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4 text-gradient">Add New Habit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm mb-2 text-gray-400">Habit Name</label>
                    <input
                        type="text"
                        value={habitName}
                        onChange={(e) => setHabitName(e.target.value)}
                        className="input-premium"
                        placeholder="e.g., Morning Coffee"
                    />
                </div>
                <div>
                    <label className="block text-sm mb-2 text-gray-400">Cost per Use</label>
                    <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        className="input-premium"
                        placeholder="0.00"
                        min="0"
                    />
                </div>
                <div>
                    <label className="block text-sm mb-2 text-gray-400">Frequency</label>
                    <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="input-premium"
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>
                <button type="submit" className="btn-primary w-full">
                    Add Habit
                </button>
            </form>
        </div>
    );
};