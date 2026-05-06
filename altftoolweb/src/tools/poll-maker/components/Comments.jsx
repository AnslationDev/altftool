"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, Heart, Laugh } from "lucide-react";

const loadComments = () => {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem("poll_comments");
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export default function Comments() {
  const [comments, setComments] = useState(loadComments);
  const [input, setInput] = useState("");

  //  Save to localStorage
  useEffect(() => {
    localStorage.setItem("poll_comments", JSON.stringify(comments));
  }, [comments]);

  // Add comment
  const addComment = () => {
    if (!input.trim()) return;

    const newComment = {
      id: Date.now(),
      text: input,
      reactions: { like: 0, love: 0, laugh: 0 },
    };

    setComments([newComment, ...comments]);
    setInput("");
  };

  // React to comment
  const addReaction = (id, type) => {
    const updated = comments.map((c) =>
      c.id === id
        ? {
            ...c,
            reactions: {
              ...c.reactions,
              [type]: c.reactions[type] + 1,
            },
          }
        : c,
    );

    setComments(updated);
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Title */}
      <h3 className="text-lg font-semibold text-(--foreground)">
        Comments
      </h3>

      {/* Input */}
      <div className="flex flex-col sm:flex-row  gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-4 py-2 rounded-xl bg-(--background) border border-(--border) outline-none focus:ring-2 focus:ring-(--primary)"
        />
        <button
          onClick={addComment}
          className=" w-full sm:w-auto px-4 py-2 rounded-xl bg-(--primary) text-white hover:opacity-90 transition"
        >
          Post
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-xl bg-(--card) border border-(--border)"
          >
            <p className="text-(--foreground)">{c.text}</p>

            {/* Reactions */}
            <div className="flex gap-4 mt-3">
              <button
                onClick={() => addReaction(c.id, "like")}
                className="flex items-center gap-1 text-sm text-blue-500"
              >
                <ThumbsUp size={16} /> {c.reactions.like}
              </button>

              <button
                onClick={() => addReaction(c.id, "love")}
                className="flex items-center gap-1 text-sm text-red-500"
              >
                <Heart size={16} /> {c.reactions.love}
              </button>

              <button
                onClick={() => addReaction(c.id, "laugh")}
                className="flex items-center gap-1 text-sm text-yellow-500"
              >
                <Laugh size={16} /> {c.reactions.laugh}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
