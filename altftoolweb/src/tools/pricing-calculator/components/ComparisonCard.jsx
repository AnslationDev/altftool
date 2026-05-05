const ScenarioComparison = ({ scenarios }) => {
  return (
    <div className="overflow-hidden border border-(--border) bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-(--border)">
          <tr>
            <th className="p-4 font-bold opacity-60">Scenario</th>
            <th className="p-4 font-bold opacity-60">Price</th>
            <th className="p-4 font-bold opacity-60">Margin</th>
            <th className="p-4 font-bold opacity-60">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-(--border)">
          {scenarios.map((s, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="p-4 font-bold">Plan {String.fromCharCode(65 + i)}</td>
              <td className="p-4">₹{s.price.toLocaleString()}</td>
              <td className={`p-4 font-bold ${s.margin > 15 ? 'text-green-600' : 'text-red-500'}`}>
                {s.margin}%
              </td>
              <td className="p-4">
                <button className="text-blue-600 font-bold hover:underline">Apply</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};