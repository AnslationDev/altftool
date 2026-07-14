"use client";

import { useState } from "react";
import { Heart, RefreshCw, Copy, Download, Info, Check, Sparkles, User, HelpCircle, MapPin, ChevronRight } from "lucide-react";
import { getDeterministicMatch } from "../../love-calculator/utils/compatibilityUtils";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const JOBS = [
  { title: "Software Engineer / Tech Architect", description: "Analytical, problem-solver, loves building new concepts, quiet but extremely caring once close.", icon: "💻" },
  { title: "Creative Designer / Artist", description: "Visual thinker, spontaneous, feels emotions deeply, enjoys visiting galleries and creative dates.", icon: "🎨" },
  { title: "Pediatrician / Doctor", description: "Empathetic, highly organized, calm in crises, naturally nurturing and dedicated to helping others.", icon: "🩺" },
  { title: "Travel Journalist / Photographer", description: "Adventurous, loves exploring hidden corners, storyteller, free-spirited and always bringing exciting tales.", icon: "✈️" },
  { title: "Artisanal Chef / Restaurant Owner", description: "Passionate about details, expresses love through food, warm socialite, loves hosting cozy dinners.", icon: "🍳" },
  { title: "Environmentalist / Wildlife Biologist", description: "Kind, loves nature and animals, idealistic, enjoys outdoor hikes, camping, and sustainable living.", icon: "🌱" },
  { title: "Financial Planner / Analyst", description: "Practical, ambitious, secure, loves planning future trips, values stability and long-term milestones.", icon: "📈" },
  { title: "Acoustic Musician / Composer", description: "Romantic, introspective, feels connection through melodies, expressive writer who might write a song for you.", icon: "🎵" }
];

const MEET_SCENARIOS = [
  "A cozy local coffee shop when they accidentally pick up your order.",
  "A mutual friend's birthday dinner during a lively debate about travel destinations.",
  "Sheltering from a sudden rain shower under a bookshop awning.",
  "An evening art exhibition or a gallery opening night.",
  "A beautiful hiking trail on a sunny weekend afternoon.",
  "A professional seminar or networking meetup where you sit next to each other."
];

export default function ToolHome() {
  const [name, setName] = useState("");
  const [zodiac, setZodiac] = useState("");
  const [gender, setGender] = useState("");
  const [prefGender, setPrefGender] = useState("");
  
  // Quiz states
  const [stage, setStage] = useState("input"); // input, quiz, calculating, result
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const QUESTIONS = [
    {
      question: "What is your idea of a perfect date?",
      options: [
        { text: "Cozy dinner at home and a movie night", val: 0 },
        { text: "Going to a concert, comedy show, or bar", val: 1 },
        { text: "Exploring a museum, gallery, or bookstore", val: 2 },
        { text: "An adventurous outdoor activity like hiking", val: 3 }
      ]
    },
    {
      question: "Which trait do you value most in a partner?",
      options: [
        { text: "Kindness, empathy, and listening skills", val: 0 },
        { text: "A great sense of humor and wit", val: 1 },
        { text: "Ambition, drive, and stability", val: 2 },
        { text: "Spontaneity, curiosity, and excitement", val: 3 }
      ]
    }
  ];

  const startQuiz = (e) => {
    e.preventDefault();
    if (!name.trim() || !zodiac || !gender || !prefGender) return;
    setStage("quiz");
    setCurrentQ(0);
    setAnswers({});
  };

  const handleSelectOption = (val) => {
    const nextAnswers = { ...answers, [currentQ]: val };
    setAnswers(nextAnswers);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setStage("calculating");
      
      // Run deterministic generation based on name and traits
      setTimeout(() => {
        const seed = getDeterministicMatch(name, zodiac);
        const choiceSum = Object.values(nextAnswers).reduce((a, b) => a + b, 0);
        
        const finalSeed = seed + choiceSum;
        const jobIndex = finalSeed % JOBS.length;
        const meetIndex = (finalSeed * 3) % MEET_SCENARIOS.length;
        
        // Deterministic compatibility percentages
        const compatibility = Math.round(((finalSeed * 7) % 16) + 84); // 84% - 99%
        const patience = Math.round(((finalSeed * 13) % 21) + 79);
        const energy = Math.round(((finalSeed * 17) % 21) + 79);

        // Deterministic partner zodiac
        const partnerZodiacIdx = (finalSeed * 5) % ZODIAC_SIGNS.length;
        const partnerZodiac = ZODIAC_SIGNS[partnerZodiacIdx];

        setResult({
          job: JOBS[jobIndex],
          meet: MEET_SCENARIOS[meetIndex],
          compatibility,
          patience,
          energy,
          partnerZodiac
        });
        setStage("result");
      }, 1500);
    }
  };

  const formatReportText = () => {
    if (!result) return "";
    return `=== ALTFTool Future Partner Prediction Report ===
User: ${name} (${zodiac})

Predicted Partner Profile:
------------------------------------------
Occupation: ${result.job.title}
Traits: ${result.job.description}
Zodiac Sign: ${result.partnerZodiac}

How You Will Meet:
${result.meet}

Compatibility Analysis:
- Overall Compatibility: ${result.compatibility}%
- Emotional Harmony: ${result.patience}%
- Shared Energy Level: ${result.energy}%
==========================================`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatReportText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleDownload = () => {
    const text = formatReportText();
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `future-partner-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setName("");
    setZodiac("");
    setGender("");
    setPrefGender("");
    setStage("input");
    setResult(null);
    setAnswers({});
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-1">
            <Heart className="text-indigo-500 fill-indigo-500" size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Future Partner Prediction
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Analyze your zodiac chart and lifestyle preferences to generate a detailed profile of your future life partner.
          </p>
        </div>

        {/* Workspace Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          
          {/* Stage 1: Input Preferences */}
          {stage === "input" && (
            <form onSubmit={startQuiz} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/25 transition"
                  />
                </div>

                {/* Zodiac */}
                <div className="space-y-2">
                  <label htmlFor="zodiac" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Your Zodiac Sign
                  </label>
                  <select
                    id="zodiac"
                    required
                    value={zodiac}
                    onChange={(e) => setZodiac(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition"
                  >
                    <option value="" disabled>Select your sign</option>
                    {ZODIAC_SIGNS.map((sign) => (
                      <option key={sign} value={sign}>{sign}</option>
                    ))}
                  </select>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label htmlFor="gender" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Your Gender
                  </label>
                  <select
                    id="gender"
                    required
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition"
                  >
                    <option value="" disabled>Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="nonbinary">Non-binary</option>
                  </select>
                </div>

                {/* Preferred Gender */}
                <div className="space-y-2">
                  <label htmlFor="prefgender" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Preferred Partner Gender
                  </label>
                  <select
                    id="prefgender"
                    required
                    value={prefGender}
                    onChange={(e) => setPrefGender(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition"
                  >
                    <option value="" disabled>Select preferred gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="any">Any / Open</option>
                  </select>
                </div>

              </div>

              <button
                type="submit"
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 flex items-center justify-center gap-2 shadow"
              >
                Proceed to Lifestyle Questions <ChevronRight size={16} />
              </button>
            </form>
          )}

          {/* Stage 2: Quiz */}
          {stage === "quiz" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-muted-foreground">
                  <span>DETERMINING LIFESTYLE VALUES</span>
                  <span>QUESTION {currentQ + 1} OF {QUESTIONS.length}</span>
                </div>
                <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground leading-snug">
                  {QUESTIONS[currentQ].question}
                </h3>
                <div className="grid gap-3">
                  {QUESTIONS[currentQ].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt.val)}
                      className="w-full text-left p-4 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:border-indigo-500 hover:bg-indigo-500/5 cursor-pointer transition active:scale-[0.99] duration-100"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stage 3: Loading calculations */}
          {stage === "calculating" && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="alt-ui-spinner alt-ui-spinner--lg mb-6 border-t-indigo-500" />
              <h4 className="font-semibold text-lg text-foreground animate-pulse">Consulting Astral Projections...</h4>
              <p className="text-sm text-muted-foreground mt-2">Running zodiac correlation and lifestyle mapping formulas.</p>
            </div>
          )}

          {/* Stage 4: Results */}
          {stage === "result" && result && (
            <div className="space-y-8">
              
              {/* Partner Card */}
              <div className="bg-[var(--anslation-ds-soft)] border border-border rounded-2xl p-6 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 shadow-sm">
                <div className="text-6xl p-4 bg-card rounded-2xl border border-border shadow-sm flex items-center justify-center min-w-[100px] h-[100px]">
                  {result.job.icon}
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <span className="text-xs font-bold px-2.5 py-1 bg-indigo-500/10 text-indigo-600 rounded-full uppercase tracking-wider">
                    Future Spouse Profile
                  </span>
                  <h4 className="text-xl font-bold text-foreground leading-tight">
                    {result.job.title}
                  </h4>
                  <p className="text-xs text-muted-foreground font-semibold">
                    Zodiac Sign: {result.partnerZodiac} • Compatibility: {result.compatibility}%
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {result.job.description}
                  </p>
                </div>
              </div>

              {/* Where you will meet */}
              <div className="bg-background border border-border rounded-xl p-5 flex gap-4 items-start">
                <MapPin className="text-indigo-500 mt-0.5 flex-shrink-0" size={20} />
                <div className="space-y-1">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">How You Will Meet</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You will cross paths in {result.meet} An initial casual spark will quickly turn into hours of effortless deep talks.
                  </p>
                </div>
              </div>

              {/* Compatibility score meters */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-500" /> Astrological Alignment
                </h4>
                <div className="bg-card rounded-2xl p-5 border border-border space-y-4 shadow-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Overall Harmony Index</span>
                      <span>{result.compatibility}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${result.compatibility}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Communication Resonance</span>
                      <span>{result.patience}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 rounded-full" style={{ width: `${result.patience}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-foreground">
                      <span>Lifestyle Synchronicity</span>
                      <span>{result.energy}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 rounded-full" style={{ width: `${result.energy}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 shadow"
                >
                  <Download size={18} /> Download
                </button>

                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-border hover:bg-[var(--anslation-ds-soft)] text-foreground font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100"
                >
                  {copied ? (
                    <>
                      <Check size={18} className="text-teal-500" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} /> Copy Profile
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100"
                >
                  <RefreshCw size={18} /> Reset
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Disclaimer footer */}
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <Info className="text-primary flex-shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How is this predicted?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This predictor uses deterministic mapping methods on your name and selected zodiac signs, offset by your answers to the date and values quiz. All calculations run strictly inside your browser. Result is intended entirely for fun and entertainment!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
