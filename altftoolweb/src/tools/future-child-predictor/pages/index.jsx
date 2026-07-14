"use client";

import { useState } from "react";
import { Sparkles, RefreshCw, Copy, Download, Info, Check, Heart, HelpCircle } from "lucide-react";
import { getDeterministicMatch } from "../../love-calculator/utils/compatibilityUtils";

const EYE_COLORS = ["Brown", "Blue", "Green"];
const HAIR_TYPES = ["Straight", "Wavy", "Curly"];

const HOBBIES = [
  { name: "Lego Engineering & Robotics", desc: "Always building, logical thinker, loves solving complex puzzles." },
  { name: "Watercolor Painting & Sketching", desc: "Vibrant imagination, loves colors, spends hours drawing creative ideas." },
  { name: "Acoustic Piano & Vocals", desc: "Deeply musical, remembers tunes easily, loves performing for friends." },
  { name: "Gymnastics & Athletics", desc: "Full of high energy, active, loves running and learning new sports." },
  { name: "Astronomy & Star Gazing", desc: "Curious about the universe, loves science fiction, asks deep questions." },
  { name: "Creative Writing & Storytelling", desc: "Enjoys reading, invents fictional worlds, has a great vocabulary." }
];

const PERSONALITIES = [
  "Inquisitive Thinker (Logical, curious, loves asking 'why?')",
  "Gentle Creative (Quiet, highly imaginative, deeply empathetic)",
  "Charismatic Leader (Outgoing, helpful, loves organizing group play)",
  "Energetic Explorer (Spontaneous, loves the outdoors, brave)"
];

const MALE_NAMES = ["Liam", "Noah", "Oliver", "Lucas", "Leo", "Ethan", "Aiden", "Alexander"];
const FEMALE_NAMES = ["Emma", "Olivia", "Sophia", "Mia", "Isabella", "Amelia", "Ava", "Charlotte"];

export default function ToolHome() {
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [fatherEyes, setFatherEyes] = useState("");
  const [motherEyes, setMotherEyes] = useState("");
  const [fatherHair, setFatherHair] = useState("");
  const [motherHair, setMotherHair] = useState("");

  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const calculateGenetics = (e) => {
    e.preventDefault();
    if (!fatherName.trim() || !motherName.trim() || !fatherEyes || !motherEyes || !fatherHair || !motherHair) return;

    setCalculating(true);
    setResult(null);

    setTimeout(() => {
      const seed = getDeterministicMatch(fatherName, motherName);
      
      // Calculate deterministic eye predictions based on selections
      let eyeDist = { brown: 0, green: 0, blue: 0 };
      if (fatherEyes === "Brown" && motherEyes === "Brown") {
        eyeDist = { brown: 75, green: 18, blue: 7 };
      } else if (fatherEyes === "Blue" && motherEyes === "Blue") {
        eyeDist = { brown: 0, green: 1, blue: 99 };
      } else if (fatherEyes === "Green" && motherEyes === "Green") {
        eyeDist = { brown: 1, green: 75, blue: 24 };
      } else if ((fatherEyes === "Brown" && motherEyes === "Blue") || (fatherEyes === "Blue" && motherEyes === "Brown")) {
        eyeDist = { brown: 50, green: 0, blue: 50 };
      } else if ((fatherEyes === "Brown" && motherEyes === "Green") || (fatherEyes === "Green" && motherEyes === "Brown")) {
        eyeDist = { brown: 50, green: 38, blue: 12 };
      } else {
        eyeDist = { brown: 0, green: 50, blue: 50 };
      }

      // Calculate deterministic hair type predictions
      let hairDist = { straight: 0, wavy: 0, curly: 0 };
      if (fatherHair === "Straight" && motherHair === "Straight") {
        hairDist = { straight: 95, wavy: 5, curly: 0 };
      } else if (fatherHair === "Curly" && motherHair === "Curly") {
        hairDist = { straight: 0, wavy: 20, curly: 80 };
      } else if (fatherHair === "Wavy" && motherHair === "Wavy") {
        hairDist = { straight: 25, wavy: 50, curly: 25 };
      } else if ((fatherHair === "Straight" && motherHair === "Curly") || (fatherHair === "Curly" && motherHair === "Straight")) {
        hairDist = { straight: 15, wavy: 70, curly: 15 };
      } else if ((fatherHair === "Straight" && motherHair === "Wavy") || (fatherHair === "Wavy" && motherHair === "Straight")) {
        hairDist = { straight: 60, wavy: 40, curly: 0 };
      } else {
        hairDist = { straight: 10, wavy: 50, curly: 40 };
      }

      // Select name suggestions using seed
      const boyName1 = MALE_NAMES[seed % MALE_NAMES.length];
      const boyName2 = MALE_NAMES[(seed + 3) % MALE_NAMES.length];
      const girlName1 = FEMALE_NAMES[seed % FEMALE_NAMES.length];
      const girlName2 = FEMALE_NAMES[(seed + 3) % FEMALE_NAMES.length];

      // Select personality & hobby
      const personality = PERSONALITIES[seed % PERSONALITIES.length];
      const hobby = HOBBIES[seed % HOBBIES.length];

      setResult({
        eyeDist,
        hairDist,
        boyNames: [boyName1, boyName2],
        girlNames: [girlName1, girlName2],
        personality,
        hobby
      });
      setCalculating(false);
    }, 1500);
  };

  const formatReportText = () => {
    if (!result) return "";
    return `=== ALTFTool Future Child Genetics Report ===
Father: ${fatherName}
Mother: ${motherName}

Predicted Genetic Trait Distribution:
------------------------------------------
Eye Color:
- Brown: ${result.eyeDist.brown}%
- Green: ${result.eyeDist.green}%
- Blue: ${result.eyeDist.blue}%

Hair Type:
- Straight: ${result.hairDist.straight}%
- Wavy: ${result.hairDist.wavy}%
- Curly: ${result.hairDist.curly}%

Suggested Child Names:
- Boys: ${result.boyNames.join(", ")}
- Girls: ${result.girlNames.join(", ")}

Personality Profile:
- Trait: ${result.personality}
- Hobby: ${result.hobby.name} (${result.hobby.desc})
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
    a.download = `child-genetics-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFatherName("");
    setMotherName("");
    setFatherEyes("");
    setMotherEyes("");
    setFatherHair("");
    setMotherHair("");
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-1">
            <Heart className="text-blue-500 animate-pulse" size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Future Child Predictor
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Input parents' names and select biological trait colors to calculate a Punnett square genetic compatibility profile.
          </p>
        </div>

        {/* Workspace Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          {!result && !calculating ? (
            <form onSubmit={calculateGenetics} className="space-y-6">
              
              {/* Names input grid */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="fatherName" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Father's Name
                  </label>
                  <input
                    id="fatherName"
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="Enter father's name"
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/25 transition"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="motherName" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Mother's Name
                  </label>
                  <input
                    id="motherName"
                    type="text"
                    required
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="Enter mother's name"
                    className="w-full h-10 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/25 transition"
                  />
                </div>
              </div>

              {/* Eye Colors */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="fatherEyes" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Father's Eye Color
                  </label>
                  <select
                    id="fatherEyes"
                    required
                    value={fatherEyes}
                    onChange={(e) => setFatherEyes(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition"
                  >
                    <option value="" disabled>Select eye color</option>
                    {EYE_COLORS.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="motherEyes" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Mother's Eye Color
                  </label>
                  <select
                    id="motherEyes"
                    required
                    value={motherEyes}
                    onChange={(e) => setMotherEyes(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition"
                  >
                    <option value="" disabled>Select eye color</option>
                    {EYE_COLORS.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hair Types */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="fatherHair" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Father's Hair Type
                  </label>
                  <select
                    id="fatherHair"
                    required
                    value={fatherHair}
                    onChange={(e) => setFatherHair(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition"
                  >
                    <option value="" disabled>Select hair type</option>
                    {HAIR_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="motherHair" className="block text-xs font-bold text-foreground uppercase tracking-wider">
                    Mother's Hair Type
                  </label>
                  <select
                    id="motherHair"
                    required
                    value={motherHair}
                    onChange={(e) => setMotherHair(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary transition"
                  >
                    <option value="" disabled>Select hair type</option>
                    {HAIR_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl cursor-pointer transition active:scale-95 duration-100 flex items-center justify-center gap-2 shadow"
              >
                Predict Future Child Profile
              </button>

            </form>
          ) : calculating ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="alt-ui-spinner alt-ui-spinner--lg mb-6 border-t-blue-500" />
              <h4 className="font-semibold text-lg text-foreground animate-pulse">Running Punnett genetics matrices...</h4>
              <p className="text-sm text-muted-foreground mt-2">Checking dominant/recessive biological distributions and name compatibility indexes.</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Verdict header */}
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-black text-foreground">
                  Genetics & Trait Profile
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Inherited genetic probability for child of {fatherName} & {motherName}
                </p>
              </div>

              {/* Traits Probability Grid */}
              <div className="grid sm:grid-cols-2 gap-6">
                
                {/* Eyes */}
                <div className="bg-card rounded-2xl p-5 border border-border space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    👀 Eye Color Probability
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span>Brown Eyes</span>
                        <span>{result.eyeDist.brown}%</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-700 rounded-full" style={{ width: `${result.eyeDist.brown}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span>Green Eyes</span>
                        <span>{result.eyeDist.green}%</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${result.eyeDist.green}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span>Blue Eyes</span>
                        <span>{result.eyeDist.blue}%</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${result.eyeDist.blue}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hair */}
                <div className="bg-card rounded-2xl p-5 border border-border space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    💇 Hair Type Probability
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span>Straight Hair</span>
                        <span>{result.hairDist.straight}%</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${result.hairDist.straight}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span>Wavy Hair</span>
                        <span>{result.hairDist.wavy}%</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${result.hairDist.wavy}%` }} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-foreground">
                        <span>Curly Hair</span>
                        <span>{result.hairDist.curly}%</span>
                      </div>
                      <div className="w-full h-2 bg-[var(--anslation-ds-soft)] rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full" style={{ width: `${result.hairDist.curly}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Personality and Hobby details */}
              <div className="bg-[var(--anslation-ds-soft)] border border-border rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-500" /> Predicted Characteristics
                </h4>
                <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Personality Type:</strong> {result.personality}
                  </p>
                  <p>
                    <strong className="text-foreground">Potential Passion:</strong> {result.hobby.name} — {result.hobby.desc}
                  </p>
                </div>
              </div>

              {/* Name suggestions */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-background border border-border rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Suggested Boy Names</span>
                  <div className="flex gap-2 flex-wrap">
                    {result.boyNames.map((name) => (
                      <span key={name} className="px-2.5 py-1 bg-blue-500/10 text-blue-600 rounded-full text-xs font-semibold">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-background border border-border rounded-xl p-4 space-y-2">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Suggested Girl Names</span>
                  <div className="flex gap-2 flex-wrap">
                    {result.girlNames.map((name) => (
                      <span key={name} className="px-2.5 py-1 bg-pink-500/10 text-pink-600 rounded-full text-xs font-semibold">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                      <Copy size={18} /> Copy Report
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

        {/* Explain info */}
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <Info className="text-primary flex-shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">How is the genetics calculated?</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This predictor combines standard Punnett square genetic likelihoods for eye color and hair type based on parent choices, supplemented by name hashes for other fun baby attributes. Calculated locally. Intended strictly for entertainment!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
