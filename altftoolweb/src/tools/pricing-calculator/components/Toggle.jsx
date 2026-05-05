const BusinessModeToggle = ({ isAdvanced, setIsAdvanced }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-(--border)">
      <div>
        <h4 className="font-bold text-sm text-(--foreground)">Real Business Mode</h4>
        <p className="text-[10px] text-gray-500 uppercase font-bold">Include GST, Fees & Commissions</p>
      </div>
      <button 
        onClick={() => setIsAdvanced(!isAdvanced)}
        className={`w-12 h-6  transition-all duration-300 relative ${isAdvanced ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white transition-all ${isAdvanced ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
};