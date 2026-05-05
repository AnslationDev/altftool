import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { buildProjection, formatINR } from "../lib/calculateBill";

const chartColors = [
  "#2563eb",
  "#6366f1",
  "#38bdf8",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#64748b",
  "#3b82f6",
  "#0f172a",
];

const numberFromTooltip = (value) =>
  Array.isArray(value) ? Number(value[0]) : Number(value);

export function ChartsSection({ summary }) {
  const applianceData = useMemo(() => {
    const groups = {};
    summary.applianceBreakdown.forEach((item) => {
      if (!groups[item.name]) {
        groups[item.name] = {
          name: item.name,
          units: 0,
          cost: 0,
          share: 0,
        };
      }
      groups[item.name].units += item.monthlyUnits;
      groups[item.name].cost += item.monthlyCost;
      groups[item.name].share += item.sharePercent;
    });

    return Object.values(groups).map((g) => ({
      name: g.name,
      units: Number(g.units.toFixed(1)),
      cost: Number(g.cost.toFixed(0)),
      share: Number(g.share.toFixed(1)),
    }));
  }, [summary.applianceBreakdown]);

  const projectionData = buildProjection(summary.monthlyCost, 12);
  const hasData = applianceData.length > 0 && summary.monthlyUnits > 0;

  return (
    <section id="abhilfe-charts" className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart Card */}
        <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Cost Breakdown</h3>
              <p className="text-xs text-(--secondary) mt-0.5">Appliance-wise share</p>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest bg-(--background) px-2 py-1 rounded text-(--secondary)">
              {applianceData.length} items
            </div>
          </div>

          <div className="h-80 relative">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    data={applianceData}
                    dataKey="cost"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                  >
                    {applianceData.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={chartColors[index % chartColors.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16161e', borderRadius: '12px', border: '1px solid #26262e', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => formatINR(numberFromTooltip(value))}
                  />
                  <Legend 
                    layout="horizontal" 
                    align="center" 
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-(--secondary) italic bg-(--background)/50 rounded-xl border border-dashed border-(--border)">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Bar Chart Card */}
        <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
          <div className="mb-6">
            <h3 className="text-lg font-bold">Energy Usage</h3>
            <p className="text-xs text-(--secondary) mt-0.5">Monthly units (kWh)</p>
          </div>

          <div className="h-80">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={applianceData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26262e" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#94a3b8' }} 
                    axisLine={false} 
                    tickLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#16161e', borderRadius: '12px', border: '1px solid #26262e', color: '#fff' }}
                    formatter={(value) => `${numberFromTooltip(value).toFixed(1)} kWh`}
                  />
                  <Bar dataKey="units" radius={[4, 4, 0, 0]} barSize={30}>
                    {applianceData.map((item, index) => (
                      <Cell key={item.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-(--secondary) italic bg-(--background)/50 rounded-xl border border-dashed border-(--border)">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projection Card */}
      <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold">Bill Projections</h3>
            <p className="text-xs text-(--secondary) mt-0.5">Estimated 12-month trend with seasonality</p>
          </div>
        </div>

        <div className="h-64">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#26262e" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(v) => v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`} 
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#16161e', borderRadius: '12px', border: '1px solid #26262e', color: '#fff' }}
                  formatter={(value) => formatINR(numberFromTooltip(value))}
                />
                <Legend 
                  layout="horizontal" 
                  align="center" 
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="bill6M" name="6M Projection" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#16161e' }} />
                <Line type="monotone" dataKey="bill12M" name="12M Projection" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#16161e' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-(--secondary) italic bg-(--background)/50 rounded-xl border border-dashed border-(--border)">
              No data available
            </div>
          )}
        </div>
      </div>
    </section>
  );
}