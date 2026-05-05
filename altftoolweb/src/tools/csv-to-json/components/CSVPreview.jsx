import React from "react";

const CSVPreview = ({ csvData = [] }) => {
  if (!Array.isArray(csvData) || csvData.length === 0) {
    return null;
  }

  const headers = Object.keys(csvData[0]);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-(--primary)">
          CSV Preview
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {csvData.length} row{csvData.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Responsive scrollable table wrapper */}
      <div className="relative border border-(--border) rounded-lg overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-64 sm:max-h-80">
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-(--background)">
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    className="py-2 px-3 sm:px-4 border-b border-(--border) text-left font-semibold text-(--secondary) whitespace-nowrap text-xs sm:text-sm"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {csvData.map((row, index) => (
                <tr
                  key={index}
                  className={`transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50`}
                >
                  {headers.map((header) => (
                    <td
                      key={header}
                      className="py-2 px-3 sm:px-4 border-b border-(--border) text-xs sm:text-sm text-(--secondary) whitespace-nowrap"
                    >
                      {row[header] !== undefined && row[header] !== "" ? row[header] : (
                        <span className="text-gray-300 italic">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CSVPreview;