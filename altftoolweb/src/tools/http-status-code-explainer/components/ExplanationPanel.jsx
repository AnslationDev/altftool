export default function ExplanationPanel({ info }) {
  if (!info) return null;

  const img = `https://http.cat/${info.code}`;

  return (
    <div className="bg-(--card) text-(--foreground) p-4 rounded-xl shadow-md h-fit border border-(--border)">
      {/* Title */}
      <h2 className="text-2xl font-semibold">
        {info.code} — {info.short}
      </h2>

      {/* Category Badge */}
      <div
        className="mt-1 inline-block px-3 py-1 rounded-full text-sm 
                      bg-(--primary)/15 text-(--primary)"
      >
        {info.category}
      </div>

      {/* Status Image */}
      <img
        src={img}
        onError={(e) => {
          e.currentTarget.src = "https://http.cat/404";
        }}
        className="rounded-xl mt-4 w-full"
        alt={`HTTP ${info.code}`}
      />

      {/* Description */}
      <p className="mt-4 text-(--muted-foreground) leading-relaxed">
        {info.detail}
      </p>
    </div>
  );
}
