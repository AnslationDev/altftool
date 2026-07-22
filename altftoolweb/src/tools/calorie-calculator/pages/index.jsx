"use client";

import React, { useState } from "react";
import { Card, Button, Input, Select, Field, StatCard } from "@altftool/ui";

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENTS = {
  lose_fast: -500,
  lose_slow: -250,
  maintain: 0,
  gain_slow: 250,
  gain_fast: 500,
};

export default function CalorieCalculatorHome() {
  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    height: "",
    weight: "",
    activity: "sedentary",
    goal: "maintain",
  });

  const [result, setResult] = useState(null);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const calculate = (e) => {
    e.preventDefault();
    const { age, gender, height, weight, activity, goal } = formData;

    if (!age || !height || !weight) return;

    // Mifflin-St Jeor Equation
    let bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age);
    bmr += gender === "male" ? 5 : -161;

    const tdee = bmr * ACTIVITY_MULTIPLIERS[activity];
    const targetCalories = Math.round(tdee + GOAL_ADJUSTMENTS[goal]);

    // Macros: 40% Carbs, 30% Protein, 30% Fats (General Split)
    const proteinCals = targetCalories * 0.3;
    const fatCals = targetCalories * 0.3;
    const carbCals = targetCalories * 0.4;

    const macros = {
      protein: Math.round(proteinCals / 4), // 4 cals per gram
      fats: Math.round(fatCals / 9),        // 9 cals per gram
      carbs: Math.round(carbCals / 4),      // 4 cals per gram
    };

    setResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories,
      macros
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-(--foreground)">Calorie & Macro Calculator</h1>
        <p className="text-(--muted-foreground)">Calculate your daily energy expenditure and optimal macro split.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6 h-fit">
          <form onSubmit={calculate} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Age">
                <Input type="number" min="1" value={formData.age} onChange={handleChange("age")} required className="min-h-[48px]" />
              </Field>
              <Field label="Gender">
                <Select value={formData.gender} onChange={handleChange("gender")} className="min-h-[48px]">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Height (cm)">
                <Input type="number" min="50" value={formData.height} onChange={handleChange("height")} required className="min-h-[48px]" />
              </Field>
              <Field label="Weight (kg)">
                <Input type="number" min="20" value={formData.weight} onChange={handleChange("weight")} required className="min-h-[48px]" />
              </Field>
            </div>

            <Field label="Activity Level">
              <Select value={formData.activity} onChange={handleChange("activity")} className="min-h-[48px]">
                <option value="sedentary">Sedentary (Little or no exercise)</option>
                <option value="light">Lightly Active (1-3 days/week)</option>
                <option value="moderate">Moderately Active (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very Active (Physical job or 2x training)</option>
              </Select>
            </Field>

            <Field label="Your Goal">
              <Select value={formData.goal} onChange={handleChange("goal")} className="min-h-[48px]">
                <option value="lose_fast">Aggressive Weight Loss (-500 kcal)</option>
                <option value="lose_slow">Moderate Weight Loss (-250 kcal)</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain_slow">Lean Muscle Gain (+250 kcal)</option>
                <option value="gain_fast">Aggressive Weight Gain (+500 kcal)</option>
              </Select>
            </Field>

            <Button type="submit" variant="primary" className="w-full min-h-[56px] text-lg">Calculate Macros</Button>
          </form>
        </Card>

        <div className="space-y-6">
          {!result ? (
            <Card className="p-8 text-center flex flex-col items-center justify-center h-full bg-(--muted) border-dashed">
              <p className="text-(--muted-foreground)">Enter your details to see your personalized calorie and macro breakdown.</p>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <Card className="p-6 text-center border-teal-500 border-2 shadow-lg">
                <h3 className="text-lg font-bold text-(--muted-foreground) mb-2 uppercase tracking-wide">Daily Target</h3>
                <span className="text-5xl font-black text-(--foreground)">{result.targetCalories} <span className="text-xl font-normal text-(--muted-foreground)">kcal</span></span>
                <p className="mt-4 text-sm text-(--muted-foreground)">Your BMR is {result.bmr} kcal and TDEE is {result.tdee} kcal.</p>
              </Card>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-(--card) p-4 rounded-xl border border-(--border) text-center">
                  <div className="text-sm font-semibold text-(--muted-foreground) mb-1">Protein</div>
                  <div className="text-2xl font-bold text-blue-500">{result.macros.protein}g</div>
                  <div className="text-xs text-(--muted-foreground) mt-1">30%</div>
                </div>
                <div className="bg-(--card) p-4 rounded-xl border border-(--border) text-center">
                  <div className="text-sm font-semibold text-(--muted-foreground) mb-1">Carbs</div>
                  <div className="text-2xl font-bold text-amber-500">{result.macros.carbs}g</div>
                  <div className="text-xs text-(--muted-foreground) mt-1">40%</div>
                </div>
                <div className="bg-(--card) p-4 rounded-xl border border-(--border) text-center">
                  <div className="text-sm font-semibold text-(--muted-foreground) mb-1">Fats</div>
                  <div className="text-2xl font-bold text-rose-500">{result.macros.fats}g</div>
                  <div className="text-xs text-(--muted-foreground) mt-1">30%</div>
                </div>
              </div>

              {/* CSS Pie Chart for Macros */}
              <Card className="p-6 flex flex-col items-center">
                <h3 className="font-bold mb-6">Macro Distribution</h3>
                <div
                  className="w-48 h-48 rounded-full shadow-inner"
                  style={{
                    background: `conic-gradient(
                      #3b82f6 0% 30%,
                      #f59e0b 30% 70%,
                      #f43f5e 70% 100%
                    )`
                  }}
                ></div>
                <div className="flex gap-4 mt-6 text-sm">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Protein</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Carbs</div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Fats</div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
