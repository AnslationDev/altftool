import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Info, Calendar, Clock, Activity, Zap, Moon, Smile } from "lucide-react";

const CATEGORIES = [
  "Headache", "Fever", "Digestive", "Stress", "Anxiety",
  "Fatigue", "Muscle Pain", "Allergy", "Sleep Issues", "Respiratory", "Skin", "Other"
];

const COMMON_SYMPTOMS = [
  "Migraine", "Tension Headache", "Cluster Headache", "Sinus Pain",
  "Nausea", "Stomach Ache", "Bloating", "Heartburn", "Acid Reflux", "Diarrhea", "Constipation",
  "Fever", "Chills", "Night Sweats",
  "Fatigue", "Brain Fog", "Dizziness", "Vertigo",
  "Back Pain", "Neck Pain", "Joint Pain", "Muscle Cramps", "Shoulder Tension",
  "Cough", "Sore Throat", "Runny Nose", "Chest Congestion", "Shortness of Breath",
  "Skin Rash", "Itching", "Hives", "Dry Skin",
  "Anxiety", "Panic Attack", "Palpitations", "Irritability", "Low Mood",
  "Insomnia", "Restless Legs", "Frequent Waking"
];

const TRIGGERS = [
  "None", "Stress", "Lack of Sleep", "Dehydration", "Poor Diet", "Caffeine",
  "Alcohol", "Weather Change", "Bright Lights", "Loud Noise", "Physical Exertion",
  "Medication Side Effect", "Allergen Exposure", "Work Pressure", "Screen Time"
];

export default function SymptomForm({ onAdd }) {
  const [formData, setFormData] = useState({
    symptom: "",
    severity: 5,
    category: "Headache",
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    duration: "",
    notes: "",
    trigger: "None",
    medication: "",
    mood: "Neutral",
    energy: 5,
    sleepQuality: 5
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.symptom) return;
    onAdd({ ...formData, id: Date.now() });
    // Reset some fields
    setFormData(prev => ({
      ...prev,
      symptom: "",
      duration: "",
      notes: "",
      medication: ""
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-(--card) p-8 rounded-3xl border border-(--border) shadow-xl overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-8 border-b border-(--border) pb-6">
        <PlusCircle className="text-blue-600" size={26} />
        <h2 className="text-2xl font-black text-(--foreground) uppercase tracking-tighter">Log New Symptom</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-(--muted-foreground) uppercase tracking-widest ml-1">Symptom Name</label>
            <input
              type="text"
              name="symptom"
              value={formData.symptom}
              onChange={handleChange}
              list="symptom-list"
              placeholder="e.g. Migraine"
              className="w-full bg-(--background) border border-(--border) rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-medium text-(--foreground) placeholder:text-(--muted-foreground)/50"
              required
            />
            <datalist id="symptom-list">
              {COMMON_SYMPTOMS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-(--muted-foreground) uppercase tracking-widest ml-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-(--background) border border-(--border) rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg font-medium text-(--foreground) appearance-none cursor-pointer"
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-(--card)">{cat}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-5 bg-(--background) p-6 rounded-2xl border border-(--border)">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-black text-(--foreground) uppercase tracking-widest flex items-center gap-2">
              <Activity size={18} className="text-blue-600" /> Severity Level
            </label>
            <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-black shadow-lg shadow-blue-500/20">{formData.severity}/10</span>
          </div>
          <input
            type="range"
            name="severity"
            min="1"
            max="10"
            value={formData.severity}
            onChange={handleChange}
            className="w-full h-2.5 bg-(--muted) rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] font-bold text-(--muted-foreground) uppercase tracking-widest">
            <span>Mild</span>
            <span>Moderate</span>
            <span>Severe</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-(--muted-foreground) uppercase tracking-widest flex items-center gap-1 ml-1">
              <Calendar size={14} /> Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base font-medium text-(--foreground)"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-(--muted-foreground) uppercase tracking-widest flex items-center gap-1 ml-1">
              <Clock size={14} /> Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base font-medium text-(--foreground)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-(--muted-foreground) uppercase tracking-widest ml-1">Trigger</label>
            <select
              name="trigger"
              value={formData.trigger}
              onChange={handleChange}
              className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base font-medium text-(--foreground) appearance-none cursor-pointer"
            >
              {TRIGGERS.map(t => <option key={t} value={t} className="bg-(--card)">{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-(--muted-foreground) uppercase tracking-widest ml-1">Duration</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 30 mins"
              className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base font-medium text-(--foreground) placeholder:text-(--muted-foreground)/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2 p-4 bg-(--background) rounded-2xl border border-(--border)">
            <label className="text-[10px] font-black text-(--muted-foreground) uppercase tracking-widest flex items-center gap-1">
              <Smile size={12} /> Mood
            </label>
            <select
              name="mood"
              value={formData.mood}
              onChange={handleChange}
              className="w-full bg-transparent border-b border-(--border) focus:border-blue-500 outline-none py-1 text-xs font-bold text-(--foreground)"
            >
              <option className="bg-(--card)">Happy</option>
              <option className="bg-(--card)">Neutral</option>
              <option className="bg-(--card)">Sad</option>
              <option className="bg-(--card)">Irritable</option>
              <option className="bg-(--card)">Anxious</option>
            </select>
          </div>
          <div className="space-y-2 text-center p-4 bg-(--background) rounded-2xl border border-(--border)">
            <label className="text-[10px] font-black text-(--muted-foreground) uppercase tracking-widest block">
              Energy: <span className="text-blue-600">{formData.energy}</span>
            </label>
            <input
              type="range"
              name="energy"
              min="1"
              max="10"
              value={formData.energy}
              onChange={handleChange}
              className="w-full h-1.5 bg-(--muted) rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          <div className="space-y-2 text-center p-4 bg-(--background) rounded-2xl border border-(--border)">
            <label className="text-[10px] font-black text-(--muted-foreground) uppercase tracking-widest block">
              Sleep: <span className="text-blue-600">{formData.sleepQuality}</span>
            </label>
            <input
              type="range"
              name="sleepQuality"
              min="1"
              max="10"
              value={formData.sleepQuality}
              onChange={handleChange}
              className="w-full h-1.5 bg-(--muted) rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-(--muted-foreground) uppercase tracking-widest ml-1">Medication</label>
          <input
            type="text"
            name="medication"
            value={formData.medication}
            onChange={handleChange}
            placeholder="e.g. Paracetamol 500mg"
            className="w-full bg-(--background) border border-(--border) rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base font-medium text-(--foreground) placeholder:text-(--muted-foreground)/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-(--muted-foreground) uppercase tracking-widest ml-1">Additional Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Describe how you feel..."
            className="w-full bg-(--background) border border-(--border) rounded-xl px-5 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base font-medium text-(--foreground) placeholder:text-(--muted-foreground)/50 resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full btn-primary py-5 flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 text-lg"
        >
          <PlusCircle size={24} />
          Add Log Entry
        </button>
      </form>
    </motion.div>
  );
}
