import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  calculateGPA, 
  calculateCGPA, 
  convertToPercentage,
  GRADE_POINTS 
} from "../utils/calculator-logic";
import SubjectRow from "../components/SubjectRow";
import SemesterRow from "../components/SemesterRow";
import ResultCard from "../components/ResultCard";
import StatsDashboard from "../components/StatsDashboard";
import PredictorPanel from "../components/PredictorPanel";
import ConverterPanel from "../components/ConverterPanel";

const ToolHome = () => {
  // Tab State
  const [activeTab, setActiveTab] = useState("gpa"); // gpa, cgpa, predictor

  // GPA State
  const [subjects, setSubjects] = useState([
    { name: "Mathematics I", credits: 4, grade: "A+" }
  ]);
  const [gpaResult, setGpaResult] = useState({ gpa: 0, totalCredits: 0 });

  // CGPA State
  const [semesters, setSemesters] = useState([
    { name: "Semester 1", gpa: 8.5, credits: 24 }
  ]);
  const [cgpaResult, setCgpaResult] = useState({ cgpa: 0, totalCredits: 0 });
  const [percentage, setPercentage] = useState(0);

  // Live Calculations
  useEffect(() => {
    setGpaResult(calculateGPA(subjects));
  }, [subjects]);

  useEffect(() => {
    const res = calculateCGPA(semesters);
    setCgpaResult(res);
    setPercentage(convertToPercentage(res.cgpa));
  }, [semesters]);

  // Actions
  const addSubject = () => {
    setSubjects([...subjects, { name: "", credits: 3, grade: "A" }]);
  };

  const updateSubject = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const removeSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const addSemester = () => {
    setSemesters([...semesters, { name: `Semester ${semesters.length + 1}`, gpa: 8.0, credits: 20 }]);
  };

  const updateSemester = (index, field, value) => {
    const newSemesters = [...semesters];
    newSemesters[index][field] = value;
    setSemesters(newSemesters);
  };

  const removeSemester = (index) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter((_, i) => i !== index));
    }
  };

  const resetTool = () => {
    if (activeTab === "gpa") {
      setSubjects([{ name: "Subject 1", credits: 4, grade: "A+" }]);
    } else {
      setSemesters([{ name: "Semester 1", gpa: 8.5, credits: 24 }]);
    }
  };

  const copySummary = () => {
    let text = "";
    if (activeTab === "gpa") {
      text = `GPA Report\nTotal Credits: ${gpaResult.totalCredits}\nGPA: ${gpaResult.gpa}`;
    } else {
      text = `CGPA Report\nTotal Credits: ${cgpaResult.totalCredits}\nCGPA: ${cgpaResult.cgpa}\nPercentage: ${percentage}%`;
    }
    navigator.clipboard.writeText(text);
    alert("Summary copied to clipboard!");
  };

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-(--background) text-(--primary) text-center mb-8"
      >
        <h1 className="heading flex justify-center gap-2 animate-fade-up">
          GPA / CGPA Calculator
        </h1>
        <p className="description opacity-90 mt-2 text-(--secondary) text-2xl animate-fade-up">
          Smart academic tracking and performance prediction
        </p>
      </motion.div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto bg-(--card) rounded-3xl shadow-2xl overflow-hidden animate-fade-up border border-(--border)">
        
        {/* Navigation Tabs */}
        <div className="flex bg-(--background) p-2 gap-2 border-b border-(--border)">
          {[
            { id: "gpa", label: "Semester GPA", icon: "📊" },
            { id: "cgpa", label: "Overall CGPA", icon: "🎓" },
            { id: "predictor", label: "GPA Predictor", icon: "🚀" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeTab === tab.id 
                  ? "bg-(--primary) text-white shadow-lg shadow-blue-500/20" 
                  : "text-(--muted-foreground) hover:bg-(--card) hover:text-(--foreground)"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "gpa" && (
              <motion.div
                key="gpa-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col gap-8">
                  {/* Subject List */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-xl font-black flex items-center gap-2">
                        Subjects
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{subjects.length}</span>
                      </h3>
                      <button 
                        onClick={addSubject}
                        className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                        Add Subject
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                      {subjects.map((sub, idx) => (
                        <SubjectRow 
                          key={idx} 
                          index={idx} 
                          subject={sub} 
                          updateSubject={updateSubject} 
                          removeSubject={removeSubject}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Sidebar Results */}
                  <div className="grid grid-cols-1 gap-8">
                    <ResultCard 
                      type="Semester GPA" 
                      value={gpaResult.gpa} 
                      totalCredits={gpaResult.totalCredits} 
                    />
                    
                    <StatsDashboard 
                      gpaTrend={[7.8, 8.2, gpaResult.gpa]} // Dummy trend for visual
                      creditDist={subjects.map(s => ({ name: s.name || "Unnamed", credits: parseFloat(s.credits) || 0 }))}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "cgpa" && (
              <motion.div
                key="cgpa-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col gap-8">
                  {/* Semester List */}
                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-1">
                      <h3 className="text-xl font-black flex items-center gap-2">
                        Semesters
                        <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">{semesters.length}</span>
                      </h3>
                      <button 
                        onClick={addSemester}
                        className="btn-primary px-4 py-2 rounded-xl text-xs flex items-center gap-2"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                        Add Semester
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                      {semesters.map((sem, idx) => (
                        <SemesterRow 
                          key={idx} 
                          index={idx} 
                          semester={sem} 
                          updateSemester={updateSemester} 
                          removeSemester={removeSemester}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Sidebar Results */}
                  <div className="grid grid-cols-1 gap-8">
                    <ResultCard 
                      type="Overall CGPA" 
                      value={cgpaResult.cgpa} 
                      totalCredits={cgpaResult.totalCredits} 
                    />
                    <StatsDashboard 
                      gpaTrend={semesters.map(s => parseFloat(s.gpa) || 0)}
                      creditDist={semesters.map(s => ({ name: s.name || "Unnamed", credits: parseFloat(s.credits) || 0 }))}
                    />
                    <ConverterPanel cgpa={cgpaResult.cgpa} percentage={percentage} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "predictor" && (
              <motion.div
                key="predictor-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto py-8"
              >
                <PredictorPanel 
                  currentCGPA={cgpaResult.cgpa} 
                  currentCredits={cgpaResult.totalCredits} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Global Actions */}
          <div className="mt-12 pt-8 border-t border-(--border) flex flex-wrap gap-4 justify-between items-center">
             <div className="flex gap-4">
                <button 
                  onClick={copySummary}
                  className="flex items-center gap-2 text-sm font-bold text-(--foreground) hover:text-(--primary) transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  Copy Summary
                </button>
                <button 
                  className="flex items-center gap-2 text-sm font-bold text-(--foreground) hover:text-(--primary) transition-all"
                  onClick={() => window.print()}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
                  Download Report
                </button>
             </div>
             <button 
               onClick={resetTool}
               className="text-sm font-bold text-red-500 hover:text-red-600 transition-all"
             >
               Reset Calculator
             </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .animate-fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default ToolHome;
