import {
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
    arrayUnion

} from "firebase/firestore"
import {db} from "@/lib/firebase"

const TRENDING_REF = doc(db, "projects", "altftool", "buySmart", "trending");


export const  firebaseBuySmartTrendingSource = {
     subscribe(callback, onError) {
          return onSnapshot(
            TRENDING_REF,
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

