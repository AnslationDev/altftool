"use client";

import { useState } from "react";
import { Apple, Leaf, Fish, Droplets, Coffee, Flame, RefreshCcw, Activity } from "lucide-react";

export default function NutritionQualityScore() {
  const [formData, setFormData] = useState({
    vegetables: 2,
    fruits: 2,
    fish: 1,
    nuts: 1,
    water: 4,
    sugaryDrinks: 1,
    fastFood: 1
  });

  const [score, setScore] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const calculateScore = () => {
    let points = 0;

    // Positives
    points += Math.min(formData.vegetables, 5) * 5; // max 25
    points += Math.min(formData.fruits, 4) * 5;     // max 20
    points += Math.min(formData.fish, 4) * 5;       // max 20
    points += Math.min(formData.nuts, 2) * 5;       // max 10
    points += Math.min(formData.water, 8) * 2;      // max 16

    // Negatives (Subtract from 100 base)
    points -= formData.sugaryDrinks * 10;
    points -= formData.fastFood * 8;

    const finalScore = Math.max(0, Math.min(100, Math.round(points + 10))); // +10 base buffer

    let grade, tone;
    if (finalScore >= 85) {
      grade = "Excellent";
      tone = "good";
    } else if (finalScore >= 70) {
      grade = "Good";
      tone = "good";
    } else if (finalScore >= 50) {
      grade = "Average";
      tone = "warn";
    } else {
      grade = "Needs Improvement";
      tone = "bad";
    }

    setScore({ value: finalScore, grade, tone });
  };

  const resetForm = () => {
    setScore(null);
    setFormData({
      vegetables: 2,
      fruits: 2,
      fish: 1,
      nuts: 1,
      water: 4,
      sugaryDrinks: 1,
      fastFood: 1
    });
  };

  return (
    <div className="bg-[var(--background)] min-h-screen text-[var(--foreground)] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10">
            <Apple className="h-8 w-8 text-rose-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[var(--foreground)]">
            Nutrition Quality Score
          </h1>
          <p className="mt-4 text-lg text-[var(--muted-foreground)]">
            Assess the cognitive quality of your diet based on neuro-protective foods.
          </p>
        </header>

        {!score ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="space-y-6">

              <div className="space-y-3">
                <label className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
                  <Leaf className="w-5 h-5 text-emerald-500" />
                  Daily servings of Vegetables
                </label>
                <div className="flex items-center gap-4">
                  <input type="range" name="vegetables" min="0" max="10" value={formData.vegetables} onChange={handleChange} className="w-full accent-emerald-500" />
                  <span className="w-8 text-center font-bold">{formData.vegetables}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
                  <Apple className="w-5 h-5 text-rose-500" />
                  Daily servings of Fruits
                </label>
                <div className="flex items-center gap-4">
                  <input type="range" name="fruits" min="0" max="10" value={formData.fruits} onChange={handleChange} className="w-full accent-rose-500" />
                  <span className="w-8 text-center font-bold">{formData.fruits}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
                  <Fish className="w-5 h-5 text-blue-500" />
                  Weekly servings of Fish/Seafood
                </label>
                <div className="flex items-center gap-4">
                  <input type="range" name="fish" min="0" max="7" value={formData.fish} onChange={handleChange} className="w-full accent-blue-500" />
                  <span className="w-8 text-center font-bold">{formData.fish}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
                  <Activity className="w-5 h-5 text-amber-500" />
                  Daily servings of Nuts/Seeds
                </label>
                <div className="flex items-center gap-4">
                  <input type="range" name="nuts" min="0" max="5" value={formData.nuts} onChange={handleChange} className="w-full accent-amber-500" />
                  <span className="w-8 text-center font-bold">{formData.nuts}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
                  <Droplets className="w-5 h-5 text-cyan-500" />
                  Daily glasses of Water
                </label>
                <div className="flex items-center gap-4">
                  <input type="range" name="water" min="0" max="15" value={formData.water} onChange={handleChange} className="w-full accent-cyan-500" />
                  <span className="w-8 text-center font-bold">{formData.water}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                <label className="flex items-center gap-2 font-semibold text-rose-500">
                  <Coffee className="w-5 h-5" />
                  Daily Sugary Drinks (Sodas, Juices)
                </label>
                <div className="flex items-center gap-4">
                  <input type="range" name="sugaryDrinks" min="0" max="10" value={formData.sugaryDrinks} onChange={handleChange} className="w-full accent-rose-500" />
                  <span className="w-8 text-center font-bold">{formData.sugaryDrinks}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 font-semibold text-rose-500">
                  <Flame className="w-5 h-5" />
                  Weekly Fast Food / Fried Meals
                </label>
                <div className="flex items-center gap-4">
                  <input type="range" name="fastFood" min="0" max="14" value={formData.fastFood} onChange={handleChange} className="w-full accent-rose-500" />
                  <span className="w-8 text-center font-bold">{formData.fastFood}</span>
                </div>
              </div>

            </div>

            <button onClick={calculateScore} className="btn-primary w-full mt-8 py-4 rounded-xl text-lg font-bold">
              Calculate Score
            </button>
          </div>
        ) : (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8 text-center shadow-md animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-extrabold text-[var(--foreground)] mb-2">Your Nutrition Score</h2>

            <div className={`mx-auto my-8 flex h-40 w-40 items-center justify-center rounded-full border-8 ${
              score.tone === 'good' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' :
              score.tone === 'warn' ? 'border-amber-500 bg-amber-500/10 text-amber-500' :
              'border-rose-500 bg-rose-500/10 text-rose-500'
            }`}>
              <span className="text-6xl font-black">{score.value}</span>
            </div>

            <p className="text-2xl font-bold mb-4">{score.grade}</p>

            <p className="text-[var(--muted-foreground)] mb-8 max-w-md mx-auto">
              {score.tone === 'good' && "Great job! Your diet is highly neuro-protective, supporting cognitive function and long-term brain health."}
              {score.tone === 'warn' && "You're doing okay, but adding more brain-boosting foods like fish, nuts, and greens could improve your score."}
              {score.tone === 'bad' && "Your current diet may be hindering your cognitive performance. Try reducing processed foods and adding more whole foods."}
            </p>

            <button onClick={resetForm} className="btn-secondary px-8 py-3 rounded-xl inline-flex items-center gap-2">
              <RefreshCcw className="w-4 h-4" /> Recalculate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
