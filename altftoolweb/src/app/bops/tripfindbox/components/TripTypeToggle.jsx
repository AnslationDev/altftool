export default function TripTypeToggle({ tripType, onChange }) {
  return (
    <div className="trip-toggle inline-flex overflow-hidden rounded-full bg-gradient-to-b from-white to-[#e8e8e8] text-sm font-bold shadow-2xl">
      {[
        ["round", "Round trip"],
        ["oneway", "One way"],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`trip-toggle-btn rounded-full font-semibold transition ${
            tripType === value ? "bg-[#2E3192] text-white" : "text-[#2E3192] hover:text-[#2E3192]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
