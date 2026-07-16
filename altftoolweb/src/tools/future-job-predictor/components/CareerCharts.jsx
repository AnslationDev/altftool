"use client";
import React from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

export default function CareerCharts({ activeCareer, matches }) {
  // 1. Radar chart data showing skill matching (Required vs Current)
  const radarData = [
    { subject: "Tech / Prog", A: activeCareer.matchScore - 5, B: 85, fullMark: 100 },
    { subject: "Communication", A: activeCareer.matchScore + 2, B: 75, fullMark: 100 },
    { subject: "Management", A: Math.max(20, activeCareer.matchScore - 20), B: 70, fullMark: 100 },
    { subject: "Creativity", A: activeCareer.matchScore - 2, B: 80, fullMark: 100 },
    { subject: "AI Knowledge", A: Math.max(10, activeCareer.matchScore - 30), B: 90, fullMark: 100 },
  ];

  // 2. Bar chart data comparing Top 5 Careers salaries
  const barData = matches.slice(0, 5).map((m) => {
    // Extract average salary from string (e.g. "$120,000 - $180,000" -> 150000)
    const matchesArr = m.salaryRange.replaceAll(",", "").match(/\d+/g) || [100000];
    const avg = matchesArr.reduce((sum, val) => sum + Number(val), 0) / matchesArr.length;
    return {
      name: m.name.slice(0, 15) + (m.name.length > 15 ? "..." : ""),
      Salary: avg / 1000,
    };
  });

  // 3. Automation Risk vs Demand timeline data
  const timelineData = [
    { year: "2026", Demand: activeCareer.futureDemand - 20, Automation: activeCareer.automationRisk },
    { year: "2030", Demand: activeCareer.futureDemand - 10, Automation: Math.max(0, activeCareer.automationRisk - 5) },
    { year: "2035", Demand: activeCareer.futureDemand, Automation: Math.max(0, activeCareer.automationRisk - 15) },
    { year: "2040", Demand: Math.min(100, activeCareer.futureDemand + 10), Automation: Math.max(0, activeCareer.automationRisk - 25) },
    { year: "2050", Demand: Math.min(100, activeCareer.futureDemand + 20), Automation: Math.max(0, activeCareer.automationRisk - 40) },
  ];

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--foreground)",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* 1. Skill Fit Radar */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
        <h4 className="text-xs font-bold text-foreground mb-4 uppercase tracking-wider text-muted-foreground">
          Skill Fit Radar Checklist
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
              <PolarGrid stroke="var(--border)" opacity={0.6} />
              <PolarAngleAxis dataKey="subject" stroke="var(--muted-foreground)" fontSize={10} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--border)" />
              <Radar
                name="Your Profile Match"
                dataKey="A"
                stroke="#14b8a6"
                fill="#14b8a6"
                fillOpacity={0.25}
              />
              <Radar
                name="Career Requirement"
                dataKey="B"
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.05}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="bottom" height={24} iconType="circle" fontSize={10} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Salary Comp Bar Chart */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
        <h4 className="text-xs font-bold text-foreground mb-4 uppercase tracking-wider text-muted-foreground">
          Top 5 Match Average Salary ($k / yr)
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={9} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="Salary" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Industry Demand vs Automation Timeline */}
      <div className="bg-card border border-border p-5 rounded-2xl shadow-sm md:col-span-2">
        <h4 className="text-xs font-bold text-foreground mb-4 uppercase tracking-wider text-muted-foreground">
          Future Outlook & Automation Risk Projections (to 2050)
        </h4>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
              <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={10} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend verticalAlign="top" height={32} iconType="rect" />
              <defs>
                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                name="Projected Industry Demand"
                type="monotone"
                dataKey="Demand"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorDemand)"
              />
              <Area
                name="AI Automation Vulnerability"
                type="monotone"
                dataKey="Automation"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorRisk)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
