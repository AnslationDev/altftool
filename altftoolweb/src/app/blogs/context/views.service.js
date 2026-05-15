"use client";

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  writeBatch,
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

export async function recordBlogFeedback(blogId, sentiment) {
  if (!blogId || !["helpful", "notHelpful"].includes(sentiment)) return null;

  try {
    const sessionId = getSessionId();
    const blogRef = doc(db, "projects", PROJECT_ID, "blogs", blogId);
    const feedbackRef = doc(collection(blogRef, "feedback"), sessionId);
    const existing = await getDoc(feedbackRef);
    const previousSentiment = existing.exists() ? existing.data()?.sentiment : null;

    if (previousSentiment === sentiment) {
      return { changed: false, sentiment };
    }

    const updates = {
      [`${sentiment}Count`]: increment(1),
    };

    if (!previousSentiment) {
      updates.feedbackCount = increment(1);
    }

    if (previousSentiment) {
      updates[`${previousSentiment}Count`] = increment(-1);
    }

    const batch = writeBatch(db);
    batch.set(feedbackRef, {
      sentiment,
      updatedAt: serverTimestamp(),
    });
    batch.update(blogRef, updates);
    await batch.commit();

    return { changed: true, sentiment, previousSentiment };
  } catch (err) {
    console.error("recordBlogFeedback error:", err);
    return null;
  }
}
