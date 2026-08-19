"use client";

import React, { useState } from "react";
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Sparkles,
  Wind,
  Droplets,
  Heart,
  ArrowLeft,
  ArrowRight,
  Scissors,
  Sun,
  Moon,
  Lightbulb,
  CheckCircle2
} from "lucide-react";

const HairCareGuide = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const questions = [
    {
      id: "hairType",
      question: "What's your hair type?",
      icon: Wind,
      options: [
        { value: "straight", label: "Straight", desc: "Smooth, no waves or curls" },
        { value: "wavy", label: "Wavy", desc: "Gentle waves, some texture" },
        { value: "curly", label: "Curly", desc: "Defined curls and spirals" },
        { value: "coily", label: "Coily", desc: "Tight coils and kinks" }
      ]
    },
    {
      id: "texture",
      question: "How would you describe your hair texture?",
      icon: Droplets,
      options: [
        { value: "fine", label: "Fine", desc: "Thin, delicate strands" },
        { value: "medium", label: "Medium", desc: "Average thickness" },
        { value: "thick", label: "Thick", desc: "Dense, voluminous" }
      ]
    },
    {
      id: "condition",
      question: "What's your main hair concern?",
      icon: Heart,
      options: [
        { value: "dryness", label: "Dryness", desc: "Dry, brittle, lacks moisture" },
        { value: "oiliness", label: "Oiliness", desc: "Greasy, oily scalp" },
        { value: "dandruff", label: "Dandruff", desc: "Flaky, itchy scalp" },
        { value: "damage", label: "Damage", desc: "Split ends, breakage" }
      ]
    },
    {
      id: "goal",
      question: "What's your hair goal?",
      icon: Sparkles,
      options: [
        { value: "growth", label: "Hair Growth", desc: "Longer, stronger hair" },
        { value: "shine", label: "Shine & Luster", desc: "Glossy, healthy-looking" },
        { value: "volume", label: "Volume", desc: "Fuller, thicker appearance" },
        { value: "repair", label: "Repair", desc: "Fix damage and breakage" }
      ]
    }
  ];
  const routines = {
    straight_fine_dryness_growth: {
      title: "Lightweight Growth Routine",
      morning: [
        { step: "Gentle Cleanse", product: "Sulfate-free shampoo", desc: "Cleanse without stripping oils" },
        { step: "Light Conditioner", product: "Volumizing conditioner", desc: "Focus on ends only" },
        { step: "Leave-in Treatment", product: "Biotin serum", desc: "Apply to damp hair" },
        { step: "Heat Protection", product: "Lightweight spray", desc: "Before any styling" }
      ],
      night: [
        { step: "Scalp Massage", product: "Rosemary oil", desc: "Stimulate growth for 5 min" },
        { step: "Silk Pillowcase", product: "Satin/silk", desc: "Reduce friction while sleeping" }
      ],
      tips: [
        "Avoid heavy oils that can weigh down fine hair",
        "Get regular trims every 6-8 weeks",
        "Take biotin and collagen supplements",
        "Avoid tight hairstyles that cause tension"
      ]
    },
    wavy_medium_oiliness_volume: {
      title: "Volumizing Balance Routine",
      morning: [
        { step: "Clarifying Wash", product: "Tea tree shampoo", desc: "Control oil, 3x per week" },
        { step: "Lightweight Conditioner", product: "Mid-length to ends only", desc: "Skip the scalp" },
        { step: "Mousse Application", product: "Volumizing mousse", desc: "Apply to damp roots" },
        { step: "Air Dry or Diffuse", product: "Keep natural texture", desc: "Enhance waves gently" }
      ],
      night: [
        { step: "Dry Shampoo", product: "Oil-absorbing powder", desc: "For next-day refresh" },
        { step: "Loose Braid", product: "Keep hair protected", desc: "Prevent tangling" }
      ],
      tips: [
        "Wash hair every 2-3 days to prevent over-stripping",
        "Use dry shampoo on roots between washes",
        "Avoid touching hair throughout the day",
        "Use a wide-tooth comb, not a brush"
      ]
    },
    curly_thick_damage_repair: {
      title: "Deep Repair & Moisture Routine",
      morning: [
        { step: "Co-Wash", product: "Cleansing conditioner", desc: "Gentle daily cleanse" },
        { step: "Deep Conditioner", product: "Protein treatment", desc: "Weekly intensive mask" },
        { step: "Leave-in Cream", product: "Rich moisturizer", desc: "Apply generously" },
        { step: "Curl Cream", product: "Definition cream", desc: "Scrunch into curls" }
      ],
      night: [
        { step: "Oil Treatment", product: "Argan or coconut oil", desc: "Seal in moisture" },
        { step: "Satin Bonnet", product: "Protect curls", desc: "Maintain curl pattern" }
      ],
      tips: [
        "Deep condition weekly with heat",
        "Trim split ends every 8-10 weeks",
        "Use protein treatments bi-weekly",
        "Never brush dry curly hair"
      ]
    },
    coily_thick_dryness_shine: {
      title: "Ultra-Moisture Shine Routine",
      morning: [
        { step: "Moisturizing Shampoo", product: "Cream shampoo", desc: "Once a week only" },
        { step: "Intensive Conditioner", product: "Deep moisture mask", desc: "Leave on 15-20 min" },
        { step: "Leave-in Conditioner", product: "Heavy cream", desc: "Section and apply" },
        { step: "Oil Sealing", product: "Shea butter + oil", desc: "Lock in moisture" }
      ],
      night: [
        { step: "Refresh Spray", product: "Water + leave-in mix", desc: "Rehydrate coils" },
        { step: "Protective Style", product: "Twists or braids", desc: "Reduce manipulation" }
      ],
      tips: [
        "Pre-poo with oil before washing",
        "Deep condition after every wash",
        "Use LOC method: Leave-in, Oil, Cream",
        "Protective styles to retain moisture"
      ]
    },
    default: {
      title: "Basic Hair Care Routine",
      morning: [
        { step: "Gentle Shampoo", product: "Sulfate-free formula", desc: "2-3 times per week" },
        { step: "Conditioner", product: "Moisturizing conditioner", desc: "Focus on ends" },
        { step: "Heat Protection", product: "Thermal spray", desc: "Before styling tools" }
      ],
      night: [
        { step: "Brush Hair", product: "Wide-tooth comb", desc: "Gently detangle" },
        { step: "Hair Tie", product: "Loose braid or bun", desc: "Prevent tangling" }
      ],
      tips: [
        "Trim hair regularly every 8-12 weeks",
        "Use heat styling tools sparingly",
        "Drink plenty of water for hair health",
        "Protect hair from sun damage"
      ]
    }
  };
  const handleAnswer = (id, value) => {
    setAnswers({ ...answers, [id]: value });
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };
  const getRoutine = () => {
    const key = `${answers.hairType}_${answers.texture}_${answers.condition}_${answers.goal}`;
    return routines[key] || routines.default;
  };
  const routine = showResults ? getRoutine() : null;
  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };
  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  const progress = (currentStep + 1) / questions.length * 100;
  return (
    // <div className="w-full max-w-5xl mx-auto px-4 py-6">
    <>
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">

    <Card className="bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 border-rose-100">
  <CardContent className="p-4 sm:p-6 md:p-8">

    {
      /* Header */
    }
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
      <div className="w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
        <Scissors className="w-6 h-6 sm:w-5 sm:h-5 text-(--foreground)" />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
        Hair Care Guide
      </h1>
    </div>

    {!showResults ? <>
        {
      /* Hero Section */
    }
        {currentStep === 0 && <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 bg-rose-100 border border-rose-200 rounded-full px-4 py-2 mb-4">
              <Heart className="w-4 h-4 text-rose-600" />
              <span className="text-rose-700 text-sm sm:text-base font-semibold">Personalized Just for You</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-3 sm:mb-4">
              Find Your Perfect <br />
              <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Hair Care Routine
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-(--muted-foreground) max-w-2xl mx-auto">
              Answer a few questions about your hair and get a customized routine for beautiful, healthy locks.
            </p>
          </div>}

        {
      /* Progress Bar */
    }
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm sm:text-base font-medium text-(--muted-foreground)">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="text-sm sm:text-base font-medium text-rose-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-(--muted) rounded-full h-2 sm:h-3 overflow-hidden">
            <div
      className="bg-gradient-to-r from-rose-500 to-pink-500 h-full transition-all duration-500 ease-out rounded-full"
      style={{ width: `${progress}%` }}
    />
          </div>
        </div>

        {
      /* Question Card */
    }
        <Card className="bg-(--background) rounded-2xl shadow-lg border border-rose-100 p-4 sm:p-6">
          {currentStep > 0 && <Button
      onClick={goBack}
      variant="ghost"
      className="flex items-center gap-2 text-rose-600 hover:text-rose-700 mb-4"
    >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            {questions[currentStep].icon && <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center shrink-0">
                {React.createElement(questions[currentStep].icon, { className: "w-6 h-6 text-rose-600" })}
              </div>}
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-(--foreground)">
              {questions[currentStep].question}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {questions[currentStep].options.map((option) => <Button
      key={option.value}
      onClick={() => handleAnswer(questions[currentStep].id, option.value)}
      variant="outline"
      className="
                  group w-full h-auto justify-start text-left
                  rounded-xl border-2 border-rose-200
                  bg-gradient-to-br from-rose-50 to-pink-50
                  hover:from-rose-100 hover:to-pink-100 hover:border-rose-400
                  p-3 sm:p-4 transition-all
                "
    >
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="sr-only">Select option</span>
                    <ArrowRight className="w-4 h-4 text-rose-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="font-bold text-sm sm:text-base md:text-lg mb-1 text-black group-hover:text-rose-600 transition">
                    {option.label}
                  </h4>
                  <p className="text-xs sm:text-sm md:text-base text-(--muted-foreground) leading-relaxed">
                    {option.desc}
                  </p>
                </div>
              </Button>)}
          </div>
        </Card>
      </> : <>
        {
      /* Results */
    }
        <div className="text-center mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-(--foreground)" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
            Your Personalized Routine
          </h2>
          <p className="text-(--muted-foreground) text-sm sm:text-base mb-3">Based on your unique hair profile</p>
          <span className="inline-flex items-center gap-2 bg-rose-100 border border-rose-200 rounded-full px-4 py-2">
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span className="text-rose-700 text-sm sm:text-base font-semibold">{routine.title}</span>
          </span>
        </div>

        {
      /* Routine Cards & Tips */
    }
        <div className="space-y-6">
          <Card className="bg-(--background) rounded-2xl shadow-lg border border-rose-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-(--foreground)">Morning Routine</h3>
              </div>
              <ul className="space-y-3">
                {routine.morning.map((item, index) => <li
      key={`morning-${item.step}`}
      className="flex gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-3 sm:p-4"
    >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-sm sm:text-base text-(--foreground)">{item.step}</p>
                      <p className="text-xs sm:text-sm text-rose-600 font-medium">{item.product}</p>
                      <p className="text-xs sm:text-sm md:text-base text-(--muted-foreground) leading-relaxed">{item.desc}</p>
                    </div>
                  </li>)}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-(--background) rounded-2xl shadow-lg border border-rose-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-(--foreground)">Night Routine</h3>
              </div>
              <ul className="space-y-3">
                {routine.night.map((item, index) => <li
      key={`night-${item.step}`}
      className="flex gap-3 rounded-xl border border-rose-100 bg-rose-50/50 p-3 sm:p-4"
    >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-bold text-sm sm:text-base text-(--foreground)">{item.step}</p>
                      <p className="text-xs sm:text-sm text-rose-600 font-medium">{item.product}</p>
                      <p className="text-xs sm:text-sm md:text-base text-(--muted-foreground) leading-relaxed">{item.desc}</p>
                    </div>
                  </li>)}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 rounded-2xl shadow-lg border border-rose-100">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center shrink-0">
                  <Lightbulb className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-(--foreground)">Pro Tips</h3>
              </div>
              <ul className="space-y-2 sm:space-y-3">
                {routine.tips.map((tip) => <li key={tip} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm md:text-base text-(--muted-foreground) leading-relaxed">{tip}</span>
                  </li>)}
              </ul>
            </CardContent>
          </Card>
        </div>

        {
      /* Action Buttons */
    }
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button
      onClick={resetQuiz}
      className="w-full sm:w-auto flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-(--foreground)"
    >
            Take Quiz Again
          </Button>
        </div>
      </>}
  </CardContent>
</Card>



    </div>



    </>
  );
};
export default HairCareGuide;
