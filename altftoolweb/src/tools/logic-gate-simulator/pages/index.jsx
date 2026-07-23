"use client";

import { useState, useEffect } from "react";
import { GitBranch, FolderOpen, Save, Trash2, Minimize2, Maximize2, Sparkles, Cpu, Layers } from "lucide-react";
import ElementLibrary from "../components/ElementLibrary";
import CircuitCanvas from "../components/CircuitCanvas";
import AnalysisPanel from "../components/AnalysisPanel";
import InspectorPanel from "../components/InspectorPanel";
import LottieAnimation from "../components/LottieAnimation";
import { propagateCircuit, generateTruthTable } from "../utils/circuitEngine";

const INITIAL_NODES = [
  {
    id: "toggle_a",
    type: "input",
    gateType: "toggle",
    name: "A",
    x: 80,
    y: 80,
    inputsCount: 0,
    outputsCount: 1,
    state: 1,
    symbol: "TOG",
  },
  {
    id: "toggle_b",
    type: "input",
    gateType: "toggle",
    name: "B",
    x: 80,
    y: 200,
    inputsCount: 0,
    outputsCount: 1,
    state: 0,
    symbol: "TOG",
  },
  {
    id: "and_gate",
    type: "gate",
    gateType: "AND",
    name: "AND Gate",
    x: 260,
    y: 120,
    inputsCount: 2,
    outputsCount: 1,
    symbol: "&",
  },
  {
    id: "output_lamp",
    type: "output",
    gateType: "lamp",
    name: "Output Q",
    x: 440,
    y: 135,
    inputsCount: 1,
    outputsCount: 0,
    symbol: "💡",
  },
];

const INITIAL_CONNECTIONS = [
  { sourceId: "toggle_a", targetId: "and_gate", targetPortIdx: 0 },
  { sourceId: "toggle_b", targetId: "and_gate", targetPortIdx: 1 },
  { sourceId: "and_gate", targetId: "output_lamp", targetPortIdx: 0 },
];

export default function LogicGateSimulator() {
  const [nodes, setNodes] = useState(INITIAL_NODES);
  const [connections, setConnections] = useState(INITIAL_CONNECTIONS);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [zoom, setZoom] = useState(1.0);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [isInspectorCollapsed, setIsInspectorCollapsed] = useState(false);

  // Esc key exits fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Derive circuit propagation state values
  const nodeStates = propagateCircuit(nodes, connections);

  // Derive truth tables based on toggle inputs
  const truthTable = generateTruthTable(nodes, connections);

  // Clock oscillations interval hook
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => (n.gateType === "clock" ? { ...n, state: n.state ? 0 : 1 } : n))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddNode = (preset) => {
    const id = `${preset.gateType}_${Date.now()}`;
    const count = nodes.filter((n) => n.gateType === preset.gateType).length + 1;
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const newNode = {
      ...preset,
      id,
      name: preset.type === "input" ? alphabet[count - 1] || `${preset.name} ${count}` : `${preset.name} ${count}`,
      x: 150,
      y: 150,
      state: 0,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
  };

  const handleUpdateNodeName = (nodeId, newName) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, name: newName } : n))
    );
  };

  const handleDeleteNode = (nodeId) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) =>
      prev.filter((c) => c.sourceId !== nodeId && c.targetId !== nodeId)
    );
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleSaveCircuit = () => {
    const data = JSON.stringify({ nodes, connections }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "logic-circuit-project.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadCircuit = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.nodes && parsed.connections) {
          setNodes(parsed.nodes);
          setConnections(parsed.connections);
          setSelectedNodeId(null);
        }
      } catch (err) {
        alert("Failed to parse circuit file.");
      }
    };
    reader.readAsText(file);
  };

  const handleClearCircuit = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  // Fullscreen Studio Layout
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden select-none" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        {/* Fullscreen Top Bar */}
        <header className="h-10 shrink-0 border-b border-[var(--border)] bg-[var(--surface)] px-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <LottieAnimation className="w-7 h-7" />
            <span className="font-bold text-xs tracking-wide text-[var(--foreground)]">
              Logic Gate Studio & Simulator
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] hover:bg-[var(--surface)] text-xs font-semibold text-[var(--foreground)] transition-colors shadow-2xs cursor-pointer"
            >
              <Minimize2 size={13} /> Exit Fullscreen (Esc)
            </button>
          </div>
        </header>

        {/* 3-Column Studio Body Layout */}
        <div className="flex-1 flex min-h-0">
          {/* Left Collapsible Column: Library */}
          <aside className={`border-r border-[var(--border)] bg-[var(--card)] p-3 overflow-y-auto shrink-0 transition-all duration-200 ${isLibraryCollapsed ? "w-14" : "w-64"}`}>
            <ElementLibrary
              onAddNode={handleAddNode}
              horizontal={false}
              isCollapsed={isLibraryCollapsed}
              onToggleCollapse={() => setIsLibraryCollapsed((prev) => !prev)}
            />
          </aside>

          {/* Center Column: Full-Height Canvas */}
          <main className="flex-1 min-h-0 relative bg-[var(--background)]">
            <CircuitCanvas
              nodes={nodes}
              connections={connections}
              nodeStates={nodeStates}
              onUpdateNodes={setNodes}
              onUpdateConnections={setConnections}
              onSelectNode={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
              zoom={zoom}
              setZoom={setZoom}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(false)}
            />
          </main>

          {/* Right Collapsible Column: Inspector */}
          <aside className={`border-l border-[var(--border)] bg-[var(--card)] p-3 overflow-y-auto shrink-0 transition-all duration-200 ${isInspectorCollapsed ? "w-14" : "w-80"}`}>
            <InspectorPanel
              selectedNode={selectedNode}
              nodeState={selectedNodeId ? nodeStates[selectedNodeId] : null}
              truthTable={truthTable}
              onUpdateNodeName={handleUpdateNodeName}
              onDeleteNode={handleDeleteNode}
              isCollapsed={isInspectorCollapsed}
              onToggleCollapse={() => setIsInspectorCollapsed((prev) => !prev)}
            />
          </aside>
        </div>

        {/* Fullscreen Bottom Status Bar */}
        <footer className="h-6 shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-4 flex items-center justify-between text-[10px] font-mono text-[var(--muted-foreground)]">
          <div className="flex items-center gap-3">
            <span className="text-emerald-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              simulation running (1Hz clock)
            </span>
            <span className="text-[var(--border)]">|</span>
            <span>{nodes.length} nodes placed</span>
            <span className="text-[var(--border)]">|</span>
            <span>{selectedNodeId ? `selected: ${selectedNodeId}` : "0 selected"}</span>
          </div>
          <span>scope: /Projects/Logic-Circuits/Root</span>
        </footer>
      </div>
    );
  }

  // Normal Layout
  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 space-y-4" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      {/* SEO structured JSON-LD data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Logic Gate Simulator",
              description:
                "Flagship visual schematic editor to design, simulate, and optimize digital logic circuits. Supports truth table sweeps and Karnaugh map minimization.",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
          ]),
        }}
      />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto space-y-4">
        {/* Top Header Bar & Hero vector branding */}
        <header className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md overflow-hidden relative">
          {/* Left: Heading Title & Subtitle */}
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)] font-mono text-[10px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
              Browser-Based Gate Studio
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--foreground)]">
              Logic Gate Simulator & Optimizer
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Design, simulate, and optimize digital logic circuits directly in your browser. Real-time truth table sweeps, Karnaugh Map (K-Map) reduction, and diagnostic signal metrics.
            </p>
          </div>

          {/* Right: Big Animated Lottie Logo */}
          <LottieAnimation className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 shrink-0" />
        </header>

        {/* Top Preset Bar & Gate Tools Toolbar */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-md space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[var(--border)] pb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--primary)]" />
              <span className="font-bold text-xs text-[var(--foreground)] uppercase tracking-wider">
                Logic Gate Component Tools (Click to Add Component to Canvas)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] hover:bg-[var(--surface)] text-xs font-semibold text-[var(--foreground)] cursor-pointer shadow-2xs transition-all">
                <FolderOpen size={13} /> Open JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleLoadCircuit}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleSaveCircuit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] hover:bg-[var(--surface)] text-xs font-semibold text-[var(--foreground)] shadow-2xs transition-all cursor-pointer"
              >
                <Save size={13} /> Save Project
              </button>

              <button
                onClick={handleClearCircuit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Trash2 size={13} /> Clear Board
              </button>
            </div>
          </div>

          {/* Prominently Featured Top Gate Tools Bar */}
          <ElementLibrary onAddNode={handleAddNode} horizontal={true} />
        </div>

        {/* Studio Workspace Layout: [ Left Gate Palette Sidebar | Canvas | Right Inspector & K-Map ] */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

          {/* Left Palette Column: Element Library Sidebar */}
          <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-md h-[540px] overflow-y-auto">
            <ElementLibrary onAddNode={handleAddNode} horizontal={false} />
          </div>

          {/* Center Column: Interactive Schematic Canvas Workspace */}
          <div className="lg:col-span-6 h-[540px]">
            <CircuitCanvas
              nodes={nodes}
              connections={connections}
              nodeStates={nodeStates}
              onUpdateNodes={setNodes}
              onUpdateConnections={setConnections}
              onSelectNode={setSelectedNodeId}
              selectedNodeId={selectedNodeId}
              zoom={zoom}
              setZoom={setZoom}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(true)}
            />
          </div>

          {/* Right Inspector & Node Properties Panel */}
          <div className="lg:col-span-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-md h-[540px] overflow-y-auto">
            <InspectorPanel
              selectedNode={selectedNode}
              nodeState={selectedNodeId ? nodeStates[selectedNodeId] : null}
              truthTable={truthTable}
              onUpdateNodeName={handleUpdateNodeName}
              onDeleteNode={handleDeleteNode}
            />
          </div>

        </div>

        {/* Status Bar */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-[var(--muted-foreground)] font-mono gap-2 shadow-sm hover:border-[var(--primary)]/30 transition-all">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              simulation running (1Hz clock oscillation)
            </span>
            <span className="text-[var(--border)]">|</span>
            <span className="text-[var(--foreground)] font-semibold">{nodes.length} nodes placed</span>
            <span className="text-[var(--border)]">|</span>
            <span className="text-[var(--primary)] font-bold">{selectedNodeId ? `selected: ${selectedNodeId}` : "0 selected"}</span>
          </div>

          <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
            scope: /Projects/Logic-Circuits/Root
          </div>
        </div>

        {/* Quick Tips & Interactive Workflow Insight Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 transition-all space-y-1 shadow-sm">
            <span className="font-bold text-[11px] text-[var(--foreground)] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-mono text-[10px] font-bold">1</span>
              Add Component Tools
            </span>
            <p className="text-[10px] text-[var(--muted-foreground)]">Click any gate tool preset in the topbar or sidebar library to place AND, OR, NOT, NAND, NOR, XOR, or XNOR gates on the canvas grid.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 transition-all space-y-1 shadow-sm">
            <span className="font-bold text-[11px] text-[var(--foreground)] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-mono text-[10px] font-bold">2</span>
              Route Dynamic Signal Wires
            </span>
            <p className="text-[10px] text-[var(--muted-foreground)]">Click an output port dot, then click a gate input port dot to create dynamic logic signal wires with pulse flows.</p>
          </div>

          <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40 transition-all space-y-1 shadow-sm">
            <span className="font-bold text-[11px] text-[var(--foreground)] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-mono text-[10px] font-bold">3</span>
              Analyze & Optimize Boolean Expressions
            </span>
            <p className="text-[10px] text-[var(--muted-foreground)]">Review derived Truth Tables, K-Map matrices, and minimized Boolean Sum-of-Products equations below.</p>
          </div>
        </div>

        {/* Inspector & Boolean Analysis Panel */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-md hover:border-[var(--primary)]/20 transition-all">
          <AnalysisPanel truthTable={truthTable} nodes={nodes} connections={connections} />
        </div>
      </div>
    </div>
  );
}
