export default function Actions({ onLoadDemo, onCopyOutput, onDownload }) {
  return (
    <div className="flex flex-wrap gap-3 p-3 rounded-xl border border-(--border) bg-(--background)">
      <button onClick={onLoadDemo} className="px-4 py-2 rounded-lg border border-(--border) hover:border-(--primary) transition-colors">
        Load Demo SRT
      </button>
      <button onClick={onCopyOutput} className="px-4 py-2 rounded-lg border border-(--border) hover:border-(--primary) transition-colors">
        Copy Output
      </button>
      <button onClick={onDownload} className="px-4 py-2 rounded-lg bg-(--primary) text-white font-semibold shadow-sm hover:opacity-95 transition-opacity">
        Download Adjusted SRT
      </button>
    </div>
  );
}
