import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, AlertCircle, BookOpen } from "lucide-react";

const MarksInput = ({ subjects, setSubjects }) => {
  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now(), name: "", obtained: "", total: 100 }]);
  };

  const removeSubject = (id) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((s) => s.id !== id));
    }
  };

  const updateSubject = (id, field, value) => {
    setSubjects(
      subjects.map((s) => {
        if (s.id === id) {
          return { ...s, [field]: value };
        }
        return s;
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-0.5">
          <h3 className="text-lg font-black text-(--foreground) tracking-tight">Subject Details</h3>
          <p className="text-[10px] font-bold text-(--muted-foreground) uppercase tracking-widest">Entry Panel</p>
        </div>
        <button
          onClick={addSubject}
          className="btn-primary group flex items-center gap-2 px-5 py-2.5 text-xs shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Add Subject
        </button>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
        <AnimatePresence mode="popLayout">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              className="p-6 bg-(--background) border border-(--border) rounded-[2rem] relative group shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-xs font-black">
                       {index + 1}
                    </div>
                    <span className="text-xs font-black text-(--muted-foreground) uppercase tracking-widest">Subject</span>
                 </div>
                 <button
                    onClick={() => removeSubject(subject.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    disabled={subjects.length === 1}
                  >
                    <Trash2 size={18} />
                  </button>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-(--muted-foreground) uppercase tracking-[0.2em] ml-2">
                    Subject Name
                  </label>
                  <div className="relative group/input">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted-foreground) group-focus-within/input:text-indigo-600 transition-colors">
                       <BookOpen size={16} />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Mathematics"
                      value={subject.name}
                      onChange={(e) => updateSubject(subject.id, "name", e.target.value)}
                      className="w-full bg-(--card) border border-(--border) rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-(--muted-foreground) uppercase tracking-[0.2em] ml-2">
                      Obtained
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="0"
                        value={subject.obtained}
                        onChange={(e) => updateSubject(subject.id, "obtained", e.target.value)}
                        className={`w-full bg-(--card) border ${
                          parseFloat(subject.obtained) > parseFloat(subject.total)
                            ? "border-red-500"
                            : "border-(--border)"
                        } rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold`}
                      />
                      {parseFloat(subject.obtained) > parseFloat(subject.total) && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                          <AlertCircle size={16} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-(--muted-foreground) uppercase tracking-[0.2em] ml-2">
                      Out Of
                    </label>
                    <input
                      type="number"
                      placeholder="100"
                      value={subject.total}
                      onChange={(e) => updateSubject(subject.id, "total", e.target.value)}
                      className="w-full bg-(--card) border border-(--border) rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              {parseFloat(subject.obtained) > parseFloat(subject.total) && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-xl text-[10px] text-red-500 font-bold flex items-center gap-2 border border-red-100 dark:border-red-900/20"
                >
                  <AlertCircle size={14} />
                  Marks obtained cannot exceed total.
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MarksInput;
