export default function AnalyticsCards({ stats, nutrition, totalSessions }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-(--border) bg-(--card)"><p className="text-xs uppercase">Adherence</p><p className="text-2xl font-bold">{stats.adherence}%</p></div>
        <div className="p-4 rounded-lg border border-(--border) bg-(--card)"><p className="text-xs uppercase">Completed</p><p className="text-2xl font-bold">{stats.completed}/{totalSessions}</p></div>
        <div className="p-4 rounded-lg border border-(--border) bg-(--card)"><p className="text-xs uppercase">Avg RPE</p><p className="text-2xl font-bold">{stats.avgRpe}</p></div>
        <div className="p-4 rounded-lg border border-(--border) bg-(--card)"><p className="text-xs uppercase">Recovery</p><p className="text-2xl font-bold">{nutrition.sleepHours}h sleep</p></div>
      </div>

      <div className="p-4 rounded-lg border border-(--border) bg-(--card)">
        <h3 className="text-xl font-bold mb-2">Nutrition and Recovery Targets</h3>
        <p className="text-sm">Calories: {nutrition.calories} kcal/day | Protein: {nutrition.proteinG}g/day | Hydration: {nutrition.hydrationL}L/day</p>
      </div>
    </>
  );
}
