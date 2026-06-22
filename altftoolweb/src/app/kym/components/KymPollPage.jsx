"use client";

import { useState } from "react";
import Header from "./Header";
import KymAdBanner, { kymBanners } from "./KymAdBanner";
import KymComments from "./KymComments";
import { articleSidebar } from "../data/articleData";
import { pollComments, pollOptions, pollPage } from "../data/pollData";

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
        <small>{option.votes}% of sample votes</small>
      </span>
    </label>
  );
}

function PollSidebar() {
  return (
    <aside className="kym-article-sidebar kym-poll-sidebar">
      <section>
        <h2>Related Entries</h2>
        <div className="kym-article-side-grid">
          {articleSidebar.map((item) => (
            <a href="#" key={item.title}>
              <img src={item.image.src} alt="" />
              <strong>{item.title}</strong>
            </a>
          ))}
        </div>
      </section>
      <section>
        <h2>Poll Info</h2>
        <div className="kym-poll-facts">
          <p>Voting window: May 29 - June 5</p>
          <p>One vote per user account</p>
          <p>Results update after moderation review</p>
        </div>
      </section>
      <div className="kym-sidebar-banners" aria-label="Sponsored banner">
        <KymAdBanner src={kymBanners.sidebarTall} variant="vertical" />
      </div>
    </aside>
  );
}

export default function KymPollPage() {
  const [selectedId, setSelectedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [voteMessage, setVoteMessage] = useState("");

  const handleVote = () => {
    if (!selectedId) {
      setVoteMessage("Please select a meme before voting.");
      return;
    }

    setSubmitted(true);
    setVoteMessage("Your vote has been submitted. Thank you!");
  };

  return (
    <div className="kym-page kym-article-page kym-poll-page">
      <Header compact />
      <div className="kym-alert kym-poll-alert">
        Cast Your Vote For May 2026's Meme Of The Month!
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
            <a href="#">Share</a>
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
              <a href="#">View Results</a>
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
                <a href="#" key={option.title}>
                  <img src={option.image.src} alt="" />
                  <strong>{option.title}</strong>
                </a>
              ))}
            </div>
          </section>

          <KymComments
            initialComments={pollComments}
            storageKey="kym-comments:meme-of-the-month-may-2026"
          />
        </article>
        <PollSidebar />
      </main>
    </div>
  );
}
