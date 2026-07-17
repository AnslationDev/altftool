"use client";

import React, { useState } from "react";
import { 
  Stethoscope, 
  Activity, 
  Brain, 
  Droplet, 
  Eye, 
  Heart, 
  Smile, 
  Utensils,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const diseaseDatabase = {
  "Common Cold": ["cough", "sneezing", "runny nose", "sore throat", "fatigue"],
  "Flu": ["fever", "body aches", "fatigue", "cough", "headache", "chills"],
  "Migraine": ["headache", "nausea", "sensitivity to light", "blurred vision"],
  "COVID-19": ["fever", "cough", "shortness of breath", "fatigue", "loss of taste"],
  "Food Poisoning": ["vomiting", "diarrhea", "stomach pain", "nausea", "fever"],
  "Asthma": ["shortness of breath", "wheezing", "chest tightness", "cough"],
  "Allergic Reaction": ["rash", "itchy eyes", "sneezing", "swelling", "redness"],
  "Depression": ["sadness", "loss of interest", "fatigue", "difficulty sleeping"],
  "Hypertension": ["headache", "dizziness", "fatigue", "chest pain"],
  "Diabetes": ["frequent urination", "fatigue", "weight loss", "thirst", "blurred vision"],
};

const symptomCategories = [
  {
    title: "General Symptoms",
    icon: <Activity size={16} className="text-blue-500" />,
    items: [
      "fever", "fatigue", "chills", "sweating",
      "weight loss", "weight gain", "loss of appetite"
    ],
  },
  {
    title: "Neurological",
    icon: <Brain size={16} className="text-purple-500" />,
    items: [
      "headache", "dizziness", "confusion", "seizures",
      "tremor", "memory loss", "difficulty concentrating",
      "sensitivity to light"
    ],
  },
  {
    title: "Respiratory",
    icon: <Activity size={16} className="text-emerald-500" />,
    items: [
      "cough", "shortness of breath", "wheezing",
      "chest tightness", "sore throat", "runny nose",
      "sneezing"
    ],
  },
  {
    title: "Cardiovascular",
    icon: <Heart size={16} className="text-rose-500" />,
    items: [
      "chest pain", "rapid heartbeat", "chest tightness",
      "high blood pressure", "low blood pressure"
    ],
  },
  {
    title: "Skin & Allergy",
    icon: <Droplet size={16} className="text-pink-500" />,
    items: [
      "itchy eyes", "rash", "redness", "swelling",
      "dry skin", "scaly skin", "blisters", "pale skin"
    ],
  },
  {
    title: "Vision & Hearing",
    icon: <Eye size={16} className="text-cyan-500" />,
    items: [
      "blurred vision", "hearing loss", "ringing in ears"
    ],
  },
  {
    title: "Mental & Emotional",
    icon: <Smile size={16} className="text-amber-500" />,
    items: [
      "restlessness", "difficulty sleeping", "sadness",
      "irritability", "loss of interest", "nervousness",
      "nausea"
    ],
  },
  {
    title: "Digestive",
    icon: <Utensils size={16} className="text-green-500" />,
    items: [
      "stomach pain", "abdominal pain", "diarrhea",
      "constipation", "bloating", "heartburn",
      "vomiting", "loss of taste"
    ],
  },
];

export default function ToolHome() {
  const [page, setPage] = useState("home");
  const [userInfo, setUserInfo] = useState({ 
    name: "", 
    age: "", 
    gender: "", 
    email: "" 
  });
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [predictions, setPredictions] = useState([]);

  const handleToggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) 
        ? prev.filter((s) => s !== symptom) 
        : [...prev, symptom]
    );
  };

  const handlePredict = () => {
    if (selectedSymptoms.length === 0) return;
    
    // Score matching
    const scores = Object.entries(diseaseDatabase).map(([disease, symptoms]) => {
      const matches = symptoms.filter((s) => selectedSymptoms.includes(s));
      const confidence = (matches.length / symptoms.length) * 100;
      return [disease, confidence];
    });

    const sortedResults = scores
      .filter(([, confidence]) => confidence > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    setPredictions(sortedResults);
    setPage("results");
  };

  const handleReset = () => {
    setUserInfo({ name: "", age: "", gender: "", email: "" });
    setSelectedSymptoms([]);
    setPredictions([]);
    setPage("home");
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Stethoscope className="h-5 w-5 text-primary group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Health Pre
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Symptom Analysis
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Identify potential health conditions based on selected symptoms. Run local patterns and explore matching confidence percentages instantly.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["No Account Required", "100% Secure", "Instant Analysis"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle className="h-3 w-3 text-primary animate-pulse" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Step 1: Home Page */}
        {page === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              <div className="space-y-2">
                <h2 className="text-base font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} className="text-primary" />
                  AI-Powered Symptom Checking
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                  Get immediate clarity on what your symptoms might mean. By stepping through our checker, you can select specific details and evaluate potential clinical configurations instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-surface-soft rounded-xl border border-border/60">
                  <Activity className="w-5 h-5 text-primary" />
                  <span className="text-xs font-bold text-foreground">Symptom Checker</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-surface-soft rounded-xl border border-border/60">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <span className="text-xs font-bold text-foreground">Pattern Analysis</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-surface-soft rounded-xl border border-border/60">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold text-foreground">Not a Diagnosis</span>
                </div>
              </div>

              <button
                onClick={() => setPage("userinfo")}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold text-xs hover:brightness-110 transition cursor-pointer"
              >
                Start Health Check <ChevronRight size={14} />
              </button>
            </div>

            <div className="lg:col-span-1 bg-surface-soft border border-border p-6 rounded-2xl flex flex-col justify-center">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Clinical Disclaimer</h3>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                    The calculations, matches, and details provided by Health Pre are purely informational and statistical. They do not constitute diagnostic medical advice, prescriptions, or treatment plans. Seek standard clinical consultations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: User Info */}
        {page === "userinfo" && (
          <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Personal Information</h2>
              <p className="text-xs text-muted-foreground font-semibold">Please provide basic info to help customize symptom analysis.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Age</label>
                  <input
                    type="number"
                    placeholder="e.g. 28"
                    value={userInfo.age}
                    onChange={(e) => setUserInfo({ ...userInfo, age: e.target.value })}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Gender</label>
                  <select
                    value={userInfo.gender}
                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
              <button
                onClick={() => setPage("home")}
                className="inline-flex items-center gap-1.5 text-foreground bg-background border border-border rounded-xl px-4 py-2 text-xs font-bold hover:border-primary transition cursor-pointer"
              >
                <ChevronLeft size={14} /> Back
              </button>

              <button
                onClick={() => setPage("symptoms")}
                disabled={!userInfo.name || !userInfo.age || !userInfo.gender}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-xs font-bold hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
              >
                Next: Select Symptoms <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Symptoms Selection */}
        {page === "symptoms" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Select Your Symptoms</h2>
              <p className="text-xs text-muted-foreground font-semibold">Choose all the physiological symptoms you are currently experiencing to run matches.</p>
            </div>

            <div className="space-y-6">
              {symptomCategories.map((category, index) => (
                <div key={index} className="border border-border/80 rounded-xl p-4 bg-surface-soft/40 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground uppercase tracking-wider">
                    {category.icon}
                    <span>{category.title}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {category.items.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => handleToggleSymptom(symptom)}
                        className={`flex items-center justify-start gap-2 p-2.5 rounded-xl border text-xs font-bold text-left transition-colors cursor-pointer ${
                          selectedSymptoms.includes(symptom)
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-card border-border text-foreground hover:bg-surface-soft"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSymptoms.includes(symptom)}
                          onChange={() => {}} // Controlled by button onClick
                          className="accent-primary h-3.5 w-3.5 rounded shrink-0 cursor-pointer"
                        />
                        <span className="capitalize">{symptom}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border mt-4">
              <button
                onClick={() => setPage("userinfo")}
                className="inline-flex items-center gap-1.5 text-foreground bg-background border border-border rounded-xl px-4 py-2 text-xs font-bold hover:border-primary transition cursor-pointer"
              >
                <ChevronLeft size={14} /> Back
              </button>

              <button
                onClick={handlePredict}
                disabled={selectedSymptoms.length === 0}
                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-xl px-4 py-2 text-xs font-bold hover:brightness-110 transition disabled:opacity-50 cursor-pointer"
              >
                Analyze Symptoms <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {page === "results" && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Health Analysis Results</h2>
                <p className="text-xs text-muted-foreground font-semibold">Matched config for {userInfo.name} ({userInfo.age}y, {userInfo.gender}) based on {selectedSymptoms.length} symptom(s).</p>
              </div>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-foreground bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-bold hover:border-primary transition cursor-pointer"
              >
                <RotateCcw size={14} /> New Analysis
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Predictions List */}
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-3 flex items-center gap-1.5">
                  <Activity size={14} className="text-primary" />
                  Potential Conditions
                </h3>

                {predictions.length > 0 ? (
                  <div className="space-y-4">
                    {predictions.map(([disease, confidence], index) => (
                      <div key={disease} className="border border-border/80 rounded-xl p-4 bg-surface-soft/30 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-sm text-foreground">{disease}</h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            confidence > 70 ? "bg-red-500/10 text-red-500" : confidence > 40 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                          }`}>
                            {Math.round(confidence)}% Match
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="w-full bg-surface-soft border border-border rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full transition-all duration-500"
                              style={{ width: `${confidence}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground font-semibold leading-relaxed">
                          {index === 0 
                            ? "This condition shows the highest match index against the selected symptoms. It represents a statistical correlation and not a medical confirmation." 
                            : "This condition also shows a partial match index. It is listed to offer additional contextual information."}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-2">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">No Matches Found</h4>
                    <p className="text-[11px] text-muted-foreground font-semibold max-w-sm mx-auto">
                      Our current symptom configuration didn't return any clear correlations. Consider revising selected parameters or consulting professional practitioners.
                    </p>
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Active Symptoms list */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-3">Selected Symptoms</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSymptoms.map((sym) => (
                      <span key={sym} className="inline-flex rounded-lg border border-border bg-surface-soft px-2.5 py-1 text-[10px] font-bold text-foreground capitalize">
                        {sym}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border pb-3 flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-primary" />
                    Recommended Next Steps
                  </h3>

                  <ul className="space-y-2 text-[11px] font-semibold text-muted-foreground leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Log new occurrences or pattern changes regularly.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Schedule standard follow-ups with primary care clinics.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Consult specialists if symptoms worsen or stay severe.</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            <div className="flex justify-center pt-4">
              <button
                onClick={() => setPage("symptoms")}
                className="inline-flex items-center gap-1.5 text-foreground bg-background border border-border rounded-xl px-4 py-2 text-xs font-bold hover:border-primary transition cursor-pointer"
              >
                <ChevronLeft size={14} /> Back to Symptoms
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
