"use client";

import { useState, useRef } from "react";
import { Upload, X, RefreshCw, Copy, Download, Info, Check, Sparkles, Heart, Baby, Eye } from "lucide-react";
import { getFaceApi } from "../../emotion-detector/services/faceApiClient";

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

  const [photo1, setPhoto1] = useState(null); // Father's photo
  const [photo2, setPhoto2] = useState(null); // Mother's photo

  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);

  const processFile = (file, parentNum) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size exceeds the 10MB limit.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      if (parentNum === 1) {
        setPhoto1({ src: e.target.result, name: file.name, size: file.size });
      } else {
        setPhoto2({ src: e.target.result, name: file.name, size: file.size });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!fatherName.trim() || !motherName.trim() || !fatherEyes || !motherEyes || !fatherHair || !motherHair) return;

    setAnalyzing(true);
    setResult(null);
    setError("");

    try {
      const faceapi = await getFaceApi();

      // Load images if uploaded
      const loadImg = (src) => new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
      });

      let det1 = null;
      let det2 = null;

      if (photo1 && photo2) {
        const [img1, img2] = await Promise.all([
          loadImg(photo1.src),
          loadImg(photo2.src)
        ]);

        const MODEL_URL = "/models";
        if (!faceapi.nets.tinyFaceDetector.params) {
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        }
        if (!faceapi.nets.faceLandmark68Net.params) {
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        }

        [det1, det2] = await Promise.all([
          faceapi.detectSingleFace(img1, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(),
          faceapi.detectSingleFace(img2, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
        ]);
      }

      let seed = 0;
      if (det1 && det2) {
        const pts1 = det1.landmarks.positions;
        const pts2 = det2.landmarks.positions;
        const sum1 = pts1.reduce((acc, p) => acc + p.x + p.y, 0);
        const sum2 = pts2.reduce((acc, p) => acc + p.x + p.y, 0);
        seed = Math.round(sum1 + sum2);
      } else {
        // Fallback names hash seed
        let hash = 0;
        const combined = fatherName + motherName;
        for (let i = 0; i < combined.length; i++) {
          hash = (hash << 5) - hash + combined.charCodeAt(i);
          hash |= 0;
        }
        seed = Math.abs(hash);
      }

      // Trait predictions
      const eyeInheritance = Math.min(99, Math.round(((seed * 3) % 21) + 79));
      const noseInheritance = Math.min(99, Math.round(((seed * 7) % 21) + 79));
      const mouthInheritance = Math.min(99, Math.round(((seed * 11) % 21) + 79));

      // Punnett square eye colors
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

      // Punnett square hair types
      let hairDist = { straight: 0, wavy: 0, curly: 0 };
      if (fatherHair === "Straight" && motherHair === "Straight") {
        hairDist = { straight: 95, wavy: 5, curly: 0 };
      } else if (fatherHair === "Curly" && motherHair === "Curly") {
        hairDist = { straight: 0, wavy: 20, curly: 80 };
      } else if (fatherHair === "Wavy" && motherHair === "Wavy") {
        hairDist = { straight: 25, wavy: 50, curly: 25 };
      } else if ((fatherHair === "Straight" && motherHair === "Curly") || (fatherHair === "Curly" && motherHair === "Straight")) {
        hairDist = { straight: 15, wavy: 70, curly: 15 };
      } else {
        hairDist = { straight: 20, wavy: 50, curly: 30 };
      }

      // Names & characteristics
      const boyName1 = MALE_NAMES[seed % MALE_NAMES.length];
      const boyName2 = MALE_NAMES[(seed + 3) % MALE_NAMES.length];
      const girlName1 = FEMALE_NAMES[seed % FEMALE_NAMES.length];
      const girlName2 = FEMALE_NAMES[(seed + 3) % FEMALE_NAMES.length];

      const personality = PERSONALITIES[seed % PERSONALITIES.length];
      const hobby = HOBBIES[seed % HOBBIES.length];

      setResult({
        eyeInheritance,
        noseInheritance,
        mouthInheritance,
        eyeDist,
        hairDist,
        boyNames: [boyName1, boyName2],
        girlNames: [girlName1, girlName2],
        personality,
        hobby,
        matchedByAI: !!(det1 && det2)
      });
      setAnalyzing(false);
    } catch (err) {
      console.error(err);
      setError("An error occurred during baby generation calculations. Please try again.");
      setAnalyzing(false);
    }
  };

  const formatReportText = () => {
    if (!result) return "";
    return `=== ALTFTool Future Baby Prediction Report ===
Father: ${fatherName}
Mother: ${motherName}

Biological Trait Inheritance Probability:
------------------------------------------
Eye Color Distribution:
- Brown Eyes: ${result.eyeDist.brown}%
- Green Eyes: ${result.eyeDist.green}%
- Blue Eyes: ${result.eyeDist.blue}%

Hair Type Distribution:
- Straight: ${result.hairDist.straight}%
- Wavy: ${result.hairDist.wavy}%
- Curly: ${result.hairDist.curly}%

Suggested Baby Names:
- Boys: ${result.boyNames.join(", ")}
- Girls: ${result.girlNames.join(", ")}

Personality Projections:
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
    a.download = `future-baby-report.txt`;
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
    setPhoto1(null);
    setPhoto2(null);
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-1">
            <Baby className="text-blue-500" size={32} />
          </div>
          <h1 className="heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Future Baby Generator
          </h1>
          <p className="description text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Merge parents' facial structures and biological traits to predict your future baby's features.
          </p>
        </div>

        {/* Workspace Card */}
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          
          {error && (
            <div className="mb-6 p-4 border border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900 rounded-2xl text-sm text-red-800 dark:text-red-400">
              {error}
            </div>
          )}

          {!result && !analyzing ? (
            <form onSubmit={handleGenerate} className="space-y-6">
              
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

              {/* Photos upload (Optional but highly recommended) */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2 text-center">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Father's Photo (Optional)</span>
                  {photo1 ? (
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[var(--anslation-ds-soft)] border border-border relative">
                      <img src={photo1.src} alt="Father" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhoto1(null)}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef1.current?.click()}
                      className="w-full aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-[var(--anslation-ds-soft)] cursor-pointer flex flex-col items-center justify-center p-6 transition"
                    >
                      <Upload className="text-muted-foreground mb-2" size={24} />
                      <span className="text-xs font-semibold text-foreground">Select Father's Image</span>
                      <input
                        ref={fileInputRef1}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processFile(e.target.files[0], 1);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center">
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider block">Mother's Photo (Optional)</span>
                  {photo2 ? (
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[var(--anslation-ds-soft)] border border-border relative">
                      <img src={photo2.src} alt="Mother" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhoto2(null)}
                        className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition"
                      >
                        <X size={14} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef2.current?.click()}
                      className="w-full aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-[var(--anslation-ds-soft)] cursor-pointer flex flex-col items-center justify-center p-6 transition"
                    >
                      <Upload className="text-muted-foreground mb-2" size={24} />
                      <span className="text-xs font-semibold text-foreground">Select Mother's Image</span>
                      <input
                        ref={fileInputRef2}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            processFile(e.target.files[0], 2);
                          }
                        }}
                      />
                    </div>
                  )}
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
                <Baby size={18} /> Generate Future Baby Profile
              </button>

            </form>
          ) : analyzing ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="alt-ui-spinner alt-ui-spinner--lg mb-6 border-t-blue-500" />
              <h4 className="font-semibold text-lg text-foreground animate-pulse">Running Bio-Landmark Mergers...</h4>
              <p className="text-sm text-muted-foreground mt-2">Correlating parents' facial parameters with Punnett genetics tables.</p>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Inherited Proportions bars */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                  <Sparkles size={14} className="text-blue-500" /> Facial Structure Inheritance
                </h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-[var(--anslation-ds-soft)] rounded-2xl p-4 border border-border text-center space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Eyes Shape</span>
                    <span className="text-2xl font-black text-foreground">{result.eyeInheritance}%</span>
                    <span className="text-[10px] text-muted-foreground block font-medium">similarity to mother</span>
                  </div>
                  <div className="bg-[var(--anslation-ds-soft)] rounded-2xl p-4 border border-border text-center space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Nose Contour</span>
                    <span className="text-2xl font-black text-foreground">{result.noseInheritance}%</span>
                    <span className="text-[10px] text-muted-foreground block font-medium">similarity to father</span>
                  </div>
                  <div className="bg-[var(--anslation-ds-soft)] rounded-2xl p-4 border border-border text-center space-y-1">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block">Jaw & Chin Curve</span>
                    <span className="text-2xl font-black text-foreground">{result.mouthInheritance}%</span>
                    <span className="text-[10px] text-muted-foreground block font-medium">balanced blend</span>
                  </div>
                </div>
              </div>

              {/* Genetics distributions grids */}
              <div className="grid sm:grid-cols-2 gap-6">
                
                {/* Eyes */}
                <div className="bg-card rounded-2xl p-5 border border-border space-y-4 shadow-sm">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Eye size={14} className="text-blue-500" /> Eye Color Probability
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
                    <Sparkles size={14} className="text-blue-500" /> Hair Type Probability
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

              {/* Characteristics card */}
              <div className="bg-[var(--anslation-ds-soft)] border border-border rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-500" /> Child Personality & Passion Projections
                </h4>
                <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Personality Type:</strong> {result.personality}
                  </p>
                  <p>
                    <strong className="text-foreground">Potential Hobby:</strong> {result.hobby.name} — {result.hobby.desc}
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

        {/* Explainer FAQ Info */}
        <div className="bg-card border border-border rounded-2xl p-5 flex gap-4 items-start shadow-sm">
          <Info className="text-primary flex-shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Genetic Probability and calculations</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Future Baby Generator combines biological trait combinations (Punnett squares Eye/Hair colors) and dynamic face-api structure scans. No photo data is sent to external servers. Intended solely for entertainment!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
