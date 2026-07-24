import { collection, onSnapshot } from "firebase/firestore";
import { ALTFT_BUYSMART_ROOT } from "@altftool/core/firebasePaths";
import { db } from "@/lib/firebaseFirestore";
import { subscribeCached } from "@/lib/firebaseCache";


// all data render on admin page tab just like - store, category , hero

export const firebaseBuySmartSource = {
  subscribeAll(callback, onError) {
    const newColRef = collection(db, ...ALTFT_BUYSMART_ROOT);
    const oldColRef = collection(db, "buySmart");

    return subscribeCached("admin:buysmart:all", (emit, fail) => {
      let hasCanonicalData = false;
      let legacyResult = null;

      const emitLegacyFallback = () => {
        if (!hasCanonicalData && legacyResult) {
          emit(legacyResult);
        }
      };

      const unsubNew = onSnapshot(newColRef, (snap) => {
        const result = {};
        snap.docs.forEach((d) => {
          result[d.id] = d.data();
        });

        hasCanonicalData = !snap.empty;

        if (hasCanonicalData) {
          emit(result);
          return;
        }

        emitLegacyFallback();
      }, fail);

      const unsubOld = onSnapshot(oldColRef, (snap) => {
        const result = {};
        snap.docs.forEach((d) => {
          result[d.id] = d.data();
        });

        legacyResult = result;
        emitLegacyFallback();
      }, fail);

      return () => { try { unsubNew?.(); } catch {} try { unsubOld?.(); } catch {} };
    }, callback, onError);
  }
};

