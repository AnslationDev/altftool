import { useEffect, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  addEdge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import useHydrated from "@/hooks/useHydrated";

const METHOD_COLORS = {
  get: { bg: "#1d4ed8", border: "#1e40af", light: "#dbeafe" },
  post: { bg: "#15803d", border: "#166534", light: "#dcfce7" },
  put: { bg: "#b45309", border: "#92400e", light: "#fef3c7" },
  patch: { bg: "#c2410c", border: "#9a3412", light: "#ffedd5" },
  delete: { bg: "#b91c1c", border: "#991b1b", light: "#fee2e2" },
};

// Custom Node Component
function EndpointNode({ data }) {
  const colors = METHOD_COLORS[data.method] || {
    bg: "#4b5563",
    border: "#374151",
    light: "#f3f4f6",
  };

  return (
    <div
      style={{
        border: `2px solid ${colors.border}`,
        borderRadius: "10px",
        overflow: "hidden",
        minWidth: "180px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        background: "#1a1a1a",
      }}
    >
      {/* ✅ Top handle — target */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#6366f1" }}
      />

      {/* Method badge */}
      <div style={{ background: colors.bg, padding: "4px 10px" }}>
        <span
          style={{
            color: "white",
            fontSize: "11px",
            fontWeight: "700",
            letterSpacing: "1px",
          }}
        >
          {data.method.toUpperCase()}
        </span>
      </div>

      {/* Path + summary */}
      <div style={{ padding: "8px 10px", background: "#1e1e1e" }}>
        <p
          style={{
            color: "white",
            fontFamily: "monospace",
            fontSize: "12px",
            fontWeight: "600",
            margin: 0,
          }}
        >
          {data.path}
        </p>
        {data.summary && (
          <p
            style={{
              color: "#9ca3af",
              fontSize: "10px",
              margin: "3px 0 0",
              lineHeight: "1.3",
            }}
          >
            {data.summary}
          </p>
        )}
      </div>

      {/* ✅ Bottom handle — source */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#6366f1" }}
      />
    </div>
  );
}

const nodeTypes = { endpointNode: EndpointNode };

function buildNodesAndEdges(swaggerSpec) {
  if (!swaggerSpec?.paths) return { nodes: [], edges: [] };

  const nodes = [];
  const edges = [];
  const allEndpoints = [];

  // Flatten all endpoints
  Object.entries(swaggerSpec.paths).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      allEndpoints.push({ path, method, operation });
    });
  });

  // Group by base path
  const groups = {};
  allEndpoints.forEach((ep) => {
    const base = ep.path.split("/")[1] || "general";
    if (!groups[base]) groups[base] = [];
    groups[base].push(ep);
  });

  // Layout — groups as columns
  const COL_WIDTH = 260;
  const ROW_HEIGHT = 110;
  const COL_GAP = 80;
  let colIndex = 0;

  Object.entries(groups).forEach(([groupName, endpoints]) => {
    const x = colIndex * (COL_WIDTH + COL_GAP);

    endpoints.forEach((ep, rowIndex) => {
      const nodeId = `${ep.method}-${ep.path}`;
      const y = rowIndex * ROW_HEIGHT;

      nodes.push({
        id: nodeId,
        type: "endpointNode",
        position: { x, y },
        data: {
          method: ep.method,
          path: ep.path,
          summary: ep.operation?.summary || "",
        },
      });

      // Connect to next node in same group
      if (rowIndex > 0) {
        const prevId = `${endpoints[rowIndex - 1].method}-${endpoints[rowIndex - 1].path}`;
        edges.push({
          id: `edge-${prevId}-${nodeId}`,
          source: prevId,
          target: nodeId,
          //   sourceHandle: null,
          //   targetHandle: null,
          markerEnd: { type: MarkerType.ArrowClosed, color: "#6366f1" },
          style: { stroke: "#6366f1", strokeWidth: 2 },
          animated: true,
        });
      }
    });

    colIndex++;
  });

  return { nodes, edges };
}

export default function VisualFlowTab({ swaggerSpec }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const mounted = useHydrated();

  useEffect(() => {
    if (!swaggerSpec) return;
    const { nodes: n, edges: e } = buildNodesAndEdges(swaggerSpec);
    setNodes(n);
    setEdges(e);
  }, [setEdges, setNodes, swaggerSpec]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  if (!swaggerSpec) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--muted-foreground)]">
        <p className="font-medium">No API spec generated yet.</p>
        <p className="text-sm mt-1">
          Go to Input tab, paste JSON and generate docs first.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[var(--foreground)]">
          API Visual Flow
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Visual map of all your API endpoints — drag to rearrange, scroll to
          zoom.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(METHOD_COLORS).map(([method, colors]) => (
          <div key={method} className="flex items-center gap-1.5">
            <span
              style={{ background: colors.bg }}
              className="w-3 h-3 rounded-sm"
            />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-medium">
              {method}
            </span>
          </div>
        ))}
      </div>

      {/* React Flow Canvas */}
      {mounted && (
        <div
          className="w-full rounded-xl border border-[var(--border)] overflow-hidden"
          style={{ height: "clamp(350px, 60vh, 520px)", background: "#111" }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
          >
            <Background color="#333" gap={20} />
            <Controls />

            <div className="hidden sm:block">
              <MiniMap
                nodeColor={(node) => {
                  const colors = METHOD_COLORS[node.data?.method];
                  return colors ? colors.bg : "#4b5563";
                }}
                style={{ background: "#1a1a1a" }}
              />
            </div>
          </ReactFlow>
        </div>
      )}

      <p className="text-xs text-[var(--muted-foreground)] text-center">
        Drag nodes to rearrange • Scroll to zoom • Endpoints grouped by path
      </p>
    </div>
  );
}
