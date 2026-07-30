"use client";

import { useState, useSyncExternalStore } from "react";
import { Megaphone } from "lucide-react";
import Header from "./Header";
import KymAdBanner, { kymBanners } from "./KymAdBanner";
import KymComments from "./KymComments";
import { contentGroups } from "./KymGenericPage";
import { articleSidebar } from "../data/articleData";
import { pollComments, pollOptions, pollPage } from "../data/pollData";
import { slugifyTitle } from "../data/slug";

const POLL_STORAGE_KEY = "kym-poll:meme-of-the-month-may-2026";
const POLL_STORAGE_EVENT = "kym-poll-selection";

function subscribeToSavedPick(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(POLL_STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(POLL_STORAGE_EVENT, callback);
  };
}

function getSavedPickSnapshot() {
  try {
    return window.localStorage.getItem(POLL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function getServerPickSnapshot() {
  return null;
}

function getRelatedHref(title, fallback = "/kym/weekly-meme-roundup") {
  const normalizedTitle = slugifyTitle(title);
  const item = contentGroups.find((entry) => {
    const normalizedEntry = slugifyTitle(entry.title);
    return (
      normalizedEntry === normalizedTitle ||
      normalizedEntry.includes(normalizedTitle) ||
      normalizedTitle.includes(normalizedEntry)
    );
  });

  return item
    ? item.href || `/kym/${slugifyTitle(item.title)}`
    : fallback;
}

function PollOption({ option, onSelect, selectedId }) {
  return (
    <label className={`kym-poll-option${selectedId === option.id ? " is-selected" : ""}`}>
      <input
        checked={selectedId === option.id}
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

function PollSidebar() {
  return (
    <aside className="kym-article-sidebar kym-poll-sidebar">
      <section>
        <h2>Related Entries</h2>
        <div className="kym-article-side-grid">
          {articleSidebar.map((item) => (
            <a href={getRelatedHref(item.title)} key={item.title}>
              <img src={item.image.src} alt="" />
              <strong>{item.title}</strong>
            </a>
          ))}
        </div>
      </section>
      {/*
        A "Poll Info" panel used to claim a voting window, one vote per user
        account and results updating "after moderation review". There are no
        accounts, no window and no moderation behind this poll. Removed.
      */}
      <div className="kym-sidebar-banners" aria-label="Sponsored banner">
        <KymAdBanner src={kymBanners.sidebarTall} variant="vertical" />
      </div>
    </aside>
  );
}

export default function KymPollPage() {
  const storedValue = useSyncExternalStore(
    subscribeToSavedPick,
    getSavedPickSnapshot,
    getServerPickSnapshot,
  );
  const storedId = Number(storedValue);
  const storedOption = pollOptions.find((option) => option.id === storedId);
  const [draftId, setDraftId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [shareLabel, setShareLabel] = useState("Share");
  const selectedId = draftId ?? storedOption?.id ?? null;
  const saved = draftId === null && Boolean(storedOption);
  const voteMessage =
    feedback ||
    (saved
      ? `${storedOption.title} is saved as your local pick. It was not sent or tallied.`
      : "");

  const handleSelect = (id) => {
    setDraftId(id);
    setFeedback("");
  };

  const handleSave = () => {
    if (!selectedId) {
      setFeedback("Please select a meme before saving your pick.");
      return;
    }

    try {
      window.localStorage.setItem(POLL_STORAGE_KEY, String(selectedId));
      window.dispatchEvent(new Event(POLL_STORAGE_EVENT));
      setDraftId(null);
      setFeedback("");
    } catch {
      setFeedback(
        "Your browser blocked local storage, so this pick could not be saved.",
      );
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: pollPage.title, url });
        return;
      } catch (error) {
        if (error?.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareLabel("Link copied");
    } catch {
      window.prompt("Copy this poll link:", url);
    }
  };

  return (
    <div className="kym-page kym-article-page kym-poll-page">
      <Header compact />
      <div className="kym-alert kym-poll-alert kym-reveal" role="status">
        <Megaphone size={16} strokeWidth={2.25} aria-hidden="true" />
        <span>Choose Your Pick For May 2026&apos;s Meme Of The Month</span>
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
            <button onClick={handleShare} type="button">
              {shareLabel}
            </button>
          </div>
          <p className="kym-article-lede">{pollPage.intro}</p>

          <section className="kym-poll-box" aria-labelledby="poll-heading">
            <h2 id="poll-heading">Choose Your Meme Of The Month</h2>
            <div className="kym-poll-options">
              {pollOptions.map((option) => (
                <PollOption
                  option={option}
                  key={option.title}
                  onSelect={handleSelect}
                  selectedId={selectedId}
                />
              ))}
            </div>
            <div className="kym-poll-actions">
              <button disabled={saved} onClick={handleSave} type="button">
                {saved ? "Saved locally" : "Save my pick"}
              </button>
            </div>
            <p className="kym-poll-note">
              This archived poll stores your pick only in this browser. It does
              not submit or tally votes, so no results are published.
            </p>
            {voteMessage ? (
              <p
                aria-live="polite"
                className={`kym-poll-message${saved ? " is-success" : ""}`}
              >
                {voteMessage}
              </p>
            ) : null}
          </section>

          <section className="kym-poll-related">
            <h2>More May 2026 Meme Coverage</h2>
            <div className="kym-poll-related-grid">
              {pollOptions.slice(1, 5).map((option) => (
                <a href={getRelatedHref(option.title)} key={option.title}>
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
