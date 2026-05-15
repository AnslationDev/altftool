import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const updatePinLikes = async (pinId, amount = 1) => {
  try {
    const pinRef = doc(db, "projects", "altftool", "pintrest", pinId);
    await updateDoc(pinRef, {
      likes: increment(amount)
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating likes:", error);
    return { success: false, error };
  }
};
