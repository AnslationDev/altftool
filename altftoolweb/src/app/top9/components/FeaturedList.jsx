"use client";
import Link from "next/link";
import {
  Award,
  BadgeCheck,
  Clock3,
  Heart,
  ShieldCheck,
  Star,
} from "lucide-react";
import { trending } from "../data2/trending";
const collections = [
  "All Time Favorites",
  "Most Viewed Lists",
  "Highest Rated",
  "Hidden Gems",
  "Reader&apos;s Choice",
];
export default function FeaturedList({
  blogs,
  activeCategory = "",
  searchQuery = "",
}) {
  const items = (blogs?.length ? blogs : trending).slice(0, 5);
  return (
    <section className="top9-section">
      <div className="top9-shell">
        <div className="top9-panel top9-collections-panel">
          <div className="top9-section-heading">
            <h2>Top Collections</h2>
            <Link className="top9-link" href="/top9">
              View all collections&nbsp; ?
            </Link>
          </div>
          <div className="top9-collection-grid">
            {items.map((x, i) => (
              <Link
                href={`/top9/${x.slug}`}
                className="top9-collection-card"
                key={x.slug}
              >
                <img src={x.img} alt="" />
                <div>
                  <strong>{collections[i]}</strong>
                  <small>{50 - i * 8} Lists</small>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {(activeCategory || searchQuery) && (
          <p className="top9-empty" style={{ marginTop: 12 }}>
            Showing results{searchQuery ? ` for �${searchQuery}�` : ""}
            {activeCategory ? ` in ${activeCategory}` : ""}.{" "}
            <Link className="top9-link" href="/top9">
              Clear filters
            </Link>
          </p>
        )}
        <div className="top9-newsletter" style={{ marginTop: 18 }}>
          <div className="top9-newsletter-icon">??</div>
          <div>
            <h2>Stay Updated with the Best Top 9 Lists</h2>
            <p>
              Get the latest and greatest top 9 rankings delivered to your inbox
              daily.
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              aria-label="Email address"
            />
            <button className="top9-primary-action">Subscribe</button>
          </form>
        </div>
        <div className="top9-trust">
          <Trust
            Icon={Award}
            title="Curated & Ranked"
            text="Every list is carefully curated and ranked by experts."
          />
          <Trust
            Icon={Clock3}
            title="Updated Daily"
            text="Fresh content added daily so you never miss a trend."
          />
          <Trust
            Icon={Heart}
            title="Trusted by Millions"
            text="Millions of readers trust Top9 for the best rankings."
          />
          <Trust
            Icon={ShieldCheck}
            title="Across All Topics"
            text="From movies to tech, we cover every topic you love."
          />
        </div>
      </div>
    </section>
  );
}
function Trust({ Icon, title, text }) {
  return (
    <div className="top9-trust-item">
      <Icon size={21} />
      <span>
        <strong>{title}</strong>
        {text}
      </span>
    </div>
  );
}
