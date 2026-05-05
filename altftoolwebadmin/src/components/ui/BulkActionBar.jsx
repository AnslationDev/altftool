"use client";

export default function BulkActionBar({
  count,
  onDelete,
  onClear
}) {

  if (!count) return null;

  return (

    <div className="fixed bottom-6 left-1/2 -translate-x-1/2
      bg-black text-white px-6 py-3 rounded-lg flex gap-6 items-center shadow-lg">

      <div className="text-sm">
        {count} selected
      </div>

      <button
        className="text-red-400 cursor-pointer"
        onClick={onDelete}
      >
        Delete Selected
      </button>

      <button
        className="text-gray-300 cursor-pointer"
        onClick={onClear}
      >
        Cancel
      </button>

    </div>
  );
}