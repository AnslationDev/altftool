import { collection, onSnapshot } from "firebase/firestore";
import { ALTFT_BUYSMART_ROOT } from "@altftool/core/firebasePaths";
import { db } from "@/lib/firebase";
import { subscribeCached } from "@/lib/firebaseCache";


// all data render on admin page tab just like - store, category , hero

export const firebaseBuySmartSource = {
  subscribeAll(callback, onError) {
    const newColRef = collection(db, ...ALTFT_BUYSMART_ROOT);
    const oldColRef = collection(db, "buySmart");

    return subscribeCached("admin:buysmart:all", (emit, fail) => {
      const unsubNew = onSnapshot(newColRef, (snap) => {
        if (snap.empty) return;
        const result = {};
        snap.docs.forEach((d) => {
          result[d.id] = d.data();
        });
        emit(result);
      }, fail);

      const unsubOld = onSnapshot(oldColRef, (snap) => {
        const result = {};
        snap.docs.forEach((d) => {
          result[d.id] = d.data();
        });
        emit(result);
      }, fail);

      return () => { try { unsubNew?.(); } catch {} try { unsubOld?.(); } catch {} };
    }, callback, onError);
  }
};


