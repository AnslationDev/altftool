import React, { useState, useEffect } from 'react';

export const ProductivityContext = React.createContext({});

const DEFAULT_GOALS = [
    { id: 1, text: 'Finish coding task', completed: false },
    { id: 2, text: '30 min reading', completed: false },
    { id: 3, text: 'Gym session', completed: false },
];

const DEFAULT_TODOS = [
    { id: 1, text: 'Morning routine', completed: false },
    { id: 2, text: 'Meditate', completed: false },
];

const loadProductivityData = () => {
    if (typeof window === 'undefined') return {};

    try {
        const saved = localStorage.getItem('productivityData');
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
};

export const ProductivityProvider = ({ children }) => {
    const [initialData] = useState(loadProductivityData);
    const [sleep, setSleep] = useState(() => initialData.sleep || 7);
    const [work, setWork] = useState(() => initialData.work || 8);
    const [exercise, setExercise] = useState(() => initialData.exercise || 30);
    const [screenTime, setScreenTime] = useState(() => initialData.screenTime || 3);
    const [water, setWater] = useState(() => initialData.water || 8);
    const [energy, setEnergy] = useState(() => initialData.energy || 7);
    const [mood, setMood] = useState(() => initialData.mood || '😊');
    const [habitsCompleted, setHabitsCompleted] = useState(() => initialData.habitsCompleted || 0);
    const [totalHabits, setTotalHabits] = useState(() => initialData.totalHabits || 6);
    const [goals, setGoals] = useState(() => initialData.goals || DEFAULT_GOALS);
    const [todos, setTodos] = useState(() => initialData.todos || DEFAULT_TODOS);
    const [streak, setStreak] = useState(() => initialData.streak || 3);
    const [history, setHistory] = useState(() => initialData.history || []);
    const [darkMode, setDarkMode] = useState(() => initialData.darkMode || false);
    const [isTimerRunning, setIsTimerRunning] = useState(false);

    // Goal Helpers
    const addGoal = (text) => {
        setGoals([...goals, { id: Date.now(), text, completed: false }]);
    };

    const removeGoal = (id) => {
        setGoals(goals.filter(g => g.id !== id));
    };

    const toggleGoal = (id) => {
        setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
    };

    // Todo Helpers
    const addTodo = (text) => {
        setTodos([...todos, { id: Date.now(), text, completed: false }]);
    };

    const removeTodo = (id) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    const toggleTodo = (id) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    // Helper to validate and set time-based values
    const validateAndSet = (setter, newValue, type) => {
        const otherHours = {
            sleep: work + (exercise / 60) + screenTime,
            work: sleep + (exercise / 60) + screenTime,
            exercise: sleep + work + screenTime,
            screenTime: sleep + work + (exercise / 60)
        };

        const currentOther = otherHours[type];
        const val = type === 'exercise' ? newValue / 60 : newValue;
        
        if (currentOther + val <= 24) {
            setter(newValue);
        } else {
            // Cap at remaining time
            const remaining = Math.max(0, 24 - currentOther);
            setter(type === 'exercise' ? remaining * 60 : remaining);
        }
    };

    const handleSleepChange = (val) => validateAndSet(setSleep, val, 'sleep');
    const handleWorkChange = (val) => validateAndSet(setWork, val, 'work');
    const handleExerciseChange = (val) => validateAndSet(setExercise, val, 'exercise');
    const handleScreenTimeChange = (val) => validateAndSet(setScreenTime, val, 'screenTime');

    // Save data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('productivityData', JSON.stringify({
            sleep, work, exercise, screenTime, water, energy, mood,
            habitsCompleted, totalHabits, goals, todos, streak, history, darkMode
        }));
    }, [sleep, work, exercise, screenTime, water, energy, mood,
        habitsCompleted, totalHabits, goals, todos, streak, history, darkMode]);

    // Calculate productivity score
    const calculateScore = () => {
        // If no time is allocated at all, the score should be 0
        if (usedHours === 0 && energy === 0 && habitsCompleted === 0) return 0;

        let score = 0;

        // Sleep (7-8 hours ideal) - 15 points max
        if (sleep >= 7 && sleep <= 8) score += 15;
        else score += Math.max(0, 15 - Math.abs(sleep - 8) * 2);

        // Work (6-9 hours productive) - 15 points max
        if (work >= 6 && work <= 9) score += 15;
        else score += Math.max(0, 15 - Math.abs(work - 7.5) * 2);

        // Exercise (30+ min) - 10 points
        score += exercise >= 30 ? 10 : Math.max(0, exercise / 3);

        // Screen time (lower is better) - 10 points
        score += Math.max(0, 10 - screenTime);

        // Water (8 glasses ideal) - 10 points
        score += water >= 8 ? 10 : water * 1.25;

        // Energy level (1-10) - 10 points
        score += energy * 1;

        // Mood - 10 points
        const moodValues = { '😊': 10, '😐': 5, '😴': 2, '😔': 0, '🔥': 10 };
        score += moodValues[mood] || 5;

        // Habits completed - 10 points
        score += totalHabits > 0 ? (habitsCompleted / totalHabits) * 10 : 0;

        // Goals completed - 5 points
        const goalsCompleted = goals.filter(g => g.completed).length;
        score += goals.length > 0 ? (goalsCompleted / goals.length) * 5 : 0;

        // Todos completed - 5 points
        const todosCompleted = todos.filter(t => t.completed).length;
        score += todos.length > 0 ? (todosCompleted / todos.length) * 5 : 0;

        // Bonus for high energy + good mood
        if (energy >= 8 && mood === '😊') score += 5;

        return Math.min(100, Math.round(score));
    };

    const resetAllData = () => {
        setSleep(0);
        setWork(0);
        setExercise(0);
        setScreenTime(0);
        setWater(0);
        setEnergy(0);
        setMood('😊');
        setHabitsCompleted(0);
        setTotalHabits(0);
        setGoals([]);
        setTodos([]);
        setIsTimerRunning(false);
        localStorage.removeItem('productivityData');
    };

    const usedHours = sleep + work + (exercise / 60) + screenTime;
    const score = calculateScore();

    // Track daily score history (keep last 7 days)
    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        setHistory(prevHistory => {
            const existingIndex = prevHistory.findIndex(h => h.date === todayStr);
            
            if (existingIndex >= 0 && prevHistory[existingIndex].score === score) {
                return prevHistory; // No change
            }

            const newHistory = [...prevHistory];
            if (existingIndex >= 0) {
                newHistory[existingIndex].score = score;
            } else {
                newHistory.push({ date: todayStr, score });
            }

            // Keep only the last 7 days
            if (newHistory.length > 7) {
                return newHistory.slice(newHistory.length - 7);
            }
            return newHistory;
        });
    }, [score]);

    const value = {
        sleep, setSleep: handleSleepChange,
        work, setWork: handleWorkChange,
        exercise, setExercise: handleExerciseChange,
        screenTime, setScreenTime: handleScreenTimeChange,
        water, setWater,
        energy, setEnergy,
        mood, setMood,
        habitsCompleted, setHabitsCompleted,
        totalHabits, setTotalHabits,
        goals, setGoals,
        todos, setTodos,
        streak, setStreak,
        history, setHistory,
        darkMode, setDarkMode,
        addGoal, removeGoal, toggleGoal,
        addTodo, removeTodo, toggleTodo,
        score,
        usedHours,
        isTimerRunning, setIsTimerRunning,
        resetAllData,
    };

    return (
        <ProductivityContext.Provider value={value}>
            {children}
        </ProductivityContext.Provider>
    );
};

export const useProductivity = () => {
    const context = React.useContext(ProductivityContext);
    if (!context) {
        throw new Error('useProductivity must be used within ProductivityProvider');
    }
    return context;
};
