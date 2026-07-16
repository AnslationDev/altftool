"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Pill,
  Plus,
  Trash2,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Bell,
  BellOff,
  History,
  Info,
  ChevronRight,
  RefreshCw,
  Target,
  ClipboardList,
  Activity,
  Settings,
  MoreVertical,
  X,
  Smartphone,
  LayoutDashboard,
  Microscope,
  FlaskConical,
  Syringe,
  Droplets
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MEDICINE_TYPES,
  FREQUENCIES,
  DEFAULT_TIMINGS,
  formatTime,
  requestNotificationPermission,
  triggerNotification,
  checkReminders,
  saveToStorage,
  loadFromStorage
} from "./utils/medicineUtils";

// --- Shared Components ---

const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-(--card) border border-(--border) rounded-3xl p-5 md:p-6 backdrop-blur-md shadow-xl hover:border-blue-500/30 transition-all break-words ${className}`}
  >
    {title && (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
            {Icon && <Icon size={20} />}
          </div>
          <h3 className="text-lg font-bold text-(--foreground)">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

// --- Icon Mapping ---
const MedicineIcon = ({ type, size = 20, className = "" }) => {
  const icons = {
    tablet: Pill,
    capsule: Microscope,
    syrup: FlaskConical,
    injection: Syringe,
    drops: Droplets
  };
  const Icon = icons[type] || Pill;
  return <Icon size={size} className={className} />;
};

const Header = () => {
  const [text, setText] = useState("");
  const fullText = "Medicine Schedule Builder";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[11px] font-bold uppercase tracking-wider mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        Real-time Health Sync Active
      </div>
      <h1 className="heading !text-4xl sm:!text-5xl md:!text-7xl font-black mb-4 tracking-tight">
        {text}
      </h1>
      <p className="description text-base md:text-xl opacity-80 max-w-2xl mx-auto">
        Precision scheduling for your health. Organize routines, track adherence, and never miss a dose with intelligent reminders.
      </p>
    </motion.div>
  );
};

// --- Main App ---

export default function MedicineScheduleBuilder() {
  const [medicines, setMedicines] = useState([]);
  const [tracking, setTracking] = useState({}); // { '2024-05-15': { 'med-1': { '08:00': 'taken' } } }
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [lastCheckedTime, setLastCheckedTime] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, timeline, settings

  // Form State
  const [newMed, setNewMed] = useState({
    name: "",
    type: "tablet",
    dosage: "",
    quantity: "1",
    instructions: "",
    frequency: "daily",
    timings: [{ id: "morning", time: "08:00" }]
  });

  // Load from Storage
  useEffect(() => {
    const savedMeds = loadFromStorage("med_schedule_list");
    const savedTracking = loadFromStorage("med_schedule_tracking");
    if (savedMeds) setMedicines(savedMeds);
    if (savedTracking) setTracking(savedTracking);

    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Save to Storage
  useEffect(() => {
    saveToStorage("med_schedule_list", medicines);
  }, [medicines]);

  useEffect(() => {
    saveToStorage("med_schedule_tracking", tracking);
  }, [tracking]);

  // Reminder Engine
  useEffect(() => {
    const interval = setInterval(() => {
      const result = checkReminders(medicines, lastCheckedTime);
      if (result && result.dueMedicines.length > 0) {
        setLastCheckedTime(result.currentTime);
        result.dueMedicines.forEach(med => {
          triggerNotification(`Time for your medicine: ${med.name}`, {
            body: `${med.dosage} ${med.type}${med.instructions ? ` - ${med.instructions}` : ""}`,
            tag: `med-${med.id}-${result.currentTime}`
          });
        });
      }
    }, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [medicines, lastCheckedTime]);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermission(granted ? "granted" : "denied");
  };

  const addMedicine = () => {
    if (!newMed.name) return;
    const medToAdd = {
      ...newMed,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setMedicines([...medicines, medToAdd]);
    setNewMed({
      name: "",
      type: "tablet",
      dosage: "",
      quantity: "1",
      instructions: "",
      frequency: "daily",
      timings: [{ id: "morning", time: "08:00" }]
    });
  };

  const removeMedicine = (id) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const toggleDose = (date, medId, time, status) => {
    setTracking(prev => {
      const dateKey = date;
      const dayTracking = prev[dateKey] || {};
      const medTracking = dayTracking[medId] || {};

      const newDayTracking = {
        ...dayTracking,
        [medId]: {
          ...medTracking,
          [time]: status
        }
      };

      return {
        ...prev,
        [dateKey]: newDayTracking
      };
    });
  };

  const today = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    const todayTracking = tracking[today] || {};
    let total = 0;
    let taken = 0;

    medicines.forEach(med => {
      med.timings.forEach(t => {
        total++;
        if (todayTracking[med.id] && todayTracking[med.id][t.time] === 'taken') {
          taken++;
        }
      });
    });

    return {
      total,
      taken,
      percentage: total > 0 ? Math.round((taken / total) * 100) : 0
    };
  }, [medicines, tracking, today]);

  // --- Sub-sections ---

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="!p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Activity size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Today's Progress</div>
              <div className="text-sm font-bold text-(--foreground) truncate">
                {stats.taken} / {stats.total} Doses Taken
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="!p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Target size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Adherence Rate</div>
              <div className="text-sm font-bold text-(--foreground) truncate">
                {stats.percentage}% Completion
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="!p-4 border-l-4 border-l-amber-500 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Bell size={20} />
            </div>
            <div className="min-w-0">
              <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Notification Status</div>
              <div className="text-sm font-bold text-(--foreground) truncate">
                {notificationPermission === 'granted' ? 'Active & Ready' : 'Pending Permission'}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Medicines */}
        <GlassCard title="Active Routine" icon={ClipboardList}>
          <div className="space-y-4">
            {medicines.length > 0 ? (
              medicines.map((med) => (
                <div key={med.id} className="p-3 md:p-4 rounded-3xl bg-(--background) border border-(--border) hover:border-blue-500/30 transition-all group relative overflow-hidden">
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 shadow-inner">
                        <MedicineIcon type={med.type} size={20} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-(--foreground) truncate leading-tight">{med.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{med.dosage}</span>
                          <span className="w-1 h-1 rounded-full bg-(--border)" />
                          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{med.frequency}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3 pr-8 relative">
                    {med.timings.map((t, idx) => {
                      const isTaken = tracking[today]?.[med.id]?.[t.time] === 'taken';
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleDose(today, med.id, t.time, isTaken ? 'pending' : 'taken')}
                          className={`pl-2 pr-3 py-1.5 rounded-xl text-[9px] font-bold flex items-center gap-1.5 transition-all border ${isTaken
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-500'
                            : 'bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/30'
                            }`}
                        >
                          {isTaken ? <CheckCircle2 size={12} className="animate-in zoom-in" /> : <Clock size={12} />}
                          {formatTime(t.time)}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => removeMedicine(med.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                      title="Remove Medicine"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {med.instructions && (
                    <div className="pt-2.5 border-t border-(--border) flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <Info size={10} />
                      </div>
                      <p className="text-[9px] text-muted-foreground italic leading-relaxed truncate">
                        {med.instructions}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-(--border) rounded-2xl">
                <Pill size={40} className="mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">No medicines added to your schedule yet.</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Daily Progress Analytics */}
        <GlassCard title="Health Analytics" icon={Activity}>
          <div className="space-y-8">
            <div className="flex flex-col items-center justify-center p-8">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-blue-500/10"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={440}
                    initial={{ strokeDashoffset: 440 }}
                    animate={{ strokeDashoffset: 440 - (440 * stats.percentage) / 100 }}
                    className="text-blue-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-(--foreground)">{stats.percentage}%</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Adherence</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-(--background) border border-(--border)">
                <div className="text-[8px] font-black text-muted-foreground uppercase mb-1">Doses Taken</div>
                <div className="text-xl font-black text-blue-500">{stats.taken}</div>
              </div>
              <div className="p-4 rounded-2xl bg-(--background) border border-(--border)">
                <div className="text-[8px] font-black text-muted-foreground uppercase mb-1">Remaining</div>
                <div className="text-xl font-black text-blue-500">{stats.total - stats.taken}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase text-muted-foreground tracking-widest">Consistency Insights</h5>
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                  <Info size={16} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {stats.percentage === 100
                    ? "Perfect adherence! Your health routine is on track for optimal results."
                    : stats.percentage > 50
                      ? "Good progress. Try to complete all doses to maintain medical efficacy."
                      : medicines.length > 0
                        ? "Low adherence detected. Set reminders to help stay on track."
                        : "Add your medicines to start tracking your health journey."}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderTimeline = () => {
    // Generate timeline of all doses for today
    const timeline = [];
    medicines.forEach(med => {
      med.timings.forEach(t => {
        timeline.push({
          time: t.time,
          med: med,
          status: tracking[today]?.[med.id]?.[t.time] || 'pending'
        });
      });
    });

    // Sort by time
    timeline.sort((a, b) => a.time.localeCompare(b.time));

    return (
      <GlassCard title="Daily Timeline" icon={Clock}>
        <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-500/20">
          {timeline.length > 0 ? (
            timeline.map((item, idx) => (
              <div key={idx} className="relative pl-12">
                <div className={`absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center z-10 border-4 border-(--card) transition-all ${item.status === 'taken' ? 'bg-blue-500 text-white' : 'bg-(--background) text-muted-foreground border-blue-500/20'
                  }`}>
                  {item.status === 'taken' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                </div>

                <div className={`p-4 rounded-2xl border transition-all ${item.status === 'taken' ? 'bg-blue-500/5 border-blue-500/20' : 'bg-(--background) border-(--border)'
                  }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black text-blue-500">{formatTime(item.time)}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${item.status === 'taken' ? 'bg-blue-500/10 text-blue-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-bold text-(--foreground) mb-1">{item.med.name}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">
                    {item.med.dosage} • {item.med.type}
                  </p>

                  <div className="mt-4 flex gap-2">
                    {item.status !== 'taken' && (
                      <button
                        onClick={() => toggleDose(today, item.med.id, item.time, 'taken')}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                      >
                        Mark Taken
                      </button>
                    )}
                    {item.status === 'taken' && (
                      <button
                        onClick={() => toggleDose(today, item.med.id, item.time, 'pending')}
                        className="px-4 py-2 rounded-xl bg-(--background) border border-(--border) text-muted-foreground text-[10px] font-black uppercase tracking-widest hover:border-blue-500/30 transition-all"
                      >
                        Undo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <Calendar size={48} className="mx-auto text-muted-foreground/10 mb-4" />
              <p className="text-muted-foreground">Your timeline is empty. Add medicines to see your schedule.</p>
            </div>
          )}
        </div>
      </GlassCard>
    );
  };


  return (
    <div className="min-h-screen bg-(--background) px-4 py-12 font-secondary selection:bg-teal-500/30">
      <div className="max-w-[1400px] mx-auto">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Form & Controls */}
          <div className="lg:col-span-4 space-y-6">
            <GlassCard title="Add New Medicine" icon={Plus}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Medicine Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Paracetamol, Vitamin C"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 500mg, 10ml"
                      value={newMed.dosage}
                      onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                      className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Quantity</label>
                    <input
                      type="text"
                      placeholder="e.g. 1, 2"
                      value={newMed.quantity}
                      onChange={(e) => setNewMed({ ...newMed, quantity: e.target.value })}
                      className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Medicine Type</label>
                  <div className="grid grid-cols-5 gap-2">
                    {MEDICINE_TYPES.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setNewMed({ ...newMed, type: type.id })}
                        title={type.label}
                        className={`py-3 rounded-xl transition-all border flex items-center justify-center ${newMed.type === type.id
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                          : 'bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/50'
                          }`}
                      >
                        <MedicineIcon type={type.id} size={22} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Frequency</label>
                  <select
                    value={newMed.frequency}
                    onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                    className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5em' }}
                  >
                    {FREQUENCIES.map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Scheduled Timings</label>
                    <button
                      onClick={() => setNewMed({ ...newMed, timings: [...newMed.timings, { id: Date.now().toString(), time: "12:00" }] })}
                      className="text-[8px] font-black uppercase text-blue-500 hover:underline"
                    >
                      + Add Time
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newMed.timings.map((t, idx) => (
                      <div key={t.id} className="flex gap-2">
                        <input
                          type="time"
                          value={t.time}
                          onChange={(e) => {
                            const newTimings = [...newMed.timings];
                            newTimings[idx].time = e.target.value;
                            setNewMed({ ...newMed, timings: newTimings });
                          }}
                          className="flex-1 bg-(--background) border border-(--border) rounded-xl px-4 py-2 text-sm focus:border-blue-500/50 outline-none"
                        />
                        {newMed.timings.length > 1 && (
                          <button
                            onClick={() => setNewMed({ ...newMed, timings: newMed.timings.filter((_, i) => i !== idx) })}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Instructions (Optional)</label>
                  <textarea
                    placeholder="e.g. Take after food, avoid alcohol"
                    value={newMed.instructions}
                    onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                    className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors h-20 resize-none"
                  />
                </div>

                <button
                  onClick={addMedicine}
                  disabled={!newMed.name}
                  className="w-full mt-4 py-4 px-3 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:scale-100"
                >
                  <Plus size={18} />
                  <span>Build Schedule</span>
                </button>
              </div>
            </GlassCard>

            <GlassCard title="System Settings" icon={Settings}>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bell size={16} className="text-blue-500" />
                      <span className="text-xs font-bold text-(--foreground)">Notifications</span>
                    </div>
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md ${notificationPermission === 'granted' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                      {notificationPermission === 'granted' ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Browser notifications must be enabled for real-time medicine reminders.
                  </p>
                  {notificationPermission !== 'granted' && (
                    <button
                      onClick={handleRequestPermission}
                      className="w-full py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                    >
                      Grant Permission
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear all schedules?")) {
                      setMedicines([]);
                      setTracking({});
                    }
                  }}
                  className="w-full py-3 px-3 rounded-xl bg-(--background) border border-red-500/30 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} />
                  <span>Wipe All Data</span>
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Dashboard & Timeline */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex p-1 bg-(--card) border border-(--border) rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-muted-foreground hover:text-(--foreground)'
                  }`}
              >
                <LayoutDashboard size={14} />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("timeline")}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'timeline' ? 'bg-blue-600 text-white shadow-lg' : 'text-muted-foreground hover:text-(--foreground)'
                  }`}
              >
                <Clock size={14} />
                Timeline
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'dashboard' ? renderDashboard() : renderTimeline()}
              </motion.div>
            </AnimatePresence>

            {/* Scientific Footer */}
            <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-(--card) border border-(--border) space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Smartphone size={20} />
                </div>
                <h4 className="font-bold text-(--foreground)">Cross-Device Sync</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your data is stored locally in your browser. For multi-device access, export your schedule from settings.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-(--card) border border-(--border) space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <h4 className="font-bold text-(--foreground)">Adherence Logic</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We use advanced tracking algorithms to calculate your medical adherence score based on dose timings.
                </p>
              </div>
              <div className="p-6 rounded-3xl bg-(--card) border border-(--border) space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <h4 className="font-bold text-(--foreground)">Smart Reminders</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our reminder engine runs in the background to ensure you receive notifications even if you're on another tab.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action for Mobiles */}
      <div className="fixed bottom-8 right-8 lg:hidden">
        <button className="w-14 h-14 rounded-full bg-blue-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}
