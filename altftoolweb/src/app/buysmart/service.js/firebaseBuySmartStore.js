import {
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
    arrayUnion

} from "firebase/firestore"
import {db} from "@/lib/firebase"

const STORE_REF = doc(db, "projects", "altftool", "buySmart", "store");


export const  firebaseBuySmartStoreSource = {
     subscribe(callback, onError) {
          return onSnapshot(
            STORE_REF,
            snap => {
              const data = snap.exists() ? snap.data().banner || [] : [];
              callback(data);
            },
            error => {
              console.error("Hero read error:", error);
              onError?.(error);
            }
          );
        },

}

