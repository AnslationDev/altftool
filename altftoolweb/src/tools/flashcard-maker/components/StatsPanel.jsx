import { BarChart2, Zap, Target, BookOpen } from "lucide-react";

export default function StatsPanel({ deck }) {
  if (!deck) return null;

  return (
    <div className="bg-(--background) p-5 rounded-xl border border-(--border) shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-(--secondary)">
        <BarChart2 className="w-4 h-4 text-blue-600" />
        <h3 className="font-bold text-[10px] uppercase tracking-[0.2em]">Deck Insights</h3>
      </div>

      <div className="flex flex-col gap-3">
        <StatItem label="Total Units" value={deck.cards.length} icon={<BookOpen className="w-3.5 h-3.5 text-blue-500" />} />
        <StatItem label="Mastered" value={deck.cards.filter(c => c.difficulty === 'easy').length} icon={<Target className="w-3.5 h-3.5 text-green-500" />} />
        <StatItem label="In Progress" value={deck.cards.filter(c => c.difficulty === 'medium').length} icon={<Zap className="w-3.5 h-3.5 text-orange-500" />} />
        <StatItem label="Retention" value="High" icon={<BarChart2 className="w-3.5 h-3.5 text-indigo-500" />} />
      </div>
    </div>
  );
}

function StatItem({ label, value, icon }) {
  return (
    <div className="bg-(--card) p-4 rounded-xl border border-(--border) flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-(--background) rounded-lg border border-(--border)/50">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-(--muted-foreground) uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-base font-bold text-(--foreground) leading-none">{value}</p>
    </div>
  );
}
