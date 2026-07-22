import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { calculateApplianceMetrics } from "../utils/calculations";

const COLORS = ["#2563eb", "#6366f1", "#38bdf8", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function Charts({ appliances, rate }) {
  const data = useMemo(() => {
    return appliances.map(app => {
      const metrics = calculateApplianceMetrics(app, rate);
      return {
        name: app.name,
        monthlyCost: Math.round(metrics.monthlyCost),
        monthlyUnits: Number(metrics.monthlyUnits.toFixed(1))
      };
    }).sort((a, b) => b.monthlyCost - a.monthlyCost);
  }, [appliances, rate]);

  if (appliances.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Cost Distribution (Pie) */}
      <div className="p-6 rounded-3xl bg-(--card) border border-(--border) shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-black text-(--foreground)">Cost Distribution</h2>
          <p className="text-sm text-(--muted-foreground)">How your bill is shared among appliances</p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="monthlyCost"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Consumption Breakdown (Bar) */}
      <div className="p-6 rounded-3xl bg-(--card) border border-(--border) shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-black text-(--foreground)">Monthly Consumption</h2>
          <p className="text-sm text-(--muted-foreground)">Units (kWh) used by each appliance</p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(37, 99, 235, 0.05)' }}
                contentStyle={{
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  padding: '12px'
                }}
              />
              <Bar dataKey="monthlyUnits" radius={[6, 6, 0, 0]} fill="#2563eb">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
