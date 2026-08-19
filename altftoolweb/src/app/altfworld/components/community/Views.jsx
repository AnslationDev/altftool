"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import community from "../../data/mockCommunity";
import CommunityHeader from "../layout/CommunityHeader";

const fadeUp = { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 } };

export function Avatar({ initials, tone = "coral", large = false }) {
  return <span className={`avatar-orbit ${tone} ${large ? "avatar-large" : ""}`}>{initials}</span>;
}

function Kicker({ children }) { return <p className="section-kicker">{children}</p>; }

export function SectionHeading({ kicker, title, action, children }) {
  return <div className="section-heading-orbit"><div>{kicker && <Kicker>{kicker}</Kicker>}<h2>{title}</h2>{children}</div>{action}</div>;
}

export function ThreadList({ threads, compact = false }) {
  return <div className={`thread-list-orbit ${compact ? "compact-list" : ""}`}>
    {threads.map((thread, index) => <motion.article className="thread-card-orbit" key={thread.slug} {...fadeUp} transition={{ delay: index * 0.035 }}><Avatar initials={thread.initials} tone={thread.tone} /><div className="thread-copy"><div className="thread-topline">{thread.pinned && <span className="pin-label">PINNED</span>}<span className="thread-tag">{thread.tag}</span></div><Link href={`/altfworld/forums/${thread.categorySlug}/general/${thread.slug}`} className="thread-title-orbit">{thread.title}</Link><p>{thread.excerpt}</p><span className="thread-byline">Started by <Link href={`/altfworld/profile/${thread.handle}`}>{thread.author}</Link> · {thread.date}</span></div><div className="thread-numbers"><span><b>{thread.replies}</b> replies</span><span><b>{thread.views.toLocaleString()}</b> views</span></div><time>{thread.lastReply}</time></motion.article>)}
  </div>;
}

export function CategoryCard({ category, index = 0 }) {
  return <motion.article className={`category-card ${category.accent}`} {...fadeUp} transition={{ delay: index * 0.05 }} whileHover={{ y: -5 }}><Link href={`/altfworld/forums/${category.slug}`}><div className="category-card-top"><span className="category-glyph">{category.icon}</span><span className="card-arrow">→</span></div><h3>{category.name}</h3><p>{category.description}</p><div className="category-card-meta"><span><b>{category.threads.toLocaleString()}</b> threads</span><span><b>{category.posts.toLocaleString()}</b> posts</span></div><div className="latest-category"><span>Latest</span><strong>{category.latest}</strong><small>by {category.latestUser}</small></div></Link></motion.article>;
}

export function ForumSidebar({ active }) {
  return <aside className="left-sidebar"><p className="side-label">EXPLORE</p><Link className={!active ? "side-active" : ""} href="/altfworld/forums"><span>◫</span> All forums</Link><Link href="/altfworld/forums?view=latest"><span>⌁</span> Latest activity</Link><Link href="/altfworld/search"><span>⌕</span> Search discussions</Link><p className="side-label push-label">CATEGORIES</p>{community.categories.slice(0, 12).map((category) => <Link className={active === category.slug ? "side-active" : ""} key={category.slug} href={`/altfworld/forums/${category.slug}`}><span className={`dot ${category.accent}`} />{category.name}</Link>)}<p className="side-label push-label">YOUR SPACE</p><button className="plain-side-button"><span>♡</span> Saved threads</button><button className="plain-side-button"><span>⌘</span> Bookmarks</button><div className="tag-cloud"><b>Popular tags</b><span>launch</span><span>systems</span><span>feedback</span><span>writing</span></div></aside>;
}

export function RightSidebar() {
  return <aside className="right-sidebar">
    <section className="side-widget welcome-widget"><span className="mini-orbit">✦</span><Kicker>THIS WEEK IN ALTFWORLD</Kicker><h3>Make something a little more useful.</h3><p>Join a generous group of people sharing their work, questions, and hard-won notes.</p><Link href="/altfworld/about">How this community works <b>→</b></Link></section>
    <section className="side-widget"><div className="widget-heading"><h3>Trending now</h3><span>↗</span></div><ol className="trending-list">{community.threads.slice(0, 4).map((thread, index) => <li key={thread.slug}><span>{String(index + 1).padStart(2, "0")}</span><Link href={`/altfworld/forums/${thread.categorySlug}/general/${thread.slug}`}>{thread.title}</Link></li>)}</ol><Link className="widget-link" href="/altfworld/forums?view=latest">See what&apos;s new <b>→</b></Link></section>
    <section className="side-widget online-widget"><div className="widget-heading"><h3><i className="live-dot" /> In the room</h3><span>•</span></div><strong>{community.stats.online}</strong><span>mock members online now</span><p><b>892</b> mock members · <b>392</b> mock guests</p><div className="avatar-line">{community.users.slice(0, 4).map((user) => <Avatar key={user.username} initials={user.initials} tone={user.tone} />)}<Link href="/altfworld/members">+ 1,280 others</Link></div></section>
    <div className="ad-placeholder"><span>COMMUNITY PARTNER</span><strong>A space for your next good idea.</strong><small>Display-only placement</small></div>
  </aside>;
}

import dynamic from "next/dynamic";

const GoldenGlobe3D = dynamic(() => import("./GoldenGlobe3D"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "130px", width: "100%" }} />,
});

export function WireframeMeshIllustration() {
  return (
    <div className="orbit-illustration compact-mesh">
      <GoldenGlobe3D />
    </div>
  );
}

export function CompactSubHero() {
  return (
    <section className="compact-sub-hero">
      <div className="hero-grid">
        <div className="hero-sub-content">
          <Kicker>THE COMMUNITY FOR INDEPENDENT THINKERS</Kicker>
          <h1>AltfWorld — Make room for your next orbit.</h1>
          <p>A friendly place to learn out loud, share the work, and find people who understand building something meaningful.</p>
        </div>
        <WireframeMeshIllustration />
      </div>
    </section>
  );
}

export function HomeView() {
  return (
    <main className="site-shell home-main">
      <section><SectionHeading kicker="FIND YOUR PEOPLE" title="Start where your curiosity is." action={<Link className="inline-link" href="/altfworld/forums">All forums →</Link>}><p className="heading-copy">Six welcoming corners for the questions, work, and experiments you&apos;re living with right now.</p></SectionHeading><div className="category-grid">{community.categories.slice(0, 6).map((category, index) => <CategoryCard category={category} index={index} key={category.slug} />)}</div></section>
      <section className="home-two-col" id="latest"><div><SectionHeading kicker="JUST LANDED" title="Latest discussions" action={<Link className="inline-link" href="/altfworld/forums?view=latest">View all →</Link>} /><ThreadList threads={community.threads.slice(0, 4)} compact /></div><div className="home-side-stack"><section className="side-highlight"><Kicker>THE WEEKLY PROMPT</Kicker><h3>What small habit made a big difference lately?</h3><p>Share the work rhythm, tool, or perspective you&apos;d pass along to a friend.</p><Link href="/altfworld/forums/community-room">Join the conversation <b>→</b></Link></section><section className="mini-members"><div className="widget-heading"><h3>People to meet</h3><Link href="/altfworld/members">See all</Link></div>{community.users.slice(0, 3).map((user) => <Link className="person-line" href={`/altfworld/profile/${user.username}`} key={user.username}><Avatar initials={user.initials} tone={user.tone} /><span><b>{user.name}</b><small>{user.role}</small></span><i>→</i></Link>)}</section></div></section>
      <section className="market-highlight"><SectionHeading kicker="MADE BY THE COMMUNITY" title="Useful things, shared directly." action={<Link className="inline-link" href="/altfworld/marketplace">Visit marketplace →</Link>} /><div className="featured-listings">{community.listings.slice(0, 3).map((listing, index) => <ListingCard key={listing.slug} listing={listing} index={index} />)}</div></section>
      <section className="big-stat-panel"><div><Kicker>MORE THAN A FORUM</Kicker><h2>Small, generous conversations add up.</h2><p>AltfWorld is built as a practice space for independent people who want a kinder internet with more useful things in it.</p><Link href="/altfworld/about">Our community principles <b>→</b></Link></div><div className="stats-grid"><span><b>{community.stats.members}</b> mock members</span><span><b>{community.stats.threads}</b> evolving threads</span><span><b>{community.stats.categories}</b> community categories</span><span><b>{community.stats.posts}</b> virtual replies</span></div></section>
    </main>
  );
}

export function ForumsView() {
  return (
    <main className="site-shell app-page"><div className="three-column-layout"><ForumSidebar /><section className="main-stream"><SectionHeading kicker="ALL CATEGORIES" title="Find your corner" /><div className="forum-category-stack">{community.categories.slice(0, 12).map((category, index) => <CategoryCard category={category} index={index} key={category.slug} />)}</div><section className="stream-section"><SectionHeading kicker="MOST RECENT" title="Across the community" action={<span className="filter-pill">Newest ↓</span>} /><ThreadList threads={community.threads.slice(0, 12)} /></section><Pagination /></section><RightSidebar /></div></main>
  );
}

export function CategoryView({ slug }) {
  const category = community.categories.find((item) => item.slug === slug) ?? community.categories[0];
  const threads = community.threads.filter((thread) => thread.categorySlug === category.slug);
  const renderedThreads = threads.length ? threads.slice(0, 12) : community.threads.slice(0, 3);
  return (
    <main className="site-shell app-page"><div className="breadcrumbs"><Link href="/altfworld/forums">Forums</Link><span>/</span><span>{category.name}</span></div><div className="three-column-layout"><ForumSidebar active={category.slug} /><section className="main-stream"><div className="thread-toolbar"><div><b>{category.threads.toLocaleString()} threads</b><span> · {category.posts.toLocaleString()} posts</span></div><button>Newest <span>⌄</span></button></div><ThreadList threads={renderedThreads} /><Pagination /></section><RightSidebar /></div></main>
  );
}

export function SubcategoryView({ categorySlug, subcategorySlug }) {
  const category = community.categories.find((item) => item.slug === categorySlug) ?? community.categories[0];
  const subcategory = category.subcategories.find((item) => item.slug === subcategorySlug) ?? category.subcategories[0];
  const subIndex = category.subcategories.findIndex((item) => item.slug === subcategory.slug);
  const categoryThreads = community.threads.filter((thread) => thread.categorySlug === category.slug);
  const threads = categoryThreads.filter((_, index) => index % category.subcategories.length === subIndex);
  const renderedThreads = threads.length ? threads.slice(0, 12) : categoryThreads.slice(0, 3);
  return (
    <main className="site-shell app-page"><div className="breadcrumbs"><Link href="/altfworld/forums">Forums</Link><span>/</span><Link href={`/altfworld/forums/${category.slug}`}>{category.name}</Link><span>/</span><span>{subcategory.name}</span></div><div className="three-column-layout"><ForumSidebar active={category.slug} /><section className="main-stream"><div className="thread-toolbar"><div><b>{subcategory.threads.toLocaleString()} threads</b><span> · {subcategory.description}</span></div><button>Newest <span>⌄</span></button></div><ThreadList threads={renderedThreads} /><Pagination /></section><RightSidebar /></div></main>
  );
}

function Pagination() { return <nav className="pagination" aria-label="Forum pages"><button disabled>←</button><button className="active">1</button><button>2</button><button>3</button><span>…</span><button>12</button><button>→</button></nav>; }

const postBodies = [
  <><p>I&apos;ve been trying to make publishing feel less like a performance and more like a small, repeatable practice. The change that helped most was deciding that each piece only needs to do one job: clarify an idea, start a conversation, or offer a useful next step.</p><p>Here&apos;s the weekly rhythm I&apos;m using now:</p><pre><code>Monday   — collect tiny observations\nWednesday — shape one useful note\nFriday   — share, listen, and save responses</code></pre><p>It&apos;s deliberately small. The system leaves enough space to notice what people are actually responding to.</p></>,
  <><p>This is such a generous way to frame it. I also moved away from trying to create a “content engine” and started making a small library of ideas I&apos;d be happy to revisit.</p><blockquote>Each piece only needs to do one job.</blockquote><p>That line is going in my notes. Thank you for sharing the detail.</p></>,
  <><p>The observation step is the one I&apos;d skipped. I now keep a very plain running list in my phone and it makes the writing session feel much less intimidating.</p></>
];

function PostCard({ user, body, first = false, index }) {
  const [liked, setLiked] = useState(false);
  return <motion.article className="post-card" {...fadeUp} transition={{ delay: index * .06 }}><aside className="post-author"><Link href={`/altfworld/profile/${user.username}`}><Avatar initials={user.initials} tone={user.tone} large /><b>{user.name}</b><span>{user.role}</span></Link><div><small>{user.level}</small><small>{user.posts} posts</small><small>{user.country}</small></div><div className="badge-row">{user.badges.slice(0, 2).map((badge) => <i key={badge}>{badge}</i>)}</div></aside><div className="post-content"><div className="post-date">{first ? "Posted today at 10:24 AM" : "Posted today at 11:0" + index + " AM"}<span>#{index + 1}</span></div><div className="prose-content">{body}</div>{first && <div className="post-signature">“Make the work lighter, then make it visible.”</div>}<div className="post-actions"><button className={liked ? "liked" : ""} onClick={() => setLiked(!liked)}>{liked ? "♥ Liked" : "♡ Like"}</button><button>⌁ Quote</button><button>↗ Share</button><button className="end-action">•••</button></div></div></motion.article>;
}

export function ThreadView({ slug }) {
  const thread = community.threads.find((item) => item.slug === slug) ?? community.threads[0];
  const author = community.users.find((user) => user.username === thread.handle) ?? community.users[0];
  return (
    <main className="site-shell app-page thread-page"><div className="breadcrumbs"><Link href="/altfworld/forums">Forums</Link><span>/</span><Link href={`/altfworld/forums/${thread.categorySlug}`}>{thread.category}</Link><span>/</span><span>{thread.title}</span></div><div className="thread-layout"><section className="thread-column"><header className="thread-header"><div><span className="thread-tag">{thread.tag}</span>{thread.pinned && <span className="pin-label">PINNED</span>}<h1>{thread.title}</h1><p>Started by <Link href={`/altfworld/profile/${thread.handle}`}>{thread.author}</Link> · {thread.date} · <b>{thread.views.toLocaleString()} views</b></p></div><button className="save-thread">♡ Save</button></header><PostCard user={author} body={postBodies[0]} first index={0} /><PostCard user={community.users[1]} body={postBodies[1]} index={1} /><PostCard user={community.users[2]} body={postBodies[2]} index={2} /><section className="reply-disabled"><span>↳</span><div><h3>Join the conversation</h3><p>Replies are disabled in this mock, frontend-only project.</p></div><button disabled>Write a reply</button></section><section className="related-threads"><SectionHeading kicker="KEEP EXPLORING" title="Related threads" /><ThreadList threads={community.threads.filter((item) => item.slug !== thread.slug).slice(0, 3)} compact /></section></section><RightSidebar /></div></main>
  );
}

export function MembersView() {
  const [filter, setFilter] = useState("All");
  const visible = filter === "All" ? community.users : community.users.filter((user) => user.role.includes(filter) || (filter === "Makers" && user.role.includes("Founder")));
  return (
    <main className="site-shell app-page"><div className="members-toolbar"><div>{["All", "Community", "Product", "Makers", "Independent"].map((item) => <button onClick={() => setFilter(item)} className={filter === item ? "active" : ""} key={item}>{item}</button>)}</div><span>{visible.length} featured members</span></div><section className="member-grid">{visible.slice(0, 24).map((user, index) => <motion.article className="member-card" key={user.username} {...fadeUp} transition={{ delay: index * .05 }} whileHover={{ y: -4 }}><div className="member-card-top"><Avatar initials={user.initials} tone={user.tone} large /><span>{user.level}</span></div><Link href={`/altfworld/profile/${user.username}`}><h2>{user.name}</h2></Link><p className="member-role">{user.role}</p><p>{user.bio}</p><div className="member-card-stats"><span><b>{user.posts}</b> posts</span><span><b>{user.reputation}</b> reputation</span></div><div className="member-card-bottom"><span>{user.country}</span><Link href={`/altfworld/profile/${user.username}`}>View profile →</Link></div></motion.article>)}</section></main>
  );
}

export function ListingCard({ listing, index = 0 }) {
  return <motion.article className={`listing-card ${listing.accent}`} {...fadeUp} transition={{ delay: index * .05 }} whileHover={{ y: -4 }}><Link href={`/altfworld/marketplace?item=${listing.slug}`}><div className="listing-art"><span>{listing.category}</span><i>{listing.title.split(" ").slice(0, 2).map((item) => item[0]).join("")}</i><em>✦</em></div><div className="listing-info"><div><span className="listing-tag">{listing.tag}</span><span className="rating">★ {listing.rating}</span></div><h3>{listing.title}</h3><p>{listing.description}</p><div className="listing-bottom"><span>by {listing.seller}</span><b>{listing.price}</b></div></div></Link></motion.article>;
}

export function MarketplaceView() {
  const [type, setType] = useState("All");
  const [query, setQuery] = useState("");
  const listings = useMemo(() => community.listings.filter((item) => (type === "All" || item.category === type) && item.title.toLowerCase().includes(query.toLowerCase())), [type, query]);
  return (
    <main className="site-shell app-page"><section className="market-layout"><aside className="market-filter"><p className="side-label">BROWSE BY TYPE</p>{["All", "Templates", "Services", "Strategy"].map((item) => <button key={item} className={type === item ? "side-active" : ""} onClick={() => setType(item)}>{item}<span>{item === "All" ? community.listings.length : community.listings.filter((listing) => listing.category === item).length}</span></button>)}<p className="side-label push-label">QUICK FILTERS</p><button>✓ Verified sellers</button><button>New this week</button><button>Top rated</button><div className="seller-callout"><span>✦</span><b>Share something useful</b><p>Marketplace publishing is display-only in this demo.</p></div></aside><section><div className="market-result-line"><b>{listings.length} listings</b><button>Sort: Featured ⌄</button></div><div className="listing-grid">{listings.slice(0, 12).map((listing, index) => <ListingCard listing={listing} index={index} key={listing.slug} />)}</div>{!listings.length && <div className="empty-state">No mock listings match that search.</div>}</section></section></main>
  );
}

export function ResourcesView() {
  const [active, setActive] = useState("All");
  const entries = active === "All" ? community.resources : community.resources.filter((entry) => entry.type === active);
  return (
    <main className="site-shell app-page resources-page"><div className="resource-tabs">{["All", "Guide", "Template", "Essay"].map((type) => <button className={active === type ? "active" : ""} onClick={() => setActive(type)} key={type}>{type}</button>)}</div><section className="resources-layout"><div className="resource-list">{entries.slice(0, 12).map((entry, index) => <motion.article key={`res-${entry.type}-${index}`} className="resource-card" {...fadeUp} transition={{ delay: index * .06 }}><div className="resource-symbol">{entry.type === "Guide" ? "↗" : entry.type === "Template" ? "⌘" : "✦"}</div><div><div className="resource-meta"><span>{entry.type}</span><span>{entry.category}</span><span>{entry.minutes}</span></div><h2>{entry.title}</h2><p>{entry.description}</p><button>Open resource <b>→</b></button></div></motion.article>)}</div><aside className="reading-card"><Kicker>A KINDER LIBRARY</Kicker><h2>Keep your own field notes.</h2><p>Save the ideas you&apos;re returning to. This display-only concept hints at a future personal library.</p><button disabled>♡ Save a resource</button><div><span>18</span><p>notes waiting for your next good question</p></div></aside></section></main>
  );
}

export function SearchView() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("Everything");
  const results = useMemo(() => { const term = query.toLowerCase(); if (!term) return []; return community.threads.filter((thread) => thread.title.toLowerCase().includes(term) || thread.excerpt.toLowerCase().includes(term)).filter((thread) => scope === "Everything" || scope === "Threads"); }, [query, scope]);
  return (
    <main className="site-shell app-page search-page"><div className="search-layout"><aside className="search-filters"><p className="side-label">SEARCH IN</p>{["Everything", "Threads", "Members", "Marketplace", "Resources"].map((item) => <button key={item} onClick={() => setScope(item)} className={scope === item ? "side-active" : ""}>{item}</button>)}</aside><section className="search-results">{query ? <><p className="results-count">{results.length} thread results for <b>“{query}”</b></p>{results.length ? <ThreadList threads={results.slice(0, 12)} /> : <div className="empty-state">Nothing in the mock forum matches that phrase. Try one of the suggestions above.</div>}</> : <div className="search-placeholder"><span>⌕</span><h2>Search the room</h2><p>Start with a question, an idea, or someone you&apos;d like to learn from.</p></div>}</section></div></main>
  );
}

export function ProfileView({ username }) {
  const fallback = { username: "guest", name: "Guest Explorer", initials: "GE", tone: "blue", role: "Curious visitor", level: "Orbit 0", posts: 0, reputation: 0, country: "Everywhere", joined: "Joined recently", bio: "You are viewing this frontend-only community project as a guest. Explore freely — nothing is saved.", badges: ["Explorer"] };
  const user = community.users.find((item) => item.username === username) ?? fallback;
  const userThreads = community.threads.filter((thread) => thread.handle === user.username);
  const [tab, setTab] = useState("Overview");
  return (
    <main className="site-shell app-page profile-page"><section className="profile-heading"><Avatar initials={user.initials} tone={user.tone} large /><div><p className="section-kicker">{user.level}</p><h1>{user.name}</h1><p>{user.role} · {user.country}</p></div><button className="profile-follow">♡ Follow <small>mock</small></button></section><div className="profile-tabs">{["Overview", "Threads", "Posts", "Marketplace"].map((item) => <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>{item}</button>)}</div><section className="profile-layout"><div className="profile-main">{tab === "Overview" && <><section className="about-user"><Kicker>ABOUT</Kicker><p>{user.bio}</p><div>{user.badges.map((badge) => <span key={badge}>✦ {badge}</span>)}</div></section><SectionHeading kicker="RECENTLY SHARED" title={`Notes from ${user.name.split(" ")[0]}`} />{userThreads.length ? <ThreadList threads={userThreads} compact /> : <div className="empty-state">This guest profile has not shared any threads yet.</div>}</>}{tab !== "Overview" && <div className="empty-state">{tab} are shown as a display-only placeholder in this mock profile.</div>}</div><aside className="profile-aside"><Kicker>MEMBER DETAILS</Kicker><div><span>Joined</span><b>{user.joined}</b></div><div><span>Posts</span><b>{user.posts}</b></div><div><span>Reputation</span><b>{user.reputation}</b></div><div><span>Location</span><b>{user.country}</b></div><button>••• More options</button></aside></section></main>
  );
}

export function AboutView() {
  const [sent, setSent] = useState(false);
  function submit(event) { event.preventDefault(); setSent(true); }
  return (
    <main className="site-shell app-page about-page"><section className="principles-grid">{[["01", "Curiosity over noise", "Make space for questions that are still becoming clear."], ["02", "Useful over urgent", "Treat attention like a resource worth caring for."], ["03", "People over metrics", "Let numbers guide the work, never flatten the people doing it."], ["04", "Learning in public", "Share the imperfect middle, not only the polished ending."]].map(([number, title, copy]) => <article key={number}><span>{number}</span><h2>{title}</h2><p>{copy}</p></article>)}</section><section className="about-split"><div><Kicker>WHAT&apos;S INCLUDED</Kicker><h2>A full route map, built around mock data.</h2><ul><li>Forum categories, thread lists, and detailed discussion posts</li><li>Member directories and profile states</li><li>Marketplace listings and reading resources</li><li>Search, theme controls, responsive navigation, and subtle motion</li></ul></div><div className="about-contact"><Kicker>PROJECT NOTE</Kicker><h2>Keep exploring.</h2><p>This form doesn&apos;t send anything — it just demonstrates a friendly feedback state.</p>{sent ? <div className="sent-message">✓ Thanks for the note. This mock interface received it.</div> : <form onSubmit={submit}><input required placeholder="Your name" /><textarea required placeholder="A thoughtful note" /><button className="primary-action">Send mock note →</button></form>}</div></section></main>
  );
}
