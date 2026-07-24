"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Clock3, Flame, Search, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { trending } from "@/app/top9/data2/trending";
const stats = [
  [Award, "227K+", "Top 9 Lists"],
  [Sparkles, "150+", "Categories"],
  [Clock3, "Updated Daily", "Fresh Rankings"],
  [Users, "Millions", "Readers Worldwide"],
];
export default function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [a, b, c, d] = trending;
  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/top9?q=${encodeURIComponent(q)}` : "/top9");
  };
  return (
    <section className="top9-hero">
      <div className="top9-shell">
        <div className="top9-hero-box">
          <div className="top9-hero-layout">
            <div>
              <span className="top9-eyebrow">
                <Sparkles size={11} /> The world&apos;s best
              </span>
              <h1>
                Discover the World&apos;s
                <br />
                <span className="top9-gradient-text">Top 9</span> Rankings
              </h1>
              <p className="top9-hero-description">
                Explore the best Top 9 lists across movies, TV shows, food,
                travel, technology, sports and more. Curated, ranked and updated
                daily for you.
              </p>
              <form className="top9-search-form" onSubmit={submit}>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search any Top 9 list..."
                  aria-label="Search Top 9 lists"
                />
                <button className="top9-primary-action" aria-label="Search">
                  <Search size={20} />
                </button>
              </form>
              <div className="top9-popular-searches">
                <strong>Popular searches:</strong>
                {[
                  "Netflix Shows",
                  "AI Tools",
                  "Best Cars",
                  "Travel Destinations",
                ].map((x) => (
                  <Link
                    key={x}
                    className="top9-query-chip"
                    href={`/top9?q=${encodeURIComponent(x)}`}
                  >
                    {x}
                  </Link>
                ))}
              </div>
              <div className="top9-stats">
                {stats.map(([I, v, l]) => (
                  <div className="top9-stat" key={l}>
                    <i className="top9-stat-icon">
                      <I size={16} />
                    </i>
                    <p>
                      <strong>{v}</strong>
                      <span>{l}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="top9-hero-collage">
              <Link
                className="top9-feature-card top9-feature-main"
                href={`/top9/${a.slug}`}
              >
                <img src={a.img} alt="Top ranked list" />
                <span className="top9-rank">#1</span>
                <span className="top9-feature-caption">
                  Top 9 Sci-Fi Movies
                  <br />
                  of All Time<small>View List&nbsp; ?</small>
                </span>
              </Link>
              <Link
                className="top9-feature-card top9-feature-small top9-feature-top"
                href={`/top9/${b.slug}`}
              >
                <img src={b.img} alt="Top food list" />
                <span className="top9-rank">#2</span>
                <span className="top9-feature-caption">
                  Top 9 Street Foods
                  <br />
                  Around the World
                </span>
              </Link>
              <Link
                className="top9-feature-card top9-feature-small top9-feature-bottom"
                href={`/top9/${c.slug}`}
              >
                <img src={c.img} alt="Top travel list" />
                <span className="top9-rank">#3</span>
                <span className="top9-feature-caption">
                  Top 9 Travel Destinations
                  <br />
                  You Must Visit
                </span>
              </Link>
              <Link className="top9-trending-note" href={`/top9/${d.slug}`}>
                <span>
                  <Flame size={13} /> Trending Now
                </span>
                <strong>Top 9 AI Tools for 2026</strong>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
