import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { db, storage } from "@/lib/firebase";





const PROJECT_ID = "leadtree";

const col = (...segments) =>
  collection(db, "projects", PROJECT_ID, ...segments);

const docRef = (...segments) => doc(db, "projects", PROJECT_ID, ...segments);


//    Team Member Reads

export async function fetchMembersCount() {
  const snap = await getCountFromServer(col("ourTeam"));
  return snap.data().count;
}

export async function fetchMemberById(id) {
  const snap = await getDoc(docRef("ourTeam", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fetchAllMembers() {
  const q = query(col("ourTeam"), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchMembersPage({ pageSize, cursor }) {
  const constraints = [orderBy("createdAt", "desc"), limit(pageSize)];
  if (cursor) constraints.push(startAfter(cursor));

  const q = query(col("ourTeam"), ...constraints);
  const snap = await getDocs(q);

  const members = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const lastDoc = snap.docs[snap.docs.length - 1] ?? null;

  return { members, lastDoc };
}


//    ✅ Team Member Writes

export async function createMember(payload) {
  const refDoc = doc(col("ourTeam"));

  try {
    await setDoc(refDoc, {
      name: (payload.name || "").trim(),
      role: (payload.role || "").trim(),
      description: (payload.description || "").trim(),
      profileImageUrl: payload.profileImageUrl || "",
      socialLinks: payload.socialLinks || [],
      status: payload.status || "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("❌ FIRESTORE ERROR (createMember):", err);
    throw err;
  }

  return refDoc;
}

/**
 * Update an existing team member.
 * Pass only the fields you want to change.
 */
export async function updateMember(id, payload) {
  await updateDoc(docRef("ourTeam", id), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update only the profile image URL of a member.
 */
export async function updateMemberImage(id, profileImageUrl) {
  await updateDoc(docRef("ourTeam", id), {
    profileImageUrl,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update only the social links array of a member.
 */
export async function updateMemberSocialLinks(id, socialLinks) {
  await updateDoc(docRef("ourTeam", id), {
    socialLinks,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Toggle a member's active/inactive status.
 */
export async function updateMemberStatus(id, status) {
  await updateDoc(docRef("ourTeam", id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a single team member document.
 */
export async function deleteMember(id) {
  await deleteDoc(docRef("ourTeam", id));
}

/**
 * Bulk delete multiple team members by ID.
 */
export async function bulkDeleteMembers(ids) {
  await Promise.all(ids.map((id) => deleteMember(id)));
}



export function uploadMemberProfileImage({
  file,
  memberId,
  onProgress,
  onTaskReady,
}) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `ourTeam/${memberId}/profile`);
    const task = uploadBytesResumable(storageRef, file);

    if (onTaskReady) onTaskReady(task);

    task.on(
      "state_changed",
      (snap) => {
        if (onProgress) {
          onProgress(
            Math.round((snap.bytesTransferred / snap.totalBytes) * 100),
          );
        }
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (e) {
          reject(e);
        }
      },
    );
  });
}


export async function deleteMemberProfileImage(memberId) {
  try {
    const storageRef = ref(storage, `ourTeam/${memberId}/profile`);
    await deleteObject(storageRef);
  } catch (err) {
    // File may not exist — not a fatal error
    console.warn("deleteMemberProfileImage:", err?.code || err);
  }
}
