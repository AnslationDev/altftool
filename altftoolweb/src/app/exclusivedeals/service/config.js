import { collection, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

//  YOUR BASE PATH
export const ROOT = ["projects", "altftool", "consumerrating", "data"];

// COLLECTION REF
export const getCollectionRef = (name) => collection(db, ...ROOT, name);

//  DOC REF
export const getDocRef = (name, id) => doc(db, ...ROOT, name, id);
