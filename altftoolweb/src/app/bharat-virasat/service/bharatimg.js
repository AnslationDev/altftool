import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const PINS_REF = collection(db, "projects", "altftool", "bharatvirasat");
