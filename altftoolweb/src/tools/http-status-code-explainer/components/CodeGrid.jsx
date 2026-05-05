const common = [
  200, 201, 204, 301, 302, 307, 400, 401, 403, 404, 405, 409, 418, 429, 500,
  502, 503,
];

export default function CodeGrid({ onPick }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
      {common.map((c) => (
        <button
          key={c}
          onClick={() => onPick(c)}
          className="p-4 rounded-xl shadow-sm hover:shadow-md bg-(--card) border border-(--divider) transition-all"
        >
          <div className="text-xl font-bold text-(--foreground)">{c}</div>
          <div className="text-xs text-(--muted-foreground)">Click</div>
        </button>
      ))}
    </div>
  );
}
