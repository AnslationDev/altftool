const ActionBar = () => {
  return (
    <div className="flex gap-3 mt-6">
      <button className="flex-1 bg-white border border-(--border) py-3 rounded-xl font-bold text-xs uppercase hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
        📥 Save Plan
      </button>
      <button className="flex-1 bg-(--primary) text-white py-3 rounded-xl font-bold text-xs uppercase hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
        📄 Export PDF
      </button>
    </div>
  );
};