"use client";

import { useState, useRef } from "react";
import { ZoomIn, ZoomOut, RefreshCw, Trash2, Maximize2, Minimize2 } from "lucide-react";
import { SIGNALS } from "../utils/circuitEngine";

export default function CircuitCanvas({
  nodes,
  connections,
  nodeStates,
  onUpdateNodes,
  onUpdateConnections,
  onSelectNode,
  selectedNodeId,
  zoom,
  setZoom,
  isFullscreen,
  onToggleFullscreen,
}) {
  const canvasRef = useRef(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [activeConnection, setActiveConnection] = useState(null); // { sourceId, portIdx }

  // Drag node handling
  const handleMouseDown = (e, node) => {
    e.stopPropagation();
    if (e.button === 0) {
      setDraggedNode({
        id: node.id,
        startX: node.x,
        startY: node.y,
        mouseStartX: e.clientX,
        mouseStartY: e.clientY,
      });
      onSelectNode(node.id);
    }
  };

  const handleMouseMove = (e) => {
    if (draggedNode) {
      const dx = (e.clientX - draggedNode.mouseStartX) / zoom;
      const dy = (e.clientY - draggedNode.mouseStartY) / zoom;
      onUpdateNodes((prev) =>
        prev.map((n) =>
          n.id === draggedNode.id
            ? { ...n, x: Math.round((draggedNode.startX + dx) / 10) * 10, y: Math.round((draggedNode.startY + dy) / 10) * 10 }
            : n
        )
      );
    } else if (isPanning) {
      setPan((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
      }));
    } else if (activeConnection) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setActiveConnection((prev) => ({
        ...prev,
        targetX: (e.clientX - rect.left - pan.x) / zoom,
        targetY: (e.clientY - rect.top - pan.y) / zoom,
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsPanning(false);
  };

  // Wire Connection management
  const handlePortClick = (e, node, portIdx, portType) => {
    e.stopPropagation();
    if (portType === "output") {
      setActiveConnection({
        sourceId: node.id,
        portIdx,
        targetX: node.x + 100,
        targetY: node.y + 35,
      });
    } else if (portType === "input" && activeConnection) {
      // Connect output to input
      const exists = connections.some(
        (c) => c.targetId === node.id && c.targetPortIdx === portIdx
      );

      if (!exists) {
        onUpdateConnections((prev) => [
          ...prev,
          {
            sourceId: activeConnection.sourceId,
            targetId: node.id,
            targetPortIdx: portIdx,
          },
        ]);
      }
      setActiveConnection(null);
    }
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current || e.target.tagName === "svg") {
      onSelectNode(null);
      setActiveConnection(null);
    }
  };

  const handleDeleteSelectedNode = () => {
    if (!selectedNodeId) return;
    onUpdateNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    onUpdateConnections((prev) =>
      prev.filter((c) => c.sourceId !== selectedNodeId && c.targetId !== selectedNodeId)
    );
    onSelectNode(null);
  };

  // Get wiring SVG path coords
  const getPortCoords = (nodeId, portIdx, type) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    if (type === "output") {
      return {
        x: node.x + 100,
        y: node.y + 35,
      };
    } else {
      // inputs stacked on the left
      const spacing = 70 / (node.inputsCount + 1);
      return {
        x: node.x,
        y: node.y + spacing * (portIdx + 1),
      };
    }
  };

  // Wire coloring based on signal value
  const getSignalColor = (sourceId) => {
    const state = nodeStates[sourceId];
    if (!state) return "#94A3B8"; // Gray
    if (state.output === SIGNALS.HIGH) return "#10B981"; // Green glow
    if (state.output === SIGNALS.LOW) return "#64748B"; // Muted slate
    return "#EF4444"; // Red error
  };

  return (
    <div
      className={`w-full h-full relative select-none overflow-hidden ${
        isFullscreen ? "" : "rounded-2xl border border-[var(--border)] shadow-md bg-[var(--card)]"
      }`}
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Canvas Floating Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 rounded-xl border border-[var(--border)] bg-black/70 backdrop-blur shadow-md">
        <button
          onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
          className="p-2 rounded-lg hover:bg-white/10 text-white text-xs cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <span className="font-mono text-[10px] w-12 text-center text-white font-bold">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
          className="p-2 rounded-lg hover:bg-white/10 text-white text-xs cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => setPan({ x: 0, y: 0 })}
          className="p-2 rounded-lg hover:bg-white/10 text-white text-xs border-l border-white/20 pl-3 cursor-pointer"
          title="Reset Pan"
        >
          <RefreshCw size={14} />
        </button>
        {selectedNodeId && (
          <button
            onClick={handleDeleteSelectedNode}
            className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 text-xs border-l border-white/20 pl-3 cursor-pointer"
            title="Delete Selected Component"
          >
            <Trash2 size={14} />
          </button>
        )}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg hover:bg-white/10 text-white text-xs border-l border-white/20 pl-3 cursor-pointer"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View Mode"}
        >
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* Primary schematic working grid */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
        onMouseDown={(e) => {
          if (e.target === canvasRef.current || e.target.tagName === "svg") {
            setIsPanning(true);
          }
        }}
        className="w-full h-full min-h-[480px] bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-[size:20px_20px] relative cursor-grab active:cursor-grabbing select-none"
        style={{
          backgroundColor: "var(--background)",
        }}
      >
        <div
          className="absolute inset-0 origin-top-left pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* SVG Wires Layer */}
          <svg className="absolute inset-0 w-[5000px] h-[5000px] overflow-visible pointer-events-auto">
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 2 L 10 5 L 0 8 z" fill="#64748B" />
              </marker>
            </defs>

            {/* Placed Connection Wires */}
            {connections.map((conn, idx) => {
              const start = getPortCoords(conn.sourceId, 0, "output");
              const end = getPortCoords(conn.targetId, conn.targetPortIdx, "input");
              const color = getSignalColor(conn.sourceId);

              // Draw bezier curve paths
              const dx = Math.abs(end.x - start.x) * 0.5;
              const path = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;

              return (
                <g key={idx}>
                  <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth="3.5"
                    className="transition-all"
                  />
                  {/* Glowing signal flow dots */}
                  {nodeStates[conn.sourceId]?.output === SIGNALS.HIGH && (
                    <circle r="4" fill="#34D399" className="animate-pulse">
                      <animateMotion dur="2.5s" repeatCount="indefinite" path={path} />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Temporary drag-and-wire line */}
            {activeConnection && (() => {
              const start = getPortCoords(activeConnection.sourceId, 0, "output");
              const { targetX, targetY } = activeConnection;

              const dx = Math.abs(targetX - start.x) * 0.5;
              const path = `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${targetX - dx} ${targetY}, ${targetX} ${targetY}`;

              return (
                <path
                  d={path}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            })()}
          </svg>

          {/* Draggable Node Blocks */}
          <div className="absolute inset-0 pointer-events-none">
            {nodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const state = nodeStates[node.id];
              const highOutput = state?.output === SIGNALS.HIGH;

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleMouseDown(e, node)}
                  className={`absolute w-[100px] h-[70px] rounded-xl border flex flex-col justify-between p-2 cursor-grab active:cursor-grabbing pointer-events-auto transition-shadow shadow-md ${
                    isSelected
                      ? "border-[var(--primary)] shadow-lg ring-2 ring-[var(--primary)]/30"
                      : "border-[var(--border)] bg-[var(--card)]"
                  }`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    backgroundColor: "var(--card)",
                  }}
                >
                  {/* Node Title */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[8px] tracking-wider text-[var(--muted-foreground)] uppercase truncate w-[85px]">
                      {node.name}
                    </span>
                  </div>

                  {/* Node Symbol display */}
                  <div className="flex-1 flex items-center justify-center font-mono font-extrabold text-sm text-[var(--foreground)]">
                    {node.gateType === "toggle" ? (
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() =>
                          onUpdateNodes((prev) =>
                            prev.map((n) =>
                              n.id === node.id ? { ...n, state: n.state ? 0 : 1 } : n
                            )
                          )
                        }
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-black border transition cursor-pointer ${
                          node.state
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                            : "bg-[var(--surface-soft)] text-[var(--foreground)] border-[var(--border)]"
                        }`}
                      >
                        {node.state ? "ON" : "OFF"}
                      </button>
                    ) : node.gateType === "lamp" ? (
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                          highOutput
                            ? "bg-emerald-500/25 border-emerald-500 text-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse"
                            : "bg-red-500/10 border-red-500/30 text-red-500"
                        }`}
                      >
                        💡
                      </div>
                    ) : (
                      node.symbol
                    )}
                  </div>

                  {/* Ports handles overlay */}
                  {/* Outputs */}
                  {node.outputsCount > 0 && (
                    <div
                      onClick={(e) => handlePortClick(e, node, 0, "output")}
                      className="absolute right-[-5px] top-[31px] w-3 h-3 rounded-full border border-[var(--border)] bg-slate-300 hover:bg-[var(--primary)] cursor-crosshair z-20 transition-colors shadow-2xs"
                      title="Drag connection wire from output"
                    />
                  )}

                  {/* Inputs */}
                  {Array.from({ length: node.inputsCount }).map((_, portIdx) => {
                    const spacing = 70 / (node.inputsCount + 1);
                    return (
                      <div
                        key={portIdx}
                        onClick={(e) => handlePortClick(e, node, portIdx, "input")}
                        className={`absolute left-[-5px] w-3 h-3 rounded-full border z-20 cursor-crosshair transition-colors shadow-2xs ${
                          activeConnection
                            ? "bg-amber-300 border-amber-500 hover:bg-emerald-400"
                            : "bg-slate-300 border-[var(--border)]"
                        }`}
                        style={{
                          top: `${spacing * (portIdx + 1) - 6}px`,
                        }}
                        title="Connect wire destination to input"
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
