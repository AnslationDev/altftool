"use client";

const LOCAL_ADMIN_STORAGE_KEY = "ALTFT_LOCAL_ADMIN_SESSION_V1";
const LOCAL_ADMIN_UID = "local-dev-admin";
const LOCAL_ADMIN_EMAIL = "admin@altftool.local";

function isLocalHost() {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

export function isLocalAdminLoginEnabled() {
  return process.env.NODE_ENV === "development" && isLocalHost();
}

export function createLocalAdminUser() {
  return {
    uid: LOCAL_ADMIN_UID,
    email: LOCAL_ADMIN_EMAIL,
    displayName: "Local Super Admin",
    isLocalAdmin: true,
    getIdToken: async () => "local-dev-admin-token",
  };
}

export function createLocalAdminData() {
  return {
    uid: LOCAL_ADMIN_UID,
    email: LOCAL_ADMIN_EMAIL,
    roleType: "superadmin",
    isActive: true,
    fullName: "Local Super Admin",
    firstName: "Local",
    lastName: "Admin",
    designation: "Developer Access",
    team: "AltFTool",
    permissions: {},
    projectAccess: {},
  };
}

export function hasLocalAdminSession() {
  if (!isLocalAdminLoginEnabled()) return false;

  try {
    return localStorage.getItem(LOCAL_ADMIN_STORAGE_KEY) === "active";
  } catch {
    return false;
  }
}

export function startLocalAdminSession() {
  if (!isLocalAdminLoginEnabled()) return false;

  localStorage.setItem(LOCAL_ADMIN_STORAGE_KEY, "active");
  return true;
}

export function clearLocalAdminSession() {
  try {
    localStorage.removeItem(LOCAL_ADMIN_STORAGE_KEY);
  } catch {}
}
