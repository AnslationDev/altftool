import { db } from "@/lib/firebase";
import { getCachedFirebaseRead } from "@/lib/firebaseCache";
import { collection, getDocs } from "firebase/firestore";

export const getAcademyList = async () => {
  try {
    return await getCachedFirebaseRead("academy:list", async () => {
      const snapshot = await getDocs(
        collection(db, "projects", "altftool", "academy")
      );

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }, 120000);
  } catch (error) {
    console.error("Error fetching academy list:", error);
    return [];
  }
};
