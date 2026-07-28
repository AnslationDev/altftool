"use client";

import ForumCard from "./ForumCard";

export default function ForumDashboard({ threads, totalThreads, page, onPageChange }) {
  return (
    <section className="forum-module-dashboard">
      <div className="forum-dashboard-heading"><div><p className="section-kicker">LIVE MOCK FEED</p><h2>Fresh from the room</h2></div><span>{totalThreads.toLocaleString()} conversations</span></div>
      <div className="forum-dashboard-list">
        {threads.length ? threads.map((thread, index) => <ForumCard key={thread.slug} thread={thread} index={index} />) : <div className="empty-state">No mock conversations match that search.</div>}
      </div>
      <nav className="module-pagination" aria-label="Mock forum pagination">
        <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>←</button>
        {[1, 2, 3].map((number) => <button key={number} onClick={() => onPageChange(number)} className={page === number ? "active" : ""}>{number}</button>)}
        <span>…</span><button onClick={() => onPageChange(page + 1)}>→</button>
      </nav>
    </section>
  );
}
