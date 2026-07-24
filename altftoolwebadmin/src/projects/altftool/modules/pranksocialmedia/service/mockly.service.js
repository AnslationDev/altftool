import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db } from "@/lib/firebaseFirestore";

// Storage/Firestore location under altftool project path for public read permission
const MOCKLY_DOC_PATH = ["projects", "altftool", "prank-socialmedia", "data", "home", "content"];
const mocklyDocRef = () => doc(db, ...MOCKLY_DOC_PATH);

export const DEFAULT_MOCKLY_CONTENT = {
  hero: {
    eyebrow: "Studio-grade mockup generator",
    title: "Create Ultra Realistic Social Mockups Instantly",
    subtitle:
      "Design pixel-perfect WhatsApp chats, Instagram DMs, tweets and notification screens — all in your browser. Customize every detail, switch devices, and export in one click.",
    ctaPrimary: "Start Creating",
    ctaSecondary: "Explore Templates",
    trustBadges: ["No signup", "Free to use", "Exports as PNG", "Realistic UI clones"],
    backgroundImage: "",
  },
  templates: {
    sectionTitle: "A studio for every screen",
    sectionSubtitle:
      "14 carefully crafted generators — every pixel modeled after the real thing.",
    featured: [
      "whatsapp",
      "instagram-dm",
      "twitter",
      "notification",
      "instagram-post",
      "facebook-post",
      "youtube",
      "messenger",
      "telegram",
      "snapchat",
      "low-battery",
      "search-results",
      "error-popup",
      "fake-call",
    ],
  },
  features: {
    title: "Built like a real product",
    items: [
      {
        icon: "Eye",
        title: "Real-time live preview",
        desc: "Every keystroke updates the mock instantly.",
      },
      {
        icon: "Layers",
        title: "Exact UI clones",
        desc: "Typography, spacing, ticks, badges — all to spec.",
      },
      {
        icon: "MonitorSmartphone",
        title: "Mobile + desktop",
        desc: "Designed responsive from day one.",
      },
      {
        icon: "Palette",
        title: "Light, dark, AMOLED",
        desc: "Switch themes with one click.",
      },
      {
        icon: "Zap",
        title: "Browser-based",
        desc: "No installs. Nothing leaves your device.",
      },
      {
        icon: "Download",
        title: "Instant PNG export",
        desc: "High-resolution screenshots in a click.",
      },
    ],
  },
  benefits: {
    sectionTitle: "Why Choose Mockly?",
    items: [
      {
        title: "High Quality Exports",
        desc: "Get 4K resolution PNG images perfect for presentations, social posts, or design reviews.",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "Privacy First",
        desc: "Your data never leaves your device. All mockup generation happens entirely in your browser.",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
      },
      {
        title: "No Sign Up Required",
        desc: "Start designing immediately. No credit card, no signup, no email subscription required.",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
      },
    ],
  },
  howItWorks: {
    title: "Three steps. That's it.",
    steps: [
      { number: "01", title: "Choose a template", desc: "Pick from 14 social and system mockups." },
      { number: "02", title: "Customize content", desc: "Edit names, messages, themes, devices." },
      { number: "03", title: "Export your screenshot", desc: "Download a crisp PNG instantly." },
    ],
  },
  faq: {
    title: "Questions, answered",
    items: [
      {
        question: "Is Mockly free?",
        answer: "Yes. Every template is free to use in your browser, with unlimited exports.",
      },
      {
        question: "Is it responsive?",
        answer:
          "Mockly works on mobile, tablet and desktop. Editors adapt their layout to your screen.",
      },
      {
        question: "Can I export screenshots?",
        answer: "Yes — every editor includes a one-click PNG export at high resolution.",
      },
      {
        question: "Is it for entertainment only?",
        answer:
          "Strictly. Mockly is meant for parody, design, and educational mockups — never for fraud or impersonation.",
      },
    ],
  },
  seo: {
    metaTitle: "Mockly - Create Ultra Realistic Social Mockups Instantly",
    metaDescription: "Design pixel-perfect WhatsApp chats, Instagram DMs, tweets and notification screens — all in your browser. Customize every detail, switch devices, and export in one click.",
    keywords: "mockup, social media prank, chat generator, whatsapp mockup, instagram dm simulator, tweet builder",
    ogImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
  },
  editorDefaults: {
    whatsapp: {
      username: "Alex Morgan",
      handle: "alexmorgan",
      messages: [
        { id: "1", text: "Hey, are you free tonight?", side: "them", time: "10:40", status: "read" },
        { id: "2", text: "Yes! What's the plan?", side: "me", time: "10:41", status: "read" },
      ],
    },
  },
  disabledTemplates: [],
};

export const ALL_TEMPLATES = [
  { slug: "whatsapp", name: "WhatsApp Fake Chat" },
  { slug: "instagram-dm", name: "Instagram DM Generator" },
  { slug: "twitter", name: "Twitter / X Tweet" },
  { slug: "notification", name: "Fake Notification" },
  { slug: "instagram-post", name: "Instagram Post" },
  { slug: "facebook-post", name: "Facebook Post" },
  { slug: "youtube", name: "YouTube Comment" },
  { slug: "messenger", name: "Messenger Chat" },
  { slug: "telegram", name: "Telegram Chat" },
  { slug: "snapchat", name: "Snapchat Mockup" },
  { slug: "low-battery", name: "Low Battery Alert" },
  { slug: "search-results", name: "Fake Search Results" },
  { slug: "error-popup", name: "Error Popup" },
  { slug: "fake-call", name: "Fake Call Screen" },
];

export const ICON_OPTIONS = [
  "Eye",
  "Layers",
  "MonitorSmartphone",
  "Palette",
  "Zap",
  "Download",
  "Sparkles",
  "Check",
  "ArrowRight",
  "ShieldCheck",
  "Star",
  "CreditCard",
  "Headphones",
  "Luggage",
  "Globe2",
  "HandCoins",
  "BadgePercent",
  "Plane",
];

export async function fetchMocklyHome() {
  const snap = await getDoc(mocklyDocRef());
  if (!snap.exists()) return null;
  return snap.data();
}

export async function saveMocklyHome(content) {
  await setDoc(
    mocklyDocRef(),
    { ...content, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function uploadMocklyImage(file) {
  const storage = getStorage();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const imageRef = ref(storage, `projects/altftool/prank-socialmedia/${Date.now()}-${safeName}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}
