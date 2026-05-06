import { useMemo, useState } from "react";
import { GitFork } from "lucide-react";

const W = 600;
const H = 320;
const CX = W / 2;
const CY = H / 2;
const RADIUS = 120;

function getStrokeWidth(score) {
  if (score >= 800) return 3;
  if (score >= 500) return 2;
  if (score >= 200) return 1.5;
  return 1;
}

function getNodePositions(items) {
  return items.map((item, i) => {
    const angle = (2 * Math.PI * i) / items.length - Math.PI / 2;
    return {
      ...item,
      x: CX + RADIUS * Math.cos(angle),
      y: CY + RADIUS * Math.sin(angle),
    };
  });
}

export default function SynonymExplorer({ word, synData, antData, onSearch }) {
  const [expanded, setExpanded] = useState(false);
  const [hoveredWord, setHoveredWord] = useState(null);
  const nodes = useMemo(() => {
    if (!expanded) return [];
    const synNodes = synData
      .slice(0, 6)
      .map((item) => ({ word: item.word, score: item.score || 500, type: "syn" }));

    const antNodes = antData
      .slice(0, 4)
      .map((item) => ({ word: item.word, score: item.score || 500, type: "ant" }));

    return getNodePositions([...synNodes, ...antNodes]);
  }, [expanded, synData, antData]);

  if (!synData?.length && !antData?.length) return null;

  return (
    <div className="mt-4 border-t border-(--border)  pt-4">
{/* p-4 sm:p-5 bg-(--background) text-(--foreground) rounded-lg shadow mb-4 border border-(--border) w-full */}
      {/* Toggle button */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-2 text-sm font-medium text-(--primary) cursor-pointer hover:opacity-80 transition mb-3"
      >
        <GitFork size={15} />
        Word Relationship Graph
        {/* <span className="hidden text-xs bg-(--muted) text-(--muted-foreground) px-2 py-0.5 rounded-full">
          {synData.length + antData.length} words
        </span> */}
      </button>

      {expanded && (
        <div className="w-full overflow-x-auto">

          {/* Legend */}
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500"/>
              <span className="text-xs text-(--muted-foreground)">Main word</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-teal-500"/>
              <span className="text-xs text-(--muted-foreground)">Synonyms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400"/>
              <span className="text-xs text-(--muted-foreground)">Antonyms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-0.5 bg-gray-400"/>
              <span className="text-xs text-(--muted-foreground)">Thick = more similar</span>
            </div>
          </div>

          {/* SVG Graph */}
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            className="rounded-lg border border-(--border) bg-(--background)"
            style={{ maxHeight: "320px" }}
          >
            {/* Lines */}
            {nodes.map((node, i) => (
              <line
                key={`line-${i}`}
                x1={CX}
                y1={CY}
                x2={node.x}
                y2={node.y}
                stroke={node.type === "syn" ? "#1D9E75" : "#E24B4A"}
                strokeWidth={getStrokeWidth(node.score)}
                strokeOpacity={hoveredWord === node.word ? 1 : 0.5}
              />
            ))}

            {/* Center node */}
            <g style={{ cursor: "default" }}>
              <circle cx={CX} cy={CY} r={36} fill="#378ADD" fillOpacity={0.15} stroke="#378ADD" strokeWidth={1.5}/>
              <text
                x={CX}
                y={CY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={14}
                fontWeight={700}
                fill="#185FA5"
              >
                {word.length > 8 ? word.slice(0, 7) + "…" : word}
              </text>
            </g>

            {/* Synonym / Antonym nodes */}
            {nodes.map((node, i) => {
              const isSyn = node.type === "syn";
              const fillColor = isSyn ? "#1D9E75" : "#E24B4A";
              const bgColor = isSyn ? "#E1F5EE" : "#FCEBEB";
              const isHovered = hoveredWord === node.word;

              // Tooltip position — upar ya neeche based on node position
              const tooltipY = node.y < CY ? node.y + 35 : node.y - 52;
              const arrowY1 = node.y < CY ? tooltipY - 6 : tooltipY + 22;
              const arrowY2 = node.y < CY ? tooltipY - 6 : tooltipY + 22;
              const arrowTipY = node.y < CY ? tooltipY - 12 : tooltipY + 28;

              // Tooltip width based on word length
              const tooltipW = Math.max(60, node.word.length * 8 + 16);

              return (
                <g
                  key={`node-${i}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => onSearch(node.word)}
                  onMouseEnter={() => setHoveredWord(node.word)}
                  onMouseLeave={() => setHoveredWord(null)}
                >
                  {/* Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={28}
                    fill={isHovered ? fillColor : bgColor}
                    stroke={fillColor}
                    strokeWidth={isHovered ? 2 : 1}
                  />

                  {/* Truncated word inside node */}
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight={500}
                    fill={isHovered ? "#fff" : fillColor}
                  >
                    {node.word.length > 7 ? node.word.slice(0, 6) + "…" : node.word}
                  </text>

                  {/* ✅ Tooltip — hover pe pura word */}
                  {isHovered && (
                    <g>
                      {/* Tooltip box */}
                      <rect
                        x={node.x - tooltipW / 2}
                        y={tooltipY}
                        width={tooltipW}
                        height={22}
                        rx={6}
                        fill="#1e1e2e"
                        opacity={0.92}
                      />
                      {/* Tooltip text */}
                      <text
                        x={node.x}
                        y={tooltipY + 11}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={11}
                        fill="#ffffff"
                        fontWeight={500}
                      >
                        {node.word}
                      </text>
                      {/* Tooltip arrow */}
                      <polygon
                        points={`
                          ${node.x - 5},${arrowY1}
                          ${node.x + 5},${arrowY2}
                          ${node.x},${arrowTipY}
                        `}
                        fill="#1e1e2e"
                        opacity={0.92}
                      />
                    </g>
                  )}

                </g>
              );
            })}
          </svg>

          <p className="text-xs text-(--muted-foreground) mt-2 text-center">
            Click any word to explore it
          </p>
        </div>
      )}
    </div>
  );
}
