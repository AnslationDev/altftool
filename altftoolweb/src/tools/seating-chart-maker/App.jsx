"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Users,
  Plus,
  Trash2,
  RotateCw,
  Layout,
  Settings,
  Info,
  Save,
  History,
  CheckCircle2,
  AlertTriangle,
  Move,
  ArrowRight,
  Star,
  UserPlus,
  UserMinus,
  Search,
  FileJson,
  Activity,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Constants & Helpers
const TABLE_TYPES = [
  { id: 'round', label: 'Round Table', capacity: 8, icon: RotateCw },
  { id: 'rect', label: 'Rectangular', capacity: 10, icon: Layout },
  { id: 'classroom', label: 'Classroom', capacity: 2, icon: Settings },
  { id: 'banquet', label: 'Banquet', capacity: 12, icon: Users }
];

const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-(--card) border border-(--border) rounded-3xl p-6 backdrop-blur-md shadow-xl ${className}`}
  >
    {title && (
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
          <Icon size={18} />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-(--foreground)">{title}</h3>
      </div>
    )}
    {children}
  </motion.div>
);

const TableComponent = ({ table, guests, onSelect, isSelected, onUpdate, onDelete, onSeatClick }) => {
  const tableGuests = guests.filter(g => g.tableId === table.id);

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => {
        onUpdate(table.id, { x: table.x + info.offset.x, y: table.y + info.offset.y });
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(table.id);
      }}
      className={`absolute cursor-move p-4 rounded-3xl border-2 transition-all ${isSelected ? 'border-blue-500 bg-blue-500/10 scale-105 z-10 shadow-2xl' : 'border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-black/20 dark:border-white/20'
        }`}
      style={{ left: table.x, top: table.y }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">{table.label}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(table.id); }}
            className="p-1 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <div className="relative flex flex-wrap justify-center gap-2 max-w-[120px]">
          {Array.from({ length: table.capacity }).map((_, i) => {
            const guest = tableGuests.find(g => g.seatIndex === i);
            return (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); onSeatClick(table.id, i); }}
                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${guest ? (guest.isVIP ? 'bg-amber-500 border-amber-400 shadow-lg' : 'bg-blue-500 border-blue-400') : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:bg-black/10 dark:bg-white/10'
                  }`}
              >
                {guest ? (
                  <span className="text-[8px] font-black text-(--foreground)">{guest.name[0]}</span>
                ) : (
                  <Plus size={8} className="text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>

        <div className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest">
          {tableGuests.length} / {table.capacity} Seats
        </div>
      </div>
    </motion.div>
  );
};

export default function SeatingChartMaker() {
  const [guests, setGuests] = useState([]);
  const [tables, setTables] = useState([]);
  const [event, setEvent] = useState({ name: "Grand Gala 2026", venue: "Crystal Ballroom", date: "" });
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const canvasRef = useRef(null);
  const [canvasScale, setCanvasScale] = useState(1);
  const [savedCharts, setSavedCharts] = useState([]);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('seating-charts');
    if (saved) setSavedCharts(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    const newChart = {
      id: Date.now(),
      name: event.name || "Untitled Chart",
      guests,
      tables,
      event,
      lastModified: new Date().toISOString()
    };
    const updated = [...savedCharts, newChart];
    setSavedCharts(updated);
    localStorage.setItem('seating-charts', JSON.stringify(updated));
    alert("Chart Saved Successfully!");
  };

  const analytics = useMemo(() => {
    const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);
    const assignedGuests = guests.filter(g => g.tableId !== null).length;
    return {
      totalCapacity,
      assignedGuests,
      unassignedGuests: guests.length - assignedGuests,
      completionPercentage: totalCapacity ? Math.round((assignedGuests / totalCapacity) * 100) : 0
    };
  }, [guests, tables]);

  const addGuest = (name, group, isVIP) => {
    setGuests([...guests, { id: Date.now(), name, group, isVIP, tableId: null, seatIndex: null }]);
  };

  const removeGuest = (id) => setGuests(guests.filter(g => g.id !== id));

  const addTable = (type) => {
    const tableType = TABLE_TYPES.find(t => t.id === type);
    setTables([...tables, {
      id: Date.now(),
      type,
      label: `${tableType.label} ${tables.length + 1}`,
      capacity: tableType.capacity,
      x: 50 + (tables.length * 20),
      y: 50 + (tables.length * 20)
    }]);
  };

  const updateTable = (id, updates) => setTables(tables.map(t => t.id === id ? { ...t, ...updates } : t));
  const deleteTable = (id) => {
    setTables(tables.filter(t => t.id !== id));
    setGuests(guests.map(g => g.tableId === id ? { ...g, tableId: null, seatIndex: null } : g));
  };

  const onSeatClick = (tableId, seatIndex) => {
    const guestAtSeat = guests.find(g => g.tableId === tableId && g.seatIndex === seatIndex);
    if (guestAtSeat) {
      setGuests(guests.map(g => g.id === guestAtSeat.id ? { ...g, tableId: null, seatIndex: null } : g));
    } else {
      const nextUnassigned = guests.find(g => g.tableId === null);
      if (nextUnassigned) {
        setGuests(guests.map(g => g.id === nextUnassigned.id ? { ...g, tableId, seatIndex } : g));
      }
    }
  };

  const resetAll = () => {
    if (confirm("Reset everything?")) {
      setGuests([]);
      setTables([]);
    }
  };

  const exportAsJSON = () => {
    const data = JSON.stringify({ guests, tables, event }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `seating_chart.json`;
    link.click();
  };

  const filteredGuests = guests.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-(--background) px-4 py-12 font-secondary selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Centered Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            <Activity size={14} className="animate-pulse" />
            Architect Protocol Active
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            Seating Master
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
            Design architect-grade seating arrangements with real-time intelligence. 
            Optimize your event layout with professional precision and elegance.
          </p>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Capacity", value: analytics.totalCapacity, icon: Users, color: "blue" },
            { label: "Guests Seated", value: analytics.assignedGuests, icon: CheckCircle2, color: "green" },
            { label: "Pending Seats", value: analytics.unassignedGuests, icon: AlertTriangle, color: "amber" },
            { label: "Completion", value: `${analytics.completionPercentage}%`, icon: Zap, color: "blue" }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-(--card) border border-(--border) p-5 rounded-3xl backdrop-blur-md shadow-lg group hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                  <stat.icon size={16} />
                </div>
                <span className="text-xl font-black text-(--foreground)">{stat.value}</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Interface Container */}
        <div className="bg-(--card) border border-(--border) rounded-[40px] shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="p-8 space-y-12">
            
            {/* Global Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-black/5 dark:border-white/5 pb-8">
              <div className="flex gap-4">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 font-bold text-xs uppercase tracking-widest">
                  <Save size={16} /> Save Chart
                </button>
                <button onClick={exportAsJSON} className="flex items-center gap-2 px-6 py-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-muted-foreground rounded-2xl hover:border-black/30 dark:border-white/30 transition-all font-bold text-xs uppercase tracking-widest">
                  <FileJson size={16} /> Export JSON
                </button>
              </div>
              <button onClick={resetAll} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-500/20 transition-all font-bold text-xs uppercase tracking-widest">
                <Trash2 size={16} /> Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Input Controls */}
              <div className="lg:col-span-4 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    <Settings size={14} /> Venue Configuration
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Venue Identity</label>
                      <input
                        type="text"
                        value={event.venue}
                        onChange={(e) => setEvent({ ...event, venue: e.target.value })}
                        className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3.5 text-sm focus:border-blue-500/50 outline-none transition-all placeholder:text-muted-foreground"
                        placeholder="Venue Name..."
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Add Elements</label>
                      <div className="grid grid-cols-2 gap-3">
                        {TABLE_TYPES.map(table => (
                          <button
                            key={table.id}
                            onClick={() => addTable(table.id)}
                            className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-blue-500/40 transition-all flex flex-col items-center gap-3 group"
                          >
                            <div className="p-2.5 rounded-xl bg-blue-500/5 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                              <Plus size={18} />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-center opacity-60 group-hover:opacity-100">{table.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-black/5 dark:border-white/5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    <Users size={14} /> Guest Intelligence
                  </h3>
                  <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-4">
                    <input
                      type="text"
                      placeholder="Full Name..."
                      id="guestNameInput"
                      className="w-full bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all"
                    />
                    <div className="flex flex-wrap xl:flex-nowrap gap-3">
                      <input
                        type="text"
                        id="guestGroupInput"
                        placeholder="Affiliation..."
                        className="flex-1 min-w-0 bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-xs focus:border-blue-500/50 outline-none transition-all"
                      />
                      <label className="shrink-0 flex items-center gap-2 px-4 py-3 bg-black/5 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl cursor-pointer hover:border-blue-500/30 transition-all">
                        <input type="checkbox" id="guestVIPInput" className="w-3.5 h-3.5 accent-blue-500" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">VIP</span>
                      </label>
                    </div>
                    <button
                      onClick={() => {
                        const nameInput = document.getElementById('guestNameInput');
                        const groupInput = document.getElementById('guestGroupInput');
                        const vipInput = document.getElementById('guestVIPInput');
                        if (nameInput.value) {
                          addGuest(nameInput.value, groupInput.value, vipInput.checked);
                          nameInput.value = ""; groupInput.value = ""; vipInput.checked = false;
                        }
                      }}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
                    >
                      Process Guest
                    </button>
                  </div>

                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input
                      type="text"
                      placeholder="Search live list..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm focus:border-blue-500/50 outline-none transition-all"
                    />
                  </div>

                  <div className="max-h-[350px] overflow-y-auto space-y-2.5 pr-2 custom-scrollbar">
                    {filteredGuests.map(guest => (
                      <div key={guest.id} className={`p-4 rounded-2xl border flex items-center justify-between group transition-all ${guest.tableId !== null ? 'bg-blue-500/10 border-blue-500/20' : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 hover:border-black/20 dark:border-white/20'}`}>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold truncate text-(--foreground)">{guest.name}</span>
                            {guest.isVIP && <div className="p-1 rounded-md bg-amber-500/10 text-amber-500"><Star size={10} fill="currentColor" /></div>}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{guest.group || 'General'}</span>
                            {guest.tableId !== null && <span className="text-[8px] font-black uppercase text-blue-500/60 tracking-widest">• Assigned</span>}
                          </div>
                        </div>
                        <button onClick={() => removeGuest(guest.id)} className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-xl transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Interaction Canvas */}
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    <Layout size={14} /> Interactive Blueprint
                  </h3>
                  <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-xl border border-black/10 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">Canvas 1:1</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative group rounded-[32px] overflow-hidden border border-black/10 dark:border-white/10 bg-black/5 dark:bg-black/40 shadow-inner min-h-[700px]">
                  <div
                    className="w-full h-full relative overflow-hidden"
                    onClick={() => setSelectedTableId(null)}
                  >
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{
                      backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
                      backgroundSize: `${40 * canvasScale}px ${40 * canvasScale}px`
                    }} />

                    <motion.div
                      layout
                      ref={canvasRef}
                      className="relative w-full h-full"
                      style={{ transform: `scale(${canvasScale})`, transformOrigin: 'top left' }}
                    >
                      <AnimatePresence>
                        {tables.map(table => (
                          <TableComponent
                            key={table.id}
                            table={table}
                            guests={guests}
                            canvasScale={1}
                            isSelected={selectedTableId === table.id}
                            onSelect={setSelectedTableId}
                            onUpdate={updateTable}
                            onDelete={deleteTable}
                            onSeatClick={onSeatClick}
                          />
                        ))}
                      </AnimatePresence>
                    </motion.div>

                    {/* Canvas Controls Overlay */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-white/80 dark:bg-black/80 backdrop-blur-xl px-8 py-4 rounded-full border border-black/10 dark:border-white/10 shadow-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><Move size={14} /></div>
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Drag to Move</span>
                      </div>
                      <div className="w-px h-4 bg-black/10 dark:bg-white/10"></div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-500"><CheckCircle2 size={14} /></div>
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Click to Assign</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features / FAQ Section (Like Age Calculator) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
          {[
            { icon: Layout, title: "Smart Blueprints", desc: "Choose from Round, Rectangular, and Classroom styles with accurate seat mapping." },
            { icon: Users, title: "Guest Intelligence", desc: "Real-time tracking of VIP statuses and group affiliations for seamless organization." },
            { icon: Save, title: "Session Cache", desc: "Your arrangements are securely stored in your local browser for instant retrieval." }
          ].map((feat, i) => (
            <div key={i} className="space-y-4 p-8 rounded-3xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-blue-500/20 transition-all group">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 w-fit group-hover:scale-110 transition-transform">
                <feat.icon size={24} />
              </div>
              <h4 className="text-lg font-bold text-(--foreground)">{feat.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {/* History Grid */}
        {savedCharts.length > 0 && (
          <div className="space-y-8 pt-12">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-black/5 dark:bg-white/5"></div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-3">
                <History size={14} /> Archived Blueprints
              </h3>
              <div className="h-px flex-1 bg-black/5 dark:bg-white/5"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {savedCharts.map(chart => (
                <div key={chart.id} className="p-6 rounded-[32px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:border-blue-500/40 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="min-w-0">
                      <h4 className="font-bold text-(--foreground) truncate text-sm">{chart.name}</h4>
                      <p className="text-[9px] text-muted-foreground font-black uppercase mt-1">{new Date(chart.lastModified).toLocaleDateString()}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-500/5 text-blue-500 group-hover:bg-blue-500 group-hover:text-(--foreground) transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                    <span className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest">{chart.guests.length} Guests</span>
                    <span className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest">{chart.tables.length} Tables</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.4); }
      `}</style>
    </div>
  );
}
