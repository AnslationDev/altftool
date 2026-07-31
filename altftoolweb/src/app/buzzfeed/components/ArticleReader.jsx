"use client";

import React, { useState, useEffect } from "react";
import { X, Bookmark, Share2, Facebook, Twitter, Link2, Send, Heart, User, Clock } from "lucide-react";

export default function ArticleReader({ article, onClose, bookmarks, onToggleBookmark }) {
  const [reactions, setReactions] = useState(article.reactions || {});
  const [userVotedReaction, setUserVotedReaction] = useState(null);
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [shareCopied, setShareCopied] = useState(false);

  const isBookmarked = bookmarks.some((b) => b.id === article.id);

  // Load reactions & comments from localStorage
  useEffect(() => {
    if (!article) return;

    // Load reactions
    const storedReactions = localStorage.getItem(`bf-reactions-${article.id}`);
    if (storedReactions) {
      setReactions(JSON.parse(storedReactions));
    } else {
      setReactions(article.reactions || {});
    }

    const storedUserVote = localStorage.getItem(`bf-uservote-${article.id}`);
    if (storedUserVote) {
      setUserVotedReaction(storedUserVote);
    } else {
      setUserVotedReaction(null);
    }

    // Load comments
    const storedComments = localStorage.getItem(`bf-comments-${article.id}`);
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    } else {
      setComments([]);
    }
  }, [article]);

  // Handle reaction clicking
  const handleReactionClick = (type, emoji) => {
    const isVoted = userVotedReaction === type;
    let updatedReactions = { ...reactions };

    if (isVoted) {
      // Remove vote
      updatedReactions[type] = Math.max(0, (updatedReactions[type] || 0) - 1);
      setUserVotedReaction(null);
      localStorage.removeItem(`bf-uservote-${article.id}`);
    } else {
      // Add vote (and subtract old vote if any)
      if (userVotedReaction) {
        updatedReactions[userVotedReaction] = Math.max(0, (updatedReactions[userVotedReaction] || 0) - 1);
      }
      updatedReactions[type] = (updatedReactions[type] || 0) + 1;
      setUserVotedReaction(type);
      localStorage.setItem(`bf-uservote-${article.id}`, type);

      // Trigger floating emoji animation!
      triggerFloatingEmoji(emoji);
    }

    setReactions(updatedReactions);
    localStorage.setItem(`bf-reactions-${article.id}`, JSON.stringify(updatedReactions));
  };

  const triggerFloatingEmoji = (emoji) => {
    const newEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      left: Math.floor(Math.random() * 60) + 20, // Random percentage offset
    };
    setFloatingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== newEmoji.id));
    }, 1000);
  };

  // Add comments
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;

    const newComment = {
      id: Date.now(),
      name: newCommentName.trim(),
      text: newCommentText.trim(),
      votes: 0,
      date: "Just now"
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    localStorage.setItem(`bf-comments-${article.id}`, JSON.stringify(updatedComments));

    setNewCommentName("");
    setNewCommentText("");
  };

  // Upvote comment
  const handleUpvoteComment = (commentId) => {
    const updated = comments.map((c) => {
      if (c.id === commentId) {
        return { ...c, votes: c.votes + 1 };
      }
      return c;
    });
    setComments(updated);
    localStorage.setItem(`bf-comments-${article.id}`, JSON.stringify(updated));
  };

  // Delete comment
  const handleDeleteComment = (commentId) => {
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);
    localStorage.setItem(`bf-comments-${article.id}`, JSON.stringify(updated));
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const openShareWindow = (shareUrl) => {
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=520");
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article.title);
    openShareWindow(`https://twitter.com/intent/tweet?url=${url}&text=${text}`);
  };

  const reactionConfigs = [
    { type: "lol", label: "LOL", emoji: "😂" },
    { type: "omg", label: "OMG", emoji: "😲" },
    { type: "win", label: "WIN", emoji: "🏆" },
    { type: "fail", label: "FAIL", emoji: "🤦" },
    { type: "cute", label: "CUTE", emoji: "🥺" },
    { type: "trashy", label: "TRASH", emoji: "🗑️" }
  ];

  return (
    <div className="bf-reader-overlay">
      <div className="bf-reader-backdrop" onClick={onClose} />
      <div className="bf-reader-container">

        {/* Floating Emojis Container */}
        <div className="bf-floating-emojis-container">
          {floatingEmojis.map((item) => (
            <span
              key={item.id}
              className="bf-floating-emoji"
              style={{ left: `${item.left}%` }}
            >
              {item.emoji}
            </span>
          ))}
        </div>

        {/* Floating Toolbar */}
        <div className="bf-reader-actions-bar">
          <button
            className={`bf-reader-action-btn ${isBookmarked ? "active" : ""}`}
            onClick={() => onToggleBookmark(article)}
            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
          >
            <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
          <button className="bf-reader-action-btn bf-close" onClick={onClose} title="Close Article">
            <X size={22} />
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="bf-reader-content-wrap">
          <span className={`bf-category-badge bf-badge-${article.category.toLowerCase()}`}>
            {article.category}
          </span>

          <h1 className="bf-reader-title">{article.title}</h1>
          <p className="bf-reader-excerpt">{article.excerpt}</p>

          <div className="bf-reader-meta">
            <div className="bf-meta-author-wrap">
              <div className="bf-meta-avatar">
                <User size={18} />
              </div>
              <div className="bf-meta-author-details">
                <span className="bf-meta-name">{article.author}</span>
                <span className="bf-meta-date-sub">{article.date} • {article.readTime} read</span>
              </div>
            </div>
          </div>

          <div className="bf-reader-image-container">
            <img src={article.image} alt={article.title} className="bf-reader-main-img" />
          </div>

          {/* HTML Render Body */}
          <div
            className="bf-reader-body-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <hr className="bf-divider" />

          {/* Sharing Section */}
          <div className="bf-share-section">
            <h4>SHARE THIS ARTICLE</h4>
            <div className="bf-share-buttons">
              <button className="bf-share-btn bf-fb" onClick={shareOnFacebook} title="Share on Facebook">
                <Facebook size={18} />
                <span>Facebook</span>
              </button>
              <button className="bf-share-btn bf-tw" onClick={shareOnTwitter} title="Share on Twitter">
                <Twitter size={18} />
                <span>Twitter</span>
              </button>
              <button className="bf-share-btn bf-copy" onClick={copyShareLink} title="Copy Link">
                <Link2 size={18} />
                <span>{shareCopied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          <hr className="bf-divider" />

          {/* Reactions Dashboard */}
          <div className="bf-reactions-section">
            <h4>WHAT IS YOUR REACTION?</h4>
            <div className="bf-reactions-grid">
              {reactionConfigs.map((cfg) => {
                const count = reactions[cfg.type] || 0;
                const isSelected = userVotedReaction === cfg.type;

                return (
                  <button
                    key={cfg.type}
                    className={`bf-reaction-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => handleReactionClick(cfg.type, cfg.emoji)}
                  >
                    <span className="bf-reaction-emoji">{cfg.emoji}</span>
                    <span className="bf-reaction-label">{cfg.label}</span>
                    <span className="bf-reaction-count">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="bf-divider" />

          {/* Comments Section */}
          <div className="bf-comments-section">
            <h3>Comments ({comments.length})</h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="bf-comment-form">
              <div className="bf-comment-form-row">
                <input
                  type="text"
                  placeholder="Your name..."
                  value={newCommentName}
                  onChange={(e) => setNewCommentName(e.target.value)}
                  className="bf-comment-input-name"
                  required
                />
              </div>
              <div className="bf-comment-form-row">
                <textarea
                  placeholder="Add to the discussion..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="bf-comment-input-text"
                  rows={3}
                  required
                />
              </div>
              <button type="submit" className="bf-comment-submit-btn">
                <Send size={16} />
                Post Comment
              </button>
            </form>

            {/* Comments List */}
            <div className="bf-comments-list">
              {comments.length === 0 ? (
                <p className="bf-no-comments">Be the first to share your thoughts!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bf-comment-item">
                    <div className="bf-comment-header">
                      <span className="bf-comment-user">{comment.name}</span>
                      <span className="bf-comment-date">{comment.date}</span>
                    </div>
                    <p className="bf-comment-text">{comment.text}</p>
                    <div className="bf-comment-footer">
                      <button
                        className="bf-comment-vote-btn"
                        onClick={() => handleUpvoteComment(comment.id)}
                      >
                        <Heart size={14} className="bf-vote-icon" />
                        <span>{comment.votes} Upvotes</span>
                      </button>

                      {/* Allow user to delete their comment (simplistic client-side check) */}
                      {comment.date === "Just now" && (
                        <button
                          className="bf-comment-delete-btn"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
