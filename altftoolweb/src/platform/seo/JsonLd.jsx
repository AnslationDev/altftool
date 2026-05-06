export default function JsonLd({ data, id }) {
  const payload = Array.isArray(data) ? data.filter(Boolean) : data;

  if (!payload || (Array.isArray(payload) && payload.length === 0)) return null;

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload).replace(/</g, "\\u003c"),
      }}
    />
  );
}
