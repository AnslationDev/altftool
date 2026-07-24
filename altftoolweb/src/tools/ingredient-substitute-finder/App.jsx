import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Heart,
  ChevronRight,
  RotateCcw,
  ChefHat,
  Scale,
  Leaf,
  Flame,
  Activity,
  Sparkles,
  Clock,
  Milk,
  Cake,
  Candy,
  Carrot,
  Egg,
  GlassWater,
  Droplets,
  History,
  Info,
} from "lucide-react";
import {
  INGREDIENTS,
  CATEGORIES,
  DIETARY_FILTERS,
  COOKING_TYPES,
} from "./utils/ingredientDatabase";
import {
  searchIngredients,
  getFilteredSubstitutes,
  loadFavorites,
  saveFavorites,
} from "./utils/substituteHelpers";

const Badge = ({ children, tone = "primary", className = "" }) => {
  const tones = {
    primary:
      "border-[var(--primary)]/20 bg-[var(--primary)]/10 text-[var(--primary)]",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-500",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${tones[tone] || tones.primary} ${className}`}
    >
      {children}
    </span>
  );
};

export default function IngredientSubstituteFinder() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeDietary, setActiveDietary] = useState([]);
  const [activeCookingType, setActiveCookingType] = useState("all");
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setFavorites(loadFavorites());
    const saved = localStorage.getItem("ingredient_recent_searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    const timer = setTimeout(() => setIsTyping(false), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleToggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter((fav) => fav !== id)
      : [...favorites, id];

    setFavorites(updated);
    saveFavorites(updated);
  };

  const addToRecent = (term) => {
    if (!term || recentSearches.includes(term)) return;
    const updated = [term, ...recentSearches.slice(0, 4)];
    setRecentSearches(updated);
    localStorage.setItem("ingredient_recent_searches", JSON.stringify(updated));
  };

  const toggleDietary = (id) => {
    setActiveDietary((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setActiveDietary([]);
    setActiveCookingType("all");
  };

  const filteredIngredients = useMemo(() => {
    return searchIngredients(
      INGREDIENTS,
      searchTerm,
      selectedCategory,
      activeDietary,
      activeCookingType,
    );
  }, [searchTerm, selectedCategory, activeDietary, activeCookingType]);

  const getIcon = (iconName) => {
    const icons = {
      Milk,
      Cake,
      Candy,
      Droplets,
      Carrot,
      Egg,
      Leaf,
      GlassWater,
    };
    const IconComponent = icons[iconName] || ChefHat;
    return <IconComponent size={15} />;
  };

  const featuredIngredients = filteredIngredients.slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)] md:px-8 md:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--card),var(--background))] shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.2),_transparent_48%)]" />
          <div className="absolute right-[-8%] top-[-8%] h-40 w-40 rounded-full bg-[var(--primary)]/12 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--primary),var(--secondary))]" />
          <div className="relative grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6 p-6 sm:p-8 lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--primary)] shadow-sm">
                <Sparkles size={12} />
                Fresh swaps made simple
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl lg:text-5xl">
                  Discover the right ingredient swap in seconds.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-[var(--muted-foreground)] sm:text-base">
                  Search by ingredient, filter for dietary needs, and browse
                  reliable substitutes built for baking, sauces, desserts, and
                  everyday cooking.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={resetFilters}
                  className="rounded-full bg-[linear-gradient(135deg,var(--primary),var(--secondary))] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_8px_24px_rgba(20,184,166,0.18)] transition-all duration-200 hover:-translate-y-0.5"
                >
                  Browse all ingredients
                </button>
                <button
                  onClick={resetFilters}
                  className="rounded-full border border-[var(--border)] bg-[var(--background)]/90 px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-all duration-200 hover:border-[var(--primary)]/40 hover:bg-[var(--card)]"
                >
                  Reset filters
                </button>
              </div>
            </div>

            <div className="border-t border-[var(--border)] bg-[var(--background)]/70 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
              <div className="space-y-4 rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,rgba(59,130,246,0.08),rgba(219,39,119,0.05))] p-5 shadow-[0_20px_60px_rgba(59,130,246,0.08)]">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--foreground)]">
                  <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[linear-gradient(135deg,rgba(96,165,250,0.2),rgba(236,72,153,0.18))] text-[var(--primary)] shadow-sm">
                    <History size={14} />
                  </span>
                  Recently explored
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.length > 0 ? (
                    recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setSearchTerm(term)}
                        className="rounded-full border border-transparent bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md"
                      >
                        {term}
                      </button>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-[var(--border)] bg-white/90 px-4 py-3 text-sm text-[var(--muted-foreground)] shadow-sm">
                      Your recent searches will appear here.
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Popular picks
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Try these first
                    </p>
                  </div>
                  <Badge tone="success">Live</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Egg", "Butter", "Flour", "Milk"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setSearchTerm(item)}
                      className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--foreground)] transition-colors hover:border-[var(--primary)]/40"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="relative overflow-hidden rounded-[2rem]">
            <div className="pointer-events-none absolute -right-10 top-6 h-32 w-32 rounded-full bg-[var(--secondary)]/12 blur-3xl" />
            <div className="pointer-events-none absolute left-8 top-8 h-24 w-24 rounded-full bg-[var(--primary)]/12 blur-3xl" />
          </div>

          <div className="relative z-10 grid gap-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button className="relative flex items-center gap-2 rounded-[1.5rem] bg-white px-4 py-2 text-sm font-semibold shadow-sm">
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white">
                    <Sparkles size={12} />
                  </span>
                  Colorful filters
                  <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-1 w-14 rounded-full bg-[linear-gradient(90deg,var(--primary),var(--secondary))]" />
                </button>

                <button className="flex items-center gap-2 rounded-[1.5rem] bg-white px-4 py-2 text-sm font-semibold shadow-sm text-[var(--secondary)]">
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-[var(--secondary)]/20 text-[var(--secondary)]">
                    <Activity size={12} />
                  </span>
                  Fresh layout
                </button>

                <button className="flex items-center gap-2 rounded-[1.5rem] bg-white px-4 py-2 text-sm font-semibold shadow-sm text-[var(--foreground)]">
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-[var(--primary)]/6 text-[var(--primary)]">
                    <Search size={12} />
                  </span>
                  Smart search
                </button>
              </div>

              <div className="hidden lg:flex items-center">
                <div className="mr-4 rounded-full border border-[var(--border)] bg-[var(--background)] p-1 shadow-sm">
                  <button
                    onClick={resetFilters}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--background)]/95 p-6 shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
                <div className="mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[var(--primary)] shadow-sm">
                    <Search size={16} />
                  </span>
                  Categories
                </div>
                <div className="flex flex-wrap gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 rounded-[1.25rem] border px-4 py-2 text-sm font-semibold shadow transition-all duration-200 ${selectedCategory === cat.id ? "border-transparent bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-[var(--primary-foreground)] shadow-[0_10px_30px_rgba(20,184,166,0.12)]" : "border-[var(--border)] bg-white text-[var(--foreground)] hover:shadow-md"}`}
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-md bg-[var(--primary)]/6 text-[var(--primary)]">
                        {getIcon(cat.icon)}
                      </span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[2rem] border border-blue-200 bg-blue-50/60 p-5 shadow-[0_12px_40px_rgba(59,130,246,0.06)]">
                  <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-600">
                    <Leaf size={13} /> Dietary filters
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {DIETARY_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        onClick={() => toggleDietary(filter.id)}
                        className={`rounded-[1.25rem] border px-4 py-2 text-sm font-semibold transition-all duration-200 ${activeDietary.includes(filter.id) ? "border-transparent bg-blue-600 text-white shadow-[0_8px_30px_rgba(59,130,246,0.12)]" : "border-blue-100 bg-white text-blue-700 hover:bg-blue-50"}`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-amber-200 bg-amber-50/60 p-5 shadow-[0_12px_40px_rgba(245,158,11,0.06)]">
                  <div className="mb-4 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-600">
                    <Flame size={13} /> Cooking mode
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {COOKING_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() =>
                          setActiveCookingType(
                            type.id === activeCookingType ? "all" : type.id,
                          )
                        }
                        className={`rounded-[1.25rem] border px-4 py-2 text-sm font-semibold transition-all duration-200 ${activeCookingType === type.id ? "border-transparent bg-amber-600 text-white shadow-[0_8px_30px_rgba(245,158,11,0.12)]" : "border-amber-100 bg-white text-amber-700 hover:bg-amber-50"}`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Showing {filteredIngredients.length} ingredient options
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Curated for a clean, reliable swap guide.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
              <Clock size={14} />
              Updated live with your filters
            </div>
          </div>

          {filteredIngredients.length === 0 ? (
            <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-8 text-center shadow-[0_16px_50px_rgba(15,23,42,0.04)]">
              <p className="text-lg font-semibold text-[var(--foreground)]">
                No ingredients matched that combination yet.
              </p>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Try broadening your search or clearing a few filters.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              <AnimatePresence mode="popLayout">
                {filteredIngredients.map((ingredient) => {
                  const visibleSubstitutes = getFilteredSubstitutes(
                    ingredient.substitutes,
                    activeDietary,
                    activeCookingType,
                  );
                  const featuredSubstitute =
                    visibleSubstitutes[0] || ingredient.substitutes[0];

                  return (
                    <motion.article
                      key={ingredient.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12 }}
                      className="group relative overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--card),var(--background))] p-5 shadow-[0_16px_50px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--primary)]/30 hover:shadow-[0_20px_48px_rgba(15,23,42,0.08)]"
                    >
                      <div className="pointer-events-none absolute right-[-12%] top-0 h-32 w-32 rounded-full bg-[var(--primary)]/15 blur-3xl" />
                      <div className="pointer-events-none absolute left-0 -bottom-8 h-24 w-24 rounded-full bg-[var(--secondary)]/15 blur-3xl" />
                      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--primary),var(--secondary))]" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--primary)]">
                            <ChefHat size={12} />{" "}
                            {
                              CATEGORIES.find(
                                (cat) => cat.id === ingredient.category,
                              )?.label
                            }
                          </div>
                          <h2 className="text-xl font-semibold text-[var(--foreground)]">
                            {ingredient.name}
                          </h2>
                        </div>
                        <button
                          onClick={() => handleToggleFavorite(ingredient.id)}
                          className={`rounded-full p-2.5 transition-all duration-200 ${favorites.includes(ingredient.id) ? "bg-[linear-gradient(135deg,var(--primary),var(--secondary))] text-[var(--primary-foreground)] shadow-sm" : "bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--primary)]/10 hover:text-red-500"}`}
                        >
                          <Heart
                            size={17}
                            fill={
                              favorites.includes(ingredient.id)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                      </div>

                      <div className="mt-5 rounded-[1.25rem] border border-[var(--border)] bg-[var(--background)]/90 p-4 shadow-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="primary">Best swap</Badge>
                          <Badge tone="amber">
                            {featuredSubstitute.suitability}
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-base font-semibold text-[var(--foreground)]">
                              {featuredSubstitute.name}
                            </p>
                            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                              {featuredSubstitute.notes}
                            </p>
                          </div>
                          <div className="rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/10 px-3 py-1 text-sm font-semibold text-[var(--primary)]">
                            {featuredSubstitute.ratio}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {visibleSubstitutes.slice(0, 3).map((sub) => (
                          <span
                            key={`${ingredient.id}-${sub.name}`}
                            className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm text-[var(--foreground)]"
                          >
                            {sub.name}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                          <RotateCcw size={14} /> {visibleSubstitutes.length}{" "}
                          matching options
                        </div>
                        <button
                          onClick={() => setSelectedIngredient(ingredient)}
                          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] transition-colors hover:text-[var(--primary)]/80"
                        >
                          View guide <ChevronRight size={15} />
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Scale,
              title: "Precise ratios",
              desc: "Each substitute includes measurement guidance so your recipe stays balanced.",
            },
            {
              icon: Activity,
              title: "Flexible filtering",
              desc: "Refine swaps by dietary needs, cooking method, and ingredient category.",
            },
            {
              icon: Sparkles,
              title: "Elegant browsing",
              desc: "A calmer, more readable experience that feels closer to modern recipe tools.",
            },
          ].map((tip) => (
            <div
              key={tip.title}
              className="relative overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--card),var(--surface-soft))] p-5 shadow-[0_16px_50px_rgba(15,23,42,0.04)] transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--primary),var(--secondary))]" />
              <div className="rounded-2xl bg-[linear-gradient(135deg,var(--primary),var(--secondary))] p-3 text-[var(--primary-foreground)]">
                <tip.icon size={20} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[var(--foreground)]">
                {tip.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                {tip.desc}
              </p>
            </div>
          ))}
        </section>
      </div>

      <AnimatePresence>
        {selectedIngredient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/80 px-4 py-6 backdrop-blur-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(135deg,var(--card),var(--background))] shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
            >
              <div className="flex items-start justify-between border-b border-[var(--border)] bg-[var(--background)]/80 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[var(--primary)]/10 p-3 text-[var(--primary)]">
                    <ChefHat size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[var(--foreground)]">
                      {selectedIngredient.name}
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Substitution guide
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedIngredient(null)}
                  className="rounded-full border border-[var(--border)] bg-[var(--background)] p-2 text-[var(--muted-foreground)]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--background)] p-4">
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--primary)]">
                      <Scale size={13} /> Measurement notes
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                      Swap ratios stay consistent with the ingredient’s
                      structure, texture, and recipe intent.
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--background)] p-4">
                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--primary)]">
                      <Flame size={13} /> Cooking context
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                      Match your selected cooking mode to find the most suitable
                      replacement for your recipe.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {selectedIngredient.substitutes.map((substitute) => (
                    <div
                      key={`${selectedIngredient.id}-${substitute.name}`}
                      className="rounded-[1.25rem] border border-[var(--border)] bg-[var(--background)]/90 p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-base font-semibold text-[var(--foreground)]">
                          {substitute.name}
                        </h3>
                        <Badge tone="primary">{substitute.ratio}</Badge>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-[var(--muted-foreground)]">
                        {substitute.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[var(--border)] bg-[var(--background)]/80 p-6">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Use these swaps as a starting point and adjust for flavor
                    profile.
                  </p>
                  <button
                    onClick={() => setSelectedIngredient(null)}
                    className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
