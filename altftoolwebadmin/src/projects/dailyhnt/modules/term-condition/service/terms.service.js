import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";

const PROJECT_ID = "dailyhnt";
const TERMS_PATH = ["projects", PROJECT_ID, "terms", "terms"];

export const DEFAULT_TERMS = {
  hero: { eyebrow: "", title: "", body: "" },
  sections: [],
  contactHeading: "",
  contactIntro: "",
};

export function subscribeTerms(onNext, onError) {
  return onSnapshot(
    doc(db, ...TERMS_PATH),
    (snap) => {
      const data = snap.exists() ? snap.data() : {};
      onNext({
        ...DEFAULT_TERMS,
        ...data,
        hero: { ...DEFAULT_TERMS.hero, ...(data.hero || {}) },
        sections: Array.isArray(data.sections) ? data.sections : [],
      });
    },
    onError,
  );
}

export async function saveTerms(payload) {
  await setDoc(
    doc(db, ...TERMS_PATH),
    {
      hero: {
        eyebrow: String(payload.hero?.eyebrow || "").trim(),
        title: String(payload.hero?.title || "").trim(),
        body: String(payload.hero?.body || "").trim(),
      },
      sections: (Array.isArray(payload.sections) ? payload.sections : [])
        .map((item) => ({
          title: String(item?.title || "").trim(),
          body: String(item?.body || "").trim(),
        }))
        .filter((item) => item.title || item.body),
      contactHeading: String(payload.contactHeading || "").trim(),
      contactIntro: String(payload.contactIntro || "").trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
