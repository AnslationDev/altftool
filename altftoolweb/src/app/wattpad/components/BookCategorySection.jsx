"use client";

import Image from "next/image";
import Link from "next/link";
import categories from "../data/categories.json";

export default function BrowseCategory() {
  return (
    <section className="wp-section">
      <div className="wp-section-header wp-anim-fade-up">
        <h2 className="wp-section-title">Browse Categories</h2>
        <p className="wp-section-subtitle">
          Explore stories across romance, fantasy, thriller & more
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 wp-no-scrollbar lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible">
        {categories.map((item) => (
          <div key={item.id} className="shrink-0 lg:shrink">
            <Link href={`/wattpad/category/${item.slug}`}>
              <CatCard item={item} />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function CatCard({ item }) {
  return (
    <div className="wp-cat-card">
      <div className="wp-cat-circle">
        <Image
          src={item.coverImage}
          width={100}
          height={100}
          alt={item.name}
          className="wp-cat-image"
        />
      </div>
      <div className="wp-cat-name">{item.name}</div>
    </div>
  );
}
