const SmartInsights = ({ price, totalCost, discount, margin }) => {
  const breakEven = totalCost;
  const targetPrice = totalCost / 0.75;

  return (
    <div className="space-y-3">
      {/* Break-even Alert */}
      <div className={`p-4 border ${price < breakEven ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
        <p className="text-xs font-bold uppercase opacity-60">Break-even Analysis</p>
        <p className="text-sm font-semibold">
          {price < breakEven 
            ? ` Loss Alert! Increase price by ₹${(breakEven - price).toFixed(0)} to avoid loss.` 
            : ` Safe! Your break-even is ₹${breakEven.toLocaleString()}.`}
        </p>
      </div>

      {/* AI Suggestion */}
      <div className="p-4 bg-purple-50 border border-purple-200">
        <p className="text-xs font-bold text-purple-600 uppercase">AI Recommendation</p>
        <p className="text-xl mt-1">Set price to <strong className="text-purple-700">₹{targetPrice.toFixed(0)}</strong> to achieve a 25% profit target.</p>
      </div>

      {/* Discount Impact */}
      {discount > 20 && (
        <div className="flex items-center gap-2 p-2 bg-orange-100 border border-orange-200 animate-pulse">
          <span className="text-[10px] font-bold text-orange-700"> HIGH DISCOUNT: Reducing profit by 30%</span>
        </div>
      )}
    </div>
  );
};