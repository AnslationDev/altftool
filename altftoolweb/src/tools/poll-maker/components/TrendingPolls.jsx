"use client";

import { Flame, MessageCircle, BarChart3 } from "lucide-react";

export default function TrendingPolls() {
  // Dummy data (frontend only)
  const trending = [
    {
      id: 1,
      question: "Best Smartphone Brand?",
      votes: 120,
      comments: 25,
    },
    {
      id: 2,
      question: "Favorite Fast Food?",
      votes: 95,
      comments: 40,
    },
  ];

  // 🔥 Find Most Voted
  const mostVoted = trending.reduce((prev, curr) =>
    curr.votes > prev.votes ? curr : prev
  );

  // 💬 Find Most Discussed
  const mostDiscussed = trending.reduce((prev, curr) =>
    curr.comments > prev.comments ? curr : prev
  );

  return (
    <div className="mt-10 space-y-6">
      {/* Title */}
      <h2 className="text-xl font-semibold text-(--foreground) flex items-center gap-2">
        <Flame className="text-orange-500" /> Trending Polls
      </h2>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* 🔥 Most Voted */}
        <div className="p-4 rounded-xl bg-(--card) border border-(--border) hover:shadow-md transition">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="text-green-500" size={18} />
            <span className="text-sm font-medium text-(--muted-foreground)">
              Most Voted
            </span>
          </div>

          <p className="font-semibold text-(--foreground)">
            {mostVoted.question}
          </p>

          <p className="text-sm text-(--muted-foreground) mt-1">
            {mostVoted.votes} votes
          </p>
        </div>

        {/* 💬 Most Discussed */}
        <div className="p-4 rounded-xl bg-(--card) border border-(--border) hover:shadow-md transition">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="text-blue-500" size={18} />
            <span className="text-sm font-medium text-(--muted-foreground)">
              Most Discussed
            </span>
          </div>

          <p className="font-semibold text-(--foreground)">
            {mostDiscussed.question}
          </p>

          <p className="text-sm text-(--muted-foreground) mt-1">
            {mostDiscussed.comments} comments
          </p>
        </div>

      </div>
    </div>
  );
}