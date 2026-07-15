import { motion, AnimatePresence } from "framer-motion";
import { Button, Card } from "@altftool/ui";
import { Shuffle, Heart, Clock, Star, UtensilsCrossed } from "lucide-react";
import { CUISINES, BUDGET_OPTIONS, MEAL_TYPES } from "../utils/data";

export default function LunchPicker({ filters, setFilters, filtered, selected, animating, recent, favorites, onPick, onToggleFavorite }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider mb-3">Filters</h4>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-(--foreground) mb-1.5">Cuisine</p>
              <div className="flex flex-wrap gap-1.5">
                {CUISINES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setFilters((f) => ({ ...f, cuisine: f.cuisine === c.id ? "" : c.id }))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                      filters.cuisine === c.id
                        ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                        : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--border-strong)"
                    }`}
                  >
                    {c.emoji} {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-(--foreground) mb-1.5">Budget</p>
              <div className="flex gap-1.5">
                {BUDGET_OPTIONS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setFilters((f) => ({ ...f, budget: f.budget === b.id ? "" : b.id }))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                      filters.budget === b.id
                        ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                        : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--border-strong)"
                    }`}
                  >
                    {b.icon} {b.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-(--foreground) mb-1.5">Type</p>
              <div className="flex flex-wrap gap-1.5">
                {MEAL_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilters((f) => ({ ...f, type: f.type === t.id ? "" : t.id }))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition ${
                      filters.type === t.id
                        ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                        : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--border-strong)"
                    }`}
                  >
                    {t.icon} {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="p-4 text-center">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected.name}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="space-y-2"
                >
                  <UtensilsCrossed size="32" className="mx-auto text-(--primary)" />
                  <h3 className="text-lg font-bold text-(--foreground)">{selected.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-sm text-(--muted-foreground)">
                    <span>{CUISINES.find((c) => c.id === selected.cuisine)?.emoji}</span>
                    <span className="capitalize">{selected.cuisine}</span>
                    <span>•</span>
                    <span className="capitalize">{selected.type}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Star size="12" className="text-amber-400" />{selected.rating}</span>
                  </div>
                  <button
                    onClick={() => onToggleFavorite(selected)}
                    className="text-(--muted-foreground) hover:text-(--danger) transition"
                  >
                    <Heart size="16" className={favorites.find((f) => f.name === selected.name) ? "fill-(--danger) text-(--danger)" : ""} />
                  </button>
                </motion.div>
              ) : (
                <div className="py-6 text-(--muted-foreground)">
                  <Shuffle size="32" className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Pick a lunch spot!</p>
                  <p className="text-xs mt-1">{filtered.length} options available</p>
                </div>
              )}
            </AnimatePresence>
          </Card>

          <Button variant="primary" size="lg" className="w-full h-12 text-sm font-bold" onClick={onPick} disabled={filtered.length === 0 || animating}>
            {animating ? "Choosing..." : "Pick Lunch!"}
          </Button>

          {recent.length > 0 && (
            <Card className="p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock size="14" className="text-(--muted-foreground)" />
                <span className="text-xs font-semibold text-(--foreground)">Recent Picks</span>
              </div>
              <div className="space-y-1">
                {recent.slice(0, 5).map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-(--foreground)">{r.name}</span>
                    <span className="text-xs text-(--muted-foreground)">{new Date(r.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
