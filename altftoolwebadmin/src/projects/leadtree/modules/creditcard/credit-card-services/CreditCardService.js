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
} from "firebase/storage";

import { db, storage } from "@/lib/firebase";

/* ─────────────────────────────────────────────
   CONFIG
───────────────────────────────────────────── */

const PROJECT_ID = "leadtree";

const col = (...segments) =>
    collection(db, "projects", PROJECT_ID, ...segments);

const docRef = (...segments) =>
    doc(db, "projects", PROJECT_ID, ...segments);



export async function fetchCategories() {
    const q = query(
        col("creditcardCategories"),
        orderBy("createdAt", "asc")
        
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name || "",
    }));
}


export async function fetchBenefitedCard() {
    const q = query(
        col("creditBenefitCard"),
        orderBy("createdAt", "asc")
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name || "",
    }));
}


export const fetchCategoryNames = async () => {
    const snap = await getDocs(col("creditcardCategories"));

    return snap.docs
        .map((d) => (d.data().name || "").trim())
        .filter(Boolean);
};

export const fetchBenefitedCardNames = async () => {
    const snap = await getDocs(col("creditBenefitCard"));

    return snap.docs
        .map((d) => (d.data().name || "").trim())
        .filter(Boolean);
};

export async function createCategories(names) {
    return Promise.all(
        names.map(async (name) => {
            const cleanName = name.trim();

            if (!cleanName) return null;

            const refDoc = doc(col("creditcardCategories"));

            await setDoc(refDoc, {
                name: cleanName,
                createdAt: serverTimestamp(),
            });

            return refDoc;
        })
    );
}

export async function createBenefitedCard(names) {
    return Promise.all(
        names.map(async (name) => {
            const cleanName = name.trim();

            if (!cleanName) return null;

            const refDoc = doc(col("creditBenefitCard"));

            await setDoc(refDoc, {
                name: cleanName,
                createdAt: serverTimestamp(),
            })

            return refDoc;
        })
    );
}


export async function deleteCategory(id) {
    await deleteDoc(docRef("creditcardCategories", id));
}

export async function deleteBenefitCard(id) {
    await deleteDoc(docRef("creditBenefitCard", id));
}

export async function fetchCardsCount() {
  const snap = await getCountFromServer(col("creditcard"));
  return snap.data().count;
}
/* ─────────────────────────────────────────────
   ✅ Card Reads
   projects/leadtree/credit-cards/{cardId}
───────────────────────────────────────────── */

export async function fetchCardById(id) {
    const snap = await getDoc(docRef("creditcard", id));
    if (!snap.exists()) return null;

    return { id: snap.id, ...snap.data() };
}



export async function fetchBenefitCardById(id) {
    const snap = await getDoc(docRef("creditcard", id));
    if (!snap.exists()) return null;

    return { id: snap.id, ...snap.data() };
}

export async function fetchAllCards() {
    const snap = await getDocs(col("creditcard"));

    return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
    }));
}

export async function fetchCardsPage({ pageSize, cursor }) {
    const constraints = [orderBy("createdAt", "desc"), limit(pageSize)];

    if (cursor) constraints.push(startAfter(cursor));

    const q = query(col("creditcard"), ...constraints);
    const snap = await getDocs(q);

    const cards = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
    }));

    const lastDoc = snap.docs[snap.docs.length - 1] ?? null;

    return { cards, lastDoc };
}

/* ─────────────────────────────────────────────
   ✅ Card Writes
───────────────────────────────────────────── */

export async function createCardPost(payload) {
    


    const refDoc = doc(col("creditcard"));

    try {
        await setDoc(refDoc, {
            ...payload,
            category: (payload.category || "").trim(),
            
            createdAt: Date.now(),
            updatedAt: Date.now(),
        
        });

        
    } catch (err) {
        console.error("❌ FIRESTORE ERROR:", err);
    }

    return refDoc;
}

export async function updateCard(id, payload) {
    await updateDoc(docRef("creditcard", id), {
        ...payload,
        updatedAt: serverTimestamp(),
    });
}

export async function updateCardImage(id, imageUrl) {
    await updateDoc(docRef("creditcard", id), {
        image: imageUrl,
    });
}

export async function updateCardStatus(id, status) {
    await updateDoc(docRef("creditcard", id), {
        status,
    });
}

export async function deleteCard(id) {
    await deleteDoc(docRef("creditcard", id));
}

export async function bulkDeleteCards(ids) {
    await Promise.all(ids.map((id) => deleteCard(id)));
}

/* ─────────────────────────────────────────────
   ✅ Storage
───────────────────────────────────────────── */

export function uploadCardImage({ file, cardId, onProgress, onTaskReady }) {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `creditcard/${cardId}`);
        const task = uploadBytesResumable(storageRef, file);

        if (onTaskReady) onTaskReady(task);

        task.on(
            "state_changed",
            (snap) => {
                if (onProgress) {
                    onProgress(
                        Math.round(
                            (snap.bytesTransferred / snap.totalBytes) * 100
                        )
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
            }
        );
    });
}