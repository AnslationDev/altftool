"use client";
import Link from "next/link";
import {
  Flame,
  Gift,
  Heart,
  Monitor,
  Plane,
  Utensils,
  Gamepad2,
  PlayCircle,
} from "lucide-react";
import { blogs } from "../data/blogs";
import { trending } from "../data2/trending";
const titles = [
  "Top 9 Superhero Movies of All Time",
  "Top 9 Football Players in the World (2026)",
  "Top 9 Places to Visit Before You Die",
  "Top 9 Laptops for Developers",
];
const latest = [
  "Top 9 Most Beautiful Islands in the World",
  "Top 9 Open World Games You Must Play",
  "Top 9 Desserts Around the World",
  "Top 9 Home Workouts for Muscle Building",
];
const icons = [Gift, Plane, Utensils, Monitor, Heart];
export default function ContentArea({ searchQuery = "", sidebarOnly = false }) {
  const q = searchQuery.toLowerCase().trim();
  const popular = trending
    .slice(0, 4)
    .filter((x) => !q || x.title.toLowerCase().includes(q));
  const news = blogs
    .concat(trending)
    .slice(0, 4)
    .filter((x) => !q || x.title.toLowerCase().includes(q));
  if (sidebarOnly) {
    return (
      <aside className="top9-sidebar">
        <Sidebar />
      </aside>
    );
  }

  return (
    <>
      <div>
        <section className="top9-section">
          <div className="top9-section-heading">
            <h2>Most Popular Top 9 Lists</h2>
            <Link className="top9-link" href="/top9">
              View all popular&nbsp; ?
            </Link>
          </div>
          {popular.length ? (
            <div className="top9-popular-grid">
              {popular.map((x, i) => (
                <Link
                  className="top9-card top9-popular-card"
                  href={`/top9/${x.slug}`}
                  key={x.slug}
                >
                  <div className="top9-popular-media">
                    <img src={x.img} alt={x.title} />
                    <span className="top9-popular-rank">{i + 1}</span>
                  </div>
                  <div className="top9-popular-copy">
                    <em>{["Movies", "Sports", "Travel", "Technology"][i]}</em>
                    <strong>{titles[i]}</strong>
                    <div className="top9-meta">
                      <span className="top9-rating">? {4.8 - i / 10}</span>
                      <span>�</span>
                      <span>{25.6 - i * 3.6}K views</span>
                    </div>
                    <div className="top9-meta">5 min read</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="top9-empty">No popular lists match your search.</p>
          )}
        </section>
        <section className="top9-section">
          <div className="top9-section-heading">
            <h2>Newly Published</h2>
            <Link className="top9-link" href="/top9">
              View all latest&nbsp; ?
            </Link>
          </div>
          <div className="top9-latest-grid">
            {news.map((x, i) => (
              <Link
                href={`/top9/${x.slug}`}
                className="top9-latest-item"
                key={`${x.slug}-${i}`}
              >
                <img src={x.img} alt={x.title} />
                <div>
                  <strong>{latest[i]}</strong>
                  <small>
                    {["TRAVEL", "GAMING", "FOOD", "FITNESS"][i]} &nbsp;�&nbsp;{" "}
                    {i * 2 + 2} hours ago
                  </small>
                  <span>? {842 + i * 90} views</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
function Sidebar() {
  return (
    <>
      <section className="top9-panel top9-sidebar-panel">
        <div className="top9-section-heading">
          <h2>
            <Flame size={18} color="#ff5c1d" /> Trending on Top9
          </h2>
          <Link className="top9-link" href="/top9">
            View all&nbsp; ?
          </Link>
        </div>
        <div className="top9-sidebar-list">
          {trending.slice(0, 9).map((x, i) => (
            <Link
              href={`/top9/${x.slug}`}
              className="top9-sidebar-row"
              key={x.slug}
            >
              <b>{i + 1}</b>
              <img src={x.img} alt="" />
              <span>
                <strong>
                  {
                    [
                      "Top 9 AI Tools for 2026",
                      "Top 9 Netflix Shows",
                      "Top 9 Smartphones of 2026",
                      "Top 9 Beaches in the World",
                      "Top 9 Healthy Foods",
                      "Top 9 Luxury Cars",
                      "Top 9 Horror Movies",
                      "Top 9 Coding Languages",
                      "Top 9 Travel Destinations",
                    ][i]
                  }
                </strong>
                <small>{(2.3 - i * 0.18).toFixed(1)}K views</small>
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="top9-panel top9-sidebar-panel">
        <div className="top9-section-heading">
          <h2>Featured Collections</h2>
          <Link className="top9-link" href="/top9">
            View all&nbsp; ?
          </Link>
        </div>
        {[
          "Best of Movies",
          "Travel Bucket List",
          "Foodie&apos;s Paradise",
          "Tech & Gadgets",
          "Fitness & Health",
        ].map((t, i) => {
          const I = icons[i];
          return (
            <Link href="/top9" className="top9-collection-mini" key={t}>
              <i>
                <I size={18} />
              </i>
              <span>
                <strong>{t}</strong>
                <small>{25 - i * 3} lists</small>
              </span>
            </Link>
          );
        })}
      </section>
      <section className="top9-panel top9-sidebar-panel">
        <div className="top9-section-heading">
          <h2>Editor&apos;s Picks</h2>
          <Link className="top9-link" href="/top9">
            View all&nbsp; ?
          </Link>
        </div>
        <Link className="top9-editor" href={`/top9/${trending[3].slug}`}>
          <img src={trending[3].img} alt="Editor's pick" />
          <span className="top9-editor-copy">
            <PlayCircle size={34} />
            <br />
            Top 9 Documentaries That Will Change Your Mind
            <small>? 4.9 &nbsp; ? 10.2K views</small>
          </span>
        </Link>
      </section>
    </>
  );
}
