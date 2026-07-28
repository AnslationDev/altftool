"use client";

import ForumHeader from "./components/ForumHeader";
import ForumSidebar from "./components/ForumSidebar";
import ForumDashboard from "./components/ForumDashboard";
import useForumState from "./hooks/useForumState";

export default function ForumsPageView() {
  const forum = useForumState();

  return (
    <main className="site-shell forum-module-page">
      <ForumHeader query={forum.query} onQueryChange={forum.setQuery} totalThreads={forum.totalThreads} />
      <div className="forum-module-layout">
        <ForumSidebar categories={forum.categories} activeCategory={forum.activeCategory} onSelect={forum.chooseCategory} />
        <ForumDashboard threads={forum.visibleThreads} totalThreads={forum.totalThreads} page={forum.page} onPageChange={forum.setPage} />
        <aside className="forum-module-aside">
          <p className="section-kicker">DATASET SCALE</p>
          <strong>30,000</strong><span>mock threads</span>
          <strong>5,000</strong><span>member profiles</span>
          <strong>50</strong><span>categories · 150 subcategories</span>
          <p>Every visible result is filtered locally from a deterministic AltfWorld JavaScript dataset.</p>
        </aside>
      </div>
    </main>
  );
}
