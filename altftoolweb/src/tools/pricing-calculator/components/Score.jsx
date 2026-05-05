const ProfitScoreMeter = ({ margin }) => {
  const score = Math.max(0, Math.min(100, margin * 2)); // Simple score logic
  const status = margin > 20 ? "Healthy Profit" : margin > 0 ? "Low Margin" : "Loss Risk";
  const color = margin > 20 ? "text-green-600" : margin > 0 ? "text-orange-500" : "text-red-600";

  return (
    <div className="bg-white p-6  border border-(--border) text-center">
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
          <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
            strokeDasharray={251.2}
            strokeDashoffset={251.2 - (251.2 * score) / 100}
            className={`${color} transition-all duration-1000`} 
          />
        </svg>
        <span className="absolute text-xl font-black">{margin.toFixed(0)}%</span>
      </div>
      <h4 className={`mt-2 font-bold uppercase text-xs ${color}`}>{status}</h4>
      <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Profit Score: {score.toFixed(0)}/100</p>
    </div>
  );
};