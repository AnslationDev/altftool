import React from "react";

const AnalyticsPanel = ({ views, submissions }) => {
  const conversion =
    views === 0 ? 0 : Math.round((submissions / views) * 100);

  return (
    <div className="bg-(--card) p-4 border border-(--border) rounded-md">
      <h3 className="text-lg font-semibold mb-3">📊 Form Analytics</h3>

      <div className="space-y-2 text-sm">
        <p>👁️ Views: {views}</p>
        <p>📩 Submissions: {submissions}</p>
        <p>📈 Conversion: {conversion}%</p>
      </div>
    </div>
  );
};

export default AnalyticsPanel;