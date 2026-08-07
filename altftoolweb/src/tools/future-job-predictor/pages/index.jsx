"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Globe,
  Star,
  RefreshCw,
  FolderOpen,
  DollarSign,
  TrendingDown,
  Clock,
  Printer,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import CareerCharts from "../components/CareerCharts";
import CareerRoadmap from "../components/CareerRoadmap";
import FunFeatures from "../components/FunFeatures";

// Dynamic Career Data Base
const CAREER_DATABASE = [
  {
    name: "AI & Prompt Engineer",
    salaryRange: "$110,000 - $175,000",
    futureDemand: 95,
    growthPotential: 98,
    automationRisk: 15,
    learningDifficulty: "Medium",
    educationNeeded: "Bootcamp or Bachelor's in CS / Linguistics",
    yearsToEnter: 1,
    requiredSkills: ["AI Knowledge", "Programming", "Creativity", "Writing"],
    missingSkills: ["Natural Language Processing", "Prompt Optimization Patterns"],
    recommendedCourses: ["DeepLearning.AI Prompt Engineering", "Google AI Associate Certification"],
    pros: ["Fast growing field", "High starting salaries", "Remote options"],
    cons: ["Rapidly changing specs", "Low entry barriers"],
    futureOutlook: "Crucial role bridging LLMs and enterprise execution logic.",
  },
  {
    name: "Climate Restoration Architect",
    salaryRange: "$95,000 - $150,000",
    futureDemand: 90,
    growthPotential: 92,
    automationRisk: 10,
    learningDifficulty: "High",
    educationNeeded: "Master's in Environmental Science / Forestry",
    yearsToEnter: 3,
    requiredSkills: ["Problem Solving", "Critical Thinking", "Creativity", "AI Knowledge"],
    missingSkills: ["Carbon sequestration modeling", "GIS Mapping"],
    recommendedCourses: ["EDX Climate Action Certificate", "Harvard Carbon Management blueprint"],
    pros: ["High societal impact", "Stable public funding"],
    cons: ["Requires deep scientific background", "Slow project turnarounds"],
    futureOutlook: "Invaluable as global temperature regulations scale.",
  },
  {
    name: "Cybersecurity Analyst Pro",
    salaryRange: "$100,000 - $160,000",
    futureDemand: 88,
    growthPotential: 85,
    automationRisk: 20,
    learningDifficulty: "Medium",
    educationNeeded: "CompTIA Security+ or CISSP",
    yearsToEnter: 2,
    requiredSkills: ["Critical Thinking", "AI Knowledge", "Data Analysis", "Problem Solving"],
    missingSkills: ["Network penetration testing", "Quantum cryptography basics"],
    recommendedCourses: ["Google Cybersecurity Certificate", "CISSP Security Pathway"],
    pros: ["Extremely high demand", "Critical utility status"],
    cons: ["High stress/on-call shifts", "Constant security updates"],
    futureOutlook: "Secure digital infrastructure remains a top governmental priority.",
  },
  {
    name: "UI & UX Designer",
    salaryRange: "$85,000 - $140,000",
    futureDemand: 80,
    growthPotential: 78,
    automationRisk: 25,
    learningDifficulty: "Medium",
    educationNeeded: "Portfolio or Design Degree",
    yearsToEnter: 1,
    requiredSkills: ["Design", "Creativity", "Communication", "AI Knowledge"],
    missingSkills: ["Figma Design Systems", "User research methodologies"],
    recommendedCourses: ["Google UX Design Certificate", "Interaction Design Foundation Path"],
    pros: ["Creative autonomy", "Great remote potential"],
    cons: ["Highly competitive portfolio standard", "Subjective client reviews"],
    futureOutlook: "Transitioning fully into spatial AR/VR interfaces.",
  },
  {
    name: "Space Operations Engineer",
    salaryRange: "$130,000 - $210,000",
    futureDemand: 92,
    growthPotential: 95,
    automationRisk: 5,
    learningDifficulty: "High",
    educationNeeded: "Ph.D. or Master's in Aerospace Engineering",
    yearsToEnter: 4,
    requiredSkills: ["Mathematics", "Programming", "Problem Solving", "Critical Thinking"],
    missingSkills: ["Orbital mechanics calculations", "Telemetry monitoring networks"],
    recommendedCourses: ["NASA Space Operations Certification", "MIT Aerospace Engineering Principles"],
    pros: ["Cutting edge industry", "Incredible prestige"],
    cons: ["Very high entry difficulty", "Limited local roles"],
    futureOutlook: "Rapidly expanding due to commercial satellite and tourism sectors.",
  },
];

const SKILL_LIST = ["Programming", "Communication", "Leadership", "Creativity", "Mathematics", "Design", "Writing", "AI Knowledge", "Data Analysis", "Problem Solving", "Critical Thinking"];
const INTEREST_LIST = ["Technology", "Business", "Healthcare", "Finance", "Gaming", "Science", "Space", "Robotics", "AI", "Startups"];
const PERSONALITY_LIST = ["Introvert", "Extrovert", "Analytical", "Creative", "Logical", "Risk Taker", "Adaptable", "Detail Oriented"];
const PREFERENCE_LIST = ["Remote", "Hybrid", "Office", "Startup", "Corporate", "High Salary", "Work Life Balance"];

export default function FutureJobPredictorApp() {
  const [step, setStep] = useState(1);
  const [isSimulated, setIsSimulated] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics"); // analytics, roadmap, 2050
  
  // User Bio
  const [age, setAge] = useState(25);
  const [country, setCountry] = useState("United States");
  const [education, setEducation] = useState("Bachelor's");
  const [occupation, setOccupation] = useState("Student");

  // User Scores & Sliders
  const [skills, setSkills] = useState(SKILL_LIST.reduce((acc, sk) => ({ ...acc, [sk]: 50 }), {}));
  const [interests, setInterests] = useState([]);
  const [personalities, setPersonalities] = useState([]);
  const [preferences, setPreferences] = useState([]);

  // Simulation state outputs
  const [matches, setMatches] = useState([]);
  const [selectedMatchIdx, setSelectedMatchIdx] = useState(0);

  const handleSkillChange = (sk, val) => {
    setSkills((prev) => ({ ...prev, [sk]: Number(val) }));
  };

  const handleCheckboxToggle = (list, setList, val) => {
    if (list.includes(val)) {
      setList(list.filter((x) => x !== val));
    } else {
      setList([...list, val]);
    }
  };

  // Naming Engine logic
  const handleSimulate = () => {
    // Suitability calculations
    const computed = CAREER_DATABASE.map((job) => {
      // Base score
      let matchScore = 70;

      // Add weights based on skills rating
      job.requiredSkills.forEach((sk) => {
        const rating = skills[sk] || 50;
        matchScore += (rating - 50) * 0.15;
      });

      // Add weight if preferred matching parameters exist
      if (preferences.includes("Remote") && job.pros.join(" ").toLowerCase().includes("remote")) {
        matchScore += 5;
      }
      // Strip thousands separators before parsing so "$100,000 - $160,000"
      // resolves to a real dollar figure (100000) instead of a truncated "100".
      const salaryFloor = Number(job.salaryRange.replace(/,/g, "").match(/\d+/g)?.[0] || 0);
      if (preferences.includes("High Salary") && salaryFloor >= 100000) {
        matchScore += 5;
      }

      // Small honest nudge: careers whose name/outlook/education/skills genuinely
      // reference a selected interest get a small boost. This is deliberately
      // lightweight — it does not attempt to fully model interests, personality,
      // or bio into the score (see the disclosure copy near those wizard steps).
      const interestSearchText = [job.name, job.futureOutlook, job.educationNeeded, job.requiredSkills.join(" "), job.pros.join(" ")]
        .join(" ")
        .toLowerCase();
      interests.forEach((interest) => {
        if (interestSearchText.includes(interest.toLowerCase())) {
          matchScore += 1;
        }
      });

      // Bound score between 0 and 100
      matchScore = Math.min(100, Math.max(0, Math.round(matchScore)));

      return {
        ...job,
        matchScore,
      };
    });

    // Sort by best fit
    computed.sort((a, b) => b.matchScore - a.matchScore);

    setMatches(computed);
    setSelectedMatchIdx(0);
    setIsSimulated(true);
  };

  const activeCareer = matches[selectedMatchIdx] || null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Core Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Career Simulation Suite
            </span>
            <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              Future Job Predictor
            </h1>
          </div>
          
          {isSimulated && (
            <button
              onClick={() => {
                setIsSimulated(false);
                setStep(1);
              }}
              className="px-4 py-2 border border-border hover:bg-secondary text-foreground text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Reset Simulation
            </button>
          )}
        </div>

        {/* AI Disclaimer Alert */}
        <div className="bg-warning-soft border border-warning px-4 py-3 rounded-xl text-xs text-warning leading-relaxed">
          <strong>Important Disclaimer:</strong> This is an AI-inspired career simulation based on your inputs. It is intended for educational and entertainment purposes and should not be considered professional career advice.
        </div>

        {!isSimulated ? (
          /* Multi-Step Wizard Panel */
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            
            {/* Step navigation indicator */}
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <div>
                <span className="text-[10px] text-primary font-extrabold uppercase">Step {step} of 5</span>
                <h3 className="font-extrabold text-lg text-foreground mt-0.5">
                  {step === 1 ? "Basic Biography Profile" : step === 2 ? "Skill Proficiencies" : step === 3 ? "Target Interests" : step === 4 ? "Personality Dimensions" : "Work Environment Preferences"}
                </h3>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className={`w-6 h-1.5 rounded-full transition-all ${s <= step ? "bg-primary" : "bg-secondary"}`} />
                ))}
              </div>
            </div>

            {/* Step Content Cases */}
            <div className="space-y-6 min-h-[220px]">
              
              {/* Step 1: Bio */}
              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <p className="sm:col-span-2 text-[11px] text-muted-foreground italic -mt-1">
                    Your bio helps us tailor future recommendations. It does not currently move your match score &mdash; skill ratings and work preferences drive the numbers.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-border rounded bg-card text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded bg-card text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Education Level</label>
                    <select
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-border rounded bg-card text-foreground focus:outline-none"
                    >
                      <option value="High School">High School</option>
                      <option value="Bachelor's">Bachelor's Degree</option>
                      <option value="Master's">Master's Degree</option>
                      <option value="Ph.D.">Ph.D. / Doctoral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1 uppercase tracking-wider">Current Occupation</label>
                    <input
                      type="text"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded bg-card text-foreground focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Skill Sliders */}
              {step === 2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SKILL_LIST.map((sk) => (
                    <div key={sk} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-foreground">{sk}</span>
                        <span className="text-muted-foreground">{skills[sk]}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skills[sk] || 50}
                        onChange={(e) => handleSkillChange(sk, e.target.value)}
                        className="w-full accent-primary"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Step 3: Interests Checkboxes */}
              {step === 3 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <p className="col-span-2 sm:col-span-4 text-[11px] text-muted-foreground italic -mt-1">
                    Interests that align with a career&apos;s name or focus area give it a small match-score boost; skill ratings and work preferences still drive most of the score.
                  </p>
                  {INTEREST_LIST.map((int) => (
                    <button
                      key={int}
                      onClick={() => handleCheckboxToggle(interests, setInterests, int)}
                      className={`p-3 border rounded-xl text-left text-xs font-bold transition-all ${
                        interests.includes(int)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-secondary text-foreground"
                      }`}
                    >
                      {int}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 4: Personality Traits */}
              {step === 4 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <p className="col-span-2 sm:col-span-4 text-[11px] text-muted-foreground italic -mt-1">
                    This helps us understand your work style for future features. It does not currently affect your match score.
                  </p>
                  {PERSONALITY_LIST.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleCheckboxToggle(personalities, setPersonalities, p)}
                      className={`p-3 border rounded-xl text-left text-xs font-bold transition-all ${
                        personalities.includes(p)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-secondary text-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Step 5: Work Environment Preferences */}
              {step === 5 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PREFERENCE_LIST.map((pref) => (
                    <button
                      key={pref}
                      onClick={() => handleCheckboxToggle(preferences, setPreferences, pref)}
                      className={`p-3 border rounded-xl text-left text-xs font-bold transition-all ${
                        preferences.includes(pref)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-secondary text-foreground"
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* Next/Prev Navigation */}
            <div className="flex justify-between pt-6 border-t border-border">
              {step > 1 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 border border-border hover:bg-secondary rounded-lg text-xs font-bold text-foreground transition-all"
                >
                  Back Step
                </button>
              ) : (
                <div />
              )}
              {step < 5 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-extrabold rounded-lg transition-all flex items-center gap-1"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSimulate}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-danger hover:opacity-95 text-white text-xs font-black rounded-lg transition-all flex items-center gap-2 shadow-sm"
                >
                  Run Compatibility Engine <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        ) : (
          /* Results Panel side-by-side Notion style split */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: Career matches catalog list (col-span-5) */}
            <div className="lg:col-span-4 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-primary" /> Top Career Fits
              </span>
              
              <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
                {matches.map((item, idx) => {
                  const isSelected = selectedMatchIdx === idx;
                  return (
                    <div
                      key={item.name}
                      onClick={() => setSelectedMatchIdx(idx)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedMatchIdx(idx);
                        }
                      }}
                      aria-pressed={isSelected}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border/80 hover:border-primary/50 hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-extrabold text-sm text-foreground truncate max-w-[80%]">{item.name}</h4>
                        <span className="text-xs font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {item.matchScore}% Fit
                        </span>
                      </div>

                      <div className="mt-3 flex justify-between items-center text-[10px] text-muted-foreground border-t border-border/50 pt-2.5">
                        <span className="flex items-center gap-1 font-bold text-foreground">
                          <DollarSign className="w-3.5 h-3.5 text-success" /> {item.salaryRange}
                        </span>
                        <span className="uppercase tracking-wider font-extrabold px-1.5 py-0.5 bg-secondary rounded text-[9px]">
                          {item.learningDifficulty} Study
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Col: active career workspace with tabs (col-span-7) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Tabs list bar */}
              <div className="flex bg-card border border-border p-1 rounded-xl shadow-xs">
                {["analytics", "roadmap", "2050"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all ${
                      activeTab === tab
                        ? "bg-primary text-white shadow-xs"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {tab === "analytics" ? "📊 Fit Analytics" : tab === "roadmap" ? "🗺️ Study Roadmap" : "🚀 2050 Destiny"}
                  </button>
                ))}
              </div>

              {/* Inspect details card */}
              {activeTab === "analytics" && activeCareer && (
                <div className="space-y-6">
                  {/* Biography snapshot */}
                  <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex justify-between items-start border-b border-border/60 pb-4">
                      <div>
                        <h2 className="text-2xl font-black text-foreground">{activeCareer.name}</h2>
                        <p className="text-xs text-primary font-bold mt-1">Growth Index: {activeCareer.growthPotential}% &bull; Outlook: {activeCareer.futureOutlook}</p>
                      </div>
                      <button
                        onClick={handlePrint}
                        className="p-2 border border-border rounded-lg hover:bg-secondary text-muted-foreground transition-all"
                        title="Print Report"
                        aria-label="Print report"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Salary range", val: activeCareer.salaryRange },
                        { label: "Future Demand", val: `${activeCareer.futureDemand}%` },
                        { label: "Automation Risk", val: `${activeCareer.automationRisk}%` },
                        { label: "Est. Prep Time", val: `${activeCareer.yearsToEnter} yrs` },
                      ].map((c, idx) => (
                        <div key={idx} className="bg-secondary/40 p-3 rounded-xl border border-border/40 text-center">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-0.5">{c.label}</span>
                          <span className="text-sm font-black text-foreground">{c.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recharts widgets */}
                  <CareerCharts activeCareer={activeCareer} matches={matches} skills={skills} />
                </div>
              )}

              {/* Study milestones */}
              {activeTab === "roadmap" && activeCareer && (
                <CareerRoadmap activeCareer={activeCareer} />
              )}

              {/* Spinner Destiny spinner */}
              {activeTab === "2050" && (
                <FunFeatures />
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
