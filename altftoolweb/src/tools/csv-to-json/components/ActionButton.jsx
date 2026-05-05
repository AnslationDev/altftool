import React from "react";

const ActionButtons = ({ onConvert, onDownload, onClear, hasData }) => {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
      <button
        onClick={onConvert}
        disabled={!hasData}
        className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-medium text-ml transition-colors ${
          hasData
            ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        Convert to JSON
      </button>

      <button
        onClick={onDownload}
        disabled={!hasData}
        className={`flex-1 sm:flex-none px-4 py-2 rounded-md font-medium text-ml transition-colors ${
          hasData
            ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        Download JSON
      </button>

      <button
        onClick={onClear}
        className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-md font-medium text-ml hover:bg-blue-700 transition-colors cursor-pointer"
      >
        Clear All
      </button>
    </div>
  );
};

export default ActionButtons;