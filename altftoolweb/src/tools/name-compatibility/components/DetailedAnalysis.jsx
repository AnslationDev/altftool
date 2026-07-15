import { Heart, Users, Sparkles, Briefcase, Shield } from "lucide-react";

export default function DetailedAnalysis({ result }) {
  const { name1, name2, scores } = result;

  const analyses = [
    {
      icon: Heart,
      title: "Love Analysis",
      color: "text-rose-500",
      score: scores.love,
      insight: getLoveInsight(name1, name2, scores.love),
    },
    {
      icon: Users,
      title: "Friendship Analysis",
      color: "text-blue-500",
      score: scores.friendship,
      insight: getFriendshipInsight(name1, name2, scores.friendship),
    },
    {
      icon: Sparkles,
      title: "Soulmate Analysis",
      color: "text-purple-500",
      score: scores.soulmate,
      insight: getSoulmateInsight(name1, name2, scores.soulmate),
    },
    {
      icon: Briefcase,
      title: "Business Analysis",
      color: "text-emerald-500",
      score: scores.business,
      insight: getBusinessInsight(name1, name2, scores.business),
    },
  ];

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-[var(--primary)]" />
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Detailed Analysis</h3>
      </div>

      <div className="space-y-4">
        {analyses.map(({ icon: Icon, title, color, score, insight }) => (
          <div key={title} className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <h4 className="text-sm font-semibold text-[var(--foreground)]">{title}</h4>
              <span className="ml-auto text-sm font-bold text-[var(--primary)]">{score}%</span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function getLoveInsight(n1, n2, score) {
  if (score >= 80) return `${n1.name} and ${n2.name} share an incredibly passionate and deep romantic connection. The numerological vibrations between these names suggest a bond that transcends the ordinary — a true celestial romance.`;
  if (score >= 60) return `There's a strong romantic chemistry between ${n1.name} and ${n2.name}. Their name vibrations complement each other well, creating a warm and passionate bond that has the potential to deepen over time.`;
  if (score >= 40) return `${n1.name} and ${n2.name} have an interesting romantic dynamic. While there may be some differences, these contrasts can create an exciting and growth-oriented relationship.`;
  return `The romantic connection between ${n1.name} and ${n2.name} faces some challenges. However, challenges often lead to the deepest personal growth and understanding.`;
}

function getFriendshipInsight(n1, n2, score) {
  if (score >= 80) return `${n1.name} and ${n2.name} are destined to be the best of friends! Their personalities mesh perfectly, creating a friendship built on trust, laughter, and unwavering support.`;
  if (score >= 60) return `A strong and loyal friendship awaits ${n1.name} and ${n2.name}. They share common values and enjoy each other's company, forming a natural and easy-going bond.`;
  if (score >= 40) return `${n1.name} and ${n2.name} can build a meaningful friendship through shared experiences. Their different perspectives can enrich each other's lives.`;
  return `The friendship between ${n1.name} and ${n2.name} may require more effort, but the unique dynamics can lead to unexpected adventures and personal discoveries.`;
}

function getSoulmateInsight(n1, n2, score) {
  if (score >= 80) return `The universe has woven a profound soul contract between ${n1.name} and ${n2.name}. This is a karmic connection — their souls recognize each other from lifetimes past.`;
  if (score >= 60) return `${n1.name} and ${n2.name} share a deep spiritual resonance. Their connection goes beyond the physical realm, touching something ancient and meaningful.`;
  if (score >= 40) return `There's a spiritual dimension to the connection between ${n1.name} and ${n2.name}. This bond carries important soul lessons and opportunities for spiritual growth.`;
  return `The soulmate journey between ${n1.name} and ${n2.name} is complex and transformative. Sometimes the most challenging connections bring the most profound soul evolution.`;
}

function getBusinessInsight(n1, n2, score) {
  if (score >= 80) return `${n1.name} and ${n2.name} make a powerhouse business duo! Their combined energies create a magnet for success, innovation, and wealth creation.`;
  if (score >= 60) return `A solid business partnership potential exists between ${n1.name} and ${n2.name}. Their complementary strengths can build something truly successful and sustainable.`;
  if (score >= 40) return `${n1.name} and ${n2.name} can work together effectively with clear roles and boundaries. Their different approaches can lead to well-rounded business decisions.`;
  return `The business dynamic between ${n1.name} and ${n2.name} requires careful navigation. Clear communication and defined responsibilities will be key to success.`;
}
