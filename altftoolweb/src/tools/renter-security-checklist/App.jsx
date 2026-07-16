"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Home,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ClipboardList,
  Plus,
  Trash2,
  Calendar,
  User,
  MapPin,
  Camera,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Info,
  Download,
  RotateCcw,
  Zap,
  Lock,
  Eye,
  Activity,
  ArrowRight,
  PlusCircle,
  XCircle,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PROPERTY_TYPES,
  ROOMS,
  CHECKLIST_TEMPLATES,
  INITIAL_DATA,
  saveChecklistData,
  loadChecklistData,
  calculateProgress
} from "./utils/checklistHelpers";

// --- Shared UI Components ---

const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-(--card) border border-(--border) rounded-3xl p-5 md:p-6 backdrop-blur-md shadow-xl hover:border-blue-500/30 transition-all overflow-hidden ${className}`}
  >
    {title && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
            {Icon && <Icon size={18} />}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-(--foreground)">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

const Header = () => {
  const [text, setText] = useState("");
  const fullText = "Renter Security Checklist";

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
        Property Inspection System Online
      </div>
      <h1 className="heading !text-4xl sm:!text-5xl md:!text-7xl font-black mb-4 tracking-tight">
        {text}
      </h1>
      <p className="description text-base md:text-xl opacity-80 max-w-2xl mx-auto">
        Futuristic property verification and safety management. Secure your next home with precision inspections and real-time tracking.
      </p>
    </motion.div>
  );
};

export default function RenterSecurityChecklist() {
  const [data, setData] = useState(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState('property'); // property, checklist, rooms, notes, deadlines
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedRoom, setExpandedRoom] = useState(null);

  // Initialize
  useEffect(() => {
    const loaded = loadChecklistData();
    setData(loaded);
  }, []);

  // Save on change
  useEffect(() => {
    if (data !== INITIAL_DATA) {
      saveChecklistData(data);
    }
  }, [data]);

  const progress = useMemo(() => calculateProgress(data.checklist), [data.checklist]);

  const updateProperty = (field, value) => {
    setData(prev => ({
      ...prev,
      property: { ...prev.property, [field]: value }
    }));
  };

  const toggleChecklistItem = (category, id) => {
    setData(prev => {
      const newCategory = prev.checklist[category].map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      return {
        ...prev,
        checklist: { ...prev.checklist, [category]: newCategory }
      };
    });
  };

  const updateRoomInspection = (roomId, updates) => {
    setData(prev => ({
      ...prev,
      roomInspections: {
        ...prev.roomInspections,
        [roomId]: { ...prev.roomInspections[roomId], ...updates }
      }
    }));
  };

  const addRoomTask = (roomId) => {
    const taskText = prompt("Enter new task for " + roomId + ":");
    if (!taskText) return;

    setData(prev => {
      const room = prev.roomInspections[roomId];
      const newTask = { id: Date.now(), text: taskText, completed: false };
      return {
        ...prev,
        roomInspections: {
          ...prev.roomInspections,
          [roomId]: { ...room, tasks: [...room.tasks, newTask] }
        }
      };
    });
  };

  const toggleRoomTask = (roomId, taskId) => {
    setData(prev => {
      const room = prev.roomInspections[roomId];
      const newTasks = room.tasks.map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return {
        ...prev,
        roomInspections: {
          ...prev.roomInspections,
          [roomId]: { ...room, tasks: newTasks }
        }
      };
    });
  };

  const deleteRoomTask = (roomId, taskId) => {
    setData(prev => {
      const room = prev.roomInspections[roomId];
      const newTasks = room.tasks.filter(t => t.id !== taskId);
      return {
        ...prev,
        roomInspections: {
          ...prev.roomInspections,
          [roomId]: { ...room, tasks: newTasks }
        }
      };
    });
  };

  const addNote = () => {
    const noteText = prompt("Enter note:");
    if (!noteText) return;
    setData(prev => ({
      ...prev,
      notes: [...prev.notes, { id: Date.now(), text: noteText, timestamp: new Date().toISOString() }]
    }));
  };

  const deleteNote = (id) => {
    setData(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== id)
    }));
  };

  const addDeadline = () => {
    const title = prompt("Enter deadline title:");
    if (!title) return;
    const date = prompt("Enter date (YYYY-MM-DD):");
    if (!date) return;
    setData(prev => ({
      ...prev,
      deadlines: [...prev.deadlines, { id: Date.now(), title, date, completed: false }]
    }));
  };

  const toggleDeadline = (id) => {
    setData(prev => ({
      ...prev,
      deadlines: prev.deadlines.map(d => d.id === id ? { ...d, completed: !d.completed } : d)
    }));
  };

  const deleteDeadline = (id) => {
    setData(prev => ({
      ...prev,
      deadlines: prev.deadlines.filter(d => d.id !== id)
    }));
  };

  const resetAll = () => {
    if (confirm("Reset all data? This cannot be undone.")) {
      setData(INITIAL_DATA);
      localStorage.removeItem('renter_security_checklist_data');
    }
  };

  return (
    <div className="min-h-screen bg-(--background) px-4 py-12 font-secondary selection:bg-blue-500/30">
      <div className="max-w-[1400px] mx-auto">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel: Navigation & Stats */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-5 p-1.5 bg-(--card) border border-(--border) rounded-2xl w-full mb-6 gap-1">
              {[
                { id: 'property', icon: Home, label: 'Info' },
                { id: 'checklist', icon: ClipboardList, label: 'Checks' },
                { id: 'rooms', icon: Shield, label: 'Rooms' },
                { id: 'notes', icon: MessageSquare, label: 'Notes' },
                { id: 'deadlines', icon: Clock, label: 'Dates' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 min-w-0 ${
                    activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-muted-foreground hover:text-(--foreground) hover:bg-blue-500/5'
                  }`}
                >
                  <tab.icon size={16} className="shrink-0" />
                  <span className="text-[8px] font-black uppercase tracking-tighter text-center">{tab.label}</span>
                </button>
              ))}
            </div>

            <GlassCard title="Inspection Progress" icon={Activity}>
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="text-4xl font-black text-blue-500 mb-2">{progress}%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Overall Readiness</div>
                </div>
                <div className="h-2 w-full bg-blue-500/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <div className="p-2 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center">
                    <div className="text-[7px] font-black text-muted-foreground uppercase mb-0.5">Items Checked</div>
                    <div className="text-base font-black text-(--foreground)">
                      {Object.values(data.checklist).flat().filter(i => i.completed).length}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
                    <div className="text-[7px] font-black text-muted-foreground uppercase mb-0.5">Pending Issues</div>
                    <div className="text-base font-black text-amber-500">
                      {Object.values(data.checklist).flat().filter(i => !i.completed).length}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard title="Quick Actions" icon={Zap}>
              <div className="space-y-3">
                <button
                  onClick={() => window.print()}
                  className="w-full py-3 px-3 rounded-xl bg-(--background) border border-(--border) text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:border-blue-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  <span>Generate Report</span>
                </button>
                <button
                  onClick={resetAll}
                  className="w-full py-3 px-3 rounded-xl bg-(--background) border border-red-500/30 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Clear All Data</span>
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'property' && (
                <motion.div
                  key="property"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <GlassCard title="Property Setup" icon={Home}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Property Name</label>
                          <div className="relative">
                            <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/50" size={16} />
                            <input
                              type="text"
                              value={data.property.name}
                              onChange={(e) => updateProperty('name', e.target.value)}
                              placeholder="e.g. Skyline Apartments #402"
                              className="w-full bg-(--background) border border-(--border) rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-blue-500/50 outline-none transition-colors"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Address</label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/50" size={16} />
                            <input
                              type="text"
                              value={data.property.address}
                              onChange={(e) => updateProperty('address', e.target.value)}
                              placeholder="Full property address"
                              className="w-full bg-(--background) border border-(--border) rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-blue-500/50 outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Property Type</label>
                          <div className="grid grid-cols-3 gap-2">
                            {PROPERTY_TYPES.map(type => (
                              <button
                                key={type.id}
                                onClick={() => updateProperty('type', type.id)}
                                className={`py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                                  data.property.type === type.id
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/50'
                                }`}
                              >
                                {type.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Move-in Date</label>
                            <div className="relative">
                              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/50" size={16} />
                              <input
                                type="date"
                                value={data.property.moveInDate}
                                onChange={(e) => updateProperty('moveInDate', e.target.value)}
                                className="w-full bg-(--background) border border-(--border) rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-blue-500/50 outline-none transition-colors"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Landlord Details</label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/50" size={16} />
                              <input
                                type="text"
                                value={data.property.landlord}
                                onChange={(e) => updateProperty('landlord', e.target.value)}
                                placeholder="Name / Contact"
                                className="w-full bg-(--background) border border-(--border) rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-blue-500/50 outline-none transition-colors"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'checklist' && (
                <motion.div
                  key="checklist"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <GlassCard title="Security Checklist" icon={ClipboardList}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.keys(data.checklist).map((category) => (
                        <div key={category} className="space-y-3">
                          <button
                            onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 hover:border-blue-500/30 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                {category === 'door' && <Lock size={16} />}
                                {category === 'window' && <Eye size={16} />}
                                {category === 'fire_safety' && <AlertTriangle size={16} />}
                                {category === 'electrical' && <Zap size={16} />}
                                {category === 'plumbing' && <Activity size={16} />}
                                {category === 'internet' && <Info size={16} />}
                              </div>
                              <span className="text-xs font-black uppercase tracking-widest text-(--foreground)">
                                {category.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-blue-500">
                                {data.checklist[category].filter(i => i.completed).length} / {data.checklist[category].length}
                              </span>
                              {expandedCategory === category ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </div>
                          </button>

                          <AnimatePresence>
                            {expandedCategory === category && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden space-y-2 px-2"
                              >
                                {data.checklist[category].map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() => toggleChecklistItem(category, item.id)}
                                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                      item.completed
                                        ? 'bg-blue-500/5 border-blue-500/20 text-blue-500'
                                        : 'bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/20'
                                    }`}
                                  >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                      item.completed ? 'bg-blue-500 border-blue-500' : 'border-(--border)'
                                    }`}>
                                      {item.completed && <CheckCircle2 size={12} className="text-white" />}
                                    </div>
                                    <span className="text-xs font-bold">{item.text}</span>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'rooms' && (
                <motion.div
                  key="rooms"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <GlassCard title="Room-wise Inspections" icon={Shield}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {ROOMS.map((room) => {
                        const inspection = data.roomInspections[room.id];
                        return (
                          <div key={room.id} className="space-y-4">
                            <div className="p-5 rounded-3xl bg-(--background) border border-(--border) hover:border-blue-500/30 transition-all">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                    <Home size={20} />
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-bold text-(--foreground)">{room.label}</h4>
                                    <p className="text-[10px] text-muted-foreground font-medium">{inspection.tasks.length} Inspection tasks</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => addRoomTask(room.id)}
                                  className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>

                              <div className="space-y-3 mb-4">
                                {inspection.tasks.map((task) => (
                                  <div key={task.id} className="flex items-center justify-between group">
                                    <div
                                      onClick={() => toggleRoomTask(room.id, task.id)}
                                      className="flex items-center gap-3 cursor-pointer"
                                    >
                                      <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                                        task.completed ? 'bg-blue-500 border-blue-500' : 'border-(--border)'
                                      }`}>
                                        {task.completed && <CheckCircle2 size={10} className="text-white" />}
                                      </div>
                                      <span className={`text-xs font-bold ${task.completed ? 'line-through opacity-50' : 'text-muted-foreground'}`}>
                                        {task.text}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => deleteRoomTask(room.id, task.id)}
                                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))}
                                {inspection.tasks.length === 0 && (
                                  <p className="text-[10px] text-center text-muted-foreground italic py-2">No tasks added yet</p>
                                )}
                              </div>

                              <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest block">Inspection Notes</label>
                                <textarea
                                  value={inspection.notes}
                                  onChange={(e) => updateRoomInspection(room.id, { notes: e.target.value })}
                                  placeholder="Record issues, repairs, or observations..."
                                  className="w-full h-24 bg-(--background) border border-(--border) rounded-2xl p-4 text-xs focus:border-blue-500/50 outline-none transition-colors resize-none"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'notes' && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <GlassCard
                    title="Notes & Issue Tracking"
                    icon={MessageSquare}
                    headerActions={
                      <button
                        onClick={addNote}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                      >
                        <PlusCircle size={14} /> Add Note
                      </button>
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.notes.map((note) => (
                        <div key={note.id} className="p-5 rounded-3xl bg-(--background) border border-(--border) group relative hover:border-blue-500/30 transition-all">
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 transition-all"
                          >
                            <XCircle size={16} />
                          </button>
                          <div className="flex items-center gap-2 mb-3 text-blue-500">
                            <FileText size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Observation</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-4">{note.text}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-(--border)">
                            <span className="text-[9px] text-muted-foreground uppercase font-bold">
                              {new Date(note.timestamp).toLocaleDateString()}
                            </span>
                            <span className="text-[9px] text-blue-500/50 font-black uppercase tracking-tighter italic">Persistent</span>
                          </div>
                        </div>
                      ))}
                      {data.notes.length === 0 && (
                        <div className="col-span-full py-12 text-center">
                          <MessageSquare size={40} className="mx-auto text-muted-foreground/20 mb-4" />
                          <p className="text-sm text-muted-foreground">No notes or issues recorded yet.</p>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'deadlines' && (
                <motion.div
                  key="deadlines"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <GlassCard
                    title="Important Deadlines"
                    icon={Clock}
                    headerActions={
                      <button
                        onClick={addDeadline}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                      >
                        <PlusCircle size={14} /> Add Deadline
                      </button>
                    }
                  >
                    <div className="space-y-4">
                      {data.deadlines.map((deadline) => (
                        <div
                          key={deadline.id}
                          className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${
                            deadline.completed ? 'bg-blue-500/5 border-blue-500/20 opacity-60' : 'bg-(--background) border-(--border) hover:border-blue-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => toggleDeadline(deadline.id)}
                              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                deadline.completed ? 'bg-blue-500 border-blue-500' : 'border-(--border)'
                              }`}
                            >
                              {deadline.completed && <CheckCircle2 size={14} className="text-white" />}
                            </button>
                            <div>
                              <h4 className={`text-sm font-bold ${deadline.completed ? 'line-through' : 'text-(--foreground)'}`}>
                                {deadline.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                                <Calendar size={12} className="text-blue-500" />
                                <span>{deadline.date}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteDeadline(deadline.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {data.deadlines.length === 0 && (
                        <div className="py-12 text-center">
                          <Clock size={40} className="mx-auto text-muted-foreground/20 mb-4" />
                          <p className="text-sm text-muted-foreground">No deadlines scheduled yet.</p>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Technical Footer */}
        <div className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-8 opacity-60 hover:opacity-100 transition-opacity">
          {[
            { icon: Shield, title: "Property Security", desc: "Detailed verification protocols for doors, windows, and emergency systems." },
            { icon: ClipboardList, title: "Organized Inspection", desc: "Room-by-room breakdown with custom task tracking and progress analytics." },
            { icon: Clock, title: "Deadline Tracking", desc: "Manage move-in dates, agreement signings, and deposit reminders effortlessly." }
          ].map((feat, i) => (
            <div key={i} className="flex gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 h-fit">
                <feat.icon size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-(--foreground)">{feat.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
