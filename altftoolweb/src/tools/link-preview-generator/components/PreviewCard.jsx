"use client";

export default function PreviewCard({ data }) {
  if (!data) return null;

  return (
    <div
      className={`
        max-w-md rounded-2xl shadow-lg p-4 mt-6 mx-auto 
        transform hover:scale-105 transition-transform duration-300
        bg-(--card) text-(--card-foreground) border border-(--border)
      `}
    >
      {data.image && (
        <img
          src={data.image}
          alt="Preview"
          className="w-full h-48 object-cover rounded-lg"
        />
      )}

      <h2 className="text-xl font-semibold mt-3">{data.title}</h2>

      <p className="mt-2 text-(--muted-foreground)">{data.description}</p>

      <a
        href={data.url}
        target="_blank"
        rel="noopener noreferrer"
        className="
          text-(--primary) mt-3 inline-block hover:underline 
        "
      >
        Visit Site →
      </a>
    </div>
  );
}
