import { Sparkles, Gem, Flower2, Flame, Snowflake, Wind, Droplets, Users, Hash, Palette } from "lucide-react";

function InsightCard({ label, value, subtext, icon: Icon, color }) {
  return (
    <div className="bg-(--card) border border-(--border) rounded-xl p-4 shadow-[var(--anslation-ds-shadow-sm)] hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: color ? `${color}20` : undefined }}
        >
          <Icon className="h-5 w-5" style={{ color: color || "var(--primary)" }} />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-(--muted-foreground) uppercase tracking-wide">{label}</div>
          <div className="text-sm font-bold text-(--foreground) mt-0.5">{value}</div>
          {subtext && <div className="text-xs text-(--muted-foreground) mt-0.5">{subtext}</div>}
        </div>
      </div>
    </div>
  );
}

function ElementIcon({ element }) {
  switch (element) {
    case "Fire": return <Flame className="h-5 w-5 text-orange-500" />;
    case "Earth": return <Sparkles className="h-5 w-5 text-emerald-600" />;
    case "Air": return <Wind className="h-5 w-5 text-sky-500" />;
    case "Water": return <Droplets className="h-5 w-5 text-blue-500" />;
    default: return <Sparkles className="h-5 w-5 text-(--primary)" />;
  }
}

export default function BirthdayInsights({ insights }) {
  if (!insights) return null;

  return (
    <div className="bg-(--card) border border-(--border) rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-(--primary)" />
        <h3 className="text-lg font-semibold text-(--foreground)">Birthday Insights</h3>
      </div>

      <div className="tool-card-grid">
        <InsightCard
          label="Western Zodiac"
          value={insights.westernZodiac.sign}
          subtext={insights.westernZodiac.symbol}
          icon={Sparkles}
          color="#8B5CF6"
        />
        <InsightCard
          label="Chinese Zodiac"
          value={insights.chineseZodiac}
          subtext={`Year of the ${insights.chineseZodiac}`}
          icon={Users}
          color="#EF4444"
        />
        <InsightCard
          label="Birthstone"
          value={insights.birthstone.name}
          subtext={insights.birthstone.color}
          icon={Gem}
          color={insights.birthstone.color}
        />
        <InsightCard
          label="Birth Flower"
          value={insights.birthFlower.name}
          subtext={insights.birthFlower.meaning}
          icon={Flower2}
          color="#EC4899"
        />
        <InsightCard
          label="Element"
          value={insights.element}
          icon={({ className }) => <ElementIcon element={insights.element} />}
          color={insights.element === "Fire" ? "#F97316" : insights.element === "Earth" ? "#10B981" : insights.element === "Air" ? "#0EA5E9" : "#3B82F6"}
        />
        <InsightCard
          label="Season"
          value={insights.season.name}
          icon={Snowflake}
          color="#06B6D4"
        />
        <InsightCard
          label="Generation"
          value={insights.generation.name}
          subtext={insights.generation.range}
          icon={Users}
          color="#6366F1"
        />
        <InsightCard
          label="Lucky Numbers"
          value={insights.luckyNumbers.join(", ")}
          icon={Hash}
          color="#10B981"
        />
        <InsightCard
          label="Lucky Colors"
          value={insights.luckyColors.join(", ")}
          icon={Palette}
          color="#F59E0B"
        />
      </div>
    </div>
  );
}
