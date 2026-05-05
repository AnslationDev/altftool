"use client";

import React, { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import { getChartData, getExpensesByMonth } from "../utils/expenses";
import { BarChart, PieChart } from "lucide-react";
import ExpensePieChart from "./ExpensePieChart";
import ExpenseBarChart from "./ExpenseBarChart";

const ExpenseChart = () => {
  const { expenses } = useExpenses();
  const [chartType, setChartType] = useState("pie");

  const chartData = getChartData(expenses);
  const monthlyData = getExpensesByMonth(expenses);

  if (expenses.length === 0) {
    return (
      <div className="bg-white text-gray-900 rounded-2xl shadow-sm border border-gray-100 text-center p-6 sm:p-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Expense Analytics</h2>
        <p className="text-gray-500">Add some expenses to see your spending analytics</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Header Section - Better alignment on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Expense Analytics
        </h2>

        {/* Toggle Buttons - Properly sized for touch on mobile */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setChartType("pie")}
            className={`flex items-center justify-center flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              chartType === "pie"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <PieChart size={16} className="mr-2" />
            <span>Pie Chart</span>
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`flex items-center justify-center flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              chartType === "bar"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <BarChart size={16} className="mr-2" />
            <span>Bar Chart</span>
          </button>
        </div>
      </div>

      {/* Chart Container - Responsive height through chart components */}
      <div className="w-full min-h-[300px] sm:min-h-[400px]">
        {chartType === "pie" ? (
          <ExpensePieChart data={chartData} />
        ) : (
          <ExpenseBarChart data={monthlyData} />
        )}
      </div>
    </div>
  );
};

export default ExpenseChart;