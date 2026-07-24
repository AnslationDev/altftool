import Link from "next/link";
import {
  Clapperboard,
  Coffee,
  Dumbbell,
  Gamepad2,
  HeartHandshake,
  Laptop,
  MoreHorizontal,
  Plane,
  Car,
  Trophy,
} from "lucide-react";
const items = [
  [Clapperboard, "Movies & TV", "#f0eaff", "#764ce5"],
  [Coffee, "Food & Drinks", "#fff0d9", "#ee9e25"],
  [Plane, "Travel", "#e5f2ff", "#3b91df"],
  [Laptop, "Technology", "#e0f8f2", "#14a287"],
  [Trophy, "Sports", "#fde5e8", "#df5069"],
  [Car, "Cars & Bikes", "#eee9ff", "#7147e5"],
  [Gamepad2, "Gaming", "#f0eaff", "#7147e5"],
  [HeartHandshake, "Health & Fitness", "#ffe5ef", "#ea5583"],
  [MoreHorizontal, "More", "#f2f4fb", "#657087"],
];
export default function Categories({ activeCategory = "" }) {
  return (
    <section className="top9-section">
      <div className="top9-shell">
        <div className="top9-section-heading">
          <h2>Explore by Category</h2>
          <Link className="top9-link" href="/top9">
            View all categories&nbsp; ?
          </Link>
        </div>
        <div className="top9-categories">
          {items.map(([Icon, label, bg, color]) => (
            <Link
              key={label}
              href={
                label === "More"
                  ? "/top9"
                  : `/top9?category=${encodeURIComponent(activeCategory === label ? "" : label)}`
              }
              className="top9-card top9-category"
              style={{ "--cb": bg, "--cc": color }}
            >
              <i className="top9-category-icon">
                <Icon size={22} />
              </i>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
