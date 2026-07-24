import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from "firebase/storage";
import { db } from "@/lib/firebaseFirestore";
import { storage } from "@/lib/firebaseStorage";

const PROJECT_ID = "carrerbook";
const SETTINGS_PATH = ["projects", PROJECT_ID, "team", "settings"];
const MEMBERS_PATH = ["projects", PROJECT_ID, "teamMembers"];

export const DEFAULT_TEAM_SETTINGS = {
  active: true,
  titlePrefix: "MEET OUR",
  titleHighlight: "BEST TEAM",
  subtitle: "Cras eu dignissim mauris. Duis imperdiet erat sapien, molestie aliquet arcu tincidunt id. Mauris sit amet quam mi.",
};

export function subscribeTeamSettings(onNext, onError) {
  return onSnapshot(
    doc(db, ...SETTINGS_PATH),
    (snap) => onNext({ ...DEFAULT_TEAM_SETTINGS, ...(snap.exists() ? snap.data() : {}) }),
    onError,
  );
}

export async function saveTeamSettings(payload) {
  await setDoc(
    doc(db, ...SETTINGS_PATH),
    {
      active: payload.active !== false,
      titlePrefix: String(payload.titlePrefix || "").trim(),
      titleHighlight: String(payload.titleHighlight || "").trim(),
      subtitle: String(payload.subtitle || "").trim(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function subscribeTeamMembers(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...MEMBERS_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createTeamMember(payload) {
  await addDoc(collection(db, ...MEMBERS_PATH), {
    ...normalizeMember(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateTeamMember(id, payload) {
  await updateDoc(doc(db, ...MEMBERS_PATH, id), {
    ...normalizeMember(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTeamMember(id) {
  await deleteDoc(doc(db, ...MEMBERS_PATH, id));
}

export async function toggleTeamMemberStatus(id, active) {
  await updateDoc(doc(db, ...MEMBERS_PATH, id), {
    active,
    updatedAt: serverTimestamp(),
  });
}

export function uploadTeamImage({ file, onProgress }) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop() || "png";
    const path = `projects/${PROJECT_ID}/team/member-${Date.now()}.${ext}`;
    const ref = storageRef(storage, path);
    const task = uploadBytesResumable(ref, file);

    task.on(
      "state_changed",
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => {
        try {
          resolve({ url: await getDownloadURL(task.snapshot.ref), path });
        } catch (error) {
          reject(error);
        }
      },
    );
  });
}

export async function deleteTeamImage(path) {
  if (!path) return;
  await deleteObject(storageRef(storage, path));
}

function normalizeMember(payload) {
  return {
    name: String(payload.name || "").trim(),
    designation: String(payload.designation || "").trim(),
    email: String(payload.email || "").trim(),
    contact: String(payload.contact || "").trim(),
    skype: String(payload.skype || "").trim(),
    imageUrl: payload.imageUrl || "",
    imagePath: payload.imagePath || "",
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}
