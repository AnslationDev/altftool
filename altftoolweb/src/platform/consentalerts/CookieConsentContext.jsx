"use client";

import { createContext, useContext, useState } from "react";

const STORAGE_KEY = "COOKIE_CONSENT_V1";

const CookieConsentContext = createContext(null);

const loadConsent = () => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const CookieConsentProvider = ({ children }) => {
  const [consent, setConsent] = useState(loadConsent);

  const saveConsent = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setConsent(data);
  };

  return (
    <CookieConsentContext.Provider value={{ consent, saveConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("Wrap app with CookieConsentProvider");
  return ctx;
};
