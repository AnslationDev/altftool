"use client";

export default function ForumHeader({ query, onQueryChange, totalThreads }) {
  return (
    <header className="forum-module-header">
      <div>
        <p className="section-kicker">THE ALTFWORLD FORUMS</p>
        <h1>Conversations with some gravity.</h1>
        <p>Explore a large mock community catalog built with 50 categories, 30,000 threads, and thoughtful filters.</p>
      </div>
      <label className="forum-module-search">
        <span>⌕</span>
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search 30,000 mock threads" />
        <small>{totalThreads.toLocaleString()} found</small>
      </label>
    </header>
  );
}
