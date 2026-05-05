import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";

const getTooltipStyle = (isDark) => ({
  background: isDark ? "#1e1e22" : "#ffffff",
  border: `1px solid ${isDark ? "#2a2a2e" : "#e5e9f2"}`,
  borderRadius: 12,
  boxShadow: "0 8px 24px -8px rgba(37,99,235,0.18)",
  fontSize: 12,
  color: isDark ? "#e4e4e7" : "#0f172a",
});

const tooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e5e9f2",
  borderRadius: 12,
  boxShadow: "0 8px 24px -8px rgba(37,99,235,0.18)",
  fontSize: 12,
  color: "#0f172a",
};

function ChartFrame({ children }) {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const height = 176;

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const updateWidth = () => {
      setWidth(Math.max(0, Math.floor(node.getBoundingClientRect().width)));
    };

    updateWidth();

    if (!("ResizeObserver" in window)) {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-44 min-w-0">
      {width > 0 ? children({ width, height }) : (
        <div className="h-full rounded-[var(--anslation-ds-radius)] bg-(--muted)" />
      )}
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="soft-card min-w-0 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <ChartFrame>{children}</ChartFrame>
    </div>
  );
}

export default function PerformanceCharts({ data, safeTrafficLimit }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const tooltipStyle = getTooltipStyle(isDark);
  const gridColor = isDark ? "#2a2a2e" : "#e5e9f2";
  const axisColor = isDark ? "#a1a1aa" : "#94a3b8";
  return (
    <div className="soft-card p-5">
      {/* Decorative gradient line */}
      <div className="card-glow-line" />

      <div className="relative mb-4 flex items-center gap-3">
        <div className="icon-badge">
          <LineChartIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">
            Live Performance Charts
          </h3>
          <p className="text-xs text-muted-foreground">
            Predicted curves across traffic range
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Requests vs Latency"
          subtitle="ms response per req/s"
        >
          {({ width, height }) => (
            <AreaChart width={width} height={height} data={data} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="rps" stroke={axisColor} fontSize={10} tickLine={false} />
              <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine
                x={safeTrafficLimit}
                stroke="#16a34a"
                strokeDasharray="4 4"
                label={{ value: "Safe", fill: "#16a34a", fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="latency"
                stroke="#2563eb"
                strokeWidth={2.5}
                fill="url(#latencyFill)"
              />
            </AreaChart>
          )}
        </ChartCard>

        <ChartCard title="CPU Growth Curve" subtitle="% utilization vs req/s">
          {({ width, height }) => (
            <LineChart width={width} height={height} data={data} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="rps" stroke={axisColor} fontSize={10} tickLine={false} />
              <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={85} stroke="#f59e0b" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="cpu"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          )}
        </ChartCard>

        <ChartCard title="RAM Usage Curve" subtitle="% memory vs req/s">
          {({ width, height }) => (
            <AreaChart width={width} height={height} data={data} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="ramFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="rps" stroke={axisColor} fontSize={10} tickLine={false} />
              <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="ram"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#ramFill)"
              />
            </AreaChart>
          )}
        </ChartCard>

        <ChartCard title="Error Rate Curve" subtitle="% errors vs req/s">
          {({ width, height }) => (
            <LineChart width={width} height={height} data={data} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid stroke={gridColor} vertical={false} />
              <XAxis dataKey="rps" stroke={axisColor} fontSize={10} tickLine={false} />
              <YAxis stroke={axisColor} fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine y={5} stroke="#16a34a" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="errorRate"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
