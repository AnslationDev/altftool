"use client";

import React from "react";
import { formatCurrency } from "../utils/expenses";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ExpenseBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-100">
        <p className="font-bold text-gray-900 mb-1">{label}</p>
        <p className="text-blue-600 font-semibold">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

const ExpenseBarChart = ({ data }) => {
  const chartData = Object.entries(data)
    .map(([name, value]) => ({
      name,
      amount: value,
    }))
    .reverse();

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500 italic">
        No expense data to display
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] sm:h-[400px] p-2 bg-white rounded-xl shadow-sm border border-gray-50">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 10,
            left: -10, // Left margin kam kiya mobile ke liye
            bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            angle={-30} // Angle thoda kam kiya readability ke liye
            textAnchor="end"
            interval={0} // Force show all labels
            tick={{ fontSize: 11, fill: '#6b7280' }}
            height={70}
          />
          <YAxis
            tickFormatter={(value) => `₹${value}`}
            tick={{ fontSize: 10, fill: '#6b7280' }}
            width={60}
          />
          <Tooltip content={<ExpenseBarTooltip />} cursor={{ fill: '#f3f4f6', radius: 4 }} />
          <Bar
            dataKey="amount"
            fill="#3b82f6" // Vibrant blue
            radius={[6, 6, 0, 0]}
            barSize={30} // Desktop/Mobile dono par balanced dikhega
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseBarChart;
