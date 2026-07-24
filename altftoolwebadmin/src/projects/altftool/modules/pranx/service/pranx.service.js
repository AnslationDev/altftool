import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db } from "@/lib/firebaseFirestore";

// projects/altftool/pranx/data/home/content (single document)
const PRANX_DOC_PATH = ["projects", "altftool", "pranx", "data", "home", "content"];

const pranxDocRef = () => doc(db, ...PRANX_DOC_PATH);

export const DEFAULT_PRANX_CONTENT = {
  header: {
    logoText: "Pranx Studio",
    links: [
      { label: "Simulators", href: "#gallery" },
      { label: "Updates", href: "#gallery" },
      { label: "Games", href: "#gallery" },
    ],
  },
  hero: {
    title: "Just Pranx, Bro!",
    subtext: "I used to think the browser was serious. Then this page started smiling back.",
    searchPlaceholder: "Search pranks...",
    slides: [
      {
        title: "Office Mischief",
        body: "Safe fake screens and browser games for harmless demos.",
        image: "/pranx-assets/slider/download.jpg",
      },
      {
        title: "Classic Computer Pranks",
        body: "Retro terminals, updates, matrix rain, screensavers, and tiny games.",
        image: "/pranx-assets/slider/download-1.jpg",
      },
      {
        title: "Just Pranx",
        body: "Pick a card, open fullscreen, and exit anytime with Esc.",
        image: "/pranx-assets/slider/download-2.jpg",
      },
    ],
  },
  effects: {
    scrollSounds: true,
    glitchTitle: true,
    insects: true,
    welcomePopup: false,
  },
  tiles: [
    { title: "Sound Board", slug: "soundboard", badge: "New" },
    { title: "Hacker Typer Simulator", slug: "hacker", badge: "" },
    { title: "Win XP Simulator", slug: "winxp", badge: "" },
    { title: "Chat Screenshot", slug: "chat-screenshot-generator", badge: "" },
    { title: "Scare Maze", slug: "maze", badge: "" },
    { title: "Fake Virus", slug: "fake-virus", badge: "" },
    { title: "FBI Lock", slug: "fbi-warning", badge: "" },
    { title: "Google Terminal", slug: "google-terminal", badge: "" },
    { title: "Cracked Screen", slug: "bsod", badge: "" },
    { title: "DVD Bounce", slug: "dvd-bounce", badge: "" },
    { title: "Tetris Blocks", slug: "tetris", badge: "" },
    { title: "Windows 10", slug: "windows-update", badge: "" },
    { title: "Apple iOS", slug: "mac-update", badge: "" },
    { title: "Matrix Code Rain", slug: "matrix-code-rain", badge: "" },
    { title: "Pipes Screensaver", slug: "pipes", badge: "" },
    { title: "TV Noise", slug: "static-tv", badge: "" },
    { title: "BIOS Simulator", slug: "bios", badge: "" },
    { title: "DOS Simulator", slug: "fake-dos", badge: "" },
    { title: "Norton Commander", slug: "norton-commander", badge: "" },
    { title: "Jurassic Security", slug: "jurassic-park", badge: "" },
  ],
  instructions: {
    title: "Online Pranks",
    body: "Open a safe browser prank, switch to fullscreen, and let the page do the acting. These local demos are designed for playful testing, training videos, and harmless reactions.",
    image: "/pranx-assets/download.jpg",
    stepsTitle: "How To Use The Online Pranks?",
    steps: [
      "Pick a simulator card from the gallery.",
      "Use fullscreen when the route supports it.",
      "Press Esc anytime to return to normal browsing.",
    ],
  },
  footer: {
    disclaimer: "All content provided on this website is for entertainment and educational purposes only. No real viruses, hacking activities, or security bypasses are performed.",
    copyright: "© 2026 Pranx Studio. All Rights Reserved.",
  },
};

export async function fetchPranxHome() {
  const snap = await getDoc(pranxDocRef());
  if (!snap.exists()) return null;
  return snap.data();
}

export async function savePranxHome(content) {
  await setDoc(
    pranxDocRef(),
    { ...content, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function uploadPranxImage(file) {
  const storage = getStorage();
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const imageRef = ref(storage, `pranx/home/${Date.now()}-${safeName}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}
