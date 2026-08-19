import { Hash, Gem, Eye, Star } from "lucide-react";

function ProfileCard({ label, profile }) {
  const items = [
    { icon: Hash, label: "Name Number", value: profile.nameNumber },
    { icon: Gem, label: "Soul Urge", value: profile.soulUrge },
    { icon: Eye, label: "Personality", value: profile.personality },
    { icon: Star, label: "Destiny", value: profile.destiny },
  ];

  return (
    <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
      <h4 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wide mb-3">{label}</h4>
      <div className="text-lg font-bold text-[var(--foreground)] mb-3">{profile.name}</div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {items.map(({ icon: Icon, label: l, value }) => (
          <div key={l} className="flex items-center gap-2 p-2 bg-[var(--card)] border border-[var(--border)] rounded-lg">
            <Icon className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
            <div className="min-w-0">
              <div className="text-xs text-[var(--muted-foreground)]">{l}</div>
              <div className="text-sm font-bold text-[var(--foreground)]">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2 p-2 bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <span className="text-[var(--muted-foreground)]">Zodiac:</span>
          <span className="font-semibold text-[var(--foreground)]">{profile.zodiac}</span>
        </div>
        <div className="flex items-center gap-2 p-2 bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <span className="text-[var(--muted-foreground)]">Element:</span>
          <span className="font-semibold text-[var(--foreground)]">{profile.element}</span>
        </div>
        <div className="p-2 bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <span className="text-[var(--muted-foreground)] block mb-0.5">Trait: <span className="font-semibold text-[var(--foreground)]">{profile.numerology.trait}</span></span>
          <span className="text-[var(--muted-foreground)] leading-relaxed block">{profile.numerology.description}</span>
        </div>
      </div>
    </div>
  );
}

export default function NameProfiles({ name1Profile, name2Profile }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Numerology Profiles</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileCard label="Person 1" profile={name1Profile} />
        <ProfileCard label="Person 2" profile={name2Profile} />
      </div>
    </div>
  );
}
