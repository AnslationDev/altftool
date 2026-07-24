import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";

const PROJECT_ID = "carrerbook";
const POLICY_PATH = ["projects", PROJECT_ID, "policy", "privacy-policy"];

export const DEFAULT_POLICY_PAGE = {
  active: true,
  heading: "Privacy Policy",
  subtitle:
    "This placeholder Privacy Policy describes how CareerBook may handle information across its career, advertiser, publisher, and visitor experiences.",
  items: [
    {
      id: "policy-introduction",
      question: "Introduction",
      answer:
        "This Privacy Policy explains how CareerBook collects, uses, stores, and protects information from users, advertisers, publishers, visitors, and business partners.",
      active: true,
      sortOrder: 1,
    },
    {
      id: "policy-information-collect",
      question: "Information We Collect",
      answer:
        "We may collect contact details, account information, business information, campaign data, form submissions, usage data, device information, and communication history.",
      active: true,
      sortOrder: 2,
    },
    {
      id: "policy-information-use",
      question: "How We Use Your Information",
      answer:
        "Information may be used to provide services, manage accounts, respond to inquiries, improve the platform, process requests, analyze performance, and maintain security.",
      active: true,
      sortOrder: 3,
    },
    {
      id: "policy-cookies",
      question: "Cookies and Tracking Technologies",
      answer:
        "CareerBook may use cookies and similar technologies to understand website usage, improve user experience, remember preferences, and measure campaign performance.",
      active: true,
      sortOrder: 4,
    },
  ],
};

export function subscribePolicyPage(onNext, onError) {
  return onSnapshot(
    doc(db, ...POLICY_PATH),
    (snap) => onNext(mergePolicyPage(snap.exists() ? snap.data() : {})),
    onError,
  );
}

export async function savePolicyPage(payload) {
  await setDoc(
    doc(db, ...POLICY_PATH),
    {
      ...normalizePolicyPage(payload),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function resetPolicyPage() {
  await setDoc(
    doc(db, ...POLICY_PATH),
    {
      ...DEFAULT_POLICY_PAGE,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

function mergePolicyPage(data) {
  return {
    ...DEFAULT_POLICY_PAGE,
    ...data,
    items: normalizeItems(data.items || DEFAULT_POLICY_PAGE.items),
  };
}

export function normalizePolicyPage(payload) {
  return {
    active: payload.active !== false,
    heading: String(payload.heading || "").trim(),
    subtitle: String(payload.subtitle || "").trim(),
    items: normalizeItems(payload.items || []),
  };
}

function normalizeItems(items = []) {
  return items
    .map((item, index) => ({
      id: item.id || `policy-item-${Date.now()}-${index}`,
      question: String(item.question || "").trim(),
      answer: String(item.answer || "").trim(),
      active: item.active !== false,
      sortOrder: Number(item.sortOrder) || index + 1,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
