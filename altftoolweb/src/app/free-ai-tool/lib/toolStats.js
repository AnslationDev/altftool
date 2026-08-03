import { db, isFirebaseConfigured } from "@/lib/firebase";
import { toolId } from "./toolId";

/**
 * Fire-and-forget: logs one "tool opened" event. Read side lives in
 * ToolStatsProvider, which tallies these into weekly-opens / trending
 * counts. Never blocks or throws into the caller — a lost analytics event
 * should never stop someone from reaching the tool they clicked.
 */
export async function recordToolOpen(tool) {
  if (!isFirebaseConfigured) return;
  try {
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
    await addDoc(collection(db, "toolOpenEvents"), {
      toolId: toolId(tool),
      toolName: tool.name,
      openedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to record tool open:", error);
  }
}
