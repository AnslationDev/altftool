"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import EmojiPicker, { Categories, Theme } from "emoji-picker-react";
import {
  Search,
  Copy,
  Share2,
  Smile,
  Image as ImageIcon,
  X,
  Check,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import Description from "../components/Description";
import ManagedImage from "@/components/ui/ManagedImage";

const FAVORITES_KEY = "altftool_emoji_hub_favorites";
const RECENT_KEY = "altftool_emoji_hub_recents";
const LEGACY_FAVORITES_KEY = "favorites";
const LEGACY_RECENT_KEY = "recentEmojis";
const FAVORITES_LIMIT = 100;
const RECENT_LIMIT = 20;
const GIF_RESULT_LIMIT = 20;

// emoji-picker-react ships its own "Frequently Used" row backed by the
// `epr_suggested` localStorage key. It still writes that key internally, but
// dropping Categories.SUGGESTED keeps the explicit, user-controlled Recents
// row below as the only history displayed by this tool.
const PICKER_CATEGORIES = [
  Categories.SMILEYS_PEOPLE,
  Categories.ANIMALS_NATURE,
  Categories.FOOD_DRINK,
  Categories.TRAVEL_PLACES,
  Categories.ACTIVITIES,
  Categories.OBJECTS,
  Categories.SYMBOLS,
  Categories.FLAGS,
];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/35";

function sanitizeStoredEmojis(value, limit) {
  if (!Array.isArray(value)) return [];
  return [
    ...new Set(
      value.filter(
        (entry) =>
          typeof entry === "string" &&
          entry.trim().length > 0 &&
          entry.length <= 32,
      ),
    ),
  ].slice(0, limit);
}

function readStoredEmojis(key, legacyKey, limit) {
  try {
    const stored = window.localStorage.getItem(key);
    const fallback =
      stored === null ? window.localStorage.getItem(legacyKey) : null;
    return sanitizeStoredEmojis(JSON.parse(stored ?? fallback ?? "[]"), limit);
  } catch {
    return [];
  }
}

function writeStoredEmojis(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode, quota) — keep the session copy.
  }
}

function getGifUrl(gif) {
  const candidate =
    gif?.images?.fixed_height?.url || gif?.images?.original?.url || "";
  if (typeof candidate !== "string") return "";

  try {
    const url = new URL(candidate.trim());
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function normalizeGifs(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .map((gif) => {
      const id = typeof gif?.id === "string" ? gif.id.trim() : "";
      const url = getGifUrl(gif);
      if (!id || !url || seen.has(id)) return null;
      seen.add(id);
      return {
        id,
        url,
        title:
          typeof gif?.title === "string" && gif.title.trim()
            ? gif.title.trim()
            : "GIF",
      };
    })
    .filter(Boolean)
    .slice(0, GIF_RESULT_LIMIT);
}

async function writeClipboardText(content) {
  if (typeof content !== "string" || content.length === 0) {
    throw new Error("Nothing to copy");
  }

  let clipboardError;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(content);
      return;
    } catch (error) {
      clipboardError = error;
    }
  }

  const previousFocus = document.activeElement;
  const textArea = document.createElement("textarea");
  textArea.value = content;
  textArea.readOnly = true;
  textArea.tabIndex = -1;
  textArea.setAttribute("aria-hidden", "true");
  textArea.className = "fixed left-0 top-0 h-px w-px opacity-0";
  document.body.appendChild(textArea);

  let copied = false;
  try {
    textArea.select();
    copied = document.execCommand("copy");
  } finally {
    textArea.remove();
    if (typeof previousFocus?.focus === "function") previousFocus.focus();
  }

  if (!copied) {
    throw clipboardError || new Error("Clipboard access unavailable");
  }
}

// The picker paints its own chrome, so mirror the shell's `data-theme` onto it.
function usePickerTheme() {
  const [theme, setTheme] = useState(Theme.LIGHT);

  useEffect(() => {
    const sync = () =>
      setTheme(
        document.documentElement.getAttribute("data-theme") === "dark"
          ? Theme.DARK
          : Theme.LIGHT,
      );

    sync();
    if (typeof MutationObserver === "undefined") return undefined;

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return theme;
}

function EmojiChip({ emoji, isCopied, isFavorite, onCopy, onToggleFavorite }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => onCopy(emoji)}
        aria-label={`Copy ${emoji} to clipboard`}
        className={`flex h-12 w-12 items-center justify-center rounded-lg border text-2xl leading-none transition-colors duration-150 motion-reduce:transition-none hover:border-primary ${FOCUS_RING} ${
          isCopied
            ? "border-success bg-success-soft"
            : "border-border bg-surface-soft"
        }`}
      >
        <span aria-hidden="true">{emoji}</span>
      </button>
      <button
        type="button"
        onClick={() => onToggleFavorite(emoji)}
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? `Remove ${emoji} from favorites`
            : `Add ${emoji} to favorites`
        }
        className={`group absolute -right-4 -top-4 flex h-11 w-11 items-center justify-center rounded-pill transition-colors duration-150 motion-reduce:transition-none ${FOCUS_RING}`}
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-pill border bg-surface shadow-sm transition-colors duration-150 motion-reduce:transition-none ${
            isFavorite
              ? "border-primary text-primary-text"
              : "border-border text-muted-foreground group-hover:border-primary group-hover:text-foreground"
          }`}
        >
          <Star
            className="h-3.5 w-3.5"
            fill={isFavorite ? "currentColor" : "none"}
            aria-hidden="true"
          />
        </span>
      </button>
    </div>
  );
}

function EmojiRow({
  title,
  icon: Icon,
  emojis,
  favorites,
  copiedItem,
  onCopy,
  onToggleFavorite,
  onClear,
  clearLabel,
  isConfirmingClear,
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          {title}
        </h2>
        <button
          type="button"
          onClick={onClear}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-md border px-3 text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none ${FOCUS_RING} ${
            isConfirmingClear
              ? "border-danger bg-danger-soft text-danger"
              : "border-border bg-surface text-muted-foreground hover:border-primary hover:text-foreground"
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          {isConfirmingClear ? "Confirm clear?" : clearLabel}
        </button>
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-6 pt-2">
        {emojis.map((emoji) => (
          <li key={emoji}>
            <EmojiChip
              emoji={emoji}
              isCopied={copiedItem === emoji}
              isFavorite={favorites.includes(emoji)}
              onCopy={onCopy}
              onToggleFavorite={onToggleFavorite}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ToolHome() {
  const [activeTab, setActiveTab] = useState("emoji");
  const [searchTerm, setSearchTerm] = useState("");
  // `null` is the "no active search" sentinel for the default trending feed —
  // distinct from any real, user-typable keyword (including the literal word
  // "trending", which must behave like an ordinary search term).
  const [gifQuery, setGifQuery] = useState(null);
  const [gifRequestVersion, setGifRequestVersion] = useState(0);
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gifError, setGifError] = useState("");
  const [copiedItem, setCopiedItem] = useState(null);
  const [copyError, setCopyError] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [recentEmojis, setRecentEmojis] = useState([]);
  const [storageLoaded, setStorageLoaded] = useState(false);
  // Tracks which Clear button ("favorites" | "recents") is armed awaiting a
  // confirming second click; null means neither is armed.
  const [pendingClear, setPendingClear] = useState(null);

  const pickerTheme = usePickerTheme();
  const copyTimer = useRef(null);
  const pendingClearTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setFavorites(
        readStoredEmojis(
          FAVORITES_KEY,
          LEGACY_FAVORITES_KEY,
          FAVORITES_LIMIT,
        ),
      );
      setRecentEmojis(
        readStoredEmojis(RECENT_KEY, LEGACY_RECENT_KEY, RECENT_LIMIT),
      );
      setStorageLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Gated on `storageLoaded` so the first render's empty arrays never
  // overwrite what was just read back from localStorage.
  useEffect(() => {
    if (!storageLoaded) return;
    writeStoredEmojis(FAVORITES_KEY, favorites);
  }, [favorites, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    writeStoredEmojis(RECENT_KEY, recentEmojis);
  }, [recentEmojis, storageLoaded]);

  useEffect(
    () => () => {
      if (copyTimer.current !== null) {
        window.clearTimeout(copyTimer.current);
      }
      if (pendingClearTimer.current !== null) {
        window.clearTimeout(pendingClearTimer.current);
      }
    },
    [],
  );

  // Two-step confirm for destructive Clear actions: the first click arms
  // `target` and reverts automatically after a few seconds; a second click
  // on the same target within that window actually runs `action`.
  const requestClear = useCallback(
    (target, action) => {
      window.clearTimeout(pendingClearTimer.current);
      if (pendingClear === target) {
        pendingClearTimer.current = null;
        setPendingClear(null);
        action();
        return;
      }
      setPendingClear(target);
      pendingClearTimer.current = window.setTimeout(() => {
        setPendingClear(null);
        pendingClearTimer.current = null;
      }, 4000);
    },
    [pendingClear],
  );

  const fetchGifs = useCallback(async (query, signal) => {
    if (signal?.aborted) return;
    setLoading(true);
    setGifError("");
    try {
      const url = query
        ? `/api/tools/giphy?q=${encodeURIComponent(query)}`
        : "/api/tools/giphy";
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(`Giphy request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data?.data)) {
        throw new Error("Giphy returned an invalid response");
      }
      setGifs(normalizeGifs(data?.data));
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Error fetching GIFs:", error);
      setGifs([]);
      setGifError("We couldn't load GIFs right now. Please try again.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // Keyed on the submitted query, not the input value, so typing in the
  // search box doesn't fire a request per keystroke.
  useEffect(() => {
    if (activeTab !== "gif") return undefined;
    const controller = new AbortController();
    queueMicrotask(() => fetchGifs(gifQuery, controller.signal));
    return () => controller.abort();
  }, [activeTab, gifQuery, gifRequestVersion, fetchGifs]);

  const copyToClipboard = useCallback(async (content) => {
    window.clearTimeout(copyTimer.current);
    try {
      await writeClipboardText(content);
      setCopyError("");
      setCopiedItem(content);
    } catch (error) {
      console.error("Failed to copy:", error);
      setCopiedItem(null);
      setCopyError("Copy failed — your browser blocked clipboard access.");
    }
    copyTimer.current = window.setTimeout(() => {
      setCopiedItem(null);
      setCopyError("");
      copyTimer.current = null;
    }, 2000);
  }, []);

  const shareContent = useCallback(
    async (content) => {
      if (navigator.share) {
        try {
          await navigator.share({ text: content });
          return;
        } catch (error) {
          if (error?.name === "AbortError") return;
          console.error("Error sharing:", error);
        }
      }
      copyToClipboard(content);
    },
    [copyToClipboard],
  );

  const addToRecent = useCallback((emoji) => {
    setRecentEmojis((current) =>
      [emoji, ...current.filter((entry) => entry !== emoji)].slice(
        0,
        RECENT_LIMIT,
      ),
    );
  }, []);

  const copyEmoji = useCallback(
    (emoji) => {
      addToRecent(emoji);
      copyToClipboard(emoji);
    },
    [addToRecent, copyToClipboard],
  );

  const handleEmojiClick = useCallback(
    (emojiObject) => {
      const emoji = emojiObject?.emoji;
      if (!emoji) return;
      copyEmoji(emoji);
    },
    [copyEmoji],
  );

  const toggleFavorite = useCallback((item) => {
    setFavorites((current) =>
      current.includes(item)
        ? current.filter((entry) => entry !== item)
        : [item, ...current].slice(0, FAVORITES_LIMIT),
    );
  }, []);

  const handleGifSearch = (event) => {
    event.preventDefault();
    setGifQuery(searchTerm.trim() || null);
    setGifRequestVersion((current) => current + 1);
  };

  const clearGifSearch = () => {
    setSearchTerm("");
    setGifQuery(null);
    setGifRequestVersion((current) => current + 1);
  };

  const retryGifSearch = () => {
    setGifRequestVersion((current) => current + 1);
  };

  const tabClass = (tab) =>
    `flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors duration-150 motion-reduce:transition-none ${FOCUS_RING} ${
      activeTab === tab
        ? "border-primary bg-primary text-primary-foreground shadow-sm"
        : "border-border bg-surface text-muted-foreground hover:border-primary hover:text-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="text-center pt-8">
          <h1 className="heading animate-fade-up text-center motion-reduce:animate-none">
            Emoji &amp; GIF Picker
          </h1>
          <p className="description animate-fade-up px-3 motion-reduce:animate-none">
            Search, copy, and save emojis, or find a GIF to share.
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex flex-wrap justify-center gap-2 px-4 pt-5 sm:px-6 md:px-12 lg:px-24 xl:px-48"
          role="group"
          aria-label="Choose emoji or GIF browser"
        >
          <button
            type="button"
            onClick={() => setActiveTab("emoji")}
            aria-pressed={activeTab === "emoji"}
            className={tabClass("emoji")}
          >
            <Smile className="h-4 w-4" aria-hidden="true" />
            <span>Emojis</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gif")}
            aria-pressed={activeTab === "gif"}
            className={tabClass("gif")}
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
            <span>GIFs</span>
          </button>
        </div>
      </div>

      {/* Main */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        <div className="mx-auto max-w-6xl">
          {activeTab === "emoji" && (
            <div className="space-y-6">
              {favorites.length > 0 && (
                <EmojiRow
                  title="Favorites"
                  icon={Star}
                  emojis={favorites}
                  favorites={favorites}
                  copiedItem={copiedItem}
                  onCopy={copyEmoji}
                  onToggleFavorite={toggleFavorite}
                  onClear={() =>
                    requestClear("favorites", () => setFavorites([]))
                  }
                  clearLabel="Clear favorites"
                  isConfirmingClear={pendingClear === "favorites"}
                />
              )}

              {recentEmojis.length > 0 && (
                <EmojiRow
                  title="Recently used"
                  icon={Smile}
                  emojis={recentEmojis}
                  favorites={favorites}
                  copiedItem={copiedItem}
                  onCopy={copyEmoji}
                  onToggleFavorite={toggleFavorite}
                  onClear={() =>
                    requestClear("recents", () => setRecentEmojis([]))
                  }
                  clearLabel="Clear recents"
                  isConfirmingClear={pendingClear === "recents"}
                />
              )}

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Click any emoji to copy it and add it to Recently used, where
                  you can star the ones you reach for most.
                </p>
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme={pickerTheme}
                  categories={PICKER_CATEGORIES}
                  searchPlaceholder="Search emojis"
                  autoFocusSearch={false}
                  lazyLoadEmojis
                  width="100%"
                  height="400px"
                  previewConfig={{ showPreview: false }}
                />
              </div>
            </div>
          )}

          {activeTab === "gif" && (
            <div className="space-y-6">
              <form
                role="search"
                onSubmit={handleGifSearch}
                className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5"
              >
                <label
                  htmlFor="gif-search"
                  className="mb-2 block text-sm font-bold text-foreground"
                >
                  Search GIFs
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <input
                      id="gif-search"
                      type="text"
                      autoComplete="off"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Try celebration, cat, thank you…"
                      className={`h-11 w-full rounded-md border border-border bg-background pl-9 pr-11 text-foreground placeholder:text-muted-foreground ${FOCUS_RING}`}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={clearGifSearch}
                        aria-label="Clear GIF search"
                        className={`absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-pill text-muted-foreground transition-colors duration-150 motion-reduce:transition-none hover:text-foreground ${FOCUS_RING}`}
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors duration-150 motion-reduce:transition-none hover:bg-primary-hover ${FOCUS_RING}`}
                  >
                    <Search className="h-4 w-4" aria-hidden="true" />
                    Search
                  </button>
                </div>
                <p
                  className="mt-2 text-xs text-muted-foreground"
                  aria-live="polite"
                >
                  {loading
                    ? "Loading GIFs…"
                    : gifError
                      ? "GIFs are temporarily unavailable."
                      : gifQuery === null
                        ? "Showing trending GIFs."
                        : `Showing results for “${gifQuery}”.`}
                </p>
              </form>

              {gifError && (
                <div
                  role="alert"
                  className="flex flex-col gap-3 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>{gifError}</span>
                  <button
                    type="button"
                    onClick={retryGifSearch}
                    className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-danger bg-surface px-4 text-sm font-semibold text-foreground transition-colors duration-150 motion-reduce:transition-none hover:border-primary ${FOCUS_RING}`}
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Try again
                  </button>
                </div>
              )}

              {loading && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }, (_, index) => (
                    <div
                      key={index}
                      aria-hidden="true"
                      className="h-56 animate-pulse rounded-xl border border-border bg-surface-soft motion-reduce:animate-none"
                    />
                  ))}
                </div>
              )}

              {!loading && !gifError && gifs.length === 0 && (
                <p className="rounded-xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
                  {gifQuery === null
                    ? "No trending GIFs found right now. Try a search instead."
                    : `No GIFs found for “${gifQuery}”. Try a different search.`}
                </p>
              )}

              {!loading && gifs.length > 0 && (
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {gifs.map((gif) => {
                    const { url, title } = gif;
                    return (
                      <li
                        key={gif.id}
                        className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                      >
                        <ManagedImage
                          src={url}
                          alt={title}
                          className="h-44 w-full bg-surface-soft object-cover"
                        />
                        <div className="flex items-center gap-2 border-t border-border p-2">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(url)}
                            className={`inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-surface text-xs font-semibold text-foreground transition-colors duration-150 motion-reduce:transition-none hover:border-primary hover:text-primary-text ${FOCUS_RING}`}
                          >
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            Copy link
                          </button>
                          <button
                            type="button"
                            onClick={() => shareContent(url)}
                            className={`inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-surface text-xs font-semibold text-foreground transition-colors duration-150 motion-reduce:transition-none hover:border-primary hover:text-primary-text ${FOCUS_RING}`}
                          >
                            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                            Share
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>

      <Description />

      {/* Copy Notification */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:max-w-sm"
      >
        {copiedItem && (
          <div className="flex items-center gap-2 rounded-lg border border-success bg-surface px-5 py-3 shadow-lg">
            <Check className="h-5 w-5 text-success" aria-hidden="true" />
            <span className="text-sm font-semibold text-foreground">
              Copied to clipboard!
            </span>
          </div>
        )}
        {copyError && (
          <div className="flex items-center gap-2 rounded-lg border border-danger bg-surface px-5 py-3 shadow-lg">
            <X className="h-5 w-5 text-danger" aria-hidden="true" />
            <span className="text-sm font-semibold text-foreground">
              {copyError}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
