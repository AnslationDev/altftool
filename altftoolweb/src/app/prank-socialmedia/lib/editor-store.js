import { create } from "zustand";

const initial = {
  // ── Shared profile ───────────────────────────────────────────────
  username: "Alex Morgan",
  handle: "alexmorgan",
  avatar: null,
  verified: true,
  theme: "light",
  device: "iphone",
  time: "10:42",

  // ── Post / tweet ─────────────────────────────────────────────────
  postImage: null,
  body: "Just shipped the new editor — it feels incredible to use ✨",
  likes: 2412,
  views: 18900,

  // ── Instagram Post ───────────────────────────────────────────────
  caption: "Golden hour hits different 🌅 #photography #vibes",
  location: "San Francisco, CA",

  // ── Facebook Post ────────────────────────────────────────────────
  shares: 142,
  reactions: { like: 1200, love: 340, haha: 88, wow: 45, sad: 12, angry: 5 },

  // ── Chat messages (WhatsApp / Instagram DM / Messenger / Telegram / Snapchat) ──
  messages: [
    { id: "1", text: "Hey, are you free tonight?", side: "them", time: "10:40", status: "read" },
    { id: "2", text: "Yes! What's the plan?", side: "me", time: "10:41", status: "read" },
    { id: "3", text: "Dinner at 8? I'll pick you up 🚗", side: "them", time: "10:42", status: "read" },
    { id: "4", text: "Perfect 😍", side: "me", time: "10:42", status: "delivered" },
  ],

  // ── Comments (Facebook / YouTube) ────────────────────────────────
  comments: [
    { id: "c1", username: "Jordan Lee", avatar: null, text: "This is absolutely amazing! 🔥", likes: 342, time: "2 hours ago" },
    { id: "c2", username: "Sam Rivera", avatar: null, text: "Can't believe how good this looks", likes: 89, time: "1 hour ago" },
  ],

  // ── YouTube specific ─────────────────────────────────────────────
  videoTitle: "This changed everything...",
  channelName: "Alex Morgan",
  videoThumbnail: null,
  commentText: "This video is absolutely incredible!! The editing, the story, everything. Keep it up! 🙌",
  commentLikes: 4821,
  commentTime: "3 weeks ago",

  // ── System UI: Low Battery ───────────────────────────────────────
  batteryLevel: 20,
  os: "ios",

  // ── System UI: Error Popup ───────────────────────────────────────
  errorTitle: "A problem has been detected",
  errorMessage: "KERNEL_DATA_INPAGE_ERROR\n\nIf this is the first time you've seen this stop error screen, restart your computer. If this screen appears again, follow these steps.",
  errorOs: "windows",

  // ── System UI: Fake Call ─────────────────────────────────────────
  callerName: "Mom 💗",
  callerNumber: "mobile",

  // ── Search Results ───────────────────────────────────────────────
  searchQuery: "how to be productive every day",
  searchResults: [
    { id: "r1", title: "10 Proven Ways to Be More Productive Every Day", url: "productivitylab.com › articles › be-productive", snippet: "Being productive every day starts with a simple morning routine. Studies show that planning your day the night before can boost output by up to 40%." },
    { id: "r2", title: "The Science of Productivity - Harvard Business Review", url: "hbr.org › 2023 › productivity-science", snippet: "Productivity isn't about working longer — it's about working smarter. Here are the strategies top performers use to maximize their output." },
    { id: "r3", title: "How to Stay Focused and Productive: A Complete Guide", url: "lifehacker.com › productivity-guide-2024", snippet: "From time blocking to the Pomodoro technique, we cover all the best methods to help you stay on task and accomplish more in less time." },
  ],
};

const useEditor = create((set, get) => ({
  ...initial,

  // ── Core setters ─────────────────────────────────────────────────
  set: (k, v) => set({ [k]: v }),
  setMany: (patch) => set(patch),

  // ── Chat message actions ──────────────────────────────────────────
  addMessage: (m) =>
    set({
      messages: [
        ...get().messages,
        {
          id: Math.random().toString(36).slice(2),
          text: m?.text ?? "New message",
          side: m?.side ?? "me",
          time: m?.time ?? get().time,
          status: m?.status ?? "sent",
        },
      ],
    }),
  updateMessage: (id, patch) =>
    set({ messages: get().messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) }),
  removeMessage: (id) =>
    set({ messages: get().messages.filter((m) => m.id !== id) }),
  moveMessage: (id, dir) => {
    const list = [...get().messages];
    const i = list.findIndex((m) => m.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    set({ messages: list });
  },

  // ── Comment actions (Facebook / YouTube) ─────────────────────────
  addComment: () =>
    set({
      comments: [
        ...get().comments,
        {
          id: Math.random().toString(36).slice(2),
          username: "New User",
          avatar: null,
          text: "Great post!",
          likes: 0,
          time: "just now",
        },
      ],
    }),
  updateComment: (id, patch) =>
    set({ comments: get().comments.map((c) => (c.id === id ? { ...c, ...patch } : c)) }),
  removeComment: (id) =>
    set({ comments: get().comments.filter((c) => c.id !== id) }),

  // ── Search result actions ─────────────────────────────────────────
  addSearchResult: () =>
    set({
      searchResults: [
        ...get().searchResults,
        {
          id: Math.random().toString(36).slice(2),
          title: "New Search Result Title",
          url: "example.com › page",
          snippet: "A short description of this search result appears here.",
        },
      ],
    }),
  updateSearchResult: (id, patch) =>
    set({ searchResults: get().searchResults.map((r) => (r.id === id ? { ...r, ...patch } : r)) }),
  removeSearchResult: (id) =>
    set({ searchResults: get().searchResults.filter((r) => r.id !== id) }),

  // ── Reset ─────────────────────────────────────────────────────────
  reset: () => set({ ...initial }),
}));

export { useEditor };
