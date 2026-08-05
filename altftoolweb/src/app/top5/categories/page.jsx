import Link from "next/link";
import {
  Cpu,
  Bot,
  Building2,
  CircleDollarSign,
  GraduationCap,
  Clapperboard,
  Music,
  BookOpen,
  Landmark,
  UtensilsCrossed,
  Sparkles,
  Car,
  TrendingUp,
  Rocket,
  Shirt,
  ArrowUpRight,
} from "lucide-react";
import { getAllCategories } from "../data/categories";
import { getAllCountries } from "../data/countries";
import { Reveal, StaggerGroup, StaggerItem } from "../components/motion";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata() {
  return createPageMetadata({
    title: "All Categories & Countries",
    description:
      "Browse every Top5 category and country index — the full directory of fields the ranking platform covers.",
    path: "/top5/categories",
    noindex: true,
    follow: true,
  });
}

const ICONS = {
  Cpu,
  Bot,
  Building2,
  CircleDollarSign,
  GraduationCap,
  Clapperboard,
  Music,
  BookOpen,
  Landmark,
  UtensilsCrossed,
  Sparkles,
  Car,
  TrendingUp,
  Rocket,
  Shirt,
};

export default function Top5CategoriesPage() {
  const categories = getAllCategories();
  const countries = getAllCountries();

  return (
    <div>
      <section className="relative overflow-hidden bg-[#0b1120] text-white">
        <div className="pointer-events-none absolute -top-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#10b981]/20 blur-[110px]" />
        <div className="pointer-events-none absolute top-0 right-0 h-[320px] w-[320px] rounded-full bg-[#5ea8ff]/20 blur-[110px]" />
        <div className="relative max-w-7xl mx-auto px-6 py-16">
          <Reveal>
            <p className="text-xs font-semibold tracking-widest text-[#67e8b8]">
              THE FULL INDEX
            </p>
            <h1 className="mt-4 text-4xl sm:text-6xl font-black tracking-tight">
              Every category, one place.
            </h1>
            <p className="mt-4 max-w-xl text-white/70">
              {categories.length} fields and {countries.length} countries,
              each with its own editorial index of what belongs in the Top5.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="categories" className="max-w-7xl mx-auto px-6 py-16 scroll-mt-20">
        <Reveal>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0b1120]">
            Categories
          </h2>
        </Reveal>

        <StaggerGroup className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-px bg-black/5 rounded-2xl overflow-hidden border border-black/5">
          {categories.map((category) => {
            const Icon = ICONS[category.icon] || Sparkles;
            return (
              <StaggerItem key={category.slug}>
                <Link
                  href={`/top5/category/${category.slug}`}
                  className="group bg-[#f7f8fa] hover:bg-white transition-colors px-6 py-8 flex flex-col items-start justify-center gap-3 h-full"
                >
                  <Icon size={22} className="text-[#9ca3af] group-hover:text-[#10b981] transition-colors group-hover:scale-110 duration-300" />
                  <div>
                    <p className="font-semibold text-[#0b1120]">{category.name}</p>
                    <p className="text-sm text-[#9ca3af]">{category.count} rankings</p>
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </section>

      <section id="countries" className="bg-[#f7f8fa] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0b1120]">
              Countries
            </h2>
          </Reveal>

          <StaggerGroup className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {countries.map((country) => (
              <StaggerItem key={country.slug}>
                <Link
                  href={`/top5/category/${country.slug}`}
                  className="group relative rounded-2xl bg-[#0b1120] p-6 h-[190px] flex flex-col justify-between overflow-hidden transition-transform duration-300 hover:-translate-y-1.5"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none select-none absolute -right-2 -top-2 text-6xl font-black text-white/[0.06]"
                  >
                    {country.code}
                  </span>
                  <div className="flex items-start justify-between relative z-10">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-xs font-semibold text-white">
                      {country.code}
                    </span>
                    <ArrowUpRight size={18} className="text-white/60 group-hover:text-white transition-colors" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-lg font-bold text-white">{country.name}</p>
                    <p className="mt-1 text-sm text-white/50">{country.count} curated rankings</p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </div>
  );
}
