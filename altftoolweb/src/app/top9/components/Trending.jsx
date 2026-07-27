"use client";
import Link from "next/link";
import { Flame } from "lucide-react";
import { trending } from "@/app/top9/data2/trending";
export default function Trending({ searchQuery = "" }) {
  const q = searchQuery.toLowerCase().trim();
  const items = (
    q ? trending.filter((x) => x.title.toLowerCase().includes(q)) : trending
  ).slice(0, 5);
  return (
    <section className="top9-section">
      <div className="top9-shell">
        <div className="top9-trending">
          {" "}
          <div className="top9-section-heading">
            <h2>
              <Flame size={20} color="#ff5c1d" /> Trending Right Now
            </h2>
            <Link className="top9-link" href="/top9">
View all trending&nbsp; →
            </Link>
          </div>
          {items.length ? (
            <div className="top9-carousel">
              {items.map((x, i) => (
                <Link
                  className="top9-card top9-trending-card"
                  href={`/top9/${x.slug}`}
                  key={x.slug}
                >
                  <div className="top9-trending-media">
                    <img src={x.img} alt={x.title} />
                    <span className="top9-rank">{i + 1}</span>
                  </div>
                  <div className="top9-trending-copy">
                    <strong>
                      {[
                        "Top 9 AI Tools for Productivity",
                        "Top 9 Netflix Shows You Should Watch",
                        "Top 9 Beaches in the World",
                        "Top 9 Smartphones of 2026",
                        "Top 9 Healthy Foods for Daily Life",
                      ][i] || x.title}
                    </strong>
                    <span>{(2.3 - i * 0.2).toFixed(1)}K views</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="top9-empty">No trending lists match your search.</p>
          )}
        </div>
      </div>
    </section>
  );
}
