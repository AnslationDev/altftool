export default function ResultCards({ result }) {
  if (!result) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-lg border border-(--border) p-4 bg-(--background)">
        <p className="text-sm text-(--muted-foreground)">Estimated 1RM</p>
        <p className="text-2xl font-bold text-(--primary)">{result.oneRm.toFixed(1)} kg</p>
      </div>
      <div className="rounded-lg border border-(--border) p-4 bg-(--background)">
        <p className="text-sm text-(--muted-foreground)">Formula</p>
        <p className="text-2xl font-bold text-(--foreground)">{result.formula}</p>
      </div>
      <div className="rounded-lg border border-(--border) p-4 bg-(--background)">
        <p className="text-sm text-(--muted-foreground)">Exercise</p>
        <p className="text-2xl font-bold text-(--foreground)">{result.exercise}</p>
      </div>
    </div>
  );
}
