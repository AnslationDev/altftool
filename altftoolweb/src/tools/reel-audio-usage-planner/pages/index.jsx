"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Music, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  ACCOUNT_TYPES,
  AUDIO_SOURCES,
  DEFAULT_ROTATION_WINDOW,
  PLATFORMS,
  planAudioUsage,
  RISK_LEVELS,
  toPlanText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const SMALL_LABEL = "block text-xs font-semibold text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STARTER_POSTS = [
  { id: 1, platform: "reels", trackName: "Chart hit of the week", audioSource: "trending", durationSeconds: "28", willBoost: true, licenseId: "" },
  { id: 2, platform: "reels", trackName: "Warm Light (library)", audioSource: "commercial", durationSeconds: "35", willBoost: false, licenseId: "" },
  { id: 3, platform: "tiktok", trackName: "Founder voiceover take 2", audioSource: "original", durationSeconds: "52", willBoost: false, licenseId: "" },
  { id: 4, platform: "shorts", trackName: "Uplift Bed 03", audioSource: "licensed", durationSeconds: "44", willBoost: true, licenseId: "" },
];

const DASH = "—";

const RISK_STYLES = {
  [RISK_LEVELS.clear]: "text-[var(--success)]",
  [RISK_LEVELS.caution]: "text-[var(--foreground)]",
  [RISK_LEVELS.high]: "text-[var(--danger)]",
};

const RISK_WORDS = {
  [RISK_LEVELS.clear]: "Cleared",
  [RISK_LEVELS.caution]: "Check",
  [RISK_LEVELS.high]: "Do not post",
};

export default function ToolHome() {
  const [accountType, setAccountType] = useState("business");
  const [rotationWindow, setRotationWindow] = useState(String(DEFAULT_ROTATION_WINDOW));
  const [posts, setPosts] = useState(STARTER_POSTS);
  const [nextId, setNextId] = useState(STARTER_POSTS.length + 1);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planAudioUsage({
        accountType,
        rotationWindow: Number(rotationWindow),
        posts: posts.map((post) => ({
          platform: post.platform,
          trackName: post.trackName,
          audioSource: post.audioSource,
          durationSeconds: Number(post.durationSeconds),
          willBoost: post.willBoost,
          licenseId: post.licenseId,
        })),
      }),
    [accountType, rotationWindow, posts],
  );

  const hasError = Boolean(result.error);

  const updatePost = (id, patch) => {
    setPosts((current) => current.map((post) => (post.id === id ? { ...post, ...patch } : post)));
  };

  const addPost = () => {
    setPosts((current) => [
      ...current,
      {
        id: nextId,
        platform: "reels",
        trackName: "",
        audioSource: "commercial",
        durationSeconds: "30",
        willBoost: false,
        licenseId: "",
      },
    ]);
    setNextId((value) => value + 1);
  };

  const removePost = (id) => {
    setPosts((current) => current.filter((post) => post.id !== id));
  };

  const copyResult = async () => {
    const text = toPlanText(result);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the plan? This will replace all your posts and settings with sample data and cannot be undone.",
      )
    ) {
      return;
    }
    setAccountType("business");
    setRotationWindow(String(DEFAULT_ROTATION_WINDOW));
    setPosts(STARTER_POSTS);
    setNextId(STARTER_POSTS.length + 1);
    setCopied(false);
  };

  const activeAccount = ACCOUNT_TYPES.find((item) => item.id === accountType);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Music className="h-4 w-4" aria-hidden="true" />
          Video marketing
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Reel Audio Usage Planner</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Lists the audio you plan to use post by post and checks each track against the split
          between consumer music and the commercial-use library, whether the post will be boosted,
          the platform length limit, and how recently you last used the same track.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="audio-account">
              Account type
            </label>
            <select
              id="audio-account"
              className={`mt-2 ${INPUT_CLASS}`}
              value={accountType}
              onChange={(event) => setAccountType(event.target.value)}
            >
              {ACCOUNT_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="audio-rotation">
              Minimum gap before reusing a track (posts)
            </label>
            <input
              id="audio-rotation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="50"
              step="1"
              value={rotationWindow}
              onChange={(event) => setRotationWindow(event.target.value)}
            />
          </div>
        </div>
        {activeAccount && (
          <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{activeAccount.blurb}</p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Planned posts</h2>
          <button type="button" onClick={addPost} className={GHOST_BTN} aria-label="Add another planned post">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add post
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {posts.map((post, index) => (
            <div key={post.id} className="rounded-lg border border-[var(--border)] p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Post {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removePost(post.id)}
                  aria-label={`Remove post ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-xs font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Remove
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={SMALL_LABEL} htmlFor={`audio-track-${post.id}`}>
                    Track or audio name
                  </label>
                  <input
                    id={`audio-track-${post.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="text"
                    value={post.trackName}
                    onChange={(event) => updatePost(post.id, { trackName: event.target.value })}
                  />
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`audio-platform-${post.id}`}>
                    Platform
                  </label>
                  <select
                    id={`audio-platform-${post.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={post.platform}
                    onChange={(event) => updatePost(post.id, { platform: event.target.value })}
                  >
                    {PLATFORMS.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`audio-source-${post.id}`}>
                    Audio source
                  </label>
                  <select
                    id={`audio-source-${post.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    value={post.audioSource}
                    onChange={(event) => updatePost(post.id, { audioSource: event.target.value })}
                  >
                    {AUDIO_SOURCES.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={SMALL_LABEL} htmlFor={`audio-duration-${post.id}`}>
                    Clip length (seconds)
                  </label>
                  <input
                    id={`audio-duration-${post.id}`}
                    className={`mt-1 ${INPUT_CLASS}`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="600"
                    step="1"
                    value={post.durationSeconds}
                    onChange={(event) => updatePost(post.id, { durationSeconds: event.target.value })}
                  />
                </div>
                {post.audioSource === "licensed" && (
                  <div>
                    <label className={SMALL_LABEL} htmlFor={`audio-license-${post.id}`}>
                      Licence or invoice number
                    </label>
                    <input
                      id={`audio-license-${post.id}`}
                      className={`mt-1 ${INPUT_CLASS}`}
                      type="text"
                      value={post.licenseId}
                      onChange={(event) => updatePost(post.id, { licenseId: event.target.value })}
                    />
                  </div>
                )}
                <div className="flex items-end">
                  <label className="flex min-h-11 items-center gap-2 text-sm font-semibold" htmlFor={`audio-boost-${post.id}`}>
                    <input
                      id={`audio-boost-${post.id}`}
                      type="checkbox"
                      className="h-5 w-5 accent-[var(--primary)]"
                      checked={post.willBoost}
                      onChange={(event) => updatePost(post.id, { willBoost: event.target.checked })}
                    />
                    Will be boosted or used as an ad
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Posts cleared to publish
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.clearCount} / ${result.total}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Add a post to run the check."
                : `${result.highCount} blocked, ${result.cautionCount} to check`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the audio plan" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the planner" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Posts planned", hasError ? DASH : String(result.total)],
            ["Cleared", hasError ? DASH : String(result.clearCount)],
            ["Needs a check", hasError ? DASH : String(result.cautionCount)],
            ["Blocked", hasError ? DASH : String(result.highCount)],
            ["Distinct tracks", hasError ? DASH : String(result.uniqueTracks)],
            ["Reused too soon", hasError ? DASH : String(result.repeats.length)],
            ["Boosts blocked by audio", hasError ? DASH : String(result.boostBlocked)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What to do for each post</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {result.rows.map((row) => (
              <li key={row.index} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold">
                    {row.index}. {row.trackName || "(no track named)"}
                  </span>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${RISK_STYLES[row.risk]}`}>
                    {RISK_WORDS[row.risk]}
                  </span>
                </div>
                {row.error ? (
                  <p className="mt-1 text-[var(--danger)]">{row.error}</p>
                ) : (
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {row.platform} · {row.source} · {Math.round(row.durationSeconds)}s · organic{" "}
                    {row.organicOk ? "ok" : "blocked"} · paid {row.paidOk ? "ok" : "blocked"}
                  </p>
                )}
                {row.actions.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--muted-foreground)]">
                    {row.actions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A planning checklist, not legal advice. Music rights and platform library access change
        often and vary by country — confirm what your account can actually use in the app, and ask a
        rights holder or lawyer before using third-party audio commercially.
      </p>
    </main>
  );
}
