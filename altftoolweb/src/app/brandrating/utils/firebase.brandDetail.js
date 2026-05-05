import { db } from "@/lib/firebase";
import { getCachedFirebaseRead } from "@/lib/firebaseCache";
import { collection, getDocs } from "firebase/firestore";

// Common function to get any section data
const getSectionData = async (module, section) => {
  try {
    const ref = collection(
      db,
      "projects",
      "altftool",
      module,
      section,
      "items"
    );

    return await getCachedFirebaseRead(`brandrating:${module}:${section}`, async () => {
      const snapshot = await getDocs(ref);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }, 120000);
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

export const getBrandDetails = () =>
  getSectionData("consumerrating", "branddetail");
