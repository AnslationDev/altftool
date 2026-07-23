"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  RotateCcw, 
  Heart, 
  Info, 
  X, 
  ChefHat, 
  Zap, 
  History,
  Scale,
  Leaf,
  Droplets,
  Flame,
  Trash2,
  Clock,
  Milk,
  Cake,
  Candy,
  Carrot,
  Egg,
  GlassWater,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Global-Style UI Components ---
const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-(--card) border border-(--border) rounded-[2rem] p-6 shadow-xl hover:border-(--primary) transition-all overflow-hidden ${className}`}
  >
    {title && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-2xl bg-(--primary)/10 text-(--primary) shrink-0">
            {Icon && <Icon size={18} />}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-(--foreground)">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

const Badge = ({ children, color = "primary", className = "" }) => {
  const colors = {
    primary: "bg-(--primary)/10 text-(--primary) border-(--primary)/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    red: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${colors[color] || colors.primary} ${className}`}>
      {children}
    </span>
  );
};

import { INGREDIENTS, CATEGORIES, DIETARY_FILTERS, COOKING_TYPES } from './utils/ingredientDatabase';
import { searchIngredients, getFilteredSubstitutes, loadFavorites, saveFavorites } from './utils/substituteHelpers';

const Header = () => (
  <header className="mb-12 text-center">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-(--primary)/10 border border-(--primary)/20 text-(--primary) mb-6"
    >
      <Activity size={14} className="animate-pulse" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Theme Active</span>
    </motion.div>
    <motion.h1
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="heading text-(--primary) mb-6 tracking-tighter"
    >
      Ingredient Substitute Finder
    </motion.h1>
    <motion.p
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-(--muted-foreground) max-w-xl mx-auto text-sm font-medium leading-relaxed"
    >
      Universal ingredient intelligence powered by global culinary standards.
    </motion.p>
  </header>
);

export default function IngredientSubstituteFinder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeDietary, setActiveDietary] = useState([]);
  const [activeCookingType, setActiveCookingType] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setFavorites(loadFavorites());
    const saved = localStorage.getItem('ingredient_recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [searchTerm]);

  const handleToggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    setFavorites(updated);
    saveFavorites(updated);
  };

  const addToRecent = (term) => {
    if (!term || recentSearches.includes(term)) return;
    const updated = [term, ...recentSearches.slice(0, 4)];
    setRecentSearches(updated);
    localStorage.setItem('ingredient_recent_searches', JSON.stringify(updated));
  };

  const toggleDietary = (id) => {
    setActiveDietary(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const filteredIngredients = useMemo(() => {
    return searchIngredients(INGREDIENTS, searchTerm, selectedCategory, activeDietary, activeCookingType);
  }, [searchTerm, selectedCategory, activeDietary, activeCookingType]);

  const getIcon = (iconName) => {
    const icons = { Milk, Cake, Candy, Droplets, Carrot, Egg, Leaf, GlassWater };
    const IconComponent = icons[iconName] || Info;
    return <IconComponent size={14} />;
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) p-4 md:p-8 lg:p-12 font-sans selection:bg-(--primary)/30">
      <div className="max-w-5xl mx-auto">
        <Header />

        <div className="bg-(--card) rounded-[2.5rem] shadow-2xl border border-(--border) overflow-hidden">
          
          <div className="p-8 md:p-10 border-b border-(--border) space-y-8 bg-(--background)/50">
            <div className="relative group max-w-2xl mx-auto">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 transition-transform group-focus-within:scale-110">
                {isTyping ? (
                  <Activity className="text-(--primary) animate-spin" size={24} />
                ) : (
                  <Search className="text-(--primary)" size={24} />
                )}
              </div>
              <input
                type="text"
                placeholder="Search globally..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addToRecent(searchTerm)}
                className="w-full bg-(--background) border border-(--border) rounded-2xl pl-16 pr-14 py-6 text-base md:text-lg focus:border-(--primary) focus:ring-4 focus:ring-(--primary)/10 outline-none transition-all shadow-inner"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <AnimatePresence>
                  {searchTerm && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchTerm("")}
                      className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  selectedCategory === "all" ? 'bg-(--primary) text-(--primary-foreground) shadow-lg' : 'bg-(--primary)/5 text-(--primary) hover:bg-(--primary)/10'
                }`}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    selectedCategory === cat.id ? 'bg-(--primary) text-(--primary-foreground) shadow-lg' : 'bg-(--primary)/5 text-(--primary) hover:bg-(--primary)/10'
                  }`}
                >
                  {getIcon(cat.icon)}
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-(--border) pb-10">
              <div className="space-y-4 w-full md:w-1/2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-(--muted-foreground)">
                  <Leaf size={14} /> Dietary Filters
                </div>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_FILTERS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => toggleDietary(f.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeDietary.includes(f.id)
                          ? 'bg-(--primary) border-(--primary) text-(--primary-foreground) shadow-md shadow-(--primary)/20'
                          : 'bg-(--primary)/5 border-(--primary)/10 text-(--primary) hover:bg-(--primary)/10'
                        }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 w-full md:w-1/2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-(--muted-foreground)">
                  <Flame size={14} /> Cooking Modes
                </div>
                <div className="flex flex-wrap gap-2">
                  {COOKING_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setActiveCookingType(type.id === activeCookingType ? 'all' : type.id)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeCookingType === type.id 
                          ? 'bg-(--primary) border-(--primary) text-(--primary-foreground) shadow-md shadow-(--primary)/20' 
                          : 'bg-(--primary)/5 border-(--primary)/10 text-(--primary) hover:bg-(--primary)/10'
                        }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-(--primary) animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-(--primary)">
                  {filteredIngredients.length} Results
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredIngredients.map((ing, idx) => (
                  <motion.div
                    key={ing.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                  >
                    <div className="relative h-[420px] flex flex-col group bg-(--background) border border-(--border) rounded-3xl p-6 hover:border-(--primary) transition-all overflow-hidden shadow-sm">
                      <div className="flex justify-between items-start mb-6 gap-4 shrink-0">
                        <div className="space-y-1 min-w-0 flex-1">
                          <h3 className="text-xl font-black text-(--foreground) tracking-tight group-hover:text-(--primary) transition-colors leading-tight whitespace-normal">{ing.name}</h3>
                          <Badge color="primary" className="text-[9px] uppercase tracking-widest">{CATEGORIES.find(c => c.id === ing.category)?.label}</Badge>
                        </div>
                        <button
                          onClick={() => handleToggleFavorite(ing.id)}
                          className={`p-3 rounded-2xl transition-all shrink-0 ${favorites.includes(ing.id)
                              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                              : 'bg-(--primary)/5 text-(--primary) hover:bg-red-500/10 hover:text-red-500'
                            }`}
                        >
                          <Heart size={18} fill={favorites.includes(ing.id) ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                        <div className="space-y-4">
                          <div className="text-[10px] font-black uppercase tracking-widest text-(--muted-foreground) flex items-center gap-2">
                            <RotateCcw size={12} /> Substitute Analysis
                          </div>
                          <div className="space-y-4">
                            {getFilteredSubstitutes(ing.substitutes, activeDietary, activeCookingType).map((sub, sIdx) => (
                              <div 
                                key={sIdx}
                                className="p-5 rounded-2xl bg-(--primary)/5 border border-(--primary)/10 hover:border-(--primary)/30 transition-all space-y-4 overflow-hidden relative"
                              >
                                <div className="flex flex-col gap-3">
                                  <div className="flex justify-between items-start gap-4">
                                    <h4 className="text-lg font-black text-(--foreground) leading-tight whitespace-normal flex-1">{sub.name}</h4>
                                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 whitespace-nowrap bg-(--primary)/10 text-(--primary) border border-(--primary)/20`}>
                                      {sub.suitability}
                                    </span>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                      {sub.ratio}
                                    </span>
                                    <span className="px-3 py-1 rounded-full bg-(--primary)/10 text-(--primary) text-[10px] font-black uppercase tracking-widest border border-(--primary)/20">
                                      {sub.similarity}% Match
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="relative pl-4 border-l-2 border-(--primary)/20">
                                  <p className="text-[12px] text-(--muted-foreground) leading-relaxed italic opacity-80">
                                    "{sub.notes}"
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-(--border) flex items-center justify-between shrink-0">
                        <div className="flex -space-x-2">
                          {ing.substitutes.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-(--primary)/10 border-2 border-(--background) flex items-center justify-center">
                              <ChefHat size={10} className="text-(--primary)" />
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => setSelectedIngredient(ing)}
                          className="text-[10px] font-black uppercase text-(--primary) flex items-center gap-1 hover:gap-2 transition-all"
                        >
                          View Guide <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedIngredient && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedIngredient(null)} className="absolute inset-0 bg-(--background)/80 backdrop-blur-xl" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-2xl bg-(--card) border border-(--border) rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-(--border) flex justify-between items-center bg-(--primary)/5">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-(--primary)/10 text-(--primary)">
                      <ChefHat size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-(--foreground) tracking-tight">{selectedIngredient.name}</h2>
                      <p className="text-xs font-bold text-(--primary) uppercase tracking-widest">Substitution Guide</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedIngredient(null)} className="p-3 rounded-2xl hover:bg-red-500/10 text-red-500 transition-all">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-(--background) border border-(--border) space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-(--primary)">
                        <Scale size={14} /> Measurement Logic
                      </div>
                      <p className="text-xs text-(--muted-foreground) leading-relaxed">
                        Live analysis of {selectedIngredient.name.toLowerCase()} shows that precise measurement is critical.
                      </p>
                    </div>
                    <div className="p-6 rounded-3xl bg-(--background) border border-(--border) space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-(--primary)">
                        <Flame size={14} /> Heat Stability
                      </div>
                      <p className="text-xs text-(--muted-foreground) leading-relaxed">
                        Substitutes are cross-referenced with your cooking mode.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-(--muted-foreground)">Detailed Substitution Options</h3>
                    <div className="space-y-4">
                      {selectedIngredient.substitutes.map((sub, i) => (
                        <div key={i} className="p-6 rounded-[2rem] bg-(--primary)/5 border border-(--primary)/10 space-y-4">
                          <div className="flex justify-between items-start">
                            <h4 className="text-lg font-black text-(--primary)">{sub.name}</h4>
                            <Badge color="primary">{sub.ratio}</Badge>
                          </div>
                          <p className="text-sm text-(--foreground) font-medium italic">"{sub.notes}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-(--primary) border-t border-(--primary) flex justify-between items-center text-(--primary-foreground)">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80">AI Recommendation Engine</p>
                  <button onClick={() => setSelectedIngredient(null)} className="px-6 py-3 rounded-xl bg-(--background) text-(--primary) text-xs font-black uppercase tracking-widest shadow-xl">
                    Got it
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { icon: Scale, title: "Live Ratios", desc: "Instantly calculated measurements for perfect texture." },
            { icon: Activity, title: "Global Logic", desc: "Real-time updates as you refine your culinary preferences." },
            { icon: ChefHat, title: "Standardized Context", desc: "Smart method analysis for heat stability and flavor integrity." }
          ].map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + (i * 0.1) }}
              className="flex items-start gap-4 p-6 rounded-[2rem] bg-(--card) border border-(--border) shadow-xl"
            >
              <div className="p-3 rounded-2xl bg-(--primary)/10 text-(--primary) shrink-0">
                <tip.icon size={24} />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h4 className="text-[11px] md:text-xs font-black text-(--foreground) uppercase tracking-wider leading-tight break-words">{tip.title}</h4>
                <p className="text-[11px] text-(--muted-foreground) leading-relaxed">{tip.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
