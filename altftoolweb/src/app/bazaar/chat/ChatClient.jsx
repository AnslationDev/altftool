"use client";

/**
 * Bazaar inbox — a two-pane chat over mock conversations.
 *
 * Every seeded conversation is derived from the listing corpus and its seller:
 * which listings, which openers, which timestamps and which unread counts are
 * all functions of the listing index, never of `Math.random()` or `Date.now()`.
 * That keeps the server HTML and the hydrated page identical, and keeps the
 * inbox looking the same on every visit instead of reshuffling under the user.
 *
 * Replies are simulated on a timer. The UI says so in three places, because a
 * chat that fakes a human without admitting it is a dark pattern.
 */

import Link from "next/link";
import { Suspense, useEffect, useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Bot, Info, MapPin, Send, ShieldCheck } from "lucide-react";

import ManagedImage from "@/components/ui/ManagedImage";

import { EmptyState, Note } from "../components/primitives";
import { formatPrice, getListing, getListings } from "../data/listings";
import { getSeller } from "../data/sellers";

const CONVERSATION_COUNT = 7;
const LISTING_STRIDE = 37;
const REPLY_DELAY_MS = 1100;

/** Buyer openers, chosen by conversation index — not at random. */
const OPENERS = [
  (listing) => `Hi, is the ${listing.subcategoryName.toLowerCase()} still available?`,
  (listing) =>
    listing.price > 0
      ? `Hello — would you take ${formatPrice(Math.round(listing.price * 0.9))} for it?`
      : "Hello — is this still up for collection?",
  (listing) => `Can I come and see it in ${listing.locality} this weekend?`,
  (listing) => `Does the price include delivery anywhere in ${listing.cityName}?`,
  () => "How old is it, and do you still have the original bill?",
  () => "Any particular reason you are selling it?",
  (listing) => `Is ${listing.priceLabel} your final price?`,
];

/** Seller answers, derived from the listing and the seller record. */
const RESPONSES = [
  (listing, seller) => `Yes, still available. I usually reply ${seller.respondsIn}.`,
  (listing) =>
    listing.negotiable
      ? `There is a little room on ${listing.priceLabel} for someone who can collect this week.`
      : `The price is firm at ${listing.priceLabel}, sorry.`,
  (listing) => `I am in ${listing.locality} — weekday evenings after 6 work best for me.`,
  (listing) => `Pickup only from ${listing.locality}, ${listing.cityName}. I cannot ship it.`,
  (listing) =>
    `It is ${listing.postedDaysAgo < 7 ? "barely a week" : `${Math.max(1, Math.floor(listing.postedDaysAgo / 30))} month${listing.postedDaysAgo >= 60 ? "s" : ""}`} since I listed it, and everything works as described.`,
  () => "Moving cities next month, so everything has to go.",
  (listing) => `${listing.priceLabel} is what I am asking, but make me a sensible offer.`,
];

/** Canned follow-ups for messages the visitor sends. */
const AUTO_REPLIES = [
  "Thanks for the message. Shall I keep it aside for you?",
  "Sounds good — I can do a viewing any evening this week.",
  "That works for me. Bring cash and it is yours.",
  "Let me check and confirm in a bit.",
  "Happy to answer anything else about the condition.",
];

function formatAgo(minutes) {
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / (60 * 24))}d ago`;
}

function buildConversation(listing, index) {
  const seller = getSeller(listing.sellerId);
  const openerMinutes = 90 * (index + 1) + 55;
  const replyMinutes = openerMinutes - 40;

  const messages = [
    {
      id: `${listing.slug}-1`,
      from: "buyer",
      text: OPENERS[index % OPENERS.length](listing, seller),
      timeLabel: formatAgo(openerMinutes),
    },
    {
      id: `${listing.slug}-2`,
      from: "seller",
      simulated: true,
      text: RESPONSES[index % RESPONSES.length](listing, seller),
      timeLabel: formatAgo(replyMinutes),
    },
  ];

  // Every other thread ends with the buyer, so the inbox shows a mix of
  // "waiting on them" and "waiting on you".
  if (index % 2 === 0) {
    messages.push({
      id: `${listing.slug}-3`,
      from: "buyer",
      text: `Perfect. I will message before I head to ${listing.locality}.`,
      timeLabel: formatAgo(Math.max(1, replyMinutes - 25)),
    });
  }

  return {
    id: listing.slug,
    listing,
    seller,
    messages,
    unread: index % 3 === 0 && index % 2 !== 0 ? 1 : 0,
  };
}

function seedConversations() {
  const pool = getListings();
  const conversations = [];
  const sellersSeen = new Set();

  for (let i = 0; i < pool.length && conversations.length < CONVERSATION_COUNT; i += LISTING_STRIDE) {
    const listing = pool[i];
    if (!listing || sellersSeen.has(listing.sellerId)) continue;
    sellersSeen.add(listing.sellerId);
    conversations.push(buildConversation(listing, conversations.length));
  }

  return conversations;
}

export default function ChatClient() {
  return (
    <Suspense
      fallback={
        <div className="bzr-section" aria-busy="true">
          <p className="text-sm text-(--muted-foreground)">Loading your inbox…</p>
        </div>
      }
    >
      <ChatInbox />
    </Suspense>
  );
}

function ChatInbox() {
  const uid = useId();
  const searchParams = useSearchParams();
  const adSlug = searchParams.get("ad");

  const seeded = useMemo(() => seedConversations(), []);
  const [stored, setStored] = useState(seeded);
  const [selectedId, setSelectedId] = useState(null);
  const [mobileOverride, setMobileOverride] = useState(null);
  const [draft, setDraft] = useState("");
  // Holds the conversation id a simulated reply is pending for, so switching
  // threads does not show "typing…" in a thread nobody messaged.
  const [pendingReplyFor, setPendingReplyFor] = useState(null);

  const timers = useRef([]);
  const threadEnd = useRef(null);
  const initialScroll = useRef(true);

  // Deep link: /bazaar/chat?ad=<slug> opens, or starts, that ad's thread.
  // Derived during render rather than pushed in from an effect, so the thread
  // is on screen in the first paint after navigation.
  const deepLinked = useMemo(() => (adSlug ? getListing(adSlug) : null), [adSlug]);

  const conversations = useMemo(() => {
    if (!deepLinked || stored.some((c) => c.id === deepLinked.slug)) return stored;
    return [{ ...buildConversation(deepLinked, 0), unread: 0 }, ...stored];
  }, [deepLinked, stored]);

  const activeId = selectedId ?? deepLinked?.slug ?? conversations[0]?.id ?? null;
  const threadOpenMobile = mobileOverride ?? Boolean(deepLinked);
  const messageCount = conversations.find((c) => c.id === activeId)?.messages.length || 0;

  /** Commits the merged list, so a deep-linked thread survives its first edit. */
  function updateConversations(updater) {
    setStored(updater(conversations));
  }

  useEffect(() => {
    const scheduled = timers.current;
    return () => {
      for (const timer of scheduled) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (initialScroll.current) {
      initialScroll.current = false;
      return;
    }
    threadEnd.current?.scrollIntoView({ block: "nearest" });
  }, [messageCount, activeId]);

  const active = conversations.find((c) => c.id === activeId) || null;

  function openConversation(id) {
    setSelectedId(id);
    setMobileOverride(true);
    setDraft("");
    updateConversations((current) => current.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  }

  function sendMessage(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || !active) return;

    const stamp = active.messages.length + 1;
    const outgoing = {
      id: `${active.id}-out-${stamp}`,
      from: "buyer",
      text,
      timeLabel: "Just now",
    };

    updateConversations((current) =>
      current.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, outgoing] } : c)),
    );
    setDraft("");
    setPendingReplyFor(active.id);

    const conversationId = active.id;
    const replyIndex = stamp;
    const timer = setTimeout(() => {
      // The outgoing message above already committed the merged list, so a
      // plain functional update is enough here.
      setStored((current) =>
        current.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: `${conversationId}-auto-${replyIndex}`,
                    from: "seller",
                    simulated: true,
                    text: AUTO_REPLIES[replyIndex % AUTO_REPLIES.length],
                    timeLabel: "Just now",
                  },
                ],
              }
            : c,
        ),
      );
      setPendingReplyFor((current) => (current === conversationId ? null : current));
    }, REPLY_DELAY_MS);

    timers.current.push(timer);
  }

  if (conversations.length === 0) {
    return (
      <div className="bzr-section">
        <EmptyState
          title="No conversations yet"
          message="Message a seller from any ad and the thread will show up here."
          action={
            <Link href="/bazaar" className="bzr-btn">
              Browse ads
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="bzr-section">
      <Note icon={Bot}>
        Demo inbox. These conversations are generated from sample ads and every seller reply is
        produced by a timer — there is no one on the other side.
      </Note>

      <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        {/* Conversation list */}
        <aside
          className={`${threadOpenMobile ? "hidden md:block" : "block"}`}
          aria-label="Conversations"
        >
          <ul className="flex flex-col gap-2">
            {conversations.map((conversation) => {
              const cover = conversation.listing.images?.[0];
              const last = conversation.messages[conversation.messages.length - 1];
              const isActive = conversation.id === activeId;

              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => openConversation(conversation.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-start transition-colors ${
                      isActive
                        ? "border-(--primary) bg-(--bzr-soft)"
                        : "border-(--border) bg-(--card) hover:bg-(--bzr-soft)"
                    }`}
                  >
                    <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-(--bzr-media)">
                      {cover ? (
                        <ManagedImage
                          src={cover.src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-bold text-(--foreground)">
                          {conversation.seller?.name || "Seller"}
                        </span>
                        <span className="shrink-0 text-[0.68rem] text-(--muted-foreground)">
                          {last?.timeLabel}
                        </span>
                      </span>
                      <span className="block truncate text-xs text-(--muted-foreground)">
                        {conversation.listing.title}
                      </span>
                      <span className="mt-1 block truncate text-xs text-(--foreground)">
                        {last?.from === "buyer" ? "You: " : ""}
                        {last?.text}
                      </span>
                    </span>

                    {conversation.unread > 0 ? (
                      <span className="bzr-badge bzr-badge-urgent shrink-0">
                        {conversation.unread}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Thread */}
        <section
          className={`${threadOpenMobile ? "block" : "hidden md:block"}`}
          aria-label="Conversation"
        >
          {active ? (
            <div className="flex min-h-[28rem] flex-col rounded-xl border border-(--border) bg-(--card)">
              <header className="flex items-center gap-3 border-b border-(--border) p-3">
                <button
                  type="button"
                  className="bzr-chip md:hidden"
                  onClick={() => setMobileOverride(false)}
                >
                  {/* Back points toward reading-start, so it flips with the
                      interface direction. */}
                  <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                  Inbox
                </button>

                <span className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-(--bzr-media)">
                  {active.listing.images?.[0] ? (
                    <ManagedImage
                      src={active.listing.images[0].src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-(--foreground)">
                    {active.seller?.name || "Seller"}
                  </p>
                  <p className="truncate text-xs text-(--muted-foreground)">
                    <MapPin className="me-1 inline h-3 w-3" aria-hidden="true" />
                    {active.listing.locality}, {active.listing.cityName}
                  </p>
                </div>

                <Link
                  href={`/bazaar/item/${active.listing.slug}`}
                  className="bzr-chip shrink-0"
                >
                  View ad
                </Link>
              </header>

              <div className="flex items-center justify-between gap-3 border-b border-(--border) bg-(--bzr-soft) px-3 py-2">
                <p className="min-w-0 truncate text-xs text-(--foreground)">
                  {active.listing.title}
                </p>
                <p className="shrink-0 text-sm font-bold text-(--foreground)">
                  {active.listing.priceLabel}
                </p>
              </div>

              <ol className="flex flex-1 flex-col gap-3 overflow-y-auto p-3" aria-live="polite">
                {active.messages.map((message) => {
                  const mine = message.from === "buyer";
                  return (
                    <li
                      key={message.id}
                      className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                          mine
                            ? "bg-(--primary) text-(--primary-foreground)"
                            : "border border-(--border) bg-(--background) text-(--foreground)"
                        }`}
                      >
                        {message.text}
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-[0.68rem] text-(--muted-foreground)">
                        {message.simulated ? (
                          <>
                            <Bot className="h-3 w-3" aria-hidden="true" />
                            <span>Simulated reply ·</span>
                          </>
                        ) : null}
                        <span>{mine ? "You" : active.seller?.name || "Seller"}</span>
                        <span>· {message.timeLabel}</span>
                      </p>
                    </li>
                  );
                })}

                {pendingReplyFor === active.id ? (
                  <li className="text-xs italic text-(--muted-foreground)">
                    {active.seller?.name || "Seller"} is typing a simulated reply…
                  </li>
                ) : null}

                <li ref={threadEnd} aria-hidden="true" />
              </ol>

              <form className="border-t border-(--border) p-3" onSubmit={sendMessage}>
                <label className="sr-only" htmlFor={`${uid}-composer`}>
                  Message {active.seller?.name || "the seller"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={`${uid}-composer`}
                    type="text"
                    className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none focus-visible:border-(--primary) focus-visible:ring-2 focus-visible:ring-(--primary)"
                    placeholder="Type a message…"
                    value={draft}
                    maxLength={500}
                    onChange={(event) => setDraft(event.target.value)}
                  />
                  <button type="submit" className="bzr-btn shrink-0" disabled={!draft.trim()}>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
                <p className="mt-2 text-xs text-(--muted-foreground)">
                  {draft.trim()
                    ? "The seller reply that follows is generated, not written by a person."
                    : "Type a message to see a simulated seller reply."}
                </p>
              </form>
            </div>
          ) : (
            <EmptyState
              title="Pick a conversation"
              message="Choose a thread on the left to read it."
            />
          )}
        </section>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <Note icon={ShieldCheck}>
          Keep conversations and payments on AltF Bazaar. Never share OTPs, UPI PINs or bank
          details, never pay an advance to hold an item, and meet in a public place to inspect
          anything before money changes hands.
        </Note>
        <Note icon={Info}>
          Messages you send are held in this page only. They are not stored, delivered or read by
          anyone, and they disappear when you leave.
        </Note>
      </div>
    </div>
  );
}
