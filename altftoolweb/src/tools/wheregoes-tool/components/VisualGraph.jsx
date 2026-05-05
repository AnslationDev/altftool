import { useMemo } from 'react';
import { ReactFlow, Background, Controls, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';

const CustomNode = ({ data }) => {
  const isRedirect = data.status >= 300 && data.status < 400;
  const isSuccess = data.status >= 200 && data.status < 300;
  const isError = !data.status || data.status >= 400;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`px-4 py-3 rounded-xl border-2 shadow-lg min-w-[200px] ${
        isRedirect ? 'bg-amber-50 border-amber-500 dark:bg-amber-500/10' :
        isSuccess ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-500/10' :
        'bg-rose-50 border-rose-500 dark:bg-rose-500/10'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-primary" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-black uppercase tracking-widest ${
            isRedirect ? 'text-amber-600 dark:text-amber-400' :
            isSuccess ? 'text-emerald-600 dark:text-emerald-400' :
            'text-rose-600 dark:text-rose-400'
          }`}>
            Step {data.index + 1}
          </span>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${
            isRedirect ? 'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-300' :
            isSuccess ? 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-300' :
            'bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-300'
          }`}>
            {data.status || 'ERR'}
          </span>
        </div>
        <p className="text-[12px] font-mono text-foreground truncate max-w-[180px]" title={data.url}>
          {new URL(data.url).hostname}
        </p>
        <p className="text-[10px] text-muted-foreground truncate italic">
          {new URL(data.url).pathname}
        </p>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-primary" />
    </motion.div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

export default function VisualGraph({ chain }) {
  const nodes = useMemo(() => {
    return chain.map((step, i) => ({
      id: `node-${i}`,
      type: 'custom',
      position: { x: 250, y: i * 150 },
      data: { ...step, index: i },
    }));
  }, [chain]);

  const edges = useMemo(() => {
    return chain.slice(0, -1).map((_, i) => ({
      id: `edge-${i}`,
      source: `node-${i}`,
      target: `node-${i + 1}`,
      animated: true,
      style: { stroke: 'var(--primary)', strokeWidth: 2 },
    }));
  }, [chain]);

  return (
    <div className="w-full h-[600px] border rounded-2xl overflow-hidden shadow-inner grayscale-[0.2] hover:grayscale-0 transition-all duration-500" style={{ backgroundColor: 'color-mix(in srgb, var(--card), transparent 50%)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        draggable={true}
        nodesConnectable={false}
        nodesDraggable={true}
        elementsSelectable={true}
      >
        <Background gap={20} className="opacity-[0.05] dark:opacity-[0.1] !bg-foreground" />
        <Controls />
      </ReactFlow>
    </div>
  );
}
