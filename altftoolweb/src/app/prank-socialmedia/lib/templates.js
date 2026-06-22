import {
  MessageCircle,
  Instagram,
  Image as ImageIcon,
  Facebook,
  Twitter,
  Youtube,
  Send,
  MessagesSquare,
  Ghost,
  BellRing,
  BatteryLow,
  Search,
  AlertOctagon,
  PhoneCall
} from "lucide-react";
const TEMPLATES = [
  { slug: "whatsapp", name: "WhatsApp Fake Chat", short: "Two-way chat with ticks, timestamps & themes.", icon: MessageCircle, accent: "from-emerald-400 to-emerald-600", ready: true },
  { slug: "instagram-dm", name: "Instagram DM Generator", short: "Realistic IG direct message thread.", icon: Instagram, accent: "from-pink-400 via-fuchsia-500 to-orange-400", ready: true },
  { slug: "twitter", name: "Twitter / X Tweet", short: "Generate a pixel-perfect tweet card.", icon: Twitter, accent: "from-sky-400 to-slate-700", ready: true },
  { slug: "notification", name: "Fake Notification", short: "iOS / Android push notification mockup.", icon: BellRing, accent: "from-blue-400 to-indigo-500", ready: true },
  { slug: "instagram-post", name: "Instagram Post", short: "Square post with likes, caption & comments.", icon: ImageIcon, accent: "from-rose-400 to-purple-500", ready: true },
  { slug: "facebook-post", name: "Facebook Post", short: "Status post with reactions and shares.", icon: Facebook, accent: "from-blue-500 to-blue-700", ready: true },
  { slug: "youtube", name: "YouTube Comment", short: "Comment with avatar, likes and replies.", icon: Youtube, accent: "from-red-500 to-rose-600", ready: true },
  { slug: "messenger", name: "Messenger Chat", short: "Facebook Messenger bubble thread.", icon: MessagesSquare, accent: "from-sky-400 to-indigo-500", ready: true },
  { slug: "telegram", name: "Telegram Chat", short: "Telegram chat with cloud bubbles.", icon: Send, accent: "from-cyan-400 to-blue-500", ready: true },
  { slug: "snapchat", name: "Snapchat Mockup", short: "Snap chat / story screenshot mock.", icon: Ghost, accent: "from-yellow-300 to-yellow-500", ready: true },
  { slug: "low-battery", name: "Low Battery Alert", short: "Classic 20% / 10% battery popup.", icon: BatteryLow, accent: "from-amber-400 to-orange-500", ready: true },
  { slug: "search-results", name: "Fake Search Results", short: "Search engine results page mock.", icon: Search, accent: "from-slate-400 to-slate-700", ready: true },
  { slug: "error-popup", name: "Error Popup", short: "Windows / macOS error dialog.", icon: AlertOctagon, accent: "from-red-400 to-red-700", ready: true },
  { slug: "fake-call", name: "Fake Call Screen", short: "Incoming call screen for iOS / Android.", icon: PhoneCall, accent: "from-emerald-400 to-teal-600", ready: true }
];
const getTemplate = (slug) => TEMPLATES.find((t) => t.slug === slug);
export {
  TEMPLATES,
  getTemplate
};
