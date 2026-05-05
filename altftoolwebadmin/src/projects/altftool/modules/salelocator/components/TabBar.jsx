import React from "react";
import SaleData from "../data/salesData.json";

const TabBar = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-0 border-b border-gray-200">
      {tabs.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition ${
              isActive
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;