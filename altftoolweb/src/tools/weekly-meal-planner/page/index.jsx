"use client";

import { useMemo, useState } from "react";
import Header from "../components/Header";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MEAL_BANK = {
  standard: {
    breakfast: ["Oats + banana + milk", "Egg toast + fruit", "Greek yogurt bowl", "Peanut butter sandwich"],
    lunch: ["Rice + dal + salad", "Chicken bowl + veggies", "Paneer wrap + curd", "Quinoa + beans"],
    dinner: ["Grilled fish + veggies", "Roti + sabzi + curd", "Tofu stir-fry", "Lentil soup + bread"],
    snack: ["Nuts mix", "Fruit + seeds", "Protein shake", "Roasted chana"],
  },
  vegetarian: {
    breakfast: ["Poha + peanuts", "Oats + chia + berries", "Paneer sandwich", "Upma + curd"],
    lunch: ["Rajma rice + salad", "Khichdi + curd", "Paneer bowl + veggies", "Chickpea wrap"],
    dinner: ["Roti + dal + sabzi", "Tofu curry + rice", "Vegetable stew", "Quinoa pulao"],
    snack: ["Sprouts bowl", "Fruit + nuts", "Yogurt + honey", "Roasted makhana"],
  },
  "high-protein": {
    breakfast: ["Egg white omelette + oats", "Protein smoothie", "Greek yogurt + granola", "Paneer bhurji toast"],
    lunch: ["Chicken breast + rice", "Tofu + quinoa bowl", "Dal + paneer + roti", "Tuna salad wrap"],
    dinner: ["Grilled chicken + greens", "Paneer tikka + salad", "Fish + sweet potato", "Lentil pasta bowl"],
    snack: ["Protein shake", "Boiled eggs", "Cottage cheese cup", "Peanut yogurt bowl"],
  },
};

const GOAL_TARGETS = {
  "fat-loss": { calories: 1800, protein: 130, carbs: 170, fats: 60 },
  maintain: { calories: 2200, protein: 120, carbs: 240, fats: 75 },
  "muscle-gain": { calories: 2700, protein: 160, carbs: 320, fats: 85 },
};

const GROCERY_META = {
  Oats: { cat: "Grains", cost: 80 }, Banana: { cat: "Produce", cost: 60 }, Milk: { cat: "Dairy", cost: 70 },
  Eggs: { cat: "Protein", cost: 90 }, Bread: { cat: "Bakery", cost: 50 }, Fruit: { cat: "Produce", cost: 120 },
  "Greek yogurt": { cat: "Dairy", cost: 110 }, Berries: { cat: "Produce", cost: 150 }, Seeds: { cat: "Pantry", cost: 70 },
  "Peanut butter": { cat: "Pantry", cost: 140 }, Rice: { cat: "Grains", cost: 90 }, Lentils: { cat: "Pantry", cost: 80 },
  "Salad vegetables": { cat: "Produce", cost: 100 }, Chicken: { cat: "Protein", cost: 220 }, "Mixed vegetables": { cat: "Produce", cost: 120 },
  Paneer: { cat: "Protein", cost: 140 }, Wraps: { cat: "Bakery", cost: 60 }, Curd: { cat: "Dairy", cost: 70 },
  Quinoa: { cat: "Grains", cost: 220 }, Beans: { cat: "Pantry", cost: 100 }, Fish: { cat: "Protein", cost: 280 },
  Flour: { cat: "Grains", cost: 60 }, Tofu: { cat: "Protein", cost: 140 }, "Bell pepper": { cat: "Produce", cost: 60 },
  "Soy sauce": { cat: "Pantry", cost: 90 },
};

function generatePlan({ diet, mealCount }) {
  const bank = MEAL_BANK[diet] || MEAL_BANK.standard;
  return DAY_NAMES.map((day, idx) => {
    const breakfast = bank.breakfast[idx % bank.breakfast.length];
    const lunch = bank.lunch[idx % bank.lunch.length];
    const dinner = bank.dinner[idx % bank.dinner.length];
    const snack = bank.snack[idx % bank.snack.length];
    return mealCount === "3" ? { day, breakfast, lunch, dinner } : { day, breakfast, lunch, dinner, snack };
  });
}

function ingredientItems(meal) {
  const map = {
    "Oats + banana + milk": ["Oats", "Banana", "Milk"],
    "Egg toast + fruit": ["Eggs", "Bread", "Fruit"],
    "Greek yogurt bowl": ["Greek yogurt", "Berries", "Seeds"],
    "Peanut butter sandwich": ["Bread", "Peanut butter"],
    "Rice + dal + salad": ["Rice", "Lentils", "Salad vegetables"],
    "Chicken bowl + veggies": ["Chicken", "Rice", "Mixed vegetables"],
    "Paneer wrap + curd": ["Paneer", "Wraps", "Curd"],
    "Quinoa + beans": ["Quinoa", "Beans"],
    "Grilled fish + veggies": ["Fish", "Mixed vegetables"],
    "Roti + sabzi + curd": ["Flour", "Mixed vegetables", "Curd"],
    "Tofu stir-fry": ["Tofu", "Bell pepper", "Soy sauce"],
    "Lentil soup + bread": ["Lentils", "Bread"],
  };
  return map[meal] || [meal];
}

function buildGrocery(plan, people) {
  const units = Math.max(1, Number(people) || 1);
  const map = new Map();
  plan.forEach((d) => {
    Object.entries(d).forEach(([k, meal]) => {
      if (k === "day") return;
      ingredientItems(meal).forEach((item) => map.set(item, (map.get(item) || 0) + units));
    });
  });
  const rows = Array.from(map.entries()).map(([item, qty]) => {
    const meta = GROCERY_META[item] || { cat: "Other", cost: 100 };
    return { item, qty, category: meta.cat, estCost: qty * meta.cost };
  });
  const grouped = rows.reduce((acc, row) => {
    acc[row.category] = acc[row.category] || [];
    acc[row.category].push(row);
    return acc;
  }, {});
  return { rows, grouped };
}

export default function ToolHome() {
  const [goal, setGoal] = useState("maintain");
  const [diet, setDiet] = useState("standard");
  const [mealCount, setMealCount] = useState("4");
  const [people, setPeople] = useState("1");
  const [prepDays, setPrepDays] = useState("2");
  const [waterPerDay, setWaterPerDay] = useState("3.0");
  const [budgetLimit, setBudgetLimit] = useState("0");
  const [mealTarget, setMealTarget] = useState({ breakfast: "25", lunch: "30", dinner: "30", snack: "15" });
  const [generated, setGenerated] = useState(false);
  const [editablePlan, setEditablePlan] = useState([]);

  const weeklyPlan = useMemo(() => generatePlan({ diet, mealCount }), [diet, mealCount]);
  const finalPlan = editablePlan.length ? editablePlan : weeklyPlan;
  const groceryPack = useMemo(() => buildGrocery(finalPlan, people), [finalPlan, people]);

  const nutrition = useMemo(() => {
    const base = GOAL_TARGETS[goal] || GOAL_TARGETS.maintain;
    const p = Math.max(1, Number(people) || 1);
    const dailyCalories = base.calories * p;
    const b = Number(mealTarget.breakfast || 0) / 100;
    const l = Number(mealTarget.lunch || 0) / 100;
    const d = Number(mealTarget.dinner || 0) / 100;
    const s = Number(mealTarget.snack || 0) / 100;
    const groceryCost = groceryPack.rows.reduce((a, r) => a + r.estCost, 0);
    const budget = Number(budgetLimit || 0);
    const adherenceScore = Math.max(0, 100 - Math.abs(100 - Math.round((b + l + d + s) * 100)) - (budget > 0 && groceryCost > budget ? 20 : 0));
    return {
      calories: base.calories * 7 * p,
      protein: base.protein * 7 * p,
      carbs: base.carbs * 7 * p,
      fats: base.fats * 7 * p,
      perMealCalories: { breakfast: Math.round(dailyCalories * b), lunch: Math.round(dailyCalories * l), dinner: Math.round(dailyCalories * d), snack: Math.round(dailyCalories * s) },
      targetSplitTotal: Math.round((b + l + d + s) * 100),
      weeklyHydration: (Number(waterPerDay || 0) * 7 * p).toFixed(1),
      groceryCost,
      budgetStatus: budget > 0 ? (groceryCost <= budget ? "Within Budget" : "Over Budget") : "No Budget Set",
      adherenceScore,
    };
  }, [goal, people, mealTarget, waterPerDay, groceryPack, budgetLimit]);

  const nextSteps = useMemo(
    () => [
      `Prep on ${prepDays} day(s) weekly with batch proteins and grains.`,
      "Buy groceries category-wise to reduce shopping time.",
      "Follow per-meal calorie targets and keep substitutions equivalent.",
      "Review budget and adherence score every Sunday for adjustments.",
    ],
    [prepDays]
  );

  const applyPlan = () => {
    setEditablePlan(weeklyPlan);
    setGenerated(true);
  };

  const updateMeal = (dayIdx, key, value) => {
    setEditablePlan((prev) => prev.map((d, i) => (i === dayIdx ? { ...d, [key]: value } : d)));
  };

  const exportJSON = () => {
    const payload = { generatedAt: new Date().toISOString(), goal, diet, mealCount, people, prepDays, waterPerDay, budgetLimit, mealTarget, nutrition, weeklyPlan: finalPlan, grocery: groceryPack.rows, nextSteps };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weekly-meal-plan.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-4 py-6 wmp-shell">
      <div className="max-w-6xl mx-auto">
        <Header />

        <div className="rounded-2xl wmp-main-card overflow-hidden">
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold wmp-title-band">Plan Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select value={goal} onChange={(e) => setGoal(e.target.value)} className="px-3 py-2 wmp-field"><option value="fat-loss">Fat Loss</option><option value="maintain">Maintain</option><option value="muscle-gain">Muscle Gain</option></select>
              <select value={diet} onChange={(e) => setDiet(e.target.value)} className="px-3 py-2 wmp-field"><option value="standard">Standard</option><option value="vegetarian">Vegetarian</option><option value="high-protein">High Protein</option></select>
              <select value={mealCount} onChange={(e) => setMealCount(e.target.value)} className="px-3 py-2 wmp-field"><option value="3">3 Meals / Day</option><option value="4">4 Meals / Day (with snack)</option></select>
              <input value={people} onChange={(e) => setPeople(e.target.value)} placeholder="No. of people" className="px-3 py-2 wmp-field" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input value={prepDays} onChange={(e) => setPrepDays(e.target.value)} placeholder="Prep days / week" className="px-3 py-2 wmp-field" />
              <input value={waterPerDay} onChange={(e) => setWaterPerDay(e.target.value)} placeholder="Water per day (L)" className="px-3 py-2 wmp-field" />
              <input value={budgetLimit} onChange={(e) => setBudgetLimit(e.target.value)} placeholder="Weekly budget limit" className="px-3 py-2 wmp-field" />
            </div>

            <div className="rounded-xl wmp-panel p-4">
              <h3 className="font-semibold mb-3">Per-Meal Calorie Target Split (%)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input value={mealTarget.breakfast} onChange={(e) => setMealTarget((p) => ({ ...p, breakfast: e.target.value }))} placeholder="Breakfast %" className="px-3 py-2 wmp-field" />
                <input value={mealTarget.lunch} onChange={(e) => setMealTarget((p) => ({ ...p, lunch: e.target.value }))} placeholder="Lunch %" className="px-3 py-2 wmp-field" />
                <input value={mealTarget.dinner} onChange={(e) => setMealTarget((p) => ({ ...p, dinner: e.target.value }))} placeholder="Dinner %" className="px-3 py-2 wmp-field" />
                <input value={mealTarget.snack} onChange={(e) => setMealTarget((p) => ({ ...p, snack: e.target.value }))} placeholder="Snack %" className="px-3 py-2 wmp-field" />
              </div>
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <span className="px-2 py-1 wmp-chip">Split Total: {nutrition.targetSplitTotal}%</span>
                <span className="px-2 py-1 wmp-chip">Adherence Score: {nutrition.adherenceScore}/100</span>
                <span className="px-2 py-1 wmp-chip">Budget: {nutrition.budgetStatus}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={applyPlan} className="px-5 py-3 rounded-xl font-bold wmp-btn-primary">Generate Weekly Meal Plan</button>
              {generated && <button onClick={exportJSON} className="px-5 py-3 rounded-xl font-semibold wmp-btn-secondary">Export JSON</button>}
              {generated && <button onClick={() => window.print()} className="px-5 py-3 rounded-xl font-semibold wmp-btn-secondary">Print / PDF</button>}
            </div>

            {generated && (
              <div className="space-y-6 border-t border-(--border) pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="wmp-stat-card p-4"><p className="text-xs uppercase text-(--muted-foreground)">Weekly Calories</p><p className="text-2xl font-bold">{nutrition.calories}</p></div>
                <div className="wmp-stat-card p-4"><p className="text-xs uppercase text-(--muted-foreground)">Protein (g)</p><p className="text-2xl font-bold">{nutrition.protein}</p></div>
                <div className="wmp-stat-card p-4"><p className="text-xs uppercase text-(--muted-foreground)">Carbs (g)</p><p className="text-2xl font-bold">{nutrition.carbs}</p></div>
                <div className="wmp-stat-card p-4"><p className="text-xs uppercase text-(--muted-foreground)">Fats (g)</p><p className="text-2xl font-bold">{nutrition.fats}</p></div>
                <div className="wmp-stat-card p-4"><p className="text-xs uppercase text-(--muted-foreground)">Hydration (L/week)</p><p className="text-2xl font-bold">{nutrition.weeklyHydration}</p></div>
              </div>

              <div className="rounded-xl wmp-panel p-4">
                <h3 className="font-semibold mb-3 wmp-title-band">Weekly Schedule (Editable)</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm wmp-table">
                      <thead><tr className="text-left border-b border-(--border)"><th className="py-2">Day</th><th className="py-2">Breakfast ({nutrition.perMealCalories.breakfast} kcal)</th><th className="py-2">Lunch ({nutrition.perMealCalories.lunch} kcal)</th><th className="py-2">Dinner ({nutrition.perMealCalories.dinner} kcal)</th>{mealCount === "4" && <th className="py-2">Snack ({nutrition.perMealCalories.snack} kcal)</th>}</tr></thead>
                      <tbody>
                        {finalPlan.map((d, i) => (
                          <tr key={d.day} className="border-b border-(--border)">
                            <td className="py-2 font-medium">{d.day}</td>
                            <td className="py-2"><input value={d.breakfast} onChange={(e) => updateMeal(i, "breakfast", e.target.value)} className="w-full px-2 py-1 wmp-field" /></td>
                            <td className="py-2"><input value={d.lunch} onChange={(e) => updateMeal(i, "lunch", e.target.value)} className="w-full px-2 py-1 wmp-field" /></td>
                            <td className="py-2"><input value={d.dinner} onChange={(e) => updateMeal(i, "dinner", e.target.value)} className="w-full px-2 py-1 wmp-field" /></td>
                            {mealCount === "4" && <td className="py-2"><input value={d.snack || ""} onChange={(e) => updateMeal(i, "snack", e.target.value)} className="w-full px-2 py-1 wmp-field" /></td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-xl wmp-panel p-4">
                    <h3 className="font-semibold mb-2 wmp-title-band">Grocery List by Category (Est. Cost Rs {nutrition.groceryCost.toFixed(0)})</h3>
                    <div className="space-y-2 text-sm">
                      {Object.entries(groceryPack.grouped).map(([cat, rows]) => (
                        <div key={cat}>
                          <p className="font-semibold text-(--primary)">{cat}</p>
                          {rows.map((g) => <p key={g.item}>- {g.item} x {g.qty} (Rs {g.estCost.toFixed(0)})</p>)}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl wmp-panel p-4">
                    <h3 className="font-semibold mb-2 wmp-title-band">Clear Next Steps</h3>
                    <div className="space-y-1 text-sm">{nextSteps.map((s) => <p key={s}>- {s}</p>)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <HowItWorks />
        <Features />
      </div>
    </div>
  );
}
