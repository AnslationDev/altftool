"use client";
import { useMemo, useState } from "react";
import Description from "../components/Description";

function calculateBmr({ sex, weightKg, heightCm, age, formula, bodyFat }) {
  if (formula === "katch" && bodyFat) {
    const lbm = weightKg * (1 - bodyFat / 100);
    return 370 + 21.6 * lbm;
  }
  if (formula === "harris") {
    if (sex === "female") return 655.1 + 9.563 * weightKg + 1.85 * heightCm - 4.676 * age;
    return 66.47 + 13.75 * weightKg + 5.003 * heightCm - 6.755 * age;
  }
  // Mifflin-St Jeor (Default)
  if (sex === "female") return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
}

function getActivityMultiplier(level) {
  const map = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9,
  };
  return map[level] || 1.2;
}

export default function ToolHome() {
  const [age, setAge] = useState("25");
  const [sex, setSex] = useState("male");
  const [weight, setWeight] = useState("70");
  const [height, setHeight] = useState("170");
  const [bodyFat, setBodyFat] = useState("");
  const [formula, setFormula] = useState("mifflin");
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState("maintain");
  const [split, setSplit] = useState("balanced");
  const [submitted, setSubmitted] = useState(false);

  const validationError = useMemo(() => {
    const ageNum = Number(age);
    const weightKg = Number(weight);
    const heightCm = Number(height);
    const bfNum = Number(bodyFat);

    if (age.trim() === "" || weight.trim() === "" || height.trim() === "") {
      return "Enter your age, weight, and height to calculate your macros.";
    }
    if (!(ageNum > 0) || !(weightKg > 0) || !(heightCm > 0)) {
      return "Age, weight, and height must be positive numbers.";
    }
    if (bodyFat.trim() !== "" && !(bfNum > 0)) {
      return "Body fat % must be a positive number.";
    }
    if (formula === "katch" && !(bfNum > 0)) {
      return "Enter your body fat % to use the Katch-McArdle formula.";
    }
    return "";
  }, [age, weight, height, bodyFat, formula]);

  const result = useMemo(() => {
    if (validationError) return null;

    const ageNum = Number(age);
    const weightKg = Number(weight);
    const heightCm = Number(height);
    const bfNum = Number(bodyFat);

    const bmr = calculateBmr({ sex, weightKg, heightCm, age: ageNum, formula, bodyFat: bfNum });
    const tdee = bmr * getActivityMultiplier(activity);
    
    let targetCalories = tdee;
    if (goal === "aggressive-cut") targetCalories = tdee - 500;
    else if (goal === "cut") targetCalories = tdee - 250;
    else if (goal === "lean-bulk") targetCalories = tdee + 250;
    else if (goal === "aggressive-bulk") targetCalories = tdee + 500;

    let p = 30;
    let c = 40;
    let f = 30;
    if (split === "high-protein") {
      p = 40;
      c = 30;
      f = 30;
    } else if (split === "low-carb") {
      p = 35;
      c = 25;
      f = 40;
    } else if (split === "high-carb") {
      p = 25;
      c = 50;
      f = 25;
    }

    const proteinG = (targetCalories * (p / 100)) / 4;
    const carbsG = (targetCalories * (c / 100)) / 4;
    const fatsG = (targetCalories * (f / 100)) / 9;
    const waterIntake = (weightKg * 0.033).toFixed(1);

    return {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calories: Math.round(targetCalories),
      proteinG: Math.round(proteinG),
      carbsG: Math.round(carbsG),
      fatsG: Math.round(fatsG),
      waterIntake,
      percentages: { p, c, f },
    };
  }, [validationError, age, sex, weight, height, bodyFat, formula, activity, goal, split]);

  return (
    <div className="px-4 py-6">
      <div className="bg-(--background) text-(--primary) text-center mb-5">
        <h1 className="heading flex justify-center gap-2 animate-fade-up">
          Macro Calculator
        </h1>
        <p className="description opacity-90 mt-1 text-(--secondary) text-2xl animate-fade-up mb-6">
          Calculate your perfect daily macros for fat loss, muscle gain, or maintenance
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-(--card) rounded-2xl shadow-lg border border-(--border) overflow-hidden py-5 mb-8">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="macro-age" className="text-sm font-semibold text-(--foreground) mb-1 block">Age</label>
                <input id="macro-age" value={age} onChange={(e) => setAge(e.target.value)} type="number" min="10" placeholder="Years" className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label htmlFor="macro-gender" className="text-sm font-semibold text-(--foreground) mb-1 block">Gender</label>
                <select id="macro-gender" value={sex} onChange={(e) => setSex(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label htmlFor="macro-weight" className="text-sm font-semibold text-(--foreground) mb-1 block">Weight (kg)</label>
                <input id="macro-weight" value={weight} onChange={(e) => setWeight(e.target.value)} type="number" min="20" placeholder="kg" className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label htmlFor="macro-height" className="text-sm font-semibold text-(--foreground) mb-1 block">Height (cm)</label>
                <input id="macro-height" value={height} onChange={(e) => setHeight(e.target.value)} type="number" min="100" placeholder="cm" className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="macro-formula" className="text-sm font-semibold text-(--foreground) mb-1 block">BMR Formula</label>
                <select id="macro-formula" value={formula} onChange={(e) => setFormula(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)">
                  <option value="mifflin">Mifflin-St Jeor (Default)</option>
                  <option value="harris">Harris-Benedict</option>
                  <option value="katch">Katch-McArdle</option>
                </select>
              </div>
              {formula === "katch" && (
                <div>
                  <label htmlFor="macro-bodyfat" className="text-sm font-semibold text-(--foreground) mb-1 block">Body Fat %</label>
                  <input id="macro-bodyfat" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} type="number" min="1" max="70" placeholder="Required for Katch" className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
              )}
              <div className={formula === "katch" ? "" : "md:col-span-2"}>
                <label htmlFor="macro-activity" className="text-sm font-semibold text-(--foreground) mb-1 block">Activity Level</label>
                <select id="macro-activity" value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)">
                  <option value="sedentary">Sedentary (Little or no exercise)</option>
                  <option value="light">Lightly Active (Exercise 1-3 days/wk)</option>
                  <option value="moderate">Moderately Active (Exercise 3-5 days/wk)</option>
                  <option value="active">Very Active (Exercise 6-7 days/wk)</option>
                  <option value="athlete">Athlete (Twice daily training)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="macro-goal" className="text-sm font-semibold text-(--foreground) mb-1 block">Primary Goal</label>
                <select id="macro-goal" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)">
                  <option value="aggressive-cut">Aggressive Fat Loss (-500 kcal)</option>
                  <option value="cut">Fat Loss (-250 kcal)</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="lean-bulk">Lean Muscle Gain (+250 kcal)</option>
                  <option value="aggressive-bulk">Aggressive Bulk (+500 kcal)</option>
                </select>
              </div>
              <div>
                <label htmlFor="macro-split" className="text-sm font-semibold text-(--foreground) mb-1 block">Macro Split</label>
                <select id="macro-split" value={split} onChange={(e) => setSplit(e.target.value)} className="w-full px-4 py-3 rounded-lg border border-(--border) bg-(--background) text-(--foreground) outline-none focus:ring-2 focus:ring-(--primary)">
                  <option value="balanced">Balanced (30P/40C/30F)</option>
                  <option value="high-protein">High Protein (40P/30C/30F)</option>
                  <option value="low-carb">Low Carb (35P/25C/40F)</option>
                  <option value="high-carb">High Carb (25P/50C/25F)</option>
                </select>
              </div>
            </div>

            <button onClick={() => setSubmitted(true)} className="w-full mt-4 px-5 py-4 rounded-xl bg-(--primary) text-white font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all text-lg">
              Calculate Macros
            </button>

            {submitted && validationError && (
              <p role="alert" className="mt-4 rounded-md bg-(--danger-soft) px-3 py-2 text-sm font-medium text-(--danger) text-center">
                {validationError}
              </p>
            )}

            {submitted && result && (
              <div role="status" aria-live="polite" className="mt-8 pt-8 border-t border-(--border) animate-fade-up">
                <h2 className="text-2xl font-bold mb-6 text-(--foreground) text-center">Your Results</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="rounded-2xl border border-(--border) p-5 bg-(--background) text-center shadow-sm">
                    <p className="text-xs uppercase tracking-wider font-bold text-(--muted-foreground) mb-1">BMR</p>
                    <p className="text-2xl font-black text-(--foreground)">{result.bmr} <span className="text-sm font-medium text-(--muted-foreground)">kcal</span></p>
                  </div>
                  <div className="rounded-2xl border border-(--border) p-5 bg-(--background) text-center shadow-sm">
                    <p className="text-xs uppercase tracking-wider font-bold text-(--muted-foreground) mb-1">TDEE</p>
                    <p className="text-2xl font-black text-(--foreground)">{result.tdee} <span className="text-sm font-medium text-(--muted-foreground)">kcal</span></p>
                  </div>
                  <div className="rounded-2xl border border-(--border) p-5 bg-(--background) text-center shadow-sm ring-2 ring-(--primary)/20">
                    <p className="text-xs uppercase tracking-wider font-bold text-(--primary) mb-1">Target Calories</p>
                    <p className="text-2xl font-black text-(--primary)">{result.calories} <span className="text-sm font-medium">kcal</span></p>
                  </div>
                  <div className="rounded-2xl border border-(--border) p-5 bg-(--background) text-center shadow-sm">
                    <p className="text-xs uppercase tracking-wider font-bold text-(--muted-foreground) mb-1">Water Intake</p>
                    <p className="text-2xl font-black text-(--foreground)">{result.waterIntake} <span className="text-sm font-medium text-(--muted-foreground)">L</span></p>
                  </div>
                </div>

                <div className="rounded-2xl border border-(--border) p-6 md:p-8 bg-(--background) shadow-sm">
                  <h3 className="text-xl font-bold mb-6 text-center text-(--foreground)">Daily Macro Targets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-xl border border-(--border) p-6 text-center relative overflow-hidden bg-(--card)">
                      <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                      <p className="text-sm font-bold text-(--muted-foreground) uppercase tracking-wider mb-2">Protein</p>
                      <p className="text-4xl font-black text-(--foreground) mb-1">{result.proteinG}<span className="text-xl text-(--muted-foreground)">g</span></p>
                      <p className="text-xs font-semibold text-(--muted-foreground) bg-(--muted) inline-block px-2 py-1 rounded-full mt-2">{result.percentages.p}% of calories</p>
                    </div>
                    <div className="rounded-xl border border-(--border) p-6 text-center relative overflow-hidden bg-(--card)">
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
                      <p className="text-sm font-bold text-(--muted-foreground) uppercase tracking-wider mb-2">Carbs</p>
                      <p className="text-4xl font-black text-(--foreground) mb-1">{result.carbsG}<span className="text-xl text-(--muted-foreground)">g</span></p>
                      <p className="text-xs font-semibold text-(--muted-foreground) bg-(--muted) inline-block px-2 py-1 rounded-full mt-2">{result.percentages.c}% of calories</p>
                    </div>
                    <div className="rounded-xl border border-(--border) p-6 text-center relative overflow-hidden bg-(--card)">
                      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500"></div>
                      <p className="text-sm font-bold text-(--muted-foreground) uppercase tracking-wider mb-2">Fats</p>
                      <p className="text-4xl font-black text-(--foreground) mb-1">{result.fatsG}<span className="text-xl text-(--muted-foreground)">g</span></p>
                      <p className="text-xs font-semibold text-(--muted-foreground) bg-(--muted) inline-block px-2 py-1 rounded-full mt-2">{result.percentages.f}% of calories</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Description />
      </div>
    </div>
  );
}
