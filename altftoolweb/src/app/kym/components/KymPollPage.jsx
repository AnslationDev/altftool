"use client";

import { useEffect, useRef, useState } from "react";
import { Megaphone } from "lucide-react";
import Header from "./Header";
import KymAdBanner, { kymBanners } from "./KymAdBanner";
import KymComments from "./KymComments";
import { contentGroups } from "./KymGenericPage";
import { pollOptions, pollPage } from "../data/pollData";
import { slugifyTitle } from "../data/slug";

const POLL_ENTRY_TITLE_OVERRIDES = {
  "Will Levis And Gia Duddy": "Will Levis And Gia Duddy Video",
};

function relatedEntryHref(title) {
  return `/kym/${slugifyTitle(POLL_ENTRY_TITLE_OVERRIDES[title] || title)}`;
}

function PollOption({ option, onSelect, selectedId, submitted }) {
  return (
    <label className={`kym-poll-option${selectedId === option.id ? " is-selected" : ""}`}>
      <input
        checked={selectedId === option.id}
        disabled={submitted}
        name="meme-of-the-month"
        onChange={() => onSelect(option.id)}
        type="radio"
      />
      <img src={option.image.src} alt="" />
      <span>
        <strong>{option.title}</strong>
      </span>
    </label>
  );
}

function PollSidebar({ currentTitle }) {
  const related = contentGroups.filter((entry) => entry.title !== currentTitle).slice(0, 4);

  return (
    <aside className="kym-article-sidebar kym-poll-sidebar">
      <section>
        <h2>Related Entries</h2>
        <div className="kym-article-side-grid">
          {related.map((entry) => (
            <a href={entry.href || `/kym/${slugifyTitle(entry.title)}`} key={entry.title}>
              <img src={entry.image.src} alt="" />
              <strong>{entry.title}</strong>
            </a>
          ))}
        </div>
      </section>
      <section>
        <h2>Poll Info</h2>
        <div className="kym-poll-facts">
          <p>Voting window: May 29 - June 5</p>
          <p>Your vote is saved on this device only</p>
        </div>
      </section>
      <div className="kym-sidebar-banners" aria-label="Sponsored banner">
        <KymAdBanner src={kymBanners.sidebarTall} variant="vertical" />
      </div>
    </aside>
  );
}

const POLL_STORAGE_KEY = "kym-poll-vote:meme-of-the-month-may-2026";

export default function KymPollPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [voteMessage, setVoteMessage] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const shareCopyTimer = useRef(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(POLL_STORAGE_KEY);

      if (saved) {
        setSelectedId(saved);
        setSubmitted(true);
        setVoteMessage("Your vote is saved on this device. Thank you!");
      }
    } catch {
      // localStorage unavailable; poll still works for the current session
    }
  }, []);

  const handleVote = () => {
    if (!selectedId) {
      setVoteMessage("Please select a meme before voting.");
      return;
    }

    try {
      window.localStorage.setItem(POLL_STORAGE_KEY, selectedId);
    } catch {
      // ignore storage errors, vote still counts for this session
    }

    setSubmitted(true);
    setVoteMessage("Your vote has been submitted. Thank you!");
  };

  const handleShare = async (e) => {
    e.preventDefault();
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      window.prompt("Copy this link:", shareUrl);
      return;
    }

    clearTimeout(shareCopyTimer.current);
    setShareCopied(true);
    shareCopyTimer.current = setTimeout(() => setShareCopied(false), 1600);
  };

  return (
    <div className="kym-page kym-article-page kym-poll-page">
      <Header compact />
      <div className="kym-alert kym-poll-alert kym-reveal" role="status">
        <Megaphone size={16} strokeWidth={2.25} aria-hidden="true" />
        <span>Cast Your Vote For May 2026&apos;s Meme Of The Month!</span>
      </div>
      <main className="kym-article-shell">
        <article className="kym-article kym-poll-article">
          <p className="kym-article-kicker">{pollPage.category}</p>
          <h1>{pollPage.title}</h1>
          <img className="kym-article-hero" src={pollPage.heroImage.src} alt="" />
          <div className="kym-article-meta">
            <span>By {pollPage.author}</span>
            <span>{pollPage.date}</span>
            <a href="#comments">Comments</a>
            <button type="button" onClick={handleShare}>{shareCopied ? "Copied!" : "Share"}</button>
          </div>
          <p className="kym-article-lede">{pollPage.intro}</p>

          <section className="kym-poll-box" aria-labelledby="poll-heading">
            <h2 id="poll-heading">Cast Your Vote For Meme Of The Month</h2>
            <div className="kym-poll-options">
              {pollOptions.map((option) => (
                <PollOption
                  option={option}
                  key={option.title}
                  onSelect={setSelectedId}
                  selectedId={selectedId}
                  submitted={submitted}
                />
              ))}
            </div>
            <div className="kym-poll-actions">
              <button disabled={submitted} onClick={handleVote} type="button">
                {submitted ? "Submitted" : "Vote"}
              </button>
              <a href="#poll-heading">View Results</a>
            </div>
            {voteMessage ? (
              <p className={`kym-poll-message${submitted ? " is-success" : ""}`}>
                {voteMessage}
              </p>
            ) : null}
          </section>

          <section className="kym-poll-related">
            <h2>More May 2026 Meme Coverage</h2>
            <div className="kym-poll-related-grid">
              {pollOptions.slice(1, 5).map((option) => (
                <a href={relatedEntryHref(option.title)} key={option.title}>
                  <img src={option.image.src} alt="" />
                  <strong>{option.title}</strong>
                </a>
              ))}
            </div>
          </section>

          <KymComments storageKey="kym-comments:meme-of-the-month-may-2026" />
        </article>
        <PollSidebar currentTitle={pollPage.title} />
      </main>
    </div>
  );
}
