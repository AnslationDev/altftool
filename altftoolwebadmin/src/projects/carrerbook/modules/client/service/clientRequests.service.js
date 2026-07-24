import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";

const PROJECT_ID = "carrerbook";

export const CLIENT_TYPES = {
  advertiser: {
    key: "advertiser",
    label: "Advertisers",
    singular: "Advertiser",
    path: ["projects", PROJECT_ID, "user", "advertiser", "users"],
  },
  publisher: {
    key: "publisher",
    label: "Publishers",
    singular: "Publisher",
    path: ["projects", PROJECT_ID, "user", "publishers", "users"],
  },
};

export function subscribeClientRequests(type, onNext, onError) {
  const config = CLIENT_TYPES[type];
  if (!config) return () => {};

  return onSnapshot(
    collection(db, ...config.path),
    (snapshot) => {
      const items = snapshot.docs.map((item) => normalizeClientRequest(item.id, type, item.data()));
      onNext(sortRequests(items));
    },
    onError,
  );
}

export function subscribeAllClientRequests(onNext, onError) {
  const state = {
    advertiser: [],
    publisher: [],
  };

  const emit = () => onNext({
    advertiser: state.advertiser,
    publisher: state.publisher,
    all: sortRequests([...state.advertiser, ...state.publisher]),
  });

  const unsubAdvertiser = subscribeClientRequests(
    "advertiser",
    (items) => {
      state.advertiser = items;
      emit();
    },
    onError,
  );

  const unsubPublisher = subscribeClientRequests(
    "publisher",
    (items) => {
      state.publisher = items;
      emit();
    },
    onError,
  );

  return () => {
    unsubAdvertiser();
    unsubPublisher();
  };
}

export async function updateClientRequestStatus(type, id, status) {
  const config = CLIENT_TYPES[type];
  if (!config || !id) return;
  await updateDoc(doc(db, ...config.path, id), {
    status,
    adminStatus: status,
    updatedByAdminAt: new Date(),
  });
}

export async function deleteClientRequest(type, id) {
  const config = CLIENT_TYPES[type];
  if (!config || !id) return;
  await deleteDoc(doc(db, ...config.path, id));
}

function normalizeClientRequest(id, type, data = {}) {
  const role = data.role || type;
  return {
    ...data,
    id,
    uid: data.uid || id,
    type,
    role,
    status: data.adminStatus || data.status || "new",
    fullName: data.fullName || data.name || "",
    companyName: data.companyName || "",
    email: data.email || "",
    phoneNumber: data.phoneNumber || data.phone || "",
    country: data.country || "",
    message: data.message || data.description || "",
    createdAt: data.createdAt || data.created_at || null,
    updatedAt: data.updatedAt || data.updated_at || null,
  };
}

function sortRequests(items) {
  return [...items].sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt));
}

function getTime(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.seconds === "number") return value.seconds * 1000;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}
