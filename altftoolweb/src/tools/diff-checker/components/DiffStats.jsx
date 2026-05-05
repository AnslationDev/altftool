// src/components/DiffChecker/DiffStats.jsx
const DiffStats = ({ stats, diff, mode }) => {
  const getLabel = (mode) => {
  switch (mode) {
    case "word":
      return "Words";
    case "char":
      return "Characters";
    case "semantic":
      return "Changes";
    case "line":
    default:
      return "Lines";
  }
};

  const label = getLabel(mode);

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      
      <div className="bg-(--card) border border-green-200 rounded-lg p-4">
        <div className="text-2xl font-bold text-green-700">
          {stats.added}
        </div>
        <div className="text-sm text-green-600">
          {label} Added
        </div>
      </div>

      <div className="bg-(--card) border border-red-200 rounded-lg p-4">
        <div className="text-2xl font-bold text-red-700">
          {stats.deleted}
        </div>
        <div className="text-sm text-red-600">
          {label} Deleted
        </div>
      </div>

      <div className="bg-(--card) border border-gray-200 rounded-lg p-4">
        <div className="text-2xl font-bold text-(--foreground)">
          {stats.unchanged}
        </div>
        <div className="text-sm text-(--muted-foreground)">
          {label} Unchanged
        </div>
      </div>

    </div>
  );
};

export default DiffStats;

// export default DiffStats;
