export default function CoachPanel({ coach, nextSteps }) {
  return (
    <>
      <div className="p-4 rounded-lg border border-(--border) bg-(--card)" role="status" aria-live="polite">
        <h3 className="text-xl font-bold mb-2">Coach Feedback</h3>
        <p className="text-sm">{coach}</p>
      </div>

      <div className="p-4 rounded-lg border border-(--border) bg-(--card)">
        <h3 className="text-xl font-bold mb-2">Clear Next Steps</h3>
        <ul className="space-y-1 text-sm">{nextSteps.map((step) => <li key={step}>- {step}</li>)}</ul>
      </div>
    </>
  );
}
