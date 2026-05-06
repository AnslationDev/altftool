import React, { createContext, useState, useEffect } from 'react';

export const HabitContext = createContext({});

const loadHabits = () => {
    if (typeof window === 'undefined') return [];

    try {
        const savedHabits = localStorage.getItem('habits');
        return savedHabits ? JSON.parse(savedHabits) : [];
    } catch {
        return [];
    }
};

export const HabitProvider = ({ children }) => {
    const [habits, setHabits] = useState(loadHabits);
    const [selectedTab, setSelectedTab] = useState('monthly');

    // Save habits to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('habits', JSON.stringify(habits));
    }, [habits]);

    // Add a new habit
    const addHabit = (habit) => {
        setHabits([...habits, { ...habit, id: Date.now() }]);
    };

    // Remove a habit
    const removeHabit = (id) => {
        setHabits(habits.filter((habit) => habit.id !== id));
    };

    // Toggle habit completion
    const toggleHabit = (id) => {
        setHabits(habits.map(habit => 
            habit.id === id ? { ...habit, done: !habit.done } : habit
        ));
    };

    // Calculate monthly cost
    const monthlyCost = habits.reduce((total, habit) => {
        if (habit.frequency === 'daily') {
            return total + habit.cost * 30;
        } else {
            return total + habit.cost * 4; // Approx 4 weeks in a month
        }
    }, 0);

    // Calculate yearly cost
    const yearlyCost = habits.reduce((total, habit) => {
        if (habit.frequency === 'daily') {
            return total + habit.cost * 365;
        } else {
            return total + habit.cost * 52; // 52 weeks in a year
        }
    }, 0);

    // Calculate 5-year cost
    const fiveYearCost = yearlyCost * 5;

    const value = {
        habits,
        addHabit,
        removeHabit,
        toggleHabit,
        totalMonthlyCost: monthlyCost,
        totalYearlyCost: yearlyCost,
        total5YearCost: fiveYearCost,
        selectedTab,
        setSelectedTab,
    };

    return (
        <HabitContext.Provider value={value}>{children}</HabitContext.Provider>
    );
};

export const useHabits = () => {
    const context = React.useContext(HabitContext);
    if (!context) {
        throw new Error('useHabits must be used within HabitProvider');
    }
    return context;
};
