"use client";

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const PROJECT_ID = "altftool";

// ─────────────────────────────────────────────
// Get or create persistent session ID
// ─────────────────────────────────────────────
function getSessionId() {
  let sessionId = localStorage.getItem("blogSessionId");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("blogSessionId", sessionId);
  }

  return sessionId;
}

// ─────────────────────────────────────────────
// Unique View Increment
// ─────────────────────────────────────────────
export async function incrementUniqueView(blogId) {
  if (!blogId) return;

  try {
    const sessionId = getSessionId();

    const viewRef = doc(
      db,
      "projects",
      PROJECT_ID,
      "blogs",
      blogId,
      "views",
      sessionId
    );

    const blogRef = doc(
      db,
      "projects",
      PROJECT_ID,
      "blogs",
      blogId
    );

    // Check if already viewed
    const existing = await getDoc(viewRef);

    if (existing.exists()) return;

    // Create unique view record
    await setDoc(viewRef, {
      viewedAt: serverTimestamp(),
    });

    // Increment total views
    await updateDoc(blogRef, {
      views: increment(1),
    });

  } catch (err) {
    console.error("incrementUniqueView error:", err);
  }
}