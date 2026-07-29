"use client";

export default function Home({ listCount = 0, rankedCount = 0 }) {
  return (
    <main className="top9-page min-h-screen">
      <Hero listCount={listCount} rankedCount={rankedCount} />
      <ContentArea />
      <FeaturedList />
    </main>
  );
}
