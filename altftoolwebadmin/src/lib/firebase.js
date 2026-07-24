// Compatibility barrel for existing feature modules. Global shells import the
// focused modules directly so login does not preload Firestore, Storage, or FCM.
export { auth } from "./firebaseAuth";
export { db } from "./firebaseFirestore";
export { storage } from "./firebaseStorage";
export { getFirebaseMessaging } from "./firebaseMessaging";
