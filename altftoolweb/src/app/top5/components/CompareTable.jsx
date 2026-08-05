export default function CompareTable({ items }) {
  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-black/10 text-xs font-semibold tracking-widest text-[#9ca3af]">
            <th className="py-3 pr-4">RANK</th>
            <th className="py-3 pr-4">NAME</th>
            <th className="py-3 pr-4">BEST FOR</th>
            <th className="py-3 pr-4">SCORE</th>
            <th className="py-3 pr-4">REACH</th>
            <th className="py-3">EDITORIAL VIEW</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.rank} className="border-b border-black/5">
              <td className="py-4 pr-4 font-bold text-[#0b1120]">#{item.rank}</td>
              <td className="py-4 pr-4 font-semibold text-[#0b1120]">{item.name}</td>
              <td className="py-4 pr-4 text-[#4b5563] capitalize">{item.bestFor}</td>
              <td className="py-4 pr-4 text-[#0b1120]">{item.score}/10</td>
              <td className="py-4 pr-4 text-[#0b1120]">{item.globalReach}%</td>
              <td className="py-4 text-[#4b5563] max-w-xs">{item.whyItRanks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
