"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

const EMPTY_COMMENTS = [];

function CommentRow({ comment }) {
  return (
    <div className="kym-comment-row">
      <div aria-hidden="true">{comment.name.slice(0, 1)}</div>
      <p>
        <strong>{comment.name}</strong>
        {comment.text}
      </p>
    </div>
  );
}

export default function KymComments({ initialComments = EMPTY_COMMENTS, storageKey = "kym-comments" }) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setIsReady(true);

    const saved = window.localStorage.getItem(storageKey);

    if (saved) {
      try {
        setComments([...initialComments, ...JSON.parse(saved)]);
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }
  }, [initialComments, storageKey]);

  function handleSubmit(event) {
    event.preventDefault();

    const cleanText = commentText.trim();

    if (!cleanText) {
      setMessage("Please write a comment before posting.");
      return;
    }

    const newComment = {
      name: "You",
      text: cleanText,
      id: `${Date.now()}-${cleanText}`,
    };
    const userComments = [...comments.filter((comment) => comment.name === "You"), newComment];

    window.localStorage.setItem(storageKey, JSON.stringify(userComments));
    setComments((current) => [...current, newComment]);
    setCommentText("");
    setMessage("Your post is posted.");
  }

  return (
    <section className="kym-comments" id="comments">
      <h2>
        <MessageCircle size={18} />
        Comments
      </h2>
      <form className="kym-comment-form" onSubmit={handleSubmit}>
        <input
          disabled={!isReady}
          placeholder="Write a comment..."
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
        />
        <button type="button" disabled={!isReady} onClick={handleSubmit}>
          Post
        </button>
      </form>
      {message ? <p className="kym-comment-message">{message}</p> : null}
      {comments.map((comment, index) => (
        <CommentRow comment={comment} key={comment.id || `${comment.name}-${index}`} />
      ))}
    </section>
  );
}
