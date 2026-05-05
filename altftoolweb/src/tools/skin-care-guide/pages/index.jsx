"use-client";
import { useState } from "react";
import {
  Sparkles,
  Sun,
  Moon,
  Droplets,
  Heart,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Description from "../components/Description";

export default function SkinCareGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      id: "skinType",
      question: "What's your skin type?",
      icon: Droplets,
      options: [
        { value: "oily", label: "Oily", desc: "Shiny, prone to acne" },
        { value: "dry", label: "Dry", desc: "Flaky, tight feeling" },
        {
          value: "combination",
          label: "Combination",
          desc: "Oily T-zone, dry cheeks",
        },
        {
          value: "normal",
          label: "Normal",
          desc: "Balanced, not too oily or dry",
        },
      ],
    },
    {
      id: "concerns",
      question: "What are your main skin concerns?",
      icon: Heart,
      options: [
        {
          value: "acne",
          label: "Acne & Breakouts",
          desc: "Pimples and blemishes",
        },
        {
          value: "aging",
          label: "Anti-Aging",
          desc: "Fine lines and wrinkles",
        },
        {
          value: "pigmentation",
          label: "Dark Spots",
          desc: "Hyperpigmentation",
        },
        {
          value: "sensitivity",
          label: "Sensitivity",
          desc: "Redness and irritation",
        },
      ],
    },
    {
      id: "timeOfDay",
      question: "When do you need a routine for?",
      icon: Sun,
      options: [
        { value: "morning", label: "Morning", desc: "Start your day fresh" },
        { value: "night", label: "Night", desc: "Before bed routine" },
        { value: "both", label: "Both", desc: "Complete day & night care" },
      ],
    },
  ];

  const routines = {
    oily_acne_morning: {
      title: "Oil-Control Morning Routine",
      steps: [
        {
          name: "Gentle Foaming Cleanser",
          time: "2 min",
          desc: "Remove excess oil without stripping",
        },
        {
          name: "Salicylic Acid Toner",
          time: "1 min",
          desc: "Unclog pores and prevent breakouts",
        },
        {
          name: "Niacinamide Serum",
          time: "1 min",
          desc: "Control oil and reduce inflammation",
        },
        {
          name: "Oil-Free Moisturizer",
          time: "1 min",
          desc: "Lightweight hydration",
        },
        {
          name: "SPF 50 Sunscreen",
          time: "1 min",
          desc: "Matte finish, broad spectrum",
        },
      ],
      tips: [
        "Blot excess oil during the day with oil-absorbing sheets",
        "Avoid heavy, pore-clogging products",
        "Don't skip moisturizer - dehydrated skin produces more oil",
      ],
    },

    dry_aging_night: {
      title: "Hydrating Anti-Aging Night Routine",
      steps: [
        {
          name: "Cream Cleanser",
          time: "2 min",
          desc: "Gentle, non-foaming formula",
        },
        {
          name: "Hydrating Toner",
          time: "1 min",
          desc: "Prep skin for better absorption",
        },
        {
          name: "Retinol Serum",
          time: "1 min",
          desc: "Boost collagen, reduce fine lines",
        },
        {
          name: "Hyaluronic Acid Serum",
          time: "1 min",
          desc: "Deep hydration",
        },
        {
          name: "Rich Night Cream",
          time: "2 min",
          desc: "Lock in moisture overnight",
        },
        {
          name: "Eye Cream",
          time: "1 min",
          desc: "Target crow's feet and dark circles",
        },
      ],
      tips: [
        "Start retinol slowly - 2-3 times per week",
        "Use a humidifier while sleeping",
        "Apply products on damp skin for better absorption",
      ],
    },

    combination_pigmentation_morning: {
      title: "Brightening Morning Routine",
      steps: [
        {
          name: "Gel Cleanser",
          time: "2 min",
          desc: "Balance without over-drying",
        },
        {
          name: "Vitamin C Serum",
          time: "1 min",
          desc: "Brighten and even skin tone",
        },
        { name: "Niacinamide", time: "1 min", desc: "Reduce dark spots" },
        {
          name: "Lightweight Moisturizer",
          time: "1 min",
          desc: "Hydrate without grease",
        },
        {
          name: "SPF 50 Sunscreen",
          time: "1 min",
          desc: "Essential to prevent more pigmentation",
        },
      ],
      tips: [
        "Sunscreen is crucial for fading dark spots",
        "Be patient - brightening takes 8-12 weeks",
        "Use separate products for T-zone and cheeks if needed",
      ],
    },

    normal_sensitivity_night: {
      title: "Gentle Calming Night Routine",
      steps: [
        {
          name: "Micellar Water",
          time: "2 min",
          desc: "Gentle makeup removal",
        },
        {
          name: "Fragrance-Free Cleanser",
          time: "2 min",
          desc: "Mild, soothing formula",
        },
        {
          name: "Centella Toner",
          time: "1 min",
          desc: "Calm and repair skin barrier",
        },
        {
          name: "Ceramide Serum",
          time: "1 min",
          desc: "Strengthen skin barrier",
        },
        {
          name: "Calming Moisturizer",
          time: "2 min",
          desc: "With oat or aloe",
        },
      ],
      tips: [
        "Avoid fragrance, alcohol, and harsh actives",
        "Patch test new products",
        "Keep routine simple - less is more for sensitive skin",
      ],
    },

    default: {
      title: "Basic Skincare Routine",
      steps: [
        {
          name: "Gentle Cleanser",
          time: "2 min",
          desc: "Remove dirt and impurities",
        },
        { name: "Toner", time: "1 min", desc: "Balance and prep skin" },
        { name: "Serum", time: "1 min", desc: "Target specific concerns" },
        { name: "Moisturizer", time: "1 min", desc: "Hydrate and protect" },
        {
          name: "Sunscreen (AM)",
          time: "1 min",
          desc: "Protect from UV damage",
        },
      ],
      tips: [
        "Consistency is key - stick to your routine",
        "Always patch test new products",
        "Sunscreen every day, even when cloudy",
      ],
    },
  };

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const getRoutine = () => {
    const skinType = answers.skinType || "normal";
    const concern = answers.concerns || "sensitivity";
    const time = answers.timeOfDay || "morning";

    const routineKey = `${skinType}_${concern}_${time === "both" ? "morning" : time}`;
    return routines[routineKey] || routines.default;
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  const routine = showResults ? getRoutine() : null;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] ">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {!showResults ? (
          <>
            {/** HERO */}
            {currentStep === 0 && (
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-200 rounded-full px-4 py-2 mb-6">
                  <Heart className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 text-sm font-semibold">
                    Personalized for You
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-(--primary) mb-6 leading-tight">
                  Find Your Perfect
                  <br />
                  <span className="text-3xl sm:text-5xl text-(--foreground) ">
                    Skincare Routine
                  </span>
                </h1>

                <p className="text-(--muted-foreground) text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
                  Answer a few quick questions and get a customized skincare
                  routine tailored to your skin type and concerns.
                </p>
              </div>
            )}

            {/** PROGRESS BAR */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-(--muted-foreground)">
                  Question {currentStep + 1} of {questions.length}
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round(((currentStep + 1) / questions.length) * 100)}%
                </span>
              </div>

              <div className="w-full bg-(--muted) rounded-full h-2 overflow-hidden">
                <div
                  className="bg-linear-to-r from-blue-500 to-blue-700 h-full transition-all duration-500"
                  style={{
                    width: `${((currentStep + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/** QUESTION CARD */}
            <div className="bg-(--card) border border-(--border) rounded-xl shadow-sm p-6 sm:p-8">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              <div className="flex items-center gap-4 mb-8">
                {questions[currentStep].icon && (
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    {(() => {
                      const Icon = questions[currentStep].icon;
                      return <Icon className="w-7 h-7 text-blue-600" />;
                    })()}
                  </div>
                )}

                <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">
                  {questions[currentStep].question}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {questions[currentStep].options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      handleAnswer(questions[currentStep].id, option.value)
                    }
                    className="bg-linear-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-400 rounded-xl p-6 text-left transition-all transform hover:scale-105 group"
                  >
                    <h3 className="font-bold text-black/70 mb-2 text-lg group-hover:text-blue-600 transition flex items-center justify-between">
                      {option.label}
                      <ChevronRight className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition" />
                    </h3>

                    <p className="text-(--muted-foreground) text-sm">
                      {option.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/** RESULTS */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-linear-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-(--foreground) mb-3">
                Your Personalized Routine
              </h2>

              <p className="text-(--muted-foreground)">
                Based on your skin profile and goals
              </p>
            </div>

            {/** ROUTINE CARD */}
            <div className="bg-(--card) border border-(--border) rounded-xl shadow-sm p-6 sm:p-8 mb-6">
              <h3 className="text-2xl font-bold text-(--foreground) mb-6 flex items-center gap-3">
                {answers.timeOfDay === "morning" ? (
                  <Sun className="w-7 h-7 text-blue-500" />
                ) : (
                  <Moon className="w-7 h-7 text-blue-500" />
                )}
                {routine.title}
              </h3>

              <div className="space-y-4 mb-8">
                {routine.steps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-linear-to-r from-blue-50 to-blue-100 rounded-xl p-4 flex items-start gap-4 border border-blue-100"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-bold text-black/70">{step.name}</h4>
                        <span className="text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full">
                          {step.time}
                        </span>
                      </div>

                      <p className="text-sm text-(--muted-foreground)">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-bold text-black/70 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  Pro Tips for Best Results
                </h4>

                <ul className="space-y-2">
                  {routine.tips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-black/70"
                    >
                      <span className="text-(--primary) mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/** ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetQuiz}
                className="flex-1 bg-linear-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white font-semibold px-6 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Take Quiz Again
              </button>

              <button
                onClick={() => window.print()}
                className="flex-1 px-6 py-4 rounded-xl border-2 border-(--border) bg-(--background) hover:bg-(--muted) text-(--foreground) font-semibold transition-all"
              >
                Print Routine
              </button>
            </div>
          </>
        )}
      </main>
      <Description />
    </div>
  );
}
