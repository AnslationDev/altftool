import { getMessaging, isSupported } from "firebase/messaging";
import { firebaseApp } from "./firebaseApp";

export async function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;
  if (!(await isSupported())) return null;
  return getMessaging(firebaseApp);
}
