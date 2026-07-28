"use client";

export default function ForumSidebar({ categories, activeCategory, onSelect }) {
  return (
    <aside className="forum-module-sidebar">
      <p className="side-label">BROWSE THE CATALOG</p>
      <button className={activeCategory === "all" ? "side-active" : ""} onClick={() => onSelect("all")}>
        <span className="module-dot all" /> All conversations
      </button>
      {categories.map((category) => (
        <button key={category.slug} className={activeCategory === category.slug ? "side-active" : ""} onClick={() => onSelect(category.slug)}>
          <span className={`module-dot ${category.accent}`} />
          <span>{category.name}</span>
          <small>{category.threads}</small>
        </button>
      ))}
    </aside>
  );
}
