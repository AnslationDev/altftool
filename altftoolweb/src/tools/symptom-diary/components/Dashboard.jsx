import React from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area
} from "recharts";
import {
  TrendingUp, Activity, Hash, AlertTriangle,
  Calendar, Sparkles, LayoutDashboard, Moon
} from "lucide-react";

const COLORS = [
  "#f43f5e", // rose
  "#8b5cf6", // violet
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ec4899", // pink
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#84cc16", // lime
  "#f97316"  // orange
];

export default function Dashboard({ stats, chartData, insights }) {
  if (!stats) return (
    <div className="bg-(--background) p-8 rounded-2xl border border-(--border) text-center space-y-4">
      <LayoutDashboard size={48} className="mx-auto text-(--muted-foreground) opacity-20" />
      <p className="text-(--muted-foreground) font-medium">Add some symptom logs to see your dashboard analytics</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Entries", value: stats.totalEntries, icon: Hash, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Today's Logs", value: stats.todayEntries, icon: Calendar, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-900/20" },
          { label: "Avg Severity", value: stats.avgSeverity, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
          { label: "Top Symptom", value: stats.topSymptom, icon: Activity, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${stat.bg} p-4 rounded-2xl border border-(--border) shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={stat.color} size={18} />
              <span className="text-[10px] font-black text-(--muted-foreground) uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="text-2xl font-black text-(--foreground)">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Smart Insights */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-500/20"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Sparkles size={100} />
        </div>
        <h3 className="text-xs font-black opacity-70 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Sparkles size={14} /> Smart Insights
        </h3>
        <div className="space-y-3 relative z-10">
          {insights.map((insight, i) => (
            <p key={i} className="text-sm font-medium leading-relaxed border-l-2 border-white/30 pl-3">
              {insight}
            </p>
          ))}
        </div>
      </motion.div>

      {/* Charts Section */}
      <div id="dashboard-charts" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Severity Trend Chart */}
        <div className="bg-(--card) p-8 rounded-3xl border border-(--border) shadow-xl space-y-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-black text-(--foreground) uppercase tracking-tighter">Severity Trend</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.severityTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'var(--card)', color: 'var(--foreground)' }}
                  labelStyle={{ fontWeight: '900', color: 'var(--primary)' }}
                />
                <Line
                  type="monotone"
                  dataKey="severity"
                  stroke="#2563eb"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#2563eb', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Chart */}
        <div className="bg-(--card) p-8 rounded-3xl border border-(--border) shadow-xl space-y-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <h3 className="text-xl font-black text-(--foreground) uppercase tracking-tighter">Severity Split</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {chartData.severityDistribution.map((entry, index) => {
                    const color = entry.name === 'Severe' ? '#ef4444' : entry.name === 'Moderate' ? '#f59e0b' : '#10b981';
                    return <Cell key={`cell-${index}`} fill={color} />
                  })}
                </Pie>
                <Tooltip
                   contentStyle={{ borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'var(--card)' }}
                />
                <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{fontSize: '11px', fontWeight: 700, paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="bg-(--card) p-8 rounded-3xl border border-(--border) shadow-xl space-y-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
              <Activity size={24} className="text-teal-600" />
            </div>
            <h3 className="text-xl font-black text-(--foreground) uppercase tracking-tighter">Breakdown</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {chartData.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                   contentStyle={{ borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'var(--card)' }}
                />
                <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{fontSize: '11px', fontWeight: 700, paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trigger Analysis Chart */}
        <div className="bg-(--card) p-8 rounded-3xl border border-(--border) shadow-xl space-y-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <AlertTriangle size={24} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-black text-(--foreground) uppercase tracking-tighter">Common Triggers</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.triggerAnalysis}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="name" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'var(--card)' }}
                />
                <Bar
                  dataKey="value"
                  fill="#f59e0b"
                  radius={[8, 8, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Quality vs Severity Chart */}
        <div className="bg-(--card) p-8 rounded-3xl border border-(--border) shadow-xl space-y-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <Moon size={24} className="text-indigo-600" />
            </div>
            <h3 className="text-xl font-black text-(--foreground) uppercase tracking-tighter">Sleep Impact</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.sleepTrend}>
                <defs>
                  <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'var(--card)', color: 'var(--foreground)' }}
                  labelStyle={{ fontWeight: '900', color: 'var(--primary)' }}
                />
                <Area type="monotone" dataKey="sleepQuality" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSleep)" animationDuration={1500} name="Sleep Quality" />
                <Line type="monotone" dataKey="severity" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} animationDuration={1500} name="Severity" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Symptom Distribution Chart */}
        <div className="bg-(--card) p-8 rounded-3xl border border-(--border) shadow-xl space-y-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
              <Activity size={24} className="text-pink-600" />
            </div>
            <h3 className="text-xl font-black text-(--foreground) uppercase tracking-tighter">Symptoms</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.symptomDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {chartData.symptomDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                   contentStyle={{ borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'var(--card)' }}
                />
                <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{fontSize: '11px', fontWeight: 700, paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
