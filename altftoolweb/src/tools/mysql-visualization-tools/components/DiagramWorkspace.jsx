"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import TableNode from "./TableNode";

const nodeTypes = { tableNode: TableNode };

export default function DiagramWorkspace({
  nodes: sourceNodes,
  edges: sourceEdges,
  onPositionsChange,
  diagramRef,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(sourceNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(sourceEdges);
  const lastIds = useRef("");

  const signature = useMemo(
    () =>
      JSON.stringify({
        nodes: sourceNodes.map((node) => ({
          id: node.id,
          table: node.data?.label?.table,
          position: node.position,
        })),
        edges: sourceEdges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
        })),
      }),
    [sourceNodes, sourceEdges]
  );

  useEffect(() => {
    if (lastIds.current !== signature) {
      lastIds.current = signature;
      setNodes(sourceNodes);
      setEdges(sourceEdges);
    }
  }, [signature, sourceNodes, sourceEdges, setNodes, setEdges]);

  const handleNodeDragStop = useCallback(
    (_, node) => {
      onPositionsChange((current) => ({
        ...current,
        [node.id]: node.position,
      }));
    },
    [onPositionsChange]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative z-10 min-w-0 overflow-hidden rounded-xl border border-(--border) bg-[#020617]"
    >
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
        <div className="min-w-0">
          <h2 className="break-words text-lg font-bold leading-tight">Live ER Diagram</h2>
          <p className="break-words text-sm leading-5 text-slate-400">
            Drag, pan, zoom, and export the generated schema.
          </p>
        </div>
      </div>

      <div ref={diagramRef} className="h-[400px] min-h-[340px] w-full sm:h-[460px]">
        {nodes.length ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={handleNodeDragStop}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            minZoom={0.2}
            maxZoom={1.8}
          >
            <Background color="#155e75" gap={24} />
            <MiniMap pannable zoomable nodeStrokeColor="#22d3ee" nodeColor="#0f172a" />
            <Controls />
          </ReactFlow>
        ) : (
          <div className="grid h-full place-items-center px-6 text-center text-slate-400">
            <div>
              <p className="text-lg font-bold text-cyan-100">No schema visualized yet</p>
              <p className="mt-2 max-w-md text-sm">
                Add valid MySQL CREATE TABLE statements to generate tables and relationships.
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
