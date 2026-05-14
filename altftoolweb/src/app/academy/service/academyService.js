import { db } from "@/lib/firebase";
import { getCachedFirebaseRead } from "@/lib/firebaseCache";
import { collection, getDocs } from "firebase/firestore";
import { normalizeAcademy, isDisplayableAcademy } from "@altftool/core/firebaseContent";
import { ALTFT_ACADEMY_COLLECTION_PATH } from "@altftool/core/firebasePaths";

export const getAcademyList = async ({ throwOnError = false } = {}) => {
  try {
    return await getCachedFirebaseRead("academy:list", async () => {
      const snapshot = await getDocs(
        collection(db, ...ALTFT_ACADEMY_COLLECTION_PATH)
      );

      return snapshot.docs
        .map((doc) => normalizeAcademy(doc.data(), doc.id))
        .filter(isDisplayableAcademy);
    }, 120000);
  } catch (error) {
    console.error("Error fetching academy list:", error);
    if (throwOnError) throw error;
    return [];
  }
};
