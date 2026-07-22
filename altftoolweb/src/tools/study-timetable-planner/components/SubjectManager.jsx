"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, X, BookOpen, AlertCircle, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SubjectManager({ subjects, onAdd, onUpdate, onDelete }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: "",
    difficulty: "medium",
    priority: "medium",
    examDate: "",
    dailyTarget: 2,
    chapters: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSubject.name) return;
    onAdd({
      ...newSubject,
      chapters: newSubject.chapters.split(",").map(c => c.trim()).filter(Boolean)
    });
    setNewSubject({ name: "", difficulty: "medium", priority: "medium", examDate: "", dailyTarget: 2, chapters: "" });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Subject Management</h2>
          <p className="text-sm text-(--muted-foreground)">Add and organize your subjects for study planning.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-(--primary) text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Subject
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-(--card) p-6 rounded-2xl border border-(--border) shadow-xl"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-80">Subject Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Physics"
                    value={newSubject.name}
                    onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                    className="w-full px-3 py-2 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-(--primary)/20 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5 opacity-80">Chapters (Comma separated)</label>
                  <textarea
                    placeholder="e.g. Thermodynamics, Optics, Quantum..."
                    value={newSubject.chapters}
                    onChange={e => setNewSubject({...newSubject, chapters: e.target.value})}
                    className="w-full px-3 py-2 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-(--primary)/20 h-20 resize-none text-xs"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 opacity-80">Difficulty</label>
                    <select
                      value={newSubject.difficulty}
                      onChange={e => setNewSubject({...newSubject, difficulty: e.target.value})}
                      className="w-full px-3 py-2 bg-(--background) border border-(--border) rounded-xl outline-none text-xs"
                    >
                      <option value="low">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="high">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 opacity-80">Priority</label>
                    <select
                      value={newSubject.priority}
                      onChange={e => setNewSubject({...newSubject, priority: e.target.value})}
                      className="w-full px-3 py-2 bg-(--background) border border-(--border) rounded-xl outline-none text-xs"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 opacity-80">Exam Date</label>
                    <input
                      type="date"
                      value={newSubject.examDate}
                      onChange={e => setNewSubject({...newSubject, examDate: e.target.value})}
                      className="w-full px-3 py-2 bg-(--background) border border-(--border) rounded-xl outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5 opacity-80">Daily Target (Hrs)</label>
                    <input
                      type="number"
                      min="1" max="12"
                      value={newSubject.dailyTarget}
                      onChange={e => setNewSubject({...newSubject, dailyTarget: e.target.value})}
                      className="w-full px-3 py-2 bg-(--background) border border-(--border) rounded-xl outline-none text-xs"
                    />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-(--border)">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-2.5 rounded-xl font-bold border border-(--border) hover:bg-(--card-hover-bg) transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold bg-(--primary) text-white shadow-lg hover:opacity-90 transition-all"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {subjects.map(subject => (
          <motion.div
            layout
            key={subject.id}
            className="bg-(--card) rounded-2xl border border-(--border) p-5 shadow-sm group hover:border-(--primary) transition-all relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-1.5 h-full ${
              subject.difficulty === 'high' ? 'bg-red-500' :
              subject.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
            }`} />

            <div className="flex justify-between items-start mb-3">
              <div className="p-2.5 rounded-xl bg-(--background) text-(--primary) group-hover:bg-(--primary) group-hover:text-white transition-all">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => onDelete(subject.id)} className="p-1.5 text-(--muted-foreground) hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold mb-0.5">{subject.name}</h3>
            <p className="text-[11px] text-(--muted-foreground) mb-3">
              {subject.chapters?.length || 0} Chapters • {subject.dailyTarget}h daily target
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <Badge label="Difficulty" value={subject.difficulty} color={subject.difficulty === 'high' ? 'red' : subject.difficulty === 'medium' ? 'yellow' : 'green'} />
              <Badge label="Priority" value={subject.priority} color={subject.priority === 'high' ? 'red' : subject.priority === 'medium' ? 'yellow' : 'green'} />
            </div>

            {subject.examDate && (
              <div className="flex items-center gap-2 text-xs text-(--muted-foreground) bg-(--background) p-2 rounded-lg border border-(--border)">
                <Calendar className="w-3.5 h-3.5" />
                Exam on {new Date(subject.examDate).toLocaleDateString()}
              </div>
            )}
          </motion.div>
        ))}

        {subjects.length === 0 && !isAdding && (
          <div className="md:col-span-2 lg:col-span-3 py-20 flex flex-col items-center justify-center text-center text-(--muted-foreground) bg-(--card)/50 border border-dashed border-(--border) rounded-2xl">
            <BookOpen className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg font-bold mb-1">No subjects added yet</p>
            <p className="text-sm">Start by adding your subjects to plan your schedule.</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-6 px-6 py-2 bg-(--primary) text-white rounded-xl font-bold shadow-lg"
            >
              Add First Subject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ label, value, color }) {
  const colors = {
    red: "bg-red-500/10 text-red-600 border-red-500/20",
    yellow: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    green: "bg-green-500/10 text-green-600 border-green-500/20",
  };
  return (
    <div className={`px-2 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider text-center ${colors[color]}`}>
      <span className="opacity-60 block mb-0.5">{label}</span>
      {value}
    </div>
  );
}
