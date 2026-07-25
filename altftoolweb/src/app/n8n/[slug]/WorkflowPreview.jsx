"use client";

import { useEffect, useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const NODE_TYPES = {};
const EDGE_TYPES = {};

function toGraph(wf) {
  const rawNodes = (wf?.nodes || []).filter(
    (n) => !/stickyNote/i.test(n.type || "")
  );
  const nodes = rawNodes.map((n, i) => {
    const pos = Array.isArray(n.position) ? n.position : [i * 220, 0];
    return {
      id: n.name,
      position: { x: pos[0], y: pos[1] },
      data: { label: n.name },
      style: {
        background: "var(--color-card)",
        color: "var(--color-card-foreground)",
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        fontSize: 11,
        padding: 8,
        width: 170,
      },
    };
  });

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = [];
  const seen = new Set();
  const conns = wf?.connections || {};
  for (const source of Object.keys(conns)) {
    if (!nodeIds.has(source)) continue;
    // n8n stores connections under a type key: "main" for the data flow, and
    // "ai_languageModel" / "ai_memory" / "ai_tool" / "ai_outputParser" / etc.
    // for LangChain sub-node wiring. Render every type, not just "main".
    const groupsByType = conns[source] || {};
    for (const type of Object.keys(groupsByType)) {
      const isAi = type !== "main";
      (groupsByType[type] || []).forEach((group, gi) => {
        (group || []).forEach((c, ci) => {
          if (!c?.node || !nodeIds.has(c.node)) return;
          const id = `${source}::${type}::${c.node}::${gi}::${ci}`;
          if (seen.has(id)) return;
          seen.add(id);
          edges.push({
            id,
            source,
            target: c.node,
            animated: !isAi,
            style: {
              stroke: isAi ? "var(--color-muted-foreground)" : "var(--color-primary)",
              strokeDasharray: isAi ? "4 3" : undefined,
            },
          });
        });
      });
    }
  }
  return { nodes, edges };
}

export default function WorkflowPreview({ jsonPath }) {
  const [graph, setGraph] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(jsonPath)
      .then((r) => r.json())
      .then((wf) => alive && setGraph(toGraph(wf)))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [jsonPath]);

  if (failed) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-2xl border border-(--color-border) bg-(--color-card) text-sm text-(--color-muted-foreground)">
        Preview unavailable.
      </div>
    );
  }

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-card)">
      {graph && (
        <ReactFlow
          nodes={graph.nodes}
          edges={graph.edges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          fitView
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          minZoom={0.1}
        >
          <Background color="var(--color-border)" gap={20} />
          <Controls showInteractive={false} />
        </ReactFlow>
      )}
    </div>
  );
}
