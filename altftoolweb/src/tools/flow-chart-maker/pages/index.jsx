import { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import {
  Download,
  Plus,
  Trash2,
  ArrowLeft,
  Workflow,
  Edit3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Sidebar } from '../components/sidebar';
import { ProcessNode } from '../nodes/processNode';
import { DecisionNode } from '../nodes/decisionNode';
import { StartNode } from '../nodes/startNode';
import { IONode } from '../nodes/IONode';
import { DatabaseNode } from '../nodes/dataBaseNode';
import { DocumentNode } from '../nodes/documentNode';
import { CommentNode } from '../nodes/commentNode';
import { SubprocessNode } from '../nodes/subProcessNode';
import { demoEdges, demoNodes } from '../data/demoFlowChart';
import { Button } from '@/shared/ui/Button';
import Description from "../components/Description";

const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  startEnd: StartNode,
  ioNode: IONode,
  database: DatabaseNode,
  document: DocumentNode,
  comment: CommentNode,
  subprocess: SubprocessNode,
};

const defaultEdgeOptions = {
  style: { strokeWidth: 2, stroke: '#6366f1' },
  type: 'smoothstep',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: '#6366f1',
  },
  animated: true,
};

let nodeIdCounter = 1;
const getNodeId = () => `node_${nodeIdCounter++}_${Date.now()}`;

function FlowChartEditor() {
  const [isCreating, setIsCreating] = useState(false);
  const [flowchartTitle, setFlowchartTitle] = useState('My Flowchart');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [dNodes] = useNodesState(demoNodes);
  const [dEdges] = useEdgesState(demoEdges);

  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds));
    },
    [setEdges]
  );

  const handleStartCreating = () => {
    setIsCreating(true);
    setNodes([]);
    setEdges([]);
  };

  const handleBackToDemo = () => {
    setIsCreating(false);
    setNodes([]);
    setEdges([]);
    setFlowchartTitle('My Flowchart');
  };

  // ==========================
  // 🔹 DEMO VIEW
  // ==========================
  if (!isCreating) {
    return (
      <div>

        <h1 className="heading text-center pt-5">
          Flow Chart Maker
        </h1>

        <p className="description text-center pt-1">
          Create flowcharts with ease for your project working flow process.
        </p>

        <div className="h-screen flex overflow-hidden">

  {/* Sidebar */}
  <div
    className={`${
      sidebarCollapsed ? "w-16" : "w-72"
    } bg-(--card) border-r border-(--border) flex flex-col transition-all duration-300 shadow-sm`}
  >
    <div className="p-4 border-b border-(--border)">
      {!sidebarCollapsed && <h1 className="subheading">FlowCraft</h1>}
    </div>

    {!sidebarCollapsed && (
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <Sidebar />
      </div>
    )}
  </div>

  {/* Demo Area */}
  <div className="flex-1 flex flex-col min-h-0">

    {/* Top Bar */}
    <div className="bg-(--card) border-b border-(--border) px-6 py-4 flex justify-end shrink-0">
      <Button onClick={handleStartCreating}>
        <Plus size={16} />
        Create Your Flowchart
      </Button>
    </div>

    {/* ReactFlow Container */}
    <div className="flex-1 min-h-0">
      <ReactFlow
        nodes={dNodes}
        edges={dEdges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
        <MiniMap />
      </ReactFlow>
    </div>

  </div>
</div>

        {/* DESCRIPTION ADDED HERE */}
        <Description />

      </div>
    );
  }

  // ==========================
  // 🔹 CREATE MODE (UNCHANGED)
  // ==========================
  return (
    <div className="h-screen w-screen flex overflow-hidden">

      {/* Sidebar */}
      <div className="w-72 bg-(--card) border-r border-(--border)">
        <Sidebar />
        <button onClick={handleBackToDemo}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function ToolHome() {
  return (
    <ReactFlowProvider>
      <FlowChartEditor />
    </ReactFlowProvider>
  );
}