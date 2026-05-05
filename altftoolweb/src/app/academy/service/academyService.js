import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const getAcademyList = async () => {
  try {
    const snapshot = await getDocs(
      collection(db, "projects", "altftool", "academy")
    );

    const academyList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return academyList;
  } catch (error) {
    console.error("Error fetching academy list:", error);
    return [];
  }
};
