export default function LeadPreviewTable({ data }) {
  if (!data || !data.length) return null;

  return (
    <div className="
      mt-6
      rounded-2xl
      border border-(--border)
      bg-(--card)
      overflow-hidden
      shadow-md
    ">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-(--card-foreground)">
          <thead className="bg-(--muted)">
            <tr className="text-(--muted-foreground)">
              <th className="px-4 py-3 text-left font-semibold">Name</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Phone</th>
              <th className="px-4 py-3 text-left font-semibold">Company</th>
            </tr>
          </thead>

          <tbody>
            {data.slice(0, 5).map((r, i) => (
              <tr
                key={i}
                className="
                  border-t border-(--border)
                  transition-colors duration-200
                  hover:bg-(--primary)/5
                "
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  {r.Name || "-"}
                </td>

                <td className="px-4 py-3 text-(--primary) font-medium whitespace-nowrap">
                  {r.Email}
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  {r.Phone || "-"}
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  {r.Company || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > 5 && (
        <div className="
          px-4 py-3
          border-t border-(--border)
          bg-(--background)
          text-sm text-(--muted-foreground)
        ">
          Showing first 5 rows out of{" "}
          <span className="font-semibold text-(--foreground)">
            {data.length}
          </span>
        </div>
      )}
    </div>
  );
}
