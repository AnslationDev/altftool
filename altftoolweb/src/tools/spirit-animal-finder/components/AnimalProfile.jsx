import { Sparkles, Zap, Briefcase, Heart, BookOpen } from "lucide-react";

export default function AnimalProfile({ animal }) {
  if (!animal) return null;

  const sections = [
    { icon: Zap, label: "Strengths", value: animal.strengths },
    { icon: BookOpen, label: "Challenges", value: animal.weaknesses },
    { icon: Briefcase, label: "Career Paths", value: animal.careerPaths },
    { icon: Heart, label: "Love Style", value: animal.loveStyle },
  ];

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-[var(--primary)]" />
        <h3 className="text-lg font-semibold text-[var(--foreground)]">
          {animal.name} Profile
        </h3>
      </div>

      <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 mb-4">
        <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-1">
          Life Lesson
        </div>
        <p className="text-sm text-[var(--foreground)] font-medium italic leading-relaxed">
          &ldquo;{animal.lifeLesson}&rdquo;
        </p>
      </div>

      <div className="space-y-3">
        {sections.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Icon className="h-4 w-4 text-[var(--primary)]" />
              <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-sm text-[var(--foreground)] leading-relaxed">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
