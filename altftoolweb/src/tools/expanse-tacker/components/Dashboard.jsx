"use client";

import React from "react";
import ExpenseSummary from "./ExpenseSummary";
import ExpenseChart from "./ExpenseChart";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";

const Dashboard = () => {
  return (
    /* Added responsive horizontal padding and max-width for desktop */
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 sm:space-y-8 lg:py-10">
      
      {/* Expense summary - Isme space-y-8 ko handle karne ke liye margin bottom automatically apply hoga */}
      <div className="w-full overflow-hidden">
        <ExpenseSummary />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Chart Section - Mobile par full width, Desktop par 2/3 */}
        <div className="lg:col-span-2 w-full bg-white rounded-xl shadow-sm overflow-hidden">
          <ExpenseChart />
        </div>
        
        {/* Form Section - Mobile par stack ho jayega, Desktop par 1/3 */}
        <div className="w-full bg-white rounded-xl shadow-sm lg:sticky lg:top-6">
          <ExpenseForm />
        </div>
      </div>

      {/* List Section - Full width on all devices */}
      <div className="w-full overflow-x-auto rounded-xl shadow-sm">
        <ExpenseList />
      </div>
    </div>
  );
};

export default Dashboard;