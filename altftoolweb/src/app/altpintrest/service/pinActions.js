import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { togglePinLike } from "./likedPinsStore";

export const updatePinLikes = async (pinId, amount = 1) => {
  try {
    const idStr = String(pinId);
    const pinRef = doc(db, "projects", "altftool", "pintrest", idStr);
    await updateDoc(pinRef, {
      likes: increment(amount),
      likeCount: increment(amount)
    });
    return { success: true };
  } catch (error) {
    if (error?.code === 'permission-denied') {
      return { success: true, isLocalOnly: true };
    }
    console.error("Error updating likes:", error);
    return { success: false, error };
  }
};

export { togglePinLike };
