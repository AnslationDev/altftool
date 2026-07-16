"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Maximize2,
  Plus,
  Trash2,
  RotateCw,
  Grid3X3,
  Layout,
  Settings,
  Info,
  Save,
  History,
  CheckCircle2,
  AlertTriangle,
  Move,
  ArrowRight,
  Box,
  Square,
  DoorOpen,
  Window as WindowIcon,
  Scaling,
  Download,
  Magnet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ROOM_TYPES,
  FURNITURE_TYPES,
  INITIAL_TASKS,
  detectOverlap,
  loadLayouts,
  saveLayouts
} from "./utils/plannerHelpers";

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
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
            {Icon && <Icon size={20} />}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-(--foreground) truncate">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

const Header = () => {
  const [text, setText] = useState("");
  const fullText = "Furniture Layout Planner";

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
        Intelligent Space Optimization Active
      </div>
      <h1 className="heading !text-4xl sm:!text-5xl md:!text-7xl font-black mb-4 tracking-tight">
        {text}
      </h1>
      <p className="description text-base md:text-xl opacity-80 max-w-2xl mx-auto">
        Architect-grade room planning with real-time space analytics. Design, arrange, and optimize your interior layout with precision.
      </p>
    </motion.div>
  );
};

// --- Sub-components ---

const FurnitureItem = ({ item, onUpdate, onDelete, isSelected, onSelect, canvasScale, snapToGrid }) => {
  const { x, y, width, height, rotation, color, label, id } = item;

  const handleDrag = (e, info) => {
    let newX = x + info.delta.x / canvasScale;
    let newY = y + info.delta.y / canvasScale;

    if (snapToGrid) {
      newX = Math.round(newX / 20) * 20;
      newY = Math.round(newY / 20) * 20;
    }

    onUpdate(id, { x: newX, y: newY });
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDrag={handleDrag}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      initial={false}
      animate={{
        x: x * canvasScale,
        y: y * canvasScale,
        rotate: rotation,
        width: width * canvasScale,
        height: height * canvasScale
      }}
      className={`absolute cursor-move rounded-lg flex items-center justify-center text-white font-bold text-[10px] select-none ${isSelected ? 'ring-2 ring-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border border-white/20'
        }`}
      style={{
        backgroundColor: color,
        zIndex: isSelected ? 50 : 10,
        transformOrigin: 'center center'
      }}
    >
      <div className="flex flex-col items-center gap-1">
        <span className="text-center px-1 leading-none">{label}</span>
        {isSelected && (
          <div className="flex gap-1 absolute -bottom-8 bg-black/80 backdrop-blur-md rounded-full px-2 py-1 border border-white/20">
            <button
              onClick={(e) => { e.stopPropagation(); onUpdate(id, { rotation: (rotation + 45) % 360 }); }}
              className="p-1 hover:text-blue-400 transition-colors"
            >
              <RotateCw size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(id); }}
              className="p-1 hover:text-red-400 transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function FurnitureLayoutPlanner() {
  const [room, setRoom] = useState({
    width: 500, // cm
    height: 400, // cm
    type: 'bedroom',
    name: 'Main Bedroom'
  });

  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState('library'); // library, setup, tasks, layouts
  const [viewMode, setViewMode] = useState('grid'); // grid, blueprint, minimal
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [savedLayoutsList, setSavedLayoutsList] = useState([]);

  const canvasRef = useRef(null);
  const [canvasScale, setCanvasScale] = useState(1);

  // Initialize
  useEffect(() => {
    const saved = loadLayouts();
    setSavedLayoutsList(saved);
  }, []);

  // Update canvas scale based on container size
  useEffect(() => {
    const updateScale = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        const padding = 40;
        const availableW = container.clientWidth - padding;
        const availableH = container.clientHeight - padding;

        const scaleW = availableW / room.width;
        const scaleH = availableH / room.height;

        setCanvasScale(Math.min(scaleW, scaleH, 1.5));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [room.width, room.height]);

  // Analytics
  const analytics = useMemo(() => {
    const totalArea = (room.width * room.height) / 10000;
    const occupiedArea = items.reduce((acc, item) => acc + (item.width * item.height) / 10000, 0);
    const freeArea = totalArea - occupiedArea;
    const occupancyPercentage = Math.round((occupiedArea / totalArea) * 100);

    const overlaps = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (detectOverlap(items[i], items[j])) {
          overlaps.push({ a: items[i].label, b: items[j].label });
        }
      }
    }

    return {
      totalArea: totalArea.toFixed(2),
      occupiedArea: occupiedArea.toFixed(2),
      freeArea: freeArea.toFixed(2),
      occupancyPercentage,
      overlaps
    };
  }, [items, room]);

  const addItem = (type) => {
    const furniture = FURNITURE_TYPES.find(f => f.id === type);
    if (!furniture) return;

    const newItem = {
      ...furniture,
      id: Date.now(),
      x: room.width / 2 - furniture.width / 2,
      y: room.height / 2 - furniture.height / 2,
      rotation: 0
    };

    setItems([...items, newItem]);
    setSelectedId(newItem.id);
  };

  const updateItem = (id, updates) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const saveCurrentLayout = () => {
    const name = prompt("Enter layout name:", `Layout ${savedLayoutsList.length + 1}`);
    if (!name) return;

    const newLayout = {
      id: Date.now(),
      name,
      room,
      items,
      timestamp: new Date().toISOString()
    };

    const newList = [...savedLayoutsList, newLayout];
    setSavedLayoutsList(newList);
    saveLayouts(newList);
  };

  const loadLayout = (layout) => {
    setRoom(layout.room);
    setItems(layout.items);
  };

  const resetLayout = () => {
    if (window.confirm("Are you sure you want to reset the current layout?")) {
      setItems([]);
      setSelectedId(null);
    }
  };

  return (
    <div className="min-h-screen bg-(--background) px-4 py-12 font-secondary selection:bg-blue-500/30">
      <div className="max-w-[1600px] mx-auto">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel: Sidebar & Controls */}
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-4 p-1.5 bg-(--card) border border-(--border) rounded-2xl w-full mb-6 gap-1">
              {[
                { id: 'library', icon: Plus, label: 'Add' },
                { id: 'setup', icon: Scaling, label: 'Room' },
                { id: 'tasks', icon: CheckCircle2, label: 'Tasks' },
                { id: 'layouts', icon: History, label: 'Saved' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 min-w-0 ${
                    activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-muted-foreground hover:text-(--foreground) hover:bg-blue-500/5'
                  }`}
                >
                  <tab.icon size={16} className="shrink-0" />
                  <span className="text-[8px] font-black uppercase tracking-tighter truncate w-full text-center">{tab.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'library' && (
                <GlassCard key="library" title="Furniture Library" icon={Plus}>
                  <div className="grid grid-cols-2 gap-3">
                    {FURNITURE_TYPES.map(f => (
                      <button
                        key={f.id}
                        onClick={() => addItem(f.id)}
                        className="p-4 rounded-2xl bg-(--background) border border-(--border) hover:border-blue-500/50 transition-all group flex flex-col items-center gap-2 overflow-hidden min-w-0"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <Box size={20} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-tight text-center w-full truncate px-1" title={f.label}>
                          {f.label}
                        </span>
                        <span className="text-[7px] text-muted-foreground italic truncate w-full text-center">
                          {f.width}x{f.height} cm
                        </span>
                      </button>
                    ))}
                  </div>
                </GlassCard>
              )}

              {activeTab === 'setup' && (
                <GlassCard key="setup" title="Room Configuration" icon={Scaling}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Room Name</label>
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) => setRoom({ ...room, name: e.target.value })}
                        className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors"
                      />
                    </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 min-w-0">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block truncate">Width (cm)</label>
                          <input
                            type="number"
                            value={room.width}
                            onChange={(e) => setRoom({ ...room, width: Number(e.target.value) })}
                            className="w-full bg-(--background) border border-(--border) rounded-xl px-3 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-2 min-w-0">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block truncate">Height (cm)</label>
                          <input
                            type="number"
                            value={room.height}
                            onChange={(e) => setRoom({ ...room, height: Number(e.target.value) })}
                            className="w-full bg-(--background) border border-(--border) rounded-xl px-3 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Room Type</label>
                      <div className="grid grid-cols-1 gap-2">
                        {ROOM_TYPES.map(type => (
                          <button
                            key={type.id}
                            onClick={() => setRoom({ ...room, type: type.id })}
                            className={`py-3 px-4 rounded-xl transition-all border text-[11px] font-bold uppercase flex items-center justify-between ${room.type === type.id
                                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/50'
                              }`}
                          >
                            <span>{type.label}</span>
                            <ArrowRight size={14} className={room.type === type.id ? 'opacity-100' : 'opacity-0'} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {activeTab === 'tasks' && (
                <GlassCard key="tasks" title="Planning Tasks" icon={CheckCircle2}>
                  <div className="space-y-3">
                    {tasks.map(task => (
                      <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${task.completed
                          ? 'bg-blue-500/5 border-blue-500/20 text-blue-500'
                          : 'bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/30'
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-blue-500 border-blue-500' : 'border-(--border) group-hover:border-blue-500/50'
                            }`}>
                            {task.completed && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <span className={`text-[11px] font-bold ${task.completed ? 'line-through opacity-70' : ''}`}>{task.text}</span>
                        </div>
                      </button>
                    ))}
                    <div className="pt-4 mt-4 border-t border-(--border)">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Progress</span>
                        <span className="text-xs font-black text-blue-500">
                          {Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-blue-500/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                          className="h-full bg-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              )}

              {activeTab === 'layouts' && (
                <GlassCard key="layouts" title="Saved Layouts" icon={History}>
                  <div className="space-y-3">
                    {savedLayoutsList.length > 0 ? (
                      savedLayoutsList.map(layout => (
                        <div key={layout.id} className="p-4 rounded-2xl bg-(--background) border border-(--border) hover:border-blue-500/30 transition-all flex items-center justify-between">
                          <div>
                            <h4 className="text-[11px] font-bold text-(--foreground)">{layout.name}</h4>
                            <p className="text-[9px] text-muted-foreground">{new Date(layout.timestamp).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadLayout(layout)}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                            >
                              <ArrowRight size={14} />
                            </button>
                            <button
                              onClick={() => {
                                const newList = savedLayoutsList.filter(l => l.id !== layout.id);
                                setSavedLayoutsList(newList);
                                saveLayouts(newList);
                              }}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <History size={30} className="mx-auto text-muted-foreground/20 mb-2" />
                        <p className="text-[10px] text-muted-foreground">No saved layouts yet.</p>
                      </div>
                    )}
                    <button
                      onClick={saveCurrentLayout}
                      className="w-full mt-4 py-3 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={14} />
                      Save Current
                    </button>
                  </div>
                </GlassCard>
              )}
            </AnimatePresence>
          </div>

          {/* Main Panel: Canvas */}
          <div className="lg:col-span-6 space-y-6 h-full min-h-[600px] flex flex-col">
            <GlassCard className="flex-1 flex flex-col relative !p-0 overflow-hidden min-h-[600px]" headerActions={
              <div className="flex p-1 bg-blue-500/5 rounded-xl border border-blue-500/10 absolute top-4 right-4 z-50">
                {[
                  { id: 'grid', icon: Grid3X3 },
                  { id: 'blueprint', icon: Layout },
                  { id: 'minimal', icon: Square }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`p-2 rounded-lg transition-all ${viewMode === mode.id ? 'bg-blue-500 text-white' : 'text-muted-foreground hover:text-blue-500'
                      }`}
                  >
                    <mode.icon size={16} />
                  </button>
                ))}
              </div>
            }>
              <div
                className={`flex-1 w-full h-full flex items-center justify-center relative transition-colors duration-500 ${viewMode === 'blueprint' ? 'bg-[#0f172a]' : viewMode === 'minimal' ? 'bg-(--background)' : 'bg-(--background)'
                  }`}
                onClick={() => setSelectedId(null)}
              >
                {/* Grid Overlay */}
                {viewMode !== 'minimal' && (
                  <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
                    backgroundSize: `${20 * canvasScale}px ${20 * canvasScale}px`
                  }} />
                )}

                {/* Room Boundary */}
                <motion.div
                  layout
                  ref={canvasRef}
                  className={`relative border-2 transition-all duration-300 ${viewMode === 'blueprint' ? 'border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.1)]' : 'border-blue-500/30'
                    }`}
                  style={{
                    width: room.width * canvasScale,
                    height: room.height * canvasScale,
                    backgroundColor: viewMode === 'blueprint' ? 'rgba(59,130,246,0.02)' : 'transparent'
                  }}
                >
                  {/* Furniture Items */}
                  <AnimatePresence>
                    {items.map(item => (
                      <FurnitureItem
                        key={item.id}
                        item={item}
                        canvasScale={canvasScale}
                        isSelected={selectedId === item.id}
                        snapToGrid={snapToGrid}
                        onSelect={setSelectedId}
                        onUpdate={updateItem}
                        onDelete={deleteItem}
                      />
                    ))}
                  </AnimatePresence>

                  {/* Room Label */}
                  <div className="absolute top-2 left-2 pointer-events-none opacity-30 select-none">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{room.name}</span>
                    <div className="text-[8px] font-bold text-muted-foreground">{room.width} x {room.height} cm</div>
                  </div>
                </motion.div>

                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-bold text-white flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => setSnapToGrid(!snapToGrid)}>
                    <Magnet size={10} className={snapToGrid ? "text-blue-400" : "text-gray-400"} />
                    Snap: {snapToGrid ? 'ON' : 'OFF'}
                  </div>
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-bold text-white flex items-center gap-2">
                    <Move size={10} className="text-blue-400" />
                    Drag to move
                  </div>
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[9px] font-bold text-white flex items-center gap-2">
                    <RotateCw size={10} className="text-blue-400" />
                    Click to rotate
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right Panel: Analytics & Stats */}
          <div className="lg:col-span-3 space-y-6">
            <GlassCard title="Space Analytics" icon={Info}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-2xl bg-(--background) border border-(--border)">
                    <div className="text-[8px] font-black text-muted-foreground uppercase mb-1 tracking-widest">Total Area</div>
                    <div className="text-xl font-black text-blue-500">{analytics.totalArea} m²</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-(--background) border border-(--border)">
                    <div className="text-[8px] font-black text-muted-foreground uppercase mb-1 tracking-widest">Occupied Area</div>
                    <div className="text-xl font-black text-blue-500">{analytics.occupiedArea} m²</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Occupancy</span>
                    <span className={`text-xs font-black ${analytics.occupancyPercentage > 70 ? 'text-amber-500' : 'text-blue-500'}`}>
                      {analytics.occupancyPercentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-blue-500/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analytics.occupancyPercentage}%` }}
                      className={`h-full ${analytics.occupancyPercentage > 70 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    />
                  </div>
                </div>

                {/* Overlap Warnings */}
                {analytics.overlaps.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-amber-500">
                      <AlertTriangle size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Overlap Detected</span>
                    </div>
                    <div className="space-y-1">
                      {analytics.overlaps.map((over, idx) => (
                        <p key={idx} className="text-[9px] text-muted-foreground leading-tight italic">
                          • {over.a} is colliding with {over.b}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                  <div className="flex items-center gap-2 text-blue-500">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Optimization Insight</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                    {analytics.occupancyPercentage < 30
                      ? "Consider adding more elements like rugs or side tables to fill the space."
                      : analytics.occupancyPercentage > 60
                        ? "Space is becoming crowded. Ensure clear walking paths between items."
                        : "Layout balance looks optimal. Walking area is well-maintained."}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard title="Controls" icon={Settings}>
              <div className="space-y-3">
                <button
                  onClick={resetLayout}
                  className="w-full py-3 px-3 rounded-xl bg-(--background) border border-red-500/30 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} />
                  <span>Reset Layout</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full py-3 px-3 rounded-xl bg-(--background) border border-(--border) text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:border-blue-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  <span>Export PDF</span>
                </button>
              </div>
            </GlassCard>
          </div>

        </div>

        {/* Technical Footer */}
        <div className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-8 opacity-60 hover:opacity-100 transition-opacity">
          {[
            { icon: Square, title: "Precision Grid", desc: "Our layout system uses a 1:1 centimeter mapping for accurate physical representation." },
            { icon: Scaling, title: "Dynamic Scaling", desc: "Real-time canvas scaling ensures your design fits perfectly on any screen size." },
            { icon: Save, title: "Session Sync", desc: "Your progress is automatically cached to your local browser storage." }
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
