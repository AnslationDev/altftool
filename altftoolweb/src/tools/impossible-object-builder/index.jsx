"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { 
  Shapes, 
  MousePointer2, 
  Move, 
  RotateCw, 
  Maximize2, 
  Trash2, 
  Copy, 
  Layers, 
  Download, 
  Share2, 
  Info, 
  Brain, 
  Sparkles, 
  Eye, 
  Box, 
  Cylinder, 
  Triangle, 
  Plus, 
  Camera,
  RotateCcw,
  Maximize,
  ChevronRight
} from 'lucide-react';

// Local Imports
import CanvasScene from './components/CanvasScene';
import ShapeLibrary from './components/ShapeLibrary';
import ObjectInspector from './components/ObjectInspector';
import FloatingControls from './components/FloatingControls';
import { useCameraLock } from './hooks/useCameraLock';
import { useIllusionMode } from './hooks/useIllusionMode';
import { exportToJSON } from './utils/exportUtils';
import './styles/illusion.css';

// --- Ambient Background ---
function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute left-[5%] top-[10%] h-48 w-48 rounded-full bg-(--primary) opacity-5 blur-3xl"
        animate={{ x: [0, 20, -10, 0], y: [0, -15, 15, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
      />
    </div>
  );
}

// --- Scientific Education Section ---
function ScientificEducation() {
  const sections = [
    {
      title: "Impossible Geometry",
      content: "These structures utilize forced perspective to align disconnected edges in 3D space, creating mathematical paradoxes.",
      icon: <Shapes size={18} className="text-(--primary)" />
    },
    {
      title: "Visual Alignment",
      content: "The camera must be at a precise isometric angle to perceive the illusion. Moving the camera reveals the cognitive trick.",
      icon: <Brain size={18} className="text-(--primary)" />
    },
    {
      title: "Cognitive Logic",
      content: "Escher-style structures exploit the tendency to prioritize 2D visual continuity over 3D physical reality.",
      icon: <Sparkles size={18} className="text-(--primary)" />
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center bg-(--background) text-(--secondary) p-4 border border-(--border) rounded-lg mt-8">
      {sections.map((s, i) => (
        <div key={i} className="bg-(--background) text-(--muted-foreground) rounded-lg p-5 border border-(--border) flex flex-col items-center space-y-2">
          <div className="p-2.5 bg-(--primary)/5 rounded-full mb-1">
            {s.icon}
          </div>
          <h4 className="text-[11px] font-black text-(--foreground) uppercase tracking-[0.1em]">{s.title}</h4>
          <p className="text-[10px] text-(--secondary) leading-relaxed">
            {s.content}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function ImpossibleObjectBuilder() {
  const [objects, setObjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const { isLocked, setIsLocked } = useCameraLock();
  const { isIllusionMode, toggleMode } = useIllusionMode();

  const selectedObject = useMemo(() => 
    objects.find(obj => obj.id === selectedId), 
  [objects, selectedId]);

  const handleUpdateObject = useCallback((updates) => {
    setObjects(prev => prev.map(obj => 
      obj.id === (selectedId || updates.id) ? { ...obj, ...updates } : obj
    ));
  }, [selectedId]);

  const handleAddShape = useCallback((type) => {
    const newShape = {
      id: uuidv4(),
      type: type,
      position: [objects.length * 0.5, 0, 0], // Offset new shapes
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#3b82f6'
    };
    setObjects(prev => [...prev, newShape]);
    setSelectedId(newShape.id);
  }, [objects.length]);

  const handleAddPreset = useCallback((presetObjects) => {
    setObjects(presetObjects);
    setSelectedId(presetObjects[0]?.id);
    setIsLocked(true);
  }, [setIsLocked]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    setObjects(prev => prev.filter(obj => obj.id !== selectedId));
    setSelectedId(null);
  }, [selectedId]);

  const handleDuplicate = useCallback(() => {
    if (!selectedObject) return;
    const newShape = {
      ...selectedObject,
      id: uuidv4(),
      position: [selectedObject.position[0] + 0.5, selectedObject.position[1], selectedObject.position[2]]
    };
    setObjects(prev => [...prev, newShape]);
    setSelectedId(newShape.id);
  }, [selectedObject]);

  const handleExport = useCallback((type) => {
    if (type === 'png') {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'impossible-illusion.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    } else if (type === 'json') {
      exportToJSON(objects);
    }
  }, [objects]);

  return (
    <div className="impossible-object-builder relative min-h-screen bg-(--background) text-(--foreground) selection:bg-(--primary) selection:text-white overflow-x-hidden px-4 py-4 md:py-8">
      <AmbientBackground />

      <div className="relative z-10 max-w-5xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-(--background) text-(--primary) text-center"
        >
          <h1 className="heading flex justify-center gap-2 animate-fade-up text-4xl md:text-6xl">
            Impossible Object Builder
          </h1>
          <p className="description opacity-80 mt-1 text-(--secondary) text-lg md:text-xl animate-fade-up">
            Construct mathematically impossible 3D visual paradoxes
          </p>
        </motion.div>

        {/* Main Card Wrapper */}
        <div className="bg-(--card) rounded-xl shadow-lg border border-(--border) overflow-hidden">
            <div className="p-4 md:p-6 space-y-6">
                {/* 3D Canvas Section */}
                <div className="space-y-3">
                    <div className="relative">
                        <div className={`canvas-wrapper transition-all duration-500 overflow-hidden rounded-lg border border-(--border) bg-black relative`}>
                            <div className="flex flex-col md:flex-row h-full w-full min-h-[400px] md:min-h-[500px]">
                                <div className="flex-1 relative border-b md:border-b-0 md:border-r border-white/5 h-full">
                                    <div className="absolute left-3 top-3 z-30 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                                        <span className={`h-1.5 w-1.5 rounded-full ${isLocked ? 'bg-green-500' : 'bg-(--primary)'}`} />
                                        {isLocked ? 'Isometric Perspective' : 'Free Look'}
                                    </div>
                                    <CanvasScene 
                                        objects={objects} 
                                        selectedId={selectedId} 
                                        onSelect={setSelectedId} 
                                        isLocked={isLocked} 
                                        onUpdate={handleUpdateObject}
                                    />
                                </div>
                                
                                {!isIllusionMode && (
                                    <motion.div 
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: '100%', opacity: 1 }}
                                        className="relative bg-zinc-950 flex-1 h-full"
                                    >
                                        <div className="absolute left-3 top-3 z-30 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                            Reality Perspective (Unlocked)
                                        </div>
                                        <CanvasScene 
                                            objects={objects} 
                                            selectedId={selectedId} 
                                            onSelect={setSelectedId} 
                                            isLocked={false} 
                                            onUpdate={handleUpdateObject}
                                        />
                                    </motion.div>
                                )}
                            </div>

                            {/* Floating Controls */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
                                <FloatingControls 
                                    isLocked={isLocked}
                                    onToggleLock={() => setIsLocked(!isLocked)}
                                    isIllusionMode={isIllusionMode}
                                    onToggleMode={toggleMode}
                                    onExport={handleExport}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Control Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-4">
                        <ShapeLibrary onAddShape={handleAddShape} onAddPreset={handleAddPreset} />
                    </div>
                    
                    <div className="lg:col-span-5">
                        <ObjectInspector selectedObject={selectedObject} onUpdate={handleUpdateObject} onDelete={handleDelete} onDuplicate={handleDuplicate} />
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-(--background) p-4 md:p-5 rounded-lg border border-(--border) h-full flex flex-col space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 px-1 text-(--primary)">
                                    <Sparkles size={14} />
                                    <h3 className="text-[10px] font-black uppercase tracking-wider">Actions</h3>
                                </div>
                                
                                <div className="space-y-2">
                                    <button onClick={() => setObjects([])} className="w-full py-2.5 rounded-md bg-(--background) border border-(--border) text-(--secondary) text-[9px] font-black uppercase tracking-widest hover:border-red-500/30 hover:text-red-500 transition-all cursor-pointer flex items-center justify-center gap-2">
                                        <RotateCcw size={12} /> Clear
                                    </button>
                                    <button onClick={() => handleExport('json')} className="w-full py-2.5 rounded-md bg-(--background) border border-(--border) text-(--secondary) text-[9px] font-black uppercase tracking-widest hover:border-(--primary)/30 hover:text-(--primary) transition-all cursor-pointer flex items-center justify-center gap-2">
                                        <Share2 size={12} /> Export
                                    </button>
                                    <button onClick={() => handleExport('png')} className="w-full py-3 rounded-md bg-(--primary) text-white text-[9px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                                        <Camera size={12} /> Take Snap
                                    </button>
                                </div>
                            </div>

                            <div className="mt-auto p-3 rounded-md bg-(--primary)/5 border border-(--primary)/10 text-center">
                                <p className="text-[9px] text-(--secondary) font-bold italic opacity-70">
                                    "Build your own 3D paradox"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Education Section */}
        <ScientificEducation />

        {/* Footer */}
        <footer className="pt-6 border-t border-(--border)">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-black uppercase tracking-widest text-(--secondary)">
                <div className="flex gap-4">
                    <span>WEBGL ENGINE</span>
                    <span>ISOMETRIC LOGIC</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-(--primary) transition-colors cursor-pointer group">
                    EXPLORE MORE <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
}
