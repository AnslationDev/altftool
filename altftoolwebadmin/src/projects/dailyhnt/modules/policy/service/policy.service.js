import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PROJECT_ID = "dailyhnt";
const PRIVACY_PATH = ["projects", PROJECT_ID, "policy", "privacy"];

export const DEFAULT_POLICY = {
  hero: { eyebrow: "", title: "", body: "" },
  sections: [],
  contactHeading: "",
  contactIntro: "",
};

export function subscribePolicy(onNext, onError) {
  return onSnapshot(
    doc(db, ...PRIVACY_PATH),
    (snap) => {
      const data = snap.exists() ? snap.data() : {};
      onNext({
        ...DEFAULT_POLICY,
        ...data,
        hero: { ...DEFAULT_POLICY.hero, ...(data.hero || {}) },
        sections: Array.isArray(data.sections) ? data.sections : [],
      });
    },
    onError,
  );
}

export async function savePolicy(payload) {
  await setDoc(
    doc(db, ...PRIVACY_PATH),
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
