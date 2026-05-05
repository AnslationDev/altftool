"use client";

import React, { useState } from "react";
import { useExpenses } from "../context/ExpenseContext";
import toast from "react-hot-toast";
import {
  formatCurrency,
  formatDate,
  getCategoryTextColor,
} from "../utils/expenses";
import { Trash2, Filter } from "lucide-react";

const ExpenseList = () => {
  const { expenses, deleteExpense } = useExpenses();
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "food", label: "Food & Dining" },
    { value: "transport", label: "Transportation" },
    { value: "entertainment", label: "Entertainment" },
    { value: "shopping", label: "Shopping" },
    { value: "utilities", label: "Utilities" },
    { value: "health", label: "Health & Medical" },
    { value: "other", label: "Other" },
  ];

  const filteredExpenses = expenses.filter(
    (expense) => categoryFilter === "all" || expense.category === categoryFilter
  );

  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleDelete = (id) => {
    deleteExpense(id);
    toast.success("Expense deleted successfully");
  };

  return (
    <div className="w-full">
      {/* Header Section: Stacked on Mobile, Row on Desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Expense History
        </h2>
        
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm appearance-none shadow-sm"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sortedExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center border border-gray-100">
          <p className="text-gray-500 font-medium italic">No expenses found.</p>
        </div>
      ) : (
        <div className="w-full">
          {/* Desktop View: Proper Table (Hidden on Mobile) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {["Date", "Description", "Category", "Amount", "Action"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(expense.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{expense.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-tight ${getCategoryTextColor(expense.category)} bg-opacity-10 bg-current`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{formatCurrency(expense.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => handleDelete(expense.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View: Clean Cards (Hidden on Desktop) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {sortedExpenses.map((expense) => (
              <div key={expense.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center active:scale-[0.98] transition-transform">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(expense.date)}</span>
                  <h4 className="font-bold text-gray-900 text-base">{expense.description}</h4>
                  <span className={`${getCategoryTextColor(expense.category)} text-[11px] font-black uppercase`}>
                    {expense.category}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="text-lg font-black text-gray-900">{formatCurrency(expense.amount)}</span>
                  <button 
                    onClick={() => handleDelete(expense.id)} 
                    className="p-2.5 text-red-500 bg-red-50 rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;