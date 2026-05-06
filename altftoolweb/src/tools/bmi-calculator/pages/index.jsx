import React, { useMemo, useState } from 'react';
import { Activity, Heart, Droplet, Flame, Download, RotateCcw, AlertCircle, Trophy, Zap, CheckCircle2, Target, Utensils, Share2 } from 'lucide-react';
import Description from '../components/Description';

function BMIGauge({ bmi, category }) {
  const angle = Math.min(Math.max((parseFloat(bmi) - 10) / 30 * 180, 0), 180);
  return (
    <div className="relative w-64 h-40 mx-auto flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 200 120" className="w-full h-full">
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--muted)" strokeWidth="18" strokeLinecap="round" />
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={category.color} strokeWidth="18" strokeLinecap="round" strokeDasharray={`${(angle/180) * 251.3}, 251.3`} className="transition-all duration-1000 ease-out" />
        <text x="100" y="55" textAnchor="middle" style={{ fill: 'var(--muted-foreground)', fontSize: '20px', fontWeight: '900' }}>{bmi}</text>
        <text x="100" y="78" textAnchor="middle" className="uppercase tracking-widest" style={{ fill: 'var(--muted-foreground)', fontSize: '10px', fontWeight: '800' }}>{category.name}</text>
        <line x1="100" y1="100" x2={100 + 40 * Math.cos((180 - angle) * Math.PI / 180)} y2={100 - 40 * Math.sin((180 - angle) * Math.PI / 180)} stroke="var(--muted-foreground)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="100" cy="100" r="7" fill="var(--muted-foreground)" />
      </svg>
    </div>
  );
}

const loadBmiTracker = () => {
  if (typeof window === 'undefined') {
    return { history: [], streak: 0 };
  }

  const savedStreak = Number.parseInt(localStorage.getItem('bmiStreak') || '0', 10) || 0;
  const lastDate = localStorage.getItem('lastCheckDate');
  const today = new Date().toLocaleDateString();

  let history = [];
  try {
    const saved = localStorage.getItem('bmiHistory');
    history = saved ? JSON.parse(saved) : [];
  } catch {
    history = [];
  }

  if (lastDate === today) {
    return { history, streak: savedStreak };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const nextStreak = lastDate === yesterday.toLocaleDateString()
    ? savedStreak + 1
    : 1;

  localStorage.setItem('bmiStreak', String(nextStreak));
  localStorage.setItem('lastCheckDate', today);

  return { history, streak: nextStreak };
};

export default function ToolHome() {
  const [initialTracker] = useState(loadBmiTracker);
  const [heightUnit, setHeightUnit] = useState('cm');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [history, setHistory] = useState(initialTracker.history);
  const [streak] = useState(initialTracker.streak);

  const badges = useMemo(() => {
    const earned = [];
    if (history.length > 0) earned.push({ id: 1, name: "First Goal", icon: <CheckCircle2 className="w-3.5 h-3.5" /> });
    if (streak >= 7) earned.push({ id: 2, name: "7 Day Streak", icon: <Zap className="w-3.5 h-3.5" /> });
    if (history.some(h => h.category.name === 'Normal')) earned.push({ id: 3, name: "Elite Health", icon: <Trophy className="w-3.5 h-3.5" /> });
    return earned;
  }, [history, streak]);

  const getHeightInCm = () => {
    if (heightUnit === 'cm') return parseFloat(heightCm) || 0;
    const ft = parseFloat(heightFt) || 0;
    const inches = parseFloat(heightIn) || 0;
    return (ft * 30.48) + (inches * 2.54);
  };

  const getWeightInKg = () => {
    if (weightUnit === 'kg') return parseFloat(weight) || 0;
    return (parseFloat(weight) || 0) * 0.453592;
  };

  const validateInputs = () => {
    const newErrors = {};
    const h = getHeightInCm();
    const w = getWeightInKg();
    if (h < 50 || h > 300) newErrors.height = true;
    if (w < 10 || w > 500) newErrors.weight = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { name: 'Underweight', color: '#3B82F6' };
    if (bmi < 25) return { name: 'Normal', color: '#10B981' };
    if (bmi < 30) return { name: 'Overweight', color: '#F59E0B' };
    return { name: 'Obese', color: '#EF4444' };
  };

  const getDietDetails = (catName, weightKg) => {
    const plans = {
      'Underweight': { title: "Weight Gain Plan", protein: Math.round(weightKg * 1.5), foods: "Paneer, Banana Shake, Dry Fruits, Whole Grains, Ghee Dal-Chawal.", focus: "Increase Calorie Density" },
      'Normal': { title: "Maintenance Plan", protein: Math.round(weightKg * 1.0), foods: "Mixed Veg, Roti, Curd, Sprouted Salad, Lean Protein, Fruits.", focus: "Balanced Macro-nutrients" },
      'Overweight': { title: "Weight Loss Plan", protein: Math.round(weightKg * 1.2), foods: "Moong Dal Chilla, Oats, Roasted Chana, Salad, Buttermilk.", focus: "Calorie Deficit & Fiber" },
      'Obese': { title: "Fat Loss Focus", protein: Math.round(weightKg * 1.2), foods: "Leafy Greens, Dal Soup, Boiled Veggies, Multigrain Roti.", focus: "Low GI & High Protein" }
    };
    return plans[catName] || plans['Normal'];
  };

  const getSuggestions = (catName) => {
    const suggestions = {
      'Underweight': { diet: 'Consume 500+ extra calories daily. Focus on complex carbs and healthy fats.', exercise: 'Prioritize heavy strength training (3-4 days/week) to build muscle mass.' },
      'Normal': { diet: 'Follow a 40/30/30 macro split. Focus on seasonal fruits and lean proteins.', exercise: 'Combine 150 min moderate cardio with 2 days strength training.' },
      'Overweight': { diet: 'Implement a 500-calorie deficit. Replace simple carbs with high-fiber millets.', exercise: 'Walk 10k steps daily. Incorporate HIIT 2 times a week.' },
      'Obese': { diet: 'High-protein, low-carb approach. Eliminate sugary drinks completely.', exercise: 'Start with low-impact walking or swimming to protect joints.' }
    };
    return suggestions[catName] || suggestions['Normal'];
  };

  const calculate = () => {
    if (!validateInputs()) return;
    const heightValue = getHeightInCm();
    const weightValue = getWeightInKg();
    const heightM = heightValue / 100;
    const bmi = weightValue / (heightM * heightM);
    const category = getBMICategory(bmi);
    const waterIntake = (weightValue * 0.033).toFixed(2);
    const dietPlan = getDietDetails(category.name, weightValue);

    let calories = null;
    let bmrValue = null;
    if (age && gender) {
      const ageNum = parseInt(age);
      bmrValue = gender === 'male' 
        ? (10 * weightValue + 6.25 * heightValue - 5 * ageNum + 5)
        : (10 * weightValue + 6.25 * heightValue - 5 * ageNum - 161);
      calories = { maintenance: Math.round(bmrValue * 1.55) };
    }

    const newResult = {
      bmi: bmi.toFixed(2),
      category,
      height: heightValue.toFixed(1),
      weight: weightValue.toFixed(1),
      waterIntake,
      idealWeight: { min: (18.5 * heightM * heightM).toFixed(1), max: (24.9 * heightM * heightM).toFixed(1) },
      calories,
      bmr: bmrValue ? bmrValue.toFixed(0) : null,
      dietPlan,
      date: new Date().toLocaleString()
    };

    setResult(newResult);
    setHistory((prev) => {
      const nextHistory = [newResult, ...prev].slice(0, 10);
      localStorage.setItem('bmiHistory', JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  const downloadReport = () => {
    if (!result) return;
    const suggestions = getSuggestions(result.category.name);
    
    const reportText = `
HEALTH REPORT - BMI CALCULATOR
Generated on: ${result.date}
---------------------------------
MEASUREMENTS:
- BMI: ${result.bmi}
- Category: ${result.category.name}
- Height: ${result.height} cm
- Weight: ${result.weight} kg
- Ideal Range: ${result.idealWeight.min}kg - ${result.idealWeight.max}kg

DAILY GOALS:
- Water Intake: ${result.waterIntake} Liters
- Protein Goal: ${result.dietPlan.protein}g
- Maintenance Calories: ${result.calories?.maintenance || 'N/A'} kcal

NUTRITION PLAN (${result.dietPlan.title}):
- Focus: ${result.dietPlan.focus}
- Suggested Foods: ${result.dietPlan.foods}

EXPERT ADVICE:
- Diet: ${suggestions.diet}
- Exercise: ${suggestions.exercise}

---------------------------------
Stay Healthy, Stay Fit!
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `BMI_Report_${result.bmi}.txt`;
    link.click();
  };

  const shareReport = async () => {
    if (!result) return;
    const text = `Check out my BMI report! BMI: ${result.bmi} (${result.category.name}). Try it here!`;
    if (navigator.share) {
      try { await navigator.share({ title: 'My Health Report', text }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(text);
      alert('Report summary copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
  <div className="max-w-5xl mx-auto">
    
    {/* Header Section */}
    <div className="flex flex-col items-center justify-center mb-10 text-center">
      
      {/* Heading (same CSS) */}
      <h1 className="heading flex justify-center gap-2 animate-fade-up mb-2">
        BMI Health Calculator
      </h1>

      {/* Subheading (same CSS) */}
      <p className="description opacity-90 mt-1 text-(--secondary) text-2xl animate-fade-up mb-6">
        Check your body mass index and stay healthy
      </p>

      {/* Badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 animate-fade-up">
        {badges.map((b) => (
          <span
            key={b.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border uppercase"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--primary)",
            }}
          >
            {b.icon} {b.name}
          </span>
        ))}
      </div>

      {/* Streak */}
      <div className="px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg font-black border bg-[var(--card)] border-[var(--border)] text-[var(--primary)] animate-fade-up">
        {streak} DAY STREAK
      </div>

    </div>

        {/* INPUTS Section */}
        <div className="flex justify-center mb-12">
          <div className="rounded-3xl shadow-xl p-8 w-full max-w-4.5xl border bg-[var(--card)] border-[var(--border)]">
            <h2 className="text-2xl font-bold mb-6 text-[var(--foreground)] flex items-center gap-2"><Activity className="w-6 h-6 text-[var(--primary)]" /> Measurements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* HEIGHT INPUT - UPDATED TOGGLE LOGIC */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[var(--foreground)]">Height</label>
                <div className="flex p-1 rounded-xl bg-[var(--muted)]">
                    <button onClick={() => setHeightUnit('cm')} className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${heightUnit === 'cm' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--muted-foreground)]'}`}>CM</button>
                    <button onClick={() => setHeightUnit('ft')} className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${heightUnit === 'ft' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--muted-foreground)]'}`}>FT/IN</button>
                </div>
                
                {heightUnit === 'cm' ? (
                  <input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="175" className={`w-full px-4 py-3 rounded-xl border bg-[var(--background)] text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.height ? 'border-red-500' : 'border-[var(--border)]'}`} />
                ) : (
                  <div className="flex gap-2">
                    <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="Ft" className="w-1/2 px-4 py-3 rounded-xl border bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                    <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="In" className="w-1/2 px-4 py-3 rounded-xl border bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]" />
                  </div>
                )}
              </div>

              {/* WEIGHT INPUT */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-[var(--foreground)]">Weight</label>
                <div className="flex p-1 rounded-xl bg-[var(--muted)]">
                    <button onClick={() => setWeightUnit('kg')} className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${weightUnit === 'kg' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--muted-foreground)]'}`}>KG</button>
                    <button onClick={() => setWeightUnit('lbs')} className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${weightUnit === 'lbs' ? 'bg-[var(--card)] text-[var(--primary)] shadow-sm' : 'text-[var(--muted-foreground)]'}`}>LBS</button>
                </div>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={weightUnit === 'kg' ? "70" : "154"} className={`w-full px-4 py-3 rounded-xl border bg-[var(--background)] text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] ${errors.weight ? 'border-red-500' : 'border-[var(--border)]'}`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className="w-full px-4 py-3 rounded-xl border bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]" />
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-3 rounded-xl border bg-[var(--background)] border-[var(--border)] text-[var(--muted-foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]">
                <option value="">Gender</option><option value="male">Male</option><option value="female">Female</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <button onClick={calculate} className="flex-[2] py-4 rounded-xl font-bold bg-[var(--primary)] text-white shadow-lg active:scale-95 transition-all">Calculate Now</button>
              <button onClick={() => {setResult(null); setHeightCm(''); setHeightFt(''); setHeightIn(''); setWeight(''); setAge(''); setGender('');}} className="flex-1 py-4 rounded-xl font-bold flex justify-center items-center gap-2 border bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--border)] transition-all"><RotateCcw size={20}/> Reset</button>
            </div>
          </div>
        </div>

        {/* RESULTS Section */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="rounded-3xl shadow-lg p-8 border bg-[var(--card)] border-[var(--border)] flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2 text-[var(--foreground)]">BMI Analysis Result</h3>
                <p className="text-[var(--muted-foreground)]">Your BMI is <span className="font-bold">{result.bmi}</span>, which is <span className="font-bold">{result.category.name}</span>.</p>
              </div>
              <BMIGauge bmi={result.bmi} category={result.category} />
            </div>

            {/* Nutrition Plan */}
            <div className="rounded-3xl p-8 border bg-[var(--card)] border-[var(--border)]">
                <div className="flex items-center justify-between mb-8 border-b border-[var(--border)] pb-4">
                  <h4 className="text-xl font-bold text-[var(--foreground)]">Nutrition Plan</h4>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[var(--primary)] text-white uppercase">{result.dietPlan.title}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div><p className="text-xs font-black mb-1 uppercase tracking-widest text-[var(--foreground)]">Protein Goal</p><p className="text-2xl font-bold text-[var(--muted-foreground)]">{result.dietPlan.protein}g/day</p></div>
                  <div><p className="text-xs font-black mb-1 uppercase tracking-widest text-[var(--foreground)]">Water Intake</p><p className="text-2xl font-bold text-[var(--muted-foreground)]">{result.waterIntake}L/day</p></div>
                  <div><p className="text-xs font-black mb-1 uppercase tracking-widest text-[var(--foreground)]">Daily Calories</p><p className="text-2xl font-bold text-[var(--muted-foreground)]">{result.calories?.maintenance || '---'}</p></div>
                </div>
                <div className="pt-6 border-t border-[var(--border)]">
                  <p className="text-xs font-black mb-2 uppercase tracking-widest text-[var(--foreground)]">Suggested Indian Foods</p>
                  <p className="text-sm text-[var(--muted-foreground)] italic leading-relaxed">&quot;{result.dietPlan.foods}&quot;</p>
                </div>
            </div>

            {/* Expert Advice & Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 rounded-3xl p-8 border bg-[var(--card)] border-[var(--border)]">
                  <h4 className="text-xl font-bold mb-6 text-[var(--foreground)] uppercase text-xs tracking-[0.2em]">Expert Advice</h4>
                  <div className="space-y-6">
                    <div><p className="text-xs font-black mb-1 uppercase text-[var(--foreground)]">Nutritional Strategy</p><p className="text-sm text-[var(--muted-foreground)]">{getSuggestions(result.category.name).diet}</p></div>
                    <div><p className="text-xs font-black mb-1 uppercase text-[var(--foreground)]">Training Plan</p><p className="text-sm text-[var(--muted-foreground)]">{getSuggestions(result.category.name).exercise}</p></div>
                  </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <button onClick={downloadReport} className="flex-1 py-4 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--card)] flex flex-col items-center justify-center gap-2 hover:bg-[var(--muted)] transition-all">
                  <Download className="w-6 h-6 text-[var(--primary)]" />
                  <span className="text-xs font-bold text-[var(--foreground)] uppercase">Download Report</span>
                </button>
                <button onClick={shareReport} className="flex-1 py-4 rounded-2xl bg-[var(--primary)] text-white flex flex-col items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                  <Share2 className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase">Share Result</span>
                </button>
              </div>
            </div>
          </div>
        )}
        <Description />
      </div>
    </div>
  );
}
