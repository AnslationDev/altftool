"use client";

import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { buySmartDocPath } from "@altftool/core/firebasePaths";
import { db } from "@/lib/firebase";

// 🔹 SINGLE SOURCE PATH
export const ROOT = buySmartDocPath("hero");
const HERO_REF = doc(db, ...ROOT);

export const firebaseBuySmartHeroSource = {

  // 🔹 REALTIME SUBSCRIBE
  subscribe(callback, filter = {}, onError) {
    const unsub = onSnapshot(
      HERO_REF,
      (snap) => {
        if (!snap.exists()) {
          callback([]);
          return;
        }

        let data = snap.data().banner || [];

        // 🔍 search filter
        if (filter.search) {
          const q = filter.search.toLowerCase();
          data = data.filter((h) =>
            h.title?.toLowerCase().includes(q)
          );
        }

        // 🔍 status filter
        if (filter.status && filter.status !== "all") {
          data = data.filter((h) => h.status === filter.status);
        }

        // 🔃 sort latest first
        const sorted = [...data].sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );

        callback(sorted);
      },
      (error) => {
        console.error("Hero read error:", error);
        onError?.(error);
      }
    );

    return () => unsub();
  },

  // 🔹 ADD HERO
  async add(hero) {
    const snap = await getDoc(HERO_REF);
    const existing = snap.exists() ? snap.data().banner || [] : [];

    const newHero = {
      id: crypto.randomUUID(),
      image: hero.image,
      title: hero.title,
      link: hero.link,
      status: hero.status || "paused",
      ctaText: hero.ctaText,
      ctaColor: hero.ctaColor,
      ctaBgColor: hero.ctaBgColor,
      imageType: hero.imageType,
      country: hero.country,
      imageWidth: hero.width || null,
      imageHeight: hero.height || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const updatedList = [...existing, newHero];

    if (!snap.exists()) {
      await setDoc(HERO_REF, { banner: updatedList });
    } else {
      await updateDoc(HERO_REF, { banner: updatedList });
    }
  },

  // 🔹 UPDATE HERO
  async update(id, updatedFields) {
    const snap = await getDoc(HERO_REF);
    if (!snap.exists()) return;

    const existing = snap.data().banner || [];

    const updatedList = existing.map((h) =>
      h.id === id
        ? {
            ...h,
            ...updatedFields,
            updatedAt: serverTimestamp(),
          }
        : h
    );

    await updateDoc(HERO_REF, { banner: updatedList });
  },

  // 🔹 DELETE HERO
  async remove(id) {
    const snap = await getDoc(HERO_REF);
    if (!snap.exists()) return;

    const existing = snap.data().banner || [];
    const filtered = existing.filter((h) => h.id !== id);

    await updateDoc(HERO_REF, { banner: filtered });
  },

  // 🔹 BULK DELETE
  async bulkDelete(ids = []) {
    const snap = await getDoc(HERO_REF);
    if (!snap.exists()) return;

    const existing = snap.data().banner || [];
    const filtered = existing.filter((h) => !ids.includes(h.id));

    await updateDoc(HERO_REF, { banner: filtered });
  },
};
