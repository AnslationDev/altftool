import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  serverTimestamp

} from "firebase/firestore"
import { buySmartDocPath } from "@altftool/core/firebasePaths"
import {db} from "@/lib/firebase"
import { dualWrite, getFirestoreRefs } from "@/lib/dualWrite"


export const ROOT = buySmartDocPath("ruleSet");
const RULESET_REF = doc(db, ...ROOT);
const { newDocRef: RULESET_NEW_REF } = getFirestoreRefs(...ROOT);


export const  firebaseBuySmartRuleSetSource = {
   subscribe(callback, onError) {
        const unsubNew = onSnapshot(
          RULESET_NEW_REF,
          snap => {
            if (!snap.exists()) return;
            const data = snap.data().banner || [];
            callback(data);
          },
          error => {
            console.error("RuleSet read error:", error);
            onError?.(error);
          }
        );
        const unsubOld = onSnapshot(
          RULESET_REF,
          snap => {
            const data = snap.exists() ? snap.data().banner || [] : [];
            callback(data);
          },
          error => {
            console.error("RuleSet read error:", error);
            onError?.(error);
          }
        );
        return () => { try { unsubNew?.(); } catch {} try { unsubOld?.(); } catch {} };
      },

       // 🔹 ADD NEW HERO (POST)
          async add(rule) {
            const newRule = {
              id: crypto.randomUUID(),
              title: rule.title,
              redirectUrl: rule.redirectUrl,
              active:rule.active,
              idleTime:rule.idleTime,
               createdAt: serverTimestamp(), 
                          updatedAt: serverTimestamp(),
            };
        
            const snap = await getDoc(RULESET_REF);
            const existing = snap.exists() ? snap.data().banner || [] : [];
            await dualWrite.set(MODULE, DOC_ID, { banner: [...existing, newRule] }, { merge: true });
          },


           async update(id, updatedRule) {
                const snap = await getDoc(RULESET_REF);
                const data = snap.data();
              
                const updatedList = data.banner.map((h) =>
                  h.id === id ? { ...h, ...updatedRule,
                    updatedAt: serverTimestamp(),
                     } : h
                );
              
                await dualWrite.update(MODULE, DOC_ID, { banner: updatedList });
              },
              
              async remove(id, banner) {
                    const filtered = banner.filter(h => h.id !== id);
                
                    await dualWrite.update(MODULE, DOC_ID, { banner: filtered });
                  }
}
