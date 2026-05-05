import React, { createContext, useContext, useReducer, useEffect } from 'react';

const HabitContext = createContext();

const STORAGE_KEY = 'habit-cost-calculator-habits';

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const calculateMonthlyCost = (cost, frequency) => {
  if (frequency === 'daily') return cost * 30;
  if (frequency === 'weekly') return cost * 4;
  if (frequency === 'monthly') return cost;
  if (frequency === 'yearly') return cost / 12;
  return 0;
};

const impactLevelValue = (level) => {
  if (level === 'low') return 1;
  if (level === 'medium') return 2;
  if (level === 'high') return 3;
  return 0;
};

const calculateImpactScore = (habit) => {
  if (!habit.healthImpact || !habit.stressImpact || !habit.productivityImpact || !habit.relationshipImpact) {
    return 0;
  }

  const healthScore = impactLevelValue(habit.healthImpact) * 8;
  const stressScore = impactLevelValue(habit.stressImpact) * 8;
  const productivityScore = impactLevelValue(habit.productivityImpact) * 8;
  const relationshipScore = impactLevelValue(habit.relationshipImpact) * 8;

  const lifestyleScore = (healthScore + stressScore + productivityScore + relationshipScore) / 4;

  const monthlyCost = calculateMonthlyCost(habit.cost, habit.frequency);
  const yearlyCost = monthlyCost * 12;
  const costScore = Math.min(yearlyCost / 100, 24);

  const timeSpentPerDay = habit.timeSpentPerDay || 0;
  const yearsActive = habit.years || 1;
  const timeScore = Math.min((timeSpentPerDay * yearsActive) / 10, 24);

  const totalScore = lifestyleScore + costScore + timeScore;
  return Math.min(Math.round(totalScore), 100);
};

const habitReducer = (state, action) => {
  switch (action.type) {
    case 'SET_HABITS':
      return { ...state, habits: action.payload, isLoading: false };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter(h => h.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

export const HabitProvider = ({ children }) => {
  const [state, dispatch] = useReducer(habitReducer, {
    habits: [],
    isLoading: true,
  });

  // Load habits from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        dispatch({ type: 'SET_HABITS', payload: parsed });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Save habits to localStorage whenever they change
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.habits));
    }
  }, [state.habits, state.isLoading]);

  const addHabit = (habitData) => {
    const newHabit = {
      ...habitData,
      id: generateId(),
      createdAt: Date.now(),
    };
    dispatch({ type: 'ADD_HABIT', payload: newHabit });
  };

  const deleteHabit = (id) => {
    dispatch({ type: 'DELETE_HABIT', payload: id });
  };

  const monthlyTotal = state.habits.reduce(
    (sum, habit) => sum + calculateMonthlyCost(habit.cost, habit.frequency),
    0
  );

  const yearlyTotal = monthlyTotal * 12;
  const fiveYearTotal = yearlyTotal * 5;

  return (
    <HabitContext.Provider
      value={{
        habits: state.habits,
        isLoading: state.isLoading,
        addHabit,
        deleteHabit,
        monthlyTotal,
        yearlyTotal,
        fiveYearTotal,
        calculateImpactScore,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export { calculateMonthlyCost, calculateImpactScore, impactLevelValue };
