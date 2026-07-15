export default function AnimalResult({ animal, matchPercentage, isPrimary }) {
  if (!animal) return null;

  return (
    <div
      className={`bg-[var(--card)] border rounded-xl p-5 sm:p-6 text-center shadow-[var(--anslation-ds-shadow-sm)] transition ${
        isPrimary ? "border-[var(--primary)]" : "border-[var(--border)]"
      }`}
    >
      <div className="text-5xl mb-3">{animal.emoji}</div>

      <h3 className={`text-xl font-bold ${isPrimary ? "text-[var(--primary)]" : "text-[var(--foreground)]"} mb-1`}>
        {animal.name}
      </h3>

      {isPrimary && matchPercentage && (
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--primary)] text-white text-xs font-bold mb-3">
          {matchPercentage}% Match
        </div>
      )}

      {!isPrimary && (
        <div className="text-xs text-[var(--muted-foreground)] mb-3">
          Secondary Spirit Animal
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {animal.traits.map((trait) => (
          <span
            key={trait}
            className="px-2.5 py-1 rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--foreground)]"
          >
            {trait}
          </span>
        ))}
      </div>

      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
        {animal.description}
      </p>
    </div>
  );
}
