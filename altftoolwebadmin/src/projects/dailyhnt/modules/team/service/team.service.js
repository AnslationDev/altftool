import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
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

const PROJECT_ID = "dailyhnt";
const TEAM_PATH = ["projects", PROJECT_ID, "team"];

const SOCIAL_KEYS = ["twitter", "linkedin", "github", "dribbble"];

export function subscribeTeamMembers(onNext, onError) {
  return onSnapshot(
    query(collection(db, ...TEAM_PATH), orderBy("order", "asc")),
    (snap) => onNext(snap.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export async function createTeamMember(payload) {
  await addDoc(collection(db, ...TEAM_PATH), {
    ...normalizeMember(payload),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateTeamMember(id, payload) {
  await updateDoc(doc(db, ...TEAM_PATH, id), {
    ...normalizeMember(payload),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTeamMember(id) {
  await deleteDoc(doc(db, ...TEAM_PATH, id));
}

export async function toggleTeamMemberStatus(id, active) {
  await updateDoc(doc(db, ...TEAM_PATH, id), {
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
  const social = {};
  SOCIAL_KEYS.forEach((key) => {
    const value = String(payload?.social?.[key] || "").trim();
    if (value) social[key] = value;
  });

  const skills = (
    Array.isArray(payload.skills) ? payload.skills : String(payload.skills || "").split("\n")
  )
    .map((skill) => skill.trim())
    .filter(Boolean);

  return {
    slug: String(payload.slug || "").trim().toLowerCase(),
    name: String(payload.name || "").trim(),
    image: payload.image || "",
    imagePath: payload.imagePath || "",
    role: String(payload.role || "").trim(),
    department: String(payload.department || "").trim(),
    bio: String(payload.bio || "").trim(),
    experience: String(payload.experience || "").trim(),
    skills,
    social,
    order: Number(payload.order) || 0,
    active: payload.active !== false,
  };
}
