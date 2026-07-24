"use client";

export const STORAGE_KEY = 'ingredient_substitutes_favorites';

export const loadFavorites = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load favorites', e);
    return [];
  }
};

export const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorites', e);
  }
};

export const searchIngredients = (ingredients, term, category = 'all', dietaryFilters = [], cookingType = 'all') => {
  if (!term && category === 'all' && dietaryFilters.length === 0 && cookingType === 'all') {
    return ingredients;
  }

  return ingredients.filter(ing => {
    // 1. Category Filter
    if (category !== 'all' && ing.category !== category) return false;

    // 2. Term Search (matches ingredient name OR any of its substitutes)
    const matchesTerm = !term || 
      ing.name.toLowerCase().includes(term.toLowerCase()) ||
      ing.substitutes.some(sub => sub.name.toLowerCase().includes(term.toLowerCase()));
    
    if (!matchesTerm) return false;

    // 3. Dietary & Cooking Type Filters (Check if ANY substitute matches)
    const hasMatchingSubstitute = ing.substitutes.some(sub => {
      const matchesDietary = dietaryFilters.length === 0 || 
        dietaryFilters.every(f => sub.dietary.includes(f));
      
      const matchesCooking = cookingType === 'all' || 
        sub.cookingType.includes(cookingType);

      return matchesDietary && matchesCooking;
    });

    return hasMatchingSubstitute;
  });
};

export const getFilteredSubstitutes = (substitutes, dietaryFilters = [], cookingType = 'all') => {
  return substitutes.filter(sub => {
    const matchesDietary = dietaryFilters.length === 0 || 
      dietaryFilters.every(f => sub.dietary.includes(f));
    
    const matchesCooking = cookingType === 'all' || 
      sub.cookingType.includes(cookingType);

    return matchesDietary && matchesCooking;
  });
};
