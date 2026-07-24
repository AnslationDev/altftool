import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db } from "@/lib/firebaseFirestore";
import { storage } from "@/lib/firebaseStorage";

const PROJECT_ID = "altftool";
const salesRef = collection(db, "projects", PROJECT_ID, "sales");

export function parseSalePrice(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  return Number(String(value).replace(/[^0-9.]/g, "")) || 0;
}

export function normalizeSalePayload(data = {}) {
  const base = {
    type: data.type,
    status: data.status || "active",
  };

  switch (data.type) {
    case "flashSale":
    case "trendingSale":
      return {
        ...base,
        title: data.title?.trim() || "",
        subtitle: data.subtitle?.trim() || "",
        productTitle: data.productTitle?.trim() || "",
        image: data.image || "",
        price: parseSalePrice(data.price),
        oldPrice: parseSalePrice(data.oldPrice),
        discount: data.discount?.trim() || "",
        ctaLink: data.ctaLink?.trim() || "",
      };

    case "dealOfTheDay":
      return {
        ...base,
        title: data.title?.trim() || "",
        subtitle: data.subtitle?.trim() || "",
        image: data.image || "",
        link: (data.link || data.ctaLink || "").trim(),
      };

    case "hero":
      return {
        ...base,
        headline: (data.headline || data.title || "").trim(),
        subtext: (data.subtext || data.subtitle || "").trim(),
        heroImage: data.heroImage || "",
        ctaLink: data.ctaLink?.trim() || "",
      };

    default:
      throw new Error("Unsupported sale type");
  }
}

export async function fetchSales() {
  const snapshot = await getDocs(salesRef);
  return snapshot.docs.map((saleDoc) => ({
    id: saleDoc.id,
    ...saleDoc.data(),
  }));
}

export async function createSale(data) {
  const saleDoc = doc(salesRef);
  await setDoc(saleDoc, {
    ...normalizeSalePayload(data),
    id: saleDoc.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return saleDoc.id;
}

export async function updateSale(id, data) {
  if (!id) throw new Error("A sale id is required");
  await updateDoc(doc(salesRef, String(id)), {
    ...normalizeSalePayload(data),
    updatedAt: serverTimestamp(),
  });
  return String(id);
}

export async function deleteSale(id) {
  if (!id) throw new Error("A sale id is required");
  await deleteDoc(doc(salesRef, String(id)));
}

export async function uploadSaleImage(file, imageKind = "media") {
  if (!file) return "";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const objectRef = ref(
    storage,
    `projects/${PROJECT_ID}/sales/${imageKind}/${Date.now()}-${safeName}`,
  );
  await uploadBytes(objectRef, file, { contentType: file.type });
  return getDownloadURL(objectRef);
}
