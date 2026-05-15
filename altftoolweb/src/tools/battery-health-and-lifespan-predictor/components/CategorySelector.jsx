import { deviceCatalog } from "../utils/deviceCatalog";

export default function CategorySelector({ selected, onSelect }) {
  return (
    <div className="grid md:grid-cols-4 gap-4">
      {Object.entries(deviceCatalog).map(([key, cat]) => (
        <button
          key={key}
          onClick={() => onSelect(key)}
          className={`p-5 rounded-3xl border bg-[var(--card)] backdrop-blur-xl
          ${selected === key ? "ring-2 ring-blue-500" : ""}`}
        >
          <p className="font-semibold">{cat.label}</p>
        </button>
      ))}
    </div>
  );
}