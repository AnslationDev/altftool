import {

  collection,

  doc,

  getDocs,

  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,

} from "firebase/firestore";



import { db } from "@/lib/firebase";



const PROJECT_ID = "altftool";

const salesRef = collection(db, "projects", PROJECT_ID, "sales");



/* =========================

   HELPERS

========================= */



// convert ₹1,20,000 → 120000

const parsePrice = (val) => {

  if (!val) return 0;

  if (typeof val === "number") return val;

  return Number(String(val).replace(/[^0-9]/g, "")) || 0;

};



// normalize payload based on modal structure

const normalizeSale = (data) => {

  const base = {

    type: data.type,

    updatedAt: serverTimestamp(),

  };



  switch (data.type) {

    case "flashSale":

    case "trendingSale":

      return {

        ...base,

        title: data.title || "",

        subtitle: data.subtitle || "",

        productTitle: data.productTitle || "",

        image: data.image || "",

        price: parsePrice(data.price),

        oldPrice: parsePrice(data.oldPrice),

        discount: data.discount || "",

        ctaLink: data.ctaLink || "",

      };



    case "dealOfTheDay":

      return {

        ...base,

        title: data.title || "",

        subtitle: data.subtitle || "",

        image: data.image || "",

        link: data.link || "",

      };



    case "hero":

      return {

        ...base,

        headline: data.headline || "",

        subtext: data.subtext || "",

        heroImage: data.heroImage || "",

        ctaLink: data.ctaLink || "",

      };



    default:

      throw new Error("Invalid sale type");

  }

};



/* =========================

   READ

========================= */



export async function fetchSales() {

  const snap = await getDocs(salesRef);

  return snap.docs.map((d) => ({

    id: d.id,

    ...d.data(),

  }));

}



/* =========================

   CREATE

========================= */



export async function createSale(id, data) {

  const ref = doc(salesRef, id);



  const normalized = normalizeSale(data);



  await setDoc(ref, {

    ...normalized,
    id,
    createdAt: serverTimestamp(),
  });
  return id;

}



/* =========================

   UPDATE

========================= */



export async function updateSale(id, updates) {

  const ref = doc(salesRef, id);



  const normalized = normalizeSale(updates);



  return updateDoc(ref, normalized);

}



/* =========================

   DELETE

========================= */



export async function deleteSale(id) {

  const ref = doc(salesRef, id);

  return deleteDoc(ref);

}