import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";


// all data render on admin page tab just like - store, category , hero

export const firebaseBuySmartSource = {
  subscribeAll(callback) {
    const newColRef = collection(db, "projects", "altftool", "buySmart");
    const oldColRef = collection(db, "buySmart");

    const unsubNew = onSnapshot(newColRef, (snap) => {
      if (snap.empty) return;
      const result = {};
      snap.docs.forEach((d) => {
        result[d.id] = d.data();
      });
      callback(result);
    });

    const unsubOld = onSnapshot(oldColRef, (snap) => {
      const result = {};
      snap.docs.forEach((d) => {
        result[d.id] = d.data();
      });
      callback(result);
    });

    return () => { try { unsubNew?.(); } catch {} try { unsubOld?.(); } catch {} };
  }
};




