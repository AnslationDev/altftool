import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

const PerformanceCharts = ({ subjects }) => {
  const chartData = subjects
    .filter((s) => s.name && s.obtained)
    .map((s) => ({
      name: s.name,
      obtained: parseFloat(s.obtained) || 0,
      total: parseFloat(s.total) || 100,
      percentage: ((parseFloat(s.obtained) / parseFloat(s.total)) * 100).toFixed(1),
    }));

  const COLORS = ["#4f46e5", "#7c3aed", "#2563eb", "#db2777", "#ea580c", "#059669"];

  const pieData = chartData.map((d) => ({
    name: d.name,
    value: d.obtained,
  }));

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-(--card) border border-(--border) rounded-3xl p-6 shadow-sm"
      >
        <div className="mb-4">
           <h3 className="text-lg font-black text-(--foreground)">Subject Comparison</h3>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 700, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  padding: "8px 12px",
                  fontSize: "12px"
                }}
              />
              <Bar dataKey="obtained" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-(--card) border border-(--border) rounded-3xl p-6 shadow-sm"
      >
        <div className="mb-4">
           <h3 className="text-lg font-black text-(--foreground)">Score Distribution</h3>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                 contentStyle={{
                  backgroundColor: "var(--background)",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  fontSize: "12px"
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-[10px] font-bold text-(--foreground) ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceCharts;
