import {
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    serverTimestamp
  } from "firebase/firestore";
  
  import { getCollectionRef, getDocRef } from "./config";
  
  export const UpcomingDealService = {
  
    subscribeAll(callback) {
      return onSnapshot(getCollectionRef("upcomingdeal"), (snap) => {
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(data);
      });
    },
  
    async add(data) {
      return await addDoc(getCollectionRef("upcomingdeal"), {
        name: data.name,
        logo: data.logo,
        link: data.link,
        bannerImg:data.bannerImg,
        highestDiscount: data.highestDiscount,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        categoryName: data.categoryName, 
        offers: data.offers || [],
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
  
    async update(id, data) {
      return await updateDoc(getDocRef("upcomingdeal", id), {
        ...data,
        categoryName: data.categoryName,
        updatedAt: serverTimestamp(),
      });
    },
  
    async remove(id) {
      return await deleteDoc(getDocRef("upcomingdeal", id));
    }
  };


  export const BestCouponService = {
  
    subscribeAll(callback) {
      return onSnapshot(getCollectionRef("bestcoupon"), (snap) => {
        const data = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(data);
      });
    },
  
    async add(data) {
      return await addDoc(getCollectionRef("bestcoupon"), {
        name: data.name,
        logo: data.logo,
        link: data.link,
        bannerImg:data.bannerImg,
        highestDiscount: data.highestDiscount,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
        offers: data.offers || [],
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    },
  
    async update(id, data) {
      return await updateDoc(getDocRef("bestcoupon", id), {
        ...data,
        updatedAt: serverTimestamp(),
      });
    },
  
    async remove(id) {
      return await deleteDoc(getDocRef("bestcoupon", id));
    }
  };