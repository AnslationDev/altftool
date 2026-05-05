import {Circle,Square, Diamond, ArrowDownUp, Database, FileText,MessageSquare, Layers ,GripVertical,
} from 'lucide-react';

const nodeTypes = [
  {
    type: 'startEnd',
    label: 'Start / End',
    icon: Circle,
    color: 'text-green-500',
    bg: 'bg-green-50',
    border: 'border-green-200',
    hoverBg: 'hover:bg-green-100',
  },
  {
    type: 'process',
    label: 'Process',
    icon: Square,
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    hoverBg: 'hover:bg-blue-100',
  },
  {
    type: 'decision',
    label: 'Decision',
    icon: Diamond,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    hoverBg: 'hover:bg-amber-100',
  },
  {
    type: 'ioNode',
    label: 'Input / Output',
    icon: ArrowDownUp,
    color: 'text-purple-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    hoverBg: 'hover:bg-purple-100',
  },
  {
    type: 'database',
    label: 'Database',
    icon: Database,
    color: 'text-cyan-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    hoverBg: 'hover:bg-cyan-100',
  },
  {
    type: 'document',
    label: 'Document',
    icon: FileText,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    hoverBg: 'hover:bg-rose-100',
  },
  {
    type: 'comment',
    label: 'Comment',
    icon: MessageSquare,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    hoverBg: 'hover:bg-yellow-100',
  },
  {
    type: 'subprocess',
    label: 'Subprocess',
    icon: Layers,
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    hoverBg: 'hover:bg-indigo-100',
  },
];

export function Sidebar() {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow-type', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="space-y-2 bg-(--card) rounded-md  p-4 h-full">
      <h3 className="text-xs font-semibold text-(--foreground) uppercase tracking-wider mb-3 px-1">
        Drag & Drop Nodes
      </h3>
      {nodeTypes.map((node) => {
        const IconComponent = node.icon;
        return (
          <div
            key={node.type}
            draggable
            onDragStart={(e) => onDragStart(e, node.type, node.label)}
            className={`flex items-center gap-3 p-3 rounded-xl border ${node.border} ${node.bg} ${node.hoverBg} cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md group`}
          >
            <div className="opacity-40 group-hover:opacity-70 transition-opacity">
              <GripVertical size={14} className="text-slate-400" />
            </div>
            <IconComponent size={20} className={node.color} />
            <span className="text-sm font-medium text-slate-700">{node.label}</span>
          </div>
        );
      })}
    </div>
  );
}
